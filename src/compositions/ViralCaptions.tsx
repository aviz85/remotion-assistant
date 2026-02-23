import {
	AbsoluteFill,
	OffthreadVideo,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Sequence,
	delayRender,
	continueRender,
	staticFile,
	getInputProps,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { useCallback, useEffect, useState } from 'react';
import type {
	CaptionScript,
	CaptionPage,
	CaptionToken,
	CaptionMeta,
} from '../utils/captionScriptParser';
import { validateCaptionScript } from '../utils/captionScriptParser';

// Load Inter font with weight 800 (ExtraBold)
const { fontFamily } = loadFont('normal', {
	weights: ['400', '700', '800', '900'],
	subsets: ['latin', 'latin-ext'],
});

// --- Props ---

export interface ViralCaptionsProps {
	videoFileName: string; // relative to public/viral-captions/{jobId}/
	scriptFileName: string; // relative to public/viral-captions/{jobId}/
	musicFileName?: string; // optional background music mp3
	musicVolume?: number; // 0-1, default 0.15
	jobId: string;
}

// --- Caption Token Component ---

interface CaptionTokenComponentProps {
	token: CaptionToken;
	meta: CaptionMeta;
	pageStartMs: number;
	fps: number;
	frame: number;
}

const CaptionTokenComponent: React.FC<CaptionTokenComponentProps> = ({
	token,
	meta,
	fps,
	frame,
}) => {
	const currentMs = (frame / fps) * 1000;
	const isActive = currentMs >= token.fromMs && currentMs < token.toMs;

	// TikTok style: instant color snap, slight scale on active
	const scale = isActive
		? spring({
				frame: Math.max(0, frame - Math.floor((token.fromMs / 1000) * fps)),
				fps,
				config: { damping: 12, stiffness: 200, mass: 0.3 },
			})
		: 1;

	const color = isActive
		? (token.highlight ? meta.highlightColor : meta.highlightColor)
		: meta.primaryColor;

	const effectiveScale = isActive ? Math.min(scale, 1.1) : 1;

	return (
		<span
			style={{
				display: 'inline-block',
				color,
				fontSize: meta.fontSize,
				fontWeight: meta.fontWeight,
				fontFamily,
				transform: `scale(${effectiveScale})`,
				WebkitTextStroke: `${meta.strokeWidth}px ${meta.strokeColor}`,
				paintOrder: 'stroke fill',
				textShadow: `0 2px 8px rgba(0,0,0,0.7)`,
				marginLeft: meta.rtl ? 8 : 0,
				marginRight: meta.rtl ? 0 : 8,
				whiteSpace: 'pre',
			}}
		>
			{token.text}
		</span>
	);
};

// --- Caption Page Component ---

interface CaptionPageComponentProps {
	page: CaptionPage;
	meta: CaptionMeta;
	fps: number;
	frame: number;
	pageLocalFrame: number;
}

const CaptionPageComponent: React.FC<CaptionPageComponentProps> = ({
	page,
	meta,
	fps,
	frame,
	pageLocalFrame,
}) => {
	// Entrance animation
	let entranceOpacity = 1;
	let entranceScale = 1;

	if (page.entrance === 'cut') {
		// Instant appearance (1 frame)
		entranceOpacity = pageLocalFrame >= 0 ? 1 : 0;
	} else if (page.entrance === 'pop') {
		// Spring pop
		entranceScale = spring({
			frame: pageLocalFrame,
			fps,
			config: { damping: 8, stiffness: 200, mass: 0.3 },
		});
		entranceOpacity = interpolate(pageLocalFrame, [0, 1], [0, 1], {
			extrapolateRight: 'clamp',
		});
	} else if (page.entrance === 'fade') {
		// Fade over 5 frames
		entranceOpacity = interpolate(pageLocalFrame, [0, 5], [0, 1], {
			extrapolateRight: 'clamp',
		});
	}

	// Exit animation (last 3 frames of the sequence)
	const pageDurationFrames = Math.ceil(((page.endMs - page.startMs) / 1000) * fps);
	const exitStart = pageDurationFrames - 3;
	let exitOpacity = 1;

	if (page.exit === 'fade') {
		exitOpacity = interpolate(pageLocalFrame, [exitStart, pageDurationFrames], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}

	const opacity = entranceOpacity * exitOpacity;

	// Emoji
	const emojiElement = page.emoji ? (
		<span
			style={{
				fontSize: meta.fontSize * 0.8,
				display: 'inline-block',
				transform: `scale(${
					page.entrance === 'pop'
						? spring({
								frame: pageLocalFrame,
								fps,
								config: { damping: 6, stiffness: 250, mass: 0.2 },
							})
						: 1
				})`,
				marginLeft: 4,
				marginRight: 4,
			}}
		>
			{page.emoji}
		</span>
	) : null;

	// Background box behind text
	const showBackground = meta.backgroundColor && meta.backgroundColor !== 'transparent';

	// Compute text block width for background
	const textContent = (
		<span
			style={{
				display: 'inline-flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'baseline',
				direction: meta.rtl ? 'rtl' : 'ltr',
			}}
		>
			{emojiElement && !meta.rtl && emojiElement}
			{page.tokens.map((token, idx) => (
				<CaptionTokenComponent
					key={`${token.text}-${idx}`}
					token={token}
					meta={meta}
					pageStartMs={page.startMs}
					fps={fps}
					frame={frame}
				/>
			))}
			{emojiElement && meta.rtl && emojiElement}
		</span>
	);

	return (
		<div
			style={{
				opacity,
				transform: `scale(${entranceScale})`,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
			}}
		>
			<div
				style={{
					display: 'inline-block',
					padding: showBackground ? meta.backgroundPadding : 0,
					borderRadius: showBackground ? meta.backgroundRadius : 0,
					backgroundColor: showBackground ? meta.backgroundColor : 'transparent',
					maxWidth: '85%',
					textAlign: 'center',
				}}
			>
				{textContent}
			</div>
		</div>
	);
};

// --- Main Composition ---

export const ViralCaptions: React.FC<ViralCaptionsProps> = ({
	videoFileName,
	scriptFileName,
	musicFileName,
	musicVolume = 0.15,
	jobId,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	const [script, setScript] = useState<CaptionScript | null>(null);
	const [handle] = useState(() => delayRender('Loading caption script'));

	const videoSrc = staticFile(`viral-captions/${jobId}/${videoFileName}`);
	const scriptSrc = staticFile(`viral-captions/${jobId}/${scriptFileName}`);
	const musicSrc = musicFileName
		? staticFile(`viral-captions/${jobId}/${musicFileName}`)
		: null;

	const loadScript = useCallback(async () => {
		try {
			const res = await fetch(scriptSrc);
			const data = await res.json();
			const validated = validateCaptionScript(data);
			setScript(validated);
			continueRender(handle);
		} catch (err) {
			console.error('Failed to load caption script:', err);
			continueRender(handle);
		}
	}, [scriptSrc, handle]);

	useEffect(() => {
		loadScript();
	}, [loadScript]);

	if (!script) {
		return <AbsoluteFill style={{ backgroundColor: '#000' }} />;
	}

	const { meta, pages } = script;

	// Position styling
	const getPositionStyle = (): React.CSSProperties => {
		switch (meta.position) {
			case 'top':
				return { top: 80, left: 40, right: 40 };
			case 'center':
				return {
					top: '50%',
					left: 40,
					right: 40,
					transform: 'translateY(-50%)',
				};
			case 'bottom':
			default:
				return { bottom: 120, left: 40, right: 40 };
		}
	};

	return (
		<AbsoluteFill>
			{/* Video background */}
			<OffthreadVideo
				src={videoSrc}
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			/>

			{/* Subtle gradient for text readability */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '40%',
					background:
						'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Background music */}
			{musicSrc && (
				<Audio src={musicSrc} volume={musicVolume} startFrom={0} />
			)}

			{/* Caption pages as Sequences */}
			{pages.map((page) => {
				const startFrame = Math.floor((page.startMs / 1000) * fps);
				const durationFrames = Math.ceil(
					((page.endMs - page.startMs) / 1000) * fps
				);

				if (durationFrames <= 0) return null;

				return (
					<Sequence
						key={page.id}
						from={startFrame}
						durationInFrames={durationFrames}
						layout="none"
					>
						<div
							style={{
								position: 'absolute',
								...getPositionStyle(),
								display: 'flex',
								justifyContent: 'center',
								zIndex: 10,
							}}
						>
							<CaptionPageComponent
								page={page}
								meta={meta}
								fps={fps}
								frame={frame}
								pageLocalFrame={frame - startFrame}
							/>
						</div>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

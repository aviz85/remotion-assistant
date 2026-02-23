import {
	AbsoluteFill,
	OffthreadVideo,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	spring,
	delayRender,
	continueRender,
	staticFile,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Heebo';
import { useCallback, useEffect, useState } from 'react';
import type {
	CaptionScript,
	CaptionToken,
	CaptionPage,
} from '../utils/captionScriptParser';
import { validateCaptionScript } from '../utils/captionScriptParser';

// Heebo Black — native Hebrew support, bold and impactful
const { fontFamily } = loadFont('normal', {
	weights: ['900'],
	subsets: ['hebrew'],
});

// --- Props ---

export interface ViralCaptionsProps {
	videoFileName: string;
	scriptFileName: string;
	musicFileName?: string;
	musicVolume?: number;
	jobId: string;
}

// Deterministic pseudo-random from index
function seeded(idx: number, salt: number = 0): number {
	const x = Math.sin((idx + 1) * 9301 + salt * 4973) * 49297;
	return x - Math.floor(x);
}

// --- Main Composition ---

export const ViralCaptions: React.FC<ViralCaptionsProps> = ({
	videoFileName,
	scriptFileName,
	musicFileName,
	musicVolume = 0.15,
	jobId,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

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
	const currentMs = (frame / fps) * 1000;

	// Flatten all tokens with their page info
	interface FlatToken extends CaptionToken {
		pageEmoji: string | null;
		isLastInPage: boolean;
		globalIdx: number;
	}

	const allTokens: FlatToken[] = [];
	pages.forEach((page: CaptionPage) => {
		page.tokens.forEach((token: CaptionToken, tokenIdx: number) => {
			allTokens.push({
				...token,
				pageEmoji: page.emoji,
				isLastInPage: tokenIdx === page.tokens.length - 1,
				globalIdx: allTokens.length,
			});
		});
	});

	// Find current active token
	let activeToken: FlatToken | null = null;
	for (const t of allTokens) {
		if (currentMs >= t.fromMs && currentMs < t.toMs) {
			activeToken = t;
			break;
		}
	}

	return (
		<AbsoluteFill>
			{/* Video background */}
			<OffthreadVideo
				src={videoSrc}
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			/>

			{/* Background music */}
			{musicSrc && (
				<Audio src={musicSrc} volume={musicVolume} startFrom={0} />
			)}

			{/* Single word display — W1 style */}
			{activeToken && (() => {
				const idx = activeToken.globalIdx;
				const wordFrame = Math.floor((activeToken.fromMs / 1000) * fps);
				const pop = spring({
					frame: Math.max(0, frame - wordFrame),
					fps,
					config: { damping: 10, stiffness: 350, mass: 0.5 },
				});

				// Random position offset
				const offsetX = (seeded(idx, 1) - 0.5) * 200;
				const offsetY = (seeded(idx, 2) - 0.5) * 300;
				const rot = (seeded(idx, 3) - 0.5) * 12;

				const fontSize = meta.fontSize || 160;
				const color = activeToken.highlight ? meta.highlightColor : meta.primaryColor;

				return (
					<div style={{
						position: 'absolute', inset: 0,
						display: 'flex', justifyContent: 'center', alignItems: 'center',
						zIndex: 10,
					}}>
						<div style={{
							transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rot * Math.min(pop, 1)}deg) scale(${Math.min(pop, 1)})`,
							textAlign: 'center',
							direction: meta.rtl ? 'rtl' : 'ltr',
						}}>
							{activeToken.pageEmoji && activeToken.isLastInPage && (
								<div style={{
									fontSize: fontSize * 1.0,
									transform: `scale(${Math.min(pop * 1.2, 1)})`,
									marginBottom: 8,
								}}>
									{activeToken.pageEmoji}
								</div>
							)}
							<span style={{
								fontFamily,
								fontSize,
								fontWeight: 900,
								color,
								WebkitTextStroke: `${meta.strokeWidth}px ${meta.strokeColor}`,
								paintOrder: 'stroke fill',
								textShadow: '0 6px 24px rgba(0,0,0,0.9)',
							}}>
								{activeToken.text}
							</span>
						</div>
					</div>
				);
			})()}
		</AbsoluteFill>
	);
};

import {
	AbsoluteFill,
	Video,
	Audio,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Easing,
} from 'remotion';

// Subtitle line with word-level timings
interface SubtitleLine {
	lineStart: number;
	lineEnd: number;
	words: {
		word: string;
		start: number;
		emphasis: 'hero' | 'strong' | 'normal';
	}[];
}

// SEMANTICALLY GROUPED - sentences/phrases that make sense together
// Original audio: "anything a human being can do, your Claude bot can do. Anything. Anything!
// If you want to go right now and scroll on X, find tweets, build stuff off that,
// write documents off that, write an article off that, some twenty-step crazy workflow,
// if a human being can do it, your Claude bot can do it, and you want to experiment and do those things."

const subtitleLines: SubtitleLine[] = [
	// "anything a human being can do," - complete clause
	{
		lineStart: 0.5,
		lineEnd: 2.1,
		words: [
			{ word: 'anything', start: 0.5, emphasis: 'strong' },
			{ word: 'a', start: 0.68, emphasis: 'normal' },
			{ word: 'human', start: 0.82, emphasis: 'strong' },
			{ word: 'being', start: 1.05, emphasis: 'normal' },
			{ word: 'can', start: 1.35, emphasis: 'normal' },
			{ word: 'do,', start: 1.65, emphasis: 'normal' },
		],
	},
	// "your Claude bot can do." - parallel clause
	{
		lineStart: 2.1,
		lineEnd: 3.5,
		words: [
			{ word: 'your', start: 2.1, emphasis: 'normal' },
			{ word: 'Claude', start: 2.35, emphasis: 'hero' },
			{ word: 'bot', start: 2.7, emphasis: 'strong' },
			{ word: 'can', start: 2.95, emphasis: 'normal' },
			{ word: 'do.', start: 3.15, emphasis: 'normal' },
		],
	},
	// "Anything. Anything!" - emphasis, standalone
	{
		lineStart: 3.6,
		lineEnd: 6.1,
		words: [
			{ word: 'Anything.', start: 3.7, emphasis: 'hero' },
			{ word: 'Anything!', start: 4.9, emphasis: 'hero' },
		],
	},
	// "If you want to go right now" - intro to examples
	{
		lineStart: 6.2,
		lineEnd: 7.4,
		words: [
			{ word: 'If', start: 6.2, emphasis: 'normal' },
			{ word: 'you', start: 6.32, emphasis: 'normal' },
			{ word: 'want', start: 6.44, emphasis: 'normal' },
			{ word: 'to', start: 6.58, emphasis: 'normal' },
			{ word: 'go', start: 6.7, emphasis: 'normal' },
			{ word: 'right', start: 6.88, emphasis: 'strong' },
			{ word: 'now', start: 7.1, emphasis: 'strong' },
		],
	},
	// "and scroll on X, find tweets," - first action chain
	{
		lineStart: 7.4,
		lineEnd: 9.1,
		words: [
			{ word: 'and', start: 7.4, emphasis: 'normal' },
			{ word: 'scroll', start: 7.52, emphasis: 'strong' },
			{ word: 'on', start: 7.72, emphasis: 'normal' },
			{ word: 'X,', start: 7.85, emphasis: 'hero' },
			{ word: 'find', start: 8.15, emphasis: 'normal' },
			{ word: 'tweets,', start: 8.45, emphasis: 'strong' },
		],
	},
	// "build stuff off that," - action 2
	{
		lineStart: 9.1,
		lineEnd: 10.25,
		words: [
			{ word: 'build', start: 9.1, emphasis: 'strong' },
			{ word: 'stuff', start: 9.4, emphasis: 'normal' },
			{ word: 'off', start: 9.65, emphasis: 'normal' },
			{ word: 'that,', start: 9.85, emphasis: 'normal' },
		],
	},
	// "write documents off that," - action 3
	{
		lineStart: 10.25,
		lineEnd: 11.2,
		words: [
			{ word: 'write', start: 10.25, emphasis: 'normal' },
			{ word: 'documents', start: 10.45, emphasis: 'strong' },
			{ word: 'off', start: 10.82, emphasis: 'normal' },
			{ word: 'that,', start: 10.95, emphasis: 'normal' },
		],
	},
	// "write an article off that," - action 4
	{
		lineStart: 11.2,
		lineEnd: 12.5,
		words: [
			{ word: 'write', start: 11.2, emphasis: 'normal' },
			{ word: 'an', start: 11.38, emphasis: 'normal' },
			{ word: 'article', start: 11.52, emphasis: 'strong' },
			{ word: 'off', start: 11.92, emphasis: 'normal' },
			{ word: 'that,', start: 12.08, emphasis: 'normal' },
		],
	},
	// "some twenty-step crazy workflow," - complexity emphasis
	{
		lineStart: 12.5,
		lineEnd: 14.6,
		words: [
			{ word: 'some', start: 12.5, emphasis: 'normal' },
			{ word: 'twenty-step', start: 12.75, emphasis: 'strong' },
			{ word: 'crazy', start: 13.4, emphasis: 'hero' },
			{ word: 'workflow,', start: 13.9, emphasis: 'hero' },
		],
	},
	// "if a human being can do it," - callback part 1
	{
		lineStart: 14.6,
		lineEnd: 15.85,
		words: [
			{ word: 'if', start: 14.6, emphasis: 'normal' },
			{ word: 'a', start: 14.72, emphasis: 'normal' },
			{ word: 'human', start: 14.82, emphasis: 'strong' },
			{ word: 'being', start: 15.05, emphasis: 'normal' },
			{ word: 'can', start: 15.25, emphasis: 'normal' },
			{ word: 'do', start: 15.42, emphasis: 'normal' },
			{ word: 'it,', start: 15.58, emphasis: 'normal' },
		],
	},
	// "your Claude bot can do it," - callback part 2
	{
		lineStart: 15.85,
		lineEnd: 17.1,
		words: [
			{ word: 'your', start: 15.85, emphasis: 'normal' },
			{ word: 'Claude', start: 16.0, emphasis: 'hero' },
			{ word: 'bot', start: 16.28, emphasis: 'strong' },
			{ word: 'can', start: 16.48, emphasis: 'normal' },
			{ word: 'do', start: 16.62, emphasis: 'normal' },
			{ word: 'it,', start: 16.78, emphasis: 'normal' },
		],
	},
	// "and you want to experiment and do those things." - call to action / conclusion
	{
		lineStart: 17.1,
		lineEnd: 18.7,
		words: [
			{ word: 'and', start: 17.1, emphasis: 'normal' },
			{ word: 'you', start: 17.22, emphasis: 'normal' },
			{ word: 'want', start: 17.32, emphasis: 'normal' },
			{ word: 'to', start: 17.44, emphasis: 'normal' },
			{ word: 'experiment', start: 17.55, emphasis: 'hero' },
			{ word: 'and', start: 17.98, emphasis: 'normal' },
			{ word: 'do', start: 18.1, emphasis: 'normal' },
			{ word: 'those', start: 18.22, emphasis: 'normal' },
			{ word: 'things.', start: 18.38, emphasis: 'strong' },
		],
	},
];

interface WordProps {
	word: string;
	start: number;
	emphasis: 'hero' | 'strong' | 'normal';
	lineEnd: number;
	frame: number;
	fps: number;
	index: number;
}

const AnimatedWord: React.FC<WordProps> = ({ word, start, emphasis, lineEnd, frame, fps, index }) => {
	const wordStartFrame = start * fps;
	const lineEndFrame = lineEnd * fps;
	const localFrame = frame - wordStartFrame;

	// Word hasn't appeared yet
	if (frame < wordStartFrame) {
		return <span style={{ opacity: 0, display: 'inline-block' }}>{word}&nbsp;</span>;
	}

	// Spring animation for entrance
	const getSpringConfig = () => {
		switch (emphasis) {
			case 'hero':
				return { damping: 8, stiffness: 200, mass: 0.3 };
			case 'strong':
				return { damping: 10, stiffness: 160, mass: 0.4 };
			default:
				return { damping: 12, stiffness: 140, mass: 0.5 };
		}
	};

	const scale = spring({
		frame: localFrame,
		fps,
		config: getSpringConfig(),
	});

	// Entrance animations
	let translateY = 0;
	let rotation = 0;

	if (emphasis === 'hero') {
		translateY = interpolate(localFrame, [0, 6], [25, 0], {
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.back(2)),
		});
	} else if (emphasis === 'strong') {
		translateY = interpolate(localFrame, [0, 5], [15, 0], {
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.cubic),
		});
		rotation = interpolate(localFrame, [0, 5], [index % 2 === 0 ? -8 : 8, 0], {
			extrapolateRight: 'clamp',
		});
	} else {
		translateY = interpolate(localFrame, [0, 4], [12, 0], {
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.quad),
		});
	}

	const opacity = interpolate(localFrame, [0, 3], [0, 1], { extrapolateRight: 'clamp' });

	// Line exit animation (all words fade together)
	const exitDuration = 5;
	const exitStart = lineEndFrame - exitDuration;
	const exitProgress = frame > exitStart
		? interpolate(frame, [exitStart, lineEndFrame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
		: 0;
	const exitOpacity = 1 - exitProgress;
	const exitTranslateY = exitProgress * 20;

	// Styling
	const getFontSize = () => {
		switch (emphasis) {
			case 'hero': return 80;
			case 'strong': return 64;
			default: return 56;
		}
	};

	const getColor = () => {
		switch (emphasis) {
			case 'hero': return '#FF6B35';
			case 'strong': return '#FFFFFF';
			default: return '#E0E0E0';
		}
	};

	const getTextShadow = () => {
		switch (emphasis) {
			case 'hero':
				return '0 0 40px rgba(255, 107, 53, 0.8), 0 0 80px rgba(255, 107, 53, 0.4), 0 4px 15px rgba(0,0,0,0.9)';
			case 'strong':
				return '0 0 25px rgba(255, 255, 255, 0.4), 0 3px 12px rgba(0,0,0,0.8)';
			default:
				return '0 2px 15px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.5)';
		}
	};

	// Subtle pulse for hero words after entrance
	const pulse = emphasis === 'hero' && localFrame > 8
		? 1 + Math.sin(localFrame * 0.3) * 0.025
		: 1;

	return (
		<span
			style={{
				display: 'inline-block',
				opacity: opacity * exitOpacity,
				transform: `translateY(${translateY + exitTranslateY}px) scale(${scale * pulse}) rotate(${rotation}deg)`,
				fontSize: getFontSize(),
				fontWeight: emphasis === 'hero' ? 900 : emphasis === 'strong' ? 700 : 500,
				color: getColor(),
				textShadow: getTextShadow(),
				letterSpacing: emphasis === 'hero' ? '0.03em' : '0.01em',
				marginRight: emphasis === 'hero' ? 12 : 8,
				textTransform: emphasis === 'hero' ? 'uppercase' : 'none',
			}}
		>
			{word}
		</span>
	);
};

interface SubtitleLineProps {
	line: SubtitleLine;
	frame: number;
	fps: number;
}

const SubtitleLineComponent: React.FC<SubtitleLineProps> = ({ line, frame, fps }) => {
	const lineStartFrame = line.lineStart * fps;
	const lineEndFrame = line.lineEnd * fps;

	// Line not visible yet or already gone
	if (frame < lineStartFrame - 2 || frame > lineEndFrame + 3) return null;

	return (
		<div
			style={{
				position: 'absolute',
				bottom: 100,
				left: 60,
				right: 60,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'baseline',
				flexWrap: 'wrap',
				gap: '4px 0',
			}}
		>
			{line.words.map((wordData, index) => (
				<AnimatedWord
					key={`${wordData.word}-${index}`}
					word={wordData.word}
					start={wordData.start}
					emphasis={wordData.emphasis}
					lineEnd={line.lineEnd}
					frame={frame}
					fps={fps}
					index={index}
				/>
			))}
		</div>
	);
};

export const AGISubtitles: React.FC<{
	showMusic?: boolean;
	musicVolume?: number;
}> = ({ showMusic = true, musicVolume = 0.15 }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	return (
		<AbsoluteFill>
			{/* Original video */}
			<Video
				src={staticFile('agi_cut.mp4')}
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			/>

			{/* Subtle dark gradient at bottom for text readability */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '35%',
					background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Subtitle lines */}
			{subtitleLines.map((line, index) => (
				<SubtitleLineComponent
					key={index}
					line={line}
					frame={frame}
					fps={fps}
				/>
			))}

			{/* Background music */}
			{showMusic && (
				<Audio
					src={staticFile('agi_music.mp3')}
					volume={musicVolume}
					startFrom={0}
				/>
			)}
		</AbsoluteFill>
	);
};

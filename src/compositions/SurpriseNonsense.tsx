/**
 * Surprise Nonsense - Philosophical Musings of a Rubber Duck
 *
 * An absurdist Hebrew kinetic video featuring a rubber duck's
 * existential monologue about floating, dreams, and soap.
 *
 * With dramatic intercut images replacing text at key moments.
 */

import React from 'react';
import {
	AbsoluteFill,
	Img,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
	Sequence,
	Audio,
} from 'remotion';
import { MultiWordComposition } from '../templates/MultiWordComposition';
import { loadFont } from '@remotion/google-fonts/Heebo';

const { fontFamily } = loadFont('normal', {
	weights: ['400', '600', '700', '900'],
	subsets: ['hebrew', 'latin'],
});

// ============================================================
// WORD TIMINGS - Rubber Duck Philosophical Monologue
// ============================================================

const WORD_TIMINGS = [
	{"word": "אני", "start": 0.159, "end": 0.679, "tier": "normal" as const},
	{"word": "ברווז", "start": 1.36, "end": 2.079, "tier": "hero" as const},
	{"word": "גומי.", "start": 2.2, "end": 2.919, "tier": "hero" as const},
	{"word": "כל", "start": 3.72, "end": 4, "tier": "normal" as const},
	{"word": "יום", "start": 4.038, "end": 4.399, "tier": "normal" as const},
	{"word": "אני", "start": 4.559, "end": 4.799, "tier": "normal" as const},
	{"word": "צף,", "start": 4.88, "end": 5.799, "tier": "hero" as const},
	{"word": "צף", "start": 5.92, "end": 6.399, "tier": "strong" as const},
	{"word": "וצף", "start": 6.679, "end": 7.399, "tier": "strong" as const},
	{"word": "וצף.", "start": 7.699, "end": 8.42, "tier": "hero" as const},
	{"word": "אבל", "start": 9.319, "end": 9.5, "tier": "normal" as const},
	{"word": "האם", "start": 9.519, "end": 9.679, "tier": "normal" as const},
	{"word": "אני", "start": 9.699, "end": 9.859, "tier": "normal" as const},
	{"word": "באמת", "start": 9.96, "end": 10.6, "tier": "strong" as const},
	{"word": "צף", "start": 10.68, "end": 11.1, "tier": "hero" as const},
	{"word": "או", "start": 11.679, "end": 11.779, "tier": "normal" as const},
	{"word": "שהמים", "start": 11.859, "end": 12.5, "tier": "strong" as const},
	{"word": "צפים", "start": 12.579, "end": 12.92, "tier": "hero" as const},
	{"word": "סביבי?", "start": 13, "end": 13.72, "tier": "hero" as const},
	{"word": "בלילה,", "start": 15, "end": 15.859, "tier": "strong" as const},
	{"word": "כשהאמבטיה", "start": 15.899, "end": 16.6, "tier": "normal" as const},
	{"word": "ריקה,", "start": 16.62, "end": 17.099, "tier": "hero" as const},
	{"word": "אני", "start": 18.139, "end": 18.3, "tier": "normal" as const},
	{"word": "בוכה", "start": 18.34, "end": 18.599, "tier": "hero" as const},
	{"word": "בפנים.", "start": 18.639, "end": 19.119, "tier": "strong" as const},
	{"word": "אבל", "start": 20.04, "end": 20.22, "tier": "normal" as const},
	{"word": "יש", "start": 20.279, "end": 20.459, "tier": "normal" as const},
	{"word": "לי", "start": 20.5, "end": 20.619, "tier": "normal" as const},
	{"word": "חלום,", "start": 20.76, "end": 21.599, "tier": "hero" as const},
	{"word": "חלום", "start": 21.719, "end": 22.259, "tier": "hero" as const},
	{"word": "גדול!", "start": 22.36, "end": 23.02, "tier": "hero" as const},
	{"word": "יום", "start": 23.7, "end": 23.88, "tier": "normal" as const},
	{"word": "אחד", "start": 23.92, "end": 24.3, "tier": "normal" as const},
	{"word": "אני", "start": 24.659, "end": 24.88, "tier": "normal" as const},
	{"word": "אהיה", "start": 24.899, "end": 25.279, "tier": "strong" as const},
	{"word": "ברווז", "start": 25.5, "end": 26.219, "tier": "hero" as const},
	{"word": "אמיתי,", "start": 26.299, "end": 27.379, "tier": "hero" as const},
	{"word": "אעוף", "start": 27.439, "end": 27.859, "tier": "hero" as const},
	{"word": "מעל", "start": 27.959, "end": 28.319, "tier": "strong" as const},
	{"word": "האמבטיה,", "start": 28.319, "end": 29.079, "tier": "hero" as const},
	{"word": "מעל", "start": 29.279, "end": 29.599, "tier": "strong" as const},
	{"word": "הכיור,", "start": 29.639, "end": 30.379, "tier": "hero" as const},
	{"word": "מעל", "start": 30.42, "end": 30.68, "tier": "strong" as const},
	{"word": "כל", "start": 30.899, "end": 31.159, "tier": "normal" as const},
	{"word": "הדברים", "start": 31.199, "end": 31.6, "tier": "normal" as const},
	{"word": "הרטובים,", "start": 31.639, "end": 33.06, "tier": "hero" as const},
	{"word": "כי", "start": 33.139, "end": 33.24, "tier": "normal" as const},
	{"word": "בסוף", "start": 33.279, "end": 33.86, "tier": "strong" as const},
	{"word": "כולנו", "start": 34.54, "end": 34.88, "tier": "strong" as const},
	{"word": "רק", "start": 34.92, "end": 35.1, "tier": "normal" as const},
	{"word": "צפים.", "start": 35.159, "end": 35.84, "tier": "hero" as const},
	{"word": "צפים", "start": 36.459, "end": 36.939, "tier": "strong" as const},
	{"word": "בים", "start": 37.259, "end": 37.739, "tier": "strong" as const},
	{"word": "של", "start": 37.799, "end": 37.919, "tier": "normal" as const},
	{"word": "סבון.", "start": 38.04, "end": 38.639, "tier": "hero" as const},
	{"word": "קוואק", "start": 40.059, "end": 40.299, "tier": "hero" as const},
	{"word": "קוואק!", "start": 40.319, "end": 40.4, "tier": "hero" as const},
];

// ============================================================
// IMAGE INTERCUTS - Dramatic visuals replacing text
// ============================================================

interface ImageScene {
	name: string;
	image: string;
	startTime: number;
	endTime: number;
	zoomStart: number;
	zoomEnd: number;
}

const IMAGE_SCENES: ImageScene[] = [
	{
		// Contemplative duck - "אני ברווז גומי"
		name: 'Contemplative',
		image: 'surprise-nonsense/duck-contemplative.jpg',
		startTime: 0.0,
		endTime: 3.5,
		zoomStart: 1.0,
		zoomEnd: 1.15,
	},
	{
		// Cosmic bathtub - "האם אני באמת צף או שהמים צפים סביבי?"
		name: 'Cosmic',
		image: 'surprise-nonsense/cosmic-bathtub.jpg',
		startTime: 9.0,
		endTime: 14.0,
		zoomStart: 1.0,
		zoomEnd: 1.2,
	},
	{
		// Noir sad duck - "בלילה... אני בוכה בפנים"
		name: 'Noir',
		image: 'surprise-nonsense/noir-duck.jpg',
		startTime: 14.8,
		endTime: 19.5,
		zoomStart: 1.0,
		zoomEnd: 1.12,
	},
	{
		// Heroic flying duck - "אעוף מעל האמבטיה!"
		name: 'Heroic',
		image: 'surprise-nonsense/heroic-duck.jpg',
		startTime: 25.0,
		endTime: 33.5,
		zoomStart: 1.0,
		zoomEnd: 1.25,
	},
];

// ============================================================
// IMAGE SCENE COMPONENT
// ============================================================

const FADEOUT_FRAMES = 8;

const ImageSceneComponent: React.FC<{
	scene: ImageScene;
}> = ({ scene }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const textBlockDuration = Math.round((scene.endTime - scene.startTime) * fps);
	const totalDuration = textBlockDuration + FADEOUT_FRAMES;
	const progress = Math.min(frame / textBlockDuration, 1);

	// Fade in
	const fadeInDuration = 8;
	const fadeIn = interpolate(frame, [0, fadeInDuration], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	// Fade out
	const fadeOut = interpolate(
		frame,
		[textBlockDuration, totalDuration],
		[1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);
	const opacity = Math.min(fadeIn, fadeOut);

	// Ken Burns zoom
	const scale = interpolate(
		progress,
		[0, 1],
		[scene.zoomStart, scene.zoomEnd],
		{ easing: Easing.out(Easing.quad) }
	);

	return (
		<AbsoluteFill style={{ opacity }}>
			<Img
				src={staticFile(scene.image)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${scale})`,
				}}
			/>
			{/* Cinematic vignette */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

// ============================================================
// MAIN COMPOSITION
// ============================================================

export const SurpriseNonsense: React.FC = () => {
	const { fps } = useVideoConfig();

	return (
		<AbsoluteFill style={{ direction: 'rtl', fontFamily }}>
			{/* Layer 1: Word Cloud kinetic typography */}
			<Sequence name="Word Cloud" from={0}>
				<MultiWordComposition
					wordTimings={WORD_TIMINGS}
					audioFile="surprise-nonsense/speech.mp3"
					gapThreshold={0.5}
					maxWordsPerGroup={6}
					heroFontSize={160}
					strongFontSize={100}
					normalFontSize={70}
					marginX={50}
					marginY={100}
					rtl={true}
					glowIntensity={1.5}
					particleDensity={1.3}
					backgroundPulse={true}
					wordEntranceStyle="pop"
					colorScheme={-1}  // Cycle through colors
					screenShake={0}
					dustEnabled={true}
					lightBeamsEnabled={true}
					textStroke={0}
					animationSpeed={1}
				/>
			</Sequence>

			{/* Layer 2+: Image Intercuts */}
			{IMAGE_SCENES.map((scene, index) => (
				<Sequence
					key={index}
					name={`Image: ${scene.name}`}
					from={Math.round(scene.startTime * fps)}
					durationInFrames={Math.round((scene.endTime - scene.startTime) * fps) + FADEOUT_FRAMES}
				>
					<ImageSceneComponent scene={scene} />
				</Sequence>
			))}

			{/* Background music layer - lower volume */}
			<Audio
				src={staticFile("surprise-nonsense/music.mp3")}
				volume={0.18}
			/>
		</AbsoluteFill>
	);
};

/**
 * Yehuda Video with Intercuts - יהודה אתה מדהים
 *
 * STORYBOARD-BASED COMPOSITION
 * Images REPLACE text during specific scenes (not overlay).
 * Based on approved storyboard with 8 WORDS scenes and 5 IMAGE scenes.
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
// STORYBOARD: IMAGE SCENES
// Images completely replace text during these windows
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
		// Scene 2: Superpowers
		name: 'Superpowers',
		image: 'yehuda-video/intercut_superpowers.jpg',
		startTime: 3.5,
		endTime: 6.1,
		zoomStart: 1.0,
		zoomEnd: 1.25,
	},
	{
		// Scene 5: Towers
		name: 'Towers',
		image: 'yehuda-video/intercut_towers.jpg',
		startTime: 13.7,
		endTime: 16.0,
		zoomStart: 1.0,
		zoomEnd: 1.15,
	},
	{
		// Scene 7: Magic
		name: 'Magic',
		image: 'yehuda-video/intercut_magic.jpg',
		startTime: 20.5,
		endTime: 22.5,
		zoomStart: 1.0,
		zoomEnd: 1.12,
	},
	{
		// Scene 10: Bicycle
		name: 'Bicycle',
		image: 'yehuda-video/intercut_bike.jpg',
		startTime: 26.7,
		endTime: 28.0,
		zoomStart: 1.0,
		zoomEnd: 1.1,
	},
	{
		// Scene 11: Tree
		name: 'Tree',
		image: 'yehuda-video/intercut_tree.jpg',
		startTime: 28.0,
		endTime: 29.2,
		zoomStart: 1.0,
		zoomEnd: 1.08,
	},
];

// ============================================================
// WORD TIMINGS (from storyboard with tiers)
// ============================================================

const WORD_TIMINGS = [
	// Scene 1: יהודה, אתה ילד מדהים!
	{"word": "יהודה,", "start": 0.179, "end": 1.359, "tier": "hero" as const, "groupId": 1},
	{"word": "אתה", "start": 1.399, "end": 1.839, "tier": "normal" as const, "groupId": 1},
	{"word": "ילד", "start": 1.939, "end": 2.299, "tier": "normal" as const, "groupId": 1},
	{"word": "מדהים!", "start": 2.339, "end": 2.879, "tier": "hero" as const, "groupId": 1},

	// Scene 2: IMAGE (superpowers) - words still in data but hidden by image
	{"word": "יש", "start": 3.48, "end": 3.679, "tier": "normal" as const, "groupId": 2},
	{"word": "בך", "start": 3.74, "end": 3.899, "tier": "normal" as const, "groupId": 2},
	{"word": "כוחות", "start": 4.019, "end": 4.5, "tier": "hero" as const, "groupId": 2},
	{"word": "על", "start": 4.599, "end": 4.859, "tier": "strong" as const, "groupId": 2},
	{"word": "שאתה", "start": 4.92, "end": 5.199, "tier": "normal" as const, "groupId": 2},
	{"word": "עוד", "start": 5.199, "end": 5.319, "tier": "normal" as const, "groupId": 2},
	{"word": "לא", "start": 5.339, "end": 5.46, "tier": "normal" as const, "groupId": 2},
	{"word": "מכיר.", "start": 5.48, "end": 6.119, "tier": "normal" as const, "groupId": 2},

	// Scene 3: יצירתיות, דמיון, אומץ (ALL HERO)
	{"word": "יצירתיות,", "start": 6.539, "end": 7.519, "tier": "hero" as const, "groupId": 3},
	{"word": "דמיון,", "start": 7.559, "end": 8.339, "tier": "hero" as const, "groupId": 3},
	{"word": "אומץ.", "start": 8.359, "end": 9.099, "tier": "hero" as const, "groupId": 3},

	// Scene 4: העולם שלך... הרפתקה
	{"word": "העולם", "start": 9.399, "end": 9.739, "tier": "normal" as const, "groupId": 4},
	{"word": "שלך", "start": 9.779, "end": 10.159, "tier": "normal" as const, "groupId": 4},
	{"word": "הוא", "start": 10.199, "end": 10.3, "tier": "normal" as const, "groupId": 4},
	{"word": "לא", "start": 10.359, "end": 10.439, "tier": "normal" as const, "groupId": 4},
	{"word": "רק", "start": 10.48, "end": 10.64, "tier": "normal" as const, "groupId": 4},
	{"word": "מסכים,", "start": 10.68, "end": 11.699, "tier": "strong" as const, "groupId": 4},
	{"word": "העולם", "start": 11.739, "end": 12.1, "tier": "normal" as const, "groupId": 4},
	{"word": "שלך", "start": 12.119, "end": 12.4, "tier": "normal" as const, "groupId": 4},
	{"word": "הוא", "start": 12.4, "end": 12.48, "tier": "normal" as const, "groupId": 4},
	{"word": "הרפתקה.", "start": 12.5, "end": 13.159, "tier": "hero" as const, "groupId": 4},

	// Scene 5: IMAGE (towers) - words hidden
	{"word": "אתה", "start": 13.739, "end": 13.899, "tier": "normal" as const, "groupId": 5},
	{"word": "יכול", "start": 13.92, "end": 14.119, "tier": "normal" as const, "groupId": 5},
	{"word": "לבנות", "start": 14.159, "end": 14.559, "tier": "strong" as const, "groupId": 5},
	{"word": "מגדלים", "start": 14.6, "end": 15.079, "tier": "hero" as const, "groupId": 5},
	{"word": "מקרטון,", "start": 15.079, "end": 15.779, "tier": "normal" as const, "groupId": 5},

	// Scene 6: משחקים... עולמות (WORDS)
	{"word": "להמציא", "start": 15.979, "end": 16.34, "tier": "strong" as const, "groupId": 6},
	{"word": "משחקים", "start": 16.379, "end": 16.819, "tier": "hero" as const, "groupId": 6},
	{"word": "חדשים", "start": 16.899, "end": 17.279, "tier": "normal" as const, "groupId": 6},
	{"word": "עם", "start": 17.3, "end": 17.36, "tier": "normal" as const, "groupId": 6},
	{"word": "חברים,", "start": 17.44, "end": 18.099, "tier": "normal" as const, "groupId": 6},
	{"word": "לצייר", "start": 18.139, "end": 18.52, "tier": "normal" as const, "groupId": 6},
	{"word": "עולמות", "start": 18.56, "end": 19.079, "tier": "hero" as const, "groupId": 6},
	{"word": "שלמים", "start": 19.119, "end": 19.46, "tier": "normal" as const, "groupId": 6},
	{"word": "על", "start": 19.479, "end": 19.559, "tier": "normal" as const, "groupId": 6},
	{"word": "נייר.", "start": 19.639, "end": 20.079, "tier": "normal" as const, "groupId": 6},

	// Scene 7: IMAGE (magic) - words hidden
	{"word": "אתה", "start": 20.539, "end": 20.68, "tier": "normal" as const, "groupId": 7},
	{"word": "יכול", "start": 20.719, "end": 20.94, "tier": "normal" as const, "groupId": 7},
	{"word": "ללמוד", "start": 20.96, "end": 21.26, "tier": "normal" as const, "groupId": 7},
	{"word": "קסמים,", "start": 21.319, "end": 21.959, "tier": "hero" as const, "groupId": 7},

	// Scene 8: עוגה... סיפור (WORDS)
	{"word": "לבשל", "start": 22.0, "end": 22.399, "tier": "normal" as const, "groupId": 8},
	{"word": "עוגה", "start": 22.42, "end": 22.679, "tier": "strong" as const, "groupId": 8},
	{"word": "עם", "start": 22.719, "end": 22.819, "tier": "normal" as const, "groupId": 8},
	{"word": "אמא,", "start": 22.899, "end": 23.44, "tier": "normal" as const, "groupId": 8},
	{"word": "לכתוב", "start": 23.479, "end": 23.799, "tier": "normal" as const, "groupId": 8},
	{"word": "סיפור", "start": 23.899, "end": 24.239, "tier": "hero" as const, "groupId": 8},
	{"word": "משלך.", "start": 24.299, "end": 24.86, "tier": "normal" as const, "groupId": 8},

	// Scene 9: צמח (WORDS)
	{"word": "אתה", "start": 25.34, "end": 25.479, "tier": "normal" as const, "groupId": 9},
	{"word": "יכול", "start": 25.5, "end": 25.68, "tier": "normal" as const, "groupId": 9},
	{"word": "לגדל", "start": 25.72, "end": 26.079, "tier": "strong" as const, "groupId": 9},
	{"word": "צמח,", "start": 26.199, "end": 26.719, "tier": "hero" as const, "groupId": 9},

	// Scene 10 & 11: IMAGE (bicycle, tree) - words hidden
	{"word": "לרכב", "start": 26.76, "end": 27.1, "tier": "normal" as const, "groupId": 10},
	{"word": "על", "start": 27.139, "end": 27.22, "tier": "normal" as const, "groupId": 10},
	{"word": "אופניים,", "start": 27.219, "end": 28, "tier": "hero" as const, "groupId": 10},
	{"word": "לטפס", "start": 28.039, "end": 28.479, "tier": "strong" as const, "groupId": 11},
	{"word": "על", "start": 28.539, "end": 28.639, "tier": "normal" as const, "groupId": 11},
	{"word": "עצים.", "start": 28.659, "end": 29.159, "tier": "hero" as const, "groupId": 11},

	// Scene 12: יהודה, אתה יכול כל דבר (WORDS)
	{"word": "יהודה,", "start": 29.659, "end": 30.34, "tier": "hero" as const, "groupId": 12},
	{"word": "אתה", "start": 30.379, "end": 30.539, "tier": "normal" as const, "groupId": 12},
	{"word": "יכול", "start": 30.599, "end": 31.239, "tier": "normal" as const, "groupId": 12},
	{"word": "כל", "start": 31.34, "end": 31.539, "tier": "strong" as const, "groupId": 12},
	{"word": "דבר.", "start": 31.619, "end": 32.139, "tier": "hero" as const, "groupId": 12},

	// Scene 13: תאמין בעצמך... מיוחד (WORDS - FINALE)
	{"word": "תאמין", "start": 32.738, "end": 33.119, "tier": "hero" as const, "groupId": 13},
	{"word": "בעצמך", "start": 33.159, "end": 34.299, "tier": "hero" as const, "groupId": 13},
	{"word": "כי", "start": 34.38, "end": 34.459, "tier": "normal" as const, "groupId": 13},
	{"word": "אתה", "start": 34.5, "end": 34.72, "tier": "normal" as const, "groupId": 13},
	{"word": "באמת", "start": 34.779, "end": 35.38, "tier": "strong" as const, "groupId": 13},
	{"word": "מיוחד.", "start": 35.639, "end": 36.26, "tier": "hero" as const, "groupId": 13}
];

// ============================================================
// HELPER: Check if word falls during any image scene
// ============================================================

const isWordDuringImage = (wordStart: number, wordEnd: number, scenes: ImageScene[]): boolean => {
	return scenes.some(scene => {
		// Word overlaps with image scene if:
		// word starts before scene ends AND word ends after scene starts
		return wordStart < scene.endTime && wordEnd > scene.startTime;
	});
};

// Filter words to only show those OUTSIDE image windows
const getVisibleWords = (words: typeof WORD_TIMINGS, scenes: ImageScene[]) => {
	return words.filter(word => !isWordDuringImage(word.start, word.end, scenes));
};

// ============================================================
// HELPER: Check if next image is consecutive (for hard cut)
// ============================================================

const isNextImageConsecutive = (currentIndex: number, scenes: ImageScene[]): boolean => {
	if (currentIndex >= scenes.length - 1) return false;
	const current = scenes[currentIndex];
	const next = scenes[currentIndex + 1];
	// Consecutive if next starts within 0.1s of current ending
	return Math.abs(next.startTime - current.endTime) < 0.1;
};

// ============================================================
// IMAGE SCENE COMPONENT
// Full opacity image that replaces text
// Hard cut if next image is consecutive, otherwise fadeout AFTER text ends
// ============================================================

const FADEOUT_FRAMES = 5; // Extra frames for fadeout AFTER text block ends

const ImageSceneComponent: React.FC<{
	scene: ImageScene;
	isConsecutive: boolean; // True if next image follows immediately
}> = ({ scene, isConsecutive }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const textBlockDuration = Math.round((scene.endTime - scene.startTime) * fps);
	const progress = Math.min(frame / textBlockDuration, 1); // Cap progress at 1 for zoom

	// Quick fade in (5 frames)
	const fadeInDuration = 5;
	const fadeIn = interpolate(frame, [0, fadeInDuration], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	// Fadeout: SKIP if next image is consecutive (hard cut)
	// Otherwise fade out AFTER text block ends
	let opacity: number;
	if (isConsecutive) {
		// Hard cut - stay at full opacity until the end
		opacity = fadeIn;
	} else {
		// Fade out after text block ends
		const totalDuration = textBlockDuration + FADEOUT_FRAMES;
		const fadeOut = interpolate(
			frame,
			[textBlockDuration, totalDuration],
			[1, 0],
			{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
		);
		opacity = Math.min(fadeIn, fadeOut);
	}

	// Slow zoom throughout
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
					background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

// ============================================================
// MAIN COMPOSITION
// ============================================================

export const YehudaVideoIntercuts: React.FC = () => {
	const { fps } = useVideoConfig();

	// Filter words to only show those OUTSIDE image windows
	// This prevents text from rendering during image scenes
	const visibleWords = getVisibleWords(WORD_TIMINGS, IMAGE_SCENES);

	return (
		<AbsoluteFill style={{ direction: 'rtl', fontFamily }}>
			{/* Layer 1: Word Cloud - ONLY words outside image windows */}
			<Sequence name="Word Cloud" from={0}>
				<MultiWordComposition
					wordTimings={visibleWords}
					audioFile="yehuda-video/final_audio.mp3"
					gapThreshold={0.4}
					maxWordsPerGroup={7}
					heroFontSize={150}
					strongFontSize={95}
					normalFontSize={65}
					marginX={50}
					marginY={100}
					rtl={true}
					glowIntensity={1.4}
					particleDensity={1.2}
					backgroundPulse={true}
					wordEntranceStyle="pop"
					colorScheme={2}
					screenShake={0}
					dustEnabled={true}
					lightBeamsEnabled={true}
					textStroke={0}
					animationSpeed={1}
				/>
			</Sequence>

			{/* Layer 2+: Image Scenes */}
			{/* Consecutive images: hard cut (no extra frames) */}
			{/* Non-consecutive: fadeout AFTER text block ends */}
			{IMAGE_SCENES.map((scene, index) => {
				const isConsecutive = isNextImageConsecutive(index, IMAGE_SCENES);
				// Only add fadeout frames if NOT followed by consecutive image
				const extraFrames = isConsecutive ? 0 : FADEOUT_FRAMES;

				return (
					<Sequence
						key={index}
						name={`Image: ${scene.name}`}
						from={Math.round(scene.startTime * fps)}
						durationInFrames={Math.round((scene.endTime - scene.startTime) * fps) + extraFrames}
					>
						<ImageSceneComponent scene={scene} isConsecutive={isConsecutive} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

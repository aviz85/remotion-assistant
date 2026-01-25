/**
 * Parasha Bo Video - מחושך לאור
 *
 * Kinetic typography video for Parashat Bo (January 2026)
 * Theme: From darkness to light, from slavery to freedom
 *
 * STORYBOARD-BASED COMPOSITION
 * Images REPLACE text during specific scenes (not overlay).
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

// Based on speech timings and storyboard:
// 0-2.5s: "בתוך החושך הכי עמוק" (TEXT)
// 2.5-3.5s: IMAGE - Egypt darkness
// 3.5-5.3s: "כשהכול נראה אבוד" (TEXT)
// 5.3-6.5s: IMAGE - Light breaking
// 6.5-10.5s: "תמיד יש אור שמחכה. עם ישראל ידע את זה" (TEXT)
// 10.5-12.7s: "מאות שנים של עבדות" (TEXT)
// 12.7-13.0s: IMAGE - Slavery (brief)
// 13.0-14.6s: "אבל האמונה לא נשברה" (TEXT)
// 14.6-15.0s: IMAGE - Faith flame
// 15.0-18.4s: "וברגע אחד הכול השתנה מעבדות לחירות!" (TEXT)
// 18.4-19.0s: IMAGE - Exodus freedom
// 19.0-21.2s: "גם אתה יכול לצאת מהמיצר שלך" (TEXT)
// 21.2-21.5s: IMAGE - Breaking chains
// 21.5-28.8s: Final text (no more images)

const IMAGE_SCENES: ImageScene[] = [
	{
		name: 'Egypt Darkness',
		image: 'parasha-video/egypt-darkness.jpg',
		startTime: 2.6,
		endTime: 3.6,
		zoomStart: 1.0,
		zoomEnd: 1.15,
	},
	{
		name: 'Light Breaking',
		image: 'parasha-video/light-breaking.jpg',
		startTime: 5.4,
		endTime: 6.5,
		zoomStart: 1.0,
		zoomEnd: 1.12,
	},
	{
		name: 'Slavery',
		image: 'parasha-video/slavery.jpg',
		startTime: 11.0,
		endTime: 12.7,
		zoomStart: 1.0,
		zoomEnd: 1.1,
	},
	{
		name: 'Faith Flame',
		image: 'parasha-video/faith-flame.jpg',
		startTime: 14.7,
		endTime: 15.7,
		zoomStart: 1.0,
		zoomEnd: 1.08,
	},
	{
		name: 'Exodus Freedom',
		image: 'parasha-video/exodus-freedom.jpg',
		startTime: 18.5,
		endTime: 19.0,
		zoomStart: 1.05,
		zoomEnd: 1.15,
	},
	{
		name: 'Breaking Chains',
		image: 'parasha-video/breaking-chains.jpg',
		startTime: 21.2,
		endTime: 21.5,
		zoomStart: 1.0,
		zoomEnd: 1.1,
	},
];

// ============================================================
// WORD TIMINGS (from transcription with tiers)
// ============================================================

const WORD_TIMINGS = [
	// Scene 1: בתוך החושך הכי עמוק
	{ word: "בתוך", start: 0.119, end: 0.5, tier: "normal" as const },
	{ word: "החושך", start: 0.519, end: 1.32, tier: "hero" as const },
	{ word: "הכי", start: 1.339, end: 1.639, tier: "normal" as const },
	{ word: "עמוק,", start: 1.659, end: 2.519, tier: "strong" as const },

	// Scene 2: כשהכול נראה אבוד (after Egypt image)
	{ word: "כשהכול", start: 3.679, end: 4.359, tier: "normal" as const },
	{ word: "נראה", start: 4.42, end: 4.719, tier: "normal" as const },
	{ word: "אבוד,", start: 4.759, end: 5.299, tier: "strong" as const },

	// Scene 3: תמיד יש אור שמחכה (after light image)
	{ word: "תמיד", start: 6.579, end: 6.979, tier: "normal" as const },
	{ word: "יש", start: 6.98, end: 7.319, tier: "normal" as const },
	{ word: "אור", start: 7.339, end: 7.599, tier: "hero" as const },
	{ word: "שמחכה.", start: 7.639, end: 8.439, tier: "strong" as const },

	// Scene 4: עם ישראל ידע את זה
	{ word: "עם", start: 9.319, end: 9.46, tier: "normal" as const },
	{ word: "ישראל", start: 9.479, end: 9.84, tier: "hero" as const },
	{ word: "ידע", start: 9.84, end: 10.14, tier: "normal" as const },
	{ word: "את", start: 10.18, end: 10.279, tier: "normal" as const },
	{ word: "זה", start: 10.3, end: 10.42, tier: "normal" as const },

	// Words during slavery image (will be filtered)
	{ word: "מאות", start: 11.099, end: 11.5, tier: "normal" as const },
	{ word: "שנים", start: 11.559, end: 11.9, tier: "normal" as const },
	{ word: "של", start: 11.92, end: 12.079, tier: "normal" as const },
	{ word: "עבדות,", start: 12.079, end: 12.659, tier: "hero" as const },

	// Scene 5: אבל האמונה לא נשברה (after slavery image)
	{ word: "אבל", start: 12.939, end: 13.119, tier: "normal" as const },
	{ word: "האמונה", start: 13.139, end: 13.599, tier: "hero" as const },
	{ word: "לא", start: 13.659, end: 13.739, tier: "normal" as const },
	{ word: "נשברה,", start: 13.799, end: 14.619, tier: "strong" as const },

	// Words during faith flame image (will be filtered)
	{ word: "וברגע", start: 14.699, end: 15.239, tier: "normal" as const },
	{ word: "אחד", start: 15.279, end: 15.699, tier: "strong" as const },

	// Scene 6: הכול השתנה מעבדות לחירות! (after faith flame)
	{ word: "הכול", start: 15.859, end: 16.199, tier: "normal" as const },
	{ word: "השתנה", start: 16.2, end: 16.659, tier: "hero" as const },
	{ word: "מעבדות", start: 16.92, end: 17.68, tier: "strong" as const },
	{ word: "לחירות!", start: 17.76, end: 18.44, tier: "hero" as const },

	// Words during exodus freedom image (will be filtered)

	// Scene 7: גם אתה יכול לצאת מהמיצר שלך (after exodus)
	{ word: "גם", start: 19.1, end: 19.259, tier: "normal" as const },
	{ word: "אתה", start: 19.26, end: 19.539, tier: "strong" as const },
	{ word: "יכול", start: 19.579, end: 19.879, tier: "normal" as const },
	{ word: "לצאת", start: 19.899, end: 20.14, tier: "strong" as const },
	{ word: "מהמיצר", start: 20.199, end: 20.739, tier: "hero" as const },
	{ word: "שלך.", start: 20.779, end: 21.18, tier: "normal" as const },

	// Words during breaking chains image (will be filtered)

	// Scene 8: כל יום הוא הזדמנות חדשה
	{ word: "כל", start: 21.559, end: 21.759, tier: "normal" as const },
	{ word: "יום", start: 21.84, end: 22.039, tier: "strong" as const },
	{ word: "הוא", start: 22.06, end: 22.12, tier: "normal" as const },
	{ word: "הזדמנות", start: 22.14, end: 22.559, tier: "hero" as const },
	{ word: "חדשה.", start: 22.619, end: 23.479, tier: "strong" as const },

	// Scene 9: פרשת בא מזכירה לנו
	{ word: "פרשת", start: 23.519, end: 23.979, tier: "strong" as const },
	{ word: "בא", start: 24.059, end: 24.2, tier: "hero" as const },
	{ word: "מזכירה", start: 24.22, end: 24.699, tier: "normal" as const },
	{ word: "לנו", start: 24.739, end: 24.979, tier: "normal" as const },

	// Scene 10: מתוך החושך יוצא האור הגדול ביותר (FINALE)
	{ word: "מתוך", start: 25.319, end: 25.639, tier: "normal" as const },
	{ word: "החושך", start: 25.659, end: 26.319, tier: "strong" as const },
	{ word: "יוצא", start: 26.719, end: 27.059, tier: "normal" as const },
	{ word: "האור", start: 27.139, end: 27.659, tier: "hero" as const },
	{ word: "הגדול", start: 27.799, end: 28.34, tier: "hero" as const },
	{ word: "ביותר.", start: 28.399, end: 28.799, tier: "hero" as const },
];

// ============================================================
// HELPER: Check if word falls during any image scene
// ============================================================

const isWordDuringImage = (wordStart: number, wordEnd: number, scenes: ImageScene[]): boolean => {
	return scenes.some(scene => {
		return wordStart < scene.endTime && wordEnd > scene.startTime;
	});
};

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
	return Math.abs(next.startTime - current.endTime) < 0.1;
};

// ============================================================
// IMAGE SCENE COMPONENT
// ============================================================

const FADEOUT_FRAMES = 5;

const ImageSceneComponent: React.FC<{
	scene: ImageScene;
	isConsecutive: boolean;
}> = ({ scene, isConsecutive }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const textBlockDuration = Math.round((scene.endTime - scene.startTime) * fps);
	const progress = Math.min(frame / textBlockDuration, 1);

	const fadeInDuration = 5;
	const fadeIn = interpolate(frame, [0, fadeInDuration], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	let opacity: number;
	if (isConsecutive) {
		opacity = fadeIn;
	} else {
		const totalDuration = textBlockDuration + FADEOUT_FRAMES;
		const fadeOut = interpolate(
			frame,
			[textBlockDuration, totalDuration],
			[1, 0],
			{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
		);
		opacity = Math.min(fadeIn, fadeOut);
	}

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

export const ParashaBoVideo: React.FC = () => {
	const { fps } = useVideoConfig();

	// Filter words to only show those OUTSIDE image windows
	const visibleWords = getVisibleWords(WORD_TIMINGS, IMAGE_SCENES);

	return (
		<AbsoluteFill style={{ direction: 'rtl', fontFamily }}>
			{/* Layer 1: Word Cloud - ONLY words outside image windows */}
			<Sequence name="Word Cloud" from={0}>
				<MultiWordComposition
					wordTimings={visibleWords}
					audioFile="parasha-video/speech.mp3"
					gapThreshold={0.5}
					maxWordsPerGroup={6}
					heroFontSize={160}
					strongFontSize={100}
					normalFontSize={70}
					marginX={60}
					marginY={100}
					rtl={true}
					glowIntensity={1.5}
					particleDensity={1.0}
					backgroundPulse={true}
					wordEntranceStyle="pop"
					colorScheme={5}  // Red/warm for dramatic effect
					screenShake={0}
					dustEnabled={true}
					lightBeamsEnabled={true}
					textStroke={0}
					animationSpeed={1}
				/>
			</Sequence>

			{/* Layer 2+: Image Scenes */}
			{IMAGE_SCENES.map((scene, index) => {
				const isConsecutive = isNextImageConsecutive(index, IMAGE_SCENES);
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

			{/* Background Music Layer */}
			<Audio
				src={staticFile("parasha-video/music.mp3")}
				volume={0.15}
			/>
		</AbsoluteFill>
	);
};

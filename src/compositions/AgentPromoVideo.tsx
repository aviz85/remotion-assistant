/**
 * Agent Promo Video - AVIZ Agents B2B Promotional
 *
 * STORYBOARD-BASED COMPOSITION
 * Images REPLACE text during specific scenes (not overlay).
 * Professional B2B AI agent implementation service promo.
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
		// Scene: Manual chaos - "על משימות שמחשב יכול לעשות במקומך"
		name: 'Chaos',
		image: 'agent-promo/intercut_chaos.jpg',
		startTime: 2.3,
		endTime: 4.6,
		zoomStart: 1.0,
		zoomEnd: 1.15,
	},
	{
		// Scene: New path - "אבל יש דרך אחרת"
		name: 'NewPath',
		image: 'agent-promo/intercut_newpath.jpg',
		startTime: 11.5,
		endTime: 13.2,
		zoomStart: 1.0,
		zoomEnd: 1.12,
	},
	{
		// Scene: AI employee - "רק שהוא אף פעם לא שוכח, אף פעם לא ישן"
		name: 'AIEmployee',
		image: 'agent-promo/intercut_ai_employee.jpg',
		startTime: 18.2,
		endTime: 20.9,
		zoomStart: 1.0,
		zoomEnd: 1.18,
	},
	{
		// Scene: Dashboard - "גלריית סוכנים מוכנים CRM חשבוניות יומן רשתות חברתיות"
		name: 'Dashboard',
		image: 'agent-promo/intercut_dashboard.jpg',
		startTime: 27.5,
		endTime: 32.2,
		zoomStart: 1.0,
		zoomEnd: 1.1,
	},
];

// ============================================================
// WORD TIMINGS (from transcription with tiers based on storyboard)
// ============================================================

const WORD_TIMINGS = [
	// Scene 1: כמה זמן אתה מבזבז (WORDS)
	{"word": "כמה", "start": 0.119, "end": 0.419, "tier": "normal" as const, "groupId": 1},
	{"word": "זמן", "start": 0.439, "end": 0.799, "tier": "hero" as const, "groupId": 1},
	{"word": "אתה", "start": 1.018, "end": 1.279, "tier": "normal" as const, "groupId": 1},
	{"word": "מבזבז", "start": 1.319, "end": 1.959, "tier": "hero" as const, "groupId": 1},

	// Scene 2: IMAGE (chaos) - על משימות שמחשב יכול לעשות במקומך
	{"word": "על", "start": 2.379, "end": 2.479, "tier": "normal" as const, "groupId": 2},
	{"word": "משימות", "start": 2.519, "end": 2.999, "tier": "strong" as const, "groupId": 2},
	{"word": "שמחשב", "start": 3.019, "end": 3.459, "tier": "normal" as const, "groupId": 2},
	{"word": "יכול", "start": 3.48, "end": 3.719, "tier": "normal" as const, "groupId": 2},
	{"word": "לעשות", "start": 3.72, "end": 3.939, "tier": "normal" as const, "groupId": 2},
	{"word": "במקומך?", "start": 3.999, "end": 4.539, "tier": "strong" as const, "groupId": 2},

	// Scene 3: פיתוח מערכות עולה מאות אלפי שקלים (WORDS)
	{"word": "פיתוח", "start": 5.059, "end": 5.399, "tier": "strong" as const, "groupId": 3},
	{"word": "מערכות", "start": 5.44, "end": 5.919, "tier": "strong" as const, "groupId": 3},
	{"word": "עולה", "start": 5.92, "end": 6.219, "tier": "normal" as const, "groupId": 3},
	{"word": "מאות", "start": 6.379, "end": 6.759, "tier": "hero" as const, "groupId": 3},
	{"word": "אלפי", "start": 6.779, "end": 7, "tier": "hero" as const, "groupId": 3},
	{"word": "שקלים,", "start": 7.079, "end": 7.619, "tier": "hero" as const, "groupId": 3},

	// Scene 4: לוקח חודשים ושבעים אחוז נכשלים (WORDS)
	{"word": "לוקח", "start": 7.659, "end": 8.019, "tier": "normal" as const, "groupId": 4},
	{"word": "חודשים", "start": 8.079, "end": 8.68, "tier": "hero" as const, "groupId": 4},
	{"word": "ושבעים", "start": 9.079, "end": 9.5, "tier": "strong" as const, "groupId": 4},
	{"word": "אחוז", "start": 9.539, "end": 9.759, "tier": "strong" as const, "groupId": 4},
	{"word": "מהפרויקטים", "start": 9.819, "end": 10.439, "tier": "normal" as const, "groupId": 4},
	{"word": "נכשלים.", "start": 10.46, "end": 11.079, "tier": "hero" as const, "groupId": 4},

	// Scene 5: IMAGE (new path) - אבל יש דרך אחרת
	{"word": "אבל", "start": 11.579, "end": 11.759, "tier": "normal" as const, "groupId": 5},
	{"word": "יש", "start": 11.779, "end": 11.92, "tier": "normal" as const, "groupId": 5},
	{"word": "דרך", "start": 11.96, "end": 12.18, "tier": "hero" as const, "groupId": 5},
	{"word": "אחרת.", "start": 12.219, "end": 12.719, "tier": "hero" as const, "groupId": 5},

	// Scene 6: סוכני AI שעובדים לפי הפרוטוקולים שלך (WORDS)
	{"word": "סוכני", "start": 13.119, "end": 13.44, "tier": "hero" as const, "groupId": 6},
	{"word": "AI", "start": 13.639, "end": 13.919, "tier": "hero" as const, "groupId": 6},
	{"word": "שעובדים", "start": 14, "end": 14.34, "tier": "strong" as const, "groupId": 6},
	{"word": "לפי", "start": 14.4, "end": 14.619, "tier": "normal" as const, "groupId": 6},
	{"word": "הפרוטוקולים", "start": 14.619, "end": 15.279, "tier": "hero" as const, "groupId": 6},
	{"word": "שלך,", "start": 15.299, "end": 16.02, "tier": "strong" as const, "groupId": 6},

	// Scene 7: כמו עובד חדש שמקבל הדרכה (WORDS)
	{"word": "כמו", "start": 16.079, "end": 16.239, "tier": "normal" as const, "groupId": 7},
	{"word": "עובד", "start": 16.239, "end": 16.52, "tier": "hero" as const, "groupId": 7},
	{"word": "חדש", "start": 16.579, "end": 16.899, "tier": "hero" as const, "groupId": 7},
	{"word": "שמקבל", "start": 16.959, "end": 17.42, "tier": "normal" as const, "groupId": 7},
	{"word": "הדרכה,", "start": 17.42, "end": 17.979, "tier": "strong" as const, "groupId": 7},

	// Scene 8: IMAGE (AI employee) - רק שהוא אף פעם לא שוכח אף פעם לא ישן
	{"word": "רק", "start": 18.219, "end": 18.36, "tier": "normal" as const, "groupId": 8},
	{"word": "שהוא", "start": 18.38, "end": 18.52, "tier": "normal" as const, "groupId": 8},
	{"word": "אף", "start": 18.6, "end": 18.72, "tier": "normal" as const, "groupId": 8},
	{"word": "פעם", "start": 18.779, "end": 18.92, "tier": "normal" as const, "groupId": 8},
	{"word": "לא", "start": 18.959, "end": 19.059, "tier": "normal" as const, "groupId": 8},
	{"word": "שוכח,", "start": 19.119, "end": 19.68, "tier": "hero" as const, "groupId": 8},
	{"word": "אף", "start": 19.739, "end": 19.899, "tier": "normal" as const, "groupId": 8},
	{"word": "פעם", "start": 19.939, "end": 20.1, "tier": "normal" as const, "groupId": 8},
	{"word": "לא", "start": 20.139, "end": 20.22, "tier": "normal" as const, "groupId": 8},
	{"word": "ישן", "start": 20.219, "end": 20.62, "tier": "hero" as const, "groupId": 8},

	// Scene 9: ומטפל במאות משימות במקביל (WORDS)
	{"word": "ומטפל", "start": 20.86, "end": 21.42, "tier": "strong" as const, "groupId": 9},
	{"word": "במאות", "start": 21.46, "end": 21.92, "tier": "hero" as const, "groupId": 9},
	{"word": "משימות", "start": 21.979, "end": 22.38, "tier": "hero" as const, "groupId": 9},
	{"word": "במקביל.", "start": 22.42, "end": 23.339, "tier": "strong" as const, "groupId": 9},

	// Scene 10: חמישה ימים בלבד להטמעה (WORDS)
	{"word": "חמישה", "start": 23.399, "end": 23.76, "tier": "hero" as const, "groupId": 10},
	{"word": "ימים", "start": 23.819, "end": 24.059, "tier": "hero" as const, "groupId": 10},
	{"word": "בלבד", "start": 24.119, "end": 24.459, "tier": "normal" as const, "groupId": 10},
	{"word": "להטמעה.", "start": 24.5, "end": 25.079, "tier": "strong" as const, "groupId": 10},

	// Scene 11: שינויים בשפה טבעית לא בקוד (WORDS)
	{"word": "שינויים", "start": 25.379, "end": 25.7, "tier": "strong" as const, "groupId": 11},
	{"word": "בשפה", "start": 25.72, "end": 26.1, "tier": "hero" as const, "groupId": 11},
	{"word": "טבעית,", "start": 26.18, "end": 26.6, "tier": "hero" as const, "groupId": 11},
	{"word": "לא", "start": 26.639, "end": 26.719, "tier": "normal" as const, "groupId": 11},
	{"word": "בקוד.", "start": 26.779, "end": 27.279, "tier": "strong" as const, "groupId": 11},

	// Scene 12: IMAGE (dashboard) - גלריית סוכנים מוכנים CRM חשבוניות יומן רשתות חברתיות
	{"word": "גלריית", "start": 27.6, "end": 27.959, "tier": "strong" as const, "groupId": 12},
	{"word": "סוכנים", "start": 28, "end": 28.299, "tier": "hero" as const, "groupId": 12},
	{"word": "מוכנים,", "start": 28.299, "end": 28.959, "tier": "normal" as const, "groupId": 12},
	{"word": "CRM,", "start": 29.079, "end": 29.519, "tier": "strong" as const, "groupId": 12},
	{"word": "חשבוניות,", "start": 29.559, "end": 30.26, "tier": "normal" as const, "groupId": 12},
	{"word": "יומן,", "start": 30.319, "end": 30.759, "tier": "normal" as const, "groupId": 12},
	{"word": "רשתות", "start": 30.799, "end": 31.159, "tier": "normal" as const, "groupId": 12},
	{"word": "חברתיות", "start": 31.2, "end": 32.098, "tier": "normal" as const, "groupId": 12},

	// Scene 13: ודשבורד אחד לשלוט בהכול (WORDS)
	{"word": "ודשבורד", "start": 32.2, "end": 32.779, "tier": "hero" as const, "groupId": 13},
	{"word": "אחד", "start": 32.86, "end": 33.06, "tier": "strong" as const, "groupId": 13},
	{"word": "לשלוט", "start": 33.099, "end": 33.42, "tier": "hero" as const, "groupId": 13},
	{"word": "בהכול.", "start": 33.459, "end": 34.319, "tier": "hero" as const, "groupId": 13},

	// Scene 14: שלושים דקות שיחה בלי התחייבות (WORDS)
	{"word": "שלושים", "start": 34.4, "end": 34.739, "tier": "hero" as const, "groupId": 14},
	{"word": "דקות", "start": 34.799, "end": 35.08, "tier": "hero" as const, "groupId": 14},
	{"word": "שיחה", "start": 35.119, "end": 35.479, "tier": "strong" as const, "groupId": 14},
	{"word": "בלי", "start": 35.84, "end": 35.939, "tier": "normal" as const, "groupId": 14},
	{"word": "התחייבות.", "start": 35.979, "end": 36.879, "tier": "strong" as const, "groupId": 14},

	// Scene 15: נראה לך איך זה נראה עבור העסק שלך (WORDS - FINALE)
	{"word": "נראה", "start": 36.94, "end": 37.119, "tier": "strong" as const, "groupId": 15},
	{"word": "לך", "start": 37.18, "end": 37.4, "tier": "normal" as const, "groupId": 15},
	{"word": "איך", "start": 37.439, "end": 37.54, "tier": "normal" as const, "groupId": 15},
	{"word": "זה", "start": 37.6, "end": 37.659, "tier": "normal" as const, "groupId": 15},
	{"word": "נראה", "start": 37.74, "end": 38.299, "tier": "normal" as const, "groupId": 15},
	{"word": "עבור", "start": 38.38, "end": 38.619, "tier": "normal" as const, "groupId": 15},
	{"word": "העסק", "start": 38.659, "end": 38.979, "tier": "hero" as const, "groupId": 15},
	{"word": "שלך?", "start": 39.02, "end": 39.279, "tier": "hero" as const, "groupId": 15},
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
			{/* Cinematic vignette - slightly darker for professional feel */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)',
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

// ============================================================
// MAIN COMPOSITION
// ============================================================

export const AgentPromoVideo: React.FC = () => {
	const { fps } = useVideoConfig();

	const visibleWords = getVisibleWords(WORD_TIMINGS, IMAGE_SCENES);

	return (
		<AbsoluteFill style={{ direction: 'rtl', fontFamily }}>
			{/* Layer 1: Word Cloud - ONLY words outside image windows */}
			<Sequence name="Word Cloud" from={0}>
				<MultiWordComposition
					wordTimings={visibleWords}
					audioFile="agent-promo/final_audio.mp3"
					gapThreshold={0.5}
					maxWordsPerGroup={8}
					heroFontSize={140}
					strongFontSize={90}
					normalFontSize={60}
					marginX={60}
					marginY={80}
					rtl={true}
					glowIntensity={1.2}
					particleDensity={0.8}
					backgroundPulse={true}
					wordEntranceStyle="pop"
					colorScheme={3}
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
		</AbsoluteFill>
	);
};

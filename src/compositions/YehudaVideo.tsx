/**
 * Yehuda Video - יהודה אתה מדהים
 *
 * Kinetic typography video for a 10-year-old boy named Yehuda.
 * Message about how talented and amazing he is with creative activity ideas.
 * Uses enhanced word timings with pre-assigned tiers and groupIds from Director's Script.
 */

import React from 'react';
import { MultiWordComposition } from '../templates/MultiWordComposition';
import { loadFont } from '@remotion/google-fonts/Heebo';

// Load Heebo for Hebrew
const { fontFamily } = loadFont('normal', {
  weights: ['400', '600', '700', '900'],
  subsets: ['hebrew', 'latin'],
});

// Enhanced word timings with LARGER groups for cloud/wall effect
const WORD_TIMINGS = [
  // Group 1: יהודה, אתה ילד מדהים!
  {"word": "יהודה,", "start": 0.179, "end": 1.359, "tier": "hero" as const, "groupId": 1},
  {"word": "אתה", "start": 1.399, "end": 1.839, "tier": "normal" as const, "groupId": 1},
  {"word": "ילד", "start": 1.939, "end": 2.299, "tier": "normal" as const, "groupId": 1},
  {"word": "מדהים!", "start": 2.339, "end": 2.879, "tier": "hero" as const, "groupId": 1},

  // Group 2: יש בך כוחות על שאתה עוד לא מכיר
  {"word": "יש", "start": 3.48, "end": 3.679, "tier": "normal" as const, "groupId": 2},
  {"word": "בך", "start": 3.74, "end": 3.899, "tier": "normal" as const, "groupId": 2},
  {"word": "כוחות", "start": 4.019, "end": 4.5, "tier": "hero" as const, "groupId": 2},
  {"word": "על", "start": 4.599, "end": 4.859, "tier": "strong" as const, "groupId": 2},
  {"word": "שאתה", "start": 4.92, "end": 5.199, "tier": "normal" as const, "groupId": 2},
  {"word": "עוד", "start": 5.199, "end": 5.319, "tier": "normal" as const, "groupId": 2},
  {"word": "לא", "start": 5.339, "end": 5.46, "tier": "normal" as const, "groupId": 2},
  {"word": "מכיר.", "start": 5.48, "end": 6.119, "tier": "normal" as const, "groupId": 2},

  // Group 3: יצירתיות, דמיון, אומץ
  {"word": "יצירתיות,", "start": 6.539, "end": 7.519, "tier": "hero" as const, "groupId": 3},
  {"word": "דמיון,", "start": 7.559, "end": 8.339, "tier": "hero" as const, "groupId": 3},
  {"word": "אומץ.", "start": 8.359, "end": 9.099, "tier": "hero" as const, "groupId": 3},

  // Group 4: העולם שלך הוא לא רק מסכים, העולם שלך הוא הרפתקה
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

  // Group 5: לבנות מגדלים, להמציא משחקים, לצייר עולמות
  {"word": "אתה", "start": 13.739, "end": 13.899, "tier": "normal" as const, "groupId": 5},
  {"word": "יכול", "start": 13.92, "end": 14.119, "tier": "normal" as const, "groupId": 5},
  {"word": "לבנות", "start": 14.159, "end": 14.559, "tier": "strong" as const, "groupId": 5},
  {"word": "מגדלים", "start": 14.6, "end": 15.079, "tier": "hero" as const, "groupId": 5},
  {"word": "מקרטון,", "start": 15.079, "end": 15.779, "tier": "normal" as const, "groupId": 5},
  {"word": "להמציא", "start": 15.979, "end": 16.34, "tier": "strong" as const, "groupId": 5},
  {"word": "משחקים", "start": 16.379, "end": 16.819, "tier": "hero" as const, "groupId": 5},
  {"word": "חדשים", "start": 16.899, "end": 17.279, "tier": "normal" as const, "groupId": 5},
  {"word": "עם", "start": 17.3, "end": 17.36, "tier": "normal" as const, "groupId": 5},
  {"word": "חברים,", "start": 17.44, "end": 18.099, "tier": "normal" as const, "groupId": 5},
  {"word": "לצייר", "start": 18.139, "end": 18.52, "tier": "normal" as const, "groupId": 5},
  {"word": "עולמות", "start": 18.56, "end": 19.079, "tier": "hero" as const, "groupId": 5},
  {"word": "שלמים", "start": 19.119, "end": 19.46, "tier": "normal" as const, "groupId": 5},
  {"word": "על", "start": 19.479, "end": 19.559, "tier": "normal" as const, "groupId": 5},
  {"word": "נייר.", "start": 19.639, "end": 20.079, "tier": "normal" as const, "groupId": 5},

  // Group 6: קסמים, עוגה, סיפור
  {"word": "אתה", "start": 20.539, "end": 20.68, "tier": "normal" as const, "groupId": 6},
  {"word": "יכול", "start": 20.719, "end": 20.94, "tier": "normal" as const, "groupId": 6},
  {"word": "ללמוד", "start": 20.96, "end": 21.26, "tier": "normal" as const, "groupId": 6},
  {"word": "קסמים,", "start": 21.319, "end": 21.959, "tier": "hero" as const, "groupId": 6},
  {"word": "לבשל", "start": 22, "end": 22.399, "tier": "normal" as const, "groupId": 6},
  {"word": "עוגה", "start": 22.42, "end": 22.679, "tier": "strong" as const, "groupId": 6},
  {"word": "עם", "start": 22.719, "end": 22.819, "tier": "normal" as const, "groupId": 6},
  {"word": "אמא,", "start": 22.899, "end": 23.44, "tier": "normal" as const, "groupId": 6},
  {"word": "לכתוב", "start": 23.479, "end": 23.799, "tier": "normal" as const, "groupId": 6},
  {"word": "סיפור", "start": 23.899, "end": 24.239, "tier": "hero" as const, "groupId": 6},
  {"word": "משלך.", "start": 24.299, "end": 24.86, "tier": "normal" as const, "groupId": 6},

  // Group 7: לגדל צמח, לרכב אופניים, לטפס עצים
  {"word": "אתה", "start": 25.34, "end": 25.479, "tier": "normal" as const, "groupId": 7},
  {"word": "יכול", "start": 25.5, "end": 25.68, "tier": "normal" as const, "groupId": 7},
  {"word": "לגדל", "start": 25.72, "end": 26.079, "tier": "strong" as const, "groupId": 7},
  {"word": "צמח,", "start": 26.199, "end": 26.719, "tier": "hero" as const, "groupId": 7},
  {"word": "לרכב", "start": 26.76, "end": 27.1, "tier": "normal" as const, "groupId": 7},
  {"word": "על", "start": 27.139, "end": 27.22, "tier": "normal" as const, "groupId": 7},
  {"word": "אופניים,", "start": 27.219, "end": 28, "tier": "hero" as const, "groupId": 7},
  {"word": "לטפס", "start": 28.039, "end": 28.479, "tier": "strong" as const, "groupId": 7},
  {"word": "על", "start": 28.539, "end": 28.639, "tier": "normal" as const, "groupId": 7},
  {"word": "עצים.", "start": 28.659, "end": 29.159, "tier": "hero" as const, "groupId": 7},

  // Group 8: יהודה, אתה יכול כל דבר
  {"word": "יהודה,", "start": 29.659, "end": 30.34, "tier": "hero" as const, "groupId": 8},
  {"word": "אתה", "start": 30.379, "end": 30.539, "tier": "normal" as const, "groupId": 8},
  {"word": "יכול", "start": 30.599, "end": 31.239, "tier": "normal" as const, "groupId": 8},
  {"word": "כל", "start": 31.34, "end": 31.539, "tier": "strong" as const, "groupId": 8},
  {"word": "דבר.", "start": 31.619, "end": 32.139, "tier": "hero" as const, "groupId": 8},

  // Group 9: תאמין בעצמך כי אתה באמת מיוחד
  {"word": "תאמין", "start": 32.738, "end": 33.119, "tier": "hero" as const, "groupId": 9},
  {"word": "בעצמך", "start": 33.159, "end": 34.299, "tier": "hero" as const, "groupId": 9},
  {"word": "כי", "start": 34.38, "end": 34.459, "tier": "normal" as const, "groupId": 9},
  {"word": "אתה", "start": 34.5, "end": 34.72, "tier": "normal" as const, "groupId": 9},
  {"word": "באמת", "start": 34.779, "end": 35.38, "tier": "strong" as const, "groupId": 9},
  {"word": "מיוחד.", "start": 35.639, "end": 36.26, "tier": "hero" as const, "groupId": 9}
];

export const YehudaVideo: React.FC = () => {
  return (
    <div style={{ direction: 'rtl', fontFamily }}>
      <MultiWordComposition
        wordTimings={WORD_TIMINGS}
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
    </div>
  );
};

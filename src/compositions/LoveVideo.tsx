/**
 * Love Video - אהבה
 *
 * Kinetic typography video about love.
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

// Enhanced word timings with tier and groupId from Director's Script
const WORD_TIMINGS = [
  {"word": "אהבה.", "start": 0.159, "end": 0.779, "tier": "hero" as const, "groupId": 1},
  {"word": "המילה", "start": 2.279, "end": 2.659, "tier": "normal" as const, "groupId": 2},
  {"word": "הכי", "start": 2.679, "end": 2.979, "tier": "normal" as const, "groupId": 2},
  {"word": "פשוטה", "start": 3.019, "end": 3.579, "tier": "strong" as const, "groupId": 2},
  {"word": "והכי", "start": 4.279, "end": 4.699, "tier": "normal" as const, "groupId": 3},
  {"word": "מסובכת", "start": 4.739, "end": 5.279, "tier": "hero" as const, "groupId": 3},
  {"word": "בעולם.", "start": 5.319, "end": 5.839, "tier": "normal" as const, "groupId": 3},
  {"word": "אהבה", "start": 7.099, "end": 7.419, "tier": "normal" as const, "groupId": 4},
  {"word": "זה", "start": 7.48, "end": 7.579, "tier": "normal" as const, "groupId": 4},
  {"word": "לא", "start": 7.619, "end": 7.719, "tier": "normal" as const, "groupId": 4},
  {"word": "רק", "start": 7.759, "end": 7.979, "tier": "normal" as const, "groupId": 4},
  {"word": "רגש,", "start": 8.039, "end": 8.8, "tier": "strong" as const, "groupId": 4},
  {"word": "זה", "start": 8.859, "end": 8.939, "tier": "normal" as const, "groupId": 5},
  {"word": "בחירה", "start": 9, "end": 9.439, "tier": "hero" as const, "groupId": 5},
  {"word": "כל", "start": 9.779, "end": 10.079, "tier": "normal" as const, "groupId": 6},
  {"word": "יום", "start": 10.34, "end": 10.56, "tier": "normal" as const, "groupId": 6},
  {"word": "מחדש.", "start": 10.56, "end": 11.239, "tier": "strong" as const, "groupId": 6},
  {"word": "לבחור", "start": 11.699, "end": 12.079, "tier": "normal" as const, "groupId": 7},
  {"word": "להישאר,", "start": 12.14, "end": 13.26, "tier": "hero" as const, "groupId": 7},
  {"word": "לבחור", "start": 13.279, "end": 13.639, "tier": "normal" as const, "groupId": 8},
  {"word": "לסלוח,", "start": 13.679, "end": 14.859, "tier": "hero" as const, "groupId": 8},
  {"word": "לבחור", "start": 14.899, "end": 15.399, "tier": "normal" as const, "groupId": 9},
  {"word": "לראות", "start": 15.5, "end": 15.84, "tier": "normal" as const, "groupId": 9},
  {"word": "את", "start": 15.859, "end": 15.96, "tier": "normal" as const, "groupId": 9},
  {"word": "הטוב", "start": 16, "end": 16.48, "tier": "hero" as const, "groupId": 9},
  {"word": "גם", "start": 17.02, "end": 17.18, "tier": "normal" as const, "groupId": 10},
  {"word": "כשקשה,", "start": 17.219, "end": 18.099, "tier": "strong" as const, "groupId": 10},
  {"word": "גם", "start": 18.2, "end": 18.419, "tier": "normal" as const, "groupId": 11},
  {"word": "כשכואב.", "start": 18.44, "end": 19.94, "tier": "strong" as const, "groupId": 11},
  {"word": "כי", "start": 20, "end": 20.119, "tier": "normal" as const, "groupId": 12},
  {"word": "אהבה", "start": 20.12, "end": 20.46, "tier": "normal" as const, "groupId": 12},
  {"word": "אמיתית", "start": 20.5, "end": 21.099, "tier": "hero" as const, "groupId": 12},
  {"word": "היא", "start": 22.04, "end": 22.12, "tier": "normal" as const, "groupId": 13},
  {"word": "לא", "start": 22.159, "end": 22.239, "tier": "normal" as const, "groupId": 13},
  {"word": "מושלמת,", "start": 22.299, "end": 23.559, "tier": "strong" as const, "groupId": 13},
  {"word": "היא", "start": 23.619, "end": 23.719, "tier": "normal" as const, "groupId": 14},
  {"word": "אמיתית,", "start": 23.76, "end": 25.02, "tier": "hero" as const, "groupId": 14},
  {"word": "והאמת", "start": 25.1, "end": 25.779, "tier": "strong" as const, "groupId": 15},
  {"word": "היא", "start": 26.399, "end": 26.539, "tier": "normal" as const, "groupId": 16},
  {"word": "תמיד", "start": 26.579, "end": 27.139, "tier": "normal" as const, "groupId": 16},
  {"word": "יותר", "start": 27.219, "end": 27.699, "tier": "normal" as const, "groupId": 16},
  {"word": "יפה.", "start": 27.76, "end": 28.079, "tier": "hero" as const, "groupId": 16}
];

export const LoveVideo: React.FC = () => {
  return (
    <div style={{ direction: 'rtl', fontFamily }}>
      <MultiWordComposition
        wordTimings={WORD_TIMINGS}
        audioFile="love-video/final_audio.mp3"
        gapThreshold={0.4}
        maxWordsPerGroup={7}
        heroFontSize={160}
        strongFontSize={100}
        normalFontSize={70}
        marginX={50}
        marginY={100}
        rtl={true}
        glowIntensity={1.3}
        particleDensity={1}
        backgroundPulse={true}
        wordEntranceStyle="pop"
        colorScheme={-1}
        screenShake={0}
        dustEnabled={true}
        lightBeamsEnabled={true}
        textStroke={0}
        animationSpeed={1}
      />
    </div>
  );
};

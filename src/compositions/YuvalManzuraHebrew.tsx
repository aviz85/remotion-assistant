/**
 * Yuval Manzura - Hebrew Version
 * Uses Heebo font for Hebrew text support
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  interpolate,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Heebo';
import transcriptData from '../../projects/yuval-manzura-hebrew/transcript_transcript.json';

// Load Heebo font (supports Hebrew)
const { fontFamily } = loadFont('normal', {
  weights: ['400', '600', '700', '900'],
  subsets: ['hebrew', 'latin'],
});

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

const WORD_TIMINGS: WordTiming[] = (transcriptData as { words: Array<{ word: string; start: number; end: number }> }).words
  .filter((w) => w.word.trim() !== '')
  .map((w) => ({
    word: w.word.replace(/^\.\.\./, ''),
    start: w.start,
    end: w.end,
  }));

// Color schemes
const COLORS = [
  { bg: '#0a0a0a', text: '#ffffff', accent: '#6366f1', hero: '#a855f7' },
  { bg: '#1a1a2e', text: '#ffffff', accent: '#3b82f6', hero: '#60a5fa' },
  { bg: '#0f172a', text: '#ffffff', accent: '#22c55e', hero: '#4ade80' },
  { bg: '#1a1a1a', text: '#ffffff', accent: '#f59e0b', hero: '#fbbf24' },
  { bg: '#0a1a0a', text: '#ffffff', accent: '#ec4899', hero: '#f472b6' },
  { bg: '#0d0d1a', text: '#ffffff', accent: '#ef4444', hero: '#f87171' },
  { bg: '#0a0f0a', text: '#ffffff', accent: '#10b981', hero: '#34d399' },
  { bg: '#1a0a1a', text: '#ffffff', accent: '#8b5cf6', hero: '#a78bfa' },
];

// Dust particles
const DustParticles: React.FC<{ frame: number; width: number; height: number; color: string }> = ({ frame, width, height, color }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 137.5) * 0.5 + 0.5) * width,
      y: (Math.cos(i * 137.5) * 0.5 + 0.5) * height,
      size: 1 + (i % 3),
      speed: 0.3 + (i % 5) * 0.15,
      opacity: 0.1 + (i % 4) * 0.1,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p) => {
        const yOffset = (frame * p.speed) % height;
        const currentY = (p.y - yOffset + height) % height;
        const drift = Math.sin(frame * 0.02 + p.id) * 20;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x + drift,
              top: currentY,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: p.opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Light beams
const LightBeams: React.FC<{ frame: number; color: string }> = ({ frame, color }) => {
  const beams = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      angle: -30 + i * 15,
      width: 100 + i * 50,
      opacity: 0.03 + i * 0.01,
    }));
  }, []);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {beams.map((beam) => {
        const oscillation = Math.sin(frame * 0.01 + beam.id) * 5;
        return (
          <div
            key={beam.id}
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              width: beam.width,
              height: '200%',
              background: `linear-gradient(180deg, ${color}00 0%, ${color} 50%, ${color}00 100%)`,
              opacity: beam.opacity,
              transform: `translateX(-50%) rotate(${beam.angle + oscillation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Group words into screens
function groupWordsIntoScreens(words: WordTiming[], gapThreshold: number, maxWords: number): WordTiming[][] {
  const screens: WordTiming[][] = [];
  let currentGroup: WordTiming[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];

    currentGroup.push(word);

    const hasGap = nextWord && (nextWord.start - word.end) > gapThreshold;
    const isFull = currentGroup.length >= maxWords;

    if (hasGap || isFull || !nextWord) {
      screens.push([...currentGroup]);
      currentGroup = [];
    }
  }

  return screens;
}

// Word component with Hebrew RTL support
const WordDisplay: React.FC<{
  word: string;
  fontSize: number;
  color: string;
  glowColor: string;
  opacity: number;
  scale: number;
}> = ({ word, fontSize, color, glowColor, opacity, scale }) => {
  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight: 700,
        color,
        opacity,
        transform: `scale(${scale})`,
        textShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}40`,
        direction: 'rtl',
        textAlign: 'center',
        margin: '10px 20px',
      }}
    >
      {word}
    </div>
  );
};

export const YuvalManzuraHebrew: React.FC<{
  glowIntensity?: number;
  dustEnabled?: boolean;
  lightBeamsEnabled?: boolean;
}> = ({
  glowIntensity = 1.2,
  dustEnabled = true,
  lightBeamsEnabled = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  // Group words into screens
  const screens = useMemo(() => {
    return groupWordsIntoScreens(WORD_TIMINGS, 0.4, 6);
  }, []);

  // Find current screen
  const currentScreenIndex = useMemo(() => {
    for (let i = screens.length - 1; i >= 0; i--) {
      const screen = screens[i];
      if (screen.length > 0 && currentTime >= screen[0].start) {
        return i;
      }
    }
    return 0;
  }, [screens, currentTime]);

  const currentScreen = screens[currentScreenIndex] || [];
  const colorScheme = COLORS[currentScreenIndex % COLORS.length];

  // Get active words (words that have started)
  const activeWords = currentScreen.filter((w) => currentTime >= w.start);

  // Calculate word sizes (first and emphasized words are larger)
  const getWordSize = (word: string, index: number): number => {
    const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
    // Hero words - key concepts
    const heroWords = ['רגע', 'משתנה', 'אבא', 'ספורטאי', 'מצטיין', 'ראשון', 'חלום', 'האמין', 'נפטר', 'משימה',
                       'דרימז', 'פלטפורמה', 'עולם', 'בינה', 'מלאכותית', 'טיקטוק', 'חלומות', 'משתמשים',
                       'הוגשמו', 'יובל', 'מנצורה', 'מנכל'];
    // Strong words
    const strongWords = ['שלי', 'כל', 'חייו', 'הפך', 'עשרים', 'מאה', 'ארבעים', 'עשרה', 'אלף', 'שלושים'];

    if (heroWords.some(h => cleanWord.includes(h))) return 140;
    if (strongWords.some(s => cleanWord.includes(s))) return 100;
    if (index === 0) return 120; // First word of screen
    return 70;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colorScheme.bg }}>
      {/* VFX Layers */}
      {lightBeamsEnabled && <LightBeams frame={frame} color={colorScheme.accent} />}
      {dustEnabled && <DustParticles frame={frame} width={width} height={height} color={colorScheme.accent} />}

      {/* Center glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colorScheme.accent}20 0%, transparent 50%)`,
          opacity: 0.5 + Math.sin(frame * 0.05) * 0.2,
        }}
      />

      {/* Words container - RTL layout */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap-reverse',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          padding: 60,
          direction: 'rtl',
        }}
      >
        {/* Reverse array so newest word appears on the left (correct for RTL reading) */}
        {[...activeWords].reverse().map((w, i) => {
          const wordAge = currentTime - w.start;
          const opacity = interpolate(wordAge, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
          const scale = interpolate(wordAge, [0, 0.05, 0.15], [0.5, 1.1, 1], { extrapolateRight: 'clamp' });
          const originalIndex = activeWords.length - 1 - i;

          return (
            <WordDisplay
              key={`${currentScreenIndex}-${originalIndex}`}
              word={w.word}
              fontSize={getWordSize(w.word, originalIndex)}
              color={colorScheme.text}
              glowColor={originalIndex === 0 ? colorScheme.hero : colorScheme.accent}
              opacity={opacity}
              scale={scale}
            />
          );
        })}
      </AbsoluteFill>

      {/* Audio */}
      <Audio src={staticFile('yuval-manzura-hebrew/final_audio.mp3')} />
    </AbsoluteFill>
  );
};

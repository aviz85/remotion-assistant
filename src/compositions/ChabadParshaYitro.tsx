/**
 * Chabad Parsha Yitro - Hebrew Kinetic Typography
 * Torah in the desert - belongs to everyone
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  interpolate,
  spring,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Heebo';
import transcriptData from '../../projects/chabad-parsha/transcript_transcript.json';

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

// Jewish/Chabad inspired color schemes - deep blues, golds, royal purple
const COLORS = [
  { bg: '#0a0a1a', text: '#ffffff', accent: '#c9a227', hero: '#ffd700' }, // Gold/Navy
  { bg: '#1a1a2e', text: '#ffffff', accent: '#4169e1', hero: '#6495ed' }, // Royal Blue
  { bg: '#0d0d1a', text: '#ffffff', accent: '#8b5cf6', hero: '#a78bfa' }, // Purple
  { bg: '#0f1419', text: '#ffffff', accent: '#c9a227', hero: '#ffd700' }, // Deep Navy/Gold
  { bg: '#1a0a1a', text: '#ffffff', accent: '#9370db', hero: '#ba55d3' }, // Mystic Purple
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
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {beams.map((beam) => {
        const pulse = Math.sin(frame * 0.02 + beam.id) * 0.5 + 0.5;
        return (
          <div
            key={beam.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: beam.width,
              height: '150%',
              background: `linear-gradient(180deg, ${color}${Math.round(beam.opacity * pulse * 255).toString(16).padStart(2, '0')} 0%, transparent 100%)`,
              transform: `translateX(-50%) rotate(${beam.angle}deg)`,
              transformOrigin: 'top center',
              filter: 'blur(30px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Center glow
const CenterGlow: React.FC<{ frame: number; color: string }> = ({ frame, color }) => {
  const pulse = 0.4 + Math.sin(frame * 0.03) * 0.2;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '60%',
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${color}${Math.round(pulse * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }}
    />
  );
};

// Important Hebrew words for emphasis
const IMPORTANT_WORDS = [
  'התורה', 'יתרו', 'המדבר', 'הפקר', 'לכולם', 'המסר', 'יהודי',
  'נשמה', 'שלך', 'הרבי', 'ישראל', 'ירושלים', 'היום', 'שבת', 'שלום',
  'לעשירים', 'למלומדים', 'לצדיקים', 'מחכה', 'יהודית'
];

const isImportantWord = (word: string): boolean => {
  const cleanWord = word.replace(/[.,!?:]/g, '');
  return IMPORTANT_WORDS.some(important => cleanWord.includes(important));
};

// Single Word component
const AnimatedWord: React.FC<{
  word: WordTiming;
  index: number;
  frame: number;
  fps: number;
  width: number;
  height: number;
  nextWordStart: number | null;
  colorScheme: typeof COLORS[0];
}> = ({ word, index, frame, fps, width, height, nextWordStart, colorScheme }) => {
  const wordStartFrame = Math.round(word.start * fps);
  const wordEndFrame = Math.round(word.end * fps);
  const anticipation = 5;
  const animStartFrame = wordStartFrame - anticipation;

  if (frame < animStartFrame) return null;

  const exitStartFrame = nextWordStart
    ? Math.min(Math.round(nextWordStart * fps) - 3, wordEndFrame + 10)
    : wordEndFrame + 10;
  const exitDuration = 20;

  if (frame > exitStartFrame + exitDuration + 5) return null;

  const framesSinceStart = frame - animStartFrame;

  const enterProgress = spring({
    frame: framesSinceStart,
    fps,
    config: { damping: 18, stiffness: 280, mass: 0.8 },
  });

  const exitProgress = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = Math.min(enterProgress, 1 - exitProgress * 0.95);
  if (opacity <= 0) return null;

  // Animation variety
  const animTypes = ['scale', 'slideUp', 'slideDown', 'rotate', 'bounce'];
  const animType = animTypes[index % animTypes.length];

  let translateY = 0;
  let scale = 1;
  let rotate = 0;

  switch (animType) {
    case 'scale':
      scale = 0.3 + enterProgress * 0.7;
      break;
    case 'slideUp':
      translateY = 100 * (1 - enterProgress);
      break;
    case 'slideDown':
      translateY = -100 * (1 - enterProgress);
      break;
    case 'rotate':
      rotate = -15 * (1 - enterProgress);
      scale = 0.5 + enterProgress * 0.5;
      break;
    case 'bounce':
      scale = enterProgress + (enterProgress - 1) * 0.15;
      translateY = -20 * (1 - enterProgress);
      break;
  }

  // Exit animation
  translateY += exitProgress * -40;
  scale *= (1 - exitProgress * 0.1);

  // Breathing motion
  const breath = Math.sin(framesSinceStart * 0.08) * 0.015;
  scale *= (1 + breath);

  // Importance-based styling
  const isImportant = isImportantWord(word.word);
  const baseFontSize = isImportant ? 140 : 100;
  const fontWeight = isImportant ? '900' : '700';
  const textColor = isImportant ? colorScheme.hero : colorScheme.text;

  // Text glow for important words
  const textShadow = isImportant
    ? `0 0 40px ${colorScheme.hero}80, 0 0 80px ${colorScheme.hero}40`
    : `0 0 20px ${colorScheme.accent}40`;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
        fontSize: baseFontSize,
        fontFamily,
        fontWeight,
        color: textColor,
        opacity,
        textShadow,
        direction: 'rtl',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}
    >
      {word.word}
    </div>
  );
};

export const ChabadParshaYitro: React.FC<{
  dustEnabled?: boolean;
  lightBeamsEnabled?: boolean;
  glowIntensity?: number;
}> = ({
  dustEnabled = true,
  lightBeamsEnabled = true,
  glowIntensity = 1,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Find current word
  const anticipationTime = 5 / fps;
  let currentWordIndex = -1;

  for (let i = 0; i < WORD_TIMINGS.length; i++) {
    const word = WORD_TIMINGS[i];
    const nextWord = WORD_TIMINGS[i + 1];
    const displayStart = word.start - anticipationTime;
    const fadeBuffer = 0.5;
    const gapToNext = nextWord ? nextWord.start - word.end : Infinity;
    const hasLongGap = gapToNext > 0.4;
    const displayEnd = hasLongGap ? word.end + fadeBuffer : (nextWord ? nextWord.start - anticipationTime : word.end + fadeBuffer);

    if (currentTime >= displayStart && currentTime < displayEnd) {
      currentWordIndex = i;
      break;
    }
  }

  const currentWord = currentWordIndex >= 0 ? WORD_TIMINGS[currentWordIndex] : null;
  const nextWordStart = currentWordIndex >= 0 && currentWordIndex < WORD_TIMINGS.length - 1
    ? WORD_TIMINGS[currentWordIndex + 1].start
    : null;

  // Color scheme - change every 10 words
  const colorIndex = currentWordIndex >= 0 ? Math.floor(currentWordIndex / 10) % COLORS.length : 0;
  const colorScheme = COLORS[colorIndex];

  return (
    <AbsoluteFill style={{ backgroundColor: colorScheme.bg, overflow: 'hidden' }}>
      {lightBeamsEnabled && <LightBeams frame={frame} color={colorScheme.accent} />}
      {glowIntensity > 0 && <CenterGlow frame={frame} color={colorScheme.accent} />}
      {dustEnabled && <DustParticles frame={frame} width={width} height={height} color={colorScheme.accent} />}

      {currentWord && (
        <AnimatedWord
          word={currentWord}
          index={currentWordIndex}
          frame={frame}
          fps={fps}
          width={width}
          height={height}
          nextWordStart={nextWordStart}
          colorScheme={colorScheme}
        />
      )}

      <Audio src={staticFile('chabad-parsha/final_audio.mp3')} />
    </AbsoluteFill>
  );
};

export default ChabadParshaYitro;

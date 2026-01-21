import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { getMaxSafeSize, getWordImportance, getEmphasisLevel, getEmphasisStyles } from './WordLayout';

// ============================================
// TYPES
// ============================================

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface SequenceCompositionProps {
  wordTimings: WordTiming[];
  audioFile: string;
  // Configurable via Studio UI
  baseFontSize?: number;
  dustEnabled?: boolean;
  lightBeamsEnabled?: boolean;
  centerGlowEnabled?: boolean;
  glowIntensity?: number;
  anticipationFrames?: number;
  colorSchemeStart?: number;
}

// ============================================
// ANIMATION TYPES
// ============================================

const ANIMATION_TYPES = [
  'scaleUp',
  'slideUp',
  'slideDown',
  'rotateIn',
  'fadeBlur',
  'bounceIn',
  'slideLeft',
  'slideRight',
] as const;

type AnimationType = typeof ANIMATION_TYPES[number];

// ============================================
// ORGANIC PHYSICS - Like falling into gel/water
// Strong initial motion, aggressive decay (~4x per oscillation)
// Never fully stops - micro-movements continue
// ============================================

function organicPhysics(
  frame: number,
  fps: number,
  config: {
    attack: number;      // Initial velocity (frames to reach target)
    decay: number;       // How fast oscillations die (higher = faster decay)
    frequency: number;   // Oscillation speed
    overshoot: number;   // How much to overshoot (1.0 = 100% overshoot)
  }
): number {
  const t = frame / fps;
  const { attack, decay, frequency, overshoot } = config;

  // Phase 1: Ease-in attack (accelerating approach)
  const attackTime = attack / fps;
  if (t < attackTime) {
    // Cubic ease-in: starts slow, accelerates
    const progress = t / attackTime;
    return progress * progress * progress;
  }

  // Phase 2: Overshoot and damped oscillation (gel/water feel)
  const oscillationTime = t - attackTime;

  // Exponential decay - each oscillation is ~4x weaker
  // decay of 4 means amplitude drops to 25% each cycle
  const dampingFactor = Math.exp(-decay * oscillationTime);

  // Damped oscillation around 1.0
  // Starts with overshoot, then oscillates with decreasing amplitude
  const oscillation = Math.cos(frequency * oscillationTime * Math.PI * 2);

  // Result: 1.0 + decaying oscillation
  // First oscillation overshoots to (1 + overshoot), then decays
  const result = 1.0 + (overshoot * dampingFactor * oscillation);

  // Micro-movement: never fully stops, tiny residual motion
  const microTime = oscillationTime * 2;
  const microMovement = Math.sin(microTime * 3) * 0.003 * (1 + dampingFactor * 0.5);

  return Math.max(0, result + microMovement);
}

// Get physics config based on animation type
// SHORT attack (fast in), LONG decay (slow settle)
function getPhysicsConfig(animType: AnimationType): {
  attack: number;      // Frames - SHORT (3-5 frames)
  decay: number;       // Rate - LOWER = longer decay
  frequency: number;   // Oscillation speed
  overshoot: number;   // Initial overshoot amount
} {
  switch (animType) {
    case 'scaleUp':
      return { attack: 4, decay: 1.8, frequency: 0.8, overshoot: 0.18 };
    case 'slideUp':
    case 'slideDown':
      return { attack: 3, decay: 1.5, frequency: 0.7, overshoot: 0.15 };
    case 'rotateIn':
      return { attack: 4, decay: 1.6, frequency: 0.6, overshoot: 0.22 };
    case 'fadeBlur':
      return { attack: 5, decay: 2.0, frequency: 0.4, overshoot: 0.1 };
    case 'bounceIn':
      return { attack: 3, decay: 1.2, frequency: 1.0, overshoot: 0.28 };
    case 'slideLeft':
    case 'slideRight':
      return { attack: 3, decay: 1.5, frequency: 0.7, overshoot: 0.12 };
    default:
      return { attack: 4, decay: 1.6, frequency: 0.7, overshoot: 0.15 };
  }
}

// Apply organic physics to animation - progress oscillates around 1.0
function getAnimationTransform(
  animType: AnimationType,
  progress: number  // From organicPhysics: 0 → overshoots 1 → settles ~1 with micro-movement
): { translateX: number; translateY: number; scale: number; rotate: number; blur: number } {
  // Clamp base progress for position calculations (0-1 range for lerp)
  const baseProgress = Math.min(1, Math.max(0, progress));

  // Oscillation amount (how much it deviates from 1.0)
  const oscillation = progress - 1.0;

  switch (animType) {
    case 'scaleUp':
      return {
        translateX: 0,
        translateY: oscillation * -15, // Slight vertical movement on overshoot
        scale: 0.15 + baseProgress * 0.85 + oscillation * 0.15, // Scale overshoots
        rotate: oscillation * 2, // Tiny rotation on overshoot
        blur: Math.max(0, (1 - baseProgress) * 8),
      };
    case 'slideUp':
      return {
        translateX: oscillation * 5, // Slight horizontal wobble
        translateY: 120 * (1 - baseProgress) + oscillation * -20, // Overshoots up
        scale: 0.8 + baseProgress * 0.2 + oscillation * 0.05,
        rotate: oscillation * 1.5,
        blur: 0,
      };
    case 'slideDown':
      return {
        translateX: oscillation * -5,
        translateY: -120 * (1 - baseProgress) + oscillation * 20, // Overshoots down
        scale: 0.8 + baseProgress * 0.2 + oscillation * 0.05,
        rotate: oscillation * -1.5,
        blur: 0,
      };
    case 'rotateIn':
      return {
        translateX: oscillation * 8,
        translateY: oscillation * -5,
        scale: 0.5 + baseProgress * 0.5 + oscillation * 0.1,
        rotate: -25 * (1 - baseProgress) + oscillation * 8, // Rotation overshoots
        blur: 0,
      };
    case 'fadeBlur':
      return {
        translateX: 0,
        translateY: oscillation * -10,
        scale: 1.2 - baseProgress * 0.2 + oscillation * 0.08,
        rotate: oscillation * 1,
        blur: Math.max(0, 25 * (1 - baseProgress)),
      };
    case 'bounceIn':
      return {
        translateX: 0,
        translateY: oscillation * -25, // Strong vertical bounce
        scale: baseProgress + oscillation * 0.2, // Scale bounces
        rotate: oscillation * 3,
        blur: 0,
      };
    case 'slideLeft':
      return {
        translateX: 150 * (1 - baseProgress) + oscillation * -30, // Overshoots left
        translateY: oscillation * 5,
        scale: 1 + oscillation * 0.03,
        rotate: oscillation * 2,
        blur: 0,
      };
    case 'slideRight':
      return {
        translateX: -150 * (1 - baseProgress) + oscillation * 30, // Overshoots right
        translateY: oscillation * -5,
        scale: 1 + oscillation * 0.03,
        rotate: oscillation * -2,
        blur: 0,
      };
  }
}

// ============================================
// COLOR SCHEMES
// ============================================

const COLORS = [
  { bg: '#0a0a0a', text: '#ffffff', accent: '#6366f1' },
  { bg: '#1a1a2e', text: '#ffffff', accent: '#a855f7' },
  { bg: '#0f172a', text: '#ffffff', accent: '#3b82f6' },
  { bg: '#1a1a1a', text: '#ffffff', accent: '#f59e0b' },
  { bg: '#0a1a0a', text: '#ffffff', accent: '#22c55e' },
];

// ============================================
// DYNAMIC BACKGROUND - Dust & Light Effects
// ============================================

interface ParticleProps {
  frame: number;
  width: number;
  height: number;
  accentColor: string;
}

const DustParticles: React.FC<ParticleProps> = ({ frame, width, height, accentColor }) => {
  // Generate deterministic particles based on seed
  const particles = React.useMemo(() => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i * 37 + 13) % 100,  // Pseudo-random starting X
      y: (i * 53 + 7) % 100,   // Pseudo-random starting Y
      size: 2 + (i % 4),
      speed: 0.3 + (i % 5) * 0.15,
      opacity: 0.15 + (i % 3) * 0.1,
      drift: (i % 2 === 0 ? 1 : -1) * (0.5 + (i % 3) * 0.3),
    }));
  }, []);

  return (
    <>
      {particles.map((p) => {
        // Slow floating motion
        const time = frame * p.speed * 0.02;
        const floatY = (p.y + time * 15) % 120 - 10;  // Drift upward
        const floatX = p.x + Math.sin(time + p.id) * p.drift * 3;
        const pulse = 0.5 + Math.sin(time * 2 + p.id) * 0.5;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${floatX}%`,
              top: `${floatY}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: accentColor,
              opacity: p.opacity * pulse,
              filter: 'blur(1px)',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

const LightBeams: React.FC<ParticleProps> = ({ frame, width, height, accentColor }) => {
  // Animated light rays from top
  const beamCount = 5;
  const beams = React.useMemo(() =>
    Array.from({ length: beamCount }, (_, i) => ({
      id: i,
      x: 15 + i * 18,  // Spread across width
      width: 80 + (i % 3) * 40,
      rotation: -15 + (i % 3) * 10,
      speed: 0.5 + (i % 2) * 0.3,
    })), []);

  return (
    <>
      {beams.map((beam) => {
        const pulse = 0.3 + Math.sin(frame * 0.03 * beam.speed + beam.id * 2) * 0.2;

        return (
          <div
            key={beam.id}
            style={{
              position: 'absolute',
              left: `${beam.x}%`,
              top: '-20%',
              width: beam.width,
              height: '140%',
              background: `linear-gradient(180deg,
                ${accentColor}${Math.round(pulse * 15).toString(16).padStart(2, '0')} 0%,
                transparent 70%)`,
              transform: `rotate(${beam.rotation}deg)`,
              transformOrigin: 'top center',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

const CenterGlow: React.FC<ParticleProps> = ({ frame, width, height, accentColor }) => {
  // Pulsing center glow
  const pulse = 0.4 + Math.sin(frame * 0.05) * 0.15;
  const size = 50 + Math.sin(frame * 0.03) * 10;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${size}%`,
        height: `${size}%`,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}${Math.round(pulse * 30).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// SINGLE WORD COMPONENT
// ============================================

interface WordProps {
  wordTiming: WordTiming;
  index: number;
  total: number;
  globalFrame: number;
  fps: number;
  frameWidth: number;
  frameHeight: number;
  nextWordStart: number | null;
  baseFontSize?: number;
  anticipationFrames?: number;
}

const Word: React.FC<WordProps> = ({
  wordTiming,
  index,
  total,
  globalFrame,
  fps,
  frameWidth,
  frameHeight,
  nextWordStart,
  baseFontSize = 200,
  anticipationFrames = 5,
}) => {
  // GLOBAL timing
  const wordStartFrame = Math.round(wordTiming.start * fps);
  const wordEndFrame = Math.round(wordTiming.end * fps);

  // Calculate anticipation - animation starts BEFORE audio timestamp
  // So the word is SETTLED when you hear it
  const animationStartFrame = wordStartFrame - anticipationFrames;

  // Not visible yet (accounting for anticipation)
  if (globalFrame < animationStartFrame) {
    return null;
  }

  // Calculate when to start exit
  // Exit when next word starts OR after a decay period
  const nextWordFrame = nextWordStart ? Math.round(nextWordStart * fps) : null;
  const naturalExitStart = wordEndFrame + 10; // Small gap after word ends
  const exitStartFrame = nextWordFrame ? Math.min(nextWordFrame - 3, naturalExitStart) : naturalExitStart;
  const exitDuration = 20;

  // Fully faded out
  if (globalFrame > exitStartFrame + exitDuration + 5) {
    return null;
  }

  // Animation progress - starts from anticipation point
  const framesSinceStart = globalFrame - animationStartFrame;
  const animType = ANIMATION_TYPES[index % ANIMATION_TYPES.length];

  // Use Remotion spring (v11 physics - proven to work well)
  const enterProgress = spring({
    frame: framesSinceStart,
    fps,
    config: {
      damping: 18,
      stiffness: 280,
      mass: 0.8,
    },
  });

  const exitProgress = interpolate(
    globalFrame,
    [exitStartFrame, exitStartFrame + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Opacity - gentle fade
  const opacity = Math.min(enterProgress, 1 - exitProgress * 0.95);
  if (opacity <= 0) return null;

  // Transforms from enter animation
  const enter = getAnimationTransform(animType, enterProgress);

  // CONTINUOUS SUBTLE MOTION while word is visible (breathing effect)
  // Use sine wave for smooth oscillation
  const breathCycle = framesSinceStart * 0.08; // Slow cycle
  const breathScale = 1 + Math.sin(breathCycle) * 0.015; // ±1.5% scale
  const breathY = Math.sin(breathCycle * 0.7) * 3; // ±3px float
  const breathRotate = Math.sin(breathCycle * 0.5) * 0.5; // ±0.5° rotation

  // EXIT animation - gentle continuation of enter direction
  // Each animation type has matching exit that flows naturally
  let exitX = 0;
  let exitY = 0;
  let exitScale = 1;
  let exitRotate = 0;
  let exitBlur = 0;

  // Gentle easing for exit (ease-out curve)
  const exitEase = exitProgress * exitProgress; // Quadratic ease

  switch (animType) {
    case 'scaleUp':
      // Entered by scaling up, exit by continuing to grow slightly then fade
      exitScale = interpolate(exitEase, [0, 1], [1, 1.08]);
      exitBlur = interpolate(exitEase, [0, 1], [0, 6]);
      break;
    case 'slideUp':
      // Entered from bottom, continue floating up
      exitY = interpolate(exitEase, [0, 1], [0, -50]);
      exitScale = interpolate(exitEase, [0, 1], [1, 0.95]);
      break;
    case 'slideDown':
      // Entered from top, continue floating down
      exitY = interpolate(exitEase, [0, 1], [0, 50]);
      exitScale = interpolate(exitEase, [0, 1], [1, 0.95]);
      break;
    case 'rotateIn':
      // Continue rotation direction
      exitRotate = interpolate(exitEase, [0, 1], [0, 8]);
      exitScale = interpolate(exitEase, [0, 1], [1, 0.92]);
      break;
    case 'fadeBlur':
      // Blur out gently
      exitBlur = interpolate(exitEase, [0, 1], [0, 15]);
      exitScale = interpolate(exitEase, [0, 1], [1, 1.05]);
      break;
    case 'bounceIn':
      // Gentle scale down
      exitScale = interpolate(exitEase, [0, 1], [1, 0.85]);
      exitY = interpolate(exitEase, [0, 1], [0, -20]);
      break;
    case 'slideLeft':
      // Continue sliding left
      exitX = interpolate(exitEase, [0, 1], [0, -60]);
      break;
    case 'slideRight':
      // Continue sliding right
      exitX = interpolate(exitEase, [0, 1], [0, 60]);
      break;
  }

  // Importance & emphasis
  const importance = getWordImportance(wordTiming.word, index, total, Math.floor(index / 3));
  const emphasis = getEmphasisLevel(importance);

  // Font size based on importance (scaled to fit)
  const baseSizes = {
    hero: baseFontSize,
    strong: baseFontSize * 0.8,
    normal: baseFontSize * 0.65,
    subtle: baseFontSize * 0.5,
  };
  const baseSize = baseSizes[emphasis];
  const safeSize = getMaxSafeSize(wordTiming.word, frameWidth, frameHeight);
  const fontSize = Math.min(baseSize, safeSize);

  // Color scheme rotation - change every 8 words to avoid flickering
  const colorIndex = Math.floor(index / 8) % COLORS.length;
  const colors = COLORS[colorIndex];
  const emphasisStyles = getEmphasisStyles(emphasis, colors.accent);

  // Combine all transforms: enter + breathing + exit
  const finalX = enter.translateX + exitX;
  const finalY = enter.translateY + breathY + exitY;
  const finalScale = enter.scale * breathScale * exitScale;
  const finalRotate = enter.rotate + breathRotate + exitRotate;
  const finalBlur = enter.blur + exitBlur;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `
          translate(-50%, -50%)
          translateX(${finalX}px)
          translateY(${finalY}px)
          scale(${finalScale})
          rotate(${finalRotate}deg)
        `,
        fontSize,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: colors.text,
        opacity: Math.max(0, opacity),
        filter: `blur(${finalBlur}px)`,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        ...emphasisStyles,
      }}
    >
      {wordTiming.word}
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const SequenceComposition: React.FC<SequenceCompositionProps> = ({
  wordTimings,
  audioFile,
  baseFontSize = 200,
  dustEnabled = true,
  lightBeamsEnabled = true,
  centerGlowEnabled = true,
  glowIntensity = 1,
  anticipationFrames = 5,
  colorSchemeStart = 0,
}) => {
  const { fps, width, height } = useVideoConfig();
  const globalFrame = useCurrentFrame();
  const currentTime = globalFrame / fps;

  // Find current word based on ACTUAL time windows
  // Word animation starts BEFORE audio (anticipation) so word is settled when heard
  // If there's a long silence gap (>0.4s), show empty screen during silence
  const anticipationTime = anticipationFrames / fps;
  let currentWordIndex = -1;

  for (let i = 0; i < wordTimings.length; i++) {
    const word = wordTimings[i];
    const nextWord = wordTimings[i + 1];

    // Animation starts before audio timestamp
    const displayStart = word.start - anticipationTime;
    const fadeBuffer = 0.5; // 500ms to fade out after word ends

    // Check gap to next word
    const gapToNext = nextWord ? nextWord.start - word.end : Infinity;
    const hasLongGap = gapToNext > 0.4; // More than 400ms silence

    // If long gap: display until word.end + fade buffer
    // If short gap: display until next word's animation starts
    const nextDisplayStart = nextWord ? nextWord.start - anticipationTime : Infinity;
    const displayEnd = hasLongGap
      ? word.end + fadeBuffer
      : Math.min(nextDisplayStart, word.end + fadeBuffer);

    if (currentTime >= displayStart && currentTime < displayEnd) {
      currentWordIndex = i;
      break;
    }
  }

  // Render current word only (or nothing during silence)
  const currentWord = currentWordIndex >= 0 ? wordTimings[currentWordIndex] : null;
  const nextWordStart = currentWordIndex >= 0 && currentWordIndex < wordTimings.length - 1
    ? wordTimings[currentWordIndex + 1].start
    : null;

  // Background color - calculated from word index (changes every 8 words)
  // Use current word's color scheme, or fallback to colorSchemeStart
  const colorIndex = currentWordIndex >= 0
    ? (colorSchemeStart + Math.floor(currentWordIndex / 8)) % COLORS.length
    : colorSchemeStart % COLORS.length;
  const bgColor = COLORS[colorIndex].bg;
  const accentColor = COLORS[colorIndex].accent;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
      {/* Dynamic background effects */}
      {lightBeamsEnabled && (
        <LightBeams frame={globalFrame} width={width} height={height} accentColor={accentColor} />
      )}
      {centerGlowEnabled && glowIntensity > 0 && (
        <CenterGlow frame={globalFrame} width={width} height={height} accentColor={accentColor} />
      )}
      {dustEnabled && (
        <DustParticles frame={globalFrame} width={width} height={height} accentColor={accentColor} />
      )}

      {/* Word */}
      {currentWord && (
        <Word
          wordTiming={currentWord}
          index={currentWordIndex}
          total={wordTimings.length}
          globalFrame={globalFrame}
          fps={fps}
          frameWidth={width}
          frameHeight={height}
          nextWordStart={nextWordStart}
          baseFontSize={baseFontSize}
          anticipationFrames={anticipationFrames}
        />
      )}

      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};

export default SequenceComposition;

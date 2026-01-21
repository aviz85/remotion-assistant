import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================
// ANIMATION PRESETS
// ============================================

type EaseType = 'spring' | 'smooth' | 'bounce' | 'snappy';

interface AnimationConfig {
  enter: {
    from: React.CSSProperties;
    to: React.CSSProperties;
    duration: number; // frames
    ease: EaseType;
  };
  exit: {
    from: React.CSSProperties;
    to: React.CSSProperties;
    duration: number;
    ease: EaseType;
  };
}

// Entrance animations
export const ENTER_ANIMATIONS: Record<string, AnimationConfig['enter']> = {
  fadeUp: {
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    duration: 12,
    ease: 'spring',
  },
  fadeDown: {
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    duration: 12,
    ease: 'spring',
  },
  scaleUp: {
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 15,
    ease: 'bounce',
  },
  scaleDown: {
    from: { opacity: 0, transform: 'scale(1.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 12,
    ease: 'smooth',
  },
  slideLeft: {
    from: { opacity: 0, transform: 'translateX(100px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    duration: 10,
    ease: 'snappy',
  },
  slideRight: {
    from: { opacity: 0, transform: 'translateX(-100px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    duration: 10,
    ease: 'snappy',
  },
  rotateIn: {
    from: { opacity: 0, transform: 'rotate(-10deg) scale(0.9)' },
    to: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
    duration: 12,
    ease: 'spring',
  },
  blur: {
    from: { opacity: 0, filter: 'blur(20px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 15,
    ease: 'smooth',
  },
  typewriter: {
    from: { opacity: 0, transform: 'translateX(-10px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    duration: 3,
    ease: 'snappy',
  },
  pop: {
    from: { opacity: 0, transform: 'scale(0)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 8,
    ease: 'bounce',
  },
};

// Exit animations
export const EXIT_ANIMATIONS: Record<string, AnimationConfig['exit']> = {
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 8,
    ease: 'smooth',
  },
  fadeUp: {
    from: { opacity: 1, transform: 'translateY(0px)' },
    to: { opacity: 0, transform: 'translateY(-30px)' },
    duration: 8,
    ease: 'smooth',
  },
  fadeDown: {
    from: { opacity: 1, transform: 'translateY(0px)' },
    to: { opacity: 0, transform: 'translateY(30px)' },
    duration: 8,
    ease: 'smooth',
  },
  scaleOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.8)' },
    duration: 8,
    ease: 'smooth',
  },
  blurOut: {
    from: { opacity: 1, filter: 'blur(0px)' },
    to: { opacity: 0, filter: 'blur(10px)' },
    duration: 10,
    ease: 'smooth',
  },
  none: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 1,
    ease: 'smooth',
  },
};

// ============================================
// LAYOUT TEMPLATES
// ============================================

type LayoutPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

interface LayoutConfig {
  container: React.CSSProperties;
  wordStyles: React.CSSProperties[];
}

// 1-Word Layouts
export const ONE_WORD_LAYOUTS: Record<string, LayoutConfig> = {
  centerBig: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wordStyles: [
      { fontSize: 180, fontWeight: 900, textTransform: 'uppercase' as const },
    ],
  },
  centerMedium: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wordStyles: [
      { fontSize: 140, fontWeight: 800 },
    ],
  },
  topLeft: {
    container: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: '150px 80px',
    },
    wordStyles: [
      { fontSize: 120, fontWeight: 700 },
    ],
  },
  bottomRight: {
    container: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      padding: '150px 80px',
    },
    wordStyles: [
      { fontSize: 120, fontWeight: 700 },
    ],
  },
  dramatic: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wordStyles: [
      {
        fontSize: 200,
        fontWeight: 900,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.2em',
      },
    ],
  },
};

// 2-Word Layouts
export const TWO_WORD_LAYOUTS: Record<string, LayoutConfig> = {
  stackedCenter: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
    },
    wordStyles: [
      { fontSize: 100, fontWeight: 700, opacity: 0.7 },
      { fontSize: 140, fontWeight: 900 },
    ],
  },
  sideBySide: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '40px',
    },
    wordStyles: [
      { fontSize: 110, fontWeight: 800 },
      { fontSize: 110, fontWeight: 800 },
    ],
  },
  bigSmall: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
    },
    wordStyles: [
      { fontSize: 160, fontWeight: 900 },
      { fontSize: 80, fontWeight: 600, opacity: 0.8 },
    ],
  },
  smallBig: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
    },
    wordStyles: [
      { fontSize: 70, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' as const, letterSpacing: '0.3em' },
      { fontSize: 150, fontWeight: 900 },
    ],
  },
  diagonal: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '0 120px',
      gap: '30px',
    },
    wordStyles: [
      { fontSize: 100, fontWeight: 800, marginLeft: '100px' },
      { fontSize: 100, fontWeight: 800, marginLeft: '0px' },
    ],
  },
};

// 3-Word Layouts
export const THREE_WORD_LAYOUTS: Record<string, LayoutConfig> = {
  stackedCenter: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
    },
    wordStyles: [
      { fontSize: 80, fontWeight: 700 },
      { fontSize: 100, fontWeight: 900 },
      { fontSize: 80, fontWeight: 700 },
    ],
  },
  pyramid: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
    },
    wordStyles: [
      { fontSize: 70, fontWeight: 600 },
      { fontSize: 110, fontWeight: 800 },
      { fontSize: 140, fontWeight: 900 },
    ],
  },
  invertedPyramid: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
    },
    wordStyles: [
      { fontSize: 140, fontWeight: 900 },
      { fontSize: 110, fontWeight: 800 },
      { fontSize: 70, fontWeight: 600 },
    ],
  },
  horizontal: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '30px',
    },
    wordStyles: [
      { fontSize: 90, fontWeight: 800 },
      { fontSize: 90, fontWeight: 800 },
      { fontSize: 90, fontWeight: 800 },
    ],
  },
  emphasisMiddle: {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
    },
    wordStyles: [
      { fontSize: 60, fontWeight: 500, opacity: 0.6 },
      { fontSize: 150, fontWeight: 900 },
      { fontSize: 60, fontWeight: 500, opacity: 0.6 },
    ],
  },
};

// ============================================
// COLOR SCHEMES
// ============================================

export const COLOR_SCHEMES = {
  light: {
    background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
    text: '#1a1a1a',
    accent: '#6366f1',
  },
  dark: {
    background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
    text: '#ffffff',
    accent: '#6366f1',
  },
  purple: {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b4e 100%)',
    text: '#ffffff',
    accent: '#a855f7',
  },
  blue: {
    background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)',
    text: '#ffffff',
    accent: '#3b82f6',
  },
  warm: {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #2d1f1f 100%)',
    text: '#ffffff',
    accent: '#f59e0b',
  },
  green: {
    background: 'linear-gradient(180deg, #0a1a0a 0%, #1a2e1a 100%)',
    text: '#ffffff',
    accent: '#22c55e',
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getSpringValue(
  frame: number,
  fps: number,
  startFrame: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {}
): number {
  return spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: config.damping ?? 15,
      stiffness: config.stiffness ?? 200,
      mass: config.mass ?? 1,
    },
  });
}

export function getInterpolatedValue(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  ease: EaseType = 'smooth'
): number {
  // For spring, we handle it separately in the component
  return interpolate(
    frame,
    inputRange,
    outputRange,
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

// ============================================
// TEMPLATE COMPONENT
// ============================================

interface WordTemplateProps {
  words: string[];
  layout: '1-word' | '2-word' | '3-word';
  layoutVariant: string;
  enterAnimation: keyof typeof ENTER_ANIMATIONS;
  exitAnimation: keyof typeof EXIT_ANIMATIONS;
  colorScheme: keyof typeof COLOR_SCHEMES;
  startFrame: number;
  durationFrames: number;
  staggerDelay?: number; // frames between each word animation
}

export const WordTemplate: React.FC<WordTemplateProps> = ({
  words,
  layout,
  layoutVariant,
  enterAnimation,
  exitAnimation,
  colorScheme,
  startFrame,
  durationFrames,
  staggerDelay = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const enter = ENTER_ANIMATIONS[enterAnimation];
  const exit = EXIT_ANIMATIONS[exitAnimation];

  // Get layout config
  let layoutConfig: LayoutConfig;
  switch (layout) {
    case '1-word':
      layoutConfig = ONE_WORD_LAYOUTS[layoutVariant] || ONE_WORD_LAYOUTS.centerBig;
      break;
    case '2-word':
      layoutConfig = TWO_WORD_LAYOUTS[layoutVariant] || TWO_WORD_LAYOUTS.stackedCenter;
      break;
    case '3-word':
      layoutConfig = THREE_WORD_LAYOUTS[layoutVariant] || THREE_WORD_LAYOUTS.stackedCenter;
      break;
    default:
      layoutConfig = ONE_WORD_LAYOUTS.centerBig;
  }

  const endFrame = startFrame + durationFrames;
  const exitStartFrame = endFrame - exit.duration;

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <AbsoluteFill style={layoutConfig.container}>
        {words.slice(0, layout === '1-word' ? 1 : layout === '2-word' ? 2 : 3).map((word, i) => {
          const wordStartFrame = startFrame + (i * staggerDelay);
          const wordStyle = layoutConfig.wordStyles[i] || layoutConfig.wordStyles[0];

          // Calculate enter progress
          const enterProgress = enter.ease === 'spring'
            ? getSpringValue(frame, fps, wordStartFrame, { damping: 12, stiffness: 180 })
            : getInterpolatedValue(
                frame,
                [wordStartFrame, wordStartFrame + enter.duration],
                [0, 1]
              );

          // Calculate exit progress
          const exitProgress = getInterpolatedValue(
            frame,
            [exitStartFrame, exitStartFrame + exit.duration],
            [0, 1]
          );

          // Combine for final opacity
          const opacity = interpolate(enterProgress, [0, 1], [0, 1]) *
                          interpolate(exitProgress, [0, 1], [1, 0]);

          // Parse transforms for enter
          const enterFromTransform = (enter.from.transform as string) || '';
          const enterToTransform = (enter.to.transform as string) || '';

          // Simple transform interpolation (works for single transforms)
          let transform = enterToTransform;
          if (enterFromTransform && enterProgress < 1) {
            // Extract values and interpolate (simplified)
            transform = enterFromTransform;
            if (enterProgress > 0) {
              transform = enterToTransform;
            }
          }

          return (
            <span
              key={i}
              style={{
                color: colors.text,
                fontFamily: 'Inter, system-ui, sans-serif',
                opacity: Math.max(0, opacity),
                transform,
                ...wordStyle,
              }}
            >
              {word}
            </span>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default WordTemplate;

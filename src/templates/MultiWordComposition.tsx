/**
 * Multi-Word Composition Template
 *
 * Displays multiple words on screen in a word cloud layout.
 * - Words appear one-by-one at their timestamps
 * - No tween animations - just appear/disappear
 * - Layout pre-calculated using proper text measurement
 * - Screen transitions when group ends (gap or full)
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
import { loadFont } from '@remotion/google-fonts/Inter';
import {
  WordTiming,
  PlacedWord,
  computeAllScreens,
  ComputedScreen,
  LayoutOptions,
} from './WordCloudLayout';

// Load Inter font with all weights we use
const { fontFamily } = loadFont('normal', {
  weights: ['600', '700', '900'],
  subsets: ['latin'],
});

// ============================================
// TYPES
// ============================================

export interface MultiWordCompositionProps {
  wordTimings: WordTiming[];
  audioFile: string;
  gapThreshold?: number;
  maxWordsPerGroup?: number;
  // Font sizes
  heroFontSize?: number;
  strongFontSize?: number;
  normalFontSize?: number;
  marginX?: number;
  marginY?: number;
  // Visual Effects
  glowIntensity?: number;
  particleDensity?: number;
  backgroundPulse?: boolean;
  wordEntranceStyle?: 'pop' | 'slide' | 'fade' | 'glitch';
  colorScheme?: number;
  screenShake?: number;
  dustEnabled?: boolean;
  lightBeamsEnabled?: boolean;
  textStroke?: number;
  animationSpeed?: number;
}

// ============================================
// COLOR SCHEMES
// ============================================

const COLORS = [
  { bg: '#0a0a0a', text: '#ffffff', accent: '#6366f1', hero: '#a855f7' },
  { bg: '#1a1a2e', text: '#ffffff', accent: '#3b82f6', hero: '#60a5fa' },
  { bg: '#0f172a', text: '#ffffff', accent: '#22c55e', hero: '#4ade80' },
  { bg: '#1a1a1a', text: '#ffffff', accent: '#f59e0b', hero: '#fbbf24' },
  { bg: '#0a1a0a', text: '#ffffff', accent: '#ec4899', hero: '#f472b6' },
  { bg: '#0d0d1a', text: '#ffffff', accent: '#ef4444', hero: '#f87171' },  // Red
  { bg: '#0a0f0a', text: '#ffffff', accent: '#10b981', hero: '#34d399' },  // Emerald
  { bg: '#1a0a1a', text: '#ffffff', accent: '#8b5cf6', hero: '#a78bfa' },  // Violet
];

// ============================================
// VFX: DUST PARTICLES
// ============================================

interface DustParticlesProps {
  frame: number;
  width: number;
  height: number;
  accentColor: string;
  density: number;
}

const DustParticles: React.FC<DustParticlesProps> = ({ frame, width, height, accentColor, density }) => {
  const particles = useMemo(() => {
    const count = Math.floor(density * 50);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 137.5) * 0.5 + 0.5) * width,
      y: (Math.cos(i * 137.5) * 0.5 + 0.5) * height,
      size: 1 + (i % 3),
      speed: 0.3 + (i % 5) * 0.15,
      opacity: 0.1 + (i % 4) * 0.1,
    }));
  }, [width, height, density]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map(p => {
        const yOffset = (frame * p.speed) % height;
        const xWobble = Math.sin(frame * 0.02 + p.id) * 20;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x + xWobble,
              top: (p.y + yOffset) % height,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: accentColor,
              opacity: p.opacity,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// VFX: LIGHT BEAMS
// ============================================

interface LightBeamsProps {
  frame: number;
  width: number;
  height: number;
  accentColor: string;
}

const LightBeams: React.FC<LightBeamsProps> = ({ frame, width, height, accentColor }) => {
  const beams = useMemo(() => [
    { angle: -30, width: 200, opacity: 0.03, speed: 0.5 },
    { angle: -15, width: 150, opacity: 0.04, speed: 0.7 },
    { angle: 15, width: 180, opacity: 0.03, speed: 0.6 },
    { angle: 30, width: 120, opacity: 0.05, speed: 0.8 },
    { angle: 0, width: 250, opacity: 0.02, speed: 0.4 },
  ], []);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {beams.map((beam, i) => {
        const pulse = Math.sin(frame * 0.02 * beam.speed + i) * 0.5 + 0.5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '-50%',
              width: beam.width,
              height: height * 2,
              background: `linear-gradient(180deg, ${accentColor}00, ${accentColor}, ${accentColor}00)`,
              opacity: beam.opacity * pulse,
              transform: `translateX(-50%) rotate(${beam.angle}deg)`,
              filter: 'blur(30px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// VFX: CENTER GLOW
// ============================================

interface CenterGlowProps {
  frame: number;
  width: number;
  height: number;
  accentColor: string;
  intensity: number;
}

const CenterGlow: React.FC<CenterGlowProps> = ({ frame, width, height, accentColor, intensity }) => {
  const pulse = Math.sin(frame * 0.03) * 0.3 + 0.7;
  const size = Math.min(width, height) * 0.8 * intensity;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size,
          height: size,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${accentColor}20, ${accentColor}05, transparent)`,
          opacity: pulse,
          filter: 'blur(60px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// VFX: BACKGROUND PULSE
// ============================================

interface BackgroundPulseProps {
  frame: number;
  baseColor: string;
  accentColor: string;
}

const BackgroundPulse: React.FC<BackgroundPulseProps> = ({ frame, baseColor, accentColor }) => {
  const pulse = Math.sin(frame * 0.05) * 0.1 + 0.1;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${accentColor}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}, ${baseColor})`,
      }}
    />
  );
};

// ============================================
// SINGLE WORD IN CLOUD
// ============================================

interface CloudWordProps {
  placed: PlacedWord;
  isVisible: boolean;
  colors: typeof COLORS[0];
  entranceStyle: 'pop' | 'slide' | 'fade' | 'glitch';
  glowIntensity: number;
  textStroke: number;
  animationSpeed: number;
  frame: number;
  wordStartFrame: number;
}

// Debug mode - show bounding boxes
const DEBUG_BOXES = false;

const CloudWord: React.FC<CloudWordProps> = ({
  placed,
  isVisible,
  colors,
  entranceStyle,
  glowIntensity,
  textStroke,
  animationSpeed,
  frame,
  wordStartFrame,
}) => {
  if (!isVisible) return null;

  const isHero = placed.tier === 'hero';
  const isStrong = placed.tier === 'strong';

  // Animation progress (0 to 1)
  const animFrames = Math.floor(15 / animationSpeed);
  const progress = Math.min(1, (frame - wordStartFrame) / animFrames);

  // Entrance animations
  let scale = 1;
  let translateY = 0;
  let translateX = 0;
  let opacity = 1;
  let skewX = 0;

  switch (entranceStyle) {
    case 'pop':
      scale = interpolate(progress, [0, 0.6, 1], [0, 1.2, 1], { extrapolateRight: 'clamp' });
      opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
      break;
    case 'slide':
      translateY = interpolate(progress, [0, 1], [50, 0], { extrapolateRight: 'clamp' });
      opacity = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
      break;
    case 'fade':
      opacity = interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
      scale = interpolate(progress, [0, 1], [0.95, 1], { extrapolateRight: 'clamp' });
      break;
    case 'glitch':
      const glitchPhase = progress < 0.5 ? progress * 2 : 1;
      translateX = glitchPhase < 1 ? Math.sin(progress * 50) * 10 * (1 - glitchPhase) : 0;
      skewX = glitchPhase < 1 ? Math.sin(progress * 30) * 5 * (1 - glitchPhase) : 0;
      opacity = interpolate(progress, [0, 0.2, 0.4, 0.6, 1], [0, 1, 0.5, 1, 1], { extrapolateRight: 'clamp' });
      break;
  }

  // Breathing animation for visible words
  const breathe = Math.sin(frame * 0.05 + placed.x * 0.01) * 0.02 + 1;
  scale *= breathe;

  // Bounding box style
  const boxStyle: React.CSSProperties = {
    position: 'absolute',
    left: placed.x,
    top: placed.y,
    width: placed.width,
    height: placed.height,
    border: DEBUG_BOXES ? '2px solid rgba(255,0,0,0.5)' : 'none',
    backgroundColor: DEBUG_BOXES ? 'rgba(255,255,255,0.05)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: `scale(${scale}) translateY(${translateY}px) translateX(${translateX}px) skewX(${skewX}deg)`,
    opacity,
  };

  // Glow based on intensity
  const glowSize = glowIntensity * (isHero ? 80 : isStrong ? 40 : 20);
  const glowColor = isHero ? colors.hero : colors.accent;

  // Text style
  const textStyle: React.CSSProperties = {
    fontSize: placed.fontSize,
    fontFamily: fontFamily,
    fontWeight: isHero ? 900 : isStrong ? 700 : 600,
    color: isHero ? colors.hero : isStrong ? colors.accent : colors.text,
    textShadow: glowIntensity > 0
      ? `0 0 ${glowSize}px ${glowColor}, 0 0 ${glowSize * 0.5}px ${glowColor}, 0 4px 0 rgba(0,0,0,0.3)`
      : 'none',
    letterSpacing: isHero ? '0.05em' : '0.02em',
    textTransform: isHero ? 'uppercase' : 'none',
    whiteSpace: 'nowrap',
    WebkitTextStroke: textStroke > 0 ? `${textStroke}px ${colors.accent}40` : 'none',
  };

  return (
    <div style={boxStyle}>
      <span style={textStyle}>{placed.word}</span>
    </div>
  );
};

// ============================================
// SCREEN COMPONENT
// ============================================

interface ScreenProps {
  screen: ComputedScreen;
  currentTime: number;
  colors: typeof COLORS[0];
  fps: number;
  globalFrame: number;
  entranceStyle: 'pop' | 'slide' | 'fade' | 'glitch';
  glowIntensity: number;
  textStroke: number;
  animationSpeed: number;
  screenShake: number;
}

const Screen: React.FC<ScreenProps> = ({
  screen,
  currentTime,
  colors,
  fps,
  globalFrame,
  entranceStyle,
  glowIntensity,
  textStroke,
  animationSpeed,
  screenShake,
}) => {
  // Calculate screen transition opacity with longer overlap
  const screenStart = screen.startTime;
  const screenEnd = screen.endTime;

  // Fade in - start earlier for overlap
  const fadeInDuration = 0.2;
  const fadeInProgress = interpolate(
    currentTime,
    [screenStart - 0.15, screenStart + fadeInDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out - extended duration for overlap with next screen
  const fadeOutStart = screenEnd + 0.05;
  const fadeOutDuration = 0.35;
  const fadeOutProgress = interpolate(
    currentTime,
    [fadeOutStart, fadeOutStart + fadeOutDuration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const screenOpacity = Math.min(fadeInProgress, fadeOutProgress);

  // Screen shake effect
  const shakeX = screenShake > 0 ? Math.sin(globalFrame * 0.5) * screenShake : 0;
  const shakeY = screenShake > 0 ? Math.cos(globalFrame * 0.7) * screenShake * 0.5 : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: screenOpacity,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {screen.layout.map((placed, i) => {
        const isVisible = currentTime >= placed.timestamp;
        const wordStartFrame = Math.floor(placed.timestamp * fps);

        return (
          <CloudWord
            key={`${placed.word}-${i}`}
            placed={placed}
            isVisible={isVisible}
            colors={colors}
            entranceStyle={entranceStyle}
            glowIntensity={glowIntensity}
            textStroke={textStroke}
            animationSpeed={animationSpeed}
            frame={globalFrame}
            wordStartFrame={wordStartFrame}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const MultiWordComposition: React.FC<MultiWordCompositionProps> = ({
  wordTimings,
  audioFile,
  gapThreshold = 0.4,
  maxWordsPerGroup = 8,
  heroFontSize = 140,
  strongFontSize = 90,
  normalFontSize = 60,
  marginX = 0,
  marginY = 0,
  // VFX props with defaults
  glowIntensity = 1,
  particleDensity = 1,
  backgroundPulse = true,
  wordEntranceStyle = 'pop',
  colorScheme = 0,
  screenShake = 0,
  dustEnabled = true,
  lightBeamsEnabled = true,
  textStroke = 0,
  animationSpeed = 1,
}) => {
  const { fps, width, height } = useVideoConfig();
  const globalFrame = useCurrentFrame();
  const currentTime = globalFrame / fps;

  // Layout options from props
  const layoutOptions: LayoutOptions = useMemo(() => ({
    heroFontSize,
    strongFontSize,
    normalFontSize,
    marginX,
    marginY,
  }), [heroFontSize, strongFontSize, normalFontSize, marginX, marginY]);

  // Pre-compute all screen layouts (memoized)
  const screens = useMemo(() =>
    computeAllScreens(wordTimings, width, height, gapThreshold, maxWordsPerGroup, layoutOptions),
    [wordTimings, width, height, gapThreshold, maxWordsPerGroup, layoutOptions]
  );

  // Find ALL visible screens (for smooth crossfade between screens)
  const visibleScreens = screens.map((screen, index) => {
    const buffer = 0.4;  // Extended buffer for overlap
    const isVisible = currentTime >= screen.startTime - 0.15 && currentTime <= screen.endTime + buffer;
    return { screen, index, isVisible };
  }).filter(s => s.isVisible);

  // Get the primary screen (most recent one) for color scheme
  const primaryScreenIndex = visibleScreens.length > 0
    ? visibleScreens[visibleScreens.length - 1].index
    : Math.max(0, screens.findIndex(s => currentTime < s.startTime) - 1);

  // Fallback to first screen if before any content
  const safeScreenIndex = primaryScreenIndex >= 0 ? primaryScreenIndex : 0;

  // Color scheme - use prop or cycle through screens
  const baseColorIndex = colorScheme >= 0 ? colorScheme % COLORS.length : 0;
  const colorIndex = colorScheme === -1
    ? safeScreenIndex % COLORS.length
    : baseColorIndex;
  const colors = COLORS[colorIndex];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden' }}>
      {/* Background pulse effect */}
      {backgroundPulse && (
        <BackgroundPulse
          frame={globalFrame}
          baseColor={colors.bg}
          accentColor={colors.accent}
        />
      )}

      {/* Light beams */}
      {lightBeamsEnabled && (
        <LightBeams
          frame={globalFrame}
          width={width}
          height={height}
          accentColor={colors.accent}
        />
      )}

      {/* Center glow */}
      {glowIntensity > 0 && (
        <CenterGlow
          frame={globalFrame}
          width={width}
          height={height}
          accentColor={colors.hero}
          intensity={glowIntensity}
        />
      )}

      {/* Dust particles */}
      {dustEnabled && particleDensity > 0 && (
        <DustParticles
          frame={globalFrame}
          width={width}
          height={height}
          accentColor={colors.accent}
          density={particleDensity}
        />
      )}

      {/* Main content - render ALL visible screens for smooth crossfade */}
      {visibleScreens.map(({ screen, index }) => (
        <Screen
          key={index}
          screen={screen}
          currentTime={currentTime}
          colors={colorScheme === -1 ? COLORS[index % COLORS.length] : colors}
          fps={fps}
          globalFrame={globalFrame}
          entranceStyle={wordEntranceStyle}
          glowIntensity={glowIntensity}
          textStroke={textStroke}
          animationSpeed={animationSpeed}
          screenShake={screenShake}
        />
      ))}

      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};

export default MultiWordComposition;

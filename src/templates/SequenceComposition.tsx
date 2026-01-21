import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';
import {
  ENTER_ANIMATIONS,
  EXIT_ANIMATIONS,
  ONE_WORD_LAYOUTS,
  TWO_WORD_LAYOUTS,
  THREE_WORD_LAYOUTS,
  COLOR_SCHEMES,
} from './WordTemplates';

// ============================================
// TYPES
// ============================================

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface WordGroup {
  words: string[];
  startTime: number;
  endTime: number;
  layout: '1-word' | '2-word' | '3-word';
  layoutVariant: string;
  enterAnimation: string;
  exitAnimation: string;
  colorScheme: string;
}

interface SequenceCompositionProps {
  wordTimings: WordTiming[];
  audioFile: string;
  colorScheme?: keyof typeof COLOR_SCHEMES;
}

// ============================================
// WORD GROUPING LOGIC
// ============================================

function groupWords(wordTimings: WordTiming[]): WordGroup[] {
  const groups: WordGroup[] = [];
  let i = 0;

  // Layout variants rotation
  const oneWordVariants = Object.keys(ONE_WORD_LAYOUTS);
  const twoWordVariants = Object.keys(TWO_WORD_LAYOUTS);
  const threeWordVariants = Object.keys(THREE_WORD_LAYOUTS);

  // Animation variants rotation
  const enterVariants = Object.keys(ENTER_ANIMATIONS);
  const exitVariants = Object.keys(EXIT_ANIMATIONS);
  const colorVariants = Object.keys(COLOR_SCHEMES);

  let groupIndex = 0;

  while (i < wordTimings.length) {
    // Decide group size (1-3 words) based on timing gaps and variety
    const remaining = wordTimings.length - i;
    const word1 = wordTimings[i];
    const word2 = wordTimings[i + 1];
    const word3 = wordTimings[i + 2];

    // Check gaps between words
    const gap1to2 = word2 ? word2.start - word1.end : Infinity;
    const gap2to3 = word3 ? word3.start - (word2?.end || 0) : Infinity;

    // Short words or single important words get 1-word treatment
    const isShortWord = word1.word.length <= 4;
    const isPunctuation = /[.!?]$/.test(word1.word);

    let groupSize: 1 | 2 | 3;

    // Varied group sizing logic
    if (remaining === 1) {
      groupSize = 1;
    } else if (remaining === 2) {
      groupSize = gap1to2 < 0.3 ? 2 : 1;
    } else if (isPunctuation || (isShortWord && gap1to2 > 0.2)) {
      // Important single words
      groupSize = 1;
    } else if (gap1to2 < 0.15 && gap2to3 < 0.15 && remaining >= 3) {
      // Three quick words together
      groupSize = 3;
    } else if (gap1to2 < 0.25 && remaining >= 2) {
      // Two words together
      groupSize = 2;
    } else {
      // Default to single word for emphasis
      groupSize = 1;
    }

    // Alternate patterns for visual variety
    // Every 3rd group, force single word for rhythm
    if (groupIndex % 4 === 3 && groupSize > 1) {
      groupSize = 1;
    }

    const groupWords = wordTimings.slice(i, i + groupSize);
    const startTime = groupWords[0].start;
    const endTime = groupWords[groupWords.length - 1].end;

    // Select variants with rotation for variety
    let layoutVariant: string;
    let layout: '1-word' | '2-word' | '3-word';

    switch (groupSize) {
      case 1:
        layout = '1-word';
        layoutVariant = oneWordVariants[groupIndex % oneWordVariants.length];
        break;
      case 2:
        layout = '2-word';
        layoutVariant = twoWordVariants[groupIndex % twoWordVariants.length];
        break;
      case 3:
        layout = '3-word';
        layoutVariant = threeWordVariants[groupIndex % threeWordVariants.length];
        break;
    }

    // Rotate through animations and colors (dark themes only)
    const darkColorVariants = ['dark', 'purple', 'blue', 'warm', 'green'];
    const enterAnimation = enterVariants[(groupIndex * 2) % enterVariants.length];
    const exitAnimation = exitVariants[groupIndex % exitVariants.length];
    const colorScheme = darkColorVariants[groupIndex % darkColorVariants.length];

    groups.push({
      words: groupWords.map(w => w.word),
      startTime,
      endTime,
      layout,
      layoutVariant,
      enterAnimation,
      exitAnimation,
      colorScheme,
    });

    i += groupSize;
    groupIndex++;
  }

  return groups;
}

// ============================================
// ANIMATED WORD GROUP COMPONENT
// ============================================

interface AnimatedGroupProps {
  group: WordGroup;
  fps: number;
}

const AnimatedGroup: React.FC<AnimatedGroupProps> = ({ group, fps }) => {
  const frame = useCurrentFrame();
  const colors = COLOR_SCHEMES[group.colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.dark;

  // Get layout
  let layoutConfig;
  switch (group.layout) {
    case '1-word':
      layoutConfig = ONE_WORD_LAYOUTS[group.layoutVariant] || ONE_WORD_LAYOUTS.centerBig;
      break;
    case '2-word':
      layoutConfig = TWO_WORD_LAYOUTS[group.layoutVariant] || TWO_WORD_LAYOUTS.stackedCenter;
      break;
    case '3-word':
      layoutConfig = THREE_WORD_LAYOUTS[group.layoutVariant] || THREE_WORD_LAYOUTS.stackedCenter;
      break;
  }

  const durationFrames = Math.round((group.endTime - group.startTime) * fps);

  // FAST entrance (5 frames), SLOW exit (use all remaining time for decay)
  const enterDuration = 5; // Instant attack
  const exitStartFrame = durationFrames; // Start exit right when words end
  const exitDuration = 20; // Slow decay during silence

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <AbsoluteFill style={layoutConfig.container}>
        {group.words.map((word, i) => {
          const staggerDelay = i * 2; // Quick stagger (2 frames)
          const wordStartFrame = staggerDelay;

          // FAST entrance - spring with high stiffness for instant attack
          const enterProgress = spring({
            frame: frame - wordStartFrame,
            fps,
            config: { damping: 20, stiffness: 400, mass: 0.5 }, // Snappy!
          });

          // SLOW exit - gentle fade during silence
          const exitProgress = interpolate(
            frame,
            [exitStartFrame, exitStartFrame + exitDuration],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Opacity: instant in, slow out
          const opacity = Math.min(enterProgress, 1 - (exitProgress * 0.8)); // Don't fully fade

          // Transform: quick scale up, slow gentle drift up on exit
          const scale = interpolate(enterProgress, [0, 1], [0.7, 1]);
          const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -20]);
          const exitScale = interpolate(exitProgress, [0, 1], [1, 0.98]);

          const wordStyle = layoutConfig.wordStyles[i] || layoutConfig.wordStyles[0];

          return (
            <span
              key={i}
              style={{
                color: colors.text,
                fontFamily: 'Inter, system-ui, sans-serif',
                opacity: Math.max(0, opacity),
                transform: `translateY(${exitTranslateY}px) scale(${scale * exitScale})`,
                textShadow: `0 0 80px ${colors.accent}60`,
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

// ============================================
// MAIN COMPOSITION
// ============================================

export const SequenceComposition: React.FC<SequenceCompositionProps> = ({
  wordTimings,
  audioFile,
}) => {
  const { fps } = useVideoConfig();
  const groups = groupWords(wordTimings);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Word sequences */}
      {groups.map((group, i) => {
        const startFrame = Math.round(group.startTime * fps);
        const durationFrames = Math.round((group.endTime - group.startTime) * fps) + 20;

        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <AnimatedGroup group={group} fps={fps} />
          </Sequence>
        );
      })}

      {/* Audio */}
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};

export default SequenceComposition;

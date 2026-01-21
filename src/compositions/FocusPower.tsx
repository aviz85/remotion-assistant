import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  staticFile,
  random,
  Easing,
  interpolateColors,
} from "remotion";
import React, { useMemo } from "react";

// Word timing data structure
interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// Segment from storyboard
interface Segment {
  name: string;
  time_range: [number, number];
  style: string;
  background: string;
  word_treatment: string;
  emphasis_words: string[];
  transition_out: string;
}

// Storyboard definition for "The Power of Focus"
const storyboard: { segments: Segment[] } = {
  segments: [
    {
      name: "Hook",
      time_range: [0, 8],
      style: "minimal-dramatic",
      background: "dark-gradient",
      word_treatment: "fade-in-center",
      emphasis_words: ["Stop", "superpower", "noise"],
      transition_out: "fade-to-black",
    },
    {
      name: "Build - The Problem",
      time_range: [8, 22],
      style: "dynamic-stack",
      background: "animated-particles",
      word_treatment: "slide-from-sides",
      emphasis_words: ["notification", "distraction", "stealing", "focus"],
      transition_out: "zoom-blur",
    },
    {
      name: "Build - The Solution",
      time_range: [22, 33],
      style: "slide-cascade",
      background: "animated-particles",
      word_treatment: "blur-reveal",
      emphasis_words: ["deep", "clearly", "create", "matters"],
      transition_out: "fade-to-black",
    },
    {
      name: "Peak - Revelation",
      time_range: [33, 48],
      style: "explosive-center",
      background: "radial-glow",
      word_treatment: "scale-bounce",
      emphasis_words: ["Focus", "becoming", "magic", "unstoppable"],
      transition_out: "flash-white",
    },
    {
      name: "Resolve - Call to Action",
      time_range: [48, 58],
      style: "calm-elegant",
      background: "soft-gradient",
      word_treatment: "gentle-fade",
      emphasis_words: ["guard", "dreams", "impact", "legacy"],
      transition_out: "slow-fade",
    },
    {
      name: "Closing",
      time_range: [58, 68],
      style: "minimal-dramatic",
      background: "dark-gradient",
      word_treatment: "fade-in-center",
      emphasis_words: ["Focus", "rise", "attention"],
      transition_out: "slow-fade",
    },
  ],
};

// The transcript data for "The Power of Focus"
const transcriptData: { words: WordTiming[]; duration: number } = {
  duration: 51.84,
  words: [
    { word: "Stop!", start: 0.099, end: 0.54 },
    { word: "In", start: 1.399, end: 1.519 },
    { word: "a", start: 1.58, end: 1.579 },
    { word: "world", start: 1.659, end: 1.98 },
    { word: "of", start: 2, end: 2.099 },
    { word: "endless", start: 2.22, end: 2.599 },
    { word: "noise,", start: 2.7, end: 3.159 },
    { word: "there", start: 3.559, end: 3.679 },
    { word: "is", start: 3.699, end: 3.819 },
    { word: "only", start: 3.899, end: 4.119 },
    { word: "one", start: 4.259, end: 4.559 },
    { word: "superpower.", start: 4.82, end: 5.619 },
    { word: "Every", start: 6.779, end: 6.96 },
    { word: "notification,", start: 7.019, end: 7.919 },
    { word: "every", start: 8.38, end: 8.599 },
    { word: "distraction,", start: 8.659, end: 9.42 },
    { word: "every", start: 9.88, end: 10.06 },
    { word: "shiny", start: 10.179, end: 10.52 },
    { word: "object", start: 10.6, end: 10.98 },
    { word: "pulling", start: 11.079, end: 11.34 },
    { word: "at", start: 11.359, end: 11.46 },
    { word: "your", start: 11.5, end: 11.579 },
    { word: "attention,", start: 11.619, end: 12.179 },
    { word: "they", start: 12.979, end: 13.079 },
    { word: "are", start: 13.079, end: 13.199 },
    { word: "stealing", start: 13.259, end: 13.679 },
    { word: "your", start: 13.739, end: 13.84 },
    { word: "greatest", start: 13.92, end: 14.359 },
    { word: "asset.", start: 14.479, end: 14.98 },
    { word: "Time?", start: 15.979, end: 16.42 },
    { word: "No,", start: 17.039, end: 17.3 },
    { word: "your", start: 18.079, end: 18.239 },
    { word: "focus.", start: 18.399, end: 18.979 },
    { word: "The", start: 19.579, end: 19.639 },
    { word: "ability", start: 19.739, end: 20.059 },
    { word: "to", start: 20.1, end: 20.159 },
    { word: "go", start: 20.239, end: 20.34 },
    { word: "deep,", start: 20.46, end: 20.999 },
    { word: "to", start: 21.02, end: 21.1 },
    { word: "think", start: 21.219, end: 21.44 },
    { word: "clearly,", start: 21.5, end: 22.199 },
    { word: "to", start: 22.2, end: 22.3 },
    { word: "create", start: 22.379, end: 22.8 },
    { word: "what", start: 22.84, end: 23 },
    { word: "matters.", start: 23.079, end: 23.619 },
    { word: "Focus", start: 24.319, end: 24.579 },
    { word: "is", start: 24.62, end: 24.7 },
    { word: "not", start: 24.72, end: 24.86 },
    { word: "about", start: 24.94, end: 25.139 },
    { word: "doing", start: 25.199, end: 25.42 },
    { word: "more;", start: 25.5, end: 26.219 },
    { word: "it's", start: 26.279, end: 26.399 },
    { word: "about", start: 26.459, end: 26.659 },
    { word: "becoming", start: 26.719, end: 27.18 },
    { word: "more.", start: 27.26, end: 28.159 },
    { word: "When", start: 28.2, end: 28.319 },
    { word: "you", start: 28.359, end: 28.44 },
    { word: "lock", start: 28.5, end: 28.72 },
    { word: "in,", start: 28.819, end: 29.439 },
    { word: "when", start: 29.479, end: 29.579 },
    { word: "you", start: 29.619, end: 29.699 },
    { word: "eliminate", start: 29.76, end: 30.279 },
    { word: "everything", start: 30.399, end: 30.859 },
    { word: "else,", start: 30.939, end: 31.779 },
    { word: "that's", start: 31.84, end: 32.119 },
    { word: "when", start: 32.159, end: 32.299 },
    { word: "magic", start: 32.36, end: 32.659 },
    { word: "happens.", start: 32.759, end: 33.68 },
    { word: "That's", start: 33.7, end: 34.04 },
    { word: "when", start: 34.08, end: 34.2 },
    { word: "you", start: 34.24, end: 34.339 },
    { word: "become", start: 34.36, end: 34.7 },
    { word: "unstoppable.", start: 34.76, end: 36.319 },
    { word: "So", start: 36.36, end: 36.479 },
    { word: "guard", start: 36.619, end: 36.9 },
    { word: "your", start: 36.939, end: 37.1 },
    { word: "focus", start: 37.159, end: 37.5 },
    { word: "like", start: 37.56, end: 37.72 },
    { word: "your", start: 37.78, end: 37.88 },
    { word: "life", start: 38, end: 38.259 },
    { word: "depends", start: 38.319, end: 38.639 },
    { word: "on", start: 38.659, end: 38.759 },
    { word: "it,", start: 38.799, end: 39.74 },
    { word: "because", start: 39.779, end: 40.06 },
    { word: "your", start: 40.12, end: 40.24 },
    { word: "dreams,", start: 40.279, end: 41.299 },
    { word: "your", start: 41.36, end: 41.52 },
    { word: "impact,", start: 41.619, end: 42.639 },
    { word: "your", start: 42.72, end: 42.88 },
    { word: "legacy,", start: 42.939, end: 44.179 },
    { word: "they", start: 44.24, end: 44.42 },
    { word: "all", start: 44.5, end: 44.619 },
    { word: "begin", start: 44.7, end: 45.08 },
    { word: "with", start: 45.119, end: 45.239 },
    { word: "a", start: 45.279, end: 45.399 },
    { word: "single", start: 45.459, end: 45.819 },
    { word: "moment", start: 45.88, end: 46.199 },
    { word: "of", start: 46.26, end: 46.34 },
    { word: "pure,", start: 46.479, end: 47.219 },
    { word: "undivided", start: 47.28, end: 48.22 },
    { word: "attention.", start: 48.279, end: 50.119 },
    { word: "Focus", start: 50.2, end: 51.18 },
    { word: "and", start: 51.26, end: 51.38 },
    { word: "rise.", start: 51.479, end: 51.84 },
  ],
};

// Color palette
const colors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
  text: "#ffffff",
  backgroundDark: "#0a0a0a",
  backgroundMid: "#1a1a2e",
};

// Get current segment
const getCurrentSegment = (currentTime: number): Segment => {
  return (
    storyboard.segments.find(
      (seg) => currentTime >= seg.time_range[0] && currentTime < seg.time_range[1]
    ) || storyboard.segments[0]
  );
};

// Check if word is emphasized in current segment
const isEmphasisWord = (word: string, segment: Segment): boolean => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  return segment.emphasis_words.some((e) => e.toLowerCase() === cleanWord);
};

// Dynamic background component
const SegmentBackground: React.FC<{
  segment: Segment;
  frame: number;
  fps: number;
}> = ({ segment, frame, fps }) => {
  const currentTime = frame / fps;

  // Segment progress for transition effects
  const segmentStart = segment.time_range[0];
  const segmentEnd = segment.time_range[1];
  const segmentProgress = (currentTime - segmentStart) / (segmentEnd - segmentStart);

  switch (segment.background) {
    case "dark-gradient":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)",
          }}
        />
      );

    case "animated-particles":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#0a0a0a",
          }}
        >
          <ParticleField frame={frame} />
        </div>
      );

    case "radial-glow":
      const glowIntensity = 0.3 + Math.sin(frame / 30) * 0.1;
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 50%,
              rgba(99, 102, 241, ${glowIntensity}) 0%,
              rgba(139, 92, 246, ${glowIntensity * 0.5}) 30%,
              #0a0a0a 70%)`,
          }}
        />
      );

    case "soft-gradient":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)",
          }}
        />
      );

    default:
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#0a0a0a",
          }}
        />
      );
  }
};

// Particle field component
const ParticleField: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        x: random(`particle-x-${i}`) * 100,
        y: random(`particle-y-${i}`) * 100,
        size: 2 + random(`particle-size-${i}`) * 4,
        speed: 0.5 + random(`particle-speed-${i}`) * 1,
        offset: random(`particle-offset-${i}`) * 1000,
      })),
    []
  );

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${((p.y + frame * p.speed * 0.1 + p.offset) % 120) - 10}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(99, 102, 241, ${0.3 + Math.sin((frame + p.offset) / 20) * 0.2})`,
          }}
        />
      ))}
    </>
  );
};

// Word animation based on treatment
const getWordAnimation = (
  treatment: string,
  frame: number,
  fps: number,
  wordStart: number,
  isEmphasis: boolean
): React.CSSProperties => {
  const wordStartFrame = wordStart * fps;
  const elapsed = frame - wordStartFrame;

  // Entrance progress (0-1 over 10 frames)
  const entranceProgress = interpolate(elapsed, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spring animation
  const springVal = spring({
    frame: Math.max(0, elapsed),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.8 },
  });

  switch (treatment) {
    case "fade-in-center":
      return {
        opacity: entranceProgress,
        transform: `scale(${0.9 + entranceProgress * 0.1})`,
      };

    case "slide-from-sides":
      const slideDirection = Math.random() > 0.5 ? 1 : -1;
      return {
        opacity: entranceProgress,
        transform: `translateX(${(1 - springVal) * 100 * slideDirection}px)`,
      };

    case "blur-reveal":
      return {
        opacity: entranceProgress,
        filter: `blur(${(1 - entranceProgress) * 10}px)`,
      };

    case "scale-bounce":
      return {
        opacity: entranceProgress,
        transform: `scale(${springVal * (isEmphasis ? 1.2 : 1)})`,
      };

    case "gentle-fade":
      return {
        opacity: interpolate(elapsed, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${(1 - entranceProgress) * 20}px)`,
      };

    default:
      return {
        opacity: entranceProgress,
      };
  }
};

// Single animated word component
const AnimatedWord: React.FC<{
  word: string;
  startTime: number;
  endTime: number;
  segment: Segment;
  frame: number;
  fps: number;
}> = ({ word, startTime, endTime, segment, frame, fps }) => {
  const currentTime = frame / fps;
  const isEmphasis = isEmphasisWord(word, segment);
  const isSpeaking = currentTime >= startTime && currentTime <= endTime;

  // Only show words that have started
  if (currentTime < startTime - 0.1) return null;

  // Fade out after word visibility window
  const fadeOutStart = endTime + 1.5;
  const fadeOutEnd = fadeOutStart + 0.5;
  const fadeOutProgress =
    currentTime > fadeOutStart
      ? interpolate(currentTime, [fadeOutStart, fadeOutEnd], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  if (fadeOutProgress <= 0) return null;

  // Get animation based on segment treatment
  const animation = getWordAnimation(
    segment.word_treatment,
    frame,
    fps,
    startTime,
    isEmphasis
  );

  // Font sizing based on segment style and emphasis
  let fontSize = 80;
  switch (segment.style) {
    case "minimal-dramatic":
      fontSize = isEmphasis ? 160 : 120;
      break;
    case "dynamic-stack":
      fontSize = isEmphasis ? 100 : 70;
      break;
    case "slide-cascade":
      fontSize = isEmphasis ? 90 : 70;
      break;
    case "explosive-center":
      fontSize = isEmphasis ? 180 : 120;
      break;
    case "calm-elegant":
      fontSize = isEmphasis ? 100 : 80;
      break;
  }

  // Speaking highlight
  if (isSpeaking) {
    fontSize *= 1.1;
  }

  // Color
  const color = isEmphasis ? colors.primary : colors.text;

  // Glow effect
  const glowSize = isSpeaking ? 40 : isEmphasis ? 20 : 0;
  const glow =
    glowSize > 0 ? `0 0 ${glowSize}px ${color}, 0 0 ${glowSize * 2}px ${color}40` : "none";

  return (
    <span
      style={{
        display: "inline-block",
        fontSize,
        fontWeight: isEmphasis ? 900 : 700,
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        color,
        textShadow: glow,
        textTransform: segment.style === "minimal-dramatic" ? "uppercase" : "none",
        marginRight: "0.3em",
        letterSpacing: isEmphasis ? "0.05em" : "0.02em",
        opacity: fadeOutProgress * ((animation.opacity as number) || 1),
        transform: animation.transform,
        filter: animation.filter,
        transition: "font-size 0.1s ease",
      }}
    >
      {word}
    </span>
  );
};

// Words display component
const WordsLayer: React.FC<{
  words: WordTiming[];
  currentTime: number;
  segment: Segment;
  frame: number;
  fps: number;
}> = ({ words, currentTime, segment, frame, fps }) => {
  // Get visible words (current + recent)
  const visibleWords = words.filter((w) => {
    const visibilityWindow = currentTime - w.start;
    return visibilityWindow >= -0.1 && visibilityWindow < 2;
  });

  // Layout based on segment style
  const getLayout = (): React.CSSProperties => {
    switch (segment.style) {
      case "minimal-dramatic":
        return {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          padding: "0 60px",
        };
      case "dynamic-stack":
        return {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "15px",
        };
      case "slide-cascade":
        return {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        };
      case "explosive-center":
        return {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "25px",
          padding: "0 40px",
        };
      case "calm-elegant":
        return {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          padding: "0 80px",
        };
      default:
        return {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 40px",
        ...getLayout(),
      }}
    >
      {visibleWords.map((wordData, idx) => (
        <AnimatedWord
          key={`${wordData.word}-${wordData.start}-${idx}`}
          word={wordData.word}
          startTime={wordData.start}
          endTime={wordData.end}
          segment={segment}
          frame={frame}
          fps={fps}
        />
      ))}
    </div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 60,
        right: 60,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
          borderRadius: 2,
          boxShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}40`,
        }}
      />
    </div>
  );
};

// Segment transition overlay
const SegmentTransition: React.FC<{
  segment: Segment;
  currentTime: number;
}> = ({ segment, currentTime }) => {
  const segmentEnd = segment.time_range[1];
  const transitionDuration = 0.3;
  const transitionStart = segmentEnd - transitionDuration;

  if (currentTime < transitionStart) return null;

  const progress = interpolate(
    currentTime,
    [transitionStart, segmentEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  switch (segment.transition_out) {
    case "fade-to-black":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000",
            opacity: progress,
          }}
        />
      );

    case "flash-white":
      const flashOpacity = progress > 0.5 ? (1 - progress) * 2 : progress * 2;
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#fff",
            opacity: flashOpacity * 0.8,
          }}
        />
      );

    case "zoom-blur":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000",
            opacity: progress,
            filter: `blur(${progress * 10}px)`,
          }}
        />
      );

    default:
      return null;
  }
};

// Main composition component
export const FocusPower: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  const currentSegment = getCurrentSegment(currentTime);
  const progress = currentTime / transcriptData.duration;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#000",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Audio - merged speech + music */}
      <Audio src={staticFile("focus-video/final_audio.mp3")} />

      {/* Dynamic background based on segment */}
      <SegmentBackground segment={currentSegment} frame={frame} fps={fps} />

      {/* Words layer with segment-based styling */}
      <WordsLayer
        words={transcriptData.words}
        currentTime={currentTime}
        segment={currentSegment}
        frame={frame}
        fps={fps}
      />

      {/* Segment transition effects */}
      <SegmentTransition segment={currentSegment} currentTime={currentTime} />

      {/* Progress bar */}
      <ProgressBar progress={progress} />

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          right: 60,
          fontSize: 18,
          fontWeight: 700,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        The Power of Focus
      </div>
    </div>
  );
};

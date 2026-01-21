import React from 'react';
import { MultiWordComposition } from '../templates/MultiWordComposition';
import transcriptData from '../../projects/focus-video/transcript_transcript.json';

// Extract word timings from transcript - filter out spaces
const WORD_TIMINGS = transcriptData.words
  .filter((w: { word: string }) => w.word.trim() !== '')
  .map((w: { word: string; start: number; end: number }) => ({
    word: w.word,
    start: w.start,
    end: w.end,
  }));

export interface MultiWordDemoProps {
  // Font sizes
  heroFontSize?: number;
  strongFontSize?: number;
  normalFontSize?: number;
  // Layout
  marginX?: number;
  marginY?: number;
  gapThreshold?: number;
  maxWordsPerGroup?: number;
  // VFX
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

export const MultiWordDemo: React.FC<MultiWordDemoProps> = ({
  // Font sizes
  heroFontSize = 140,
  strongFontSize = 90,
  normalFontSize = 60,
  // Layout
  marginX = 0,
  marginY = 0,
  gapThreshold = 0.4,
  maxWordsPerGroup = 6,
  // VFX
  glowIntensity = 1,
  particleDensity = 1,
  backgroundPulse = true,
  wordEntranceStyle = 'pop',
  colorScheme = -1,  // -1 = cycle through colors
  screenShake = 0,
  dustEnabled = true,
  lightBeamsEnabled = true,
  textStroke = 0,
  animationSpeed = 1,
}) => {
  return (
    <MultiWordComposition
      wordTimings={WORD_TIMINGS}
      audioFile="focus-video/final_audio.mp3"
      gapThreshold={gapThreshold}
      maxWordsPerGroup={maxWordsPerGroup}
      heroFontSize={heroFontSize}
      strongFontSize={strongFontSize}
      normalFontSize={normalFontSize}
      marginX={marginX}
      marginY={marginY}
      glowIntensity={glowIntensity}
      particleDensity={particleDensity}
      backgroundPulse={backgroundPulse}
      wordEntranceStyle={wordEntranceStyle}
      colorScheme={colorScheme}
      screenShake={screenShake}
      dustEnabled={dustEnabled}
      lightBeamsEnabled={lightBeamsEnabled}
      textStroke={textStroke}
      animationSpeed={animationSpeed}
    />
  );
};

export default MultiWordDemo;

import React from 'react';
import { MultiWordComposition } from '../templates/MultiWordComposition';
import transcriptData from '../../projects/courage-video/transcript_transcript.json';

const WORD_TIMINGS = (transcriptData as { words: Array<{ word: string; start: number; end: number }> }).words
  .filter((w) => w.word.trim() !== '')
  .map((w) => ({
    word: w.word.replace(/^\.\.\./, ''),
    start: w.start,
    end: w.end,
  }));

export const CourageVideo: React.FC<{
  heroFontSize?: number;
  strongFontSize?: number;
  normalFontSize?: number;
  marginX?: number;
  marginY?: number;
  gapThreshold?: number;
  maxWordsPerGroup?: number;
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
}> = (props) => {
  return (
    <MultiWordComposition
      wordTimings={WORD_TIMINGS}
      audioFile="courage-video/speech.mp3"
      heroFontSize={props.heroFontSize ?? 140}
      strongFontSize={props.strongFontSize ?? 90}
      normalFontSize={props.normalFontSize ?? 60}
      marginX={props.marginX ?? 40}
      marginY={props.marginY ?? 80}
      gapThreshold={props.gapThreshold ?? 0.4}
      maxWordsPerGroup={props.maxWordsPerGroup ?? 6}
      glowIntensity={props.glowIntensity ?? 1.2}
      particleDensity={props.particleDensity ?? 1}
      backgroundPulse={props.backgroundPulse ?? true}
      wordEntranceStyle={props.wordEntranceStyle ?? 'pop'}
      colorScheme={props.colorScheme ?? -1}
      screenShake={props.screenShake ?? 0}
      dustEnabled={props.dustEnabled ?? true}
      lightBeamsEnabled={props.lightBeamsEnabled ?? true}
      textStroke={props.textStroke ?? 0}
      animationSpeed={props.animationSpeed ?? 1}
    />
  );
};

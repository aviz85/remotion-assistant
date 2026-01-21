import React from 'react';
import { MultiWordComposition } from '../templates/MultiWordComposition';
import transcriptData from '../../projects/dreemz/transcript_transcript.json';

// Filter out spaces and fix "Dreams" -> "Dreemz"
const WORD_TIMINGS = (transcriptData as { words: Array<{ word: string; start: number; end: number }> }).words
  .filter((w) => w.word.trim() !== '')
  .map((w) => ({
    word: w.word.replace(/Dreams/g, 'Dreemz').replace(/Dream /g, 'Dream '),
    start: w.start,
    end: w.end,
  }));

export const DreemzPromo: React.FC<{
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
      audioFile="dreemz/speech.mp3"
      heroFontSize={props.heroFontSize ?? 160}
      strongFontSize={props.strongFontSize ?? 100}
      normalFontSize={props.normalFontSize ?? 70}
      marginX={props.marginX ?? 50}
      marginY={props.marginY ?? 100}
      gapThreshold={props.gapThreshold ?? 0.5}
      maxWordsPerGroup={props.maxWordsPerGroup ?? 5}
      glowIntensity={props.glowIntensity ?? 1.5}
      particleDensity={props.particleDensity ?? 1.2}
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

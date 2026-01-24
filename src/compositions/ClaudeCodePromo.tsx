/**
 * Claude Code Promo Video
 *
 * Word cloud style kinetic typography showcasing Claude Code features.
 */

import React from 'react';
import { MultiWordComposition } from '../templates/MultiWordComposition';
import transcriptData from '../../projects/claude-code-promo/transcript_transcript.json';

// Filter out empty/whitespace words
const WORD_TIMINGS = transcriptData.words
  .filter((w) => w.word.trim() !== '')
  .map((w) => ({
    word: w.word.trim(),
    start: w.start,
    end: w.end,
  }));

export interface ClaudeCodePromoProps {
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

export const ClaudeCodePromo: React.FC<ClaudeCodePromoProps> = (props) => {
  return (
    <MultiWordComposition
      wordTimings={WORD_TIMINGS}
      audioFile="claude-code-promo/final_audio.mp3"
      heroFontSize={props.heroFontSize ?? 160}
      strongFontSize={props.strongFontSize ?? 100}
      normalFontSize={props.normalFontSize ?? 70}
      marginX={props.marginX ?? 50}
      marginY={props.marginY ?? 100}
      gapThreshold={props.gapThreshold ?? 0.5}
      maxWordsPerGroup={props.maxWordsPerGroup ?? 7}
      glowIntensity={props.glowIntensity ?? 1.3}
      particleDensity={props.particleDensity ?? 1.2}
      backgroundPulse={props.backgroundPulse ?? true}
      wordEntranceStyle={props.wordEntranceStyle ?? 'pop'}
      colorScheme={props.colorScheme ?? 1}  // Blue tech theme
      screenShake={props.screenShake ?? 0}
      dustEnabled={props.dustEnabled ?? true}
      lightBeamsEnabled={props.lightBeamsEnabled ?? true}
      textStroke={props.textStroke ?? 0}
      animationSpeed={props.animationSpeed ?? 1}
    />
  );
};

export default ClaudeCodePromo;

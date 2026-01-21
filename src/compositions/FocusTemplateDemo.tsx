import React from 'react';
import { SequenceComposition } from '../templates/SequenceComposition';
import transcriptData from '../../projects/focus-video/transcript_transcript.json';

// Extract word timings from transcript - filter out spaces
const WORD_TIMINGS = transcriptData.words
  .filter((w: { word: string }) => w.word.trim() !== '')
  .map((w: { word: string; start: number; end: number }) => ({
    word: w.word,
    start: w.start,
    end: w.end,
  }));

export interface FocusTemplateDemoProps {
  baseFontSize?: number;
  dustEnabled?: boolean;
  lightBeamsEnabled?: boolean;
  centerGlowEnabled?: boolean;
  glowIntensity?: number;
  anticipationFrames?: number;
  colorSchemeStart?: number;
}

export const FocusTemplateDemo: React.FC<FocusTemplateDemoProps> = ({
  baseFontSize = 200,
  dustEnabled = true,
  lightBeamsEnabled = true,
  centerGlowEnabled = true,
  glowIntensity = 1,
  anticipationFrames = 5,
  colorSchemeStart = 0,
}) => {
  return (
    <SequenceComposition
      wordTimings={WORD_TIMINGS}
      audioFile="focus-video/final_audio.mp3"
      baseFontSize={baseFontSize}
      dustEnabled={dustEnabled}
      lightBeamsEnabled={lightBeamsEnabled}
      centerGlowEnabled={centerGlowEnabled}
      glowIntensity={glowIntensity}
      anticipationFrames={anticipationFrames}
      colorSchemeStart={colorSchemeStart}
    />
  );
};

export default FocusTemplateDemo;

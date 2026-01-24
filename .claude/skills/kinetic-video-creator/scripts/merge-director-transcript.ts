#!/usr/bin/env npx ts-node
/**
 * Merge Director's Script + Transcript
 *
 * Combines director-script.json (planned grouping/emphasis)
 * with transcript.json (word timings from TTS transcription)
 * to produce enhanced-word-timings.json for Remotion.
 *
 * Usage:
 *   npx ts-node merge-director-transcript.ts \
 *     -d director-script.json \
 *     -t transcript.json \
 *     -o enhanced-word-timings.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

interface DirectorGroup {
  id: number;
  words: string[];
  emphasis?: Record<string, 'hero' | 'strong'>;
  style?: string;
}

interface DirectorScript {
  version: string;
  title?: string;
  groups: DirectorGroup[];
  visual_assets?: Array<{
    after_group: number;
    duration_seconds: number;
    description: string;
    purpose: string;
  }>;
}

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

interface EnhancedWordTiming {
  word: string;
  start: number;
  end: number;
  tier?: 'hero' | 'strong' | 'normal';
  groupId?: number;
}

// ============================================
// ARGUMENT PARSING
// ============================================

function parseArgs(): { director: string; transcript: string; output: string } {
  const args = process.argv.slice(2);
  let director = '';
  let transcript = '';
  let output = 'enhanced-word-timings.json';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-d' || args[i] === '--director') {
      director = args[++i];
    } else if (args[i] === '-t' || args[i] === '--transcript') {
      transcript = args[++i];
    } else if (args[i] === '-o' || args[i] === '--output') {
      output = args[++i];
    } else if (args[i] === '-h' || args[i] === '--help') {
      console.log(`
Merge Director's Script + Transcript

Usage:
  npx ts-node merge-director-transcript.ts -d <director.json> -t <transcript.json> [-o <output.json>]

Options:
  -d, --director   Director's script JSON (required)
  -t, --transcript Transcript JSON from transcription (required)
  -o, --output     Output filename (default: enhanced-word-timings.json)
  -h, --help       Show this help
`);
      process.exit(0);
    }
  }

  if (!director || !transcript) {
    console.error('Error: Both -d (director) and -t (transcript) are required');
    process.exit(1);
  }

  return { director, transcript, output };
}

// ============================================
// WORD MATCHING
// ============================================

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:'"]/g, '');
}

function matchWords(
  directorGroups: DirectorGroup[],
  transcriptWords: TranscriptWord[]
): EnhancedWordTiming[] {
  const result: EnhancedWordTiming[] = [];
  let transcriptIndex = 0;

  for (const group of directorGroups) {
    for (const directorWord of group.words) {
      const normalizedDirector = normalizeWord(directorWord);

      // Find matching word in transcript
      let matched = false;
      for (let i = transcriptIndex; i < transcriptWords.length; i++) {
        const transcriptWord = transcriptWords[i];
        const normalizedTranscript = normalizeWord(transcriptWord.word);

        if (normalizedDirector === normalizedTranscript) {
          // Determine tier from emphasis
          let tier: 'hero' | 'strong' | 'normal' = 'normal';
          if (group.emphasis) {
            // Check both original and normalized forms
            if (group.emphasis[directorWord] === 'hero' ||
                group.emphasis[normalizedDirector] === 'hero') {
              tier = 'hero';
            } else if (group.emphasis[directorWord] === 'strong' ||
                       group.emphasis[normalizedDirector] === 'strong') {
              tier = 'strong';
            }
          }

          result.push({
            word: transcriptWord.word,
            start: transcriptWord.start,
            end: transcriptWord.end,
            tier,
            groupId: group.id,
          });

          transcriptIndex = i + 1;
          matched = true;
          break;
        }
      }

      if (!matched) {
        console.warn(`Warning: Could not find word "${directorWord}" in transcript`);
      }
    }
  }

  // Check for unmatched transcript words
  if (transcriptIndex < transcriptWords.length) {
    const remaining = transcriptWords.length - transcriptIndex;
    console.warn(`Warning: ${remaining} transcript words were not matched to director groups`);
  }

  return result;
}

// ============================================
// MAIN
// ============================================

async function main() {
  const { director, transcript, output } = parseArgs();

  // Load files
  const directorPath = path.resolve(director);
  const transcriptPath = path.resolve(transcript);
  const outputPath = path.resolve(output);

  if (!fs.existsSync(directorPath)) {
    console.error(`Error: Director file not found: ${directorPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(transcriptPath)) {
    console.error(`Error: Transcript file not found: ${transcriptPath}`);
    process.exit(1);
  }

  const directorScript: DirectorScript = JSON.parse(fs.readFileSync(directorPath, 'utf-8'));
  const transcriptData = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8'));

  // Handle different transcript formats
  let transcriptWords: TranscriptWord[];
  if (Array.isArray(transcriptData)) {
    transcriptWords = transcriptData;
  } else if (transcriptData.words) {
    transcriptWords = transcriptData.words;
  } else if (transcriptData.segments) {
    // ElevenLabs Scribe format with segments
    transcriptWords = transcriptData.segments.flatMap((seg: any) =>
      seg.words?.map((w: any) => ({
        word: w.text || w.word,
        start: w.start,
        end: w.end,
      })) || []
    );
  } else {
    console.error('Error: Unrecognized transcript format');
    process.exit(1);
  }

  console.log(`Director groups: ${directorScript.groups.length}`);
  console.log(`Transcript words: ${transcriptWords.length}`);

  // Merge
  const enhanced = matchWords(directorScript.groups, transcriptWords);

  console.log(`Enhanced words: ${enhanced.length}`);

  // Count tiers
  const tierCounts = enhanced.reduce(
    (acc, w) => {
      acc[w.tier || 'normal']++;
      return acc;
    },
    { hero: 0, strong: 0, normal: 0 }
  );
  console.log(`Tiers: ${tierCounts.hero} hero, ${tierCounts.strong} strong, ${tierCounts.normal} normal`);

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(enhanced, null, 2));
  console.log(`\nWritten to: ${outputPath}`);

  // Also output visual assets info if present
  if (directorScript.visual_assets && directorScript.visual_assets.length > 0) {
    console.log(`\nVisual assets planned: ${directorScript.visual_assets.length}`);
    for (const asset of directorScript.visual_assets) {
      console.log(`  - After group ${asset.after_group}: ${asset.description} (${asset.purpose})`);
    }
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

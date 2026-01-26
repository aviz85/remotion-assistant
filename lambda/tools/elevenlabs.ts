/**
 * ElevenLabs API Tool
 *
 * Wraps TTS, transcription, and music generation APIs
 */

import type { TranscriptResult, MusicComposition, ToolResult } from '../types/index.js';

const BASE_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'dV1ee5wE1Ag5NSL6L2Z9'; // aviz's cloned voice
const DEFAULT_MODEL = 'eleven_v3';

interface SpeechOptions {
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
}

export class ElevenLabsTool {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate speech from text using TTS API
   */
  async generateSpeech(
    text: string,
    options: SpeechOptions = {}
  ): Promise<ToolResult<{ buffer: Buffer; duration: number }>> {
    const voiceId = options.voiceId || DEFAULT_VOICE_ID;
    const model = options.model || DEFAULT_MODEL;

    const url = `${BASE_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const body = {
      text,
      model_id: model,
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0,
        speed: options.speed ?? 1.0,
        use_speaker_boost: true,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `TTS failed: ${response.status} - ${error}` };
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Estimate duration (rough: ~15KB per second at 128kbps)
      const duration = buffer.length / 16000;

      return { success: true, data: { buffer, duration } };
    } catch (error) {
      return {
        success: false,
        error: `TTS request failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Transcribe audio to get word-level timing
   */
  async transcribe(
    audioBuffer: Buffer,
    language?: string
  ): Promise<ToolResult<TranscriptResult>> {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
    formData.append('model_id', 'scribe_v2');
    formData.append('tag_audio_events', 'false');

    if (language) {
      formData.append('language_code', language);
    }

    try {
      const response = await fetch(`${BASE_URL}/speech-to-text`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Transcription failed: ${response.status} - ${error}` };
      }

      const result = await response.json() as {
        text?: string;
        words?: Array<{ text?: string; word?: string; start: number; end: number }>;
        language_code?: string;
      };

      const words = (result.words || []).map((w) => ({
        word: w.text || w.word || '',
        start: w.start || 0,
        end: w.end || 0,
      }));

      const duration = words.length > 0 ? Math.max(...words.map((w) => w.end)) : 0;

      return {
        success: true,
        data: {
          text: result.text || '',
          words,
          duration,
          language: result.language_code || language || 'unknown',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Transcription request failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Generate background music with detailed composition
   */
  async generateMusic(
    composition: MusicComposition
  ): Promise<ToolResult<{ buffer: Buffer }>> {
    const body = {
      instrumental: composition.instrumental,
      duration_ms: composition.duration_ms,
      composition_plan: {
        positive_global_styles: composition.positive_global_styles,
        negative_global_styles: composition.negative_global_styles,
        sections: composition.sections,
      },
      output_format: 'mp3_44100_192',
    };

    try {
      const response = await fetch(`${BASE_URL}/music/detailed`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Music generation failed: ${response.status} - ${error}` };
      }

      // Handle multipart response
      const contentType = response.headers.get('content-type') || '';
      const arrayBuffer = await response.arrayBuffer();
      let audioBuffer = Buffer.from(arrayBuffer);

      if (contentType.includes('multipart')) {
        const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
        const boundary = boundaryMatch ? boundaryMatch[1] : null;

        if (boundary) {
          const bytes = new Uint8Array(arrayBuffer);
          const text = new TextDecoder('latin1').decode(bytes);
          const parts = text.split(`--${boundary}`);

          for (const part of parts) {
            if (part.includes('Content-Type: audio/') || part.includes('application/octet-stream')) {
              const headerEnd = part.indexOf('\r\n\r\n');
              if (headerEnd !== -1) {
                const body = part.substring(headerEnd + 4).replace(/\r\n$/, '');
                audioBuffer = Buffer.from(body, 'latin1');
                break;
              }
            }
          }
        }
      }

      return { success: true, data: { buffer: audioBuffer } };
    } catch (error) {
      return {
        success: false,
        error: `Music generation failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }
}

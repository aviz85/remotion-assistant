/**
 * FFmpeg Tool
 *
 * Audio processing using FFmpeg
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { ToolResult } from '../types/index.js';

interface MixOptions {
  speechVolume?: number;   // Default: 1.0
  musicVolume?: number;    // Default: 0.15
  fadeOutDuration?: number; // Default: 2 seconds
}

export class FFmpegTool {
  /**
   * Mix speech and music audio
   */
  async mixAudio(
    speechBuffer: Buffer,
    musicBuffer: Buffer,
    options: MixOptions = {}
  ): Promise<ToolResult<{ buffer: Buffer }>> {
    const speechVol = options.speechVolume ?? 1.0;
    const musicVol = options.musicVolume ?? 0.15;
    const fadeOut = options.fadeOutDuration ?? 2;

    // Write buffers to temp files
    const tempDir = tmpdir();
    const speechFile = join(tempDir, `speech-${Date.now()}.mp3`);
    const musicFile = join(tempDir, `music-${Date.now()}.mp3`);
    const outputFile = join(tempDir, `output-${Date.now()}.mp3`);

    try {
      writeFileSync(speechFile, speechBuffer);
      writeFileSync(musicFile, musicBuffer);

      // FFmpeg filter for mixing
      const filterComplex = [
        `[0:a]volume=${speechVol}[speech]`,
        `[1:a]volume=${musicVol}[music]`,
        `[speech][music]amix=inputs=2:duration=first:dropout_transition=${fadeOut}[out]`,
      ].join(';');

      await this.runFFmpeg([
        '-y',
        '-i', speechFile,
        '-i', musicFile,
        '-filter_complex', filterComplex,
        '-map', '[out]',
        '-c:a', 'libmp3lame',
        '-q:a', '2',
        outputFile,
      ]);

      const buffer = readFileSync(outputFile);

      return { success: true, data: { buffer } };
    } catch (error) {
      return {
        success: false,
        error: `Audio mixing failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    } finally {
      // Cleanup temp files
      this.safeUnlink(speechFile);
      this.safeUnlink(musicFile);
      this.safeUnlink(outputFile);
    }
  }

  /**
   * Get audio duration in seconds
   */
  async getAudioDuration(buffer: Buffer): Promise<ToolResult<{ duration: number }>> {
    const tempDir = tmpdir();
    const tempFile = join(tempDir, `audio-${Date.now()}.mp3`);

    try {
      writeFileSync(tempFile, buffer);

      const output = await this.runFFprobe([
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        tempFile,
      ]);

      const duration = parseFloat(output.trim());

      if (isNaN(duration)) {
        return { success: false, error: 'Failed to parse duration' };
      }

      return { success: true, data: { duration } };
    } catch (error) {
      return {
        success: false,
        error: `Duration check failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    } finally {
      this.safeUnlink(tempFile);
    }
  }

  /**
   * Run FFmpeg command
   */
  private runFFmpeg(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', args);

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stderr);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Run FFprobe command
   */
  private runFFprobe(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('ffprobe', args);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`FFprobe exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Safely unlink a file
   */
  private safeUnlink(path: string): void {
    try {
      unlinkSync(path);
    } catch {
      // Ignore errors
    }
  }
}

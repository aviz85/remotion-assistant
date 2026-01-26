/**
 * Image Generation Tool
 *
 * Wraps fal.ai and Gemini for AI image generation
 */

import { fal } from '@fal-ai/client';
import type { ToolResult } from '../types/index.js';

interface ImageOptions {
  provider?: 'gemini' | 'fal';
  aspectRatio?: '1:1' | '3:2' | '2:3' | '16:9' | '9:16';
  quality?: '1K' | '2K';
}

const ASPECT_TO_FAL_SIZE: Record<string, string> = {
  '1:1': 'square',
  '3:2': 'landscape_4_3',
  '2:3': 'portrait_4_3',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
};

export class ImageGenTool {
  private falKey: string;
  private geminiKey: string;

  constructor(falKey: string, geminiKey: string) {
    this.falKey = falKey;
    this.geminiKey = geminiKey;

    // Configure fal client
    fal.config({ credentials: falKey });
  }

  /**
   * Generate an image from a text prompt
   */
  async generate(
    prompt: string,
    options: ImageOptions = {}
  ): Promise<ToolResult<{ buffer: Buffer; url?: string }>> {
    const provider = options.provider || 'fal'; // Default to cheaper option

    if (provider === 'fal') {
      return this.generateWithFal(prompt, options);
    } else {
      return this.generateWithGemini(prompt, options);
    }
  }

  /**
   * Generate with fal.ai FLUX.2 klein 4B (cheap, fast)
   */
  private async generateWithFal(
    prompt: string,
    options: ImageOptions
  ): Promise<ToolResult<{ buffer: Buffer; url?: string }>> {
    const imageSize = ASPECT_TO_FAL_SIZE[options.aspectRatio || '3:2'] || 'landscape_4_3';

    try {
      const result = await fal.subscribe('fal-ai/flux-2/klein/4b', {
        input: {
          prompt,
          image_size: imageSize,
          num_inference_steps: 4,
          num_images: 1,
          output_format: 'jpeg',
        },
        logs: false,
      }) as { data?: { images?: Array<{ url: string }> } };

      if (!result.data?.images?.[0]?.url) {
        return { success: false, error: 'No image generated' };
      }

      const imageUrl = result.data.images[0].url;

      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return { success: false, error: `Failed to download image: ${response.status}` };
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      return { success: true, data: { buffer, url: imageUrl } };
    } catch (error) {
      return {
        success: false,
        error: `fal.ai generation failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Generate with Google Gemini (higher quality)
   */
  private async generateWithGemini(
    prompt: string,
    options: ImageOptions
  ): Promise<ToolResult<{ buffer: Buffer; url?: string }>> {
    // TODO: Implement Gemini image generation
    // For now, fall back to fal.ai
    console.warn('Gemini not implemented, using fal.ai');
    return this.generateWithFal(prompt, options);
  }
}

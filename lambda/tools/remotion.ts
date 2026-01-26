/**
 * Remotion Lambda Tool
 *
 * Trigger and monitor video rendering on Remotion Lambda
 */

import {
  renderMediaOnLambda,
  getRenderProgress,
  AwsRegion,
} from '@remotion/lambda-client';
import type { RenderParams, RenderResult, ToolResult } from '../types/index.js';

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds
const MAX_POLL_ATTEMPTS = 180; // Max 15 minutes

export class RemotionTool {
  private serveUrl: string;
  private functionName: string;
  private region: AwsRegion;

  constructor(serveUrl: string, functionName: string, region?: string) {
    this.serveUrl = serveUrl;
    this.functionName = functionName;
    this.region = (region || 'us-east-1') as AwsRegion;
  }

  /**
   * Render a video on Remotion Lambda
   */
  async renderVideo(params: RenderParams): Promise<ToolResult<RenderResult>> {
    try {
      const { renderId, bucketName } = await renderMediaOnLambda({
        region: this.region,
        functionName: this.functionName,
        serveUrl: this.serveUrl,
        composition: params.compositionId,
        inputProps: params.inputProps,
        codec: 'h264',
        imageFormat: 'jpeg',
        maxRetries: 3,
        privacy: 'public',
        downloadBehavior: {
          type: 'download',
          fileName: 'video.mp4',
        },
      });

      console.log(`Render started: ${renderId}`);

      // Wait for completion
      const outputUrl = await this.waitForRender(renderId, bucketName);

      return {
        success: true,
        data: {
          renderId,
          bucketName,
          outputFile: 'video.mp4',
          outputUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Render failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Poll for render completion
   */
  private async waitForRender(renderId: string, bucketName: string): Promise<string> {
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      const progress = await getRenderProgress({
        renderId,
        bucketName,
        functionName: this.functionName,
        region: this.region,
      });

      console.log(
        `Render progress: ${(progress.overallProgress * 100).toFixed(1)}%`
      );

      if (progress.done) {
        if (progress.outputFile) {
          return progress.outputFile;
        }
        throw new Error('Render completed but no output file');
      }

      if (progress.fatalErrorEncountered) {
        throw new Error(`Render failed: ${progress.errors?.[0]?.message || 'Unknown error'}`);
      }

      await this.sleep(POLL_INTERVAL_MS);
      attempts++;
    }

    throw new Error('Render timed out');
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

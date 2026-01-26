/**
 * S3 Tool
 *
 * Upload/download assets and generate presigned URLs
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ToolResult } from '../types/index.js';

const DEFAULT_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

export class S3Tool {
  private client: S3Client;
  private bucket: string;

  constructor(bucket: string, region?: string) {
    this.bucket = bucket;
    this.client = new S3Client({
      region: region || process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Upload a buffer to S3
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<ToolResult<{ url: string }>> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.client.send(command);

      const url = `s3://${this.bucket}/${key}`;
      return { success: true, data: { url } };
    } catch (error) {
      return {
        success: false,
        error: `S3 upload failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Download a file from S3 as buffer
   */
  async downloadBuffer(key: string): Promise<ToolResult<{ buffer: Buffer }>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        return { success: false, error: 'Empty response body' };
      }

      const chunks: Uint8Array[] = [];
      const stream = response.Body as AsyncIterable<Uint8Array>;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      return { success: true, data: { buffer } };
    } catch (error) {
      return {
        success: false,
        error: `S3 download failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Generate a presigned URL for downloading
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = DEFAULT_EXPIRY_SECONDS
  ): Promise<ToolResult<{ url: string }>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return { success: true, data: { url } };
    } catch (error) {
      return {
        success: false,
        error: `Presigned URL generation failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Delete an object from S3
   */
  async deleteObject(key: string): Promise<ToolResult<void>> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `S3 delete failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Generate a unique key for a file
   */
  static generateKey(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }
}

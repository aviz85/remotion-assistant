/**
 * AWS Secrets Manager utility
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import type { Secrets } from '../types/index.js';

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Cache for secrets (5 minute TTL)
const cache: Map<string, { value: Record<string, string>; expiry: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Get a secret from Secrets Manager with caching
 */
export async function getSecret(name: string): Promise<Record<string, string>> {
  const cached = cache.get(name);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  const command = new GetSecretValueCommand({ SecretId: name });
  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error(`Secret ${name} has no string value`);
  }

  const value = JSON.parse(response.SecretString);
  cache.set(name, { value, expiry: Date.now() + CACHE_TTL_MS });

  return value;
}

/**
 * Load all required secrets
 */
export async function loadSecrets(): Promise<Secrets> {
  const [elevenlabs, imageGen, remotion] = await Promise.all([
    getSecret('kinetic-agent/elevenlabs'),
    getSecret('kinetic-agent/image-gen'),
    getSecret('kinetic-agent/remotion'),
  ]);

  return {
    elevenlabs: {
      api_key: elevenlabs.api_key,
      voice_id: elevenlabs.voice_id,
    },
    imageGen: {
      gemini_key: imageGen.gemini_key,
      fal_key: imageGen.fal_key,
    },
    remotion: {
      access_key: remotion.access_key,
      secret_key: remotion.secret_key,
    },
  };
}

/**
 * Clear the secrets cache (for testing)
 */
export function clearCache(): void {
  cache.clear();
}

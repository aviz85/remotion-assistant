/**
 * Kinetic Video Agent Types
 */

// Request/Response types
export interface VideoRequest {
  topic: string;
  tone?: 'inspirational' | 'dramatic' | 'energetic' | 'calm';
  language?: 'hebrew' | 'english';
  format?: 'social' | 'professional' | 'auto';
}

export interface VideoResponse {
  success: boolean;
  video_url?: string;
  duration_seconds?: number;
  title?: string;
  error?: string;
  metadata?: VideoMetadata;
}

export interface VideoMetadata {
  generated_at: string;
  topic: string;
  tone: string;
  language: string;
  format: string;
  cost_estimate?: number;
}

// Word timing types (from transcription)
export interface WordTiming {
  word: string;
  start: number;
  end: number;
  tier?: 'hero' | 'strong' | 'normal';
  groupId?: number;
}

export interface TranscriptResult {
  text: string;
  words: WordTiming[];
  duration: number;
  language: string;
}

// Storyboard types
export interface StoryboardScene {
  sceneNumber: number;
  startTime: number;
  endTime: number;
  type: 'WORDS' | 'IMAGE';
  audioText: string;
  visualDescription: string;
  wordTiers?: Record<string, 'hero' | 'strong' | 'normal'>;
  imagePrompt?: string;
}

// Image scene types (for Remotion)
export interface ImageScene {
  name: string;
  image: string;      // S3 URL or staticFile path
  startTime: number;
  endTime: number;
  zoomStart: number;
  zoomEnd: number;
}

// Music composition types
export interface MusicSection {
  section_name: string;
  positive_local_styles: string[];
  negative_local_styles: string[];
  duration_ms: number;
  lines: string[];
}

export interface MusicComposition {
  duration_ms: number;
  instrumental: boolean;
  positive_global_styles: string[];
  negative_global_styles: string[];
  sections: MusicSection[];
}

// Remotion render types
export interface RenderParams {
  compositionId: string;
  inputProps: {
    wordTimings: WordTiming[];
    audioFile: string;
    imageScenes: ImageScene[];
    rtl?: boolean;
  };
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export interface RenderResult {
  renderId: string;
  bucketName: string;
  outputFile: string;
  outputUrl: string;
}

// Tool response types
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Agent configuration
export interface AgentConfig {
  outputBucket: string;
  remotionServeUrl: string;
  remotionFunctionName: string;
  region: string;
}

// Secrets structure
export interface Secrets {
  elevenlabs: {
    api_key: string;
    voice_id?: string;
  };
  imageGen: {
    gemini_key: string;
    fal_key: string;
  };
  remotion: {
    access_key: string;
    secret_key: string;
  };
}

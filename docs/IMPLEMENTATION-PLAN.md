# Kinetic Video Agent - Implementation Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AWS Lambda Function                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Claude Agent (via Bedrock)                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Agent Loop: Read → Plan → Execute → Verify                   │    │   │
│  │  │                                                               │    │   │
│  │  │ Tools:                                                        │    │   │
│  │  │ ├── ElevenLabsTool (TTS, Transcribe, Music)                  │    │   │
│  │  │ ├── ImageGenTool (Gemini/fal.ai)                             │    │   │
│  │  │ ├── FFmpegTool (audio mixing)                                │    │   │
│  │  │ ├── RemotionLambdaTool (video rendering)                     │    │   │
│  │  │ └── S3Tool (file storage)                                    │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌───────────┐     ┌───────────┐     ┌───────────┐
            │ ElevenLabs│     │ Gemini/   │     │ Remotion  │
            │   API     │     │  fal.ai   │     │  Lambda   │
            └───────────┘     └───────────┘     └───────────┘
                                                      │
                                                      ▼
                                              ┌───────────┐
                                              │    S3     │
                                              │  Output   │
                                              └───────────┘
                                                      │
                                                      ▼
                                              ┌───────────┐
                                              │ Presigned │
                                              │   URL     │
                                              └───────────┘
```

---

## Implementation Tasks

### Phase 1: Core Infrastructure (Tasks 1-5)

#### Task 1: Project Structure Setup
**Description:** Create Lambda project structure with TypeScript configuration

**Files to Create:**
```
lambda/
├── handler.ts              # Main Lambda handler
├── agent/
│   ├── kinetic-agent.ts    # Claude Agent SDK wrapper
│   └── prompts.ts          # System prompts and instructions
├── tools/
│   ├── elevenlabs.ts       # TTS, Transcribe, Music APIs
│   ├── image-gen.ts        # Gemini/fal.ai wrapper
│   ├── ffmpeg.ts           # Audio processing
│   ├── remotion.ts         # Remotion Lambda client
│   └── s3.ts               # S3 operations
├── types/
│   └── index.ts            # Shared TypeScript types
├── utils/
│   ├── secrets.ts          # AWS Secrets Manager
│   └── logger.ts           # CloudWatch logging
├── package.json
└── tsconfig.json
```

**Deliverables:**
- [ ] Initialize package.json with dependencies
- [ ] Configure TypeScript for Lambda
- [ ] Create directory structure
- [ ] Add ESLint/Prettier configuration

---

#### Task 2: Secrets Management Module
**Description:** Create utility for fetching secrets from AWS Secrets Manager

**File:** `lambda/utils/secrets.ts`

```typescript
interface Secrets {
  elevenlabs: { api_key: string };
  imageGen: { gemini_key: string; fal_key: string };
  remotion: { access_key: string; secret_key: string };
}

export async function getSecrets(): Promise<Secrets>;
export async function getSecret(name: string): Promise<Record<string, string>>;
```

**Deliverables:**
- [ ] Implement SecretsManager client
- [ ] Add caching (secrets valid for 5 minutes)
- [ ] Add error handling and retries
- [ ] Unit tests

---

#### Task 3: ElevenLabs Tool Implementation
**Description:** Wrap ElevenLabs APIs for TTS, transcription, and music generation

**File:** `lambda/tools/elevenlabs.ts`

```typescript
export class ElevenLabsTool {
  async generateSpeech(text: string, options?: SpeechOptions): Promise<Buffer>;
  async transcribe(audioBuffer: Buffer): Promise<TranscriptResult>;
  async generateMusic(composition: MusicComposition): Promise<Buffer>;
}

interface SpeechOptions {
  voiceId?: string;           // Default: aviz's voice
  model?: string;             // Default: eleven_v3
  stability?: number;
  similarityBoost?: number;
}

interface TranscriptResult {
  text: string;
  words: Array<{ word: string; start: number; end: number }>;
  duration: number;
}

interface MusicComposition {
  duration_ms: number;
  instrumental: boolean;
  positive_global_styles: string[];
  negative_global_styles: string[];
  sections: MusicSection[];
}
```

**Deliverables:**
- [ ] Implement TTS API (POST /v1/text-to-speech)
- [ ] Implement Scribe API (POST /v1/speech-to-text)
- [ ] Implement Music API (POST /v1/music/detailed)
- [ ] Handle multipart responses for music
- [ ] Add retry logic with exponential backoff
- [ ] Unit tests with mocked responses

---

#### Task 4: Image Generation Tool Implementation
**Description:** Wrap Gemini and fal.ai for image generation

**File:** `lambda/tools/image-gen.ts`

```typescript
export class ImageGenTool {
  async generate(prompt: string, options?: ImageOptions): Promise<Buffer>;
}

interface ImageOptions {
  provider?: 'gemini' | 'fal';  // Default: fal (cheaper)
  aspectRatio?: '1:1' | '3:2' | '2:3' | '16:9' | '9:16';
  quality?: '1K' | '2K';
}
```

**Deliverables:**
- [ ] Implement fal.ai FLUX.2 klein 4B client
- [ ] Implement Gemini image generation
- [ ] Add provider selection logic
- [ ] Handle image download from URL
- [ ] Unit tests

---

#### Task 5: FFmpeg Audio Processing Tool
**Description:** Wrapper for FFmpeg audio mixing operations

**File:** `lambda/tools/ffmpeg.ts`

```typescript
export class FFmpegTool {
  async mixAudio(
    speechBuffer: Buffer,
    musicBuffer: Buffer,
    options?: MixOptions
  ): Promise<Buffer>;

  async getAudioDuration(buffer: Buffer): Promise<number>;
}

interface MixOptions {
  speechVolume?: number;      // Default: 1.0
  musicVolume?: number;       // Default: 0.15
  fadeOutDuration?: number;   // Default: 2s
}
```

**Deliverables:**
- [ ] Implement ffmpeg spawn with Buffer I/O
- [ ] Add audio mixing with volume control
- [ ] Add fade-out for music
- [ ] Handle temp file cleanup
- [ ] Error handling for ffmpeg failures

---

### Phase 2: Remotion Integration (Tasks 6-8)

#### Task 6: Remotion Lambda Client
**Description:** Client for invoking Remotion Lambda rendering

**File:** `lambda/tools/remotion.ts`

```typescript
import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda-client';

export class RemotionTool {
  async renderVideo(params: RenderParams): Promise<RenderResult>;
  async waitForRender(renderId: string): Promise<string>;  // Returns S3 URL
}

interface RenderParams {
  compositionId: string;
  inputProps: {
    wordTimings: WordTiming[];
    audioFile: string;
    imageScenes: ImageScene[];
  };
  outputBucket: string;
}

interface RenderResult {
  renderId: string;
  bucketName: string;
  outputFile: string;
}
```

**Deliverables:**
- [ ] Implement renderMediaOnLambda wrapper
- [ ] Add progress polling with getRenderProgress
- [ ] Handle render failures and retries
- [ ] Return S3 presigned URL for output
- [ ] Integration test with actual Remotion Lambda

---

#### Task 7: Dynamic Composition Generator
**Description:** Generate Remotion composition code dynamically

**File:** `lambda/tools/composition-builder.ts`

```typescript
export class CompositionBuilder {
  buildWordTimings(
    transcript: TranscriptResult,
    storyboard: StoryboardScene[]
  ): WordTiming[];

  buildImageScenes(
    storyboard: StoryboardScene[],
    imageUrls: Map<string, string>
  ): ImageScene[];

  calculateDuration(wordTimings: WordTiming[]): number;
}
```

**Deliverables:**
- [ ] Parse transcript into WordTiming format
- [ ] Apply tier assignments from storyboard
- [ ] Build ImageScene array with S3 URLs
- [ ] Calculate total video duration
- [ ] Unit tests

---

#### Task 8: S3 Asset Management
**Description:** Upload/download assets to S3, generate presigned URLs

**File:** `lambda/tools/s3.ts`

```typescript
export class S3Tool {
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string>;
  async downloadBuffer(key: string): Promise<Buffer>;
  async getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
  async deleteObject(key: string): Promise<void>;
}
```

**Deliverables:**
- [ ] Implement upload with correct content types
- [ ] Implement download for intermediate files
- [ ] Generate presigned URLs (default 24h expiry)
- [ ] Add cleanup for temp files
- [ ] Unit tests

---

### Phase 3: Claude Agent Integration (Tasks 9-11)

#### Task 9: Agent System Prompt
**Description:** Define the system prompt and instructions for the Claude agent

**File:** `lambda/agent/prompts.ts`

```typescript
export const SYSTEM_PROMPT = `
You are a kinetic video creation agent. Your job is to create professional kinetic typography videos from a topic and tone.

## Your Capabilities

You have access to these tools:
1. **generate_speech** - Convert script text to speech audio
2. **transcribe_audio** - Get word-level timing from audio
3. **generate_music** - Create background music
4. **generate_image** - Create intercut images
5. **mix_audio** - Combine speech and music
6. **render_video** - Create final video with Remotion Lambda
7. **upload_to_s3** - Store files in S3

## Workflow

1. **Write Script** - Create emotionally compelling text (30-60 seconds)
2. **Create Storyboard** - Plan TEXT vs IMAGE scenes
3. **Generate Speech** - Use generate_speech tool
4. **Transcribe** - Get word timing with transcribe_audio
5. **Generate Images** - Create intercuts with generate_image
6. **Generate Music** - Create background with generate_music
7. **Mix Audio** - Combine speech + music with mix_audio
8. **Render** - Create video with render_video
9. **Return URL** - Provide download link

## Output Format

Return JSON:
{
  "video_url": "presigned S3 URL",
  "duration_seconds": number,
  "title": "video title"
}
`;

export const STORYBOARD_INSTRUCTIONS = `...`;
export const SCRIPT_TEMPLATES = {...};
```

**Deliverables:**
- [ ] Write comprehensive system prompt
- [ ] Define tool descriptions and schemas
- [ ] Add script writing guidelines
- [ ] Add storyboard creation rules
- [ ] Add Hebrew emotional directions reference

---

#### Task 10: Claude Agent SDK Integration
**Description:** Main agent implementation using Claude Agent SDK

**File:** `lambda/agent/kinetic-agent.ts`

```typescript
import { query, ClaudeAgentOptions } from 'claude-agent-sdk';

export class KineticAgent {
  private options: ClaudeAgentOptions;

  constructor(config: AgentConfig) {
    this.options = {
      permissionMode: 'bypassPermissions',
      allowedTools: [
        'generate_speech',
        'transcribe_audio',
        'generate_music',
        'generate_image',
        'mix_audio',
        'render_video',
        'upload_to_s3'
      ],
      mcpServers: {},  // No MCP servers needed
      hooks: {
        PostToolUse: [{ matcher: '.*', hooks: [this.logToolUse] }]
      }
    };
  }

  async createVideo(request: VideoRequest): Promise<VideoResult> {
    const prompt = this.buildPrompt(request);

    for await (const message of query({
      prompt,
      options: this.options
    })) {
      if ('result' in message) {
        return this.parseResult(message.result);
      }
    }
  }
}

interface VideoRequest {
  topic: string;
  tone: 'inspirational' | 'dramatic' | 'energetic' | 'calm';
  language: 'hebrew' | 'english';
  format?: 'social' | 'professional';
}

interface VideoResult {
  videoUrl: string;
  durationSeconds: number;
  title: string;
}
```

**Deliverables:**
- [ ] Implement agent wrapper class
- [ ] Register custom tools with agent
- [ ] Add logging hook for tool usage
- [ ] Parse final result from agent
- [ ] Handle agent errors gracefully
- [ ] Integration test

---

#### Task 11: Custom Tools Registration
**Description:** Register custom tools with Claude Agent SDK

**File:** `lambda/agent/tools-registry.ts`

```typescript
import { ToolDefinition } from 'claude-agent-sdk';

export const CUSTOM_TOOLS: ToolDefinition[] = [
  {
    name: 'generate_speech',
    description: 'Generate speech audio from text using ElevenLabs TTS',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to convert to speech' },
        voiceId: { type: 'string', description: 'Voice ID (optional)' }
      },
      required: ['text']
    },
    execute: async (input) => {
      const tool = new ElevenLabsTool();
      const buffer = await tool.generateSpeech(input.text, input);
      const s3 = new S3Tool();
      const url = await s3.uploadBuffer(buffer, `speech-${Date.now()}.mp3`, 'audio/mpeg');
      return { audio_url: url, duration: await getAudioDuration(buffer) };
    }
  },
  // ... more tools
];
```

**Deliverables:**
- [ ] Define all tool schemas (JSON Schema)
- [ ] Implement tool execution handlers
- [ ] Connect tools to underlying implementations
- [ ] Add validation for tool inputs
- [ ] Unit tests for each tool

---

### Phase 4: Lambda Handler (Tasks 12-14)

#### Task 12: Main Lambda Handler
**Description:** Lambda entry point that orchestrates the agent

**File:** `lambda/handler.ts`

```typescript
import { Handler, Context } from 'aws-lambda';
import { KineticAgent } from './agent/kinetic-agent';
import { loadSecrets } from './utils/secrets';
import { logger } from './utils/logger';

interface VideoRequest {
  topic: string;
  tone?: string;
  language?: string;
  format?: string;
}

interface VideoResponse {
  statusCode: number;
  body: string;
}

export const main: Handler<VideoRequest, VideoResponse> = async (
  event: VideoRequest,
  context: Context
): Promise<VideoResponse> => {
  logger.info('Received request', { event, requestId: context.awsRequestId });

  try {
    // Load secrets
    await loadSecrets();

    // Create agent
    const agent = new KineticAgent({
      topic: event.topic,
      tone: event.tone || 'inspirational',
      language: event.language || 'hebrew',
      format: event.format || 'auto'
    });

    // Run video generation
    const result = await agent.createVideo();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        video_url: result.videoUrl,
        duration: result.durationSeconds,
        title: result.title
      })
    };

  } catch (error) {
    logger.error('Video generation failed', { error });
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
```

**Deliverables:**
- [ ] Implement main handler function
- [ ] Add request validation
- [ ] Initialize secrets at cold start
- [ ] Proper error handling and responses
- [ ] CloudWatch logging integration
- [ ] Integration test

---

#### Task 13: Error Handling and Retries
**Description:** Robust error handling across the pipeline

**File:** `lambda/utils/retry.ts`

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>;

interface RetryOptions {
  maxRetries?: number;        // Default: 3
  backoffMs?: number;         // Default: 1000
  maxBackoffMs?: number;      // Default: 30000
  retryableErrors?: string[]; // Error types to retry
}

export class VideoGenerationError extends Error {
  constructor(
    message: string,
    public stage: string,
    public retryable: boolean
  ) {
    super(message);
  }
}
```

**Deliverables:**
- [ ] Implement retry logic with exponential backoff
- [ ] Define retryable vs non-retryable errors
- [ ] Add circuit breaker for external APIs
- [ ] Log all retry attempts
- [ ] Unit tests

---

#### Task 14: Response Format and Presigned URLs
**Description:** Format response with download URLs

**File:** `lambda/utils/response.ts`

```typescript
export interface VideoGenerationResponse {
  success: boolean;
  video_url: string;           // Presigned S3 URL (24h expiry)
  thumbnail_url?: string;      // First frame as image
  duration_seconds: number;
  title: string;
  metadata: {
    generated_at: string;
    topic: string;
    tone: string;
    language: string;
    cost_estimate?: number;
  };
}

export function formatResponse(result: AgentResult): VideoGenerationResponse;
export function formatError(error: Error): { success: false; error: string };
```

**Deliverables:**
- [ ] Define response schema
- [ ] Generate presigned URLs with 24h expiry
- [ ] Extract thumbnail from video (optional)
- [ ] Calculate cost estimate
- [ ] Unit tests

---

### Phase 5: Testing and Deployment (Tasks 15-17)

#### Task 15: Unit Tests
**Description:** Comprehensive unit tests for all modules

**Files:** `lambda/__tests__/`

**Test Coverage:**
- [ ] ElevenLabsTool tests (mocked API responses)
- [ ] ImageGenTool tests
- [ ] FFmpegTool tests
- [ ] RemotionTool tests
- [ ] S3Tool tests
- [ ] Agent tests (mocked SDK)
- [ ] Handler tests (mocked agent)

---

#### Task 16: Integration Tests
**Description:** End-to-end tests with actual services

**Files:** `lambda/__tests__/integration/`

**Tests:**
- [ ] ElevenLabs API integration
- [ ] Remotion Lambda rendering
- [ ] Full pipeline test (short video)
- [ ] Error recovery scenarios

---

#### Task 17: Deployment Pipeline
**Description:** CI/CD pipeline for Lambda deployment

**File:** `.github/workflows/deploy-lambda.yml`

```yaml
name: Deploy Kinetic Agent Lambda

on:
  push:
    branches: [main]
    paths:
      - 'lambda/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
      - name: Build and push Docker image
        run: |
          docker build -t kinetic-agent lambda/
          docker push $ECR_REPO/kinetic-agent:${{ github.sha }}
      - name: Update Lambda
        run: |
          aws lambda update-function-code \
            --function-name kinetic-video-agent \
            --image-uri $ECR_REPO/kinetic-agent:${{ github.sha }}
```

**Deliverables:**
- [ ] GitHub Actions workflow for testing
- [ ] Docker build and ECR push
- [ ] Lambda function update
- [ ] Rollback on failure
- [ ] Slack notification (optional)

---

## Dependencies Summary

### NPM Packages for Lambda

```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.0",
    "@aws-sdk/client-lambda": "^3.600.0",
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/client-secrets-manager": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "@remotion/lambda-client": "^4.0.407",
    "@fal-ai/client": "^1.0.0",
    "fluent-ffmpeg": "^2.1.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.0",
    "@types/fluent-ffmpeg": "^2.1.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "esbuild": "^0.23.0"
  }
}
```

---

## API Keys Required

| Service | Environment Variable | Required For |
|---------|---------------------|--------------|
| ElevenLabs | `ELEVENLABS_API_KEY` | TTS, Transcribe, Music |
| Gemini | `GEMINI_API_KEY` | Image generation (premium) |
| fal.ai | `FAL_KEY` | Image generation (cheap) |
| AWS | `AWS_*` | All AWS services |

---

## Estimated Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1: Infrastructure | 1-5 | 2-3 days |
| Phase 2: Remotion | 6-8 | 1-2 days |
| Phase 3: Agent | 9-11 | 2-3 days |
| Phase 4: Handler | 12-14 | 1-2 days |
| Phase 5: Testing | 15-17 | 2-3 days |
| **Total** | **17 tasks** | **8-13 days** |

---

## Success Criteria

1. **Functional:** Generate 30-60 second kinetic video from topic input
2. **Performance:** Complete generation in under 10 minutes
3. **Cost:** Under $0.50 per video
4. **Reliability:** 95%+ success rate
5. **Observability:** Full CloudWatch logs and metrics

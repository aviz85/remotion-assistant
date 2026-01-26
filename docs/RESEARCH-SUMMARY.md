# Kinetic Video Lambda Agent - Research Summary

## Executive Summary

Converting the kinetic-video-creator skill to an AWS Lambda agent using Claude on Bedrock is **feasible** with the following architecture:

- **Claude Agent SDK** running on Lambda with **Amazon Bedrock** for model inference
- **Custom tools** wrapping ElevenLabs, Gemini/fal.ai, FFmpeg, and Remotion Lambda
- **Remotion Lambda** for distributed video rendering
- **S3** for asset storage with presigned URLs for download

---

## Current Skill Analysis

### Kinetic Video Creator Workflow (11 Steps)

```
Input (Topic + Tone)
    ↓
1. Script Writing (Claude generates)
2. Storyboard Planning (TEXT vs IMAGE scenes)
3. Speech Generation (ElevenLabs TTS API)
4. Transcription (ElevenLabs Scribe v2 API)
5. Image Generation (fal.ai FLUX / Gemini)
6. Music Generation (ElevenLabs Music API)
7. Audio Mixing (FFmpeg)
8. Composition Creation (Remotion React)
9. Video Rendering (Remotion CLI → Lambda)
10. YouTube Upload (YouTube Data API v3)
11. WhatsApp Delivery (WAHA/Green API)
    ↓
Output (Video MP4 + YouTube URL + WhatsApp notification)
```

### For Lambda Agent (Simplified to 9 Steps)

Steps 10-11 (YouTube/WhatsApp) are optional for the Lambda version, which focuses on:
**Input → S3 Video URL with presigned download link**

---

## API Dependencies

### Required External APIs

| API | Provider | Endpoint | Cost Est. |
|-----|----------|----------|-----------|
| TTS | ElevenLabs | POST /v1/text-to-speech/{voice_id} | $0.02-0.05 |
| Transcribe | ElevenLabs | POST /v1/speech-to-text | Included |
| Music | ElevenLabs | POST /v1/music/detailed | $0.05-0.15 |
| Images | fal.ai | fal-ai/flux-2/klein/4b | $0.003/image |
| Images (alt) | Gemini | gemini-3-pro-image-preview | Higher |

### AWS Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Bedrock | Claude inference | Sonnet 4.5 + Haiku 4.5 |
| Lambda | Agent execution | Container image, 3GB RAM, 15min timeout |
| S3 | Asset storage | 2 buckets (Remotion + outputs) |
| ECR | Container registry | Docker image storage |
| Secrets Manager | API keys | Encrypted secret storage |
| CloudWatch | Logging | Metrics and logs |

---

## Claude Agent SDK on Bedrock

### Configuration

```bash
# Required environment variables
CLAUDE_CODE_USE_BEDROCK=1
AWS_REGION=us-east-1
CLAUDE_CODE_MAX_OUTPUT_TOKENS=4096
MAX_THINKING_TOKENS=1024
```

### Available Models

| Model | ID | Use Case |
|-------|----|----|
| Sonnet 4.5 | global.anthropic.claude-sonnet-4-5-20250929-v1:0 | Primary agent |
| Haiku 4.5 | us.anthropic.claude-haiku-4-5-20251001-v1:0 | Fast subtasks |

### SDK Features Used

- **query()** - Main agent loop
- **Custom tools** - ElevenLabs, ImageGen, FFmpeg, Remotion, S3
- **bypassPermissions mode** - Autonomous execution
- **Hooks** - PostToolUse for logging

---

## Remotion Lambda

### Current Setup

- **Version:** 4.0.407 (already installed)
- **Package:** @remotion/lambda (full feature set)
- **Compositions:** 43 ready-to-render compositions

### Lambda Rendering Flow

```
1. deploySite() → Upload bundle to S3
2. deployFunction() → Create Lambda function
3. renderMediaOnLambda() → Trigger distributed render
4. getRenderProgress() → Poll for completion
5. Download from S3 → Return presigned URL
```

### Key Parameters

| Setting | Value | Notes |
|---------|-------|-------|
| Memory | 2048 MB | Per function instance |
| Concurrency | Up to 200 | Per render |
| Timeout | 240s | Per chunk |
| Architecture | arm64 | Cost-effective |

---

## Container Image Requirements

### Base Image
- `public.ecr.aws/lambda/nodejs:20` (AL2023-based)

### Required System Dependencies
- **FFmpeg** - Audio mixing
- **Claude Code CLI** - Agent SDK runtime

### Image Size
- Estimated: ~500-700 MB
- Within Lambda container limit (10 GB)

---

## Cost Analysis (Per Video)

| Component | Low Est. | High Est. |
|-----------|----------|-----------|
| Bedrock (Sonnet) | $0.03 | $0.15 |
| Bedrock (Haiku) | $0.01 | $0.02 |
| ElevenLabs TTS | $0.02 | $0.05 |
| ElevenLabs Music | $0.05 | $0.15 |
| fal.ai Images (4x) | $0.01 | $0.02 |
| Remotion Lambda | $0.03 | $0.10 |
| S3 Storage | $0.00 | $0.01 |
| Lambda Execution | $0.02 | $0.05 |
| **Total** | **$0.17** | **$0.55** |

---

## Architecture Decisions

### 1. Agent vs. Direct API Calls
**Decision:** Use Claude Agent SDK with custom tools

**Rationale:**
- Agent can make intelligent decisions (script writing, storyboard planning)
- Self-healing when steps fail
- Extensible for future capabilities
- Matches existing skill behavior

### 2. Container Image vs. ZIP Deployment
**Decision:** Container image

**Rationale:**
- FFmpeg binary requires ~50MB (exceeds layer limit)
- Claude Code CLI needs system dependencies
- Easier local testing with Docker
- More control over environment

### 3. Synchronous vs. Asynchronous
**Decision:** Synchronous (single Lambda, 15min timeout)

**Rationale:**
- Full video < 10 minutes typically
- Simpler architecture
- Easier error handling
- Can switch to Step Functions if needed later

### 4. Tool Implementation
**Decision:** Custom tools wrapping HTTP APIs

**Rationale:**
- MCP servers add complexity
- Direct API calls are simpler for Lambda
- Full control over retry logic
- No external MCP process management

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lambda timeout | Medium | High | Increase timeout, optimize renders |
| API rate limits | Low | Medium | Add retry with backoff |
| High costs | Low | Medium | Monitor usage, add limits |
| Cold start latency | Medium | Low | Use provisioned concurrency |
| Render failures | Medium | High | Retry logic, fallback quality |

---

## Implementation Priority

### Must Have (MVP)
1. Core agent with Bedrock
2. ElevenLabs TTS integration
3. Transcription and timing
4. Remotion Lambda rendering
5. S3 output with presigned URL

### Should Have
6. Music generation
7. Image intercuts
8. Audio mixing
9. Error recovery

### Nice to Have
10. YouTube upload
11. WhatsApp delivery
12. Progress webhooks
13. Cost tracking dashboard

---

## Sources

- [Claude Code on Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Remotion Lambda Setup](https://www.remotion.dev/docs/lambda/setup)
- [Remotion Lambda Docs](https://www.remotion.dev/docs/lambda)
- [AWS Lambda Container Images](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-image.html)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

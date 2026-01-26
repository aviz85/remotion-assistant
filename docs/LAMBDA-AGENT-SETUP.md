# Kinetic Video Agent - AWS Lambda + Bedrock Setup Guide

## Overview

This guide covers setting up a serverless kinetic video generation agent that:
- Runs Claude Agent SDK on AWS Lambda
- Uses Amazon Bedrock for Claude model inference
- Orchestrates full video pipeline: script → TTS → transcribe → images → music → render
- Uses Remotion Lambda for distributed video rendering
- Saves output to S3 with presigned download URL

---

## Prerequisites Checklist

### 1. AWS Account Setup

```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1 recommended)
```

### 2. Enable Amazon Bedrock Models

1. Go to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to **Model access** → **Manage model access**
3. Enable these Anthropic models:
   - Claude Sonnet 4.5 (primary model)
   - Claude Haiku 4.5 (fast model for subagents)
4. Submit use case details (required for first-time users)

### 3. Required API Keys

You need API keys for external services:

| Service | Key Name | Get From |
|---------|----------|----------|
| ElevenLabs | `ELEVENLABS_API_KEY` | https://elevenlabs.io/app/settings/api-keys |
| Google Gemini | `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| fal.ai | `FAL_KEY` | https://fal.ai/dashboard/keys |

**Optional (for distribution):**
| Service | Keys | Get From |
|---------|------|----------|
| YouTube | `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` | Google Cloud Console |
| WhatsApp | `GREEN_API_*` | https://green-api.com |

---

## AWS Infrastructure Setup

### Step 1: Create IAM Policy for Bedrock

Create policy `kinetic-agent-bedrock-policy`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockModelAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:inference-profile/*",
        "arn:aws:bedrock:*:*:application-inference-profile/*",
        "arn:aws:bedrock:*:*:foundation-model/*"
      ]
    }
  ]
}
```

### Step 2: Create IAM Policy for Remotion Lambda

Run this command to generate the policy:

```bash
cd /Users/aviz/remotion-assistant
npx remotion lambda policies role
```

Create policy `remotion-lambda-policy` with the output JSON.

### Step 3: Create IAM Policy for S3

Create policy `kinetic-agent-s3-policy`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::kinetic-videos-*",
        "arn:aws:s3:::kinetic-videos-*/*",
        "arn:aws:s3:::remotionlambda-*",
        "arn:aws:s3:::remotionlambda-*/*"
      ]
    }
  ]
}
```

### Step 4: Create Lambda Execution Role

Create role `kinetic-agent-lambda-role`:

1. Go to IAM → Roles → Create role
2. Use case: Lambda
3. Attach policies:
   - `kinetic-agent-bedrock-policy`
   - `remotion-lambda-policy`
   - `kinetic-agent-s3-policy`
   - `AWSLambdaBasicExecutionRole` (AWS managed)

### Step 5: Create S3 Bucket for Outputs

```bash
# Create bucket (replace ACCOUNT_ID and REGION)
aws s3 mb s3://kinetic-videos-ACCOUNT_ID --region us-east-1

# Set lifecycle policy (auto-delete after 7 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket kinetic-videos-ACCOUNT_ID \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "AutoDelete7Days",
      "Status": "Enabled",
      "Expiration": {"Days": 7},
      "Filter": {"Prefix": ""}
    }]
  }'
```

---

## Remotion Lambda Deployment

### Step 1: Configure Remotion AWS Credentials

Create `.env` in project root:

```env
REMOTION_AWS_ACCESS_KEY_ID=your-access-key
REMOTION_AWS_SECRET_ACCESS_KEY=your-secret-key
REMOTION_AWS_REGION=us-east-1
```

### Step 2: Deploy Remotion Lambda Function

```bash
cd /Users/aviz/remotion-assistant

# Deploy the Lambda function
npx remotion lambda functions deploy

# Note the function name (e.g., remotion-render-4-0-407-arm64-2048mb)
```

### Step 3: Deploy Remotion Site (Bundle)

```bash
# Deploy your compositions to S3
npx remotion lambda sites create src/index.ts --site-name=kinetic-videos

# Note the serve URL (e.g., https://remotionlambda-xxx.s3.amazonaws.com/sites/kinetic-videos/...)
```

### Step 4: Verify Deployment

```bash
# Check Lambda function
npx remotion lambda functions ls

# Check site deployment
npx remotion lambda sites ls

# Check quotas (important for parallel renders)
npx remotion lambda quotas
```

---

## Claude Agent SDK Setup

### Python Installation

```bash
# Install Claude Code CLI (required runtime)
curl -fsSL https://claude.ai/install.sh | bash

# Install Agent SDK
pip install claude-agent-sdk

# Or with Poetry/uv
poetry add claude-agent-sdk
uv add claude-agent-sdk
```

### TypeScript Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

### Environment Variables for Bedrock

```bash
# Required for Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Recommended token settings
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=4096
export MAX_THINKING_TOKENS=1024

# Optional: Specific model versions
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-5-20250929-v1:0'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

---

## Secrets Management

### AWS Secrets Manager Setup

Store API keys securely:

```bash
# Create secret for ElevenLabs
aws secretsmanager create-secret \
  --name kinetic-agent/elevenlabs \
  --secret-string '{"api_key":"sk_xxx"}'

# Create secret for image generation
aws secretsmanager create-secret \
  --name kinetic-agent/image-gen \
  --secret-string '{"gemini_key":"xxx","fal_key":"xxx"}'

# Create secret for Remotion
aws secretsmanager create-secret \
  --name kinetic-agent/remotion \
  --secret-string '{"access_key":"xxx","secret_key":"xxx"}'
```

### Lambda IAM Policy for Secrets

Add to `kinetic-agent-lambda-role`:

```json
{
  "Sid": "SecretsAccess",
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": [
    "arn:aws:secretsmanager:*:*:secret:kinetic-agent/*"
  ]
}
```

---

## Container Image Build

The Lambda function requires a custom container with:
- Node.js 20+ runtime
- FFmpeg for audio processing
- Claude Code CLI
- All NPM dependencies

### Dockerfile

```dockerfile
# Base: AWS Lambda Node.js 20
FROM public.ecr.aws/lambda/nodejs:20

# Install FFmpeg
RUN dnf install -y ffmpeg && dnf clean all

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY lambda/ ./lambda/

# Build TypeScript
RUN npm run build:lambda

# Set handler
CMD [ "lambda/handler.main" ]
```

### Build and Push

```bash
# Create ECR repository
aws ecr create-repository --repository-name kinetic-agent

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t kinetic-agent .

# Tag and push
docker tag kinetic-agent:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/kinetic-agent:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/kinetic-agent:latest
```

---

## Lambda Function Configuration

### Create Lambda Function

```bash
aws lambda create-function \
  --function-name kinetic-video-agent \
  --package-type Image \
  --code ImageUri=ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/kinetic-agent:latest \
  --role arn:aws:iam::ACCOUNT_ID:role/kinetic-agent-lambda-role \
  --timeout 900 \
  --memory-size 3008 \
  --ephemeral-storage Size=10240 \
  --environment Variables="{
    CLAUDE_CODE_USE_BEDROCK=1,
    AWS_REGION=us-east-1,
    REMOTION_SERVE_URL=https://remotionlambda-xxx.s3.amazonaws.com/sites/kinetic-videos/...,
    REMOTION_FUNCTION_NAME=remotion-render-4-0-407-arm64-2048mb,
    OUTPUT_BUCKET=kinetic-videos-ACCOUNT_ID
  }"
```

### Configuration Notes

| Setting | Value | Reason |
|---------|-------|--------|
| Timeout | 900s (15 min) | Video generation takes 5-10 minutes |
| Memory | 3008 MB | Claude agent + FFmpeg needs headroom |
| Ephemeral Storage | 10 GB | Temp files for audio/video processing |
| Architecture | arm64 | Better price-performance |

---

## API Gateway Setup (Optional)

For HTTP endpoint access:

```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name kinetic-video-api \
  --protocol-type HTTP

# Create integration
aws apigatewayv2 create-integration \
  --api-id API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:ACCOUNT_ID:function:kinetic-video-agent \
  --payload-format-version 2.0

# Create route
aws apigatewayv2 create-route \
  --api-id API_ID \
  --route-key "POST /generate" \
  --target integrations/INTEGRATION_ID

# Deploy
aws apigatewayv2 create-deployment --api-id API_ID
```

---

## Testing

### Local Test

```bash
# Set environment
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Run agent locally
cd /Users/aviz/remotion-assistant
npx ts-node lambda/test-local.ts
```

### Lambda Test

```bash
aws lambda invoke \
  --function-name kinetic-video-agent \
  --payload '{"topic":"birthday message","tone":"inspirational","language":"hebrew"}' \
  --cli-binary-format raw-in-base64-out \
  response.json

cat response.json
```

---

## Cost Estimates

| Component | Est. Cost per Video |
|-----------|---------------------|
| Bedrock (Claude Sonnet) | $0.05-0.15 |
| Bedrock (Claude Haiku) | $0.01-0.02 |
| ElevenLabs TTS | $0.02-0.05 |
| ElevenLabs Music | $0.05-0.15 |
| fal.ai Images (3-5 images) | $0.01-0.02 |
| Remotion Lambda | $0.03-0.10 |
| S3 Storage | ~$0.01 |
| **Total** | **$0.20-0.50** |

---

## Troubleshooting

### Bedrock Access Denied

```
Error: User not authorized to perform bedrock:InvokeModel
```

**Fix:** Ensure IAM role has `bedrock:InvokeModel` permission and model access is enabled in Bedrock console.

### Remotion Lambda Timeout

```
Error: Function timed out
```

**Fix:** Increase `framesPerLambda` to reduce parallel functions, or request quota increase.

### Container Image Too Large

**Fix:** Use multi-stage build, exclude dev dependencies, use slim base image.

### FFmpeg Not Found

**Fix:** Ensure FFmpeg is installed in container and in PATH.

---

## Next Steps

1. Review `docs/IMPLEMENTATION-PLAN.md` for code implementation
2. Deploy infrastructure using provided commands
3. Test with sample video generation
4. Set up monitoring with CloudWatch

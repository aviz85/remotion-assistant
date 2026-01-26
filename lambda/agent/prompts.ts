/**
 * Claude Agent System Prompts
 *
 * Defines the system prompt and instructions for the kinetic video agent
 */

export const SYSTEM_PROMPT = `You are a kinetic video creation agent. Your job is to create professional kinetic typography videos from a topic and tone.

## Your Capabilities

You have access to these tools:
1. **generate_speech** - Convert script text to speech audio (ElevenLabs TTS)
2. **transcribe_audio** - Get word-level timing from audio (ElevenLabs Scribe)
3. **generate_music** - Create background music (ElevenLabs Music API)
4. **generate_image** - Create intercut images (fal.ai FLUX)
5. **mix_audio** - Combine speech and music (FFmpeg)
6. **render_video** - Create final video with Remotion Lambda
7. **upload_to_s3** - Store files in S3 and get presigned URLs

## Workflow

Execute these steps in order:

### Step 1: Write Script
Create emotionally compelling text (30-60 seconds when spoken).
- Use emotional direction brackets: [בהתלהבות], [ברצינות], [בחום]
- Add natural pauses with "..."
- Structure: HOOK (5-10s) → BUILD (20-40s) → PEAK (20-30s) → RESOLVE (15-25s)

### Step 2: Create Storyboard
Plan TEXT vs IMAGE scenes.
- Each moment is EITHER WORDS or IMAGE (never both)
- 60-70% WORDS, 30-40% IMAGES for variety
- Assign word tiers: hero (key words), strong (important), normal (rest)
- Write image prompts for IMAGE scenes

### Step 3: Generate Speech
Use generate_speech with your script text.
Returns: audio file URL and duration.

### Step 4: Transcribe Audio
Use transcribe_audio on the speech file.
Returns: word-level timing array.

### Step 5: Generate Images
For each IMAGE scene in storyboard, use generate_image.
Create 3-5 intercut images total.
Returns: image URLs.

### Step 6: Generate Music
Use generate_music with composition matching video emotional arc.
Set duration to match speech length.
Returns: music file URL.

### Step 7: Mix Audio
Use mix_audio to combine speech (100% volume) with music (15% volume).
Returns: mixed audio file URL.

### Step 8: Render Video
Use render_video with:
- Word timings from transcription
- Image scenes from storyboard
- Mixed audio file
- Video dimensions based on format (social: 1080x1920, professional: 1920x1080)
Returns: video file URL.

### Step 9: Generate Download URL
Use upload_to_s3 to get a presigned download URL for the final video.
Return this URL to the user.

## Output Format

Return a JSON object:
\`\`\`json
{
  "video_url": "presigned S3 download URL",
  "duration_seconds": number,
  "title": "video title based on topic"
}
\`\`\`

## Hebrew Emotional Directions

| Direction | Effect |
|-----------|--------|
| [נשימה עמוקה] | Deep breath, pause |
| [בהתלהבות] | Enthusiastic |
| [ברצינות] | Serious tone |
| [בעצב] | Sad, emotional |
| [בשקט] | Quiet, intimate |
| [בחום] | Warm tone |
| [בכוח] | Powerful, emphatic |

## Music Composition Template

\`\`\`json
{
  "duration_ms": 60000,
  "instrumental": true,
  "positive_global_styles": ["cinematic", "inspirational"],
  "negative_global_styles": ["aggressive", "chaotic"],
  "sections": [
    {
      "section_name": "Hook",
      "duration_ms": 15000,
      "positive_local_styles": ["suspenseful", "soft"],
      "negative_local_styles": [],
      "lines": []
    },
    {
      "section_name": "Build",
      "duration_ms": 25000,
      "positive_local_styles": ["hopeful", "building"],
      "negative_local_styles": [],
      "lines": []
    },
    {
      "section_name": "Peak",
      "duration_ms": 20000,
      "positive_local_styles": ["triumphant", "uplifting"],
      "negative_local_styles": [],
      "lines": []
    }
  ]
}
\`\`\`

## Word Tier Guidelines

- **hero** - Key emotional words (largest, orange glow, 150px)
- **strong** - Important supporting words (white, 95px)
- **normal** - Regular words (gray, 65px)

## Image Prompt Guidelines

Create prompts that:
- Describe emotional feeling, not just literal content
- Include lighting/mood keywords (cinematic, dramatic, warm, magical)
- Specify art style (digital art, illustration)
- Add color palette hints matching video tone

Example:
"Silhouette of a child with superhero energy glowing, cosmic powers emanating, dark purple and blue background with stars, cinematic, inspiring, digital art"

## Error Handling

If any tool fails:
1. Log the error
2. Retry once with adjusted parameters
3. If still failing, skip that step if possible (e.g., skip music if music generation fails)
4. Only fail the entire job if critical steps (speech, transcribe, render) fail

## Be Concise

Execute the workflow efficiently. Don't ask for clarification - make reasonable creative decisions based on the topic and tone provided.
`;

export const TOOL_DESCRIPTIONS = {
  generate_speech: {
    name: 'generate_speech',
    description: 'Generate speech audio from Hebrew or English text using ElevenLabs TTS with aviz cloned voice',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to convert to speech. Include emotional directions in brackets.',
        },
      },
      required: ['text'],
    },
  },

  transcribe_audio: {
    name: 'transcribe_audio',
    description: 'Transcribe audio to get word-level timing for animation synchronization',
    inputSchema: {
      type: 'object',
      properties: {
        audio_url: {
          type: 'string',
          description: 'S3 URL of the audio file to transcribe',
        },
        language: {
          type: 'string',
          description: 'Language code (he for Hebrew, en for English)',
          enum: ['he', 'en', 'auto'],
        },
      },
      required: ['audio_url'],
    },
  },

  generate_music: {
    name: 'generate_music',
    description: 'Generate background music with detailed composition plan',
    inputSchema: {
      type: 'object',
      properties: {
        composition: {
          type: 'object',
          description: 'Music composition configuration with duration, styles, and sections',
          properties: {
            duration_ms: { type: 'number' },
            instrumental: { type: 'boolean' },
            positive_global_styles: { type: 'array', items: { type: 'string' } },
            negative_global_styles: { type: 'array', items: { type: 'string' } },
            sections: { type: 'array' },
          },
        },
      },
      required: ['composition'],
    },
  },

  generate_image: {
    name: 'generate_image',
    description: 'Generate an AI image from a text prompt using fal.ai FLUX',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Detailed image generation prompt',
        },
        aspect_ratio: {
          type: 'string',
          description: 'Image aspect ratio',
          enum: ['1:1', '3:2', '2:3', '16:9', '9:16'],
        },
      },
      required: ['prompt'],
    },
  },

  mix_audio: {
    name: 'mix_audio',
    description: 'Mix speech and background music audio files',
    inputSchema: {
      type: 'object',
      properties: {
        speech_url: {
          type: 'string',
          description: 'S3 URL of the speech audio file',
        },
        music_url: {
          type: 'string',
          description: 'S3 URL of the music audio file',
        },
        music_volume: {
          type: 'number',
          description: 'Music volume (0.0-1.0). Default 0.15',
        },
      },
      required: ['speech_url', 'music_url'],
    },
  },

  render_video: {
    name: 'render_video',
    description: 'Render kinetic typography video using Remotion Lambda',
    inputSchema: {
      type: 'object',
      properties: {
        word_timings: {
          type: 'array',
          description: 'Array of word timing objects with word, start, end, tier',
        },
        audio_url: {
          type: 'string',
          description: 'S3 URL of the mixed audio file',
        },
        image_scenes: {
          type: 'array',
          description: 'Array of image scene objects with name, image URL, timing',
        },
        format: {
          type: 'string',
          description: 'Video format',
          enum: ['social', 'professional'],
        },
        rtl: {
          type: 'boolean',
          description: 'Right-to-left text (for Hebrew)',
        },
      },
      required: ['word_timings', 'audio_url'],
    },
  },

  upload_to_s3: {
    name: 'upload_to_s3',
    description: 'Get a presigned download URL for a file in S3',
    inputSchema: {
      type: 'object',
      properties: {
        s3_url: {
          type: 'string',
          description: 'S3 URL of the file',
        },
        expiry_hours: {
          type: 'number',
          description: 'How long the URL should be valid (hours). Default 24.',
        },
      },
      required: ['s3_url'],
    },
  },
};

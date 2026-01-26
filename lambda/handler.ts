/**
 * Kinetic Video Agent Lambda Handler
 *
 * Full pipeline: script → TTS → transcribe → images → music → mix → render → S3
 */

import type { Handler, Context } from 'aws-lambda';
import type {
  VideoRequest,
  VideoResponse,
  AgentConfig,
  WordTiming,
  MusicComposition,
} from './types/index.js';
import { loadSecrets } from './utils/secrets.js';
import { ElevenLabsTool } from './tools/elevenlabs.js';
import { ImageGenTool } from './tools/image-gen.js';
import { S3Tool } from './tools/s3.js';
import { FFmpegTool } from './tools/ffmpeg.js';
import { RemotionTool } from './tools/remotion.js';

// Environment configuration
const config: AgentConfig = {
  outputBucket: process.env.OUTPUT_BUCKET || 'kinetic-videos-158554992985',
  remotionServeUrl: process.env.REMOTION_SERVE_URL || '',
  remotionFunctionName: process.env.REMOTION_FUNCTION_NAME || 'remotion-render-4-0-407-mem2048mb-disk2048mb-120sec',
  region: process.env.AWS_REGION || 'us-east-1',
};

// Script templates by tone
const SCRIPT_TEMPLATES: Record<string, (topic: string) => string> = {
  inspirational: (topic) => `
[נשימה עמוקה] יש משהו... שאתה צריך לדעת על ${topic}.

[ברצינות] כולם חושבים שהם יודעים. אבל האמת? האמת היא משהו אחר לגמרי.

[בהתלהבות] תראה, ${topic} זה לא סתם עוד דבר. זה הזדמנות. הזדמנות שרוב האנשים פשוט... מפספסים.

[בשקט] אני יודע מה אתה חושב. "זה לא בשבילי." "אני לא מספיק טוב." אבל תקשיב...

[בכוח] אתה יותר חזק ממה שאתה חושב! יש לך את הכוח לעשות את זה!

[בחום] אז קח את הצעד הראשון. היום. עכשיו. כי ${topic}? זה מחכה רק לך.
`.trim(),

  dramatic: (topic) => `
[בשקט] הם אמרו שזה בלתי אפשרי...

[ברצינות] ש${topic} זה חלום שלא יתגשם. שצריך להיות מציאותיים.

[בהדרגה] אבל יש אנשים... אנשים שלא מקשיבים ל"בלתי אפשרי".

[בכוח] שקמים כל בוקר ונלחמים! שלא מוותרים!

[בהתלהבות] והם? הם משנים את העולם! הם מוכיחים שהכל אפשרי!

[בחום] השאלה היא... האם אתה אחד מהם?
`.trim(),

  energetic: (topic) => `
[בהתלהבות] יאללה! בוא נדבר על ${topic}!

[מהר] אתה יודע מה? אני לא מבין למה אנשים מסבכים את זה. זה פשוט!

[בכוח] תעשה את זה! אל תחשוב יותר מדי! פשוט קפוץ למים!

[בהתלהבות] כי ${topic}? זה הדבר הכי מגניב שאתה יכול לעשות היום!

[צחוק קל] באמת, מה יש לך להפסיד? כלום!

[בכוח] אז קדימה! התחל עכשיו! GO GO GO!
`.trim(),

  calm: (topic) => `
[בשקט] קח רגע... נשום עמוק...

[בחום] ${topic} זה מסע. לא ספרינט. מסע ארוך ויפה.

[לאט] אין צורך למהר. אין צורך ללחץ. כל צעד קטן... מקרב אותך למטרה.

[בשקט] והדבר היפה? אתה לא צריך להיות מושלם. רק צריך להתחיל.

[בחום] אז קח את הזמן שלך. תהנה מהדרך. כי ${topic}? זה שווה כל רגע.
`.trim(),
};

// Music compositions by tone
const MUSIC_COMPOSITIONS: Record<string, (durationMs: number) => MusicComposition> = {
  inspirational: (durationMs) => ({
    duration_ms: durationMs,
    instrumental: true,
    positive_global_styles: ['cinematic', 'inspirational', 'orchestral'],
    negative_global_styles: ['aggressive', 'dark', 'heavy'],
    sections: [
      {
        section_name: 'Intro',
        duration_ms: Math.floor(durationMs * 0.2),
        positive_local_styles: ['soft', 'building', 'hopeful'],
        negative_local_styles: [],
        lines: [],
      },
      {
        section_name: 'Build',
        duration_ms: Math.floor(durationMs * 0.5),
        positive_local_styles: ['emotional', 'rising', 'powerful'],
        negative_local_styles: [],
        lines: [],
      },
      {
        section_name: 'Peak',
        duration_ms: Math.floor(durationMs * 0.3),
        positive_local_styles: ['triumphant', 'uplifting', 'epic'],
        negative_local_styles: [],
        lines: [],
      },
    ],
  }),

  dramatic: (durationMs) => ({
    duration_ms: durationMs,
    instrumental: true,
    positive_global_styles: ['cinematic', 'dramatic', 'orchestral'],
    negative_global_styles: ['happy', 'upbeat', 'electronic'],
    sections: [
      {
        section_name: 'Tension',
        duration_ms: Math.floor(durationMs * 0.3),
        positive_local_styles: ['suspenseful', 'dark', 'building'],
        negative_local_styles: [],
        lines: [],
      },
      {
        section_name: 'Conflict',
        duration_ms: Math.floor(durationMs * 0.4),
        positive_local_styles: ['intense', 'powerful', 'emotional'],
        negative_local_styles: [],
        lines: [],
      },
      {
        section_name: 'Resolution',
        duration_ms: Math.floor(durationMs * 0.3),
        positive_local_styles: ['hopeful', 'triumphant'],
        negative_local_styles: [],
        lines: [],
      },
    ],
  }),

  energetic: (durationMs) => ({
    duration_ms: durationMs,
    instrumental: true,
    positive_global_styles: ['upbeat', 'energetic', 'driving'],
    negative_global_styles: ['slow', 'melancholic', 'ambient'],
    sections: [
      {
        section_name: 'Drop',
        duration_ms: durationMs,
        positive_local_styles: ['pumping', 'exciting', 'powerful'],
        negative_local_styles: [],
        lines: [],
      },
    ],
  }),

  calm: (durationMs) => ({
    duration_ms: durationMs,
    instrumental: true,
    positive_global_styles: ['ambient', 'peaceful', 'piano'],
    negative_global_styles: ['loud', 'aggressive', 'fast'],
    sections: [
      {
        section_name: 'Flow',
        duration_ms: durationMs,
        positive_local_styles: ['gentle', 'meditative', 'warm'],
        negative_local_styles: [],
        lines: [],
      },
    ],
  }),
};

/**
 * Lambda handler for video generation requests
 */
export const main: Handler<VideoRequest, VideoResponse> = async (
  event: VideoRequest,
  context: Context
): Promise<VideoResponse> => {
  const startTime = Date.now();
  const jobId = context.awsRequestId.slice(0, 8);

  console.log('=== Kinetic Video Agent ===');
  console.log('Job ID:', jobId);
  console.log('Input:', JSON.stringify(event, null, 2));

  // Validate request
  if (!event.topic) {
    return { success: false, error: 'Missing required field: topic' };
  }

  const tone = event.tone || 'inspirational';
  const language = event.language || 'hebrew';
  const format = event.format || 'social';

  try {
    // Step 1: Load secrets
    console.log('[1/8] Loading secrets...');
    const secrets = await loadSecrets();

    // Initialize tools
    const elevenlabs = new ElevenLabsTool(secrets.elevenlabs.api_key);
    const imageGen = new ImageGenTool(secrets.imageGen.fal_key, secrets.imageGen.gemini_key);
    const s3 = new S3Tool(config.outputBucket, config.region);
    const ffmpeg = new FFmpegTool();
    const remotion = new RemotionTool(
      config.remotionServeUrl,
      config.remotionFunctionName,
      config.region
    );

    // Step 2: Generate script
    console.log('[2/8] Generating script...');
    const scriptTemplate = SCRIPT_TEMPLATES[tone] || SCRIPT_TEMPLATES.inspirational;
    const script = scriptTemplate(event.topic);
    console.log('Script length:', script.length, 'chars');

    // Step 3: Generate speech
    console.log('[3/8] Generating speech...');
    const speechResult = await elevenlabs.generateSpeech(script, {
      voiceId: secrets.elevenlabs.voice_id,
    });
    if (!speechResult.success) {
      throw new Error(`TTS failed: ${speechResult.error}`);
    }
    const speechBuffer = speechResult.data!.buffer;
    console.log('Speech generated:', (speechBuffer.length / 1024).toFixed(1), 'KB');

    // Upload speech to S3
    const speechKey = S3Tool.generateKey(`jobs/${jobId}`, 'mp3');
    await s3.uploadBuffer(speechBuffer, speechKey, 'audio/mpeg');

    // Step 4: Transcribe for word timing
    console.log('[4/8] Transcribing...');
    const transcriptResult = await elevenlabs.transcribe(speechBuffer, language === 'hebrew' ? 'he' : 'en');
    if (!transcriptResult.success) {
      throw new Error(`Transcription failed: ${transcriptResult.error}`);
    }
    const transcript = transcriptResult.data!;
    console.log('Transcribed:', transcript.words.length, 'words,', transcript.duration.toFixed(1), 's');

    // Assign tiers to words
    const wordTimings: WordTiming[] = assignWordTiers(transcript.words, tone);

    // Step 5: Generate images (2-3 intercuts)
    console.log('[5/8] Generating images...');
    const imagePrompts = [
      `${event.topic} concept, cinematic lighting, digital art, motivational, ${tone} mood`,
      `Abstract ${tone} energy, rays of light, hope, digital art style`,
    ];
    const aspectRatio = format === 'social' ? '9:16' : '16:9';

    const imageBuffers: Buffer[] = [];
    for (const prompt of imagePrompts) {
      const imgResult = await imageGen.generate(prompt, { aspectRatio: aspectRatio as any });
      if (imgResult.success && imgResult.data) {
        imageBuffers.push(imgResult.data.buffer);
      }
    }
    console.log('Generated', imageBuffers.length, 'images');

    // Upload images to S3
    const imageUrls: string[] = [];
    for (let i = 0; i < imageBuffers.length; i++) {
      const imgKey = S3Tool.generateKey(`jobs/${jobId}`, 'jpg');
      await s3.uploadBuffer(imageBuffers[i], imgKey, 'image/jpeg');
      // Get public URL for Remotion
      const presignResult = await s3.getPresignedUrl(imgKey, 3600); // 1 hour for rendering
      if (presignResult.success) {
        imageUrls.push(presignResult.data!.url);
      }
    }

    // Step 6: Generate music
    console.log('[6/8] Generating music...');
    const musicDurationMs = Math.ceil(transcript.duration * 1000) + 2000; // Add 2s buffer
    const musicComposition = MUSIC_COMPOSITIONS[tone]?.(musicDurationMs) || MUSIC_COMPOSITIONS.inspirational(musicDurationMs);

    const musicResult = await elevenlabs.generateMusic(musicComposition);
    let musicBuffer: Buffer | null = null;
    if (musicResult.success && musicResult.data) {
      musicBuffer = musicResult.data.buffer;
      console.log('Music generated:', (musicBuffer.length / 1024).toFixed(1), 'KB');
    } else {
      console.warn('Music generation failed, continuing without music:', musicResult.error);
    }

    // Step 7: Mix audio
    console.log('[7/8] Mixing audio...');
    let finalAudioBuffer = speechBuffer;
    if (musicBuffer) {
      const mixResult = await ffmpeg.mixAudio(speechBuffer, musicBuffer, {
        speechVolume: 1.0,
        musicVolume: 0.15,
      });
      if (mixResult.success && mixResult.data) {
        finalAudioBuffer = mixResult.data.buffer;
        console.log('Mixed audio:', (finalAudioBuffer.length / 1024).toFixed(1), 'KB');
      } else {
        console.warn('Audio mixing failed, using speech only:', mixResult.error);
      }
    }

    // Upload final audio to S3
    const audioKey = S3Tool.generateKey(`jobs/${jobId}`, 'mp3');
    await s3.uploadBuffer(finalAudioBuffer, audioKey, 'audio/mpeg');
    const audioPresignResult = await s3.getPresignedUrl(audioKey, 3600);
    const audioUrl = audioPresignResult.success ? audioPresignResult.data!.url : '';

    // Step 8: Render video with Remotion Lambda
    console.log('[8/8] Rendering video...');
    const fps = 30;
    const durationInFrames = Math.ceil(transcript.duration * fps) + 60; // Add 2s buffer
    const [width, height] = format === 'social' ? [1080, 1920] : [1920, 1080];

    // Build image scenes
    const imageScenes = imageUrls.map((url, i) => {
      const sceneDuration = 3; // 3 seconds per image
      const startTime = transcript.duration * (0.3 + i * 0.3); // Spread throughout
      return {
        name: `intercut-${i + 1}`,
        image: url,
        startTime,
        endTime: startTime + sceneDuration,
        zoomStart: 1.0,
        zoomEnd: 1.1,
      };
    });

    const renderResult = await remotion.renderVideo({
      compositionId: 'KineticSpeech', // Use existing composition
      inputProps: {
        wordTimings,
        audioFile: audioUrl,
        imageScenes,
        rtl: language === 'hebrew',
      },
      durationInFrames,
      fps,
      width,
      height,
    });

    if (!renderResult.success) {
      throw new Error(`Render failed: ${renderResult.error}`);
    }

    // Get presigned URL for the final video
    const videoKey = `videos/${jobId}/video.mp4`;
    // Copy from Remotion bucket to our bucket (or use Remotion's URL directly)
    const videoUrl = renderResult.data!.outputUrl;

    const duration = (Date.now() - startTime) / 1000;
    console.log(`=== Completed in ${duration.toFixed(1)}s ===`);

    return {
      success: true,
      video_url: videoUrl,
      duration_seconds: transcript.duration,
      title: `${event.topic} - Kinetic Video`,
      metadata: {
        generated_at: new Date().toISOString(),
        topic: event.topic,
        tone,
        language,
        format,
        cost_estimate: estimateCost(transcript.duration, imageBuffers.length),
      },
    };
  } catch (error) {
    console.error('Video generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Assign tiers to words based on position and content
 */
function assignWordTiers(words: WordTiming[], tone: string): WordTiming[] {
  const heroKeywords = ['חזק', 'כוח', 'אפשר', 'הצלחה', 'אמת', 'לב', 'חלום', 'היום', 'עכשיו'];

  return words.map((word, index) => {
    let tier: 'hero' | 'strong' | 'normal' = 'normal';

    // Hero: Keywords or every ~15th word for emphasis
    if (heroKeywords.some((kw) => word.word.includes(kw)) || index % 15 === 0) {
      tier = 'hero';
    }
    // Strong: Punctuation-adjacent or every ~5th word
    else if (word.word.includes('!') || word.word.includes('?') || index % 5 === 0) {
      tier = 'strong';
    }

    return { ...word, tier };
  });
}

/**
 * Estimate generation cost
 */
function estimateCost(durationSeconds: number, imageCount: number): number {
  const ttsCost = durationSeconds * 0.0003; // ~$0.02/minute
  const transcribeCost = 0.01;
  const musicCost = 0.1;
  const imageCost = imageCount * 0.003;
  const remotionCost = 0.05;

  return Math.round((ttsCost + transcribeCost + musicCost + imageCost + remotionCost) * 100) / 100;
}

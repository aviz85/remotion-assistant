# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
npm run dev       # Studio at http://localhost:3000
npm run render    # Render video
npx remotion render [CompositionId] out/video.mp4
npx remotion render [CompositionId] out/video.mp4 --props='{"text":"Hello"}'
npx remotion compositions src/index.tsx  # List compositions
```

## Architecture

### Core Templates (src/templates/)

**MultiWordComposition.tsx** - Primary template for word cloud videos
- Groups words on screen using shelf-packing layout
- VFX: dust particles, light beams, center glow, background pulse
- Color schemes cycle per screen, entrance styles: pop/slide/fade/glitch
- Props: `wordTimings[]`, `audioFile`, font sizes, VFX controls

**SequenceComposition.tsx** - Single word at a time
- One word fills screen per timestamp
- Classic kinetic typography style

**WordCloudLayout.ts** - Layout engine
- Uses `@remotion/layout-utils` for accurate text measurement
- `detectGroups()` - Groups words by gap threshold
- `layoutWordCloud()` - Bin-packs words on shelves
- `computeAllScreens()` - Pre-computes all layouts for a video

### Word Timing Data

Compositions expect `WordTiming[]`:
```typescript
interface WordTiming {
  word: string;
  start: number;  // seconds
  end: number;
}
```

Generate from audio via transcription → JSON output.

### Creating New Compositions

1. Import word timings (usually from JSON file in `public/`)
2. Define `durationInFrames` based on audio length
3. Pass to `MultiWordComposition` or build custom
4. Register in `Root.tsx` within appropriate `<Folder>`

### Zod Schemas

Use zod schemas for compositions with studio-editable props (sliders):
```tsx
const schema = z.object({
  heroFontSize: z.number().min(50).max(400).default(140),
});
<Composition schema={schema} defaultProps={{...}} />
```

## Skills (Invoke with /skill-name)

| Skill | Use Case |
|-------|----------|
| `/remotion-render` | Core rendering commands |
| `/kinetic-video-creator` | Full workflow: script → TTS → transcribe → animate → music → render |
| `/text-video` | Kinetic typography, text reveals |
| `/social-video` | Instagram, TikTok, YouTube formats |
| `/video-effects` | Transitions and visual effects |
| `/remotion-best-practices` | Official patterns for audio, video, fonts, timing |

## Key Patterns

### Animation
```tsx
// Spring
const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });

// Interpolate with clamp
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

// Staggered delay
items.map((item, i) => {
  const delay = i * 10;
  const opacity = interpolate(frame - delay, [0, 20], [0, 1]);
});
```

### Audio in Remotion
- Files MUST be in `public/` folder
- Use `staticFile()`: `<Audio src={staticFile("audio.mp3")} />`

### Rendering
```bash
# With merged audio (speech + music)
ffmpeg -y -i speech.mp3 -i music.mp3 \
  -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=0.15[music];[speech][music]amix=inputs=2[out]" \
  -map "[out]" final.mp3

# Then render
npx remotion render CompositionId out/video.mp4
```

## Folder Organization

- `src/compositions/` - Video compositions (one file per video type)
- `src/templates/` - Reusable composition templates and layout algorithms
- `public/` - Audio files, images, static assets (required for `staticFile()`)
- `out/` - Rendered output
- `projects/` - Learning/experiment docs

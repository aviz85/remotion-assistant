---
name: audiogram
description: "Create audio visualization videos. Use for: podcast audiograms, music visualizations, waveform videos, audio-reactive content."
---

# Audiogram Generator

Create audio visualization videos with waveforms and metadata.

## Available Compositions

- **Audiogram** - Waveform visualization with title/subtitle

## Quick Generate

```bash
# Basic audiogram
npx remotion render Audiogram out/podcast.mp4

# Custom styling
npx remotion render Audiogram out/episode.mp4 \
  --props='{"title":"Episode 42","subtitle":"The Future of AI","waveColor":"#ff6b6b"}'
```

## Audiogram Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Main title |
| subtitle | string | optional | Episode/show subtitle |
| waveColor | string | "#00d4ff" | Waveform bar color |
| backgroundColor | string | "#0f0f23" | Background color |

## Adding Real Audio

To sync with actual audio:

1. Add audio file to `public/audio/`:
```
public/audio/episode.mp3
```

2. Import and use audio data:
```tsx
import { Audio, staticFile } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

// Install: npm install @remotion/media-utils

const audioSrc = staticFile("audio/episode.mp3");

// Get visualization data
const audioData = useAudioData(audioSrc);
if (!audioData) return null;

const visualization = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 64,
});

// Use visualization values (0-1) for bar heights
```

3. Add Audio component:
```tsx
<Audio src={staticFile("audio/episode.mp3")} />
```

## Waveform Styles

### Bar visualization (default)
```tsx
{bars.map((height, i) => (
  <div style={{ height: `${height * 100}%` }} />
))}
```

### Circular visualization
```tsx
{bars.map((height, i) => {
  const angle = (i / bars.length) * Math.PI * 2;
  const radius = 100 + height * 50;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return <circle cx={x} cy={y} r={height * 10} />;
})}
```

### Line wave
```tsx
const points = bars.map((h, i) =>
  `${i * spacing},${centerY - h * amplitude}`
).join(" ");
<polyline points={points} />
```

## Duration Calculation

Match video duration to audio:
```tsx
import { getAudioDurationInSeconds } from "@remotion/media-utils";

// In calculateMetadata:
const duration = await getAudioDurationInSeconds(staticFile("audio/file.mp3"));
return {
  durationInFrames: Math.ceil(duration * fps),
};
```

See [../video-common/references/animations.md](../video-common/references/animations.md) for animation patterns.

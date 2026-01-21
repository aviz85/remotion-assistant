---
name: text-video
description: "Create text animation videos with Remotion. Use for: kinetic typography, text reveals, quote videos, title sequences, lyric videos."
---

# Text Video Generator

Create animated text videos with various effects.

## Available Compositions

- **TextReveal** - Word-by-word reveal animation

## Quick Generate

```bash
# Default text reveal
npx remotion render TextReveal out/text.mp4

# Custom text
npx remotion render TextReveal out/custom.mp4 \
  --props='{"text":"Your Custom Message","fontSize":120,"color":"#00ff88"}'
```

## TextReveal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | required | Text to animate |
| fontSize | number | 80 | Font size in px |
| color | string | "#ffffff" | Text color |
| backgroundColor | string | "#1a1a2e" | Background |

## Creating New Text Compositions

1. Create component in `src/compositions/`:

```tsx
import { useCurrentFrame, spring, interpolate } from "remotion";

export const MyTextEffect: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();

  // Character-by-character animation
  return (
    <div>
      {text.split("").map((char, i) => {
        const delay = i * 3;
        const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return <span style={{ opacity }}>{char}</span>;
      })}
    </div>
  );
};
```

2. Register in `src/Root.tsx`:

```tsx
<Composition
  id="MyTextEffect"
  component={MyTextEffect}
  durationInFrames={120}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ text: "Hello" }}
/>
```

## Text Animation Patterns

### Typewriter
```tsx
const visibleChars = Math.floor(frame / 3);
const displayText = text.slice(0, visibleChars);
```

### Word-by-word reveal
```tsx
const words = text.split(" ");
words.map((word, i) => {
  const delay = i * 10;
  const opacity = interpolate(frame - delay, [0, 15], [0, 1]);
  return <span style={{ opacity }}>{word} </span>;
});
```

### Scale bounce per word
```tsx
const scale = spring({ frame: frame - delay, fps, config: { damping: 8 } });
```

See [../video-common/references/animations.md](../video-common/references/animations.md) for more patterns.

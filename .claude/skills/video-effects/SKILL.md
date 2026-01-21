---
name: video-effects
description: "Apply transitions and effects to Remotion videos. Use for: scene transitions, fade effects, slide animations, zoom effects, visual effects."
---

# Video Effects & Transitions

Add professional transitions and effects to your videos.

## Install Transitions Package

```bash
npm install @remotion/transitions
```

## Built-in Transitions

### Fade
```tsx
import { fade } from "@remotion/transitions/fade";
import { TransitionSeries } from "@remotion/transitions";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Slide
```tsx
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={springTiming({ config: { damping: 200 } })}
/>
```

Directions: `from-left`, `from-right`, `from-top`, `from-bottom`

### Wipe
```tsx
import { wipe } from "@remotion/transitions/wipe";

<TransitionSeries.Transition
  presentation={wipe({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>
```

## Manual Effects

### Fade In/Out
```tsx
const fadeIn = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});

const fadeOut = interpolate(frame, [duration - 30, duration], [1, 0], {
  extrapolateLeft: "clamp",
});

const opacity = Math.min(fadeIn, fadeOut);
```

### Zoom
```tsx
const scale = interpolate(frame, [0, 60], [1, 1.2], {
  extrapolateRight: "clamp",
});

<div style={{ transform: `scale(${scale})` }}>
```

### Pan (Ken Burns)
```tsx
const x = interpolate(frame, [0, duration], [0, -100]);
const scale = interpolate(frame, [0, duration], [1, 1.3]);

<Img
  src={staticFile("image.jpg")}
  style={{
    transform: `translateX(${x}px) scale(${scale})`,
  }}
/>
```

### Blur
```tsx
const blur = interpolate(frame, [0, 30], [10, 0]);

<div style={{ filter: `blur(${blur}px)` }}>
```

### Color Overlay
```tsx
const overlayOpacity = interpolate(frame, [0, 30, 60, 90], [1, 0, 0, 1]);

<AbsoluteFill>
  <Content />
  <AbsoluteFill
    style={{
      backgroundColor: "#000",
      opacity: overlayOpacity,
    }}
  />
</AbsoluteFill>
```

## Timing Functions

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

// Linear (constant speed)
linearTiming({ durationInFrames: 30 })

// Spring (bouncy)
springTiming({
  config: { damping: 200 }, // No bounce
})

springTiming({
  config: { damping: 10, stiffness: 100 }, // Bouncy
})
```

## Easing Options

```tsx
import { Easing } from "remotion";

interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease
  easing: Easing.inOut(Easing.ease),          // Ease in-out
  easing: Easing.bounce,                       // Bounce
  easing: Easing.elastic(1),                   // Elastic
});
```

See [../video-common/references/animations.md](../video-common/references/animations.md) for more patterns.

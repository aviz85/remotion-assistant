---
name: countdown-timer
description: "Create countdown/timer videos with Remotion. Use for: countdown animations, progress rings, timers, numeric reveals."
---

# Countdown Timer Videos

Create animated countdowns with progress rings and effects.

## Quick Use

```bash
npx remotion render Countdown out/countdown.mp4 --props='{"from":10}'
```

## Key Patterns

### Frame-Based Timing
```tsx
const framesPerNumber = fps; // 1 second per number
const currentNumber = from - Math.floor(frame / framesPerNumber);
const frameInSecond = frame % framesPerNumber;
```

### SVG Progress Ring
```tsx
const circumference = 2 * Math.PI * radius;
const progress = frameInSecond / framesPerNumber;
const strokeDashoffset = circumference * (1 - progress);

<circle
  r={radius}
  strokeDasharray={circumference}
  strokeDashoffset={strokeDashoffset}
/>
```

### State Detection
```tsx
const isGo = currentNumber <= 0;
const displayText = isGo ? "GO!" : currentNumber.toString();
```

### Pulse Effect
```tsx
const pulse = Math.sin((frameInSecond / fps) * Math.PI * 2) * 0.05 + 1;
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| from | number | Start number |
| backgroundColor | string | Background color |
| numberColor | string | Number color |
| ringColor | string | Ring/accent color |

## Composition: `Countdown`

See [../video-common/references/animations.md](../video-common/references/animations.md) for animation patterns.

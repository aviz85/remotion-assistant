---
name: particle-effects
description: "Create particle animation videos. Use for: particle text, dust effects, assembly animations, dispersion effects."
---

# Particle Effect Videos

Create particle-based animations and text effects.

## Quick Use

```bash
npx remotion render ParticleText out/particles.mp4 --props='{"text":"HELLO"}'
```

## Key Patterns

### Dot-Matrix Text Pattern
```tsx
const patterns: Record<string, number[][]> = {
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
};

// Generate particle positions from pattern
pattern.forEach((row, rowIndex) => {
  row.forEach((dot, colIndex) => {
    if (dot === 1) {
      particles.push({
        targetX: startX + colIndex * spacing,
        targetY: startY + rowIndex * spacing,
      });
    }
  });
});
```

### Random Radial Start Position
```tsx
import { random } from "remotion";

// Deterministic random (same on every render)
const angle = random(`angle-${index}`) * Math.PI * 2;
const dist = 300 + random(`dist-${index}`) * 400;

const startX = centerX + Math.cos(angle) * dist;
const startY = centerY + Math.sin(angle) * dist;
```

### Three-Phase Animation
```tsx
// Phase 1: Converge (0-60)
if (frame < 60) {
  const progress = interpolate(frame, [0, 50], [0, 1]);
  x = interpolate(progress, [0, 1], [startX, targetX]);
}
// Phase 2: Hold (60-120)
else if (frame < 120) {
  x = targetX;
}
// Phase 3: Disperse (120-180)
else {
  const progress = interpolate(frame - 120, [0, 40], [0, 1]);
  x = interpolate(progress, [0, 1], [targetX, endX]);
}
```

### Per-Particle Delay (Organic Feel)
```tsx
const particleDelay = (index % 20) * 0.5;

const particleProgress = interpolate(
  frame - particleDelay,
  [0, 50],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

### Particle Glow
```tsx
const glowPulse = Math.sin(frame * 0.15) * 5 + 15;

<div style={{
  width: size,
  height: size,
  borderRadius: "50%",
  backgroundColor: color,
  boxShadow: `0 0 ${glowPulse}px ${color}`,
}}/>
```

### Fade In/Out
```tsx
// Fade in during converge
const opacity = frame < 120
  ? interpolate(progress, [0, 0.3, 1], [0, 1, 1])
  : interpolate(disperseProgress, [0, 0.5, 1], [1, 1, 0]);
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| text | string | Text to form |
| particleColor | string | Particle color |
| backgroundColor | string | Background |

## Compositions: `ParticleText`

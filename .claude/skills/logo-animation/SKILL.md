---
name: logo-animation
description: "Create logo reveal animations. Use for: logo intros, brand reveals, SVG animations, shape drawing effects."
---

# Logo Animation Videos

Create professional logo reveal animations.

## Quick Use

```bash
npx remotion render LogoReveal out/logo.mp4 --props='{"brandName":"ACME"}'
```

## Key Patterns

### SVG Stroke Drawing
```tsx
// Calculate path length
const circumference = 2 * Math.PI * radius; // circle
const perimeter = side * 3; // triangle

// Animate dashoffset
const progress = interpolate(frame, [start, end], [0, 1]);
const dashoffset = circumference * (1 - progress);

<circle
  strokeDasharray={circumference}
  strokeDashoffset={dashoffset}
  strokeLinecap="round"
/>
```

### Staggered Shape Drawing
```tsx
// Shape 1: frames 0-40
const shape1Progress = interpolate(frame, [0, 40], [0, 1]);

// Shape 2: frames 15-55 (overlapping)
const shape2Progress = interpolate(frame, [15, 55], [0, 1]);

// Shape 3: frames 30-70
const shape3Progress = interpolate(frame, [30, 70], [0, 1]);
```

### Assembly Animation
```tsx
const assemblySpring = spring({
  frame: frame - 60, // Start assembly at frame 60
  fps,
  config: { damping: 15, stiffness: 80 },
});

const shapeX = interpolate(assemblySpring, [0, 1], [startX, centerX]);
```

### Particle Burst
```tsx
const particles = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const progress = interpolate(frame - delay, [0, 30], [0, 1]);
  const distance = interpolate(progress, [0, 1], [0, 200]);
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0]);

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    opacity,
  };
});
```

### Glow Effect
```tsx
<svg style={{ filter: `drop-shadow(0 0 ${glowIntensity}px ${color})` }}>
```

## Animation Phases
1. **0-60**: Shapes draw in (stroke animation)
2. **60-90**: Shapes assemble (move to final position)
3. **90-120**: Text reveals
4. **120-150**: Final glow

## Compositions: `LogoReveal`

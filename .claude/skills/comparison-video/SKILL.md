---
name: comparison-video
description: "Create before/after comparison videos. Use for: split screens, product comparisons, transformations, A/B reveals."
---

# Comparison Videos

Create split-screen before/after comparisons.

## Quick Use

```bash
npx remotion render SplitScreen out/comparison.mp4 \
  --props='{"leftLabel":"Before","rightLabel":"After"}'
```

## Key Patterns

### Clip-Path Reveal
```tsx
// Left side (reveals from left)
const leftReveal = interpolate(frame, [0, 40], [0, 50]);
clipPath: `polygon(0 0, ${leftReveal}% 0, ${leftReveal}% 100%, 0 100%)`

// Right side (reveals from right)
const rightReveal = interpolate(frame, [70, 110], [100, 50]);
clipPath: `polygon(${rightReveal}% 0, 100% 0, 100% 100%, ${rightReveal}% 100%)`
```

### Animated Divider
```tsx
const dividerX = interpolate(frame, [40, 70], [0, 50]);

<div style={{
  position: "absolute",
  left: `${dividerX}%`,
  width: 4,
  height: "100%",
  backgroundColor: color,
}}/>
```

### Pulsing Glow
```tsx
const glowPulse = Math.sin(frame * 0.1) * 5 + 15;

style={{
  boxShadow: `0 0 ${glowPulse}px ${color}, 0 0 ${glowPulse * 2}px ${color}`,
}}
```

### Divider Handle
```tsx
<div style={{
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 50,
  height: 50,
  borderRadius: "50%",
  backgroundColor: color,
}}>
  {/* Arrow icons */}
</div>
```

## Animation Phases
1. **0-40**: Left side reveals
2. **40-70**: Divider animates to center
3. **70-110**: Right side reveals
4. **110-150**: Labels appear

## Props
| Prop | Type | Description |
|------|------|-------------|
| leftLabel | string | Left side label |
| rightLabel | string | Right side label |
| leftContent | string | Left content text |
| rightContent | string | Right content text |
| dividerColor | string | Divider/accent color |

## Compositions: `SplitScreen`

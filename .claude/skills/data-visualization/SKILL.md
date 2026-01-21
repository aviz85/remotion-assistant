---
name: data-visualization
description: "Create animated data/stats videos. Use for: statistics, dashboards, progress bars, number counters, infographics."
---

# Data Visualization Videos

Create animated statistics and data displays.

## Quick Use

```bash
npx remotion render AnimatedStats out/stats.mp4
```

## Key Patterns

### Number Counting Animation
```tsx
const countProgress = interpolate(frame - delay, [0, 45], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

const displayValue = Math.floor(targetValue * countProgress);

// With formatting
{displayValue.toLocaleString()}{suffix}
```

### Progress Bar Fill
```tsx
const barProgress = interpolate(frame - delay, [15, 60], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<div style={{
  width: `${targetPercent * barProgress}%`,
  height: "100%",
  backgroundColor: color,
}}/>
```

### Staggered Card Entrance
```tsx
stats.map((stat, index) => {
  const delay = 15 + index * 15; // 15, 30, 45, 60...

  const cardSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  return (
    <div style={{
      transform: `translateY(${cardY}px)`,
      opacity: cardOpacity,
    }}>
      {/* Card content */}
    </div>
  );
});
```

### Bar Fill with Glow
```tsx
<div style={{
  backgroundColor: color,
  boxShadow: `0 0 10px ${color}50`,
}}/>
```

## Data Structure
```tsx
interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  color: string;
}
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| title | string | Main title |
| stats | StatItem[] | Array of stat items |

## Compositions: `AnimatedStats`

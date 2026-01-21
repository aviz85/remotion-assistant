# Remotion Assistant

Video generation project using Remotion (React-based video framework).

## Quick Start

```bash
npm run dev       # Open studio (http://localhost:3000)
npm run render    # Render video
```

## Skills (Invoke with /skill-name)

| Skill | Use Case |
|-------|----------|
| `/remotion-render` | Core rendering commands |
| `/text-video` | Kinetic typography, text reveals |
| `/social-video` | Instagram, TikTok, YouTube formats |
| `/audiogram` | Podcast/music visualizations |
| `/video-effects` | Transitions and visual effects |
| `/countdown-timer` | Countdowns, progress rings |
| `/carousel-slides` | Multi-slide carousels, quotes |
| `/logo-animation` | Logo reveals, SVG drawing |
| `/comparison-video` | Before/after split screens |
| `/data-visualization` | Stats, numbers, progress bars |
| `/particle-effects` | Particle text, assembly effects |

## Available Compositions

### Text Animations
- `TextReveal` - Word-by-word reveal
- `QuoteCarousel` - Multi-quote carousel
- `ParticleText` - Text from particles

### Social Media
- `SocialPost-Square` (1080x1080)
- `SocialPost-Story` (1080x1920)
- `SocialPost-Landscape` (1920x1080)

### Data & Stats
- `AnimatedStats` - Number counting, progress bars

### Comparisons
- `SplitScreen` - Before/after with divider

### Branding
- `LogoReveal` - SVG shape animations

### Timers
- `Countdown` - Numeric countdown with ring

### Audio
- `Audiogram` - Waveform visualization

## Project Structure

```
src/
├── Root.tsx              # Composition registry
├── compositions/         # Video compositions
│   ├── HelloWorld.tsx
│   ├── TextReveal.tsx
│   ├── QuoteCarousel.tsx
│   ├── ParticleText.tsx
│   ├── SocialPost.tsx
│   ├── SplitScreen.tsx
│   ├── LogoReveal.tsx
│   ├── Countdown.tsx
│   ├── AnimatedStats.tsx
│   └── Audiogram.tsx
└── components/           # Reusable components

projects/                 # Learning/experiment docs
├── 01-countdown/
├── 02-quote-carousel/
├── 03-logo-reveal/
├── 04-split-screen/
├── 05-animated-stats/
└── 06-particle-text/

public/                   # Static assets
out/                      # Rendered output
```

## Common Commands

```bash
# List compositions
npx remotion compositions src/index.tsx

# Render specific composition
npx remotion render HelloWorld out/hello.mp4

# Render with custom props
npx remotion render TextReveal out/text.mp4 --props='{"text":"Hello"}'

# Preview render (half size)
npx remotion render HelloWorld out/preview.mp4 --scale=0.5
```

## Key Animation Patterns

### Spring
```tsx
const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
```

### Interpolate
```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
```

### Staggered Delay
```tsx
items.map((item, i) => {
  const delay = i * 10;
  const opacity = interpolate(frame - delay, [0, 20], [0, 1]);
});
```

See skills for detailed patterns per video type.

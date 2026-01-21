---
name: carousel-slides
description: "Create multi-slide carousel videos. Use for: quote carousels, testimonials, slide decks, multi-scene videos."
---

# Carousel & Slide Videos

Create multi-slide presentations with transitions.

## Quick Use

```bash
npx remotion render QuoteCarousel out/carousel.mp4
```

## Key Patterns

### Slide Timing
```tsx
const slideCount = items.length;
const framesPerSlide = Math.floor(durationInFrames / slideCount);
const currentSlide = Math.floor(frame / framesPerSlide);
const frameInSlide = frame % framesPerSlide;
```

### Exit Fade Transition
```tsx
const transitionFrames = 20;
const exitStart = slideEnd - transitionFrames;

const exitOpacity = frame >= exitStart && frame < slideEnd
  ? interpolate(frame, [exitStart, slideEnd], [1, 0])
  : frame >= slideEnd ? 0 : 1;
```

### Sequence Per Slide
```tsx
{items.map((item, index) => {
  const slideStart = index * framesPerSlide;
  return (
    <Sequence
      key={index}
      from={slideStart}
      durationInFrames={framesPerSlide}
    >
      <SlideContent item={item} />
    </Sequence>
  );
})}
```

### Progress Indicator
```tsx
const isActive = Math.floor(frame / framesPerSlide) === index;
const slideProgress = isActive
  ? (frame % framesPerSlide) / framesPerSlide
  : 0;
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| items | array | Slide content array |
| transitionFrames | number | Frames for transition |

## Compositions: `QuoteCarousel`

See [../video-common/references/animations.md](../video-common/references/animations.md) for transitions.

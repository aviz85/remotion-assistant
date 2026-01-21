# Kinetic Typography v5 - Dynamic Word Cloud Plan

## Problems to Solve

1. **Boundary overflow** - Long words like "SUPERPOWER" get cut
2. **Boring layouts** - Too predictable, same center positioning
3. **No emphasis hierarchy** - All words feel same importance
4. **Static arrangements** - Words don't interact with each other

## Proposed Solution: Adaptive Word Cloud System

### 1. Word Measurement System

```tsx
// Estimate text width before rendering
function measureWord(word: string, fontSize: number): { width: number; height: number } {
  // Approximate: average char width = fontSize * 0.6
  // Adjust for font weight (bold = 1.1x)
  const charWidth = fontSize * 0.55;
  return {
    width: word.length * charWidth,
    height: fontSize * 1.2
  };
}

// Calculate max safe font size for word
function getMaxSafeSize(word: string, maxWidth: number, maxHeight: number): number {
  const baseSize = 200;
  const estimated = measureWord(word, baseSize);
  const scaleX = (maxWidth * 0.9) / estimated.width;  // 90% of width
  const scaleY = (maxHeight * 0.8) / estimated.height;
  return Math.min(baseSize, baseSize * scaleX, baseSize * scaleY);
}
```

### 2. Word Importance Scoring

```tsx
function getWordImportance(word: string, index: number, total: number): number {
  let score = 50; // base

  // Punctuation = emphasis
  if (/[!?.]$/.test(word)) score += 30;

  // Short impactful words
  if (word.length <= 4 && /^[A-Z]/.test(word)) score += 20;

  // Position in sentence
  if (index === 0) score += 15;  // First word
  if (index === total - 1) score += 25;  // Last word

  // Capitalized words (not first)
  if (index > 0 && /^[A-Z]/.test(word)) score += 20;

  // Keywords detection
  const keywords = ['focus', 'power', 'now', 'stop', 'magic', 'unstoppable', 'dreams', 'rise'];
  if (keywords.some(k => word.toLowerCase().includes(k))) score += 40;

  return Math.min(100, score);
}
```

### 3. Dynamic Layout Zones

Instead of fixed layouts, divide screen into dynamic zones:

```
┌─────────────────────────────────┐
│  Zone A     │  Zone B  │ Zone C │  Top row
├─────────────┼──────────┼────────┤
│             │  Zone D  │        │  Center (hero)
│  Zone E     │ (MAIN)   │ Zone F │
│             │          │        │
├─────────────┼──────────┼────────┤
│  Zone G     │  Zone H  │ Zone I │  Bottom row
└─────────────────────────────────┘
```

**Zone assignments by word importance:**
- 90-100: Zone D (center, huge)
- 70-89: Zone D (center, large) or E/F (sides, large)
- 50-69: Any zone, medium size
- 0-49: Supporting zones (A,B,C,G,H,I), small size

### 4. Multi-Word Arrangement Algorithm

For groups of 2-3 words:

```tsx
interface PlacedWord {
  word: string;
  x: number;
  y: number;
  fontSize: number;
  rotation: number;
}

function arrangeWords(words: WordWithTiming[], frameWidth: number, frameHeight: number): PlacedWord[] {
  const placed: PlacedWord[] = [];
  const padding = 40;

  // Sort by importance (place important words first to claim best spots)
  const scored = words.map((w, i) => ({
    ...w,
    importance: getWordImportance(w.word, i, words.length)
  })).sort((a, b) => b.importance - a.importance);

  for (const word of scored) {
    // Calculate max size based on importance
    const maxSize = interpolate(word.importance, [0, 100], [60, 180]);
    const safeSize = getMaxSafeSize(word.word, frameWidth - padding * 2, frameHeight - padding * 2);
    const fontSize = Math.min(maxSize, safeSize);

    // Find position that doesn't overlap
    const position = findNonOverlappingPosition(word, fontSize, placed, frameWidth, frameHeight);

    placed.push({
      word: word.word,
      x: position.x,
      y: position.y,
      fontSize,
      rotation: position.rotation
    });
  }

  return placed;
}

function findNonOverlappingPosition(
  word: WordWithTiming,
  fontSize: number,
  placed: PlacedWord[],
  frameWidth: number,
  frameHeight: number
): { x: number; y: number; rotation: number } {
  const dims = measureWord(word.word, fontSize);

  // Try positions in order of preference
  const candidates = [
    { x: frameWidth / 2, y: frameHeight / 2, rotation: 0 },  // Center
    { x: frameWidth / 2, y: frameHeight * 0.35, rotation: 0 },  // Upper center
    { x: frameWidth / 2, y: frameHeight * 0.65, rotation: 0 },  // Lower center
    { x: frameWidth * 0.3, y: frameHeight / 2, rotation: -5 },  // Left
    { x: frameWidth * 0.7, y: frameHeight / 2, rotation: 5 },   // Right
    // More candidates...
  ];

  for (const pos of candidates) {
    if (!overlapsAny(pos, dims, placed)) {
      return pos;
    }
  }

  // Fallback: scale down and center
  return { x: frameWidth / 2, y: frameHeight / 2, rotation: 0 };
}
```

### 5. Visual Hierarchy System

```tsx
type EmphasisLevel = 'hero' | 'strong' | 'normal' | 'subtle';

function getEmphasisStyle(level: EmphasisLevel) {
  switch (level) {
    case 'hero':
      return {
        fontWeight: 900,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textShadow: '0 0 60px accent, 0 4px 0 rgba(0,0,0,0.3)',
      };
    case 'strong':
      return {
        fontWeight: 800,
        letterSpacing: '0.05em',
        textShadow: '0 0 40px accent',
      };
    case 'normal':
      return {
        fontWeight: 600,
        opacity: 0.9,
      };
    case 'subtle':
      return {
        fontWeight: 400,
        opacity: 0.7,
        fontSize: '0.7em',
      };
  }
}
```

### 6. Animation Variety by Importance

```tsx
// Hero words: dramatic entrance
'hero': spring({ damping: 8, stiffness: 500 }) + scale 0→1.1→1

// Strong words: punchy entrance
'strong': spring({ damping: 12, stiffness: 300 }) + slide from direction

// Normal words: smooth entrance
'normal': spring({ damping: 20, stiffness: 200 }) + fade

// Subtle words: gentle float in
'subtle': interpolate linear + slow fade
```

## Implementation Steps

1. [ ] Create `WordMeasurement.ts` - text sizing utilities
2. [ ] Create `WordImportance.ts` - scoring system
3. [ ] Create `WordLayout.ts` - arrangement algorithm
4. [ ] Update `SequenceComposition.tsx` - use new system
5. [ ] Add safe bounds checking
6. [ ] Test with full video

## Questions

1. Should single "hero" words take full screen while supporting words are smaller around them?
2. Should we pre-compute all layouts or calculate per-frame?
3. For groups, should words animate in sequentially or have staggered "explode from center"?

// Word Layout System - Smart positioning without overflow or overlap

export interface WordMetrics {
  word: string;
  width: number;
  height: number;
  fontSize: number;
}

export interface PlacedWord {
  word: string;
  x: number;
  y: number;
  fontSize: number;
  rotation: number;
  importance: number;
  emphasis: 'hero' | 'strong' | 'normal' | 'subtle';
}

// ============================================
// WORD MEASUREMENT
// ============================================

// Character width ratios (approximate for Inter/sans-serif)
const CHAR_WIDTHS: Record<string, number> = {
  'W': 1.3, 'M': 1.2, 'O': 1.0, 'Q': 1.0, 'D': 1.0, 'G': 1.0, 'H': 1.0, 'N': 1.0, 'U': 1.0,
  'A': 0.95, 'B': 0.9, 'C': 0.9, 'E': 0.85, 'F': 0.8, 'K': 0.9, 'P': 0.85, 'R': 0.9, 'S': 0.85,
  'T': 0.85, 'V': 0.9, 'X': 0.9, 'Y': 0.9, 'Z': 0.85,
  'w': 1.0, 'm': 1.0, 'o': 0.75, 'a': 0.7, 'b': 0.75, 'c': 0.7, 'd': 0.75, 'e': 0.7,
  'f': 0.4, 'g': 0.75, 'h': 0.7, 'i': 0.3, 'j': 0.3, 'k': 0.7, 'l': 0.3, 'n': 0.7,
  'p': 0.75, 'q': 0.75, 'r': 0.45, 's': 0.65, 't': 0.45, 'u': 0.7, 'v': 0.65, 'x': 0.65,
  'y': 0.65, 'z': 0.6,
  ' ': 0.3, '.': 0.3, ',': 0.3, '!': 0.35, '?': 0.7, ':': 0.3, ';': 0.3, '-': 0.4,
  "'": 0.25, '"': 0.5,
};

export function measureWord(word: string, fontSize: number, fontWeight: number = 700): WordMetrics {
  let totalWidth = 0;

  for (const char of word) {
    const ratio = CHAR_WIDTHS[char] || 0.7;
    totalWidth += ratio;
  }

  // Adjust for font weight (heavier = wider)
  const weightMultiplier = fontWeight >= 800 ? 1.1 : fontWeight >= 600 ? 1.05 : 1.0;

  // Uppercase tends to be wider
  const caseMultiplier = word === word.toUpperCase() ? 1.15 : 1.0;

  const width = totalWidth * fontSize * 0.6 * weightMultiplier * caseMultiplier;
  const height = fontSize * 1.2;

  return { word, width, height, fontSize };
}

export function getMaxSafeSize(
  word: string,
  maxWidth: number,
  maxHeight: number,
  fontWeight: number = 700
): number {
  // Start with desired max size
  const maxFontSize = 220;

  // Measure at max size
  const metrics = measureWord(word, maxFontSize, fontWeight);

  // Scale to fit bounds with padding
  const scaleX = (maxWidth * 0.85) / metrics.width;
  const scaleY = (maxHeight * 0.7) / metrics.height;
  const scale = Math.min(1, scaleX, scaleY);

  return Math.max(40, maxFontSize * scale);
}

// ============================================
// IMPORTANCE SCORING
// ============================================

const KEYWORDS = [
  'stop', 'focus', 'power', 'superpower', 'magic', 'unstoppable',
  'dreams', 'impact', 'legacy', 'rise', 'attention', 'deep',
  'greatest', 'stealing', 'noise', 'create', 'matters', 'becoming',
  'pure', 'undivided', 'guard'
];

export function getWordImportance(
  word: string,
  indexInGroup: number,
  totalInGroup: number,
  groupIndex: number
): number {
  let score = 40; // base
  const cleanWord = word.replace(/[.,!?;:'"]/g, '').toLowerCase();

  // Punctuation emphasis
  if (/!$/.test(word)) score += 35;
  if (/\?$/.test(word)) score += 30;
  if (/\.$/.test(word)) score += 10;

  // Keywords
  if (KEYWORDS.includes(cleanWord)) score += 40;

  // Short impactful words (often verbs/imperatives)
  if (cleanWord.length <= 3 && indexInGroup === 0) score += 15;

  // Position in group
  if (totalInGroup === 1) score += 20; // Solo word = important
  if (indexInGroup === totalInGroup - 1) score += 10; // Last word

  // All caps detection (from original)
  if (word === word.toUpperCase() && word.length > 1) score += 15;

  // First word of first groups = hook
  if (groupIndex < 3 && indexInGroup === 0) score += 15;

  return Math.min(100, score);
}

export function getEmphasisLevel(importance: number): 'hero' | 'strong' | 'normal' | 'subtle' {
  if (importance >= 85) return 'hero';
  if (importance >= 65) return 'strong';
  if (importance >= 40) return 'normal';
  return 'subtle';
}

// ============================================
// LAYOUT ALGORITHM
// ============================================

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectsOverlap(a: Rect, b: Rect, padding: number = 20): boolean {
  return !(
    a.x + a.width / 2 + padding < b.x - b.width / 2 ||
    a.x - a.width / 2 - padding > b.x + b.width / 2 ||
    a.y + a.height / 2 + padding < b.y - b.height / 2 ||
    a.y - a.height / 2 - padding > b.y + b.height / 2
  );
}

function isInBounds(rect: Rect, frameWidth: number, frameHeight: number, margin: number = 40): boolean {
  return (
    rect.x - rect.width / 2 >= margin &&
    rect.x + rect.width / 2 <= frameWidth - margin &&
    rect.y - rect.height / 2 >= margin &&
    rect.y + rect.height / 2 <= frameHeight - margin
  );
}

interface WordInput {
  word: string;
  start: number;
  end: number;
}

export function layoutWords(
  words: WordInput[],
  frameWidth: number,
  frameHeight: number,
  groupIndex: number
): PlacedWord[] {
  if (words.length === 0) return [];

  const placed: PlacedWord[] = [];
  const placedRects: Rect[] = [];

  // Score and sort by importance
  const scored = words.map((w, i) => ({
    ...w,
    importance: getWordImportance(w.word, i, words.length, groupIndex),
    originalIndex: i
  })).sort((a, b) => b.importance - a.importance);

  // Layout positions for different scenarios
  const centerX = frameWidth / 2;
  const centerY = frameHeight / 2;

  for (let i = 0; i < scored.length; i++) {
    const wordData = scored[i];
    const emphasis = getEmphasisLevel(wordData.importance);

    // Calculate font size based on importance
    const baseSizeByEmphasis = {
      hero: 180,
      strong: 130,
      normal: 100,
      subtle: 70
    };
    const baseSize = baseSizeByEmphasis[emphasis];

    // Ensure it fits in bounds
    const safeSize = getMaxSafeSize(wordData.word, frameWidth, frameHeight);
    const fontSize = Math.min(baseSize, safeSize);

    const metrics = measureWord(wordData.word, fontSize);

    // Generate candidate positions
    const candidates = generatePositions(
      i,
      scored.length,
      emphasis,
      frameWidth,
      frameHeight,
      groupIndex
    );

    // Find first non-overlapping position
    let bestPos = candidates[0];
    for (const pos of candidates) {
      const testRect: Rect = {
        x: pos.x,
        y: pos.y,
        width: metrics.width,
        height: metrics.height
      };

      const overlaps = placedRects.some(r => rectsOverlap(testRect, r));
      const inBounds = isInBounds(testRect, frameWidth, frameHeight);

      if (!overlaps && inBounds) {
        bestPos = pos;
        break;
      }
    }

    // Verify final position is in bounds, scale down if needed
    let finalFontSize = fontSize;
    let finalMetrics = metrics;

    const testRect: Rect = {
      x: bestPos.x,
      y: bestPos.y,
      width: finalMetrics.width,
      height: finalMetrics.height
    };

    if (!isInBounds(testRect, frameWidth, frameHeight)) {
      // Scale down to fit
      finalFontSize = getMaxSafeSize(wordData.word, frameWidth * 0.8, frameHeight * 0.7);
      finalMetrics = measureWord(wordData.word, finalFontSize);
    }

    placed.push({
      word: wordData.word,
      x: bestPos.x,
      y: bestPos.y,
      fontSize: finalFontSize,
      rotation: bestPos.rotation,
      importance: wordData.importance,
      emphasis
    });

    placedRects.push({
      x: bestPos.x,
      y: bestPos.y,
      width: finalMetrics.width,
      height: finalMetrics.height
    });
  }

  // Re-sort by original order for sequential animation
  return placed;
}

function generatePositions(
  wordIndex: number,
  totalWords: number,
  emphasis: 'hero' | 'strong' | 'normal' | 'subtle',
  frameWidth: number,
  frameHeight: number,
  groupIndex: number
): { x: number; y: number; rotation: number }[] {
  const cx = frameWidth / 2;
  const cy = frameHeight / 2;

  // Add variety based on group index
  const variance = (groupIndex % 5) * 0.05;

  if (totalWords === 1) {
    // Single word - always center, no rotation
    return [
      { x: cx, y: cy, rotation: 0 }
    ];
  }

  if (totalWords === 2) {
    // Two words - various arrangements
    const arrangements = [
      // Stacked vertical
      [
        { x: cx, y: cy - frameHeight * 0.12, rotation: 0 },
        { x: cx, y: cy + frameHeight * 0.12, rotation: 0 }
      ],
      // Side by side
      [
        { x: cx - frameWidth * 0.2, y: cy, rotation: -3 },
        { x: cx + frameWidth * 0.2, y: cy, rotation: 3 }
      ],
      // Diagonal
      [
        { x: cx - frameWidth * 0.1, y: cy - frameHeight * 0.1, rotation: -5 },
        { x: cx + frameWidth * 0.1, y: cy + frameHeight * 0.1, rotation: 5 }
      ],
      // Big top, small bottom
      [
        { x: cx, y: cy - frameHeight * 0.08, rotation: 0 },
        { x: cx, y: cy + frameHeight * 0.18, rotation: 0 }
      ]
    ];
    return arrangements[groupIndex % arrangements.length][wordIndex] ?
      [arrangements[groupIndex % arrangements.length][wordIndex]] :
      [{ x: cx, y: cy, rotation: 0 }];
  }

  if (totalWords === 3) {
    // Three words - pyramid, cascade, etc.
    const arrangements = [
      // Pyramid
      [
        { x: cx, y: cy - frameHeight * 0.15, rotation: 0 },
        { x: cx - frameWidth * 0.15, y: cy + frameHeight * 0.1, rotation: -3 },
        { x: cx + frameWidth * 0.15, y: cy + frameHeight * 0.1, rotation: 3 }
      ],
      // Vertical stack
      [
        { x: cx, y: cy - frameHeight * 0.18, rotation: 0 },
        { x: cx, y: cy, rotation: 0 },
        { x: cx, y: cy + frameHeight * 0.18, rotation: 0 }
      ],
      // Cascade
      [
        { x: cx - frameWidth * 0.12, y: cy - frameHeight * 0.12, rotation: -2 },
        { x: cx, y: cy, rotation: 0 },
        { x: cx + frameWidth * 0.12, y: cy + frameHeight * 0.12, rotation: 2 }
      ],
      // Inverted pyramid
      [
        { x: cx - frameWidth * 0.15, y: cy - frameHeight * 0.1, rotation: -3 },
        { x: cx + frameWidth * 0.15, y: cy - frameHeight * 0.1, rotation: 3 },
        { x: cx, y: cy + frameHeight * 0.15, rotation: 0 }
      ]
    ];
    return arrangements[groupIndex % arrangements.length][wordIndex] ?
      [arrangements[groupIndex % arrangements.length][wordIndex]] :
      [{ x: cx, y: cy, rotation: 0 }];
  }

  // Fallback
  return [{ x: cx, y: cy, rotation: 0 }];
}

// ============================================
// EMPHASIS STYLES
// ============================================

export function getEmphasisStyles(emphasis: 'hero' | 'strong' | 'normal' | 'subtle', accentColor: string) {
  switch (emphasis) {
    case 'hero':
      return {
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        textShadow: `0 0 80px ${accentColor}, 0 4px 0 rgba(0,0,0,0.4)`,
      };
    case 'strong':
      return {
        fontWeight: 800,
        letterSpacing: '0.03em',
        textShadow: `0 0 50px ${accentColor}80`,
      };
    case 'normal':
      return {
        fontWeight: 600,
      };
    case 'subtle':
      return {
        fontWeight: 500,
        opacity: 0.85,
      };
  }
}

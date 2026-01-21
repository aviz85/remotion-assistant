/**
 * Word Cloud Layout Algorithm v3
 *
 * Proper rectangle bin-packing with variety.
 * - Uses @remotion/layout-utils for accurate text measurement
 * - Multiple layout modes (not always hero-center)
 * - Tight packing without overlap
 * - Words glue together forming compact shape
 */

import { measureText } from '@remotion/layout-utils';

// ============================================
// TYPES
// ============================================

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface PlacedWord {
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  rotation: 0 | 90;
  importance: number;
  tier: 'hero' | 'strong' | 'normal';
  timestamp: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// CONSTANTS
// ============================================

const PADDING = 6;  // Small padding for box edges only

// Default font sizes (can be overridden via props)
const DEFAULT_FONT_SIZES = {
  hero: 140,
  strong: 90,
  normal: 60,
};

// Font family used in rendering
const FONT_FAMILY = 'Inter, system-ui, sans-serif';

// Layout options passed from composition
export interface LayoutOptions {
  heroFontSize?: number;
  strongFontSize?: number;
  normalFontSize?: number;
  marginX?: number;
  marginY?: number;
}

const KEYWORDS = [
  'stop', 'focus', 'power', 'superpower', 'magic', 'unstoppable',
  'dreams', 'impact', 'legacy', 'rise', 'attention', 'deep',
  'greatest', 'stealing', 'noise', 'create', 'matters', 'becoming',
  'pure', 'undivided', 'guard', 'future', 'now', 'today'
];

// ============================================
// MEASUREMENT (using @remotion/layout-utils)
// ============================================

function measureWord(
  word: string,
  fontSize: number,
  tier: 'hero' | 'strong' | 'normal'
): { width: number; height: number } {
  // Match the exact font properties from MultiWordComposition rendering
  const fontWeight = tier === 'hero' ? 900 : tier === 'strong' ? 700 : 600;
  const letterSpacing = tier === 'hero' ? '0.05em' : '0.02em';
  const displayWord = tier === 'hero' ? word.toUpperCase() : word;

  try {
    const measured = measureText({
      text: displayWord,
      fontFamily: FONT_FAMILY,
      fontSize,
      fontWeight: String(fontWeight),
      letterSpacing,
    });

    // Add padding for the bounding box
    return {
      width: measured.width + PADDING * 2,
      height: measured.height + PADDING * 2,
    };
  } catch {
    // Fallback if measureText fails (e.g., font not loaded)
    // Use approximate calculation
    const avgCharWidth = fontSize * 0.55;
    const width = word.length * avgCharWidth + PADDING * 2;
    const height = fontSize * 1.2 + PADDING * 2;
    return { width, height };
  }
}

/**
 * Calculate max font size that fits word within available width
 * Binary search for efficiency
 */
function getMaxSafeFontSize(
  word: string,
  tier: 'hero' | 'strong' | 'normal',
  maxFontSize: number,
  availableWidth: number,
  minFontSize: number = 30
): number {
  // Quick check - if max size fits, use it
  const maxMeasure = measureWord(word, maxFontSize, tier);
  if (maxMeasure.width <= availableWidth) {
    return maxFontSize;
  }

  // Binary search for largest fitting size
  let low = minFontSize;
  let high = maxFontSize;
  let bestFit = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const measure = measureWord(word, mid, tier);

    if (measure.width <= availableWidth) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}

function getWordImportance(word: string, index: number, total: number): number {
  let score = 40;
  const cleanWord = word.replace(/[.,!?;:'\"]/g, '').toLowerCase();
  if (/!$/.test(word)) score += 30;
  if (/\?$/.test(word)) score += 25;
  if (KEYWORDS.includes(cleanWord)) score += 40;
  if (index === total - 1) score += 15;
  if (word === word.toUpperCase() && word.length > 2) score += 20;
  if (cleanWord.length >= 7) score += 10;
  return Math.min(100, score);
}

// ============================================
// COLLISION DETECTION
// ============================================

function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function rectFitsInBounds(rect: Rect, bounds: Rect): boolean {
  return (
    rect.x >= bounds.x &&
    rect.y >= bounds.y &&
    rect.x + rect.width <= bounds.x + bounds.width &&
    rect.y + rect.height <= bounds.y + bounds.height
  );
}

// ============================================
// LAYOUT MODES
// ============================================

type LayoutMode = 'hero-center' | 'all-equal' | 'stacked' | 'scattered' | 'left-anchor' | 'right-anchor';

function pickLayoutMode(groupIndex: number, wordCount: number): LayoutMode {
  // Vary based on group index and word count
  if (wordCount <= 2) return 'all-equal';
  if (wordCount <= 3) {
    const modes: LayoutMode[] = ['stacked', 'hero-center', 'all-equal'];
    return modes[groupIndex % modes.length];
  }
  const modes: LayoutMode[] = ['hero-center', 'all-equal', 'stacked', 'scattered', 'left-anchor', 'right-anchor'];
  return modes[groupIndex % modes.length];
}

// ============================================
// SHELF-BASED PACKING
// ============================================

interface Shelf {
  y: number;
  height: number;
  usedWidth: number;
  items: PlacedWord[];
}

interface ShelfWord {
  word: string;
  fontSize: number;
  importance: number;
  tier: 'hero' | 'strong' | 'normal';
  timestamp: number;
  width: number;
  height: number;
  shelfIndex: number;
  xInShelf: number;  // Position within shelf
}

function packShelves(
  words: Array<{ word: string; fontSize: number; importance: number; tier: 'hero' | 'strong' | 'normal'; timestamp: number }>,
  frameWidth: number,
  frameHeight: number,
  mode: LayoutMode,
  options: LayoutOptions = {}
): PlacedWord[] {
  const marginX = options.marginX ?? 0;
  const marginY = options.marginY ?? 0;
  const availableWidth = frameWidth - marginX * 2;
  const availableHeight = frameHeight - marginY * 2;

  // Measure all words using proper text measurement
  const measured = words.map(w => ({
    ...w,
    ...measureWord(w.word, w.fontSize, w.tier),
  }));

  // Keep original order (not sorted) for better visual flow
  const shelves: Array<{ height: number; usedWidth: number; words: ShelfWord[] }> = [];

  for (const word of measured) {
    let wordPlaced = false;

    // Space width proportional to font size (like a real space character)
    const spaceWidth = word.fontSize * 0.35;

    // Try to fit on existing shelf
    for (let shelfIdx = 0; shelfIdx < shelves.length; shelfIdx++) {
      const shelf = shelves[shelfIdx];
      // Add space before word if not first on shelf
      const needsSpace = shelf.words.length > 0;
      const totalWidth = word.width + (needsSpace ? spaceWidth : 0);

      if (shelf.usedWidth + totalWidth <= availableWidth) {
        const shelfWord: ShelfWord = {
          ...word,
          shelfIndex: shelfIdx,
          xInShelf: shelf.usedWidth + (needsSpace ? spaceWidth : 0),
        };
        shelf.words.push(shelfWord);
        shelf.usedWidth += totalWidth;
        shelf.height = Math.max(shelf.height, word.height);
        wordPlaced = true;
        break;
      }
    }

    // Need new shelf - no space needed for first word
    if (!wordPlaced) {
      const shelfWord: ShelfWord = {
        ...word,
        shelfIndex: shelves.length,
        xInShelf: 0,
      };
      shelves.push({
        height: word.height,
        usedWidth: word.width,
        words: [shelfWord],
      });
    }
  }

  // Calculate total height
  const totalHeight = shelves.reduce((sum, shelf) => sum + shelf.height, 0);
  const offsetY = (availableHeight - totalHeight) / 2;

  // Build final placed words with proper positioning
  const placed: PlacedWord[] = [];
  let currentY = marginY + offsetY;

  for (const shelf of shelves) {
    // Center this shelf horizontally
    const shelfOffsetX = (availableWidth - shelf.usedWidth) / 2;

    for (const word of shelf.words) {
      placed.push({
        word: word.word,
        x: marginX + shelfOffsetX + word.xInShelf,
        y: currentY + (shelf.height - word.height) / 2,
        width: word.width,
        height: word.height,
        fontSize: word.fontSize,
        rotation: 0,
        importance: word.importance,
        tier: word.tier,
        timestamp: word.timestamp,
      });
    }

    currentY += shelf.height;
  }

  return placed;
}

// ============================================
// MAIN LAYOUT FUNCTION
// ============================================

export function layoutWordCloud(
  words: WordTiming[],
  frameWidth: number,
  frameHeight: number,
  groupIndex: number = 0,
  options: LayoutOptions = {}
): PlacedWord[] {
  if (words.length === 0) return [];

  // Get font sizes from options or defaults
  const FONT_SIZES = {
    hero: options.heroFontSize ?? DEFAULT_FONT_SIZES.hero,
    strong: options.strongFontSize ?? DEFAULT_FONT_SIZES.strong,
    normal: options.normalFontSize ?? DEFAULT_FONT_SIZES.normal,
  };

  const mode = pickLayoutMode(groupIndex, words.length);

  // Score words
  const scored = words.map((w, i) => ({
    word: w.word,
    timestamp: w.start,
    importance: getWordImportance(w.word, i, words.length),
    index: i,
  }));

  // Calculate available width for text (with margins)
  const marginX = options.marginX ?? 0;
  const availableWidth = frameWidth - marginX * 2;

  // Assign tiers based on mode, clamping font size to fit screen
  let tiered: Array<{ word: string; fontSize: number; importance: number; tier: 'hero' | 'strong' | 'normal'; timestamp: number }>;

  if (mode === 'all-equal') {
    // All words same size (clamped to fit)
    tiered = scored.map(w => {
      const tier = 'strong' as const;
      const safeFontSize = getMaxSafeFontSize(w.word, tier, FONT_SIZES.strong, availableWidth);
      return {
        word: w.word,
        fontSize: safeFontSize,
        importance: w.importance,
        tier,
        timestamp: w.timestamp,
      };
    });
  } else if (mode === 'stacked') {
    // Decreasing sizes top to bottom (clamped to fit)
    tiered = scored.map((w, i) => {
      const tier = i === 0 ? 'hero' : i < 3 ? 'strong' : 'normal';
      const safeFontSize = getMaxSafeFontSize(w.word, tier, FONT_SIZES[tier], availableWidth);
      return {
        word: w.word,
        fontSize: safeFontSize,
        importance: w.importance,
        tier,
        timestamp: w.timestamp,
      };
    });
  } else {
    // Hero-based: find most important (clamped to fit)
    const maxImportance = Math.max(...scored.map(s => s.importance));
    tiered = scored.map(w => {
      let tier: 'hero' | 'strong' | 'normal';
      if (w.importance >= maxImportance - 5) {
        tier = 'hero';
      } else if (w.importance >= 60) {
        tier = 'strong';
      } else {
        tier = 'normal';
      }
      const safeFontSize = getMaxSafeFontSize(w.word, tier, FONT_SIZES[tier], availableWidth);
      return {
        word: w.word,
        fontSize: safeFontSize,
        importance: w.importance,
        tier,
        timestamp: w.timestamp,
      };
    });
  }

  return packShelves(tiered, frameWidth, frameHeight, mode, options);
}

// ============================================
// GROUP DETECTION
// ============================================

export interface WordGroup {
  words: WordTiming[];
  startTime: number;
  endTime: number;
}

export function detectGroups(
  words: WordTiming[],
  gapThreshold: number = 0.4,
  maxWordsPerGroup: number = 6
): WordGroup[] {
  if (words.length === 0) return [];

  const groups: WordGroup[] = [];
  let currentGroup: WordTiming[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const prevWord = words[i - 1];
    const currWord = words[i];
    const gap = currWord.start - prevWord.end;

    if (gap >= gapThreshold || currentGroup.length >= maxWordsPerGroup) {
      groups.push({
        words: currentGroup,
        startTime: currentGroup[0].start,
        endTime: currentGroup[currentGroup.length - 1].end,
      });
      currentGroup = [currWord];
    } else {
      currentGroup.push(currWord);
    }
  }

  if (currentGroup.length > 0) {
    groups.push({
      words: currentGroup,
      startTime: currentGroup[0].start,
      endTime: currentGroup[currentGroup.length - 1].end,
    });
  }

  return groups;
}

// ============================================
// PRE-COMPUTE ALL LAYOUTS
// ============================================

export interface ComputedScreen {
  layout: PlacedWord[];
  startTime: number;
  endTime: number;
  groupIndex: number;
}

export function computeAllScreens(
  words: WordTiming[],
  frameWidth: number,
  frameHeight: number,
  gapThreshold: number = 0.4,
  maxWordsPerGroup: number = 6,
  options: LayoutOptions = {}
): ComputedScreen[] {
  const groups = detectGroups(words, gapThreshold, maxWordsPerGroup);

  return groups.map((group, index) => ({
    layout: layoutWordCloud(group.words, frameWidth, frameHeight, index, options),
    startTime: group.startTime,
    endTime: group.endTime,
    groupIndex: index,
  }));
}

// =============================================
// Caption Script Parser — Types + Validation + Fallback
// Used by ViralCaptions composition
// =============================================

// --- Types ---

export interface CaptionToken {
	text: string;
	fromMs: number;
	toMs: number;
	highlight: boolean;
}

export interface CaptionPage {
	id: number;
	startMs: number;
	endMs: number;
	entrance: 'cut' | 'pop' | 'fade';
	exit: 'cut' | 'fade';
	emoji: string | null;
	tokens: CaptionToken[];
}

export interface CaptionMeta {
	language: string;
	rtl: boolean;
	font: string;
	fontWeight: number;
	fontSize: number;
	position: 'center' | 'bottom' | 'top';
	primaryColor: string;
	highlightColor: string;
	strokeColor: string;
	strokeWidth: number;
	backgroundColor: string;
	backgroundPadding: number;
	backgroundRadius: number;
}

export interface CaptionScript {
	meta: CaptionMeta;
	pages: CaptionPage[];
}

// --- Defaults ---

const DEFAULT_META: CaptionMeta = {
	language: 'he',
	rtl: true,
	font: 'Inter',
	fontWeight: 800,
	fontSize: 68,
	position: 'center',
	primaryColor: '#FFFFFF',
	highlightColor: '#FFD700',
	strokeColor: '#000000',
	strokeWidth: 3,
	backgroundColor: 'rgba(0,0,0,0.3)',
	backgroundPadding: 12,
	backgroundRadius: 8,
};

// --- Validation ---

export function validateCaptionScript(data: unknown): CaptionScript {
	const raw = data as Record<string, unknown>;
	if (!raw || typeof raw !== 'object') {
		throw new Error('Caption script must be a JSON object');
	}

	const meta: CaptionMeta = {
		...DEFAULT_META,
		...(raw.meta as Partial<CaptionMeta>),
	};

	const rawPages = raw.pages;
	if (!Array.isArray(rawPages) || rawPages.length === 0) {
		throw new Error('Caption script must have at least one page');
	}

	const pages: CaptionPage[] = rawPages.map((p: Record<string, unknown>, i: number) => ({
		id: (p.id as number) ?? i + 1,
		startMs: p.startMs as number,
		endMs: p.endMs as number,
		entrance: (['cut', 'pop', 'fade'].includes(p.entrance as string) ? p.entrance : 'cut') as CaptionPage['entrance'],
		exit: (['cut', 'fade'].includes(p.exit as string) ? p.exit : 'cut') as CaptionPage['exit'],
		emoji: (p.emoji as string) || null,
		tokens: Array.isArray(p.tokens)
			? p.tokens.map((t: Record<string, unknown>) => ({
					text: String(t.text ?? ''),
					fromMs: t.fromMs as number,
					toMs: t.toMs as number,
					highlight: Boolean(t.highlight),
				}))
			: [],
	}));

	return { meta, pages };
}

// --- Fallback: Create TikTok-Style Captions from raw word timings ---

export interface RawWordTiming {
	word: string;
	start: number; // seconds
	end: number;   // seconds
}

/**
 * Creates a basic caption script from raw word-level transcript data.
 * Used as fallback when no AI-generated caption script is available.
 */
export function createTikTokStyleCaptions(
	words: RawWordTiming[],
	options: {
		maxWordsPerPage?: number;
		gapThresholdMs?: number;
		language?: string;
	} = {}
): CaptionScript {
	const {
		maxWordsPerPage = 5,
		gapThresholdMs = 800,
		language = 'he',
	} = options;

	const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF]/;
	const isRTL = words.length > 0 && rtlRegex.test(words[0].word);

	const pages: CaptionPage[] = [];
	let currentTokens: CaptionToken[] = [];
	let pageStart = 0;
	let pageId = 1;

	for (let i = 0; i < words.length; i++) {
		const w = words[i];
		const next = words[i + 1];

		if (currentTokens.length === 0) {
			pageStart = w.start * 1000;
		}

		currentTokens.push({
			text: w.word,
			fromMs: w.start * 1000,
			toMs: w.end * 1000,
			highlight: false,
		});

		let shouldBreak = false;

		// Max words per page
		if (currentTokens.length >= maxWordsPerPage) shouldBreak = true;

		// Gap threshold
		if (next && (next.start - w.end) * 1000 > gapThresholdMs) shouldBreak = true;

		// Last word
		if (!next) shouldBreak = true;

		if (shouldBreak && currentTokens.length > 0) {
			pages.push({
				id: pageId++,
				startMs: pageStart,
				endMs: w.end * 1000,
				entrance: 'cut',
				exit: 'cut',
				emoji: null,
				tokens: [...currentTokens],
			});
			currentTokens = [];
		}
	}

	return {
		meta: {
			...DEFAULT_META,
			language,
			rtl: isRTL,
		},
		pages,
	};
}

// --- RTL Detection Utility ---

export function isRTLLanguage(text: string): boolean {
	return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/.test(text);
}

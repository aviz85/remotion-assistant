import {
	AbsoluteFill,
	OffthreadVideo,
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	staticFile,
} from 'remotion';
import { loadFont as loadHeebo } from '@remotion/google-fonts/Heebo';
import { loadFont as loadKarantina } from '@remotion/google-fonts/Karantina';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';

const heebo = loadHeebo('normal', { weights: ['900'], subsets: ['hebrew'] });
const karantina = loadKarantina('normal', { weights: ['700'], subsets: ['hebrew'] });
const bebasNeue = loadBebasNeue('normal', { weights: ['400'], subsets: ['latin'] });

// --- Test data ---

interface Word {
	text: string;
	fromMs: number;
	toMs: number;
	highlight: boolean;
	emoji?: string; // emoji associated with this word's page
}

const ALL_WORDS: Word[] = [
	{ text: 'אז', fromMs: 680, toMs: 839, highlight: false, emoji: '👋' },
	{ text: 'מה', fromMs: 879, toMs: 999, highlight: false },
	{ text: 'קורה,', fromMs: 1199, toMs: 1899, highlight: true },
	{ text: 'חברים', fromMs: 1919, toMs: 2279, highlight: false },
	{ text: 'יקרים?', fromMs: 2299, toMs: 2879, highlight: false },
	{ text: 'אני', fromMs: 2879, toMs: 3079, highlight: false, emoji: '🤯' },
	{ text: 'כאן', fromMs: 3119, toMs: 3379, highlight: false },
	{ text: 'בטירוף!', fromMs: 3419, toMs: 4219, highlight: true },
	{ text: 'בטירוף', fromMs: 4239, toMs: 4719, highlight: true },
	{ text: 'של', fromMs: 4779, toMs: 4899, highlight: false },
	{ text: 'הקלוד', fromMs: 4920, toMs: 5399, highlight: true, emoji: '🤖' },
	{ text: 'בוט,', fromMs: 5460, toMs: 5739, highlight: false },
	{ text: 'של', fromMs: 5759, toMs: 5899, highlight: false },
	{ text: 'האופן', fromMs: 5919, toMs: 6319, highlight: false },
	{ text: 'קלו,', fromMs: 6379, toMs: 6799, highlight: false },
	{ text: 'של', fromMs: 6819, toMs: 6980, highlight: false },
	{ text: 'הקלוד', fromMs: 7000, toMs: 7459, highlight: true, emoji: '💻' },
	{ text: 'קוד,', fromMs: 7539, toMs: 7859, highlight: true },
	{ text: 'של', fromMs: 7879, toMs: 8020, highlight: false },
	{ text: 'האמו,', fromMs: 8039, toMs: 8600, highlight: false },
	{ text: 'של', fromMs: 8619, toMs: 8780, highlight: false },
	{ text: 'הסוכנים', fromMs: 8800, toMs: 10039, highlight: true, emoji: '🤖' },
	{ text: 'האוטונומיים', fromMs: 10059, toMs: 10659, highlight: true, emoji: '🧠' },
	{ text: 'האלה', fromMs: 10699, toMs: 10920, highlight: false },
	{ text: 'שרצים', fromMs: 10920, toMs: 11340, highlight: false },
	{ text: 'פה', fromMs: 11359, toMs: 11440, highlight: false },
	{ text: 'על', fromMs: 11440, toMs: 11500, highlight: false },
	{ text: 'המחשב', fromMs: 11539, toMs: 11980, highlight: false, emoji: '💻' },
	{ text: 'ומעיפים', fromMs: 12000, toMs: 12400, highlight: true, emoji: '🚀' },
	{ text: 'תהליכים,', fromMs: 12479, toMs: 13779, highlight: false },
	{ text: 'עושים', fromMs: 13799, toMs: 14060, highlight: false, emoji: '🔥' },
	{ text: 'דברים', fromMs: 14079, toMs: 14299, highlight: false },
	{ text: 'מטורפים', fromMs: 14300, toMs: 14800, highlight: true },
	{ text: 'באמת.', fromMs: 14859, toMs: 15499, highlight: false },
];

const videoSrc = staticFile('caption-test/video.mp4');

const RAINBOW = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BD6', '#FF8C42', '#00D4FF', '#39FF14'];

// Deterministic pseudo-random from index
function seeded(idx: number, salt: number = 0): number {
	const x = Math.sin((idx + 1) * 9301 + salt * 4973) * 49297;
	return x - Math.floor(x);
}

function getCurrentWords(currentMs: number, count: 1 | 2 | 3): Word[] {
	let activeIdx = -1;
	for (let i = 0; i < ALL_WORDS.length; i++) {
		if (currentMs >= ALL_WORDS[i].fromMs && currentMs < ALL_WORDS[i].toMs) {
			activeIdx = i;
			break;
		}
	}
	if (activeIdx === -1) return [];
	if (count === 1) return [ALL_WORDS[activeIdx]];
	const groupStart = Math.floor(activeIdx / count) * count;
	const words: Word[] = [];
	for (let i = groupStart; i < groupStart + count && i < ALL_WORDS.length; i++) {
		words.push(ALL_WORDS[i]);
	}
	return words;
}

// Get the emoji for the current group of words
function getEmoji(words: Word[]): string | undefined {
	for (const w of words) {
		if (w.emoji) return w.emoji;
	}
	return undefined;
}

// Empty video bg
const VideoBg: React.FC = () => (
	<OffthreadVideo src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
);

// =============================================
// W1: Heebo 1-word, random position + rotation, emoji pops, smash
// =============================================
export const W1: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 1);
	const w = words[0];
	if (!w) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const idx = ALL_WORDS.indexOf(w);
	const wordFrame = Math.floor((w.fromMs / 1000) * fps);
	const pop = spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 10, stiffness: 350, mass: 0.5 } });

	// Random position offset (±100px from center)
	const offsetX = (seeded(idx, 1) - 0.5) * 200;
	const offsetY = (seeded(idx, 2) - 0.5) * 300;
	const rot = (seeded(idx, 3) - 0.5) * 12;
	const emoji = w.emoji || getEmoji([w]);

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{
					transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rot * Math.min(pop, 1)}deg) scale(${Math.min(pop, 1)})`,
					textAlign: 'center', direction: 'rtl',
				}}>
					{emoji && (
						<div style={{
							fontSize: 140,
							transform: `scale(${Math.min(pop * 1.2, 1)})`,
							marginBottom: 8,
						}}>
							{emoji}
						</div>
					)}
					<span style={{
						fontFamily: heebo.fontFamily, fontSize: 160, fontWeight: 900,
						color: w.highlight ? '#FFD700' : '#FFFFFF',
						WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
						textShadow: '0 6px 24px rgba(0,0,0,0.9)',
					}}>
						{w.text}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W2: Heebo 2-words stacked, tilt, rainbow colors, emoji
// =============================================
export const W2: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 2);
	if (words.length === 0) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const emoji = getEmoji(words);
	const groupIdx = Math.floor(ALL_WORDS.indexOf(words[0]) / 2);
	const groupRot = (seeded(groupIdx, 7) - 0.5) * 8;

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
				justifyContent: 'center', alignItems: 'center', gap: 5,
				transform: `rotate(${groupRot}deg)`,
			}}>
				{emoji && <div style={{ fontSize: 120, marginBottom: 5 }}>{emoji}</div>}
				{words.map((w, i) => {
					const isActive = currentMs >= w.fromMs && currentMs < w.toMs;
					const isVisible = currentMs >= w.fromMs;
					const idx = ALL_WORDS.indexOf(w);
					const wordFrame = Math.floor((w.fromMs / 1000) * fps);
					const pop = spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 8, stiffness: 300, mass: 0.4 } });
					const color = isActive ? RAINBOW[idx % RAINBOW.length] : '#FFFFFF';
					const wordRot = (seeded(idx, 4) - 0.5) * 6;
					return (
						<span key={i} style={{
							fontFamily: heebo.fontFamily, fontSize: 130, fontWeight: 900,
							color,
							WebkitTextStroke: '4px #000', paintOrder: 'stroke fill',
							textShadow: isActive ? `0 0 30px ${color}88, 0 4px 16px rgba(0,0,0,0.8)` : '0 4px 16px rgba(0,0,0,0.8)',
							transform: `scale(${isVisible ? Math.min(pop, 1) : 0}) rotate(${isVisible ? wordRot : 0}deg)`,
							direction: 'rtl', textAlign: 'center',
							opacity: isVisible ? 1 : 0,
						}}>
							{w.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W3: Karantina 1-word, extreme smash + wobble + emoji bounce
// =============================================
export const W3: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 1);
	const w = words[0];
	if (!w) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const idx = ALL_WORDS.indexOf(w);
	const wordFrame = Math.floor((w.fromMs / 1000) * fps);
	const elapsed = Math.max(0, frame - wordFrame);
	const smash = spring({ frame: elapsed, fps, config: { damping: 6, stiffness: 500, mass: 0.7 } });
	// Wobble after landing
	const wobble = elapsed > 5 ? Math.sin(elapsed * 0.8) * interpolate(elapsed, [5, 20], [4, 0], { extrapolateRight: 'clamp' }) : 0;
	const rot = (seeded(idx, 5) - 0.5) * 10 + wobble;
	const emoji = w.emoji;

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{
					textAlign: 'center', direction: 'rtl',
					transform: `scale(${Math.min(smash, 1.15)}) rotate(${rot}deg)`,
				}}>
					{emoji && (
						<div style={{
							fontSize: 150,
							transform: `scale(${Math.min(smash * 1.3, 1)}) rotate(${-rot * 2}deg)`,
							marginBottom: 5,
						}}>
							{emoji}
						</div>
					)}
					<span style={{
						fontFamily: karantina.fontFamily, fontSize: 210, fontWeight: 700,
						color: w.highlight ? '#FF4444' : '#FFFFFF',
						WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
						textShadow: '0 8px 30px rgba(0,0,0,0.95)',
					}}>
						{w.text}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W4: Heebo 1-word, slides from random direction each time, emoji
// =============================================
export const W4: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 1);
	const w = words[0];
	if (!w) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const idx = ALL_WORDS.indexOf(w);
	const wordFrame = Math.floor((w.fromMs / 1000) * fps);
	const slide = spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 12, stiffness: 200, mass: 0.4 } });

	// Random slide direction
	const angle = seeded(idx, 6) * Math.PI * 2;
	const dist = 400;
	const startX = Math.cos(angle) * dist;
	const startY = Math.sin(angle) * dist;
	const x = interpolate(slide, [0, 1], [startX, 0]);
	const y = interpolate(slide, [0, 1], [startY, 0]);
	const rot = interpolate(slide, [0, 1], [(seeded(idx, 8) - 0.5) * 30, (seeded(idx, 8) - 0.5) * 5]);
	const emoji = w.emoji;
	const offsetY = (seeded(idx, 9) - 0.5) * 200;

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
			}}>
				<div style={{
					textAlign: 'center', direction: 'rtl',
					transform: `translate(${x}px, ${y + offsetY}px) rotate(${rot}deg)`,
					opacity: slide,
				}}>
					{emoji && <div style={{ fontSize: 130, marginBottom: 8 }}>{emoji}</div>}
					<span style={{
						fontFamily: heebo.fontFamily, fontSize: 155, fontWeight: 900,
						color: '#FFFFFF',
						WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
						textShadow: '0 6px 24px rgba(0,0,0,0.9)',
					}}>
						{w.text}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W5: Heebo 3-words stacked, each word different rotation, emoji between
// =============================================
export const W5: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 3);
	if (words.length === 0) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const emoji = getEmoji(words);

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
				justifyContent: 'center', alignItems: 'center', gap: 2,
			}}>
				{words.map((w, i) => {
					const isActive = currentMs >= w.fromMs && currentMs < w.toMs;
					const isVisible = currentMs >= w.fromMs;
					const idx = ALL_WORDS.indexOf(w);
					const wordFrame = Math.floor((w.fromMs / 1000) * fps);
					const pop = spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 8, stiffness: 400, mass: 0.5 } });
					const rot = (seeded(idx, 10) - 0.5) * 10;
					const offsetX = (seeded(idx, 11) - 0.5) * 80;
					return (
						<div key={i} style={{ textAlign: 'center' }}>
							{i === 1 && emoji && isVisible && (
								<div style={{ fontSize: 120, transform: `scale(${Math.min(pop, 1)})` }}>{emoji}</div>
							)}
							<span style={{
								fontFamily: heebo.fontFamily, fontSize: 115, fontWeight: 900,
								color: isActive ? '#FFD700' : '#FFFFFF',
								WebkitTextStroke: '4px #000', paintOrder: 'stroke fill',
								textShadow: '0 5px 20px rgba(0,0,0,0.9)',
								display: 'inline-block',
								transform: `scale(${isVisible ? Math.min(pop, 1) * (isActive ? 1.1 : 1) : 0}) rotate(${isVisible ? rot : 0}deg) translateX(${offsetX}px)`,
								direction: 'rtl',
								opacity: isVisible ? 1 : 0,
							}}>
								{w.text}
							</span>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W6: Karantina 2-words, opposite rotations, emoji centered big
// =============================================
export const W6: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 2);
	if (words.length === 0) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const emoji = getEmoji(words);

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
				justifyContent: 'center', alignItems: 'center', gap: 10,
			}}>
				{emoji && <div style={{ fontSize: 140, position: 'absolute', top: '30%' }}>{emoji}</div>}
				{words.map((w, i) => {
					const isActive = currentMs >= w.fromMs && currentMs < w.toMs;
					const isVisible = currentMs >= w.fromMs;
					const wordFrame = Math.floor((w.fromMs / 1000) * fps);
					const smash = spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 7, stiffness: 400, mass: 0.6 } });
					const rot = i === 0 ? -4 : 4;
					return (
						<span key={i} style={{
							fontFamily: karantina.fontFamily, fontSize: 160, fontWeight: 700,
							color: isActive ? '#00D4FF' : '#FFFFFF',
							WebkitTextStroke: '4px #000', paintOrder: 'stroke fill',
							textShadow: isActive ? '0 0 40px rgba(0,212,255,0.5), 0 6px 20px rgba(0,0,0,0.9)' : '0 6px 20px rgba(0,0,0,0.9)',
							transform: `scale(${isVisible ? Math.min(smash, 1.1) : 0}) rotate(${isVisible ? rot : 0}deg)`,
							direction: 'rtl', textAlign: 'center',
							opacity: isVisible ? 1 : 0,
						}}>
							{w.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W7: Heebo 1-word, drops from top with gravity bounce, rainbow, emoji
// =============================================
export const W7: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 1);
	const w = words[0];
	if (!w) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const idx = ALL_WORDS.indexOf(w);
	const wordFrame = Math.floor((w.fromMs / 1000) * fps);
	const elapsed = Math.max(0, frame - wordFrame);
	const drop = spring({ frame: elapsed, fps, config: { damping: 8, stiffness: 120, mass: 0.8 } });
	const y = interpolate(drop, [0, 1], [-600, 0]);
	const rot = interpolate(drop, [0, 0.5, 1], [(seeded(idx, 12) - 0.5) * 20, (seeded(idx, 12) - 0.5) * -5, (seeded(idx, 12) - 0.5) * 3]);
	const color = RAINBOW[idx % RAINBOW.length];
	const emoji = w.emoji;
	const offsetX = (seeded(idx, 13) - 0.5) * 150;

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
			}}>
				<div style={{
					textAlign: 'center', direction: 'rtl',
					transform: `translate(${offsetX}px, ${y}px) rotate(${rot}deg)`,
				}}>
					{emoji && <div style={{ fontSize: 140, marginBottom: 8 }}>{emoji}</div>}
					<span style={{
						fontFamily: heebo.fontFamily, fontSize: 160, fontWeight: 900,
						color,
						WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
						textShadow: `0 6px 24px rgba(0,0,0,0.9), 0 0 40px ${color}44`,
					}}>
						{w.text}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W8: Heebo 2-words, scattered positions (not centered), rotation, emoji
// =============================================
export const W8: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 2);
	if (words.length === 0) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const emoji = getEmoji(words);

	return (
		<AbsoluteFill>
			<VideoBg />
			{emoji && (
				<div style={{
					position: 'absolute', top: '25%', left: '50%',
					transform: 'translateX(-50%)', fontSize: 140, zIndex: 20,
				}}>
					{emoji}
				</div>
			)}
			{words.map((w, i) => {
				const isActive = currentMs >= w.fromMs && currentMs < w.toMs;
				const isVisible = currentMs >= w.fromMs;
				const idx = ALL_WORDS.indexOf(w);
				const wordFrame = Math.floor((w.fromMs / 1000) * fps);
				const pop = spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 10, stiffness: 300, mass: 0.4 } });

				// Each word at different position
				const posX = 30 + seeded(idx, 14) * 40; // 30-70% of width
				const posY = 35 + i * 18 + (seeded(idx, 15) - 0.5) * 10; // staggered vertically
				const rot = (seeded(idx, 16) - 0.5) * 14;

				return (
					<div key={i} style={{
						position: 'absolute',
						left: `${posX}%`,
						top: `${posY}%`,
						transform: `translate(-50%, -50%) scale(${isVisible ? Math.min(pop, 1) * (isActive ? 1.1 : 1) : 0}) rotate(${rot}deg)`,
						opacity: isVisible ? 1 : 0,
						zIndex: 10,
					}}>
						<span style={{
							fontFamily: heebo.fontFamily, fontSize: 130, fontWeight: 900,
							color: isActive ? '#FF6B6B' : '#FFFFFF',
							WebkitTextStroke: '4px #000', paintOrder: 'stroke fill',
							textShadow: '0 5px 20px rgba(0,0,0,0.9)',
							direction: 'rtl', whiteSpace: 'nowrap',
						}}>
							{w.text}
						</span>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// =============================================
// W9: Karantina+Heebo mix, 1-word, glitch/shake, emoji, wild
// =============================================
export const W9: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 1);
	const w = words[0];
	if (!w) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const idx = ALL_WORDS.indexOf(w);
	const wordFrame = Math.floor((w.fromMs / 1000) * fps);
	const elapsed = Math.max(0, frame - wordFrame);
	const pop = spring({ frame: elapsed, fps, config: { damping: 6, stiffness: 500, mass: 0.6 } });

	// Shake on entrance (first 8 frames)
	const shakeX = elapsed < 8 ? (seeded(elapsed, 20) - 0.5) * 20 * (1 - elapsed / 8) : 0;
	const shakeY = elapsed < 8 ? (seeded(elapsed, 21) - 0.5) * 15 * (1 - elapsed / 8) : 0;
	const shakeRot = elapsed < 8 ? (seeded(elapsed, 22) - 0.5) * 8 * (1 - elapsed / 8) : (seeded(idx, 23) - 0.5) * 5;

	const useKarantina = idx % 3 === 0;
	const emoji = w.emoji;
	const color = w.highlight ? RAINBOW[idx % RAINBOW.length] : '#FFFFFF';
	const offsetY = (seeded(idx, 24) - 0.5) * 250;

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
			}}>
				<div style={{
					textAlign: 'center', direction: 'rtl',
					transform: `translate(${shakeX}px, ${shakeY + offsetY}px) rotate(${shakeRot}deg) scale(${Math.min(pop, 1.1)})`,
				}}>
					{emoji && <div style={{ fontSize: 140, marginBottom: 5 }}>{emoji}</div>}
					<span style={{
						fontFamily: useKarantina ? karantina.fontFamily : heebo.fontFamily,
						fontSize: useKarantina ? 200 : 155,
						fontWeight: useKarantina ? 700 : 900,
						color,
						WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
						textShadow: `0 6px 24px rgba(0,0,0,0.9), 0 0 50px ${color}33`,
					}}>
						{w.text}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// =============================================
// W10: Heebo 1-word, zoom from far + spiral rotate, color shift, emoji orbits
// =============================================
export const W10: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const currentMs = (frame / fps) * 1000;
	const words = getCurrentWords(currentMs, 1);
	const w = words[0];
	if (!w) return <AbsoluteFill><VideoBg /></AbsoluteFill>;

	const idx = ALL_WORDS.indexOf(w);
	const wordFrame = Math.floor((w.fromMs / 1000) * fps);
	const elapsed = Math.max(0, frame - wordFrame);
	const zoom = spring({ frame: elapsed, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } });

	const scale = interpolate(zoom, [0, 1], [3, 1]);
	const rot = interpolate(zoom, [0, 1], [(seeded(idx, 25) - 0.5) * 40, (seeded(idx, 25) - 0.5) * 5]);
	const opacity = interpolate(zoom, [0, 0.3, 1], [0, 1, 1]);
	const color = RAINBOW[idx % RAINBOW.length];
	const emoji = w.emoji;
	const offsetX = (seeded(idx, 26) - 0.5) * 120;
	const offsetY = (seeded(idx, 27) - 0.5) * 200;

	// Emoji orbits around word
	const emojiAngle = elapsed * 0.15;
	const emojiRadius = 120;

	return (
		<AbsoluteFill>
			<VideoBg />
			<div style={{
				position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
			}}>
				<div style={{
					textAlign: 'center', direction: 'rtl', position: 'relative',
					transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rot}deg)`,
					opacity,
				}}>
					{emoji && (
						<div style={{
							position: 'absolute', fontSize: 120,
							left: `calc(50% + ${Math.cos(emojiAngle) * emojiRadius}px)`,
							top: `calc(50% + ${Math.sin(emojiAngle) * emojiRadius}px)`,
							transform: 'translate(-50%, -50%)',
						}}>
							{emoji}
						</div>
					)}
					<span style={{
						fontFamily: heebo.fontFamily, fontSize: 160, fontWeight: 900,
						color,
						WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
						textShadow: `0 6px 24px rgba(0,0,0,0.9), 0 0 60px ${color}55`,
					}}>
						{w.text}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

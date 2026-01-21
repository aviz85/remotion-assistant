import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Audio,
  staticFile,
  Sequence,
  random,
} from "remotion";
import React from "react";

// Word timing data structure
interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// Props for the composition
interface KineticSpeechProps {
  transcriptPath?: string;
  audioPath?: string;
  backgroundColor?: string;
  primaryColor?: string;
  accentColor?: string;
}

// Emphasis words that get special treatment
const EMPHASIS_WORDS = new Set([
  "insane",
  "agent",
  "paradigm",
  "shift",
  "intelligence",
  "autonomy",
  "real",
  "crazy",
  "skills",
  "stack",
  "evolve",
  "learned",
  "zero",
  "intervention",
  "graveyard",
  "revolution",
  "future",
  "now",
  "done",
  "slept",
  "shock",
]);

// Words to show BIG
const BIG_WORDS = new Set([
  "agent",
  "insane",
  "paradigm",
  "shift",
  "intelligence",
  "autonomy",
  "revolution",
  "future",
  "zero",
  "ninety",
  "ten",
  "eighty",
  "twenty",
]);

// Brand words - special color
const BRAND_WORDS = new Set(["claude", "code", "chatgpt"]);

// Section markers for background changes
const SECTIONS = [
  { time: 0, theme: "intro", bg: "#0a0a0f" },
  { time: 8, theme: "definition", bg: "#0d0d1a" },
  { time: 17, theme: "comparison", bg: "#0f0a1a" },
  { time: 32, theme: "shift", bg: "#1a0a0f" },
  { time: 55, theme: "skills", bg: "#0a1a0f" },
  { time: 75, theme: "evolution", bg: "#0a0f1a" },
  { time: 87, theme: "autonomy", bg: "#1a0f0a" },
  { time: 112, theme: "saas", bg: "#0f1a0a" },
  { time: 126, theme: "imagine", bg: "#1a0a1a" },
  { time: 150, theme: "finale", bg: "#0a0a0f" },
];

// The transcript data (embedded for this specific video)
const transcriptData: { words: WordTiming[]; duration: number } = {
  duration: 158.72,
  words: [
    { word: "Listen,", start: 0.09, end: 1.38 },
    { word: "something", start: 1.44, end: 1.9 },
    { word: "insane", start: 1.96, end: 2.54 },
    { word: "is", start: 2.62, end: 2.72 },
    { word: "happening", start: 2.82, end: 3.12 },
    { word: "right", start: 3.16, end: 3.33 },
    { word: "now,", start: 3.36, end: 4.3 },
    { word: "and", start: 4.34, end: 4.5 },
    { word: "most", start: 4.56, end: 4.88 },
    { word: "people", start: 4.92, end: 5.86 },
    { word: "are", start: 5.9, end: 6.04 },
    { word: "completely", start: 6.1, end: 6.97 },
    { word: "missing", start: 7.02, end: 7.34 },
    { word: "it.", start: 7.38, end: 8.41 },
    { word: "Claude", start: 8.46, end: 8.76 },
    { word: "Code", start: 8.8, end: 9.14 },
    { word: "isn't", start: 9.42, end: 9.65 },
    { word: "just", start: 9.72, end: 9.86 },
    { word: "another", start: 9.92, end: 10.18 },
    { word: "AI", start: 10.26, end: 10.58 },
    { word: "tool.", start: 10.62, end: 11.4 },
    { word: "It's", start: 11.42, end: 11.58 },
    { word: "not", start: 11.59, end: 11.77 },
    { word: "an", start: 11.8, end: 11.86 },
    { word: "assistant.", start: 11.9, end: 12.56 },
    { word: "It's", start: 12.6, end: 12.75 },
    { word: "not", start: 12.8, end: 12.92 },
    { word: "a", start: 12.98, end: 13.04 },
    { word: "chatbot.", start: 13.08, end: 14.18 },
    { word: "It's", start: 14.22, end: 14.38 },
    { word: "an", start: 14.44, end: 14.64 },
    { word: "agent.", start: 14.76, end: 16.18 },
    { word: "Think", start: 16.239, end: 16.4 },
    { word: "about", start: 16.48, end: 16.65 },
    { word: "that", start: 16.68, end: 16.82 },
    { word: "for", start: 16.84, end: 16.94 },
    { word: "a", start: 16.98, end: 17.04 },
    { word: "second.", start: 17.08, end: 17.92 },
    { word: "With", start: 17.96, end: 18.11 },
    { word: "ChatGPT,", start: 18.14, end: 19.28 },
    { word: "you", start: 19.34, end: 19.76 },
    { word: "work,", start: 19.82, end: 20.28 },
    { word: "AI", start: 20.36, end: 20.76 },
    { word: "helps.", start: 20.78, end: 21.76 },
    { word: "Eighty", start: 21.82, end: 22 },
    { word: "percent", start: 22.08, end: 22.4 },
    { word: "you,", start: 22.48, end: 22.88 },
    { word: "twenty", start: 22.92, end: 23.17 },
    { word: "percent", start: 23.24, end: 23.54 },
    { word: "AI.", start: 23.66, end: 24.48 },
    { word: "But", start: 24.5, end: 24.64 },
    { word: "with", start: 24.68, end: 24.84 },
    { word: "Claude", start: 24.88, end: 25.14 },
    { word: "Code,", start: 25.26, end: 25.62 },
    { word: "AI", start: 26.18, end: 26.64 },
    { word: "works,", start: 26.76, end: 27.48 },
    { word: "you", start: 27.62, end: 28.08 },
    { word: "manage.", start: 28.16, end: 29.16 },
    { word: "Ninety", start: 29.22, end: 29.53 },
    { word: "percent", start: 29.62, end: 29.92 },
    { word: "AI,", start: 30.06, end: 30.56 },
    { word: "ten", start: 30.64, end: 30.82 },
    { word: "percent", start: 30.92, end: 31.26 },
    { word: "you.", start: 31.32, end: 32.1 },
    { word: "This", start: 32.119, end: 32.33 },
    { word: "isn't", start: 32.439, end: 32.68 },
    { word: "incremental", start: 32.72, end: 33.22 },
    { word: "improvement.", start: 33.26, end: 34.3 },
    { word: "This", start: 34.36, end: 34.58 },
    { word: "is", start: 34.62, end: 34.7 },
    { word: "a", start: 34.76, end: 34.78 },
    { word: "paradigm", start: 34.88, end: 35.34 },
    { word: "shift.", start: 35.4, end: 36.36 },
    { word: "I", start: 36.44, end: 36.52 },
    { word: "watched", start: 36.58, end: 36.84 },
    { word: "someone", start: 36.9, end: 37.16 },
    { word: "generate", start: 37.24, end: 37.61 },
    { word: "a", start: 37.68, end: 37.72 },
    { word: "complete", start: 37.76, end: 38.16 },
    { word: "business", start: 38.24, end: 38.49 },
    { word: "proposal,", start: 38.54, end: 39.54 },
    { word: "read", start: 39.64, end: 39.82 },
    { word: "the", start: 39.84, end: 39.94 },
    { word: "client", start: 39.98, end: 40.31 },
    { word: "data,", start: 40.31, end: 41.1 },
    { word: "apply", start: 41.12, end: 41.48 },
    { word: "the", start: 41.52, end: 41.6 },
    { word: "business", start: 41.62, end: 41.94 },
    { word: "rules,", start: 41.96, end: 42.66 },
    { word: "create", start: 42.72, end: 43.04 },
    { word: "a", start: 43.05, end: 43.14 },
    { word: "PDF,", start: 43.18, end: 43.98 },
    { word: "and", start: 44.02, end: 44.19 },
    { word: "send", start: 44.24, end: 44.46 },
    { word: "it.", start: 44.52, end: 45.16 },
    { word: "Zero", start: 45.34, end: 45.64 },
    { word: "human", start: 46.02, end: 46.49 },
    { word: "intervention.", start: 46.72, end: 47.96 },
    { word: "Their", start: 48.02, end: 48.15 },
    { word: "reaction?", start: 48.16, end: 49.16 },
    { word: "Quote,", start: 49.22, end: 49.57 },
    { word: '"I\'m', start: 50.12, end: 50.269 },
    { word: "in", start: 50.38, end: 50.5 },
    { word: "shock", start: 50.54, end: 50.88 },
    { word: "that", start: 50.9, end: 51.02 },
    { word: "it", start: 51.04, end: 51.18 },
    { word: "actually", start: 51.26, end: 51.56 },
    { word: "created", start: 51.6, end: 51.94 },
    { word: "a", start: 51.98, end: 52.04 },
    { word: "proposal", start: 52.08, end: 52.56 },
    { word: "for", start: 52.6, end: 52.67 },
    { word: "this", start: 52.72, end: 52.86 },
    { word: 'client."', start: 52.88, end: 53.84 },
    { word: "This", start: 53.85, end: 54.13 },
    { word: "is", start: 54.32, end: 54.5 },
    { word: "real!", start: 54.9, end: 55.96 },
    { word: "But", start: 55.98, end: 56.1 },
    { word: "here's", start: 56.16, end: 56.34 },
    { word: "where", start: 56.36, end: 56.46 },
    { word: "it", start: 56.52, end: 56.6 },
    { word: "gets", start: 56.64, end: 56.79 },
    { word: "crazy.", start: 56.86, end: 57.7 },
    { word: "Skills", start: 57.82, end: 58.32 },
    { word: "stack", start: 58.8, end: 59.2 },
    { word: "like", start: 59.74, end: 59.9 },
    { word: "compound", start: 59.94, end: 60.36 },
    { word: "interest.", start: 60.4, end: 61.22 },
    { word: "Skill", start: 61.28, end: 61.54 },
    { word: "one:", start: 61.66, end: 62.14 },
    { word: "create", start: 62.18, end: 62.48 },
    { word: "a", start: 62.5, end: 62.54 },
    { word: "poster.", start: 62.6, end: 63.5 },
    { word: "Skill", start: 63.56, end: 63.82 },
    { word: "two:", start: 63.92, end: 64.42 },
    { word: "send", start: 64.48, end: 64.7 },
    { word: "to", start: 64.72, end: 64.8 },
    { word: "WhatsApp,", start: 64.84, end: 65.66 },
    { word: "uses", start: 65.74, end: 66.06 },
    { word: "skill", start: 66.12, end: 66.34 },
    { word: "one.", start: 66.44, end: 67.1 },
    { word: "Skill", start: 67.16, end: 67.4 },
    { word: "three:", start: 67.5, end: 68.08 },
    { word: "full", start: 68.14, end: 68.38 },
    { word: "marketing", start: 68.42, end: 68.84 },
    { word: "campaign,", start: 68.9, end: 69.38 },
    { word: "uses", start: 69.68, end: 70 },
    { word: "both.", start: 70.04, end: 70.88 },
    { word: "What", start: 70.92, end: 71.1 },
    { word: "took", start: 71.12, end: 71.3 },
    { word: "days", start: 71.36, end: 71.78 },
    { word: "now", start: 71.96, end: 72.22 },
    { word: "takes", start: 72.26, end: 72.54 },
    { word: "minutes,", start: 72.6, end: 73.34 },
    { word: "and", start: 73.42, end: 73.49 },
    { word: "the", start: 73.52, end: 73.58 },
    { word: "skills,", start: 73.66, end: 74.12 },
    { word: "they", start: 74.44, end: 74.6 },
    { word: "evolve.", start: 74.66, end: 75.58 },
    { word: "Week", start: 75.62, end: 75.8 },
    { word: "one,", start: 75.9, end: 76.36 },
    { word: "basic", start: 76.42, end: 76.74 },
    { word: "poster", start: 76.82, end: 77.16 },
    { word: "skill.", start: 77.24, end: 78 },
    { word: "Week", start: 78.04, end: 78.22 },
    { word: "ten,", start: 78.3, end: 78.96 },
    { word: "that", start: 79.04, end: 79.2 },
    { word: "skill", start: 79.26, end: 79.46 },
    { word: "is", start: 79.5, end: 79.64 },
    { word: "better", start: 79.68, end: 79.92 },
    { word: "than", start: 79.94, end: 80.08 },
    { word: "the", start: 80.14, end: 80.18 },
    { word: "original.", start: 80.22, end: 81.1 },
    { word: "It", start: 81.11, end: 81.24 },
    { word: "learned", start: 81.34, end: 81.94 },
    { word: "from", start: 82, end: 82.16 },
    { word: "use,", start: 82.32, end: 82.78 },
    { word: "from", start: 82.84, end: 82.97 },
    { word: "feedback.", start: 83.08, end: 84.16 },
    { word: "This", start: 84.18, end: 84.62 },
    { word: "is", start: 84.94, end: 85.18 },
    { word: "intelligence,", start: 85.36, end: 86.42 },
    { word: "not", start: 86.5, end: 86.7 },
    { word: "automation.", start: 86.76, end: 87.6 },
    { word: "Autonomy.", start: 87.62, end: 88.82 },
    { word: "The", start: 88.86, end: 88.98 },
    { word: "system", start: 89, end: 89.36 },
    { word: "decides", start: 89.4, end: 89.88 },
    { word: "what", start: 89.92, end: 90.06 },
    { word: "steps", start: 90.08, end: 90.36 },
    { word: "are", start: 90.4, end: 90.48 },
    { word: "needed,", start: 90.54, end: 91.3 },
    { word: "then", start: 91.32, end: 91.52 },
    { word: "does", start: 91.6, end: 91.84 },
    { word: "them.", start: 91.88, end: 92.56 },
    { word: "Error", start: 92.62, end: 92.88 },
    { word: "on", start: 92.92, end: 93.02 },
    { word: "record", start: 93.08, end: 93.38 },
    { word: "five", start: 93.48, end: 93.64 },
    { word: "hundred", start: 93.7, end: 93.89 },
    { word: "and", start: 94, end: 94.01 },
    { word: "forty-seven?", start: 94.02, end: 95.04 },
    { word: "Traditional", start: 95.06, end: 95.54 },
    { word: "tool,", start: 95.62, end: 96.2 },
    { word: "crash.", start: 96.24, end: 97.12 },
    { word: "Claude", start: 97.16, end: 97.42 },
    { word: "Code", start: 97.5, end: 97.82 },
    { word: "analyzes", start: 98.24, end: 98.77 },
    { word: "the", start: 98.84, end: 98.9 },
    { word: "error,", start: 99, end: 99.64 },
    { word: "creates", start: 99.7, end: 100.06 },
    { word: "an", start: 100.08, end: 100.16 },
    { word: "exception", start: 100.18, end: 100.64 },
    { word: "handler,", start: 100.7, end: 101.42 },
    { word: "logs", start: 101.52, end: 101.86 },
    { word: "the", start: 101.9, end: 102 },
    { word: "edge", start: 102.06, end: 102.24 },
    { word: "case,", start: 102.32, end: 102.94 },
    { word: "continues", start: 103, end: 103.44 },
    { word: "processing,", start: 103.5, end: 104.14 },
    { word: "updates", start: 104.58, end: 104.98 },
    { word: "the", start: 105, end: 105.08 },
    { word: "rules", start: 105.14, end: 105.36 },
    { word: "for", start: 105.42, end: 105.48 },
    { word: "next", start: 105.54, end: 105.74 },
    { word: "time,", start: 105.8, end: 106.34 },
    { word: "reports.", start: 106.42, end: 107.32 },
    { word: "Done.", start: 107.38, end: 108.06 },
    { word: "Three", start: 108.1, end: 108.3 },
    { word: "edge", start: 108.38, end: 108.54 },
    { word: "cases", start: 108.6, end: 108.9 },
    { word: "handled", start: 108.94, end: 109.32 },
    { word: "while", start: 109.72, end: 110.04 },
    { word: "you", start: 110.44, end: 110.7 },
    { word: "slept.", start: 111.14, end: 112.14 },
    { word: "And", start: 112.15, end: 112.26 },
    { word: "the", start: 112.3, end: 112.4 },
    { word: "SaaS", start: 112.44, end: 112.7 },
    { word: "graveyard?", start: 112.76, end: 113.72 },
    { word: "Notion,", start: 113.78, end: 114.28 },
    { word: "Airtable,", start: 114.52, end: 115.06 },
    { word: "Monday,", start: 115.12, end: 115.58 },
    { word: "Canva,", start: 115.64, end: 116.12 },
    { word: "Zapier,", start: 116.18, end: 116.64 },
    { word: "HubSpot.", start: 116.68, end: 117.76 },
    { word: "Thirteen", start: 117.78, end: 118.18 },
    { word: "hundred", start: 118.26, end: 118.47 },
    { word: "dollars", start: 118.56, end: 118.8 },
    { word: "per", start: 118.88, end: 118.96 },
    { word: "month,", start: 119.04, end: 119.7 },
    { word: "replaced", start: 119.78, end: 120.16 },
    { word: "with", start: 120.2, end: 120.29 },
    { word: "forty,", start: 120.36, end: 121.1 },
    { word: "plus", start: 121.14, end: 121.8 },
    { word: "Claude", start: 121.84, end: 122.11 },
    { word: "Code.", start: 122.2, end: 122.96 },
    { word: "This", start: 122.97, end: 123.12 },
    { word: "isn't", start: 123.18, end: 123.42 },
    { word: "science", start: 123.46, end: 123.72 },
    { word: "fiction.", start: 123.76, end: 124.54 },
    { word: "This", start: 124.58, end: 124.69 },
    { word: "is", start: 124.74, end: 124.84 },
    { word: "happening", start: 124.92, end: 125.38 },
    { word: "now.", start: 125.42, end: 126.34 },
    { word: "Imagine", start: 126.38, end: 126.74 },
    { word: "this", start: 126.78, end: 126.92 },
    { word: "morning,", start: 126.98, end: 127.7 },
    { word: "you", start: 127.74, end: 127.86 },
    { word: "say,", start: 127.9, end: 128.479 },
    { word: '"Handle', start: 128.5, end: 128.84 },
    { word: "everything", start: 128.94, end: 129.288 },
    { word: "while", start: 129.34, end: 129.53 },
    { word: "I'm", start: 129.56, end: 129.639 },
    { word: "in", start: 129.68, end: 129.758 },
    { word: 'meetings."', start: 129.82, end: 130.769 },
    { word: "Eight", start: 130.84, end: 130.97 },
    { word: "hours", start: 131.06, end: 131.28 },
    { word: "later,", start: 131.34, end: 132 },
    { word: "forty-seven", start: 132.06, end: 132.66 },
    { word: "emails", start: 132.72, end: 133.04 },
    { word: "processed,", start: 133.08, end: 133.84 },
    { word: "CRM", start: 133.9, end: 134.28 },
    { word: "updated,", start: 134.34, end: 135.22 },
    { word: "weekly", start: 135.26, end: 135.549 },
    { word: "report", start: 135.62, end: 135.98 },
    { word: "generated,", start: 136.02, end: 137 },
    { word: "five", start: 137.04, end: 137.34 },
    { word: "social", start: 137.38, end: 137.72 },
    { word: "posts", start: 137.76, end: 138.04 },
    { word: "scheduled.", start: 138.08, end: 138.96 },
    { word: "A", start: 139.04, end: 139.1 },
    { word: "bug", start: 139.22, end: 139.46 },
    { word: "was", start: 139.47, end: 139.7 },
    { word: "fixed", start: 139.74, end: 140.049 },
    { word: "that", start: 140.38, end: 140.56 },
    { word: "you", start: 140.6, end: 140.68 },
    { word: "didn't", start: 140.72, end: 140.989 },
    { word: "even", start: 141.02, end: 141.22 },
    { word: "know", start: 141.26, end: 141.43 },
    { word: "existed.", start: 141.46, end: 142.44 },
    { word: "New", start: 142.45, end: 142.62 },
    { word: "competitor", start: 142.66, end: 143.2 },
    { word: "discovered,", start: 143.22, end: 144.12 },
    { word: "tracking", start: 144.13, end: 144.54 },
    { word: "folder", start: 144.58, end: 144.88 },
    { word: "created.", start: 144.92, end: 145.85 },
    { word: "You", start: 145.88, end: 145.96 },
    { word: "didn't", start: 146, end: 146.23 },
    { word: "tell", start: 146.26, end: 146.38 },
    { word: "it", start: 146.4, end: 146.52 },
    { word: "how,", start: 146.58, end: 147.31 },
    { word: "you", start: 147.34, end: 147.46 },
    { word: "told", start: 147.48, end: 147.68 },
    { word: "it", start: 147.72, end: 147.85 },
    { word: "what.", start: 147.98, end: 148.65 },
    { word: "It", start: 148.68, end: 148.769 },
    { word: "figured", start: 148.86, end: 149.14 },
    { word: "out", start: 149.2, end: 149.32 },
    { word: "the", start: 149.329, end: 149.42 },
    { word: "rest.", start: 149.46, end: 150.4 },
    { word: "This", start: 150.41, end: 150.76 },
    { word: "is", start: 150.82, end: 150.92 },
    { word: "the", start: 150.96, end: 151.06 },
    { word: "future", start: 151.1, end: 151.38 },
    { word: "of", start: 151.42, end: 151.52 },
    { word: "work,", start: 151.58, end: 152.16 },
    { word: "and", start: 152.18, end: 152.31 },
    { word: "it's", start: 152.36, end: 152.489 },
    { word: "already", start: 152.56, end: 152.92 },
    { word: "here.", start: 152.98, end: 153.81 },
    { word: "Claude", start: 153.84, end: 154.16 },
    { word: "Code,", start: 154.2, end: 154.88 },
    { word: "not", start: 154.94, end: 155.14 },
    { word: "an", start: 155.16, end: 155.24 },
    { word: "assistant,", start: 155.28, end: 156.16 },
    { word: "an", start: 156.2, end: 156.4 },
    { word: "agent.", start: 156.5, end: 157.42 },
    { word: "Welcome", start: 157.48, end: 157.829 },
    { word: "to", start: 157.9, end: 157.989 },
    { word: "the", start: 158.02, end: 158.08 },
    { word: "revolution.", start: 158.1, end: 158.72 },
  ],
};

// Get current section based on time
const getCurrentSection = (timeInSeconds: number) => {
  for (let i = SECTIONS.length - 1; i >= 0; i--) {
    if (timeInSeconds >= SECTIONS[i].time) {
      return SECTIONS[i];
    }
  }
  return SECTIONS[0];
};

// Check if a word should be emphasized
const isEmphasisWord = (word: string): boolean => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  return EMPHASIS_WORDS.has(cleanWord);
};

const isBigWord = (word: string): boolean => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  return BIG_WORDS.has(cleanWord);
};

const isBrandWord = (word: string): boolean => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  return BRAND_WORDS.has(cleanWord);
};

// Single word component with animations
const AnimatedWord: React.FC<{
  word: string;
  startTime: number;
  endTime: number;
  index: number;
  totalWords: number;
}> = ({ word, startTime, endTime, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Word visibility
  const wordStart = startTime;
  const wordDuration = endTime - startTime;
  const fadeOutStart = wordStart + wordDuration + 0.3;

  // Is this word currently active?
  const isActive = currentTime >= wordStart && currentTime < fadeOutStart + 0.5;
  const isCurrentlySpoken =
    currentTime >= wordStart && currentTime <= wordStart + wordDuration;

  if (!isActive) return null;

  // Calculate progress
  const entryProgress = interpolate(
    currentTime,
    [wordStart - 0.05, wordStart + 0.1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitProgress = interpolate(
    currentTime,
    [fadeOutStart, fadeOutStart + 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Spring animation for entry
  const springValue = spring({
    frame: frame - wordStart * fps,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Determine word style
  const isEmphasis = isEmphasisWord(word);
  const isBig = isBigWord(word);
  const isBrand = isBrandWord(word);

  // Base font size with variations
  let fontSize = 72;
  if (isBig) fontSize = 140;
  else if (isEmphasis) fontSize = 100;
  else if (isBrand) fontSize = 90;

  // Color
  let color = "#ffffff";
  if (isBrand) color = "#ff6b35";
  else if (isEmphasis) color = "#00d4ff";
  else if (isBig) color = "#ffdd00";

  // Animation calculations
  const scale = interpolate(springValue, [0, 1], [0.3, 1]);
  const y = interpolate(springValue, [0, 1], [50, 0]);
  const opacity = interpolate(
    exitProgress,
    [0, 1],
    [isCurrentlySpoken ? 1 : 0.7, 0]
  );
  const rotation = interpolate(entryProgress, [0, 1], [-5, 0]);

  // Glow effect for emphasis words
  const glowIntensity = isCurrentlySpoken ? 30 : 10;
  const glow =
    isEmphasis || isBig || isBrand
      ? `0 0 ${glowIntensity}px ${color}, 0 0 ${glowIntensity * 2}px ${color}40`
      : "none";

  // Random position offset for organic feel
  const xOffset = random(`x-${index}`) * 100 - 50;
  const yOffset = random(`y-${index}`) * 200 - 100;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px + ${y}px)) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        fontSize,
        fontWeight: isBig || isEmphasis ? 900 : 700,
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        color,
        textShadow: glow,
        letterSpacing: isBig ? "0.05em" : "0.02em",
        textTransform: isBig ? "uppercase" : "none",
        whiteSpace: "nowrap",
        transition: "text-shadow 0.1s ease",
      }}
    >
      {word}
    </div>
  );
};

// Background effects component
const BackgroundEffects: React.FC<{ currentTime: number }> = ({
  currentTime,
}) => {
  const frame = useCurrentFrame();
  const section = getCurrentSection(currentTime);

  // Animated gradient background
  const gradientAngle = (frame * 0.5) % 360;
  const pulseIntensity = Math.sin(frame * 0.05) * 0.1 + 0.9;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(
            ellipse at 50% 30%,
            ${section.bg}ee 0%,
            #000000 70%
          )
        `,
        opacity: pulseIntensity,
      }}
    >
      {/* Animated grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          transform: `perspective(500px) rotateX(60deg) translateY(${(frame % 50) * 2}px)`,
          transformOrigin: "center top",
          opacity: 0.5,
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = random(`particle-x-${i}`) * 100;
        const baseY = random(`particle-y-${i}`) * 100;
        const speed = random(`particle-speed-${i}`) * 2 + 1;
        const size = random(`particle-size-${i}`) * 4 + 2;
        const y = (baseY + (frame * speed) / 10) % 100;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: "#00d4ff",
              opacity: 0.3,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </div>
  );
};

// Active words display (shows multiple recent words)
const ActiveWordsDisplay: React.FC<{
  words: WordTiming[];
  currentTime: number;
}> = ({ words, currentTime }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find words that should be visible (current + recent)
  const visibleWindow = 2; // seconds of words to show
  const visibleWords = words.filter((w) => {
    const isInWindow =
      currentTime >= w.start - 0.1 && currentTime <= w.end + visibleWindow;
    return isInWindow;
  });

  return (
    <>
      {visibleWords.map((wordData, idx) => (
        <AnimatedWord
          key={`${wordData.word}-${wordData.start}`}
          word={wordData.word}
          startTime={wordData.start}
          endTime={wordData.end}
          index={idx}
          totalWords={visibleWords.length}
        />
      ))}
    </>
  );
};

// Main composition
export const KineticSpeech: React.FC<KineticSpeechProps> = ({
  backgroundColor = "#000000",
  primaryColor = "#00d4ff",
  accentColor = "#ff6b35",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  // Get current section for theming
  const section = getCurrentSection(currentTime);

  // Get the current word for display
  const currentWordIndex = transcriptData.words.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );
  const currentWord =
    currentWordIndex >= 0 ? transcriptData.words[currentWordIndex] : null;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#000",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Audio */}
      <Audio src={staticFile("speech.mp3")} />

      {/* Background effects */}
      <BackgroundEffects currentTime={currentTime} />

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 60px",
        }}
      >
        {/* Active words display */}
        <ActiveWordsDisplay
          words={transcriptData.words}
          currentTime={currentTime}
        />
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          right: 60,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(currentTime / transcriptData.duration) * 100}%`,
            backgroundColor: primaryColor,
            borderRadius: 2,
            boxShadow: `0 0 10px ${primaryColor}`,
          }}
        />
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          right: 60,
          fontSize: 18,
          fontFamily: "'Inter', sans-serif",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 600,
          letterSpacing: "0.1em",
        }}
      >
        CLAUDE CODE
      </div>
    </div>
  );
};

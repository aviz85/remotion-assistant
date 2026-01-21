---
name: kinetic-video-creator
description: "Create professional kinetic typography videos from scratch. Includes speech writing, TTS with emotional dynamics, music generation, and animated text. Use for: promo videos, explainers, social content, inspirational speeches, product launches."
argument-hint: [topic] [tone: inspirational/dramatic/energetic/calm]
---

# Kinetic Video Creator

Create stunning kinetic typography videos with AI-generated speech, music, and dynamic animations.

## Workflow Overview

1. **Script** → Craft emotionally compelling speech text
2. **Storyboard** → Plan animation beats and visual style
3. **Speech** → Generate TTS with emotional dynamics
4. **Transcribe** → Get word-level timing data
5. **Animate** → Create kinetic typography in Remotion
6. **Music** → Generate background music matching emotional arc
7. **Render** → Produce final video with merged audio
8. **Publish** → Upload to YouTube (optional)

---

## Step 1: Craft the Script

Create compelling speech text following this structure:

### Script Template

```
[HOOK - 5-10 seconds]
[dramatic pause] Opening line that grabs attention
[slowly, with weight] The provocative statement or question

[BUILD - 20-40 seconds]
[building intensity] Establish the problem or context
[pause for effect] Key insight moment
[faster pace] Stack supporting points

[PEAK - 20-30 seconds]
[powerful, emphatic] The main message/revelation
[pause] Let it land
[with conviction] The transformation moment

[RESOLVE - 15-25 seconds]
[warm, inspiring] Paint the vision
[slowing down] Call to action
[final beat] Memorable closing line
```

### Emotional Bracket Instructions

Use these in the speech text for TTS dynamics:

| Instruction | Effect |
|-------------|--------|
| `[pause]` | Brief pause (0.5s) |
| `[long pause]` | Extended pause (1-2s) |
| `[slowly]` | Slower delivery |
| `[faster]` | Quickened pace |
| `[whisper]` | Softer, intimate |
| `[emphatic]` | Strong emphasis |
| `[building]` | Gradually increasing intensity |
| `[warm]` | Friendly, approachable tone |
| `[dramatic]` | Theatrical delivery |
| `[matter-of-fact]` | Conversational, grounded |

**Example:**
```
[dramatic pause] Listen.
[slowly, with weight] There's a moment... when everything changes.
[building intensity] When the tools you use... start using intelligence.
[pause] Real intelligence.
[emphatic] And suddenly... you're not just coding anymore.
[warm, inspiring] You're collaborating with the future.
```

---

## Step 2: Plan the Animation (Storyboard)

**IMPORTANT:** Plan before implementing. Create a storyboard JSON that maps:
- Time segments to visual styles
- Key words to emphasis treatments
- Transition points and screen layouts

### Storyboard Format

Create `storyboard.json`:

```json
{
  "title": "Video Title",
  "duration_seconds": 120,
  "segments": [
    {
      "name": "Hook",
      "time_range": [0, 10],
      "style": "minimal-dramatic",
      "background": "dark-gradient",
      "word_treatment": "fade-in-center",
      "emphasis_words": ["Listen", "changes"],
      "transition_out": "fade-to-black"
    },
    {
      "name": "Build",
      "time_range": [10, 50],
      "style": "dynamic-stack",
      "background": "animated-particles",
      "word_treatment": "slide-from-sides",
      "emphasis_words": ["intelligence", "Real"],
      "transition_out": "zoom-blur"
    },
    {
      "name": "Peak",
      "time_range": [50, 80],
      "style": "explosive-center",
      "background": "radial-glow",
      "word_treatment": "scale-bounce",
      "emphasis_words": ["suddenly", "future"],
      "transition_out": "flash-white"
    },
    {
      "name": "Resolve",
      "time_range": [80, 120],
      "style": "calm-elegant",
      "background": "soft-gradient",
      "word_treatment": "gentle-fade",
      "emphasis_words": ["collaborating", "future"],
      "transition_out": "slow-fade"
    }
  ]
}
```

### Visual Style Library

| Style | Description | Best For |
|-------|-------------|----------|
| `minimal-dramatic` | Single word, center, dark bg | Hooks, dramatic moments |
| `dynamic-stack` | Words stack/build vertically | Building tension |
| `explosive-center` | Words burst from center | Peak moments |
| `slide-cascade` | Words slide in sequence | Lists, features |
| `typewriter` | Character-by-character | Technical, precise |
| `wave-flow` | Words follow wave motion | Calm, flowing sections |
| `glitch-digital` | Glitchy, tech aesthetic | Tech topics |
| `handwritten` | Organic, personal feel | Emotional moments |

### Word Treatment Animations

| Treatment | Remotion Pattern |
|-----------|------------------|
| `fade-in-center` | Opacity 0→1, centered |
| `slide-from-sides` | X offset ±200px → 0 |
| `scale-bounce` | Scale 0.5→1.2→1 with spring |
| `rotate-in` | Rotation ±15° → 0 |
| `blur-reveal` | Blur 20px → 0 |
| `color-shift` | Gray → accent color |
| `glow-pulse` | Box-shadow pulse animation |

---

## Step 3: Generate Speech Audio

Use the **speech-generator** skill:

```bash
cd ~/.claude/skills/speech-generator/scripts
npx ts-node generate_speech.ts \
  -f /path/to/script.txt \
  -o /path/to/output/speech.mp3
```

The script text should include all `[bracket instructions]` for emotional delivery.

---

## Step 4: Transcribe for Timing

Use the **transcribe** skill:

```bash
cd ~/.claude/skills/transcribe/scripts
npx ts-node transcribe.ts \
  -i /path/to/speech.mp3 \
  -o /path/to/output/transcript.srt \
  --json
```

The `--json` flag outputs word-level timing data needed for animation sync.

**Note:** The JSON output filename will be `transcript_transcript.json` (the script appends `_transcript` to the base name).

---

## Step 5: Create Kinetic Typography

### Project Setup

```bash
cd /path/to/remotion-project
```

### Composition Structure

Create a composition that:
1. Imports word timing from transcript JSON
2. Applies segment styles from storyboard
3. Renders word-by-word with tween animations

See [templates/remotion-composition.md](templates/remotion-composition.md) for detailed implementation.

### Key Animation Principles

1. **Sync to Speech**: Each word appears at its exact timestamp
2. **Vary by Segment**: Different styles per storyboard segment
3. **Emphasis Detection**: Special treatment for emphasis_words
4. **Natural Rhythm**: Words stay visible appropriate duration
5. **Smooth Transitions**: Use springs, not linear easing

---

## Step 6: Generate Background Music

Use the **music-generator** skill:

```bash
cd ~/.claude/skills/music-generator/scripts
npx ts-node generate_music.ts \
  --composition /path/to/music_composition.json \
  --output /path/to/output/music.mp3
```

### Music Composition Template

Create sections matching your storyboard emotional arc:

```json
{
  "duration_ms": 120000,
  "instrumental": true,
  "positive_global_styles": ["cinematic", "inspirational", "electronic"],
  "negative_global_styles": ["aggressive", "chaotic"],
  "sections": [
    {
      "section_name": "Hook - Mysterious",
      "duration_ms": 10000,
      "positive_local_styles": ["suspenseful", "building tension"],
      "negative_local_styles": ["loud", "fast"],
      "lines": []
    },
    {
      "section_name": "Build - Rising",
      "duration_ms": 40000,
      "positive_local_styles": ["driving", "energetic", "momentum"],
      "negative_local_styles": ["slow", "mellow"],
      "lines": []
    }
  ]
}
```

---

## Step 7: Render Final Video

### Merge Audio

```bash
ffmpeg -y \
  -i speech.mp3 \
  -i music.mp3 \
  -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=0.15[music];[speech][music]amix=inputs=2:duration=first[out]" \
  -map "[out]" -c:a libmp3lame -q:a 2 \
  final_audio.mp3
```

### Copy Audio to Public Folder

**Important:** Remotion requires audio files in the `public/` folder to use `staticFile()`:

```bash
cp final_audio.mp3 /path/to/remotion-project/public/
```

### Render Video

```bash
npx remotion render CompositionName output.mp4
```

**Note:** Remotion v4+ uses `npx remotion render CompositionName` (no `src/index.ts` needed).

---

## Step 8: Upload to YouTube (Optional)

Use the **youtube-uploader** skill:

```bash
cd ~/.claude/skills/youtube-uploader/scripts
npx ts-node youtube-upload.ts \
  --video /path/to/output.mp4 \
  --title "Your Video Title" \
  --description "Your description with hashtags" \
  --tags "tag1,tag2,tag3" \
  --privacy unlisted \
  --category 28
```

---

## Quick Start Example

For topic: **"The Future of AI Assistants"** with **inspirational** tone:

1. Write script with emotional brackets → `script.txt`
2. Create storyboard JSON → `storyboard.json`
3. Generate speech: `/speech-generator script.txt`
4. Transcribe: `/transcribe speech.mp3`
5. Create Remotion composition following storyboard
6. Generate music matching emotional arc
7. Merge audio & render
8. Upload to YouTube

---

## Output Files

After completion, you'll have:
- `script.txt` - The speech text
- `storyboard.json` - Animation plan
- `speech.mp3` - TTS audio
- `transcript.json` - Word timing data
- `music.mp3` - Background music
- `final_audio.mp3` - Merged speech + music
- `output.mp4` - Final rendered video

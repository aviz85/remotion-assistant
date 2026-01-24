---
name: kinetic-video-creator
description: "Create professional kinetic typography videos from scratch. Includes speech writing, TTS with emotional dynamics, music generation, and animated text. Use for: promo videos, explainers, social content, inspirational speeches, product launches."
argument-hint: [topic] [tone: inspirational/dramatic/energetic/calm] [mode: cloud/single]
---

# Kinetic Video Creator

Create stunning kinetic typography videos with AI-generated speech, music, and dynamic animations.

## Workflow Overview

1. **Script** → Craft emotionally compelling speech text
2. **Director's Script** → Plan word groups + emphasis (Claude's intelligent layer)
3. **Speech** → Generate TTS with emotional dynamics
4. **Transcribe** → Get word-level timing data
5. **Merge** → Combine transcript + director annotations
6. **Asset Research** → Search, download, curate reference images
7. **B-Roll Generation** → Create images using references
8. **Animate** → Create kinetic typography in Remotion
9. **Music** → Generate background music matching emotional arc
10. **Render** → Produce final video with merged audio
11. **Publish** → Upload to YouTube (optional)

---

## Display Modes

Two animation styles available. Default is **word cloud** unless user specifies otherwise.

| Mode | Template | Description |
|------|----------|-------------|
| `cloud` (default) | `MultiWordComposition` | Groups words on screen together, shelf-packed layout. Dynamic, modern feel. |
| `single` | `SequenceComposition` | One word at a time with varied animations. Classic kinetic typography. |

### When to Use Each

**Word Cloud (`cloud`)** - default
- Multiple words visible simultaneously
- Better for fast-paced, energetic content
- Creates visual density and impact
- Layout modes cycle: hero-center, stacked, scattered, etc.

**Single Word (`single`)**
- One word fills the screen at a time
- Better for dramatic pauses, emphasis
- Animations cycle: scaleUp, slideUp, rotateIn, fadeBlur, bounceIn, etc.
- More traditional kinetic typography style

### Specifying Mode

User can request mode in the prompt:
- "create a kinetic video about focus, single word style"
- "kinetic video about AI, use word cloud"
- "dramatic promo video, one word at a time"

If not specified, use **word cloud** mode.

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

## Step 2: Director's Script (Intelligent Planning)

**CRITICAL:** This is Claude's planning layer. Instead of relying on auto-detection algorithms, Claude plans word grouping and emphasis before animation.

### Purpose

- **Word Grouping**: Decide which words appear together on screen (1-7 words per group)
- **Emphasis Markers**: Mark hero/strong words for visual hierarchy
- **Visual Asset Planning**: Note where images/b-roll should appear

### Director's Script Format

Create `director-script.json`:

```json
{
  "version": "1.0",
  "title": "Video Title",
  "groups": [
    {
      "id": 1,
      "words": ["STOP"],
      "emphasis": { "STOP": "hero" },
      "style": "dramatic"
    },
    {
      "id": 2,
      "words": ["scrolling", "through", "life"],
      "emphasis": {}
    },
    {
      "id": 3,
      "words": ["There's", "a", "MOMENT", "when", "everything", "changes"],
      "emphasis": { "MOMENT": "hero", "changes": "strong" }
    }
  ],
  "visual_assets": [
    {
      "after_group": 3,
      "duration_seconds": 2,
      "description": "tech workspace with laptop",
      "purpose": "b-roll"
    }
  ]
}
```

### Emphasis Tiers

| Tier | Visual Effect | When to Use |
|------|---------------|-------------|
| `hero` | Largest, uppercase, max glow | Key message words, hooks, turning points |
| `strong` | Medium, accent color | Supporting emphasis |
| (unmarked) | Normal size | Context/flow words |

### Grouping Guidelines

| Group Size | Best For |
|------------|----------|
| 1 word | Dramatic pauses, hooks, key moments |
| 2-3 words | Phrases, statements |
| 4-5 words | Flowing sentences |
| 6-7 words | Dense info, fast sections |

**Rules:**
- Max 1 hero per group
- Max 2 strong per group
- Don't emphasize filler words (a, the, is, and)

See [templates/director-script-template.md](templates/director-script-template.md) for detailed format.

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

## Step 5: Merge Director's Script + Transcript

Combine the director's planning with actual word timings:

```bash
cd ~/.claude/skills/kinetic-video-creator/scripts
npx ts-node merge-director-transcript.ts \
  -d /path/to/director-script.json \
  -t /path/to/transcript.json \
  -o /path/to/enhanced-word-timings.json
```

**Output:** `enhanced-word-timings.json` with pre-assigned `tier` and `groupId` for each word.

The Remotion composition will now use Claude's planned grouping/emphasis instead of auto-detection.

---

## Step 6: Asset Research

Search, download, and curate reference images for B-roll generation.

### Workflow

1. **Search** - Use WebSearch to find relevant images (logos, products, people, concepts)
2. **Download** - Save promising images to `assets/raw/`
3. **Review** - Read each image, assess quality and relevance
4. **Curate** - Keep best 5-10 images in `assets/curated/`

### Asset Types

| Type | Examples | Use For |
|------|----------|---------|
| `logo` | Company logos, brand marks | Brand reveals, intros |
| `product` | Screenshots, product photos | Feature showcases |
| `person` | Portraits, team photos | Testimonials, about sections |
| `concept` | Abstract, illustrative | Visual metaphors |
| `scene` | Environments, workspaces | Context, atmosphere |

### Curated Assets Manifest

Create `assets/manifest.json`:

```json
{
  "assets": [
    {
      "filename": "curated/logo.png",
      "type": "logo",
      "description": "Company logo, clean white version",
      "quality": "high",
      "use_for": "intro and outro"
    },
    {
      "filename": "curated/workspace.jpg",
      "type": "scene",
      "description": "Modern tech workspace with laptop",
      "quality": "high",
      "use_for": "b-roll reference"
    }
  ]
}
```

---

## Step 7: B-Roll Generation

Generate styled images using curated assets as references.

### Using Image Generation Skill

```bash
cd ~/.claude/skills/image-generation/scripts

# With reference images
npx ts-node generate_poster.ts \
  --assets "/path/to/assets/curated/logo.png,/path/to/assets/curated/workspace.jpg" \
  -a 9:16 \
  -d /path/to/assets/b-roll/scene1.jpg \
  "Cinematic wide shot of modern tech workspace, dramatic lighting, shallow depth of field"
```

### B-Roll Prompt Patterns

| Purpose | Prompt Pattern |
|---------|---------------|
| Product showcase | "Floating [product] with soft glow, dark background, professional product photography" |
| Concept visual | "Abstract visualization of [concept], cinematic, moody lighting" |
| Workspace scene | "Modern [workspace type], dramatic lighting, shallow depth of field" |
| Tech aesthetic | "Futuristic [subject], neon accents, dark background, high-tech feel" |

### Output Structure

```
assets/
├── raw/           # Downloaded from web
├── curated/       # Best quality, kept for reference
├── b-roll/        # Generated images for video
└── manifest.json  # Asset descriptions
```

---

## Step 8: Create Kinetic Typography

### Project Setup

```bash
cd /path/to/remotion-project
```

### Composition Structure

Create a composition that:
1. Imports enhanced word timings (with tier/groupId)
2. Uses pre-assigned emphasis from director's script
3. Renders word-by-word with tween animations

See [templates/remotion-composition.md](templates/remotion-composition.md) for detailed implementation.

### Key Animation Principles

1. **Sync to Speech**: Each word appears at its exact timestamp
2. **Use Director's Emphasis**: Respect pre-assigned hero/strong tiers
3. **Follow Group Boundaries**: Screen transitions at group changes
4. **Natural Rhythm**: Words stay visible appropriate duration
5. **Smooth Transitions**: Use springs, not linear easing

---

## Step 9: Generate Background Music

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

## Step 10: Render Final Video

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

## Step 11: Upload to YouTube (Optional)

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
2. Create director's script with word groups/emphasis → `director-script.json`
3. Generate speech: `/speech-generator script.txt`
4. Transcribe: `/transcribe speech.mp3`
5. Merge director + transcript → `enhanced-word-timings.json`
6. Research & download relevant images → `assets/curated/`
7. Generate B-roll images using references → `assets/b-roll/`
8. Create Remotion composition with enhanced timings
9. Generate music matching emotional arc
10. Merge audio & render
11. Upload to YouTube

---

## Output Files

After completion, you'll have:
- `script.txt` - The speech text
- `director-script.json` - Word groups + emphasis (Claude's planning)
- `speech.mp3` - TTS audio
- `transcript.json` - Word timing data
- `enhanced-word-timings.json` - Merged transcript + director planning
- `assets/curated/` - Selected reference images
- `assets/b-roll/` - Generated B-roll images
- `music.mp3` - Background music
- `final_audio.mp3` - Merged speech + music
- `output.mp4` - Final rendered video

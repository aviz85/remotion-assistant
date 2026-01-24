# Director's Script Template

The Director's Script is Claude's intelligent pre-planning layer for kinetic typography videos. Instead of relying on auto-detection algorithms, Claude plans word grouping and emphasis before animation.

## Purpose

- **Word Grouping**: Decide which words appear together on screen (1-7 words per group)
- **Emphasis Markers**: Mark hero/strong words for visual hierarchy
- **Visual Asset Planning**: Note where images/b-roll should appear
- **Style Hints**: Suggest visual treatments per segment

---

## Format Specification

Create a `director-script.json` file:

```json
{
  "version": "1.0",
  "title": "Video Title",
  "groups": [
    {
      "id": 1,
      "words": ["STOP"],
      "emphasis": {
        "STOP": "hero"
      },
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
      "emphasis": {
        "MOMENT": "hero",
        "changes": "strong"
      },
      "style": "building"
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

---

## Field Definitions

### Groups

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Sequential group identifier (1, 2, 3...) |
| `words` | string[] | Yes | Words in this group (1-7 words) |
| `emphasis` | object | No | Word → tier mapping (`hero`, `strong`) |
| `style` | string | No | Visual hint: `dramatic`, `building`, `calm`, `peak`, `resolve` |

### Emphasis Tiers

| Tier | Visual Effect | When to Use |
|------|---------------|-------------|
| `hero` | Largest, uppercase, max glow | Key message words, hooks, turning points |
| `strong` | Medium, accent color | Supporting emphasis, second-tier impact |
| (unmarked) | Normal size | Context words, flow words |

### Visual Assets

| Field | Type | Description |
|-------|------|-------------|
| `after_group` | number | Insert after this group ID |
| `duration_seconds` | number | How long to show (1-3s typical) |
| `description` | string | What the image should show |
| `purpose` | string | `b-roll`, `logo`, `product`, `person` |

---

## Grouping Guidelines

### Rhythm-Based Grouping

Group words by **speech rhythm and meaning**, not arbitrary counts:

**Good:**
```json
{"id": 1, "words": ["STOP"]}                           // Single dramatic word
{"id": 2, "words": ["scrolling", "through", "life"]}   // Natural phrase
{"id": 3, "words": ["There's", "a", "moment"]}         // Lead-up phrase
{"id": 4, "words": ["EVERYTHING", "CHANGES"]}          // Payoff
```

**Bad:**
```json
{"id": 1, "words": ["STOP", "scrolling", "through", "life", "There's", "a", "moment"]}  // Too many, no rhythm
```

### Size Guidelines

| Group Size | Best For |
|------------|----------|
| 1 word | Dramatic pauses, hooks, key moments |
| 2-3 words | Phrases, statements |
| 4-5 words | Flowing sentences |
| 6-7 words | Dense information, fast sections |

### Emphasis Rules

1. **Max 1 hero per group** - Multiple heroes compete for attention
2. **Max 2 strong per group** - Balance hierarchy
3. **First/last words** often deserve emphasis
4. **Punctuation words** (!?) suggest hero treatment
5. **Skip filler words** - Don't emphasize "a", "the", "is", "and"

---

## Examples

### Inspirational Speech

```json
{
  "version": "1.0",
  "title": "Focus Power",
  "groups": [
    {"id": 1, "words": ["Listen"], "emphasis": {"Listen": "hero"}, "style": "dramatic"},
    {"id": 2, "words": ["There's", "a", "moment"], "emphasis": {}},
    {"id": 3, "words": ["when", "everything", "CHANGES"], "emphasis": {"CHANGES": "hero"}},
    {"id": 4, "words": ["When", "you", "stop", "scrolling"], "emphasis": {"stop": "strong"}},
    {"id": 5, "words": ["and", "start", "CREATING"], "emphasis": {"CREATING": "hero"}, "style": "peak"}
  ]
}
```

### Product Launch

```json
{
  "version": "1.0",
  "title": "Product Promo",
  "groups": [
    {"id": 1, "words": ["INTRODUCING"], "emphasis": {"INTRODUCING": "hero"}},
    {"id": 2, "words": ["the", "future", "of", "work"], "emphasis": {"future": "strong"}},
    {"id": 3, "words": ["AI", "that", "UNDERSTANDS"], "emphasis": {"AI": "strong", "UNDERSTANDS": "hero"}}
  ],
  "visual_assets": [
    {"after_group": 1, "duration_seconds": 2, "description": "Product logo animation", "purpose": "logo"},
    {"after_group": 3, "duration_seconds": 3, "description": "Product UI screenshot", "purpose": "product"}
  ]
}
```

---

## Workflow

1. **Read speech script** with emotional brackets
2. **Identify natural phrases** and pauses
3. **Mark key words** for hero/strong treatment
4. **Plan group boundaries** by rhythm
5. **Note visual asset needs** for b-roll
6. **Output director-script.json**

This file is then merged with `transcript.json` (word timings) to create `enhanced-word-timings.json` for Remotion.

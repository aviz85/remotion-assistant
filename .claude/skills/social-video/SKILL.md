---
name: social-video
description: "Create social media videos in various formats. Use for: Instagram posts/stories/reels, TikTok, YouTube shorts, Twitter videos."
---

# Social Media Video Generator

Create videos optimized for social media platforms.

## Available Compositions

| Composition | Dimensions | Use Case |
|-------------|-----------|----------|
| SocialPost-Square | 1080x1080 | Instagram feed, Facebook |
| SocialPost-Story | 1080x1920 | Stories, Reels, TikTok |
| SocialPost-Landscape | 1920x1080 | YouTube, Twitter |

## Quick Generate

```bash
# Instagram square post
npx remotion render SocialPost-Square out/instagram.mp4

# TikTok/Reels (vertical)
npx remotion render SocialPost-Story out/tiktok.mp4

# YouTube thumbnail/video
npx remotion render SocialPost-Landscape out/youtube.mp4

# Custom content
npx remotion render SocialPost-Square out/promo.mp4 \
  --props='{"headline":"50% OFF","subtext":"Limited time only!","backgroundColor":"#ff6b6b"}'
```

## SocialPost Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| headline | string | required | Main text |
| subtext | string | optional | Secondary text |
| backgroundColor | string | "#667eea" | Gradient start color |
| textColor | string | "#ffffff" | Text color |

## Platform Specs

### Instagram
- Feed: 1080x1080 (1:1) or 1080x1350 (4:5)
- Stories/Reels: 1080x1920 (9:16)
- Max: 60 seconds (feed), 90 seconds (reels)

### TikTok
- 1080x1920 (9:16)
- Max: 10 minutes

### YouTube Shorts
- 1080x1920 (9:16)
- Max: 60 seconds

### Twitter/X
- 1920x1080 (16:9) or 1080x1080 (1:1)
- Max: 2:20

## Creating Platform-Specific Variations

Add new compositions in `src/Root.tsx`:

```tsx
<Composition
  id="InstagramReel"
  component={SocialPost}
  durationInFrames={90 * 30} // 90 seconds
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    headline: "Your Reel",
    backgroundColor: "#f093fb",
  }}
/>
```

## Batch Export All Formats

```bash
# Export same content in all formats
for comp in SocialPost-Square SocialPost-Story SocialPost-Landscape; do
  npx remotion render $comp out/${comp}.mp4
done
```

See [../video-common/references/codecs.md](../video-common/references/codecs.md) for export settings.

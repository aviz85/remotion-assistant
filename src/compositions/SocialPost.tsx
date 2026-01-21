import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";

interface SocialPostProps {
  headline: string;
  subtext?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const SocialPost: React.FC<SocialPostProps> = ({
  headline,
  subtext,
  backgroundColor = "#667eea",
  textColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Detect aspect ratio for responsive sizing
  const isPortrait = height > width;
  const isSquare = Math.abs(width - height) < 100;

  const headlineSize = isPortrait ? 72 : isSquare ? 80 : 90;
  const subtextSize = isPortrait ? 36 : isSquare ? 40 : 48;

  // Animations
  const headlineSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const subtextSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const headlineY = interpolate(headlineSpring, [0, 1], [80, 0]);
  const headlineOpacity = interpolate(headlineSpring, [0, 1], [0, 1]);

  const subtextY = interpolate(subtextSpring, [0, 1], [40, 0]);
  const subtextOpacity = interpolate(subtextSpring, [0, 1], [0, 1]);

  // Background animation
  const bgScale = interpolate(frame, [0, 30], [1.1, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Animated background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustColor(backgroundColor, -30)} 100%)`,
          transform: `scale(${bgScale})`,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: isPortrait ? 60 : 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          <h1
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: headlineSize,
              fontWeight: "bold",
              color: textColor,
              textAlign: "center",
              transform: `translateY(${headlineY}px)`,
              opacity: headlineOpacity,
              margin: 0,
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              lineHeight: 1.2,
            }}
          >
            {headline}
          </h1>

          {subtext && (
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: subtextSize,
                color: textColor,
                textAlign: "center",
                transform: `translateY(${subtextY}px)`,
                opacity: subtextOpacity * 0.9,
                margin: 0,
              }}
            >
              {subtext}
            </p>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Helper to darken/lighten hex color
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

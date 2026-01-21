import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface AudiogramProps {
  title: string;
  subtitle?: string;
  waveColor?: string;
  backgroundColor?: string;
}

export const Audiogram: React.FC<AudiogramProps> = ({
  title,
  subtitle,
  waveColor = "#00d4ff",
  backgroundColor = "#0f0f23",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate fake waveform bars (in real use, would come from audio analysis)
  const barCount = 40;
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Create pseudo-random but deterministic wave pattern
    const baseHeight = Math.sin(i * 0.3 + frame * 0.15) * 0.4 + 0.5;
    const variation = Math.sin(i * 0.7 + frame * 0.1) * 0.2;
    return Math.max(0.1, Math.min(1, baseHeight + variation));
  });

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 60,
          right: 60,
        }}
      >
        <h1
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 56,
            fontWeight: "bold",
            color: "#ffffff",
            margin: 0,
            opacity: titleOpacity,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 28,
              color: "rgba(255,255,255,0.7)",
              margin: "16px 0 0 0",
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Waveform visualization */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          height: 200,
        }}
      >
        {bars.map((height, index) => {
          const barDelay = index * 2;
          const barOpacity = interpolate(frame - barDelay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={index}
              style={{
                width: 12,
                height: `${height * 180}px`,
                backgroundColor: waveColor,
                borderRadius: 6,
                opacity: barOpacity,
                boxShadow: `0 0 20px ${waveColor}40`,
              }}
            />
          );
        })}
      </div>

      {/* Play indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: waveColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderLeft: `20px solid ${backgroundColor}`,
              marginLeft: 4,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {formatTime(frame / fps)}
        </span>
      </div>
    </AbsoluteFill>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

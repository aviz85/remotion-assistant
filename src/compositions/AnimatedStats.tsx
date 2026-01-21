import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  color: string;
}

interface AnimatedStatsProps {
  title?: string;
  stats?: StatItem[];
  backgroundColor?: string;
  textColor?: string;
}

const defaultStats: StatItem[] = [
  { label: "Revenue Growth", value: 127, suffix: "%", color: "#00d4ff" },
  { label: "New Customers", value: 2847, suffix: "", color: "#ff6b6b" },
  { label: "Satisfaction", value: 98, suffix: "%", color: "#00ff88" },
  { label: "Projects Done", value: 156, suffix: "", color: "#ffd93d" },
];

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  title = "2024 Results",
  stats = defaultStats,
  backgroundColor = "#0f0f23",
  textColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        padding: 80,
        justifyContent: "center",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 64,
          fontWeight: 700,
          color: textColor,
          marginBottom: 60,
          textAlign: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        {title}
      </h1>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {stats.map((stat, index) => {
          const delay = 15 + index * 15;

          // Number counting animation
          const countProgress = interpolate(frame - delay, [0, 45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const displayValue = Math.floor(stat.value * countProgress);

          // Bar animation
          const barProgress = interpolate(frame - delay, [15, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Card entrance
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

          // Percentage for bar (cap at 100 for visual)
          const barPercent = Math.min(stat.value, 100);

          return (
            <div
              key={index}
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                padding: 32,
                transform: `translateY(${cardY}px)`,
                opacity: cardOpacity,
              }}
            >
              {/* Label */}
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 18,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {stat.label}
              </div>

              {/* Value */}
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color: stat.color,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                {displayValue.toLocaleString()}
                <span style={{ fontSize: 32, marginLeft: 4 }}>
                  {stat.suffix}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: 8,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barPercent * barProgress}%`,
                    height: "100%",
                    backgroundColor: stat.color,
                    borderRadius: 4,
                    boxShadow: `0 0 10px ${stat.color}50`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          width: 100,
          height: 100,
          border: `2px solid ${stats[0]?.color || "#00d4ff"}20`,
          borderRadius: "50%",
          opacity: interpolate(frame, [0, 30], [0, 0.5]),
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          width: 60,
          height: 60,
          border: `2px solid ${stats[1]?.color || "#ff6b6b"}20`,
          transform: "rotate(45deg)",
          opacity: interpolate(frame, [0, 30], [0, 0.5]),
        }}
      />
    </AbsoluteFill>
  );
};

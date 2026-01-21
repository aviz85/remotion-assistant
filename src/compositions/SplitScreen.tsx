import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

interface SplitScreenProps {
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  leftContent?: string;
  rightContent?: string;
  dividerColor?: string;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  leftLabel = "BEFORE",
  rightLabel = "AFTER",
  leftColor = "#1a1a2e",
  rightColor = "#16213e",
  leftContent = "Old Way",
  rightContent = "New Way",
  dividerColor = "#00d4ff",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase 1: Left side reveals (0-40)
  // Phase 2: Divider animates (40-70)
  // Phase 3: Right side reveals (70-110)
  // Phase 4: Labels appear (110-150)

  // Left side clip
  const leftReveal = interpolate(frame, [0, 40], [0, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Divider position
  const dividerX = interpolate(frame, [40, 70], [0, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Right side clip
  const rightReveal = interpolate(frame, [70, 110], [100, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Labels
  const leftLabelSpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const rightLabelSpring = spring({
    frame: frame - 120,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Divider glow pulse
  const glowPulse = Math.sin(frame * 0.1) * 5 + 15;

  // Content animations
  const leftContentOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rightContentOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Left Side */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          clipPath: `polygon(0 0, ${leftReveal}% 0, ${leftReveal}% 100%, 0 100%)`,
          backgroundColor: leftColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 72,
            fontWeight: 300,
            color: "#ffffff",
            opacity: leftContentOpacity,
            textAlign: "center",
          }}
        >
          {leftContent}
        </div>
      </div>

      {/* Right Side */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          clipPath: `polygon(${rightReveal}% 0, 100% 0, 100% 100%, ${rightReveal}% 100%)`,
          backgroundColor: rightColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            opacity: rightContentOpacity,
            textAlign: "center",
          }}
        >
          {rightContent}
        </div>
      </div>

      {/* Divider Line */}
      {dividerX > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${dividerX}%`,
            width: 4,
            height: "100%",
            backgroundColor: dividerColor,
            transform: "translateX(-50%)",
            boxShadow: `0 0 ${glowPulse}px ${dividerColor}, 0 0 ${glowPulse * 2}px ${dividerColor}`,
          }}
        >
          {/* Divider handle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: dividerColor,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 0 20px ${dividerColor}`,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderRight: `8px solid ${leftColor}`,
                }}
              />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderLeft: `8px solid ${rightColor}`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Left Label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          fontFamily: "system-ui, sans-serif",
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 4,
          color: "#ffffff",
          opacity: leftLabelSpring,
          transform: `translateY(${interpolate(leftLabelSpring, [0, 1], [20, 0])}px)`,
          padding: "12px 24px",
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 8,
        }}
      >
        {leftLabel}
      </div>

      {/* Right Label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 60,
          fontFamily: "system-ui, sans-serif",
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 4,
          color: dividerColor,
          opacity: rightLabelSpring,
          transform: `translateY(${interpolate(rightLabelSpring, [0, 1], [20, 0])}px)`,
          padding: "12px 24px",
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 8,
        }}
      >
        {rightLabel}
      </div>
    </AbsoluteFill>
  );
};

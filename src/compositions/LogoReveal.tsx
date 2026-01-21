import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";

interface LogoRevealProps {
  brandName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

export const LogoReveal: React.FC<LogoRevealProps> = ({
  brandName = "BRAND",
  primaryColor = "#00d4ff",
  secondaryColor = "#ff6b6b",
  backgroundColor = "#0a0a0f",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Shapes draw in (0-60)
  // Phase 2: Shapes assemble (60-90)
  // Phase 3: Text reveals (90-120)
  // Phase 4: Final glow (120-150)

  // Shape 1: Circle drawing
  const circleProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const circleStrokeDashoffset = 440 * (1 - circleProgress);

  // Shape 2: Triangle drawing
  const triangleProgress = interpolate(frame, [15, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const triangleStrokeDashoffset = 300 * (1 - triangleProgress);

  // Shape 3: Square drawing
  const squareProgress = interpolate(frame, [30, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const squareStrokeDashoffset = 320 * (1 - squareProgress);

  // Assembly phase - shapes move to center
  const assemblySpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const circleX = interpolate(assemblySpring, [0, 1], [-200, 0]);
  const triangleX = interpolate(assemblySpring, [0, 1], [200, 0]);
  const squareY = interpolate(assemblySpring, [0, 1], [150, 0]);

  // Fill transition
  const fillOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text reveal
  const textSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Final glow
  const glowIntensity = interpolate(frame, [120, 140, 150], [0, 30, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particle effects
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const delay = i * 3;
    const particleProgress = interpolate(frame - 80 - delay, [0, 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const distance = interpolate(particleProgress, [0, 1], [0, 200]);
    const opacity = interpolate(particleProgress, [0, 0.3, 1], [0, 1, 0]);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            opacity: particle.opacity,
            boxShadow: `0 0 10px ${i % 2 === 0 ? primaryColor : secondaryColor}`,
          }}
        />
      ))}

      {/* SVG Shapes */}
      <svg
        width="400"
        height="300"
        viewBox="-200 -150 400 300"
        style={{
          overflow: "visible",
          filter: `drop-shadow(0 0 ${glowIntensity}px ${primaryColor})`,
        }}
      >
        {/* Circle */}
        <g transform={`translate(${circleX}, -30)`}>
          <circle
            cx="0"
            cy="0"
            r="70"
            fill="none"
            stroke={primaryColor}
            strokeWidth="3"
            strokeDasharray="440"
            strokeDashoffset={circleStrokeDashoffset}
            strokeLinecap="round"
          />
          <circle
            cx="0"
            cy="0"
            r="70"
            fill={primaryColor}
            opacity={fillOpacity * 0.2}
          />
        </g>

        {/* Triangle */}
        <g transform={`translate(${triangleX}, -30)`}>
          <path
            d="M 0 -60 L 52 30 L -52 30 Z"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="3"
            strokeDasharray="300"
            strokeDashoffset={triangleStrokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 0 -60 L 52 30 L -52 30 Z"
            fill={secondaryColor}
            opacity={fillOpacity * 0.2}
          />
        </g>

        {/* Square */}
        <g transform={`translate(0, ${squareY + 40})`}>
          <rect
            x="-40"
            y="-40"
            width="80"
            height="80"
            fill="none"
            stroke={primaryColor}
            strokeWidth="3"
            strokeDasharray="320"
            strokeDashoffset={squareStrokeDashoffset}
            strokeLinecap="round"
            transform="rotate(45)"
          />
          <rect
            x="-40"
            y="-40"
            width="80"
            height="80"
            fill={primaryColor}
            opacity={fillOpacity * 0.2}
            transform="rotate(45)"
          />
        </g>
      </svg>

      {/* Brand Name */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          fontFamily: "system-ui, sans-serif",
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: 12,
          color: "#ffffff",
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          textShadow: `0 0 ${glowIntensity}px ${primaryColor}`,
        }}
      >
        {brandName}
      </div>
    </AbsoluteFill>
  );
};

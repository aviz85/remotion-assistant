import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  random,
} from "remotion";

interface ParticleTextProps {
  text?: string;
  particleColor?: string;
  backgroundColor?: string;
  particleCount?: number;
}

// Generate grid points for text (simplified - creates dot matrix pattern)
const generateTextParticles = (
  text: string,
  width: number,
  height: number,
  seed: string
): Array<{ targetX: number; targetY: number; startX: number; startY: number }> => {
  const particles: Array<{
    targetX: number;
    targetY: number;
    startX: number;
    startY: number;
  }> = [];

  const charWidth = 80;
  const charHeight = 120;
  const dotSpacing = 12;
  const totalWidth = text.length * charWidth;
  const startX = (width - totalWidth) / 2;
  const startY = (height - charHeight) / 2;

  // Simple dot matrix patterns for characters
  const patterns: Record<string, number[][]> = {
    A: [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
    ],
    B: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
    C: [
      [0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1],
    ],
    D: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
    E: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
    ],
    F: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
    ],
    G: [
      [0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
    H: [
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
    ],
    I: [
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
    ],
    L: [
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
    ],
    M: [
      [1, 0, 0, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
    ],
    N: [
      [1, 0, 0, 0, 1],
      [1, 1, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 1, 1],
      [1, 0, 0, 0, 1],
    ],
    O: [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
    R: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
      [1, 0, 1, 0, 0],
      [1, 0, 0, 1, 1],
    ],
    S: [
      [0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
    T: [
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
    U: [
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
    W: [
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1],
    ],
    Y: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
    " ": [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  };

  text.toUpperCase().split("").forEach((char, charIndex) => {
    const pattern = patterns[char] || patterns[" "];
    const charX = startX + charIndex * charWidth;

    pattern.forEach((row, rowIndex) => {
      row.forEach((dot, colIndex) => {
        if (dot === 1) {
          const targetX = charX + colIndex * dotSpacing;
          const targetY = startY + rowIndex * (charHeight / 5);

          // Random start position
          const randomAngle = random(`${seed}-${charIndex}-${rowIndex}-${colIndex}`) * Math.PI * 2;
          const randomDist = 300 + random(`${seed}-dist-${charIndex}-${rowIndex}-${colIndex}`) * 400;

          particles.push({
            targetX,
            targetY,
            startX: width / 2 + Math.cos(randomAngle) * randomDist,
            startY: height / 2 + Math.sin(randomAngle) * randomDist,
          });
        }
      });
    });
  });

  return particles;
};

export const ParticleText: React.FC<ParticleTextProps> = ({
  text = "HELLO",
  particleColor = "#00d4ff",
  backgroundColor = "#0a0a0f",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Generate particles based on text
  const particles = generateTextParticles(text, width, height, "seed");

  // Animation phases
  // 0-60: Particles converge
  // 60-120: Hold
  // 120-180: Disperse

  const convergeProgress = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const disperseProgress = interpolate(frame, [120, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Overall glow pulse
  const glowPulse = Math.sin(frame * 0.15) * 5 + 15;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Particles */}
      {particles.map((particle, index) => {
        // Individual particle timing with slight variation
        const particleDelay = (index % 20) * 0.5;
        const particleConverge = interpolate(
          frame - particleDelay,
          [0, 50],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const particleDisperse = interpolate(
          frame - 120 - particleDelay,
          [0, 40],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Calculate current position
        let x, y;

        if (frame < 60) {
          // Converging
          x = interpolate(particleConverge, [0, 1], [particle.startX, particle.targetX]);
          y = interpolate(particleConverge, [0, 1], [particle.startY, particle.targetY]);
        } else if (frame < 120) {
          // Holding at target
          x = particle.targetX;
          y = particle.targetY;
        } else {
          // Dispersing
          const disperseAngle = random(`disperse-${index}`) * Math.PI * 2;
          const disperseDist = 500 + random(`disperse-dist-${index}`) * 300;
          const endX = particle.targetX + Math.cos(disperseAngle) * disperseDist;
          const endY = particle.targetY + Math.sin(disperseAngle) * disperseDist;

          x = interpolate(particleDisperse, [0, 1], [particle.targetX, endX]);
          y = interpolate(particleDisperse, [0, 1], [particle.targetY, endY]);
        }

        // Particle opacity
        const opacity =
          frame < 120
            ? interpolate(particleConverge, [0, 0.3, 1], [0, 1, 1])
            : interpolate(particleDisperse, [0, 0.5, 1], [1, 1, 0]);

        // Particle size - slightly larger when formed
        const size = frame >= 60 && frame < 120 ? 6 : 4;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: particleColor,
              opacity,
              boxShadow: `0 0 ${glowPulse}px ${particleColor}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          width: "100%",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          fontSize: 24,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 8,
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        PARTICLE EFFECT
      </div>
    </AbsoluteFill>
  );
};

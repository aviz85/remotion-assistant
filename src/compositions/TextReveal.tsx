import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";

interface TextRevealProps {
  text: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  fontSize = 80,
  color = "#ffffff",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        {words.map((word, index) => {
          const delay = index * 8;
          const wordSpring = spring({
            frame: frame - delay,
            fps,
            config: {
              damping: 12,
              stiffness: 200,
              mass: 0.5,
            },
          });

          const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const y = interpolate(wordSpring, [0, 1], [50, 0]);

          return (
            <span
              key={index}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize,
                fontWeight: "bold",
                color,
                opacity,
                transform: `translateY(${y}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

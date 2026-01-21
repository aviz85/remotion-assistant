import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface HelloWorldProps {
  text: string;
}

export const HelloWorld: React.FC<HelloWorldProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 100,
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </h1>
    </AbsoluteFill>
  );
};

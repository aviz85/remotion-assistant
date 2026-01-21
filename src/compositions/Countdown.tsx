import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";

interface CountdownProps {
  from?: number;
  backgroundColor?: string;
  numberColor?: string;
  ringColor?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  from = 5,
  backgroundColor = "#0f0f23",
  numberColor = "#ffffff",
  ringColor = "#00d4ff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPerNumber = fps; // 1 second per number
  const currentNumber = from - Math.floor(frame / framesPerNumber);
  const frameInSecond = frame % framesPerNumber;

  // Is this the "GO!" phase?
  const isGo = currentNumber <= 0;
  const displayText = isGo ? "GO!" : currentNumber.toString();

  // Spring animation for number entrance
  const numberSpring = spring({
    frame: frameInSecond,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });

  // Scale bounce on each new number
  const scale = interpolate(numberSpring, [0, 1], [0.5, 1]);

  // Pulse effect mid-second
  const pulse = Math.sin((frameInSecond / fps) * Math.PI * 2) * 0.05 + 1;

  // Progress ring
  const progress = frameInSecond / framesPerNumber;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  // GO! explosion effect
  const goScale = isGo
    ? spring({
        frame: frame - from * fps,
        fps,
        config: { damping: 8, stiffness: 100 },
      })
    : 1;

  const goGlow = isGo ? interpolate(frame - from * fps, [0, 15], [0, 30]) : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Progress ring */}
      <svg
        width="350"
        height="350"
        style={{
          position: "absolute",
          transform: "rotate(-90deg)",
        }}
      >
        {/* Background ring */}
        <circle
          cx="175"
          cy="175"
          r="140"
          fill="none"
          stroke={`${ringColor}30`}
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="175"
          cy="175"
          r="140"
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: `drop-shadow(0 0 10px ${ringColor})`,
          }}
        />
      </svg>

      {/* Number */}
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: isGo ? 120 : 180,
          fontWeight: "bold",
          color: isGo ? "#00ff88" : numberColor,
          transform: `scale(${isGo ? goScale : scale * pulse})`,
          textShadow: isGo
            ? `0 0 ${goGlow}px #00ff88, 0 0 ${goGlow * 2}px #00ff88`
            : `0 0 20px ${ringColor}40`,
        }}
      >
        {displayText}
      </div>

      {/* Pulse rings on countdown */}
      {!isGo && frameInSecond < 10 && (
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: `3px solid ${ringColor}`,
            opacity: interpolate(frameInSecond, [0, 10], [0.8, 0]),
            transform: `scale(${interpolate(frameInSecond, [0, 10], [1, 1.5])})`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

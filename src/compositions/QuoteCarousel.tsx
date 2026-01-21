import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";

interface Quote {
  text: string;
  author: string;
}

interface QuoteCarouselProps {
  quotes?: Quote[];
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

const defaultQuotes: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
];

const QuoteSlide: React.FC<{
  quote: Quote;
  textColor: string;
  accentColor: string;
}> = ({ quote, textColor, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const authorSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const textY = interpolate(textSpring, [0, 1], [60, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  const authorY = interpolate(authorSpring, [0, 1], [30, 0]);
  const authorOpacity = interpolate(authorSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Quote mark */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 120,
          fontSize: 200,
          fontFamily: "Georgia, serif",
          color: `${accentColor}30`,
          opacity: textOpacity,
        }}
      >
        "
      </div>

      {/* Quote text */}
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 56,
          fontWeight: 400,
          color: textColor,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 900,
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          fontStyle: "italic",
        }}
      >
        {quote.text}
      </div>

      {/* Author */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          fontFamily: "system-ui, sans-serif",
          fontSize: 28,
          color: accentColor,
          transform: `translateY(${authorY}px)`,
          opacity: authorOpacity,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 2,
            backgroundColor: accentColor,
          }}
        />
        {quote.author}
      </div>
    </AbsoluteFill>
  );
};

export const QuoteCarousel: React.FC<QuoteCarouselProps> = ({
  quotes = defaultQuotes,
  backgroundColor = "#1a1a2e",
  textColor = "#ffffff",
  accentColor = "#e94560",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const slideCount = quotes.length;
  const framesPerSlide = Math.floor(durationInFrames / slideCount);
  const transitionFrames = 20;

  // Progress indicator
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Slides */}
      {quotes.map((quote, index) => {
        const slideStart = index * framesPerSlide;
        const slideEnd = slideStart + framesPerSlide;

        // Exit fade
        const exitStart = slideEnd - transitionFrames;
        const exitOpacity =
          frame >= exitStart && frame < slideEnd
            ? interpolate(frame, [exitStart, slideEnd], [1, 0])
            : frame >= slideEnd
              ? 0
              : 1;

        return (
          <Sequence
            key={index}
            from={slideStart}
            durationInFrames={framesPerSlide}
          >
            <AbsoluteFill style={{ opacity: exitOpacity }}>
              <QuoteSlide
                quote={quote}
                textColor={textColor}
                accentColor={accentColor}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Progress indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
        }}
      >
        {quotes.map((_, index) => {
          const isActive = Math.floor(frame / framesPerSlide) === index;
          const slideProgress =
            isActive ? (frame % framesPerSlide) / framesPerSlide : isActive ? 1 : 0;

          return (
            <div
              key={index}
              style={{
                width: 60,
                height: 4,
                backgroundColor: `${accentColor}40`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: isActive ? `${slideProgress * 100}%` : index < Math.floor(frame / framesPerSlide) ? "100%" : "0%",
                  height: "100%",
                  backgroundColor: accentColor,
                  borderRadius: 2,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotation = interpolate(frame, [0, fps * 4], [0, 360], {
    extrapolateRight: 'extend',
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Sun with rays for partly cloudy
  return (
    <div style={{ transform: `scale(${scale})` }}>
      <svg width="200" height="200" viewBox="0 0 100 100">
        {/* Sun */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="#FFD700"
          style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}
        />
        {/* Rays */}
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px' }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="50"
              y1="20"
              x2="50"
              y2="10"
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
        </g>
        {/* Cloud */}
        <ellipse cx="65" cy="60" rx="18" ry="12" fill="white" opacity="0.9" />
        <ellipse cx="55" cy="65" rx="15" ry="10" fill="white" opacity="0.9" />
        <ellipse cx="75" cy="65" rx="12" ry="8" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
};

const AnimatedText: React.FC<{
  children: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const translateY = interpolate(y, [0, 1], [30, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: string;
  delay: number;
}> = ({ label, value, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        padding: '25px 35px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <div style={{ fontSize: 42, fontWeight: 'bold', color: 'white' }}>
        {value}
      </div>
      <div style={{ fontSize: 22, color: 'rgba(255, 255, 255, 0.8)', marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
};

const ForecastDay: React.FC<{
  day: string;
  high: string;
  low: string;
  condition: string;
  delay: number;
}> = ({ day, high, low, condition, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const x = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const translateX = interpolate(x, [0, 1], [100, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: '20px 30px',
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        marginBottom: 15,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 'bold', color: 'white', width: 120 }}>
        {day}
      </div>
      <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.7)', flex: 1 }}>
        {condition}
      </div>
      <div style={{ fontSize: 28, color: '#FFD700', fontWeight: 'bold' }}>
        {high}
      </div>
      <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.5)' }}>
        {low}
      </div>
    </div>
  );
};

export const TelAvivWeather: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Background gradient animation
  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 30]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      {/* Title Section */}
      <Sequence from={0} durationInFrames={fps * 12}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 80,
          }}
        >
          <AnimatedText
            delay={0}
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}
          >
            Weather Update
          </AnimatedText>

          <AnimatedText
            delay={10}
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              marginTop: 10,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            Tel Aviv
          </AnimatedText>

          <AnimatedText
            delay={20}
            style={{
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: 5,
            }}
          >
            January 21, 2026
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* Weather Icon & Temperature */}
      <Sequence from={fps * 0.5} durationInFrames={fps * 11.5}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 100,
          }}
        >
          <WeatherIcon condition="partly-cloudy" />

          <AnimatedText
            delay={fps * 0.3}
            style={{
              fontSize: 140,
              fontWeight: 'bold',
              color: 'white',
              marginTop: 20,
            }}
          >
            17°C
          </AnimatedText>

          <AnimatedText
            delay={fps * 0.5}
            style={{
              fontSize: 36,
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 10,
            }}
          >
            Partly Cloudy
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* Stats Row */}
      <Sequence from={fps * 2} durationInFrames={fps * 10}>
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingBottom: 250,
            gap: 30,
          }}
        >
          <StatBox label="Humidity" value="27%" delay={fps * 2} />
          <StatBox label="Wind" value="26 km/h" delay={fps * 2.2} />
          <StatBox label="Feels Like" value="17°C" delay={fps * 2.4} />
        </AbsoluteFill>
      </Sequence>

      {/* Forecast Section */}
      <Sequence from={fps * 5} durationInFrames={fps * 7}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingBottom: 60,
            paddingLeft: 100,
            paddingRight: 100,
          }}
        >
          <AnimatedText
            delay={fps * 5}
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            3-Day Forecast
          </AnimatedText>

          <ForecastDay
            day="Today"
            high="15°"
            low="10°"
            condition="Partly Cloudy"
            delay={fps * 5.5}
          />
          <ForecastDay
            day="Wed"
            high="18°"
            low="14°"
            condition="Cloudy"
            delay={fps * 6}
          />
          <ForecastDay
            day="Thu"
            high="18°"
            low="14°"
            condition="Sunny"
            delay={fps * 6.5}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

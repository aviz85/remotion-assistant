import { Composition, Folder } from "remotion";
import { HelloWorld } from "./compositions/HelloWorld";
import { TextReveal } from "./compositions/TextReveal";
import { SocialPost } from "./compositions/SocialPost";
import { Audiogram } from "./compositions/Audiogram";
import { Countdown } from "./compositions/Countdown";
import { QuoteCarousel } from "./compositions/QuoteCarousel";
import { LogoReveal } from "./compositions/LogoReveal";
import { SplitScreen } from "./compositions/SplitScreen";
import { AnimatedStats } from "./compositions/AnimatedStats";
import { ParticleText } from "./compositions/ParticleText";
import { KineticSpeech } from "./compositions/KineticSpeech";
import { KineticSpeechV2 } from "./compositions/KineticSpeechV2";
import { FocusPower } from "./compositions/FocusPower";
import { SequenceComposition } from "./templates/SequenceComposition";
import { FocusTemplateDemo } from "./compositions/FocusTemplateDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Basic Examples */}
      <Folder name="Basics">
        <Composition
          id="HelloWorld"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            text: "Hello Remotion!",
          }}
        />
      </Folder>

      {/* Text Animations */}
      <Folder name="Text">
        <Composition
          id="TextReveal"
          component={TextReveal}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            text: "Your Message Here",
            fontSize: 100,
            color: "#ffffff",
            backgroundColor: "#1a1a2e",
          }}
        />
        <Composition
          id="QuoteCarousel"
          component={QuoteCarousel}
          durationInFrames={270}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            backgroundColor: "#1a1a2e",
            textColor: "#ffffff",
            accentColor: "#e94560",
          }}
        />
        <Composition
          id="ParticleText"
          component={ParticleText}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            text: "HELLO",
            particleColor: "#00d4ff",
            backgroundColor: "#0a0a0f",
          }}
        />
      </Folder>

      {/* Social Media Formats */}
      <Folder name="Social">
        <Composition
          id="SocialPost-Square"
          component={SocialPost}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            headline: "Amazing Content",
            subtext: "Swipe to learn more →",
            backgroundColor: "#667eea",
          }}
        />
        <Composition
          id="SocialPost-Story"
          component={SocialPost}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "Story Format",
            subtext: "Perfect for Instagram & TikTok",
            backgroundColor: "#f093fb",
          }}
        />
        <Composition
          id="SocialPost-Landscape"
          component={SocialPost}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            headline: "YouTube Thumbnail",
            subtext: "16:9 Format",
            backgroundColor: "#4facfe",
          }}
        />
      </Folder>

      {/* Comparisons */}
      <Folder name="Comparison">
        <Composition
          id="SplitScreen"
          component={SplitScreen}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            leftLabel: "BEFORE",
            rightLabel: "AFTER",
            leftColor: "#1a1a2e",
            rightColor: "#16213e",
            leftContent: "Old Way",
            rightContent: "New Way",
            dividerColor: "#00d4ff",
          }}
        />
      </Folder>

      {/* Data & Stats */}
      <Folder name="Data">
        <Composition
          id="AnimatedStats"
          component={AnimatedStats}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "2024 Results",
            backgroundColor: "#0f0f23",
            textColor: "#ffffff",
          }}
        />
      </Folder>

      {/* Branding & Logos */}
      <Folder name="Branding">
        <Composition
          id="LogoReveal"
          component={LogoReveal}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            brandName: "BRAND",
            primaryColor: "#00d4ff",
            secondaryColor: "#ff6b6b",
            backgroundColor: "#0a0a0f",
          }}
        />
      </Folder>

      {/* Countdown & Timers */}
      <Folder name="Timers">
        <Composition
          id="Countdown"
          component={Countdown}
          durationInFrames={210}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            from: 5,
            backgroundColor: "#0f0f23",
            numberColor: "#ffffff",
            ringColor: "#00d4ff",
          }}
        />
      </Folder>

      {/* Audio Visualization */}
      <Folder name="Audio">
        <Composition
          id="Audiogram"
          component={Audiogram}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            title: "Podcast Episode",
            subtitle: "Listen to the full episode",
            waveColor: "#00d4ff",
            backgroundColor: "#0f0f23",
          }}
        />
      </Folder>

      {/* Kinetic Typography */}
      <Folder name="Kinetic">
        <Composition
          id="KineticSpeech"
          component={KineticSpeech}
          durationInFrames={4762}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            backgroundColor: "#000000",
            primaryColor: "#00d4ff",
            accentColor: "#ff6b35",
          }}
        />
        <Composition
          id="KineticSpeechV2"
          component={KineticSpeechV2}
          durationInFrames={4762}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
        <Composition
          id="FocusPower"
          component={FocusPower}
          durationInFrames={1560}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
        <Composition
          id="FocusTemplateDemo"
          component={FocusTemplateDemo}
          durationInFrames={1560}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{}}
        />
      </Folder>
    </>
  );
};

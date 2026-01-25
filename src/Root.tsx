import { Composition, Folder } from "remotion";
import { z } from "zod";
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
import { MultiWordDemo } from "./compositions/MultiWordDemo";
import { YuvalManzura } from "./compositions/YuvalManzura";
import { YuvalManzuraHebrew } from "./compositions/YuvalManzuraHebrew";
import { DreemzPromo } from "./compositions/DreemzPromo";
import { PersistenceVideo } from "./compositions/PersistenceVideo";
import { MinimalismVideo } from "./compositions/MinimalismVideo";
import { MorningVideo } from "./compositions/MorningVideo";
import { CourageVideo } from "./compositions/CourageVideo";
import { SleepVideo } from "./compositions/SleepVideo";
import { SwimmingLessonVideo } from "./compositions/SwimmingLessonVideo";
import { TelAvivWeather } from "./compositions/TelAvivWeather";
import { ChabadParshaYitro } from "./compositions/ChabadParshaYitro";
import { ClaudeCodePromo } from "./compositions/ClaudeCodePromo";
import { LoveVideo } from "./compositions/LoveVideo";
import { YehudaVideo } from "./compositions/YehudaVideo";
import { YehudaVideoIntercuts } from "./compositions/YehudaVideoIntercuts";
import { AGISubtitles } from "./compositions/AGISubtitles";

// Schema for FocusTemplateDemo (single word) with slider controls
const focusTemplateDemoSchema = z.object({
  baseFontSize: z.number().min(80).max(400).default(200),
  dustEnabled: z.boolean().default(true),
  lightBeamsEnabled: z.boolean().default(true),
  centerGlowEnabled: z.boolean().default(true),
  glowIntensity: z.number().min(0).max(3).step(0.1).default(1),
  anticipationFrames: z.number().min(0).max(20).default(5),
  colorSchemeStart: z.number().min(0).max(7).default(0),
});

// Schema for MultiWordDemo with slider controls
const multiWordDemoSchema = z.object({
  // === FONT SIZES ===
  heroFontSize: z.number().min(50).max(400).default(140),
  strongFontSize: z.number().min(30).max(250).default(90),
  normalFontSize: z.number().min(20).max(150).default(60),
  // === LAYOUT ===
  marginX: z.number().min(0).max(300).default(0),
  marginY: z.number().min(0).max(300).default(0),
  gapThreshold: z.number().min(0.1).max(2).step(0.1).default(0.4),
  maxWordsPerGroup: z.number().min(2).max(15).default(6),
  // === VFX ===
  glowIntensity: z.number().min(0).max(3).step(0.1).default(1),
  particleDensity: z.number().min(0).max(3).step(0.1).default(1),
  backgroundPulse: z.boolean().default(true),
  wordEntranceStyle: z.enum(['pop', 'slide', 'fade', 'glitch']).default('pop'),
  colorScheme: z.number().min(-1).max(7).default(-1),  // -1 = cycle
  screenShake: z.number().min(0).max(20).step(1).default(0),
  dustEnabled: z.boolean().default(true),
  lightBeamsEnabled: z.boolean().default(true),
  textStroke: z.number().min(0).max(5).step(0.5).default(0),
  animationSpeed: z.number().min(0.2).max(3).step(0.1).default(1),
});

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
          schema={focusTemplateDemoSchema}
          defaultProps={{
            baseFontSize: 200,
            dustEnabled: true,
            lightBeamsEnabled: true,
            centerGlowEnabled: true,
            glowIntensity: 1,
            anticipationFrames: 5,
            colorSchemeStart: 0,
          }}
        />
        <Composition
          id="MultiWordDemo"
          component={MultiWordDemo}
          durationInFrames={1560}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            // Font sizes
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            // Layout
            marginX: 0,
            marginY: 0,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            // VFX
            glowIntensity: 1,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="YuvalManzura"
          component={YuvalManzura}
          durationInFrames={2030}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="YuvalManzuraHebrew"
          component={YuvalManzuraHebrew}
          durationInFrames={1815}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            glowIntensity: 1.2,
            dustEnabled: true,
            lightBeamsEnabled: true,
          }}
        />
        <Composition
          id="DreemzPromo"
          component={DreemzPromo}
          durationInFrames={1200}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 160,
            strongFontSize: 100,
            normalFontSize: 70,
            marginX: 50,
            marginY: 100,
            gapThreshold: 0.5,
            maxWordsPerGroup: 5,
            glowIntensity: 1.5,
            particleDensity: 1.2,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="PersistenceVideo"
          component={PersistenceVideo}
          durationInFrames={1520}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="MinimalismVideo"
          component={MinimalismVideo}
          durationInFrames={1460}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="MorningVideo"
          component={MorningVideo}
          durationInFrames={1550}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="CourageVideo"
          component={CourageVideo}
          durationInFrames={1560}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="SleepVideo"
          component={SleepVideo}
          durationInFrames={1600}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
        <Composition
          id="SwimmingLessonVideo"
          component={SwimmingLessonVideo}
          durationInFrames={3150}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 140,
            strongFontSize: 90,
            normalFontSize: 60,
            marginX: 40,
            marginY: 80,
            gapThreshold: 0.4,
            maxWordsPerGroup: 6,
            glowIntensity: 1.2,
            particleDensity: 1,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: -1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
      </Folder>

      {/* Weather */}
      <Folder name="Weather">
        <Composition
          id="TelAvivWeather"
          component={TelAvivWeather}
          durationInFrames={360}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      {/* Chabad */}
      <Folder name="Chabad">
        <Composition
          id="ChabadParshaYitro"
          component={ChabadParshaYitro}
          durationInFrames={1350}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            dustEnabled: true,
            lightBeamsEnabled: true,
            glowIntensity: 1,
          }}
        />
      </Folder>

      {/* Promo Videos */}
      <Folder name="Promo">
        <Composition
          id="ClaudeCodePromo"
          component={ClaudeCodePromo}
          durationInFrames={1830}
          fps={30}
          width={1080}
          height={1920}
          schema={multiWordDemoSchema}
          defaultProps={{
            heroFontSize: 160,
            strongFontSize: 100,
            normalFontSize: 70,
            marginX: 50,
            marginY: 100,
            gapThreshold: 0.5,
            maxWordsPerGroup: 7,
            glowIntensity: 1.3,
            particleDensity: 1.2,
            backgroundPulse: true,
            wordEntranceStyle: 'pop' as const,
            colorScheme: 1,
            screenShake: 0,
            dustEnabled: true,
            lightBeamsEnabled: true,
            textStroke: 0,
            animationSpeed: 1,
          }}
        />
      </Folder>

      {/* Love */}
      <Folder name="Love">
        <Composition
          id="LoveVideo"
          component={LoveVideo}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>

      {/* Kids */}
      <Folder name="Kids">
        <Composition
          id="YehudaVideo"
          component={YehudaVideo}
          durationInFrames={1090}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="YehudaVideoIntercuts"
          component={YehudaVideoIntercuts}
          durationInFrames={1090}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>

      {/* AGI / AI Videos */}
      <Folder name="AGI">
        <Composition
          id="AGISubtitles"
          component={AGISubtitles}
          durationInFrames={475}
          fps={25}
          width={1920}
          height={1080}
          defaultProps={{
            showMusic: true,
            musicVolume: 0.15,
          }}
        />
      </Folder>
    </>
  );
};

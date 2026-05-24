import React from "react";
import { Composition, registerRoot } from "remotion";
import { ProductFilm, TOTAL_FRAMES } from "./compositions/ProductFilm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductFilm"
        component={ProductFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          locale: "en" as const,
          withSubtitles: true,
          withVoice: true,
          withMusic: false,
          voiceFile: "audio/voice.mp3",
          musicFile: "audio/bed.mp3",
          musicVolume: 0.32,
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);

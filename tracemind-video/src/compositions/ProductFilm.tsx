import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { colors } from "../tokens/colors";
import { Subtitles } from "../components/Subtitles";
import { S01_Hook1 } from "../scenes/S01_Hook1";
import { S02_Hook2 } from "../scenes/S02_Hook2";
import { S03_Title } from "../scenes/S03_Title";
import { S04_ReAct } from "../scenes/S04_ReAct";
import { S05_Evidence } from "../scenes/S05_Evidence";
import { S06_Hypotheses } from "../scenes/S06_Hypotheses";
import { S07_Audit } from "../scenes/S07_Audit";
import { S08_Faithfulness } from "../scenes/S08_Faithfulness";
import { S09_RiskDecision } from "../scenes/S09_RiskDecision";
import { S10_Graph } from "../scenes/S10_Graph";
import { S11_Followup } from "../scenes/S11_Followup";
import { S12_Outro } from "../scenes/S12_Outro";

export const SCENE_DURATIONS: Array<{ id: string; frames: number }> = [
  { id: "S01_Hook1", frames: 132 },
  { id: "S02_Hook2", frames: 110 },
  { id: "S03_Title", frames: 74 },
  { id: "S04_ReAct", frames: 233 },
  { id: "S05_Evidence", frames: 96 },
  { id: "S06_Hypotheses", frames: 171 },
  { id: "S07_Audit", frames: 131 },
  { id: "S08_Faithfulness", frames: 129 },
  { id: "S09_RiskDecision", frames: 303 },
  { id: "S10_Graph", frames: 250 },
  { id: "S11_Followup", frames: 106 },
  { id: "S12_Outro", frames: 425 },
];

export const TOTAL_FRAMES = SCENE_DURATIONS.reduce(
  (sum, s) => sum + s.frames,
  0
);

const SCENE_COMPONENTS: Record<string, React.FC> = {
  S01_Hook1,
  S02_Hook2,
  S03_Title,
  S04_ReAct,
  S05_Evidence,
  S06_Hypotheses,
  S07_Audit,
  S08_Faithfulness,
  S09_RiskDecision,
  S10_Graph,
  S11_Followup,
  S12_Outro,
};

export type ProductFilmProps = {
  locale?: "en" | "zh";
  withSubtitles?: boolean;
  withVoice?: boolean;
  withMusic?: boolean;
  voiceFile?: string;
  musicFile?: string;
  musicVolume?: number;
};

export const ProductFilm: React.FC<ProductFilmProps> = ({
  withSubtitles = false,
  withVoice = false,
  withMusic = false,
  voiceFile = "audio/voice.mp3",
  musicFile = "audio/bed.mp3",
  musicVolume = 0.32,
}) => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: colors.paper }}>
      {SCENE_DURATIONS.map((scene) => {
        const Component = SCENE_COMPONENTS[scene.id];
        const from = cursor;
        cursor += scene.frames;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.frames}
            name={scene.id}
          >
            <Component />
          </Sequence>
        );
      })}

      {withMusic ? (
        <Audio src={staticFile(musicFile)} volume={musicVolume} />
      ) : null}
      {withVoice ? <Audio src={staticFile(voiceFile)} volume={1} /> : null}

      {withSubtitles ? <Subtitles /> : null}
    </AbsoluteFill>
  );
};

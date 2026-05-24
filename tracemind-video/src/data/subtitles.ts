import cues from "./subtitles.json";

export type SubtitleCue = {
  startFrame: number;
  endFrame: number;
  text: string;
  /**
   * Some scenes (S03 title, S12 outro) already render the line as
   * typographic display; subtitles would just duplicate the on-screen text.
   * Setting `hideOverlay` skips the bottom subtitle bar but keeps the cue
   * in the generated .srt export.
   */
  hideOverlay?: boolean;
};

export const SUBTITLES: SubtitleCue[] = cues as SubtitleCue[];
export const FPS = 30;

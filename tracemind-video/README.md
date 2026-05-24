# TraceMind — Product Film (Remotion)

72-second Anthropic-style product film, English version. Companion script: `../docs/narration-en.md`. Storyboard: `../docs/tracemind-video-script.md`.

## Project layout

```
tracemind-video/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── scripts/
│   └── build-srt.mjs            # subtitles.json → public/tracemind.srt
├── public/                      # Remotion staticFile root
│   ├── tracemind.srt            # generated
│   ├── audio/                   # voice.mp3, bed.mp3 (user-supplied)
│   ├── screens/                 # optional real screenshots
│   └── video/                   # optional KG capture clip
└── src/
    ├── Root.tsx
    ├── compositions/ProductFilm.tsx
    ├── scenes/                  S01_Hook1 … S12_Outro (12)
    ├── components/              17 atomic components + Subtitles
    ├── tokens/                  colors / type / motion
    └── data/                    fixtures + subtitles.json
```

## Timing

72.0 s / 2160 frames @ 30 fps, 12 scenes:

| Scene | Frames | Time | Theme |
|---|---:|---:|---|
| S01_Hook1 | 120 | 4.0 s | Black-box report |
| S02_Hook2 | 120 | 4.0 s | Tagline twist |
| S03_Title | 150 | 5.0 s | Logo + title |
| S04_ReAct | 240 | 8.0 s | Streaming ReAct steps |
| S05_Evidence | 210 | 7.0 s | Claim → source chip |
| S06_Hypotheses | 240 | 8.0 s | Main thesis vs alternative |
| S07_Audit | 210 | 7.0 s | Rule audit |
| S08_Faithfulness | 150 | 5.0 s | Per-claim faithfulness |
| S09_RiskDecision | 240 | 8.0 s | Risk bars + decision card |
| S10_Graph | 210 | 7.0 s | Knowledge graph |
| S11_Followup | 150 | 5.0 s | Multi-turn follow-up |
| S12_Outro | 120 | 4.0 s | Tagline + logo |

Adjust durations in `SCENE_DURATIONS` (compositions/ProductFilm.tsx).

## Commands

```bash
npm install
npm run dev               # Studio at http://localhost:3000
npm run build             # mute master (no voice/music/subs)
npm run build:subtitled   # with burned-in subtitles
npm run build:srt         # regenerate public/tracemind.srt from JSON
npm run lint              # tsc --noEmit
```

For full audio + subtitle render:

```bash
npx remotion render src/Root.tsx ProductFilm out/tracemind-final.mp4 \
  --props='{"withVoice":true,"withMusic":true,"withSubtitles":true}'
```

## Props panel (Studio)

`ProductFilm` exposes these props, editable on the right side of Remotion Studio:

| Prop | Default | Effect |
|---|---|---|
| `withSubtitles` | `false` | Burn the bottom subtitle bar |
| `withVoice` | `false` | Mount `<Audio src="audio/voice.mp3">` |
| `withMusic` | `false` | Mount `<Audio src="audio/bed.mp3">` |
| `voiceFile` | `audio/voice.mp3` | Override voice source |
| `musicFile` | `audio/bed.mp3` | Override music source |
| `musicVolume` | `0.32` | 0.0–1.0 |

## Audio workflow

1. Record the English VO from `docs/narration-en.md` (140 wpm, calm, LUFS -16)
2. Drop it at `public/audio/voice.mp3`
3. Drop a 72 s music bed at `public/audio/bed.mp3` (LUFS -25)
4. In Studio, flip `withVoice` / `withMusic` to preview
5. CLI render with the `--props` shown above

If audio files are missing while `withVoice/withMusic = true`, Remotion's preview will warn in the console; renders will fail on ffmpeg mix step. Keep the flags off until files are in place.

## Subtitle workflow

- Single source: `src/data/subtitles.json` (12 cues, frame-based)
- Edit, then `npm run build:srt` to refresh `public/tracemind.srt`
- Some cues set `hideOverlay: true` (e.g. S03 title, S12 outro) — they still appear in the `.srt` but are not burned into the video to avoid duplicating big typographic text

## Style conventions

- Springs come from `tokens/motion.ts` (`springs.soft`) — keep tempo consistent
- Colors only via `tokens/colors.ts` (10 tokens, no inline hex)
- Type sizes only from `tokens/type.ts` (`display` / `h1` / `h2` / `body`)
- Scene-internal `useCurrentFrame()` is local to that scene (wrapped in `<Sequence>`)
- Knowledge graph (S10) currently uses SVG mock; replace with `<OffthreadVideo>` of a real KG capture when ready

## Pre-flight

- [ ] `npm run lint` passes
- [ ] All 12 scenes render without overflow at 1920×1080
- [ ] `TOTAL_FRAMES === 2160`
- [ ] No API keys / personal emails / tokens in fixtures or screenshots
- [ ] Decision card reads `Watch · confidence 62`
- [ ] Audio LUFS = -16 after master
- [ ] `public/tracemind.srt` regenerated after subtitle edits

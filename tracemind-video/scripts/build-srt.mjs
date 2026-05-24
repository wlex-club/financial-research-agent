import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const FPS = 30;

const cues = JSON.parse(
  readFileSync(join(root, "src/data/subtitles.json"), "utf8")
);

function frameToSrtTime(frame) {
  const totalSec = frame / FPS;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const ms = Math.round((totalSec - Math.floor(totalSec)) * 1000);
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":") + "," + String(ms).padStart(3, "0");
}

const srt = cues
  .map((c, i) =>
    [
      String(i + 1),
      `${frameToSrtTime(c.startFrame)} --> ${frameToSrtTime(c.endFrame)}`,
      c.text,
      "",
    ].join("\n")
  )
  .join("\n");

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public/tracemind.srt"), srt, "utf8");
console.log(`wrote public/tracemind.srt (${cues.length} cues)`);

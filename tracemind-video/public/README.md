# public/ — Remotion 静态资源目录

`staticFile("foo/bar.png")` 会从此目录解析。

```
public/
├── tracemind.srt        # 自动生成,字幕单源在 src/data/subtitles.json
├── audio/
│   ├── voice.mp3        # ← 把英文旁白录制后放这里
│   └── bed.mp3          # ← 背景乐
├── screens/             # (可选) 真实产品截屏替换 mock
└── video/
    └── kg-clip.mp4      # (可选) 真实知识图谱交互录屏
```

## 旁白与底乐

录好后直接放：

```
public/audio/voice.mp3   # 72s 配音主轨, LUFS -16
public/audio/bed.mp3     # 72s 背景乐, LUFS -25
```

然后在 Remotion Studio 右上 props panel 把 `withVoice` / `withMusic` 勾上即可即时预览。
CLI 渲染：

```bash
npx remotion render src/Root.tsx ProductFilm out/tracemind.mp4 \
  --props='{"withVoice":true,"withMusic":true,"withSubtitles":true}'
```

## 字幕

字幕单源在 `src/data/subtitles.json`。修改后跑：

```bash
npm run build:srt
```

即可同步重新生成 `public/tracemind.srt`。

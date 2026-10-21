# Scene 01 — Human vs Computer

42 seconds · 1920 × 1080 · 30 FPS · 1260 frames · silent.

The presentation embeds the built Remotion Player between Introduction and Biology. Serve the repository and open `animation/index.html#human-and-computer`, or open `animation/bio/html/scene01.html` for a standalone, scrubbable preview. The bundled player is included, so previewing needs no Node installation or external CDN.

To edit, use Node.js 22+ and run these commands from `animation/bio/remotion`:

```sh
npm ci
npm run studio
npm run typecheck
npm run build:scene01
npm run render:scene01
```

`build:scene01` refreshes the presentation's bundled player. `render:scene01` writes `animation/bio/video/scene01-human-vs-computer.mp4`. If needed, pass an installed Chrome executable:

```sh
npm run render:scene01 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

All motion derives from Remotion frames, including stroke drawing, camera transforms, walking, expressions, springs, signals and fades. No audio or independently running CSS animation is used.

| Frames | Story |
| --- | --- |
| 0–269 | Human draws in, routes branch, uncertainty appears, then a workable choice succeeds. |
| 270–629 | Split screen introduces a conventional computer. Missing instructions cause a warning; completed instructions enable a choice. |
| 630–959 | Recognizable brain and geometric processor draw in and exchange visual signals, representing inspiration rather than identical mechanisms. |
| 960–1259 | Illustrations move up; the question and Action → Outcome → Learning appear. Frames 1230–1259 hold still. |

The reusable `LearningLoop` component at frame 1260 and the brain/processor placements in `BrainToLearning` define the handoff composition for the next animation. Reusable illustration components and `SourceCitation` live in `remotion/src/components.tsx`; deterministic motion helpers live in `remotion/src/motion.ts`.

The on-screen attribution `Bellman, 1966` follows the supplied script. Its exact source publication has not been independently verified.

# Scene 01 — Human vs Computer

Scene 02 is available as a separate page at `animation/scene02.html`. See [SCENE02.md](SCENE02.md) for its timeline, editing commands and MP4 export.

Scene 03 follows Scene 02 inside the presentation, with standalone preview at `animation/scene03.html`. See [SCENE03.md](SCENE03.md) for the 56-second timeline and Scene 04 handoff.

Scene 04 follows Scene 03 and introduces the reusable anatomical brain model. See [SCENE04.md](SCENE04.md) for its 30-second timeline, anatomical references, and Scene 05 handoff.

Scene 05 follows Scene 04 and explains dopamine firing, reward prediction errors, cue learning, omission, schematic experiments, and NAc inputs. See [SCENE05.md](SCENE05.md) for the 80-second timeline and Scene 06 handoff.

42 seconds · 1920 × 1080 · 30 FPS · 1260 frames · silent.

The presentation embeds the built Remotion Player between Introduction and Biology. Serve the repository and open `animation/index.html#human-and-computer`, or open `animation/scene01.html` for a standalone, scrubbable preview. The bundled player is included, so previewing needs no Node installation or external CDN.

To edit, use Node.js 22+ and run these commands from `animation/remotion`:

```sh
npm ci
npm run studio
npm run typecheck
npm run build:player
npm run render
```

`build:player` refreshes the presentation's bundled player. `render` writes `animation/media/scene01-human-vs-computer.mp4`. If needed, pass an installed Chrome executable:

```sh
npm run render -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

All motion derives from Remotion frames, including stroke drawing, camera transforms, walking, expressions, springs, signals and fades. No audio or independently running CSS animation is used.

| Frames | Story |
| --- | --- |
| 0–269 | Human draws in, routes branch, uncertainty appears, then a workable choice succeeds. |
| 270–629 | Split screen introduces a conventional computer. Missing instructions cause a warning; completed instructions enable a choice. |
| 630–959 | Recognizable brain and geometric processor draw in and exchange visual signals, representing inspiration rather than identical mechanisms. |
| 960–1259 | Illustrations move up; the question and Action → Outcome → Learning appear. Frames 1230–1259 hold still. |

The reusable `LearningLoop` component at frame 1260 and the brain/processor placements in `BrainToLearning` define the handoff composition for the next animation. Reusable illustration components and `SourceCitation` live in `src/components.tsx`; deterministic motion helpers live in `src/motion.ts`.

The on-screen attribution `Bellman, 1966` follows the supplied script. Its exact source publication has not been independently verified.

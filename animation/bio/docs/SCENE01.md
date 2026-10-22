Scene 03.5 is inserted between Scenes 03 and 04. Preview `animation/bio/html/scene035.html`; see [SCENE03_5.md](SCENE03_5.md) for its 70-second timeline and rendering commands.

# Scene 01 — Human vs Computer

Scene 02 is available as a separate page at `animation/bio/html/scene02.html`. See [SCENE02.md](SCENE02.md) for its timeline, editing commands and MP4 export.

Scene 03 follows Scene 02 inside the presentation, with standalone preview at `animation/bio/html/scene03.html`. See [SCENE03.md](SCENE03.md) for the 60-second timeline and Scene 04 handoff.

Scene 04 follows Scene 03 and introduces the reusable anatomical brain model. See [SCENE04.md](SCENE04.md) for its 30-second timeline, anatomical references, and Scene 05 handoff.

Scene 05 follows Scene 04 and explains dopamine firing, reward prediction errors, cue learning, omission, schematic experiments, and NAc inputs. See [SCENE05.md](SCENE05.md) for the 80-second timeline and Scene 06 handoff.

31 seconds · 1920 × 1080 · 30 FPS · 930 frames · silent.

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
| 0–209 | Human draws in, routes branch, uncertainty appears; the person stays at the crossroads. |
| 210–419 | Split screen introduces a conventional computer. Missing instructions cause a warning; the computer stays in place. |
| 420–599 | Recognizable brain and geometric processor draw in and exchange visual signals, representing inspiration rather than identical mechanisms. |
| 600–929 | The question starts at 20 seconds; Action → Outcome → Learning appear. Frames 900–929 hold still. |

The reusable `LearningLoop` component at its fixed internal frame 1230 and the brain/processor placements in `BrainToLearning` define the handoff composition for the next animation. Reusable illustration components and `SourceCitation` live in `src/components.tsx`; deterministic motion helpers live in `src/motion.ts`.

The on-screen attribution `Bellman, 1966` follows the supplied script. Its exact source publication has not been independently verified.

Scene 06 follows Scene 05 with the mesocortical pathway and a planning analogy. Preview `animation/bio/html/scene06.html`; see [SCENE06.md](SCENE06.md) for its 60-second timeline, validation and export commands.

Scene 07 follows Scene 06 with prefrontal impulse control and addiction. Preview `animation/bio/html/scene07.html`; see [SCENE07.md](SCENE07.md) for the 60-second timeline, scientific distinctions and export commands.

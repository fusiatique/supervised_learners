# Scene 02 — Risk, learning, and addiction

Open `animation/index.html` through Live Server: Scene 02 is the next presentation page after Scene 01, before Biology. You can also open `animation/bio/html/scene02.html` to preview it on its own. Its bundled player is included; no install is needed to watch it. Scene 01's page and MP4 are retained.

32 seconds · 960 frames · 30 FPS · 1920 × 1080 · no audio.

From `animation/bio/remotion` with Node.js 22+:

```sh
npm run studio
npm run typecheck
npm run check:scene02
npm run build:scene02
npm run render:scene02
```

In Studio, choose `Scene02-RiskAndAddiction`. The render command produces `animation/bio/video/scene02-risk-and-addiction.mp4`. To use an installed Chrome, append:

```sh
npm run render:scene02 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

The first second preserves Scene 01’s closing artwork exactly. During seconds 1–4.5, the diagram shows action, a positive outcome, and a curved feedback loop; during 4.5–8 seconds the same action repeats despite a red negative outcome. At second 8, the negative-outcome diagram shrinks and fades directly into the stick-man sequence; the question does not return. The full video remains 32 seconds, with the extra second held at the end.

`bio/remotion/src/OpeningLearningCycle.tsx` implements this deterministic opening. Timing and rendering checks preserve frames 0–30 and the direct outgoing transition at frames 240–305. The MP4 remains silent; no narration was edited.

The table below describes the unchanged story timeline after the eight-second opening hold. Add 240 to these frame values for video timestamps.

| Story frames | Visual story |
| --- | --- |
| 0–59 | Scene 01's closing brain, processor and learning loop shrink and fade as the new character and crossroads draw in. |
| 60–119 | Apple and neutral mystery box appear; the character considers the options. |
| 120–209 | The character walks to the mystery box, encounters a warning and looks disappointed. |
| 210–269 | It walks back along the same path and recalls the warning. |
| 270–329 | The safer route brightens; the harmful route dims. |
| 330–449 | It walks to the apple and receives a positive outcome. |
| 450–509 | It returns to the crossroads; the box crossfades into a neutral capsule. |
| 510–569 | Looking and small movements toward both routes show hesitation. |
| 570–629 | It approaches the capsule while remembering the warning; no consumption is shown. |
| 630–659 | “WHEN CONSEQUENCES NO LONGER GUIDE BEHAVIOUR” appears; both paths dim. |
| 660–689 | The entire final composition holds still. |

The citation crossfades around frame 450 from `Yates & Stone, 1992` to `Piantadosi et al., 2021`, as supplied in the narration.

`bio/remotion/src/Scene02_RiskAndAddiction.tsx` owns the timeline. `bio/remotion/src/risk-components.tsx` contains reusable apple, box, capsule, warning, thought bubble and crossroads artwork. Both walking positions and visible paths use the same cubic control points. The shared `HumanCharacter` now accepts optional expressions, gaze and natural arm movement, retaining its original defaults for Scene 01.

To open Scene 03 on the exact same artwork, render `RiskAndAddictionArtwork` with `frame={660}` inside the same navy 1920 × 1080 SVG canvas. Reuse the scene's `SourceCitation` separately if needed. Scene 02 illustrates one possible pattern of persistent drug-seeking despite harm, rather than a universal behavior or an inability to learn.

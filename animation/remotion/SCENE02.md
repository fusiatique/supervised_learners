# Scene 02 — Risk, learning, and addiction

Open `animation/index.html` through Live Server: Scene 02 is the next presentation page after Scene 01, before Biology. You can also open `animation/scene02.html` to preview it on its own. Its bundled player is included; no install is needed to watch it. Scene 01's page and MP4 are retained.

23 seconds · 690 frames · 30 FPS · 1920 × 1080 · no audio.

From `animation/remotion` with Node.js 22+:

```sh
npm run studio
npm run typecheck
npm run check:scene02
npm run build:scene02
npm run render:scene02
```

In Studio, choose `Scene02-RiskAndAddiction`. The render command produces `animation/media/scene02-risk-and-addiction.mp4`. To use an installed Chrome, append:

```sh
npm run render:scene02 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

| Frames | Visual story |
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
| 630–659 | “LEARNING CAN BECOME MALADAPTIVE” appears; both paths dim. |
| 660–689 | The entire final composition holds still. |

The citation crossfades around frame 450 from `Yates & Stone, 1992` to `Piantadosi et al., 2021`, as supplied in the narration.

`src/Scene02_RiskAndAddiction.tsx` owns the timeline. `src/risk-components.tsx` contains reusable apple, box, capsule, warning, thought bubble and crossroads artwork. Both walking positions and visible paths use the same cubic control points. The shared `HumanCharacter` now accepts optional expressions, gaze and natural arm movement, retaining its original defaults for Scene 01.

To open Scene 03 on the exact same artwork, render `RiskAndAddictionArtwork` with `frame={660}` inside the same navy 1920 × 1080 SVG canvas. Reuse the scene's `SourceCitation` separately if needed. Scene 02 illustrates one possible pattern of persistent drug-seeking despite harm, rather than a universal behavior or an inability to learn.

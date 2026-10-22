# Scene 04 — Mesocorticolimbic introduction

In the presentation, this scene follows Scene 03. Open `animation/index.html#mesocorticolimbic-introduction` using Live Server. `animation/bio/html/scene04.html` also offers standalone playback and scrubbing.

44 seconds · 1320 frames · 30 FPS · 1920 × 1080 · silent.

From `animation/bio/remotion` with Node.js 22+:

```sh
npm run studio
npm run typecheck
npm run check:scene04
npm run build:scene04
npm run render:scene04
```

Studio composition: `Scene04-MesocorticolimbicIntroduction`.
Output: `animation/bio/video/scene04-mesocorticolimbic-introduction.mp4`.
To use an installed Chrome, append:

```sh
npm run render:scene04 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

| Playback frames | Visual story |
| --- | --- |
| 0–239 | Existing head, brain drawing, zoom and VTA introduction, unchanged. |
| 240–359 (8–12s) | Progressively reveal the shared dopamine projections, stagger axonal activity, and introduce the system title. |
| 360–509 (12–17s) | Make room for three unlabelled drug-associated symbols, each with a different abstract visual effect. |
| 510–629 (17–21s) | Conceptual curved signals converge on the circuitry; staggered activity increases, then the external symbols disappear. |
| 630–779 (21–26s) | Emphasize the VTA, reveal a magnified inset containing three dopamine neurons, and connect one illustrated axon to the mesolimbic projection. |
| 780–869 (26–29s) | A small crossroads example links the circuitry to risky reward seeking. Collapse the inset, remove the character and restore the legacy brain view. |
| 870–1319 (29–44s) | Existing natural-reward/drug comparison and Scene 05 handoff, unchanged. |

The revised interval uses **Piantadosi et al., 2021**, including throughout 21–29s. At 29s the existing comparison resumes with its original Feltenstein et al., 2009 citation. SourceCitation styling is unchanged.

`scene04-living-system.tsx` uses playback frames 240–869 only. It reuses BrainAnatomy, DopamineParticle, BrainRegionLabel, SimpleNeuron, HumanCharacter and the reward/warning/capsule symbols. All camera and pulse motion is computed from the frame, so reverse scrubbing is deterministic. The activity phase changes continuously as event frequency increases. External open-ring indicators represent conceptual drug-related influences, while small yellow pulses follow the canonical axon geometry. The different symbol effects make no claims about specific pharmacological mechanisms. The inset illustrates dopamine neurons within the VTA, rather than asserting that all VTA neurons are dopaminergic.

## Reusable anatomy

`bio/remotion/src/BrainAnatomy.tsx` defines `BrainAnatomy`, `BrainRegionHighlight`, `DopaminePathway`, `DopamineParticle`, and `BrainRegionLabel`.

The component accepts position/scale, drawing progress, cortical opacity, per-region highlights and opacity, optional labels, per-path drawing and visibility, and frame-based activity. `BRAIN_REGIONS`, `BRAIN_PATHWAYS`, `BRAIN_CENTER` and `BRAIN_BOUNDS` provide shared coordinates. Use `anatomyToScreen` for leader lines or camera targets.

The canonical drawing has anterior on the left. `anteriorRight` defaults to true, mirroring the whole model consistently inside the right-facing head. The VTA is at the ventral midbrain/upper brainstem, NAc in the ventral anterior forebrain, and PFC at the anterior cortical pole. NAc is projected into the medial cutaway rather than asserted to lie on the exact midsagittal plane. Outlines adapt the repository's existing `bio-dopamine` SVG. This is an anatomically informed schematic, not a segmented atlas or a tractography reconstruction.

Projection layout was checked against the human VTA connectivity study [Coenen et al., 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5964495/) and the ventral midbrain/ventral striatal projection study [Ikemoto, 2007](https://pmc.ncbi.nlm.nih.gov/articles/PMC2134972/). Individual paths simplify established projection relationships; they do not reproduce individual axons or exact subject-specific trajectories.

Moving yellow particles represent activity along neuronal projections. They do not depict dopamine molecules moving freely from VTA to cortex or NAc. External green/red pulses and activity brightness are conceptual, with no quantitative natural-versus-drug comparison.

## Scene 05 handoff

Reuse `<MesocorticolimbicArtwork frame={900}/>` inside a navy 1920 × 1080 SVG canvas and continue the frame value to carry on particle activity. `getScene04Camera(900)` supplies the final VTA-centered camera. The camera's ending position and scale remain clamped after frame 900 so the next scene can interpolate from them explicitly. Keep `SourceCitation` separate if the next narration uses a different source.

Timing update: the former pathway hold is replaced by the animated 8–29s sequence above. Natural rewards now start at 29s (playback frame 870); the existing drug entrance and subsequent pulses follow eight seconds later than before. The final rewards sequence is stretched from nine to fifteen seconds, adding six seconds of viewing time. Duration: 44s / 1320 frames. Source-frame anatomy and the ending used by Scene 05 are unchanged.

Shared anatomy update: the brain illustration is now refined across every scene that uses it. Scene timing and the 8–29s narrative sequence remain unchanged. See [Shared brain illustration](BRAIN_ANATOMY.md) for geometry, controls and schematic conventions.

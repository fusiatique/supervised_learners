# Scene 04 — Mesocorticolimbic introduction

In the presentation, this scene follows Scene 03. Open `animation/index.html#mesocorticolimbic-introduction` using Live Server. `animation/bio/html/scene04.html` also offers standalone playback and scrubbing.

30 seconds · 900 frames · 30 FPS · 1920 × 1080 · silent.

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

| Frames | Visual story |
| --- | --- |
| 0–59 | Scene 03's continuing particles and fading partial neuron accompany a drawing right-facing head profile. |
| 60–119 | The medial brain cutaway draws inside the head. |
| 120–209 | The camera moves toward the brain; the head outline fades. |
| 210–269 | Highlight and label the ventral midbrain VTA. |
| 270–359 | Draw simplified VTA projections toward ventral forebrain NAc and anterior PFC. |
| 360–449 | Activity moves along both pathways beneath the mesocorticolimbic system title. |
| 450–629 | Emphasize the mesolimbic projection and reward-related learning/motivation. |
| 630–749 | Make room for natural-reward icons and the drug-associated capsule. |
| 750–809 | A green external pulse approaches the brain; mesolimbic activity increases. |
| 810–869 | A muted-red external pulse approaches; the overlapping circuitry responds. |
| 870–899 | External symbols dim while a subtle VTA-centered zoom prepares Scene 05. |

The on-screen citations follow the supplied narration: Piantadosi et al., 2021 during the first ~20 seconds, then Feltenstein et al., 2009. They fade sequentially around frame 600 to keep different citation strings from overlapping.

## Reusable anatomy

`bio/remotion/src/BrainAnatomy.tsx` defines `BrainAnatomy`, `BrainRegionHighlight`, `DopaminePathway`, `DopamineParticle`, and `BrainRegionLabel`.

The component accepts position/scale, drawing progress, cortical opacity, per-region highlights and opacity, optional labels, per-path drawing and visibility, and frame-based activity. `BRAIN_REGIONS`, `BRAIN_PATHWAYS`, `BRAIN_CENTER` and `BRAIN_BOUNDS` provide shared coordinates. Use `anatomyToScreen` for leader lines or camera targets.

The canonical drawing has anterior on the left. `anteriorRight` defaults to true, mirroring the whole model consistently inside the right-facing head. The VTA is at the ventral midbrain/upper brainstem, NAc in the ventral anterior forebrain, and PFC at the anterior cortical pole. NAc is projected into the medial cutaway rather than asserted to lie on the exact midsagittal plane. Outlines adapt the repository's existing `bio-dopamine` SVG. This is an anatomically informed schematic, not a segmented atlas or a tractography reconstruction.

Projection layout was checked against the human VTA connectivity study [Coenen et al., 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5964495/) and the ventral midbrain/ventral striatal projection study [Ikemoto, 2007](https://pmc.ncbi.nlm.nih.gov/articles/PMC2134972/). Individual paths simplify established projection relationships; they do not reproduce individual axons or exact subject-specific trajectories.

Moving yellow particles represent activity along neuronal projections. They do not depict dopamine molecules moving freely from VTA to cortex or NAc. External green/red pulses and activity brightness are conceptual, with no quantitative natural-versus-drug comparison.

## Scene 05 handoff

Reuse `<MesocorticolimbicArtwork frame={900}/>` inside a navy 1920 × 1080 SVG canvas and continue the frame value to carry on particle activity. `getScene04Camera(900)` supplies the final VTA-centered camera. The camera's ending position and scale remain clamped after frame 900 so the next scene can interpolate from them explicitly. Keep `SourceCitation` separate if the next narration uses a different source.

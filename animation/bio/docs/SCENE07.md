# Scene 07 — Prefrontal cortex, impulse control and addiction

60 seconds · 1800 frames · 30 FPS · 1920 × 1080 · silent.

Immediately follows Scene 06 in `animation/index.html`. Standalone preview: `animation/bio/html/scene07.html`. Studio composition: `Scene07-PrefrontalControlAndAddiction`; React component: `Scene07_PrefrontalControlAndAddiction`.

| Time | Frames | Visual story |
| --- | --- | --- |
| 0–8 s | 0–239 | Continue Scene 06's exact held brain/camera; introduce a character between apple and drug-associated options, desire and control. |
| 8–18 s | 240–539 | A blue pedal metaphor activates as the character slows and stops; weakened control allows further approach. |
| 18–31 s | 540–929 | Projected striatal outline; schematic higher/lower D2 availability, a dotted association to lower PFC activity, and salience/control/decision icons. |
| 31–43 s | 930–1289 | Repeated neutral cocaine symbols, conceptual synaptic adaptation, stronger drug-cue versus weaker natural-reward responses. |
| 43–51 s | 1290–1529 | Subdivide the human PFC without naming extra regions; transition to a distinct medial-view rat brain and identify rodent prelimbic cortex. |
| 51–60 s | 1530–1799 | Side-by-side schematic cocaine-exposed rats: stimulation stops further approach; inhibition permits greater approach. Both outcomes remain visible in the final hold. |

`T07` defines narration boundaries. All motion, drawing and opacity come from frame-based helpers. `getScene07Camera(0)` matches Scene 06's held camera. `PrelimbicExperimentArtwork` at frame 1770 is reusable for the next scene. Frames 1770–1799 are a complete visual hold.

Reusable additions in `prefrontal-control-components.tsx`: `BehavioralBrake`, `D2ReceptorAvailability`, `SynapticAdaptation`, `RatBrain`, `RatIllustration`, and the pure `getRatExperimentPose` function. The rat silhouette preserves the geometry established in Scene 05.

Scientific presentation:

- The striatal illustration is a labelled conceptual projection into the existing cutaway, not an atlas segmentation.
- D2 drawings represent availability schematically, not measured counts or dopamine concentration. The association with PFC activity uses a dotted line with no causal arrow.
- The brake is labelled as a metaphor. Human and rodent anatomy are separate; prelimbic labels appear only with the rat brain.
- Adaptation uses gradual connection changes without receptors, biochemical cascades or invented mechanisms. The behavioral comparison is labelled as possible changes following chronic exposure.
- Experimental panels use no apparatus, stimulation method, numerical results or invented trial procedure. The caption identifies a schematic comparison in cocaine-exposed rats.
- Supplied on-screen citations: Volkow et al., 2019; Uhl et al., 2019 during seconds 15–31, then Volkow et al., 2019 during seconds 31–60.
- Experimental direction was cross-checked against the original study, [Chen et al., 2013, Nature](https://www.nature.com/articles/nature12024). This implementation reference does not replace the requested narration citations.

```sh
npm run typecheck
npm run check:scene07
npm run build:scene07
npm run render:scene07 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Export: `animation/bio/video/scene07-prefrontal-control-addiction.mp4`.

# Scene 06 — Mesocortical pathway, planning and action selection

56 seconds · 1680 frames · 30 FPS · 1920 × 1080 · silent.

Follows Scene 05 in `animation/index.html`; standalone preview: `animation/bio/html/scene06.html`. React component: `Scene06_MesocorticalPathwayAndPlanning`; Studio composition: `Scene06-MesocorticalPathwayAndPlanning`.

| Time | Frames | Story |
| --- | --- | --- |
| 0–13 s | 0–389 | Doorbell predicts a delivery bag; both become the reward-learning jigsaw piece. Zoom out to an incomplete decision-making puzzle. The missing piece asks “WHAT ACTION?” and becomes a glowing line leading to the VTA position. No brain or anatomical labels appear before 13 seconds. |
| 13–20 s | 390–599 | Highlight VTA, draw the canonical VTA–PFC projection, highlight PFC during 19–20 seconds and label PFC and the mesocortical pathway (pathway title starts with VTA at 13 seconds). Cooper et al., 2017. |
| 20–28 s | 600–839 | Focus on PFC; a goal-and-steps inset illustrates planning. Alkam et al., 2025. |
| 28–33 s | 840–989 | Stickman previews reward and risk, then chooses. “PREDICT → EVALUATE → CHOOSE” appears at 29 seconds; the movement is compressed to finish by 33 seconds. |
| 33–37 s | 990–1109 | Human-brain-to-rat transition, rodent brain schematic, and two VTA projection targets. |
| 37–43 s | 1110–1289 | Cocaine example; altered incoming connections onto NAc-projecting VTA neurons. |
| 43–49 s | 1290–1469 | Unpleasant-experience example; altered incoming connections onto PFC-projecting VTA neurons. |
| 49–53 s | 1470–1589 | Equal comparison, summary title and gradual return to the existing brain. |
| 53–56 s | 1590–1679 | Retained final brain sequence and one-second hold. |

`T06` holds source-animation boundaries; playback delays the brain reveal to 13 seconds and cuts at 20 seconds to the former 25-second point. The pathway title appears with VTA at 13 seconds. The return begins just before 55 seconds to keep the camera movement gradual; playback frame 1650 starts an exact one-second final hold. The ending retains the central brain, VTA, both projections, a stronger PFC highlight, and a dimmer NAc for Scene 07. `MesocorticalPlanningArtwork` at frame 1770 is reusable for that handoff.

The brain, regional coordinates, pathways, characters, source citations, arrows, reward and warning symbols are reused. `planning-components.tsx` adds goal representations, imagined trajectories and schematic projection-neuron insets. Imagined actions use translucent blue outlines, dashed paths and no reward pulses. The real character remains at the crossroads until both previews have finished.

```sh
npm run typecheck
npm run check:scene06
npm run build:scene06
npm run render:scene06 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Export: `animation/bio/video/scene06-mesocortical-planning.mp4`.

The 33–53s section uses `rodent-pathway-comparison.tsx`, with a separate schematic rodent anatomy and matched neuron panels. Incoming blue connections show mixed conceptual brightness/width changes; outgoing yellow axons are invariant. No experimental procedure or numerical change is represented. “Cooper et al., 2017” remains visible throughout.

Scientific sources: [Cooper et al., 2017, Reward Circuitry in Addiction](https://pmc.ncbi.nlm.nih.gov/articles/PMC5509624/) summarizes projection-specific input modulation and cites [Lammel et al., 2011](https://doi.org/10.1016/j.neuron.2011.03.025) as the underlying experiment. The screen diagrams are schematic and do not imply exclusive reward/aversion functions.

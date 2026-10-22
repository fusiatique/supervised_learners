# Scene 06 — Mesocortical pathway, planning and action selection

60 seconds · 1800 frames · 30 FPS · 1920 × 1080 · silent.

Follows Scene 05 in `animation/index.html`; standalone preview: `animation/scene06.html`. React component: `Scene06_MesocorticalPathwayAndPlanning`; Studio composition: `Scene06-MesocorticalPathwayAndPlanning`.

| Time | Frames | Story |
| --- | --- | --- |
| 0–9 s | 0–269 | Continue Scene 05's held NAc-input artwork and camera; value gives way to a stationary character considering two actions. |
| 9–19 s | 270–569 | Highlight VTA, draw the canonical VTA–PFC projection, label PFC and the mesocortical pathway. Cooper et al., 2017. |
| 19–29 s | 570–869 | Focus on PFC; a goal-and-steps inset illustrates planning. Alkam et al., 2025. |
| 29–40 s | 870–1199 | Expand the planning example; translucent blue characters and dashed paths preview reward and risk before the solid character chooses. Labelled as a planning analogy. Alkam et al., 2025. |
| 40–46 s | 1200–1379 | Complete the chosen action, return to the brain and show a selected-action icon. |
| 46–60 s | 1380–1799 | Compare canonical projections and schematic incoming connections onto VTA neurons defined by NAc/PFC targets. Cocaine and an aversive warning accompany changes to blue incoming connections; outgoing dopamine speed is not used to represent these findings. Cooper et al., 2017. |

`T06` holds the narration boundaries. The return begins just before 58 seconds to keep the camera movement gradual; frame 1770 starts an exact one-second final hold. The ending retains the central brain, VTA, both projections, a stronger PFC highlight, and a dimmer NAc for Scene 07. `MesocorticalPlanningArtwork` at frame 1770 is reusable for that handoff.

The brain, regional coordinates, pathways, characters, source citations, arrows, reward and warning symbols are reused. `planning-components.tsx` adds goal representations, imagined trajectories and schematic projection-neuron insets. Imagined actions use translucent blue outlines, dashed paths and no reward pulses. The real character remains at the crossroads until both previews have finished.

```sh
npm run typecheck
npm run check:scene06
npm run build:scene06
npm run render:scene06 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Export: `animation/media/scene06-mesocortical-planning.mp4`.

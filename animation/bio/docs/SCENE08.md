# Scene 08 — Synaptic plasticity, dopamine and addiction

70 seconds · 2100 frames · 30 FPS · 1920 × 1080 · silent.

Standalone preview: `animation/bio/html/scene08.html`. The presentation plays it after Scene 07. React component: `Scene08_SynapticPlasticityAndAddiction`. Remotion composition ID: `Scene08-SynapticPlasticityAndAddiction` (Remotion does not allow underscores in IDs).

| Time | Frames | Story |
| --- | --- | --- |
| 0–8s | 0–239 | One network draws in, zooms toward a connected pair, and reveals a simplified synaptic junction. |
| 8–15s | 240–449 | Repeated coordinated activity illustrates activity-dependent strengthening. |
| 15–22s | 450–659 | Before/after LTP: the same illustrative test input produces a larger postsynaptic response. |
| 22–27s | 660–809 | Before/after LTD: the same test input produces a smaller response. |
| 27–30s | 810–899 | Zoom out to the same network with a mixture of stronger and weaker connections. |
| 30s | 900 | Completed, stable learned pattern. Dopamine is still absent at this exact frame. |
| 30–39s | 901–1169 | Yellow dopamine messenger enters; expected/actual reward comparison; selective modulation of recently active connections. |
| 39–45s | 1170–1349 | Cue, apple and action associate with the highlighted network route. |
| 45–54s | 1350–1619 | Repeated neutral drug exposures; accumulating network adaptations; existing human brain and separate NAc/PFC network insets. |
| 54–61s | 1620–1829 | Conceptual comparison of stronger drug-cue and weaker natural-reward responses. |
| 61–67s | 1830–2009 | Time passes after stopping; learned patterns persist; a returning cue illustrates possible craving and relapse vulnerability. |
| 67–70s | 2010–2099 | The stimulus disappears but the altered network remains; final message and exact one-second hold. |

## Implementation

- `Scene08_SynapticPlasticityAndAddiction.tsx` contains the named timing boundaries, state functions and complete composition.
- `plasticity-components.tsx` provides reusable `PlasticSynapse` and `PlasticNeuralNetwork` components. Network topology is fixed throughout; strengths are independently interpolated.
- Ordinary electrical activity is blue; the established yellow `DopamineMessenger` represents dopamine-related modulation. No dopamine modulation is shown at or before frame 900.
- Test input amplitude is held constant across baseline, potentiated and depressed examples. Illustrative receiving response amplitude scales with efficacy.
- Line thickness/brightness is a visual metaphor for functional efficacy, not measured axon diameter or a reconstruction of an experiment.
- The general activity-dependent examples do not imply that simultaneous activity always induces LTP or that inactivity alone necessarily induces LTD. No receptors, proteins or invented quantitative changes are depicted.
- Anatomical insets use `BrainAnatomy` and the existing `BRAIN_REGIONS` coordinates. The NAc and PFC have separate example networks, not one shared physical synapse. Cue response lanes are conceptual diagrams, not new anatomical pathways.
- Persistence and relapse are expressed as possibilities, not inevitabilities. State is deterministic and the final second is an exact hold.

## Source

The screen citation remains exactly **Volkow et al., 2019**, from 45 seconds through the conclusion. The corresponding review is [The Neuroscience of Drug Reward and Addiction](https://pmc.ncbi.nlm.nih.gov/articles/PMC6890985/). It discusses synaptic adaptations, altered cue/natural-reward responsivity and persistent relapse vulnerability. No additional scientist names or citations are introduced on screen.

## Build and validate

From `animation/bio/remotion`, using the existing Node.js setup:

```sh
npm run typecheck
npm run check:scene08
npm run build:scene08
npm run render:scene08 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Player bundle: `animation/bio/player/scene08-player.js`.
Video export: `animation/bio/video/scene08-synaptic-plasticity-and-addiction.mp4`.

The check covers duration, the 30-second narration boundary, late introduction of dopamine/drugs, test-input and response relationships, invariant network geometry, anatomical region placement, citation timing, reverse scrubbing and the final hold.

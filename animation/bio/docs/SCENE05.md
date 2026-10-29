# Scene 05 — Dopamine reward prediction errors

Open `animation/index.html#dopamine-reward-prediction-errors` in Live Server. This page follows Scene 04 in the same presentation. The standalone player is `animation/bio/html/scene05.html`.

80 seconds · 2400 frames · 30 FPS · 1920 × 1080 · silent.

From `animation/bio/remotion` with Node.js 22+:

```sh
npm run studio
npm run typecheck
npm run check:scene05
npm run build:scene05
npm run render:scene05
```

Studio composition: `Scene05-DopamineRewardPredictionErrors`.
Output: `animation/bio/video/scene05-dopamine-reward-prediction-errors.mp4`.
To use an installed Chrome:

```sh
npm run render:scene05 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

| Frames | Story |
| --- | --- |
| 0–299 | Continue Scene 04's camera and fixed anatomy. A conceptual VTA inset includes dopamine neurons and other cell types. |
| 300–599 | Pull back, identify NAc, retrace the established mesolimbic projection, and show axonal activity. |
| 600–899 | Draw a single neuron and a synthetic spike train, contrasting sparse background events and a closely spaced burst. |
| 900–1199 | Compare expected and actual reward bars. Highlight a positive conceptual error and connect it to a burst. |
| 1200–1559 | A seated character sees unexpected food, then paired bell/food events, then learned prediction. The burst aligns first with reward and later with the cue. Two comparison traces make the timing explicit. |
| 1560–1799 | The learned cue still has a burst. The expected reward is omitted; spikes pause during the expected-outcome interval. No downward spikes are used. |
| 1800–2069 | Show expectation updating, a computational analogy, and schematic stimulation/inhibition conditions in a rodent. |
| 2070–2399 | Return to the existing brain. Blue PFC, hippocampal and BLA inputs converge on NAc alongside the yellow VTA projection. A conceptual motivational-value indicator changes. The final second holds. |

`T05` contains named scene boundaries. `FOOD_TRIALS`, `getFoodEvents`, and `getFoodSpikeTimes` determine both visual event times and spike timing, so reward/cue responses remain synchronized when scrubbing.

## Reusable components

`bio/remotion/src/dopamine-learning-components.tsx` exports `DopamineNeuron`, `DopamineSpikeTrain`, `RewardPredictionError`, `FoodDeliveryExample`, `CueRewardTimeline`, `RodentExperimentIllustration`, `NeuralInputPathway`, and `MotivationalValueIndicator`.

Spike trains use sparse, burst, and pause modes. All individual spikes have the same upward height. The dip removes events relative to background activity; it never represents negative action potentials. A caller can supply explicit spike times for compound cue-burst/omission-pause trials.

The reward-bar component accepts expected/actual amounts and renders positive, zero, or negative differences without claiming to measure dopamine. The value indicator has no numerical readout and is labeled conceptual.

The shared human gains an optional seated leg pose, and the shared neuron gains an optional outline color. Original defaults are retained. The existing brain geometry and VTA/NAc/PFC positions are reused. `BRAIN_REGIONS` additionally supplies schematic medial-temporal vHPC and BLA locations. The vHPC label uses rodent circuit terminology; its human anatomical counterpart is broadly anterior hippocampus. These lateral structures are projected into the same explanatory cutaway, not asserted to lie on the exact midsagittal plane.

Blue `NAc_INPUTS` are separate from the yellow dopamine projections. They are not identified as additional dopamine pathways.

## Sources and interpretation

On-screen author/year strings follow the supplied narration. The rodent section keeps `Piantadosi et al., 2021` throughout 63–69 seconds, then switches to `Cooper et al., 2017` when the anatomical inputs appear. This aligns the specific experimental citation with the actual storyboard rather than switching to the anatomical citation prematurely at 64 seconds.

The canonical response pattern was checked against [Schultz, Dayan & Montague, 1997](https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.pdf). The schematic causal illustration is consistent with stimulation evidence in [Steinberg et al., 2013](https://www.nature.com/articles/nn.3413) and inhibition evidence in [Chang et al., 2016](https://www.nature.com/articles/nn.4191). Multiple accumbens input relationships were checked against [Britt et al., 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3607383/).

The spike trains are illustrative, not experimental recordings. The rodent scene is explicitly schematic and does not reconstruct a particular apparatus or protocol. The visual presents a canonical response pattern in some dopamine neurons, not an assertion that every dopamine neuron or population responds identically. It does not identify dopamine with pleasure or claim that NAc alone stores a mathematical state value.

## Scene 06 handoff

Use `<AccumbensInputsArtwork frame={2370}/>` inside the existing navy 1920 × 1080 SVG canvas. This is the final held artwork. `ENDING_CAMERA05` supplies the camera for shifting attention toward PFC next. VTA/NAc, the established dopamine projection, additional blue inputs, and the conceptual learned-value indicator remain visible. Reuse `SourceCitation` separately as appropriate for the next narration.

Removed the 66–69s cue/reward comparison shot. A 12-frame eased crossfade connects the predictive-cue example directly to the omitted-reward sequence. All following footage shifts three seconds earlier; total duration is 130 seconds.

Follow-up: removed the comparison-chart artwork itself, including its residual fade after the cut. The 66-second transition now fades through the background over 12 frames instead of layering outgoing and incoming charts. Total duration remains 130 seconds.

The negative-outcome to expectation-update transition now receives one extra second through smooth, monotonic playback easing over 70–74s. The negative-outcome title stays visible longer and the update illustration enters with a 45-frame eased fade. Total duration: 131 seconds.

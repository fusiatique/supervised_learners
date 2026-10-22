# Scene 03.5 — Dopamine and reward learning

65 seconds · 1950 frames · 30 FPS · 1920 × 1080 · silent.

Inserted between Scene 03 and Scene 04 in `animation/index.html`. Standalone preview: `animation/bio/html/scene035.html`. Studio composition: `Scene03-5-DopamineIntroduction`; React component: `Scene03_5_DopamineIntroduction`.

| Time | Frames | Visual story |
| --- | --- | --- |
| 0–5 s | 0–149 | Continue Scene 03's particle/neuron artwork, ask what happens inside the brain, introduce dopamine. |
| 5–12 s | 150–359 | Simplified neural communication; dopamine as neurotransmitter and chemical messenger. |
| 12–21 s | 360–629 | Two people with a heart, shopping bag, aromatic cookies; highlights run sequentially during 14–15.5 seconds, then focus transfers to the cookies and holds before reinforcement starts at 21 seconds. |
| 21–27 s | 630–809 | Repeated cookie-reaching/eating gestures, reward pulses and a strengthened association. |
| 27–36 s | 810–1079 | Dark storm clouds and recurring lightning continue throughout the cocaine section, including the hold. A large screen-spanning strike starts exactly at 28 seconds (frame 840). Hold the 32-second composition through 35 seconds before resuming. |
| 36–45 s | 1080–1349 | Question the pleasure-only interpretation then cut directly to learning and motivation, omitting the branching DA-node animation. Volkow et al., 2011. |
| 45–52 s | 1350–1559 | Shortened reward-seeking and avoidance example; cut at 52 seconds directly to expected versus actual reward. Bromberg-Martin et al., 2010. |
| 52–65 s | 1560–1949 | One expected cookie versus two actual cookies; reward prediction error; hold the comparison two extra seconds so the neuron transition starts at 63 seconds, then particles and partial brain. |

`T035` names narration boundaries. Every position, drawing, glow and reveal derives from the composition frame. Citations use the shared component; no audio, external assets, new receptors, firing mechanisms or numerical reinforcement claims are added.

The end uses `DopamineCircuitBridge` at frame 29; Scene 04 continues it at frame 30. Scene 04 starts with 35% of its existing brain drawing and completes it during its opening; its scientific explanation, region placement and duration are preserved.

```sh
npm run typecheck
npm run check:scene035
npm run build:scene035
npm run render:scene035 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Export: `animation/bio/video/scene035-dopamine-introduction.mp4`.

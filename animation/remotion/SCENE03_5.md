# Scene 03.5 — Dopamine and reward learning

70 seconds · 2100 frames · 30 FPS · 1920 × 1080 · silent.

Inserted between Scene 03 and Scene 04 in `animation/index.html`. Standalone preview: `animation/scene035.html`. Studio composition: `Scene03-5-DopamineIntroduction`; React component: `Scene03_5_DopamineIntroduction`.

| Time | Frames | Visual story |
| --- | --- | --- |
| 0–5 s | 0–149 | Continue Scene 03's particle/neuron artwork, ask what happens inside the brain, introduce dopamine. |
| 5–12 s | 150–359 | Simplified neural communication; dopamine as neurotransmitter and chemical messenger. |
| 12–21 s | 360–629 | Two people with a heart, shopping bag, aromatic cookies; highlights run sequentially during 14–15.5 seconds, then focus transfers to the cookies and holds before reinforcement starts at 21 seconds. |
| 21–27 s | 630–809 | Repeated cookie-reaching/eating gestures, reward pulses and a strengthened association. |
| 27–33 s | 810–989 | Neutral cocaine container, conceptual stronger reinforcement and warning; addiction statement completes by frame 989. |
| 33–47 s | 990–1409 | Question the pleasure-only interpretation and open two learning pathways. Volkow et al., 2011. |
| 47–59 s | 1410–1769 | Approach an apple, turn away from a warning, connect learning and motivation. Bromberg-Martin et al., 2010. |
| 59–70 s | 1770–2099 | One expected cookie versus two actual cookies; reward prediction error; particles and partial brain. |

`T035` names narration boundaries. Every position, drawing, glow and reveal derives from the composition frame. Citations use the shared component; no audio, external assets, new receptors, firing mechanisms or numerical reinforcement claims are added.

The end uses `DopamineCircuitBridge` at frame 29; Scene 04 continues it at frame 30. Scene 04 starts with 35% of its existing brain drawing and completes it during its opening; its scientific explanation, region placement and duration are preserved.

```sh
npm run typecheck
npm run check:scene035
npm run build:scene035
npm run render:scene035 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Export: `animation/media/scene035-dopamine-introduction.mp4`.

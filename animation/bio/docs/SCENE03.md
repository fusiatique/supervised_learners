# Scene 03 — Addiction and reward learning

Open `animation/index.html` in Live Server. Scene 03 follows Scene 02 in the presentation and pauses when you leave its page. Its direct link is `#addiction-and-reward-learning`. `animation/bio/html/scene03.html` also provides standalone playback and scrubbing.

60 seconds · 1800 frames · 30 FPS · 1920 × 1080 · silent.

From `animation/bio/remotion` with Node.js 22+:

```sh
npm run studio
npm run typecheck
npm run check:scene03
npm run build:scene03
npm run render:scene03
```

Studio composition: `Scene03-AddictionAndRewardLearning`.
MP4 output: `animation/bio/video/scene03-addiction-and-reward-learning.mp4`.
To render using an installed Chrome:

```sh
npm run render:scene03 -- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

| Frames | Visual story |
| --- | --- |
| 0–239 | Continue Scene 02's exact object positions. Repeated approaches to the capsule persist alongside warnings and a broken-heart symbol. |
| 240–479 | Retrace the route, approach again, and reveal a brief positive response. A reward symbol becomes a dot and an action–outcome association. |
| 480–809 | Repeated choices and reward pulses strengthen the conceptual connection. The crossroads gives way to an association diagram. |
| 810–989 | The cue receives emphasis while warnings remain. “REWARD LEARNING GONE TOO FAR” appears during 31–33 seconds. |
| 990–1379 | At frame 990 the climax title is still fully visible; only then does the natural-reward explanation begin to crossfade in. Bell trials lead to an apple with progressively shorter response delays, followed by Cue → Action → Reward. |
| 1380–1739 | Compare natural- and drug-associated learning diagrams, with differently sized conceptual reinforcement signals. |
| 1740–1799 | Diagrams fade; yellow particles organize around an incomplete neuron outline. No large title remains. |

`T03` in `bio/remotion/src/Scene03_AddictionAndRewardLearning.tsx` defines timing boundaries. `getAddictionPose` and `getNaturalLearningPose` are pure frame-based position functions. Drug-seeking choices follow the existing crossroads cubic geometry; all repeated trips include a visible return rather than a teleport. Shared characters, palettes, apples, capsules, warnings, arrows and citations are reused.

`bio/remotion/src/reward-components.tsx` contains reusable reward pulses, association strokes, a bell cue and a simple neuron. `DopamineHandoff` is exported for Scene 04: begin it at `frame={1680}` and continue that value for uninterrupted particle motion.

The provided attribution `Feltenstein et al., 2009` fades in around 12 seconds and out around 30 seconds. No attribution is added to the unsourced remainder. Association thickness and pulse sizes are conceptual illustrations, not measured neural quantities; the narrative depicts positive reinforcement as a contributing mechanism rather than a complete explanation of addiction.

## Pathways and continued-use feedback

The addiction portion uses `addiction-feedback-components.tsx` for thicker rounded paths with layered glows and frame-based light pulses. The green route remains calm; the red route progressively darkens. Each completed pill approach triggers a short yellow glow and reaching gesture, then a distressed expression and accumulating red warnings. Later trips briefly enter the green route before turning back toward the pill. Shared pathway geometry and all composition timing remain unchanged. Checks cover each reward-to-distress transition, escalating distress, attempted safer choices, continuity and deterministic scrubbing.

The 42–44 second source interval is removed: the bridge now leads directly into the man/pill/reward diagram. A 12-frame crossfade preserves continuity without the brief returning shot. The climax formerly at 49 seconds now appears at 47 seconds; the full video is 76 seconds.

## Reward-learning update: seconds 50–60

`RewardLearningUpdate.tsx` replaces only this ten-second window with a human/mouse introduction, bell cue, marked reward location, expected one apple versus three received, and a visibly updated expectation before the next approach. Dotted cue/action/reward connections brighten after the surprise. Both edges crossfade into the existing video, and total duration remains 76 seconds. No audio or new scientific citations are introduced.

The new reward-learning sequence now enters at second 48 with a 12-frame crossfade from the held climax artwork. Its organism introduction is extended; later learning events and the exit at second 60 retain their timing. The old intervening shot is fully covered.

The mouse/apple example holds for two additional seconds at 59s. The existing exit crossfade and all following footage shift two seconds later unchanged; total duration is now 78 seconds.

Removed the redundant frozen outgoing overlay at the 48-second entry. The incoming opaque scene now crossfades directly over the live closing artwork, avoiding a held frame and double-blended ghosting. Duration remains 78 seconds.

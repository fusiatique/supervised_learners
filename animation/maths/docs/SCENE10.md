# Maths 10 — Learning from experience: Q-learning, and the end of the RL part

Open `animation/index.html` in Live Server. Maths 10 follows Maths 09 in chapter 3; its direct link is `#maths-q-learning`. `animation/maths/html/scene10.html` also provides standalone playback.

40 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene10_q_learning.py Scene10QLearning   # quick preview
./render.sh scenes/scene10_q_learning.py Scene10QLearning scene10-q-learning
```

## Narration cues

Start reading at 0:00, and start each line at its time: the animations are unhurried (see Implementation), so there are small gaps between lines. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "So far we assumed the agent knows the whole maze. In practice, it doesn't; it learns Q-values from experience." | Opens on Maths 09's last frame. The ε-greedy column and the route clear and every value pulses ("knows the whole maze"). On "In practice, it doesn't" (0:02.5) the values, glow and arrows go and every cell but the agent's turns grey, with a "?" in each. "learning from experience" appears, and the agent's four actions each show Q = 0. |
| 0:06 | "Each time it acts, it nudges its estimate towards what actually happened…" | The agent steps down into the grey: the cell clears and it finds the 20 (r = 20). A number line from 0 to 20 marks its estimate (0, violet) and what actually happened (20, amber); the estimate is nudged halfway, to 10 (α = 0.5), and that action's pill becomes Q = 10. |
| 0:11 | "…the reward plus the discounted value of where it landed." | Another try, from s14 (which clears): the agent steps down to s19. No reward, but where it landed is now worth up to 10 ("max Q = 10"), so what actually happened is 0 + 0.9 × 10 = 9; the target moves to 9, and the estimate is nudged halfway, to 4.5. |
| 0:17 | "This is called Q-learning, and it's what our simulation uses." | The number line makes way for Q(s,a) ← Q(s,a) + α[r + γ max Q(s′,a′) − Q(s,a)] under the title "Q-learning": the old Q(s,a) is braced "estimate", the bracket "what actually happened", and α is "how big a nudge". "used in our simulation" appears under the title. |
| 0:20.5 | "For the rest of this explanation, we'll focus on how the agent evaluates rewards. But keep in mind that exploration can be an important part of learning." | The labels go and the equation moves up. On "how the agent evaluates rewards" (0:23) the 20 and the target in the equation pulse. On "exploration" (0:26.5) the ε-greedy policy box and every still-grey cell pulse their outlines. |
| 0:29 | "Of course, this is a simplified model. But we've established something important. An agent can learn to choose actions based on expected rewards, evaluate possible futures, and keep improving." | The Q pills and the equation clear. With enough experience the grey lifts (0:32) on everything the agent has learned: values, glow and arrows (now including s25, worth 0.9 × 20 = 18). Three ticks appear as they are said: "choose actions based on expected rewards" (the agent steps onto the 20 and smiles), "evaluate possible futures", "keep improving". |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene10_q_learning.py`.

## Implementation

- Paced like Maths 09 with `common/pacing.py`'s `PacedScene`: every animation runs 35% slower than written (`SLOW`), and the extra time comes out of the pauses that follow. Unlike Maths 09, `REPAY_ACROSS_SECTIONS = False`: extra time a line cannot absorb in its own pauses lengthens that line instead of eating into the next one, so every narration line keeps its full time.
- The opening frame rebuilds Maths 09's end from that scene's own helpers (`maths08_policy`, `after_discovery`, `glow_opacity`, `fog_cell`, `epsilon_heading`, `epsilon_controls`), imported from `scene09_exploration.py`, so the scenes join exactly.
- The two updates are real Q-learning steps with α = 0.5 and γ = 0.9, starting from Q = 0: stepping into the 20 gives 0 + 0.5 × (20 + 0 − 0) = 10; stepping from s14 to s19 then gives 0 + 0.5 × (0 + 0.9 × 10 − 0) = 4.5. The number line shows each one as "the estimate moves halfway towards what actually happened".
- When the grey lifts, the values and arrows are the ones Maths 09 ended on (what enough experience would converge to), plus s25, which Maths 09 never explored.
- Pulses on boxes and fog cells animate their outlines, not their fill, so text stays readable.

## Handoff

Ends with the full learned grid (values, glow, arrows), the smiling agent on the 20 (s24), the three takeaways ticked in the right column and π = ε-greedy on Q^π in the box. This is the end of the reinforcement-learning part; Maths 11 picks up at "But there is a subtle assumption hiding underneath."

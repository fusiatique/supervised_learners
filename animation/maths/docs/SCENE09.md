# Maths 09 — Exploration versus exploitation, and ε-greedy

Open `animation/index.html` in Live Server. Maths 09 follows Maths 08 in chapter 3; its direct link is `#maths-exploration`. `animation/maths/html/scene09.html` also provides standalone playback.

50 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene09_exploration.py Scene09Exploration   # quick preview
./render.sh scenes/scene09_exploration.py Scene09Exploration scene09-exploration
```

## Narration cues

The script's exploration section is split in two: Maths 09 runs from "But there is another problem." to "That best-known action can change as it learns."; Maths 10 picks up at "So far we assumed the agent knows the whole maze." (Q-learning and the wrap-up).

Start reading at 0:00. Timings assume about 165 words per minute; the animations are deliberately unhurried, so start each line at its time rather than straight after the previous one.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But there is another problem." | Opens zoomed in on Maths 08's last frame; the camera pulls back out and the agent's smile fades. At 0:01.5 the suffering hamster (`animation/maths/suffering_hamster.jpg`) flashes up full-height in the centre of the screen, half see-through, for about half a second. |
| 0:02 | "Once the agent finds a rewarding path, should it always follow it? Or should it sometimes try something new, in case there's a better reward elsewhere?" | The agent steps down to s14, a junction, and its arrows appear. On "always follow it?" (0:04.5) the up arrow lights amber towards the known 10. On "try something new" (0:07.5) fog rolls over the bottom-right corner (unexplored, a "?" in each cell) and the down arrow into it lights violet. |
| 0:11.5 | "This is the exploration-exploitation dilemma." | "Exploitation" (amber) and "Exploration" (violet) slide in from opposite sides of the right column. |
| 0:13 | "Exploration means trying actions to discover new outcomes. Exploitation means using what the agent already knows to get the best known reward." | Exploration's definition appears with a violet ghost path down into the fog, ending at a dashed "?" star (0:14); exploitation's with an amber ghost path up to the 10 (0:18). |
| 0:21 | "If it only explores, it never uses what it learns; if it only exploits, it might never find something better." | "only exploring: never uses what it learns" (0:21.5); "only exploiting: might never find something better" (0:24.5). |
| 0:27.5 | "So how do we balance the two?" | The two words sit on a seesaw that tips one way, then the other, then levels. |
| 0:31 | "One common approach is epsilon-greedy exploration." | "ε-greedy" and π(a ∣ s) = random action with probability ε, best-known action with probability 1 − ε. |
| 0:34.5 | "Epsilon controls how often the agent explores." | An ε slider and a bar split into "explore" (violet, ε) and "exploit" (amber, 1 − ε) appear; the policy box becomes π = ε-greedy on Q^π. |
| 0:36 | "At zero, it always exploits. At one, it always explores. In between, it usually picks its best-known action but sometimes tries something else." | ε slides to 0 (all exploit), then to 1 (all explore) at 0:37.5, then to 0.1 on "In between" (0:40). On "usually picks its best-known action" (0:41.5) the amber part of the bar pulses and the agent takes the known path to the 10, then resets to the junction. On "sometimes tries something else" (0:43.5) the violet part pulses, "random!", and the agent steps into the fog: the cells next to it clear, revealing a 20. |
| 0:46 | "That best-known action can change as it learns." | Every value is recalculated with the 20 and the glow is rescaled; the arrows that now have a better action swing (s14's flips from up to down); the new route from the junction draws in, down to the 20. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene09_exploration.py`.

## Implementation

- Every animation plays 35% slower than written (`SLOW`); the scene's `play` adds the extra time and its `wait` takes it back out of the following pauses (never shorter than `MIN_PAUSE`), so beats stay on their narration and the scene only grows where the pauses run out. To change the overall pace, change `SLOW`.
- A `MovingCameraScene`; the opening frame rebuilds Maths 08's end (the camera at half width on the smiling agent at s9, the optimal policy from `maths08_policy`, which reruns Maths 08's four iterations from the same seeded random policy).
- The suffering hamster is `animation/maths/suffering_hamster.jpg`, shown as an `ImageMobject` fitted to the frame height (so the whole picture shows, undistorted, with the grid visible either side) at 50% opacity for about 0.6 s. It is loaded through Pillow as RGBA, because Manim cannot set the opacity of a plain RGB JPEG.
- Manim 0.22 cannot draw images with Pillow 12 or later (it passes a `mode` argument Pillow has removed), so `pyproject.toml` pins `pillow>=11,<12`; after pulling, run `uv sync`.
- Values come from `discounted_value` with the 20 included. It now measures true shortest paths that cannot pass through another reward (reaching one ends the episode), so s4, above the 10, goes round it to reach the 20 (10.6) rather than through it. For the earlier scenes' rewards (the 10 and the 5) no shortest path ever ran through the other reward, so their values are unchanged; that was checked cell by cell at several γ.
- With values up to 20, the glow is rescaled (`glow_opacity`) so the grid does not saturate.
- The new policy is `improve_policy` on the new values: arrows only swing where an action is now strictly better. The junction's flips because the 20 two steps down (0.9² × 20 = 16.2) now beats the 10 one step up (9).
- s25 stays fogged (still unexplored) and has no value or arrow.

## Handoff

Ends with the agent at s19, the values and arrows updated for the 20 (s25 still fogged), the new route dashed from the junction to the 20, ε-greedy with the slider at 0.1 in the right column, and π = ε-greedy on Q^π in the box. Maths 10 (Q-learning) starts here.

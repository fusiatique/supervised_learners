# Maths 09 — Exploration versus exploitation, and ε-greedy

Open `animation/index.html` in Live Server. Maths 09 follows Maths 07 in chapter 3; its direct link is `#maths-exploration`. `animation/maths/html/scene09.html` also provides standalone playback.

37 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene09_exploration.py Scene09Exploration   # quick preview
./render.sh scenes/scene09_exploration.py Scene09Exploration scene09-exploration
```

## Narration cues

The script (shortened, and pointed at our simulation): "But there is another problem. Should the agent always follow the path it knows, or sometimes try something new? A common answer is epsilon-greedy: the agent usually takes its best-known action, but with probability epsilon, tries a random one. That matters, because the agent only learns about states it visits. Where it has barely been, it can't tell which action is best, and what it finds can change its best-known action."

The point about states the agent has barely visited is what the grey cells of the simulation's policy map show: states visited too rarely to have learned a preference.

Start reading at 0:00. Timings assume about 145 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But there is another problem." | Opens on Maths 07's last frame. The right column clears and the agent's smile fades. At 0:01 the suffering hamster (`animation/maths/suffering_hamster.jpg`) flashes up full-height in the centre of the screen, half see-through, for about half a second. |
| 0:03 | "Should the agent always follow the path it knows, or sometimes try something new?" | The agent steps down to s14, a junction, and its arrows appear. On "the path it knows" (0:04) the up arrow lights amber towards the known 10 and "Exploitation" (amber) slides in. On "try something new" (0:07) fog rolls over the bottom-right corner (unexplored, a "?" in each cell), the down arrow into it lights violet and "Exploration" (violet) slides in. |
| 0:10 | "A common answer is epsilon-greedy: the agent usually takes its best-known action, but with probability epsilon, tries a random one." | "ε-greedy" and its rule (random action with probability ε, best-known action with probability 1 − ε), an ε slider at 0.1 and a bar split into "explore" (violet) and "exploit" (amber); the policy box becomes π = ε-greedy on Q^π. On "usually takes its best-known action" (0:13) the amber part pulses and the agent takes the known path to the 10 (a burst), then resets to the junction. On "tries a random one" (0:16.5) the violet part pulses, "random!", and the agent steps down into the fog, which lifts from that cell. |
| 0:21 | "That matters, because the agent only learns about states it visits. Where it has barely been, it can't tell which action is best, and what it finds can change its best-known action." | The rest of the corner is still fogged: it pulses and "never visited: no idea yet which action is best" appears under the grid; on "barely been" (0:25.5) the question marks pulse. On "what it finds" (0:30.5) the fog lifts from the next cells, revealing a 20, which bursts. On "can change its best-known action" (0:32.5) every value is recalculated with the 20 and the glow is rescaled; the arrows that now have a better action swing (s14's flips from up to down), and the new route from the junction draws in, down to the 20. |

Each beat waits for its cue with `self.at(T_...)`; the cue times are constants at the top of `scene09_exploration.py`.

## Implementation

- Every animation plays 35% slower than written (`PacedScene`, `SLOW`); `PacedScene.at(t)` waits for an absolute cue and clears the extra time owed (the cue already allows for it).
- The opening frame is `scene07_policy_improvement.end_frame()`, so the scenes join exactly.
- The suffering hamster is shown as an `ImageMobject` fitted to the frame height at 50% opacity for about 0.6 s. It is loaded through Pillow as RGBA, because Manim cannot set the opacity of a plain RGB JPEG.
- Manim 0.22 cannot draw images with Pillow 12 or later (it passes a `mode` argument Pillow has removed), so `pyproject.toml` pins `pillow>=11,<12`; after pulling, run `uv sync`.
- Values come from `discounted_value` with the 20 included, which measures true shortest paths that cannot pass through another reward (reaching one ends the episode). With values up to 20, the glow is rescaled (`glow_opacity`) so the grid does not saturate.
- The new policy is `improve_policy` on the new values: arrows only swing where an action is now strictly better. The junction's flips because the 20 two steps down (0.9² × 20 = 16.2) now beats the 10 one step up (9).
- s25 stays fogged (still unexplored) and has no value or arrow.

## Handoff

Ends with the agent at s19, the values and arrows updated for the 20 (s25 still fogged), the new route dashed from the junction to the 20, ε-greedy with the slider at 0.1 in the right column, and π = ε-greedy on Q^π in the box. Maths 10 (Q-learning) starts here.

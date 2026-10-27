# Maths 05 — Rewards several steps away: the state-value function and discounting

Open `animation/index.html` in Live Server. Maths 05 follows Maths 04 in chapter 3; its direct link is `#maths-state-value`. `animation/maths/html/scene05.html` also provides standalone playback.

49 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene05_state_value.py Scene05StateValue   # quick preview
./render.sh scenes/scene05_state_value.py Scene05StateValue scene05-state-value
```

## Narration cues

Start reading at 0:00. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "So far, we only considered the immediate rewards, but what if the reward is several steps away and no action gives an immediate reward?" | Opens on Maths 04's last frame. The 5 × 5 world slides left to make room; the agent glides to s6, three squares from the 10. On "several steps away" (0:04) the two empty squares between are outlined; on "no action gives an immediate reward" (0:06) every arrow reads 0. |
| 0:08.5 | "We can give non-reward states a value too, using the state-value function." | The 0 labels fade. On "using the state-value function" the reward function gives way to "state-value function"; "state" turns violet, then "value" amber. |
| 0:13 | "Intuitively, we know that some states are better than others, even without a reward on them." | From 0:14.5 the squares on the way to the 10 glow amber, from the reward back towards the agent, fainter with distance. |
| 0:18.5 | "The state-value function captures how good it is to be in a state, based on the future return the agent can expect to receive." | V(s) = expected future return from s writes in (0:20.5); "future return" turns amber on those words (0:25.5). |
| 0:27.5 | "We'll use a discounted sum of rewards as our definition of future return." | "future return" becomes G_t (0:28.5), and G_t = R_{t+1} + γR_{t+2} + γ²R_{t+3} + ⋯ builds out. |
| 0:32 | "Each R is a reward at a future time step, and gamma is a discount factor between zero and one." | The R terms light amber one by one, each a little smaller (0:32.5–0:34.5); the γs turn bold violet (0:35); a γ slider and four weight bars (1, γ, γ², γ³) appear, and the path glow becomes a value field over the whole grid. The slider sweeps 0 → 1 (0:35.5–0:38.5): the bars grow, and the field spreads out from the two rewards (at γ = 0 only the reward cells themselves glow; a reward cell always keeps its own value, because reaching it ends the episode), the 10's further than the 5's, until at γ = 1 every cell is equally bright. |
| 0:39 | "A gamma close to zero means the agent cares mostly about immediate rewards." | γ drops to 0.1: the later bars almost vanish and the field shrinks to the rewards and their immediate surroundings, leaving the start dark. The agent returns to the start, tagged γ = 0.1, and takes the short path to the nearby 5, leaving a violet trail. |
| 0:43.5 | "A gamma close to one means it values future rewards more." | γ rises to 0.9 and the field floods back, brightest towards the 10. Back at the start, tagged γ = 0.9, the agent takes the longer path to the 10, leaving an amber trail. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene05_state_value.py`.

## Implementation

- The opening frame is rebuilt from `common/world.py` (`big_world`, `reward_block`, `GREEDY_TEX`), shared with Maths 04, so the scenes join exactly. `GridStage.place(s)` glides the agent to a state to set up an example (it is not a transition).
- The two γ agents' choices are real: from the start the 5 is three steps away and the 10 six, so, valuing a reward d steps away at γ^d·r, with γ = 0.1 the 5 is worth 5·0.1³ = 0.005 against 10·0.1⁶ = 0.00001, and with γ = 0.9 it is 5·0.9³ = 3.6 against 10·0.9⁶ = 5.3.
- The slider knob, its readout and the weight bars are `always_redraw` objects driven by one `ValueTracker` for γ.
- The value field (`common/value.py: value_field`) is an amber square over every cell whose opacity follows `discounted_value(s, γ)`: the best reward reachable from s, with a reward r that is d steps away worth γ^d·r. That is the convention Maths 06's Bellman example uses (the reward's cell is worth 10, its neighbour 9 at γ = 0.9, and so on). Opacity is 0.7·(V/10)^1.6, a steep curve so the brightest cells stay distinct when γ is high. At the start cell the 10 overtakes the 5 at γ ≈ 0.79 (γ³ = ½).
- Arrow labels (`GridStage.arrow_labels`) and the γ tags are layered above the grid cells, because animating a cell's fill otherwise redraws it on top of them.

## Handoff

Ends with the 5 × 5 world shifted 1.4 units left, the agent (tagged γ = 0.9) on the 10 at s9, both trails drawn, "state-value function", V(s) and G_t in the right column, the slider at 0.9 with its bars, and the greedy policy in the box. Maths 06 (the Bellman equation) fades this into the background.

# Maths 06 — The Bellman equation

Open `animation/index.html` in Live Server. Maths 06 follows Maths 05 in chapter 3; its direct link is `#maths-bellman`. `animation/maths/html/scene06.html` also provides standalone playback.

36 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene06_bellman.py Scene06Bellman   # quick preview
./render.sh scenes/scene06_bellman.py Scene06Bellman scene06-bellman
```

## Narration cues

The script (shortened): "Now every state can have a value. But how do we calculate it? With the Bellman equation: a state's value is the reward for leaving it, plus the discounted value of the state you end up in. Say a step gives no reward, but leads to a state worth ten. With a discount of 0.9, this state is worth nine. So value spreads backwards from the reward, to every state."

Start reading at 0:00. Timings assume about 145 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Now every state can have a value." | Opens on Maths 05's last frame. The trails, γ tag, slider and G_t fade, and so do the R(s) numbers; the glowing value field stays. |
| 0:03 | "But how do we calculate it?" | V(s) = expected future return from s becomes V(s) = ?. |
| 0:07 | "With the Bellman equation: a state's value is the reward for leaving it, plus the discounted value of the state you end up in." | "the Bellman equation" heads the right column, and the idea builds as it is said: value(s) = (0:09) … reward for leaving s (0:10.5) … + γ · value(next state) (0:12.5). |
| 0:18 | "Say a step gives no reward, but leads to a state worth ten. With a discount of 0.9, this state is worth nine." | The field fades and the camera closes in on the row before the 10 as the agent steps back to s8. "r = 0" appears and the right arrow lights amber on "no reward" (0:19); "V = 10" under the star on "worth ten" (0:22); V(s8) = 0 + 0.9 (10) = builds on a dark panel above the row (0:24), and "9" pops in on "nine" (0:28). |
| 0:30 | "So value spreads backwards from the reward, to every state." | The 9 drops into s8's corner and the 10 into s9's; both cells glow. The camera pulls back out while the value flows back along the γ = 0.9 agent's path: 8.1, 7.3, 6.6, 5.9, 5.3, each cell glowing a little less, with a small violet arrow for the action taken there. On "to every state" (0:33) every other cell glows and gets its value, filling outwards from the rewards. |

Each beat waits for its cue with `self.at(T_...)`; the cue times are constants at the top of `scene06_bellman.py`. Change them if the narrator is faster or slower.

## Implementation

- A `MovingCameraScene`: the camera zooms to the s6–s10 row for the worked example and pulls back out during the propagation.
- The opening frame is rebuilt from `common/value.py` (`value_field`, `sv_title`, `v_equation`, `style_g_equation`, `gamma_slider`, `dashed_trail`), shared with Maths 05.
- Values follow the script's convention, V(s) = reward for leaving s + γ·V(next): the reward's own cell is worth its reward (10), the state before it 9, and so on (γ^d · r for a reward d steps away). Reaching a reward ends the episode, so a reward cell is worth exactly its reward. Every number shown is computed (`discounted_value`, γ = 0.9), rounded to one decimal place.
- The formal equation (V^π(s) = r(s, a, s′) + γV^π(s′)) and its name were cut: the idea in words is all the later scenes need, and it returns as the target of Q-learning in Maths 10.
- `bellman_idea()` and `valued_world()` rebuild this scene's last frame for Maths 07.

## Handoff

Ends with the full grid valued and glowing, the agent at s8 with its arrows idle, "the Bellman equation" over the idea in words in the right column, and the greedy policy in the box. Maths 07 starts here.

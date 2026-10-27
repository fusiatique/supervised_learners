# Maths 06 — The Bellman equation

Open `animation/index.html` in Live Server. Maths 06 follows Maths 05 in chapter 3; its direct link is `#maths-bellman`. `animation/maths/html/scene06.html` also provides standalone playback.

50 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene06_bellman.py Scene06Bellman   # quick preview
./render.sh scenes/scene06_bellman.py Scene06Bellman scene06-bellman
```

## Narration cues

Start reading at 0:00. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Now every state can have a value." | Opens on Maths 05's last frame. The trails, γ tag, slider and G_t fade, and so do the R(s) numbers; the glowing value field stays. |
| 0:03 | "But how do we calculate it?" | V(s) = expected future return from s becomes V(s) = ?. |
| 0:04.5 | "The Bellman Equation." | Everything dims; "The Bellman Equation" writes in, large and bold with a violet halo, as a burst of lines flashes out and the camera slowly pushes in. |
| 0:09 | "The central idea behind the Bellman equation is defining the value of a state is equal to the reward we receive from leaving that state, plus the discounted value of the state we end up in." | The title settles into a heading at the top right. The idea builds as it is said: value(s) = (on "the value of a state", 0:12) … reward for leaving s (on "the reward we receive…", 0:15) … + γ · value(next state) (on "plus the discounted value…", 0:18). |
| 0:21 | "Say moving from our state gives no immediate reward, but leads to a state with a value of 10. With a discount factor of 0.9, our current state's value would be…" | The field fades and the camera closes in on the row before the 10 as the agent steps back to s8. "r = 0" appears and the right arrow lights amber on "no immediate reward" (0:22); "V = 10" under the star on "a value of 10" (0:24.5); then V(s8) = 0 + 0.9 (10) = builds on a dark panel above the row (0:26.5–0:29). |
| 0:31 | "Nine." | = 9 pops in. |
| 0:31.5 | "So value propagates backwards from the reward." | The 9 drops into s8's corner and the 10 into s9's; both cells glow. The camera pulls back out while the value flows back along the γ = 0.9 agent's path: 8.1, 7.3, 6.6, 5.9, 5.3, each cell glowing a little less, with a small violet arrow showing the action taken there. |
| 0:35 | "For a deterministic environment following a fixed policy, the Bellman equation is:" | The worded idea turns into V^π(s) = r(s, a, s′) + γV^π(s′), with "where a = π(s)" under it (0:37.5). |
| 0:39.5 | "Vπ(s) is the value of state s under policy π, r is the immediate reward, and s' is the next state." | Each symbol is circled as it is named: V^π(s) (violet), with the policy box and the path arrows pulsing; r(s, a, s′) (amber, 0:43); V^π(s′) (violet, 0:45). |
| 0:46.5 | "This is called the Bellman expectation equation." | "Bellman expectation equation:" appears above the equation, and it is applied everywhere: every remaining cell glows and gets its value, filling outwards from the rewards. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene06_bellman.py`.

## Implementation

- A `MovingCameraScene`: the camera pushes in slightly on the title, zooms to the s6–s10 row for the worked example, and pulls back out during the propagation.
- The opening frame is rebuilt from `common/value.py` (`value_field`, `sv_title`, `v_equation`, `style_g_equation`, `gamma_slider`, `dashed_trail`), shared with Maths 05.
- Values follow the script's convention, V(s) = reward for leaving s + γ·V(next): the reward's own cell is worth its reward (10), the state before it 9, and so on (γ^d · r for a reward d steps away). Reaching a reward ends the episode, so a reward cell is worth exactly its reward: the 5's cell shows 5, not the 7.3 it would be worth if the agent walked on to the 10. Maths 05's glow uses the same `discounted_value`.
- Every number shown is computed (`discounted_value`, γ = 0.9), rounded to one decimal place.
- The worked example uses s8 → s9 (the 10) rather than the script's s2 → s3; the narration never names the states, so it reads the same.

## Handoff

Ends with the full grid valued and glowing, the agent at s8 with its arrows idle, "Bellman expectation equation:" over V^π(s) = r(s, a, s′) + γV^π(s′) (where a = π(s)) in the right column, and the greedy policy in the box.

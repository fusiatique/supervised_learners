# Maths 02 — Actions and the transition function

Open `animation/index.html` in Live Server. Maths 02 follows Maths 01 in chapter 3; its direct link is `#maths-actions-transitions`. `animation/maths/html/scene02.html` also provides standalone playback.

38 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene02_actions_transitions.py Scene02ActionsTransitions   # quick preview
./render.sh scenes/scene02_actions_transitions.py Scene02ActionsTransitions scene02-actions-transitions
```

## Narration cues

**Script change:** the worked example uses s5 and "right" (→ s6), where the agent already is after the actions beat, not the script's s2 → s3. Read: "So if the agent's state is s5, and the agent chooses the action 'right', what is the resulting state? Hopefully it's intuitive: s6."

Start reading at 0:00. Timings assume about 165 words per minute, except the worked example (0:18.5–0:29), which is paced for about 150.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "From any state, the agent can choose from several 'actions'." | Opens on Maths 01's last frame. The "agent state" readout fades away as the grid slides to the centre; four arrows slide out from under the agent; "actions" writes in above the grid. |
| 0:03 | "In this case, this would be up, down, left and right." | From 0:04.5, each arrow lights up one by one as it is named, and the agent takes that action: s5 → s2 → s5 → s4 → s5. |
| 0:07.5 | "Now, for the agent to 'interact' with the environment, the environment needs a set of rules that takes the agent's current state and action as input…" | "actions" fades and the grid slides back to the left; the grid pulses on "environment" (0:09.5); s appears on "current state" (0:14.5) and a a moment later on "action" (0:15.5), each labelled. |
| 0:17 | "…and output the agent's new state." | f( , ) closes around s and a, then = s′ appears, labelled "new state". |
| 0:18.5 | "So if the agent's state is s5, and the agent chooses the action 'right', what is the resulting state?" | f(s, a) = s′ becomes the example one piece at a time, each on its word; f(, the comma, ) and = only slide: on "s5" (0:21) s becomes s5 and the agent pulses; on "right" (0:24) a becomes right and the right arrow lights; on "what is the resulting state?" (0:25.5) s′ becomes ?. Each caption fades as its part is filled in. |
| 0:26.5 | "Hopefully it's intuitive: s6." | On "s6" (0:27.5) ? becomes s6 and the agent moves to s6. |
| 0:29 | "This is an example of a… [pause] …transition function." | Hold during "This is an example of a…"; on "transition function" (0:30.5) the words write in large with an underline and a pulse. |
| 0:33 | "…and the environment needs this for every state-action pair." | The large "transition function" fades down into a small heading above the rule, the example turns back into f(s, a) = s′ (same part-by-part morph), and all 36 transitions stream up beneath it (0:34–0:37), speeding up and motion-blurring, then easing to a stop on the last rows and ⋮. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene02_actions_transitions.py`.

## Implementation

The transition stream is the full table, computed from the grid: a `ValueTracker` scrolls the rows and an updater fades each one by its distance from the window's edges. The motion blur is faked: each row has five faint copies that trail below it by an amount proportional to the scroll speed, so the smear grows as the stream accelerates and vanishes as it stops. `GridStage.drop_panel()` removes the readout at the start, after which moves no longer update it. Built on `common.GridStage`, which recreates Maths 01's last frame (grid, faint labels, agent at s5, "agent state" readout) and provides `add_arrows()`, `light(action)`, `unlight()` and `move(action)`. `move` applies the grid's transition function `step(s, action)`, so every move and every row of the transition list is computed, not typed: an action into the edge returns the same state and animates as a bump.

## Handoff

Ends with the agent at s6, the four arrows idle, no state readout, and "transition function" over f(s, a) = s′ with the stream stopped under it. Maths 03 (random policy) should start from this frame or clear the right-hand column first.

# Maths 02 — Actions and the transition function

Open `animation/index.html` in Live Server. Maths 02 follows Maths 01 in chapter 3; its direct link is `#maths-actions-transitions`. `animation/maths/html/scene02.html` also provides standalone playback.

28 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene02_actions_transitions.py Scene02ActionsTransitions   # quick preview
./render.sh scenes/scene02_actions_transitions.py Scene02ActionsTransitions scene02-actions-transitions
```

## Narration cues

The script (shortened): "From any state, the agent can choose from several 'actions'. In this case: up, down, left and right. The environment then needs a rule that takes the agent's current state and action, and outputs its new state. So if the agent is in s5 and chooses 'right', where does it end up? s6. This is a transition function, and the environment needs one for every state-action pair."

Start reading at 0:00. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "From any state, the agent can choose from several 'actions'." | Opens on Maths 01's last frame. The "agent state" readout fades away as the grid slides to the centre; four arrows slide out from under the agent; "actions" writes in above the grid. |
| 0:03 | "In this case: up, down, left and right." | Each arrow lights up one by one as it is named, and the agent takes that action: s5 → s2 → s5 → s4 → s5. |
| 0:07.5 | "The environment then needs a rule that takes the agent's current state and action, and outputs its new state." | "actions" fades and the grid slides back to the left; the grid pulses on "environment"; s appears on "current state" (≈0:10) and a a moment later on "action", each labelled; f( , ) closes around them and = s′ appears, labelled "new state" (≈0:12.5). |
| 0:14 | "So if the agent is in s5 and chooses 'right', where does it end up? s6." | f(s, a) = s′ becomes the example one piece at a time, each on its word (f(, the comma, ) and = only slide): s becomes s5 and the agent pulses; a becomes right and the right arrow lights; s′ becomes ?, then s6 as the agent moves to s6 (≈0:19). |
| 0:20 | "This is a transition function, and the environment needs one for every state-action pair." | "transition function" writes in large with an underline and a pulse; then it fades down into a small heading above the rule, the example turns back into f(s, a) = s′, and all 36 transitions stream up beneath it, speeding up and motion-blurring, then easing to a stop on the last rows and ⋮. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene02_actions_transitions.py`.

## Implementation

The transition stream is the full table, computed from the grid: a `ValueTracker` scrolls the rows and an updater fades each one by its distance from the window's edges. The motion blur is faked: each row has five faint copies that trail below it by an amount proportional to the scroll speed, so the smear grows as the stream accelerates and vanishes as it stops. `GridStage.drop_panel()` removes the readout at the start, after which moves no longer update it. Built on `common.GridStage`, which recreates Maths 01's last frame (grid, faint labels, agent at s5, "agent state" readout) and provides `add_arrows()`, `light(action)`, `unlight()` and `move(action)`. `move` applies the grid's transition function `step(s, action)`, so every move and every row of the transition list is computed, not typed: an action into the edge returns the same state and animates as a bump.

## Handoff

Ends with the agent at s6, the four arrows idle, no state readout, and "transition function" over f(s, a) = s′ with the stream stopped under it. Maths 03 (random policy) should start from this frame or clear the right-hand column first.

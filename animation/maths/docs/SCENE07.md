# Maths 07 — Choosing actions by their value

Open `animation/index.html` in Live Server. Maths 07 follows Maths 06 in chapter 3; its direct link is `#maths-policy-improvement`. `animation/maths/html/scene07.html` also provides standalone playback.

22 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene07_policy_improvement.py Scene07PolicyImprovement   # quick preview
./render.sh scenes/scene07_policy_improvement.py Scene07PolicyImprovement scene07-policy-improvement
```

## Narration cues

This scene replaces the earlier policy improvement and policy iteration scenes (the old Maths 07 and 08): our simulation learns by Q-learning and never plans, so all the audience needs is that an action has a value and the agent picks the best one.

The script: "Now let's use these values to choose actions. The value of an action is the reward it gives, plus the discounted value of where it leads. In every state, the agent simply picks the action with the highest value, and heads straight for the reward."

Start reading at 0:00. Timings assume about 145 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Now let's use these values to choose actions." | Opens on Maths 06's last frame. The Bellman idea shrinks to the top of the right column and every value pulses in a wave. |
| 0:04.5 | "The value of an action is the reward it gives, plus the discounted value of where it leads." | "the value of an action" and Q(s, a) = r(s, a, s′) + γV(s′) build term by term: Q(s, a) = (0:04.5), r(s, a, s′) (0:07), + γV(s′) (0:08.5). Each of the agent's four actions then gets its Q in the cell it leads to: up, down and left 7.3, right 9. |
| 0:13 | "In every state, the agent simply picks the action with the highest value, and heads straight for the reward." | Right and its Q = 9 light amber and "choose the action with the highest Q" appears under the equation; the policy box swaps to π(s) = action with the highest Q(s, a), and every other state gets its best action, outwards from the rewards. On "heads straight for the reward" (0:18.5) the agent steps onto the 10 (a burst) and smiles. |

Each beat waits for its cue with `self.at(T_...)`; the cue times are constants at the top of `scene07_policy_improvement.py`.

## Implementation

- The opening frame is `scene06_bellman.valued_world()` and `bellman_idea()`, so the scenes join exactly.
- Q values are computed from the values on screen: Q(s, a) = r(s, a, s′) + γV(s′) with r = 0 for leaving an ordinary state and γ = 0.9.
- The arrows are `common.final_policy`: a seeded random policy improved until it stops changing. It is optimal, the same policy Maths 09–11 use; where actions tie it keeps its current one.
- `end_frame()` rebuilds this scene's last frame for Maths 09.

## Handoff

Ends with the agent smiling on the 10 (s9), every state's value, glow and best action (violet arrows), the Bellman idea, "the value of an action", Q(s, a) and "choose the action with the highest Q" in the right column, and π(s) = action with the highest Q(s, a) in the box. Maths 09 (exploration) starts here.

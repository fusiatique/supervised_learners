# Maths 07 — The action-value function and policy improvement

Open `animation/index.html` in Live Server. Maths 07 follows Maths 06 in chapter 3; its direct link is `#maths-policy-improvement`. `animation/maths/html/scene07.html` also provides standalone playback.

61 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene07_policy_improvement.py Scene07PolicyImprovement   # quick preview
./render.sh scenes/scene07_policy_improvement.py Scene07PolicyImprovement scene07-policy-improvement
```

## Narration cues

Start reading at 0:00. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Now let's use these values to choose better actions." | Opens on Maths 06's last frame; the Bellman expectation equation pulses, then the current policy box. |
| 0:03 | "Suppose we've calculated the value of every state in the maze." | The agent glides back to s8 as every state's value pulses in a wave. |
| 0:06.5 | "For every action, we ask two questions." | The Bellman equation shrinks to the top. |
| 0:09 | "First, what immediate reward does it give?" | "1. What immediate reward does it give?" appears; each action gets an "r = 0" pill in the cell it leads to. |
| 0:11.5 | "Second, how valuable is the state it takes us to?" | "2. How valuable is the state it takes us to?" appears; the values of the four neighbouring states are circled in turn. |
| 0:14.5 | "For our deterministic environment, combining these gives us:" | Q^π(s, a) = r(s, a, s′) + γV^π(s′) writes in. |
| 0:17.5 | "This is the action-value function. It tells us how good a particular action is in a particular state, assuming we follow our current policy." | "action-value function" appears over it. On "how good a particular action is" (0:20.5) each "r = 0" becomes that action's Q: up 7.3, down 7.3, left 7.3, right 9. |
| 0:26.5 | "In this example, right has the highest value. So we update our policy to choose right whenever the agent finds itself in this state." | Right and its Q = 9 light amber (0:27.5); on "update our policy" (0:31) s8 is circled. |
| 0:35.5 | "More generally: π_new(s) = arg max_a Q^π(s, a)." | The arg max rule writes in. |
| 0:38 | "Arg max simply means: choose the action with the highest value." | "arg max" pulses and "choose the action with the highest Q" appears under it; then (0:41) the policy box swaps to π(s) = arg max_a Q^π(s, a). |
| 0:43 | "Doing this for every state gives a new policy that is at least as good as the old one. This process is called policy improvement." | Every other state gets a grey arrow, the old (random) policy (0:43.5); then, starting next to the rewards, each one swings to its arg max, turning violet (0:45–0:48). On "policy improvement" (0:49) the label appears. |
| 0:51 | "Notice that the agent can now choose an action with no immediate reward if it leads to a more valuable state. This is precisely why the state-value function matters." | s7 is circled and its arrow pulses, with an "r = 0" pill: no reward for the step (0:52.5), but it leads to s8, whose 9 is circled (0:54.5). On "why the state-value function matters" (0:58) the Bellman equation and every value pulse. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene07_policy_improvement.py`.

## Implementation

- The opening frame is rebuilt from `common/value.py` (`discounted_value`, `glow_square`, `value_tex`, `bellman_expectation`), shared with Maths 06.
- Q values are computed from the values on screen: Q(s, a) = r(s, a, s′) + γV(s′) with r = 0 for leaving an ordinary state and γ = 0.9. At s8 that gives right 9 (the script's Q = 9) and 7.3 for the other three; the script's illustrative 2 and 5 are not used, because they would not match the grid.
- The new policy is the true arg max of Q in every state (ties broken up, right, left, down). It is not hand-drawn: note s17 now points up towards the 10 rather than at the 5 next door, because the 5 (a terminal reward of 5) is worth less than the path to the 10.
- The old policy is a seeded random arrow in each state, so the "random → improved" contrast is the same every render.
- Labels for actions sit on dark pills (`pill`, `action_pills`) inside the cell each action leads to, so they never collide with that cell's own value.
- The script asks for the agent to examine several states before the whole policy updates. To keep pace with the narration, this cut does one full example (s8) and then sweeps the improvement across every state.

## Handoff

Ends with the improved policy drawn in every state (violet arrows), the agent at s8 with its right arrow lit violet, values and glows everywhere, "policy improvement", Q^π and the arg max rule in the right column, and π(s) = arg max_a Q^π(s, a) in the box.

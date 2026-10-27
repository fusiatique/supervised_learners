# Maths 08 — Policy iteration and the Bellman optimality equation

Open `animation/index.html` in Live Server. Maths 08 follows Maths 07 in chapter 3; its direct link is `#maths-policy-iteration`. `animation/maths/html/scene08.html` also provides standalone playback.

47 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene08_policy_iteration.py Scene08PolicyIteration   # quick preview
./render.sh scenes/scene08_policy_iteration.py Scene08PolicyIteration scene08-policy-iteration
```

## Narration cues

**Script change:** the "Step one is policy evaluation… Step two is policy improvement…" lines are cut; "We then repeat this until we reach an optimal policy" follows "This is policy iteration" directly.

Start reading at 0:00. Timings assume about 165 words per minute. The iterations are real and happen on the narration: iteration 1 on "We improved our policy using the state values", iteration 2 on "So we recalculate… and improve the policy again", and iterations 3 and 4 on each "And again."

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Now, there is one final step." | Opens on Maths 07's last frame. The right column and the agent clear, and every arrow turns back into Maths 07's grey random policy: "starting again from a random policy". Its values are evaluated: all 0, because no route reaches a reward, and a grey dashed trail shows the route from the start looping. |
| 0:02.7 | "We improved our policy using the state values, but those values are from the old policy." | Iteration 1's improvement: the policy box pulses and the 8 states next to a reward swing to violet. The history starts: "Iteration 1 · loops, no reward · 8 states changed". On "from the old policy" (0:06) "these values came from the old policy" appears over the grid and the values pulse. |
| 0:09 | "Once the policy changes, the values may no longer be accurate." | On "no longer be accurate" (0:10.8) every non-reward value becomes "?". |
| 0:13.5 | "So we recalculate the values with the new policy, and improve the policy again." | On "recalculate the values" (0:14.2) "1. Policy evaluation" appears; the grid flashes as the old values are thrown away (the glow goes out and the numbers fade), and the new policy's values fill in. On "improve the policy again" (0:16.6) "2. Policy improvement" appears with the top half of the loop, labelled "use the values to choose better actions"; the amber dot travels along it into the improvement box, the box's outline flares, and 11 arrows swing. The bottom half of the loop then closes it, labelled "re-evaluate the new policy", with "iteration 2" in the middle. |
| 0:19.4 | "And again." | Iteration 3, one lap of the loop: the dot travels the bottom half into evaluation (the counter ticks to 3), the grid flashes and the values are recalculated, and the route now reaches the 5 in 3 steps (amber trail); then the dot travels the top half into improvement and 5 arrows swing. |
| 0:22.4 | "And again." | Iteration 4, another lap (the counter ticks to 4): flash, new values, the route reaches the 10 in 6 steps, and no arrow changes: "no change". |
| 0:25.2 | "This is policy iteration." | "policy iteration" titles the loop. |
| 0:27.3 | "We then repeat this until we reach an optimal policy." | The four history rows pulse in turn. On "an optimal policy" (0:29.4) every arrow turns violet, the last row is circled and "optimal policy" appears. |
| 0:31.6 | "Mathematically, an optimal policy satisfies:" | The history clears; π*(s) = arg max_a [r(s, a, s′) + γV*(s′)] writes in. |
| 0:34.4 | "This is the Bellman optimality equation expressed as a policy choice." | "Bellman optimality equation:" appears above it. |
| 0:39 | "And just like that, we have gone from a random agent to one that systematically improves its behaviour." | The trail clears; the agent reappears at the start, takes the optimal route to the 10, and smiles. From 0:42.5 the camera pushes in on it while the equations and the loop shrink into its brain, leaving the final policy around it. |

Each beat waits for its cue with `self.at(T_...)`; the cue times are constants at the top of `scene08_policy_iteration.py`. Change them if the narrator is faster or slower. Each iteration (one lap: dot to evaluation, flash, new values, dot to improvement, arrows) takes about 2.8 seconds, so "And again." needs about 3 seconds between repeats.

## Implementation

- A `MovingCameraScene`. The opening frame rebuilds Maths 07's last frame from the same helpers and the same seeded old policy (`random.Random(7)` over the same states), so the scenes join exactly.
- The policy iteration is real. `common/value.py` gains `evaluate_policy` (V^π of a deterministic policy, with a looping policy worth 0), `improve_policy` (switch to the arg max of Q only when it is strictly better, so ties never flip an arrow) and `policy_route`. The scene calls them once per narration beat, four times, and the fourth improvement changes nothing, so the run genuinely ends optimal. Every value, trail and "n states changed" count on screen is computed. If the starting policy changes, check that it still converges in four iterations.
- It starts from Maths 07's grey random arrows. Maths 07 never drew s8's old arrow (the agent stood on it), so s8 starts on `up`, which keeps the run at four iterations: loop, loop, the 5, the 10.
- The values iteration 4 arrives at are exactly Maths 06's (`discounted_value`). The final arrows differ from Maths 07's in a few tied states (s21 goes right rather than up), because improvement keeps the current action on a tie; both are optimal.
- The loop is one ellipse (`loop_point`, half-width `LOOP_A`, half-height `LOOP_B`) with the two boxes sitting on it, evaluation on the left and improvement on the right. Its two arrows are the visible top and bottom halves (`loop_arrow`), and the amber dot follows the same ellipse (`loop_path`) all the way round, so it never jumps: it disappears into a box (the boxes are opaque and layered above it) while that step happens, and comes out the other side. Each half is labelled with what crossing it means, a counter in the middle ticks with each lap, and a box's outline flares amber (`pulse`) when the dot arrives.
- Every re-evaluation first flashes the grid (`reset_flash`): the old values fade and the glow goes out for a quarter of a second before the new values fill in, so it reads as the values being thrown away and recalculated. The very first evaluation, of the random policy, doesn't flash.
- The iteration history under the loop (`history_row`) records each iteration's route from the start and how many states its improvement changed, in three left-aligned columns.

## Handoff

Ends zoomed in (the camera frame at half width) on the smiling agent at the 10 (s9), with the optimal policy's violet arrows, values and glow in the cells around it. The right column (Bellman equations and loop) has been absorbed; the policy box is still in place outside the frame. Maths 09 (exploration and exploitation) should start by pulling the camera back out.

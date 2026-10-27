# Maths 13 — The homeostatic reward

Open `animation/index.html` in Live Server. Maths 13 follows Maths 12 in the HRL chapter; its direct link is `#maths-homeostatic-reward`. `animation/maths/html/scene13.html` also provides standalone playback.

40 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene13_homeostatic_reward.py Scene13HomeostaticReward   # quick preview
./render.sh scenes/scene13_homeostatic_reward.py Scene13HomeostaticReward scene13-homeostatic-reward
```

## Narration cues

Runs from the stage direction "*Place two possible outcomes in front of the agent…*" (played under "Now we can redefine reward by asking…") to "…when they restore a regulated state."

Start reading at 0:00, and start each line at its time (there are small gaps between lines). Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Now we can redefine reward by asking: how much will this outcome reduce the agent's homeostatic deviation?" | Opens on Maths 12's last frame. An empty deviation bar appears beside the gauge, then (0:01) H falls smoothly to 30 and the bar fills from 0 to D = 8. Two outcomes appear beneath the agent: "a glass of water" (H + 15) and "a hot day" (H − 15). On "how much will this outcome reduce…" each is previewed in turn as a dot on the D(H) plot. The glass of water, which brings H closer to the setpoint, is boxed in amber. |
| 0:07.5 | "Moving H closer to the setpoint gives a positive reward. Moving it further away can give a negative one. And overshooting the target can make an outcome less beneficial, or even aversive." | r_homeostatic = D(H_before) − D(H_after) writes in at the top right. Each case keeps a faint copy of the "before" state (a ghost arc on the gauge, a dashed outline on the bar, a hollow circle on the plot), moves the needle and draws the change as an arrow beside the bar, labelled only with the before and after values of D. Closer (≈0:09): the glass of water, 30 → 45, the bar drops from 8 to 0.5 with an amber ↓, and r = 8 − 0.5 = +7.5 is written out, the two D values flying up from the bar. Further (≈0:13): the hot day, 30 → 15, the bar rises from 8 to 24.5 with a red ↑, r = 8 − 24.5 = −16.5. Overshooting (≈0:17.5): "three glasses" (H + 45), 30 → 75, past the setpoint, the bar rises from 8 to 12.5 with a red ↑, r = 8 − 12.5 = −4.5, and "overshoot". |
| 0:21.5 | "This is the core HRL idea. Reward comes from the anticipated reduction in deviation, and the agent uses it to learn which actions are worth pursuing." | Everything but the agent and the equation fades: the gauge, the bar, the outcomes and the plot. The agent grows slightly on the left; the equation moves beside it and is boxed and labelled "the core HRL idea". On "uses it to learn" (≈0:25) the whole boxed card ("the core HRL idea" and the equation) glides into the agent's brain; as it lands (≈0:26.5) the brain flickers on like a neon sign, with a soft teal glow over the top of the head, then settles. This is the shared `absorb` beat, the same as in Maths 04, 08 and 11. |
| 0:30.5 | "So far, this is a theory of motivated behaviour, not yet of addiction. It explains why food, water, or rest become more valuable when they restore a regulated state." | "a theory of motivated behaviour", with "not yet of addiction" faded beneath. One agent, low on H. A glass of water, an apple and a moon (rest) appear (≈0:35) and one by one go to the agent, each nudging the needle up until it is back on H*; the agent smiles. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene13_homeostatic_reward.py`. The second line's animation runs about 2 s longer than the line itself (each case writes out its reward); let it play out before "This is the core HRL idea."

## Implementation

- Paced like Maths 10–12 (`PacedScene`, animations 35% slower, `REPAY_ACROSS_SECTIONS = False`).
- The opening frame is `scene12_setpoint.end_frame()`, so the scenes join exactly. The D(H) plot slides 0.45 right at the start to leave room for the bar and its arrow.
- Every number is computed: `drive(h)` is D(H) = (50 − H)² / 50 and `reward(before, after)` is D(before) − D(after). - `DeviationBar` is a vertical bar whose live fill is D(H) of its gauge. `ghost()` leaves a dashed outline of the current level with its value; `change(before, after)` draws the arrow (amber and down when the deviation shrinks, red and up when it grows). The bar shows only D before and after; the reward itself is written out once, in the formula.
- `show_case()` runs one worked case: the before state is frozen (ghost arc, bar ghost, hollow plot marker), the needle moves, and the change is drawn. With `formula_at` (used for all three cases), it also writes r = D(before) − D(after) = r, D(before) and D(after) transforming out of the bar's labels.
- `outcome(icon, caption)` is an offered outcome.
- The script's "same dose" line (two agents given the same dose) was cut: Maths 14 makes the same point with the drug itself.
- The learning beat is `common.absorb(card, agent, brain, color=HOMEO)`, the one beat for every equation the agent takes in: the card glides in on a gentle arc (drawn in front of the head), then `light_up` plays: `neon(alpha)` gives a few stutters, a full blaze and a slow settle, driving the brightness of the brain disc, the H's colour and a soft halo laid over the head (the disc keeps its size). Both now live in `common/agent.py`.
- The brain disc and H come from `common.brain_light(agent)`, shared with Maths 11 and 12 (disc radius 0.26 × the head's, clear of the eyes). The card is the equation, its box and its label together. `common/icons.py` gains `sun()`, `apple()` and `moon()`.

## Handoff

Ends on "a theory of motivated behaviour" / "not yet of addiction", one smiling agent (left, H in its brain) and its gauge with the needle on H* (centre), under the "Homeostatic reinforcement learning" title. `end_frame()` rebuilds this frame (via `motivated_frame()`). Maths 14 (drugs in HRL) starts here: "But it also gives us a way to think about drugs."

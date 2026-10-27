# Maths 15 — Harm

Open `animation/index.html` in Live Server. Maths 15 opens the Harm chapter; its direct link is `#maths-harm`. `animation/maths/html/scene15.html` also provides standalone playback.

50 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene15_harm.py Scene15Harm   # quick preview
./render.sh scenes/scene15_harm.py Scene15Harm scene15-harm
```

## Narration cues

Runs from "So far, nothing in the model says the drug is harmful." to "…It's just been outweighed."

Start reading at 0:00, and start each line at its time (there are small gaps between lines). Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "So far, nothing in the model says the drug is harmful. But in real life, drugs come with a cost." | Opens on Maths 14's last frame, which clears. r = D(H) − D(H′) and a capsule, "no cost in the model". On "But in real life…" (≈0:04) a red "cost" tag appears beside the capsule. |
| 0:07 | "This is where our own simulation comes in. We added a harm term: a cost, c, that the agent pays every time it takes the drug." | "our simulation". The reward grows to r = D(H) − D(H′) + (R₀ − c)·[drug]; the cost tag becomes the red c (≈0:09.5) and "harm" appears under it. On "every time it takes the drug" (≈0:12) "relief" (teal) and "pleasure" (amber) appear under their terms, and "[drug] = 1 when it takes the drug". |
| 0:17 | "In our example, the drug's pleasure, R₀, is worth 2, and its harm, c, costs 10. The harm is five times bigger than the pleasure." | On the right, "R₀ = 2" with a thin amber block, then (≈0:19.5) "c = 10" with a red block five times taller. On "five times bigger" (≈0:21.5) five amber blocks stack up beside the red one, "× 5". Both values stay on screen. |
| 0:25.5 | "Shouldn't that stop it? Not necessarily. What matters is the total." | A balance scale: "for the drug" on the left, "against" on the right. The +2 block goes onto the left pan and the −10 block onto the right. |
| 0:30 | "For a healthy agent, the drug overshoots the setpoint, so it makes things worse, not better. Add the harm, and the total is −19.5. It walks away." | A smiling "healthy" agent with a small gauge at the setpoint (H = 50). On "overshoots" (≈0:32) the needle shows the dose's effect, 50 → 74, and −11.5 (teal) goes onto the "against" pan. On "Add the harm" (≈0:35) the line completes, −11.5 + 2 − 10 = −19.5, and the scale tips against the drug. On "It walks away" (≈0:37.5) the needle returns, the agent steps back and the capsule dims. |
| 0:39.5 | "An agent in withdrawal gets huge relief. Same cost, but the total is +9.0. It takes the drug." | A tired agent "in withdrawal" (H = 20). The dose's effect, 20 → 43, puts +17.0 (teal) onto the "for the drug" pan. On "Same cost…" (≈0:43) +17.0 + 2 − 10 = +9.0 and the scale tips towards the drug. On "It takes the drug" (≈0:45) the capsule goes to the agent and it brightens. |
| 0:47 | "The harm hasn't disappeared. It's just been outweighed." | The red −10 block, still on the raised "against" pan, pulses: "still there". |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene15_harm.py`. The withdrawal beat runs about 1 s longer than its line.

## Implementation

- Paced like Maths 10–14 (`PacedScene`, animations 35% slower, `REPAY_ACROSS_SECTIONS = False`).
- The opening frame is `scene14_drugs.end_frame()`.
- The numbers are our simulation's (`js/model.js`): r = D(H) − D(H′) + (R₀ − c)·[drug], R₀ = 2, c = 10, a dose of +25, and H relaxing a tenth of the way to its baseline B each step. Healthy: H = 50, B = 40, so H′ = 74 and the relief is D(50) − D(74) = −11.5. Withdrawal: H = 20, B = 0, so H′ = 43 and the relief is D(20) − D(43) = +17.0. The script uses c = 10 (the simulation's default is 1).
- `Balance` is a scale whose beam follows `tilt` (a `ValueTracker`; positive tips the left pan down). `put(weight, side, slot)` keeps a weight seated on its pan as the beam moves. The tilt is `0.25 · tanh(total / 8)`.
- `block(value, colour, label)` is a weight as tall as |value| (0.06 per unit), so the red harm block is visibly five times the amber pleasure one.

## Handoff

Ends on the scale tipped towards the drug, the red harm block still on the raised "against" pan ("still there"), the withdrawal agent smiling, the equation and R₀ = 2, c = 10 on screen.

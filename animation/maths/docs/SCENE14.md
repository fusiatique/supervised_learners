# Maths 14 — Drugs in HRL

Open `animation/index.html` in Live Server. Maths 14 follows Maths 13 in the HRL chapter; its direct link is `#maths-drugs`. `animation/maths/html/scene14.html` also provides standalone playback.

72 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene14_drugs.py Scene14Drugs   # quick preview
./render.sh scenes/scene14_drugs.py Scene14Drugs scene14-drugs
```

## Narration cues

Runs from "But it also gives us a way to think about drugs." to "…links homeostatic regulation with the learning and planning that guide behaviour."

Start reading at 0:00, and start each line at its time (there are small gaps between lines). Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But it also gives us a way to think about drugs." | Opens on Maths 13's last frame. The heading becomes "drugs in HRL", the agent and its gauge slide left and H falls to 25. Two options appear on the right: a natural reward (an apple, "H + 2", a tiny bar) and a drug (a capsule, "H + 25", a long bar). |
| 0:04 | "A drug can rapidly and powerfully change the internal state. If that change brings the agent closer to its setpoint, the drug gains value by relieving the deviation. The agent doesn't need to see the drug as "good" in the abstract. Its value emerges from the effect it is expected to have on the current state." | The apple dims; a capsule goes to the agent and the needle jumps from 25 to the setpoint; it smiles. r = D(25) − D(50) = 12.5 − 0 = +12.5 writes in with "relief", and the drug is tagged "worth +12.5" (≈0:07). On "good" (≈0:13) "good" appears over the drug and is struck through. On "Its value emerges…" (≈0:17) H is reset to 45 and the same dose overshoots to 70: r = D(45) − D(70) = 0.5 − 8 = −7.5, "overshoot", the agent frowns and the drug's tag turns to "worth −7.5". |
| 0:23 | "This is the first part of Keramati and colleagues' account: drug taking is reinforced by relief, not just pleasure." | "Keramati and colleagues" and "1. reinforced by its corrective effect" on the right. A bar for "the drug's reward" grows: a long teal "relief" part (≈0:26), then a short amber "pleasure" part with "not just by its immediate pleasure" (≈0:27.5). |
| 0:29.5 | "The second part is that chronic drug use can gradually alter the homeostatic system itself. In their 2017 model of cocaine addiction, repeated use gradually elevates the setpoint. So when the drug is absent, the deviation is larger. A dose becomes valuable because it temporarily reduces that deviation, and the elevated setpoint helps sustain further drug seeking." | "2. chronic use changes the system itself" (with "Keramati and colleagues, 2017 · cocaine"). Three doses in a row: each lifts H to just under the setpoint, then H falls back, while the H* mark creeps up the dial from 50 to 68 (a faint tick stays at the old setpoint). A list builds on the right, one line per phrase: "setpoint ↑", "deviation without the drug ↑" (≈0:38.5, the red arc is long, the agent frowns), "value of a dose ↑" (≈0:42.5, a dose brings H up to the new setpoint, then it falls back), "drug seeking ↑" (≈0:45.5). |
| 0:48.5 | "This creates a feedback loop. Drug use changes the system, the changed system changes how rewarding the next dose is, and that drives future drug seeking. So the agent doesn't like the drug more; it needs it more." | "a feedback loop": the nodes appear in turn, joined by curved arrows: "drug use" → "homeostatic system changes" → "deviation when drug is absent" → "expected corrective reward" → "drug seeking" → back to "drug use". A dot runs once around the loop. On "So the agent doesn't like the drug more" (≈0:57) "likes it more" appears in the middle of the loop and is struck through, then "needs it more" (teal) appears beneath it. |
| 1:01.5 | "This is a proposed explanation, not a claim that addiction comes down to one variable. Its usefulness is that it links homeostatic regulation with learning and planning." | "a proposed explanation"; then a crossed-out claim, "× addiction comes down to one variable" (≈1:03.5); then (≈1:06) "homeostatic regulation" (teal box) and "learning and planning" (violet box), joined by a double arrow. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene14_drugs.py`.

## Implementation

- The script's timeline line ("So the agent doesn't simply like the drug more and more…") was cut to one sentence at the end of the loop line, and the "first part" line was shortened.
- Paced like Maths 10–13 (`PacedScene`, animations 35% slower, `REPAY_ACROSS_SECTIONS = False`).
- The opening frame is `scene13_homeostatic_reward.end_frame()`, so the scenes join exactly; Maths 14's own last frame is `end_frame()` here (built by `caveat_frame()`), for Maths 15.
- The dose is +25, as in our simulation, and the rewards are computed with Maths 12's `drive(h)`. The rising setpoint (the 50 → 68 creep on the gauge) is illustrative: our own simulation lowers a baseline rather than raising the setpoint, but the script follows Keramati and colleagues' 2017 model here.
- `moving_setpoint(gauge, tracker)` replaces the gauge's fixed setpoint mark and deviation arc with ones that follow a `ValueTracker`.
- `capsule()` (the drug) is new in `common/icons.py`, in its own pink (`PILL`).

## Handoff

Ends on "a proposed explanation", the crossed-out claim, and the two linked boxes, under the "Homeostatic reinforcement learning" title. Maths 15 (harm) starts here: "So far, nothing in the model says the drug is harmful."

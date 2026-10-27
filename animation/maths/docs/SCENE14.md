# Maths 14 — Drugs in HRL

Open `animation/index.html` in Live Server. Maths 14 follows Maths 13 in the HRL chapter; its direct link is `#maths-drugs`. `animation/maths/html/scene14.html` also provides standalone playback.

71 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene14_drugs.py Scene14Drugs   # quick preview
./render.sh scenes/scene14_drugs.py Scene14Drugs scene14-drugs
```

## Narration cues

The script (shortened, and with the second part following our simulation rather than Keramati and colleagues' 2017 setpoint model):

"But it also gives us a way to think about drugs. A drug can change the internal state rapidly and powerfully. If that brings the agent closer to its setpoint, the drug is valuable because it relieves the deviation. So, as Keramati and colleagues put it, drug taking is reinforced by relief, not just pleasure. Chronic use also changes the system itself. In our simulation, each dose lowers the baseline that H drifts back to. Below a tipping point, natural rewards can no longer bring H up to the setpoint. Only the drug can, and every dose lowers the baseline further. This creates a feedback loop: drug use lowers the baseline, the deviation without the drug grows, and the next dose becomes more rewarding. The agent doesn't like the drug more; it needs it more. This is a proposed explanation, not the whole story of addiction, but it links homeostatic regulation with learning."

Start reading at 0:00. Timings assume about 150 words per minute with short pauses between sentences. Each beat waits for its cue time (`T_RAPIDLY` … `T_END` at the top of `scene14_drugs.py`) with `self.at(t)`; change those if the narrator is faster or slower.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But it also gives us a way to think about drugs." | Opens on Maths 13's last frame. The heading becomes "drugs in HRL", the agent and its gauge slide left and H falls to 25. Two options appear on the right: a natural reward (an apple, "H + 2", a tiny bar) and a drug (a capsule, "H + 25", a long bar). |
| 0:05.5 | "A drug can change the internal state rapidly and powerfully. If that brings the agent closer to its setpoint, the drug is valuable because it relieves the deviation." | The apple dims; a capsule goes to the agent and the needle jumps from 25 to the setpoint; it smiles. On "If that brings the agent closer…" (0:10) r = D(25) − D(50) = 12.5 − 0 = +12.5 writes in with "relief", and the drug is tagged "worth +12.5". |
| 0:18 | "So, as Keramati and colleagues put it, drug taking is reinforced by relief, not just pleasure." | "Keramati and colleagues" and "1. reinforced by its corrective effect"; a bar for "the drug's reward" grows a long teal "relief" part, then (0:23.5) a short amber "pleasure" part with "not just by its immediate pleasure". |
| 0:26 | "Chronic use also changes the system itself. In our simulation, each dose lowers the baseline that H drifts back to. Below a tipping point, natural rewards can no longer bring H up to the setpoint. Only the drug can, and every dose lowers the baseline further." | "2. chronic use changes the system itself" (with "our simulation"); H settles on the baseline. On "each dose lowers the baseline" (0:29) a grey "B" tick appears on the gauge, with "each dose: baseline B ↓": two doses, and after each one H drifts back to a B that is lower than before. On "Below a tipping point" (0:35) a dashed red "tipping point" tick appears, with B now under it, and the agent frowns. On "natural rewards…" (0:36.5) an apple lifts H only to B + 20, short of the setpoint, and the red deviation arc stays ("below the tipping point, natural rewards fall short"). On "Only the drug can" (0:41) H sinks back to B and a dose brings it to the setpoint ("only the drug reaches H*"); on "every dose lowers the baseline further" (0:43.5) B drops again and H sinks with it ("and B drops further"). |
| 0:46.5 | "This creates a feedback loop: drug use lowers the baseline, the deviation without the drug grows, and the next dose becomes more rewarding. The agent doesn't like the drug more; it needs it more." | "a feedback loop": the nodes appear as they are named, joined by curved arrows: "drug use" → "baseline B drops" (0:48.5) → "deviation when drug is absent" (0:50.5) → "next dose more rewarding" (0:53) → "drug seeking" → back to "drug use", and a dot runs once around the loop. On "doesn't like the drug more" (≈0:58) "likes it more" appears in the middle of the loop and is struck through, then "needs it more" (teal, 0:59.5). |
| 1:02 | "This is a proposed explanation, not the whole story of addiction, but it links homeostatic regulation with learning." | "a proposed explanation", then a crossed-out claim, "× the whole story of addiction"; then (1:06.5) "homeostatic regulation" (teal box) and "reward learning" (violet box), joined by a double arrow. |

## Implementation

- Paced like Maths 10–13 (`PacedScene`, animations 35% slower), but every beat waits for an absolute cue (`PacedScene.at`) rather than chaining pauses, so the whole scene can be re-timed by editing the cue constants.
- The opening frame is `scene13_homeostatic_reward.end_frame()`, so the scenes join exactly; Maths 14's own last frame is `end_frame()` here (built by `caveat_frame()`), for Maths 15.
- The dose is +25, as in our simulation, and the rewards are computed with Maths 12's `drive(h)`.
- The second part is our simulation's mechanism (`js/model.js`): with nothing happening, H drifts back to the baseline B (B0 = 40); each dose lowers B; natural rewards can hold H at most at B + 20, so once B is below the tipping point S − 20 = 30, only the drug reaches the setpoint. `B0`, `TIPPING` and `NATURAL_REACH` are those numbers as gauge levels. The drops in B are compressed (8 per dose on screen; 1 per dose in the simulation).
- `baseline_mark(gauge, level)` is the grey B tick, redrawn as B moves (`always_redraw` on a `ValueTracker`); `tipping_mark(gauge)` is the dashed red tick and its label.
- Cut from the earlier version: the overshoot example (Maths 13 already shows overshooting), the struck-through "good", and Keramati and colleagues' 2017 rising setpoint (our simulation lowers a baseline instead).
- `capsule()` (the drug) is in `common/icons.py`, in its own pink (`PILL`).

## Handoff

Ends on "a proposed explanation", the crossed-out claim ("× the whole story of addiction"), and the two linked boxes ("homeostatic regulation" ↔ "reward learning"), under the "Homeostatic reinforcement learning" title. Maths 15 (harm) starts here: "So far, nothing in the model says the drug is harmful."

# Maths 12 — Homeostatic reinforcement learning: the setpoint and the deviation

Open `animation/index.html` in Live Server. Maths 12 follows Maths 11 in the HRL chapter; its direct link is `#maths-setpoint`. `animation/maths/html/scene12.html` also provides standalone playback.

48 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene12_setpoint.py Scene12Setpoint   # quick preview
./render.sh scenes/scene12_setpoint.py Scene12Setpoint scene12-setpoint
```

## Narration cues

The script's HRL core is split in two: Maths 12 runs from "This brings us to an idea called homeostatic reinforcement learning." to "…the greater the deviation."; Maths 13 picks up at the stage direction "*Place two possible outcomes in front of the agent…*" (the homeostatic reward).

Start reading at 0:00. The cues follow the recorded voiceover, whose lines start at 0:00, 0:04, 0:14, 0:20, 0:26, 0:33, 0:36 and 0:40; the last ends at 0:47.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "This brings us to an idea called homeostatic reinforcement learning." | Opens on Maths 11's last frame. The agent and its gauge slide left and the title "Homeostatic reinforcement learning" comes in. |
| 0:04 | "The central idea, developed by Keramati and colleagues, is that reward learning and regulating our internal state are not separate problems." | "Keramati & Gutkin, 2014" under the title. "reward learning" (amber) and "regulating an internal state" (teal) slide in (0:08.5) and, on "not separate problems" (0:12), slide together into one box. |
| 0:14 | "Let's call the agent's internal state H. Imagine it as a simplified, dopamine-like signal." | The merged box goes. The H on the gauge and in the agent's brain pulse; the needle drifts. "≈ a dopamine-like signal" appears (0:18) and the needle keeps drifting. |
| 0:20 | "The target is the homeostatic setpoint, H*. It is the level the agent is trying to maintain." | A fixed mark at the top of the dial, "H* setpoint"; the needle wobbles around it and settles on it. |
| 0:26 | "Importantly, the agent shouldn't simply maximise H. What matters is the distance from the setpoint." | The needle runs up to full: "more H ≠ better" and a red cross at the top of the dial. Then (0:29) the needle drops below the setpoint and a red arc shows the distance; it swings above the setpoint, and the arc follows. |
| 0:33 | "We call this homeostatic deviation." | "homeostatic deviation" (red) beside the arc. |
| 0:36 | "In our model, we measure it as a scaled squared deviation:" | D(H) = (H* − H)² / H* writes in under "homeostatic deviation", labelled "scaled squared deviation". |
| 0:40 | "At the setpoint, deviation is zero. The further H moves away in either direction, the greater the deviation." | A plot of D(H) for H from 0 to 100: a U with its floor at H* = 50. A dot rides the curve with the needle: it settles at the bottom, "0", then the needle sweeps to near empty and near full and the dot climbs each side. |

Each beat waits for its cue with `self.at(T_...)`; the cue times are constants at the top of `scene12_setpoint.py`.

## Implementation

- Paced like Maths 10 and 11 (`PacedScene`, animations 35% slower); `PacedScene.at(t)` waits for each absolute cue.
- The script's caveat ("This is only an analogy, because a single number can't capture dopamine's full biology.") was cut, and its on-screen caveat with it.
- The line "An outcome can be rewarding because it corrects an internal imbalance." and its two-agent illustration were cut (Maths 13 makes the same point with the homeostatic reward), and so was "Being above the target isn't automatically better."
- H runs from 0 to 100 with H* = 50, matching the simulation; a gauge level v is H = 100 v, so H* sits at the top of the dial, and D(H) = (50 − H)² / 50 runs from 0 at the setpoint to 50 at either end. The plot is `drive(h)` drawn on Manim `Axes`; the dot is an `always_redraw` tied to the gauge's `value`.
- `Gauge` gains `mark(v, label)` (a fixed tick across the track: the setpoint) and `gap(target)` (a live red arc between the target and the needle: the deviation). `label=None` gives an unlabelled mini gauge, used for the two copies of the agent.
- The two copies' reward bars are illustrative (a short and a tall bar); Maths 13 introduces the actual homeostatic reward.
- To hide and bring back the agent and gauge, the scene fades them out and in. Setting their opacity back to 1 would also switch on the fill of outline-only shapes such as the gauge's arcs.

## Handoff

Ends with the agent (left, H in its brain), the gauge with the setpoint H* marked and the needle on it, the red deviation arc (zero length at the setpoint), and in the right column "homeostatic deviation", D(H) = (H* − H)² / H* and the D(H) plot. Maths 13 continues from here.

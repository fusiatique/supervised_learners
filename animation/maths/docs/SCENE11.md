# Maths 11 — Is a reward always worth the same? An internal state

Open `animation/index.html` in Live Server. Maths 11 opens the homeostatic part of the maths chapter, after Maths 10; its direct link is `#maths-internal-state`. `animation/maths/html/scene11.html` also provides standalone playback.

49 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene11_internal_state.py Scene11InternalState   # quick preview
./render.sh scenes/scene11_internal_state.py Scene11InternalState scene11-internal-state
```

## Narration cues

Start reading at 0:00, and start each line at its time (there are small gaps between lines). Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But there is a subtle assumption hiding underneath." | Opens on Maths 10's last frame. The takeaways and the policy box clear; then the whole maze swells towards the camera and dissolves, leaving only the two rewards, which drift apart into empty space, larger and softly glowing. |
| 0:03 | "We've treated rewards as properties of the environment. One is worth ten, another is worth five, and the agent prefers the first." | Each number rises into view above its star on its word: "10" (0:05) and "5" (0:06.5). On "the agent prefers the first" (0:07.5) the agent fades in between them, glances at the 10 and glides over in a slow arc while the camera eases in and the 5 dims. As it arrives (0:10.5) the 10 blooms: rings ripple out, amber sparks burst, a warm glow spreads, the number swells and brightens, and the agent smiles. |
| 0:13.5 | "But is a reward always worth the same?" | A dip to darkness. The same star and the same 10 fade back in, cooler. The agent drifts in from the right, exhausted (heavy eyelids, sweat, a frown), and stops beside it (0:17). The 10 barely flickers, then greys: its two digits drift apart and fade, and the star goes grey. The reward has lost its meaning. This plays about 3 s past the line, a deliberate pause before the next. |
| 0:20 | "A glass of water is far more valuable when you're thirsty. Food is more rewarding when you're hungry. And something rewarding can become less satisfying when you've had too much of it." | The maze comes back as a faint backdrop. Three agents appear, one per sentence, each beside the same glass of water: thirsty (+10, 0:22.5), satisfied (+2, 0:26) and overfull (−3, red, 0:29.5). |
| 0:32 | "The environment hasn't changed. The reward hasn't changed." | The faint maze glimmers; the three glasses are circled together. |
| 0:34.5 | "The agent has." | The three agents pulse. |
| 0:35.5 | "So let's give the agent an internal state as well. This state changes over time, influences how rewarding an action feels, and gives the agent something to regulate." | One agent stays and moves to the left; its brain lights up teal with an H inside (0:37), and an empty gauge titled "internal state" appears beside it. On "changes over time" the needle swings up and back. On "influences how rewarding an action feels" a glass appears whose value follows the needle (+10 near empty, down to −3 near full). On "something to regulate" the needle settles in the middle. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene11_internal_state.py`.

## Implementation

- Paced like Maths 10 (`PacedScene`, animations 35% slower, `REPAY_ACROSS_SECTIONS = False`), and a `MovingCameraScene` for the slow push-in on the 10.
- The opening frame rebuilds Maths 10's end from the shared helpers and that scene's `takeaway_list`. The maze (and the 20 in it) dissolves, so the comparison is only 10 against 5, as the narration says.
- The cinematic beats use `soft_halo` (many thin translucent discs, for a smooth radial glow) and `dim` (fades a halo layer by layer; one opacity on the whole group would brighten it). The bloom is three expanding rings, eighteen sparks and a widening warm halo; the exhausted pass greys the star and drifts the 1 and the 0 apart.
- New shared pieces for the homeostatic scenes:
  - `common/gauge.py`: `Gauge`, the internal-state dial: a semicircular track, a teal fill up to the level, a needle and an H label, driven by `gauge.value` (a `ValueTracker` from 0 to 1). Maths 12 adds the setpoint H* to it.
  - `common/icons.py`: `water_glass()`.
  - `Agent.mood(kind)`: "tired" (heavy eyelids, sweat, frown), "thirsty" (open mouth, sweat), "satisfied" (smile) and "overfull" (queasy mouth, flushed cheeks). New mouths "open" and "wavy".
- The glass's value beside the gauge is an illustration, `worth(v) = 10 − 16v`: +10 when H is empty, falling below zero when it is nearly full. Maths 12 replaces it with the real homeostatic reward.
- `GridStage` now positions the agent by its head, so marks like sweat drops can't pull it off-centre. For a plain agent its outline is its head, so earlier scenes are unaffected.

## Handoff

Ends on the agent (left, with a teal H in its brain) and the "internal state" gauge (right) with its needle in the middle. Maths 12 (homeostatic reinforcement learning) starts here: it moves H up and down and adds the setpoint H*.

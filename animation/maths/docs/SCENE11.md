# Maths 11 — Is a reward always worth the same? An internal state

Open `animation/index.html` in Live Server. Maths 11 opens the homeostatic part of the maths chapter, after Maths 10; its direct link is `#maths-internal-state`. `animation/maths/html/scene11.html` also provides standalone playback.

48 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene11_internal_state.py Scene11InternalState   # quick preview
./render.sh scenes/scene11_internal_state.py Scene11InternalState scene11-internal-state
```

## Narration cues

**Script changes:** "We've treated rewards as properties of the environment: one is worth ten, another is worth five." ("and the agent prefers the first" and the agent gliding to the 10 are cut). The water-and-food line is replaced by one about the glass of water, so it matches the three agents on screen: "A glass of water is worth a lot when you're thirsty. Less when you've already had enough to drink. And when you've had too much, another glass can even feel unpleasant." "The environment hasn't changed. The reward hasn't changed. The agent has." becomes "The glass hasn't changed. The agent has."

Start reading at 0:00, and start each line at its time (there are small gaps between lines). Timings assume about 145 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But there is a subtle assumption hiding underneath." | Opens on Maths 10's last frame. The takeaways and the policy box clear; then the whole maze swells towards the camera and dissolves, leaving only the two rewards, which drift apart into empty space, larger and softly glowing. |
| 0:03 | "We've treated rewards as properties of the environment: one is worth ten, another is worth five." | Each number rises into view above its star on its word: "10" (0:06.5) and "5" (0:08). |
| 0:10 | "But is a reward always worth the same?" | A "?" appears beside each number (0:11), and the glows dim a little. |
| 0:13 | *(end of the question)* | The rewards fade and the maze returns as a faint backdrop. |
| 0:14.5 | "A glass of water is worth a lot when you're thirsty. Less when you've already had enough to drink. And when you've had too much, another glass can even feel unpleasant." | Three agents appear, one per sentence, each beside the same glass of water, already in its state and moving from the moment it appears; then its value pops in: thirsty (panting, a drop of sweat running down; +10, 0:14.5), satisfied (a smile; +2, 0:19.5) and overfull (eyes squeezed shut, puffed and flushed cheeks, swaying with hiccups as bubbles rise; −3, red, 0:23). The thirsty and overfull agents keep moving. |
| 0:29.5 | "The glass hasn't changed. The agent has." | The three glasses are circled together; on "The agent has" (0:31.5) the three agents pulse. The faint maze stays as it is. |
| 0:33 | "So let's give the agent an internal state as well. This state changes over time, influences how rewarding an action feels, and gives the agent something to regulate." | One agent stays and moves to the left, and its face settles. A large teal H appears beside it (0:34) and glides into its brain, which lights up like a neon sign (the shared `absorb` beat) and keeps the H; an empty gauge titled "internal state" appears beside it as it lands. On "changes over time" (0:39) the needle swings up and back. On "influences how rewarding an action feels" (0:41.5) a glass appears whose value follows the needle (+10 near empty, down to −3 near full). On "something to regulate" (0:44) the needle settles in the middle. |

After the opening dissolve, each beat waits for its cue time (`T_TEN` … `T_END` at the top of `scene11_internal_state.py`) with `self.at(t)`. Change those if the narrator is faster or slower.

## Implementation

- Paced like Maths 10 (`PacedScene`, animations 35% slower, `REPAY_ACROSS_SECTIONS = False`), and a `MovingCameraScene` for the slow push-in on the 10.
- The opening frame rebuilds Maths 10's end from the shared helpers and that scene's `takeaway_list`. The maze (and the 20 in it) dissolves, so the comparison is only 10 against 5, as the narration says.
- The cinematic beats use `soft_halo` (many thin translucent discs, for a smooth radial glow) and `dim` (fades a halo layer by layer; one opacity on the whole group would brighten it). The bloom is three expanding rings, eighteen sparks and a widening warm halo.
- New shared pieces for the homeostatic scenes:
  - `common/gauge.py`: `Gauge`, the internal-state dial: a semicircular track, a teal fill up to the level, a needle and an H label, driven by `gauge.value` (a `ValueTracker` from 0 to 1). Maths 12 adds the setpoint H* to it.
  - `common/icons.py`: `water_glass()`.
  - Animated moods on `Agent`: `set_mood(kind)` morphs the face into "thirsty" (an open, panting mouth and a teardrop of sweat), "satisfied" (a smile), "overfull" (eyes squeezed shut, lips pressed together, the head puffing out at the cheeks, a soft blush) or "tired" (half-closed eyes under drooping lids, bags, a weary mouth, sweat; used in Maths 15), and `idle()` keeps it moving while the agent waits: a thirsty pant with the sweat running down, and an overfull queasy sway with a hiccup every couple of seconds and bubbles rising from the mouth. `set_mood("blank")` settles the face back.
- H goes into the brain with `common.absorb`, the same glide-and-light-up as every equation the agent takes in; the brain disc and its H start invisible and switch on as it lands (`settle=0.35`, the disc's usual brightness).
- The glass's value beside the gauge is an illustration, `worth(v) = 10 − 16v`: +10 when H is empty, falling below zero when it is nearly full. Maths 12 replaces it with the real homeostatic reward.
- `GridStage` now positions the agent by its head, so marks like sweat drops can't pull it off-centre. For a plain agent its outline is its head, so earlier scenes are unaffected.

## Handoff

Ends on the agent (left, with a teal H in its brain) and the "internal state" gauge (right) with its needle in the middle. Maths 12 (homeostatic reinforcement learning) starts here: it moves H up and down and adds the setpoint H*.

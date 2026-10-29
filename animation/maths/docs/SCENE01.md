# Maths 01 — The agent and its environment

Open `animation/index.html` in Live Server. Maths 01 opens chapter 3 and pauses when you leave its page. Its direct link is `#maths-agent-environment`. `animation/maths/html/scene01.html` also provides standalone playback.

42 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene01_agent_environment.py Scene01AgentEnvironment   # quick preview
./render.sh scenes/scene01_agent_environment.py Scene01AgentEnvironment scene01-agent-environment
```

## Narration cues

Start reading at 0:00. The pauses are kept tight: the opening line needs about 170 words per minute to reach "Reinforcement Learning" at 0:07, and the environment beat (0:27–0:38) about 165.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Addiction as an exploitation of the reward learning system of the brain can be abstractly explained through a computational model called…" | Empty screen. |
| 0:07 | "…'Reinforcement Learning'. The big picture idea is simple." | "Reinforcement Learning" writes in on the words; the subtitle follows. |
| 0:13.5 | "First, you have an agent." | The agent grows in, labelled "agent". |
| 0:15.5 | "Currently, it is dumb, with nothing in its brain." | On "dumb" (0:16) the face goes vacant: mismatched eyes, the tongue poking out, and a slow wobble. On "nothing in its brain" (0:17.5) the screen zooms in through its forehead until the inside of its head fills the screen, and an empty brain draws in (0:19). |
| 0:20 | "We will slowly inject certain 'properties' into its brain through equations." | The equations still to come (f(s, a) = s′, R(s), V(s), G_t, γ, Q(s, a) = r + γV(s′), the Q-learning update, π(a ∣ s), ε and D(H)) glide in on gentle arcs and settle inside the brain (0:20–0:23.5); then the brain lights up like a neon sign (0:23.5–0:25). The view pulls back out (0:25.5), the brain shrinking into the head and fading, and the face settles back to blank. |
| 0:27 | "Next, you need an environment." | A large square draws around the agent as it shrinks into the centre; labelled "environment". |
| 0:29.5 | "This can be anything the agent interacts with, for example, a maze." | The maze walls draw in inside the square (0:29.5–0:32); faint grid lines then mark the positions. |
| 0:33.5 | "For our case, we'll use a simple environment with just a few distinct states." | The walls fade, the square closes down to one cell, and eight cells grow around it. |
| 0:38 | "These states are, for example, positions the agent can be in." | Large, faint s1–s9 watermarks fade in, centred in each cell. Then the grid slides left, "agent state: s5" appears and s5 lights up, and the agent steps up to s2 and back (the readout follows). |
| 0:42 | *(hold)* | Agent at s5, ready for Maths 02. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene01_agent_environment.py`; change it if the narrator is faster or slower.

## Shared building blocks

`scenes/common/` is imported by every maths scene:

- `theme.py`: colours matching the presentation's `--c-*` tokens (amber dopamine/reward, teal homeostasis, red harm, violet agent/model) and the `#101827` background.
- `agent.py`: `Agent`, a violet-outlined face with `make_mouth("blank" | "happy" | "sad" | …)`, `blink()` and `brain_point()`. Moods are animated: `set_mood(kind)` morphs the eyes, mouth, head and marks into "dumb", "tired", "thirsty", "satisfied", "overfull" or back to "blank" (`show_mood` applies one at once), and `idle()` keeps the mood moving while the agent is on screen (a dumb wobble, a tired nod with sweat running down, a thirsty pant, an overfull sway with hiccups and bubbles). `absorb(mob, agent)` is the one beat for every equation the agent takes in, from Maths 04 to 13: the equation glides in on a gentle arc, shrinking into the brain, and the brain lights up like a neon sign (`light_up`, driven by `neon`). Give the agent `set_z_index(10)` so it stays above cells, walls and labels.
- `grid.py`: `GridWorld(rows, cols, cell, walls)` with `make_labels()` (large faint watermarks), `center_of(s)` and the transition function `step(s, action)`; `Maze(rows, cols, cell, seed)`, a seeded perfect maze with separate `outline`, `walls` and `gridlines` parts.

## Implementation

- The zoom scales the agent by `ZOOM` (22) about a point just above its brain, so its forehead fills the screen (deep enough that neither the outline nor the eyes show); scaling back out restores it exactly. Strokes don't scale, so the outline stays crisp.
- `brain_outline(width)` is a side view: a union of circles for the lobed cerebrum, an ellipse for the cerebellum and a rectangle for the stem, with a few faint folds near the edge. `PROPERTIES` places each equation inside it, coloured like the scene that introduces it (violet for values and policies, amber for rewards, teal for the internal state).
- The equations arrive the way every equation later goes into the agent (`absorb`): on a gentle arc, then the neon light-up (`brain_glow`, the same `neon` curve as `light_up`).

## Handoff

The last second holds the agent back at s5 with the readout showing s5. Maths 02 (actions and transitions) starts from this frame.

# Maths 01 — The agent and its environment

Open `animation/index.html` in Live Server. Maths 01 opens chapter 3 and pauses when you leave its page. Its direct link is `#maths-agent-environment`. `animation/maths/html/scene01.html` also provides standalone playback.

About 52 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene01_agent_environment.py Scene01AgentEnvironment   # quick preview
./render.sh scenes/scene01_agent_environment.py Scene01AgentEnvironment scene01-agent-environment
```

| Section | Narration | Visual |
| --- | --- | --- |
| `title` | "Addiction as an exploitation of the reward learning system … The big picture idea is simple." | Title and subtitle, held for the opening line. |
| `agent` | "First, you have an agent." → "…into its brain through equations." | Blank-faced agent grows in; an empty thought bubble appears, then fills with V(s), Q(s,a), π(s), γ as a preview of what the agent will learn. |
| `environment` | "Next, you need an environment." → "…just a few distinct states." | A cell appears around the agent; it shrinks to become the centre of a 7 × 7 maze; the maze fades and eight cells grow around the agent's cell. |
| `states` | "These states are, for example, positions…" → "…represented by these states." | Faint s1–s9 labels, numbered row by row from the top left. The grid moves left, an "agent state: sₓ" readout appears, and the agent walks s5 → s2 → s3 → s6 → s9 → s8 → s5 with the readout and cell highlight following. |

Waits are timed to narration at about 150 words per minute; adjust the `self.wait(...)` after each beat if the narrator is faster or slower.

## Shared building blocks

`scenes/common/` is imported by every maths scene:

- `theme.py`: colours matching the presentation's `--c-*` tokens (amber dopamine/reward, teal homeostasis, red harm, violet agent/model) and the `#101827` background.
- `agent.py`: `Agent` (face with `make_mouth("blank" | "happy" | "sad")` and `brain_point()`) and `absorb(mob, agent)` for equations disappearing into its brain.
- `grid.py`: `GridWorld(rows, cols, cell, walls)` with `make_labels()`, `center_of(s)` and the transition function `step(s, action)`.

## Handoff

The last second holds the agent back at s5 with the readout showing s5. Maths 02 (actions and transitions) starts from this frame.

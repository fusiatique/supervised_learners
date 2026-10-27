# Maths 01 — The agent and its environment

Open `animation/index.html` in Live Server. Maths 01 opens chapter 3 and pauses when you leave its page. Its direct link is `#maths-agent-environment`. `animation/maths/html/scene01.html` also provides standalone playback.

39 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene01_agent_environment.py Scene01AgentEnvironment   # quick preview
./render.sh scenes/scene01_agent_environment.py Scene01AgentEnvironment scene01-agent-environment
```

## Narration cues

Start reading at 0:00. The pauses are kept tight: the opening line needs about 170 words per minute to reach "Reinforcement Learning" at 0:07, and the environment beat (0:23–0:34) about 165.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "Addiction as an exploitation of the reward learning system of the brain can be abstractly explained through a computational model called…" | Empty screen. |
| 0:07 | "…'Reinforcement Learning'. The big picture idea is simple." | "Reinforcement Learning" writes in on the words; the subtitle follows. |
| 0:12.5 | "First, you have an agent." | The agent grows in, labelled "agent". |
| 0:14.5 | "Currently, it is dumb, with nothing in its brain." | The agent blinks; an empty thought bubble appears. |
| 0:18 | "We will slowly inject certain 'properties' into its brain through equations." | V(s), Q(s,a), π(s) and γ pop into the bubble; it fades at 0:22. |
| 0:23 | "Next, you need an environment." | A large square draws around the agent as it shrinks into the centre; labelled "environment". |
| 0:25.5 | "This can be anything the agent interacts with, for example, a maze." | The maze walls draw in inside the square (0:25.5–0:28); faint grid lines then mark the positions. |
| 0:29.5 | "For our case, we'll use a simple environment with just a few distinct states." | The walls fade, the square closes down to one cell, and eight cells grow around it. |
| 0:34 | "These states are, for example, positions the agent can be in." | Large, faint s1–s9 watermarks fade in, centred in each cell. Then the grid slides left, "agent state: s5" appears and s5 lights up, and the agent steps up to s2 and back (the readout follows). |
| 0:38.5 | *(hold)* | Agent at s5, ready for Maths 02. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene01_agent_environment.py`; change it if the narrator is faster or slower.

## Shared building blocks

`scenes/common/` is imported by every maths scene:

- `theme.py`: colours matching the presentation's `--c-*` tokens (amber dopamine/reward, teal homeostasis, red harm, violet agent/model) and the `#101827` background.
- `agent.py`: `Agent`, a violet-outlined face with `make_mouth("blank" | "happy" | "sad")`, `blink()` and `brain_point()`, and `absorb(mob, agent)` for equations disappearing into its brain. Give it `set_z_index(10)` so it stays above cells, walls and labels.
- `grid.py`: `GridWorld(rows, cols, cell, walls)` with `make_labels()` (large faint watermarks), `center_of(s)` and the transition function `step(s, action)`; `Maze(rows, cols, cell, seed)`, a seeded perfect maze with separate `outline`, `walls` and `gridlines` parts.

## Handoff

The last second holds the agent back at s5 with the readout showing s5. Maths 02 (actions and transitions) starts from this frame.

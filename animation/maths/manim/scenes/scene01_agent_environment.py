"""Maths 01 — The agent and its environment.

Narration: from "Addiction as an exploitation of the reward learning system..."
to "These states are, for example, positions the agent can be in."
"""

from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    UR,
    Circle,
    Create,
    DashedVMobject,
    Ellipse,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    LaggedStart,
    MathTex,
    Scene,
    Square,
    Text,
    Transform,
    VGroup,
    ReplacementTransform,
    Write,
)

from common import AGENT_RATIO, CELL, CELL_3X3, GRID_SHIFT, HIGHLIGHT, INK, MODEL, MUTED, Agent, GridWorld, Maze, state_panel

CELL_MAZE = 0.9

# s5 -> s2 -> s3 -> s6 -> s9 -> s8 -> s5
WANDER = ["up", "down"]  # s5 -> s2 -> s5


class Scene01AgentEnvironment(Scene):
    def construct(self):
        # "Addiction as an exploitation of the reward learning system ... The big picture idea is simple."
        self.next_section("title")
        title = Text("Reinforcement Learning", font_size=60, color=INK)
        subtitle = Text("a computational model of reward learning", font_size=30, color=MUTED)
        subtitle.next_to(title, DOWN, buff=0.35)
        # Empty screen until the narration reaches "...a computational model called".
        self.wait(7.5)
        # "...'Reinforcement Learning'."
        self.play(Write(title), run_time=2)
        self.play(FadeIn(subtitle, shift=0.2 * UP))
        # "The big picture idea is simple."
        self.wait(2)
        self.play(FadeOut(title, subtitle))

        # "First, you have an agent."
        self.next_section("agent")
        agent = Agent(radius=1.1).set_z_index(10)  # always above cells, walls and labels
        agent_label = Text("agent", font_size=30, color=MODEL).next_to(agent.head, DOWN, buff=0.45)
        self.play(GrowFromCenter(agent))
        self.play(FadeIn(agent_label, shift=0.1 * UP))
        self.wait(0.1)

        # "Currently, it is dumb, with nothing in its brain."
        self.play(agent.blink())
        bubble = VGroup(
            Circle(radius=0.08),
            Circle(radius=0.13).shift(0.35 * UR),
            Ellipse(width=3.0, height=1.6).shift(1.6 * UR + 0.15 * RIGHT),
        ).set_stroke(MUTED, width=3)
        bubble.next_to(agent.head, UR, buff=-0.15)
        bubble[2] = DashedVMobject(bubble[2], num_dashes=40)
        self.play(LaggedStart(*[FadeIn(part, scale=0.6) for part in bubble], lag_ratio=0.35))
        self.wait(1.5)

        # "We will slowly inject certain 'properties' into its brain through equations."
        props = VGroup(
            MathTex(r"V(s)"), MathTex(r"Q(s,a)"), MathTex(r"\pi(s)"), MathTex(r"\gamma")
        ).set_color(MODEL).scale(0.8)
        props.arrange_in_grid(rows=2, cols=2, buff=(0.45, 0.2)).move_to(bubble[2])
        self.play(LaggedStart(*[FadeIn(p, scale=1.4) for p in props], lag_ratio=0.3))
        self.wait(2)
        self.play(FadeOut(props, bubble))

        # "Next, you need an environment."
        self.next_section("environment")
        # The environment appears at full size, already the maze's border, as the agent
        # shrinks to fit one of its cells.
        maze = Maze(7, 7, cell=CELL_MAZE)
        frame = maze.outline
        self.play(
            FadeOut(agent_label),
            agent.animate.scale(AGENT_RATIO * CELL_MAZE / agent.radius).move_to(maze.center_of(25)),
            Create(frame),
        )
        env_label = Text("environment", font_size=30, color=INK).next_to(frame, DOWN, buff=0.2)
        self.play(FadeIn(env_label, shift=0.1 * UP))
        self.wait(0.5)

        # "This can be anything the agent interacts with, for example, a maze."
        # The walls draw in, then faint grid lines show that the maze is made of positions.
        self.play(
            FadeOut(env_label),
            LaggedStart(*[Create(w) for w in maze.walls], lag_ratio=0.04, run_time=2.5),
        )
        self.play(FadeIn(maze.gridlines))
        self.wait(0.5)

        # "For our case, we'll use a simple environment with just a few distinct states."
        frame = Square(side_length=CELL_3X3, stroke_color=INK, stroke_width=2, fill_color=CELL, fill_opacity=1)
        self.play(FadeOut(maze.walls, maze.gridlines), run_time=0.8)
        self.play(
            ReplacementTransform(maze.outline, frame),
            agent.animate.scale(CELL_3X3 / CELL_MAZE),
        )
        grid = GridWorld(3, 3, cell=CELL_3X3)
        ring = [grid[s] for s in (1, 2, 3, 6, 9, 8, 7, 4)]
        self.play(LaggedStart(*[GrowFromCenter(c) for c in ring], lag_ratio=0.12, run_time=1.8))
        # Swap the lone frame for the grid's own centre cell, which sits in the same place.
        self.remove(frame)
        self.add(grid)
        self.wait(1)

        # "These states are, for example, positions the agent can be in."  The labels fade in; the grid
        # slides left as "agent state" appears, and the agent steps to a neighbouring state and back.
        self.next_section("states")
        labels = grid.make_labels()
        self.play(LaggedStart(*[FadeIn(l, scale=1.2) for l in labels], lag_ratio=0.15, run_time=1.6))
        world = VGroup(grid, labels, agent)
        panel, readout = state_panel(5)
        self.play(world.animate.shift(GRID_SHIFT), FadeIn(panel, shift=0.2 * LEFT), run_time=0.8)
        self.play(grid[5].animate.set_fill(HIGHLIGHT), run_time=0.25)  # (not with the shift: both would move grid[5])
        s = 5
        for action in WANDER:
            s2 = grid.step(s, action)
            new_readout = MathTex(f"s_{{{s2}}}", font_size=60, color=MODEL).move_to(readout)
            self.play(
                agent.animate.move_to(grid.center_of(s2)),
                grid[s].animate.set_fill(CELL),
                grid[s2].animate.set_fill(HIGHLIGHT),
                Transform(readout, new_readout),
                run_time=0.45,
            )
            s = s2

        # Hold for the hand-off to Maths 02.
        self.wait(0.4)

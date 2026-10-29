"""Maths 01 — The agent and its environment.

Narration: from "Addiction as an exploitation of the reward learning system..."
to "These states are, for example, positions the agent can be in."
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    UP,
    ArcBetweenPoints,
    Circle,
    Create,
    Ellipse,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    LaggedStart,
    MathTex,
    Rectangle,
    ReplacementTransform,
    Scene,
    Square,
    Text,
    Transform,
    Union,
    UpdateFromAlphaFunc,
    VGroup,
    Write,
    rate_functions,
    smooth,
)

from common import (
    AGENT_RATIO, CELL, CELL_3X3, DOPAMINE, GRID_SHIFT, HIGHLIGHT, HOMEO, INK, MODEL, MUTED, Agent, GridWorld, Maze,
    neon, state_panel,
)

CELL_MAZE = 0.9
ZOOM = 22  # how far we zoom into the agent's head: far enough that its forehead fills the screen
BRAIN_WIDTH = 9.0
# The equations still to come, each placed inside the brain (as fractions of its width) and coloured
# like the scenes that introduce them: violet for the agent's values and policies, amber for rewards,
# teal for the internal state.
PROPERTIES = [
    (r"R(s)", DOPAMINE, (-0.1, 0.3)),
    (r"V(s)", MODEL, (0.12, 0.3)),
    (r"f(s, a) = s'", INK, (-0.25, 0.165)),
    (r"G_t = R_{t+1} + \gamma R_{t+2} + \cdots", DOPAMINE, (0.13, 0.165)),
    (r"Q(s, a) = r(s, a, s') + \gamma V(s')", MODEL, (-0.05, 0.035)),
    (r"\gamma", MODEL, (0.33, 0.04)),
    (r"Q(s, a) \leftarrow Q(s, a) + \alpha\,[\,\cdots]", MODEL, (-0.1, -0.095)),
    (r"\pi(a \mid s)", MODEL, (0.27, -0.09)),
    (r"\varepsilon", MODEL, (-0.31, -0.19)),
    (r"D(H) = \frac{(H^* - H)^2}{H^*}", HOMEO, (0.05, -0.2)),
]


def brain_outline(width):
    """A brain seen from the side, facing left and `width` across: a lobed cerebrum, the cerebellum
    and the stem, and two faint folds."""
    def at(x, y):
        return width * np.array([x, y, 0])

    lobes = [(-0.36, -0.02, 0.15), (-0.30, 0.13, 0.15), (-0.17, 0.23, 0.16), (0.0, 0.26, 0.16), (0.17, 0.23, 0.16),
             (0.31, 0.12, 0.15), (0.37, -0.02, 0.14), (0.27, -0.12, 0.13), (0.1, -0.14, 0.14), (-0.1, -0.14, 0.14),
             (-0.27, -0.12, 0.13), (0.0, 0.05, 0.28)]
    parts = [Circle(radius=width * r).move_to(at(x, y)) for x, y, r in lobes]
    parts.append(Ellipse(width=0.26 * width, height=0.14 * width).move_to(at(0.25, -0.25)))  # cerebellum
    parts.append(Rectangle(width=0.07 * width, height=0.18 * width).rotate(0.3).move_to(at(0.1, -0.3)))  # stem
    shape = Union(*parts).set_stroke(MODEL, width=4).set_fill(MODEL, opacity=0.06)
    folds = VGroup(  # a few short folds near the edge, clear of the equations
        ArcBetweenPoints(at(-0.43, 0.06), at(-0.33, 0.07), angle=-0.8),
        ArcBetweenPoints(at(0.27, 0.32), at(0.34, 0.24), angle=0.7),
        ArcBetweenPoints(at(0.42, -0.02), at(0.4, -0.13), angle=0.7),
        ArcBetweenPoints(at(0.18, -0.24), at(0.32, -0.25), angle=0.6),  # the cerebellum's edge
    ).set_stroke(MODEL, width=3, opacity=0.35)
    return VGroup(shape, folds)


def brain_glow(brain, run_time=1.8):
    """The brain switches on like the agent's does whenever it takes in an equation (common.neon)."""
    shape = brain[0]

    def update(_, alpha):
        v = neon(alpha)
        shape.set_fill(opacity=0.06 + 0.24 * v)
        shape.set_stroke(width=4 + 4 * v)

    return UpdateFromAlphaFunc(shape, update, run_time=run_time)

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
        self.wait(0.7)
        # "...dumb..."  The face goes vacant: mismatched eyes, the tongue out, a slow wobble.
        self.play(agent.set_mood("dumb"))
        agent.idle()
        self.wait(0.4)
        # "...with nothing in its brain."  We zoom in through its forehead until the inside of its head
        # fills the screen, and an empty brain draws in.
        agent.stop_idle()
        pivot = agent.head.get_center() + 0.72 * agent.radius * UP
        brain = brain_outline(BRAIN_WIDTH).move_to(0.2 * DOWN).set_z_index(11)
        self.play(FadeOut(agent_label),
                  agent.animate(rate_func=rate_functions.ease_in_cubic).scale(ZOOM, about_point=pivot).shift(-pivot),
                  run_time=1.4)
        self.play(Create(brain[0]), FadeIn(brain[1]), run_time=1.0)
        self.wait(0.4)

        # "We will slowly inject certain 'properties' into its brain through equations."  The equations
        # to come glide in on gentle arcs and settle in the brain, which then lights up.
        props = VGroup(*[
            MathTex(tex, font_size=36, color=color).move_to(BRAIN_WIDTH * np.array([x, y, 0]) + brain[0].get_center())
            for tex, color, (x, y) in PROPERTIES
        ]).set_z_index(12)
        starts = [p.copy().scale(1.6).move_to(2.6 * p.get_center()).set_opacity(0) for p in props]
        self.play(LaggedStart(*[ReplacementTransform(a, b, path_arc=0.6, rate_func=smooth) for a, b in zip(starts, props)],
                              lag_ratio=0.18, run_time=3.2))
        self.play(brain_glow(brain))
        self.wait(0.3)
        # Back out: the brain and its equations shrink into the head and fade (they come one by one, later),
        # and the face settles.
        inside = VGroup(brain, props)
        self.play(agent.animate(rate_func=rate_functions.ease_out_cubic).shift(pivot).scale(1 / ZOOM, about_point=pivot),
                  inside.animate(rate_func=rate_functions.ease_out_cubic).shift(pivot).scale(1 / ZOOM, about_point=pivot)
                  .set_opacity(0), run_time=1.2)
        self.remove(inside)
        self.play(agent.set_mood("blank"), run_time=0.5)

        # "Next, you need an environment."
        self.next_section("environment")
        # The environment appears at full size, already the maze's border, as the agent
        # shrinks to fit one of its cells.
        maze = Maze(7, 7, cell=CELL_MAZE)
        frame = maze.outline
        self.play(
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

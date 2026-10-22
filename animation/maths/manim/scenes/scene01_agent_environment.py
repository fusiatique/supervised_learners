"""Maths 01 — The agent and its environment.

Narration: from "Addiction as an exploitation of the reward learning system..."
to "The agent position is now represented by these states."
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
    Write,
    ManimColor,
)

from common import CELL, INK, MODEL, MUTED, Agent, GridWorld

MAZE_WALLS = {2, 9, 11, 12, 13, 16, 20, 27, 29, 30, 34, 37, 38, 39, 41, 46, 48}
CELL_3X3 = 1.8
CELL_MAZE = 0.9
AGENT_RATIO = 0.27  # agent radius as a fraction of the cell it sits in
HIGHLIGHT = ManimColor(CELL).interpolate(ManimColor(MODEL), 0.25)

# s5 -> s2 -> s3 -> s6 -> s9 -> s8 -> s5
WANDER = ["up", "right", "down", "down", "left", "up"]


class Scene01AgentEnvironment(Scene):
    def construct(self):
        # "Addiction as an exploitation of the reward learning system ... The big picture idea is simple."
        self.next_section("title")
        title = Text("Reinforcement Learning", font_size=60, color=INK)
        subtitle = Text("a computational model of reward learning", font_size=30, color=MUTED)
        subtitle.next_to(title, DOWN, buff=0.35)
        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(subtitle, shift=0.2 * UP))
        self.wait(8)
        self.play(FadeOut(title, subtitle))

        # "First, you have an agent."
        self.next_section("agent")
        agent = Agent(radius=1.1)
        agent_label = Text("agent", font_size=30, color=MODEL).next_to(agent, DOWN, buff=0.3)
        self.play(GrowFromCenter(agent))
        self.play(FadeIn(agent_label, shift=0.1 * UP))
        self.wait(1)

        # "Currently, it is dumb, with nothing in its brain."
        bubble = VGroup(
            Circle(radius=0.08),
            Circle(radius=0.13).shift(0.35 * UR),
            Ellipse(width=3.0, height=1.6).shift(1.6 * UR + 0.15 * RIGHT),
        ).set_stroke(MUTED, width=3)
        bubble.next_to(agent.head, UR, buff=-0.15)
        bubble[2] = DashedVMobject(bubble[2], num_dashes=40)
        self.play(LaggedStart(*[FadeIn(part, scale=0.6) for part in bubble], lag_ratio=0.35))
        self.wait(2)

        # "We will slowly inject certain 'properties' into its brain through equations."
        props = VGroup(
            MathTex(r"V(s)"), MathTex(r"Q(s,a)"), MathTex(r"\pi(s)"), MathTex(r"\gamma")
        ).set_color(MODEL).scale(0.8)
        props.arrange_in_grid(rows=2, cols=2, buff=(0.45, 0.2)).move_to(bubble[2])
        self.play(LaggedStart(*[FadeIn(p, scale=1.4) for p in props], lag_ratio=0.3))
        self.wait(2.5)
        self.play(FadeOut(props, bubble))

        # "Next, you need an environment."
        self.next_section("environment")
        frame = Square(side_length=CELL_3X3, stroke_color=INK, stroke_width=2, fill_color=CELL, fill_opacity=1)
        self.play(
            FadeOut(agent_label),
            agent.animate.scale(AGENT_RATIO * CELL_3X3 / agent.radius),
        )
        self.add(frame, agent)
        self.play(Create(frame))
        env_label = Text("environment", font_size=30, color=INK).next_to(frame, DOWN, buff=0.3)
        self.play(FadeIn(env_label, shift=0.1 * UP))
        self.wait(1)

        # "This can be anything the agent interacts with, for example, a maze."
        maze = GridWorld(7, 7, cell=CELL_MAZE, walls=MAZE_WALLS)
        maze_rest = VGroup(*[maze[s] for s in range(1, 50) if s != 25])
        self.play(
            FadeOut(env_label),
            VGroup(frame, agent).animate.scale(CELL_MAZE / CELL_3X3),
        )
        self.play(LaggedStart(*[FadeIn(c, scale=0.8) for c in maze_rest], lag_ratio=0.02, run_time=2))
        self.bring_to_front(frame, agent)
        self.wait(2)

        # "For our case, we'll use a simple environment with just a few distinct states."
        self.play(LaggedStart(*[FadeOut(c, scale=0.8) for c in maze_rest], lag_ratio=0.01, run_time=1.5))
        self.play(VGroup(frame, agent).animate.scale(CELL_3X3 / CELL_MAZE))
        grid = GridWorld(3, 3, cell=CELL_3X3)
        ring = [grid[s] for s in (1, 2, 3, 6, 9, 8, 7, 4)]
        self.play(LaggedStart(*[GrowFromCenter(c) for c in ring], lag_ratio=0.12, run_time=1.8))
        # Swap the lone frame for the grid's own centre cell, which sits in the same place.
        self.remove(frame)
        self.add(grid)
        self.bring_to_front(agent)
        self.wait(1.5)

        # "These states are, for example, positions the agent can be in."
        self.next_section("states")
        labels = grid.make_labels()
        self.play(LaggedStart(*[FadeIn(l) for l in labels], lag_ratio=0.15, run_time=2))
        self.wait(2)

        # "The agent position is now represented by these states."
        world = VGroup(grid, labels, agent)
        self.play(world.animate.shift(2.3 * LEFT))
        caption = Text("agent state:", font_size=34, color=MUTED)
        readout = MathTex("s_{5}", font_size=60, color=MODEL)
        panel = VGroup(caption, readout).arrange(RIGHT, buff=0.3).move_to(4.2 * RIGHT)
        self.play(FadeIn(panel, shift=0.2 * LEFT), grid[5].animate.set_fill(HIGHLIGHT))
        self.wait(0.5)

        s = 5
        for action in WANDER:
            s2 = grid.step(s, action)
            new_readout = MathTex(f"s_{{{s2}}}", font_size=60, color=MODEL).move_to(readout)
            self.play(
                agent.animate.move_to(grid.center_of(s2)),
                grid[s].animate.set_fill(CELL),
                grid[s2].animate.set_fill(HIGHLIGHT),
                Transform(readout, new_readout),
                run_time=0.7,
            )
            self.wait(0.35)
            s = s2

        # Hold for the hand-off to Maths 02.
        self.wait(1)

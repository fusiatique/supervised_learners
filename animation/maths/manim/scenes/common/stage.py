"""The grid stage that Maths 01 ends on and later scenes build on: the grid on the
left, the agent in it, and an "agent state: s" readout on the right. Defaults to the
3x3 grid; pass rows, cols and cell for a bigger one."""

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    FadeOut,
    AnimationGroup,
    Arrow,
    ManimColor,
    MathTex,
    Text,
    Transform,
    VGroup,
    there_and_back,
)

from .agent import Agent
from .grid import ACTIONS, GridWorld
from .theme import CELL, INK, MODEL, MUTED

CELL_3X3 = 1.8
AGENT_RATIO = 0.27  # agent radius as a fraction of the cell it sits in
GRID_SHIFT = 2.3 * LEFT
PANEL_POS = 4.2 * RIGHT
RIGHT_X = 3.9  # centre of the free column to the right of the grid
HIGHLIGHT = ManimColor(CELL).interpolate(ManimColor(MODEL), 0.25)
ARROW_IDLE = ManimColor(INK).interpolate(ManimColor(CELL), 0.6)


def state_panel(s):
    """The "agent state: s" caption and readout; returns (panel, readout)."""
    caption = Text("agent state:", font_size=34, color=MUTED)
    readout = MathTex(f"s_{{{s}}}", font_size=60, color=MODEL)
    panel = VGroup(caption, readout).arrange(RIGHT, buff=0.3).move_to(PANEL_POS)
    return panel, readout


class GridStage:
    """Builds the stage in its Maths 01 end state and returns animations for moving
    the agent. Add `stage.group` to the scene; call `stage.add_arrows()` for action arrows."""

    def __init__(self, s=5, rows=3, cols=3, cell=CELL_3X3):
        self.state = s
        self.cell = cell
        self.grid = GridWorld(rows, cols, cell=cell).shift(GRID_SHIFT)
        self.grid[s].set_fill(HIGHLIGHT)
        self.labels = self.grid.make_labels()
        self.agent = Agent(radius=AGENT_RATIO * cell).set_z_index(10).move_to(self.grid.center_of(s))
        self.panel, self.readout = state_panel(s)
        self.track_readout = True
        self.arrows = VGroup()
        self.riders = VGroup()  # anything else that travels with the agent, e.g. arrow labels
        self.group = VGroup(self.grid, self.labels, self.agent, self.panel)

    def drop_panel(self):
        """Fade out the "agent state" readout; later moves no longer update it."""
        self.track_readout = False
        self.group.remove(self.panel)
        return FadeOut(self.panel)

    def add_arrows(self):
        """Four idle action arrows around the agent, keyed by action name in self.arrow."""
        r = self.agent.radius
        center = self.agent.get_center()
        self.arrow = {}
        for name, d in ACTIONS.items():
            arrow = Arrow(center + d * (r + 0.1), center + d * 0.8 * self.cell, buff=0, stroke_width=6,
                          max_tip_length_to_length_ratio=0.4, color=ARROW_IDLE).set_z_index(9)
            self.arrow[name] = arrow
            self.arrows.add(arrow)
        return self.arrows

    def arrow_labels(self, texts, font_size=34, colors=None):
        """A MathTex beside each arrow's shaft (right of the vertical arrows, above the
        horizontal ones), keyed by action. Add them to self.riders so they travel along."""
        along = 0.5 * (self.agent.radius + 0.1 + 0.8 * self.cell)
        center = self.agent.get_center()
        colors = colors or {}
        return {
            name: MathTex(texts[name], font_size=font_size, color=colors.get(name, INK)).move_to(
                center + d * along + 0.3 * (RIGHT if d[0] == 0 else UP)).set_z_index(9)
            for name, d in ACTIONS.items()
        }

    def light(self, action, color=MODEL):
        """Light one arrow and dim the rest."""
        return AnimationGroup(*[
            a.animate.set_color(color if name == action else ARROW_IDLE) for name, a in self.arrow.items()
        ])

    def unlight(self):
        return AnimationGroup(*[a.animate.set_color(ARROW_IDLE) for a in self.arrows])

    def place(self, s2, run_time=0.8):
        """Glide the agent straight to state s2 (not a transition: used to set up an example)."""
        s, self.state = self.state, s2
        body = VGroup(self.agent, self.arrows, self.riders)
        return AnimationGroup(
            body.animate.shift(self.grid.center_of(s2) - self.agent.head.get_center()),
            self.grid[s].animate.set_fill(CELL),
            self.grid[s2].animate.set_fill(HIGHLIGHT),
            run_time=run_time,
        )

    def move(self, action, run_time=0.6):
        """Apply the transition function and animate the result: a move with the cell
        highlight and readout following, or a bump against the edge."""
        s, s2 = self.state, self.grid.step(self.state, action)
        body = VGroup(self.agent, self.arrows, self.riders)
        if s2 == s:
            return body.animate(rate_func=there_and_back, run_time=run_time).shift(0.25 * ACTIONS[action])
        self.state = s2
        anims = [
            # Positioned by the head, so marks around it (sweat, arms) never pull the agent off-centre.
            body.animate.shift(self.grid.center_of(s2) - self.agent.head.get_center()),
            self.grid[s].animate.set_fill(CELL),
            self.grid[s2].animate.set_fill(HIGHLIGHT),
        ]
        if self.track_readout:
            new_readout = MathTex(f"s_{{{s2}}}", font_size=60, color=MODEL).move_to(self.readout)
            anims.append(Transform(self.readout, new_readout))
        return AnimationGroup(*anims, run_time=run_time)

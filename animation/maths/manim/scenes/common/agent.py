"""The agent glyph: a round face whose expression can change, with a
'brain' that equations can be absorbed into."""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    ArcBetweenPoints,
    CapStyleType,
    Circle,
    Ellipse,
    Flash,
    Line,
    Succession,
    VGroup,
    VMobject,
    rush_into,
    there_and_back,
)

from .theme import INK, MODEL

EXPRESSIONS = ("blank", "happy", "sad")
FACE = "#1a1530"  # head fill: background tinted towards violet


class Agent(VGroup):
    def __init__(self, radius=1.0, expression="blank", **kwargs):
        super().__init__(**kwargs)
        self.head = Circle(radius=radius, stroke_color=MODEL, stroke_width=4, fill_color=FACE, fill_opacity=1)
        self.eyes = VGroup(*[
            Ellipse(width=0.15 * radius, height=0.24 * radius, stroke_width=0, fill_color=INK, fill_opacity=1)
            .move_to(radius * (0.33 * side + 0.12 * UP))
            for side in (LEFT, RIGHT)
        ])
        self.mouth = self.make_mouth(expression)
        self.add(self.head, self.eyes, self.mouth)

    @property
    def radius(self):
        return self.head.width / 2

    def make_mouth(self, expression):
        """A mouth for the head's current size and position; Transform self.mouth into it."""
        r = self.radius
        c = self.head.get_center()
        left = c + r * (0.26 * LEFT + 0.4 * DOWN)
        right = c + r * (0.26 * RIGHT + 0.4 * DOWN)
        if expression == "blank":
            mouth = Line(left, right)
        elif expression == "happy":
            mouth = ArcBetweenPoints(left, right, angle=0.9)
        elif expression == "sad":
            mouth = ArcBetweenPoints(left + 0.1 * r * DOWN, right + 0.1 * r * DOWN, angle=-0.9)
        else:
            raise ValueError(f"expression must be one of {EXPRESSIONS}")
        mouth.set_stroke(INK, width=3.5)
        mouth.cap_style = CapStyleType.ROUND
        return mouth

    def blink(self):
        """Close and reopen the eyes."""
        return self.eyes.animate(rate_func=there_and_back, run_time=0.3).stretch(0.1, 1)

    def make_hands(self):
        """Shrugging arms, like ¯\\_(ツ)_/¯: out from each side of the head, then up."""
        r, c = self.radius, self.head.get_center()
        hands = VGroup()
        for side in (-1, 1):
            corners = [c + r * np.array(p) for p in ((side * 0.95, -0.32, 0), (side * 1.45, -0.32, 0), (side * 1.85, 0.3, 0))]
            hand = VMobject().set_points_as_corners(corners).set_stroke(INK, width=4.5)
            hand.cap_style = CapStyleType.ROUND
            hands.add(hand)
        return hands.set_z_index(self.z_index)

    def shrug(self, hands, times=2):
        """Bob the hands up and back, `times` times."""
        lift = 0.14 * self.radius * np.array((0, 1, 0))
        return Succession(*[
            hands.animate(rate_func=there_and_back, run_time=0.35).shift(lift) for _ in range(times)
        ])

    def brain_point(self):
        return self.head.get_center() + 0.55 * self.radius * UP


def absorb(mob, agent, run_time=1.2):
    """Shrink mob into the agent's brain, then flash. Remove mob from the scene afterwards."""
    target = agent.brain_point()
    return Succession(
        mob.animate(rate_func=rush_into, run_time=run_time).scale(0.05).move_to(target).set_opacity(0),
        Flash(target, color=MODEL, line_length=0.25 * agent.radius, flash_radius=0.3 * agent.radius, run_time=0.5),
    )

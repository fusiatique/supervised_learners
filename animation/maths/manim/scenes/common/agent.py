"""The agent glyph: a round face whose expression can change, with a 'brain' that
equations can be absorbed into."""

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    ArcBetweenPoints,
    Circle,
    Dot,
    Flash,
    Line,
    Succession,
    VGroup,
    rush_into,
)

from .theme import BG, INK, MODEL

EXPRESSIONS = ("blank", "happy", "sad")


class Agent(VGroup):
    def __init__(self, radius=1.0, expression="blank", **kwargs):
        super().__init__(**kwargs)
        self.head = Circle(radius=radius, stroke_color=MODEL, stroke_width=5, fill_color=BG, fill_opacity=1)
        self.eyes = VGroup(
            Dot(radius=0.09 * radius, color=INK).move_to(radius * (0.35 * LEFT + 0.12 * UP)),
            Dot(radius=0.09 * radius, color=INK).move_to(radius * (0.35 * RIGHT + 0.12 * UP)),
        )
        self.mouth = self.make_mouth(expression)
        self.add(self.head, self.eyes, self.mouth)

    @property
    def radius(self):
        return self.head.width / 2

    def make_mouth(self, expression):
        """A mouth for the head's current size and position; Transform self.mouth into it."""
        r = self.radius
        c = self.head.get_center()
        left = c + r * (0.3 * LEFT + 0.42 * DOWN)
        right = c + r * (0.3 * RIGHT + 0.42 * DOWN)
        if expression == "blank":
            mouth = Line(left, right)
        elif expression == "happy":
            mouth = ArcBetweenPoints(left, right, angle=0.9)
        elif expression == "sad":
            mouth = ArcBetweenPoints(left + 0.1 * r * DOWN, right + 0.1 * r * DOWN, angle=-0.9)
        else:
            raise ValueError(f"expression must be one of {EXPRESSIONS}")
        return mouth.set_stroke(INK, width=4)

    def brain_point(self):
        return self.head.get_center() + 0.55 * self.radius * UP


def absorb(mob, agent, run_time=1.2):
    """Shrink mob into the agent's brain, then flash. Remove mob from the scene afterwards."""
    target = agent.brain_point()
    return Succession(
        mob.animate(rate_func=rush_into, run_time=run_time).scale(0.05).move_to(target).set_opacity(0),
        Flash(target, color=MODEL, line_length=0.25 * agent.radius, flash_radius=0.3 * agent.radius, run_time=0.5),
    )

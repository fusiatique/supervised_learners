"""The internal-state gauge from Maths 11 on: a semicircular dial for H, with a teal fill up to
the current level and a needle. Its value is a ValueTracker from 0 (empty) to 1 (full)."""

import numpy as np
from manim import DOWN, PI, Arc, Dot, Line, MathTex, ValueTracker, VGroup, always_redraw

from .theme import HOMEO, INK, MUTED


class Gauge(VGroup):
    def __init__(self, value=0.0, radius=1.5, label="H", **kwargs):
        super().__init__(**kwargs)
        self.radius = radius
        self.value = ValueTracker(value)
        self.track = Arc(radius=radius, start_angle=PI, angle=-PI).set_stroke(MUTED, width=14, opacity=0.35)
        self.ticks = VGroup(*[
            Line(self._point(v, 0.78), self._point(v, 0.9)).set_stroke(MUTED, width=2)
            for v in np.linspace(0, 1, 5)
        ])
        self.fill = always_redraw(lambda: Arc(radius=radius, start_angle=PI, angle=-PI * max(1e-3, self.value.get_value()),
                                              arc_center=self.center()).set_stroke(HOMEO, width=14))
        self.needle = always_redraw(lambda: Line(self.center(), self._point(self.value.get_value(), 0.72))
                                    .set_stroke(INK, width=4))
        self.hub = Dot(self.center(), radius=0.08, color=INK)
        self.label = MathTex(label, font_size=40, color=HOMEO).next_to(self.hub, DOWN, buff=0.2)
        self.add(self.track, self.ticks, self.fill, self.needle, self.hub, self.label)

    def center(self):
        return self.track.get_arc_center()

    def angle(self, v):
        """The dial angle for a level v in [0, 1]: empty on the left, full on the right."""
        return PI * (1 - v)

    def _point(self, v, fraction):
        a = self.angle(v)
        return self.center() + fraction * self.radius * np.array([np.cos(a), np.sin(a), 0])

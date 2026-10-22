"""The "current policy" box kept in the bottom-right corner from Maths 03 onwards."""

from manim import DOWN, UP, AnimationGroup, FadeIn, FadeOut, MathTex, RoundedRectangle, Text, Transform, VGroup

from .stage import RIGHT_X
from .theme import BG, INK, MODEL, MUTED

POLICY_POS = [RIGHT_X, -2.85, 0]


class PolicyBox(VGroup):
    def __init__(self, tex, font_size=36, **kwargs):
        super().__init__(**kwargs)
        self.title = Text("current policy", font_size=22, color=MUTED)
        self.formula = MathTex(tex, font_size=font_size, color=INK)
        self.frame = self._frame_for(VGroup(self.title, self.formula))
        self.add(self.frame, self.title, self.formula)
        self._layout()
        # Keep the text above the frame even when the frame is animated (which redraws it on top).
        self.frame.set_z_index(15)
        self.title.set_z_index(16)
        self.formula.set_z_index(16)

    def _frame_for(self, content):
        width = max(3.2, content.width + 0.6)
        return RoundedRectangle(corner_radius=0.15, width=width, height=1.25, stroke_color=MODEL,
                                stroke_width=2, fill_color=BG, fill_opacity=0.92)

    def _layout(self):
        self.frame.move_to(POLICY_POS)
        self.title.move_to(self.frame).shift(0.3 * UP)
        self.formula.next_to(self.title, DOWN, buff=0.15)

    def swap(self, tex, font_size=36):
        """Replace the formula: the old one fades down and out, the new one fades in, and
        the frame resizes to fit."""
        new = MathTex(tex, font_size=font_size, color=INK).move_to(self.formula).set_z_index(16)
        frame = self._frame_for(VGroup(self.title, new)).move_to(self.frame).set_z_index(15)
        old, self.formula = self.formula, new
        self.remove(old)
        self.add(new)
        return AnimationGroup(Transform(self.frame, frame), FadeOut(old, shift=0.2 * DOWN), FadeIn(new, shift=0.2 * DOWN))

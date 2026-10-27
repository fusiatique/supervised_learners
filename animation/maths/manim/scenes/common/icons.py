"""Small props for the homeostatic scenes."""

from manim import DOWN, LEFT, RIGHT, UP, Line, Polygon, VGroup, VMobject

from .theme import INK

WATER = "#5fb0ea"


def water_glass(height=1.0, level=0.7):
    """A tumbler of water: an open-topped tapered outline, the water, and a glint."""
    top, bottom = 0.34 * height, 0.25 * height  # half-widths
    tl, bl, br, tr = (top * LEFT + 0.5 * height * UP, bottom * LEFT + 0.5 * height * DOWN,
                      bottom * RIGHT + 0.5 * height * DOWN, top * RIGHT + 0.5 * height * UP)
    outline = VMobject().set_points_as_corners([tl, bl, br, tr]).set_stroke(INK, width=3)
    surface = bl + level * (tl - bl), br + level * (tr - br)
    water = Polygon(bl, br, surface[1], surface[0], stroke_width=0, fill_color=WATER, fill_opacity=0.6)
    glint = Line(tl + 0.08 * height * (RIGHT + DOWN), bl + 0.12 * height * (RIGHT + UP)).set_stroke(INK, width=2, opacity=0.4)
    return VGroup(water, outline, glint)

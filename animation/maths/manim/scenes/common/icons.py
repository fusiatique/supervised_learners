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


APPLE, LEAF = "#7cc36b", "#4f9a46"


def apple(size=0.8):
    """A green apple: a round body, a stalk and a leaf."""
    from manim import Circle, Ellipse
    body = VGroup(
        Circle(radius=0.32 * size).shift(0.14 * size * LEFT),
        Circle(radius=0.32 * size).shift(0.14 * size * RIGHT),
    ).set_fill(APPLE, opacity=1).set_stroke(width=0)
    stalk = Line(0.22 * size * UP, 0.42 * size * UP).set_stroke(INK, width=3)
    leaf = Ellipse(width=0.24 * size, height=0.11 * size, stroke_width=0, fill_color=LEAF, fill_opacity=1)
    leaf.rotate(0.5).move_to(0.38 * size * UP + 0.12 * size * RIGHT)
    return VGroup(body, stalk, leaf)


def moon(size=0.8, background="#101827"):
    """A crescent moon (rest): a disc with a background-coloured disc bitten out of it."""
    from manim import Circle
    disc = Circle(radius=0.38 * size, stroke_width=0, fill_color="#e8e2c4", fill_opacity=1)
    bite = Circle(radius=0.33 * size, stroke_width=0, fill_color=background, fill_opacity=1).shift(0.2 * size * (RIGHT + UP))
    return VGroup(disc, bite)


SUN = "#f7d774"


def sun(size=0.8):
    """A sun (a hot day): a disc and eight rays."""
    import numpy as np
    from manim import Circle
    disc = Circle(radius=0.22 * size, stroke_width=0, fill_color=SUN, fill_opacity=1)
    rays = VGroup(*[
        Line(0.3 * size * np.array([np.cos(a), np.sin(a), 0]), 0.42 * size * np.array([np.cos(a), np.sin(a), 0]))
        for a in np.linspace(0, 2 * np.pi, 8, endpoint=False)
    ]).set_stroke(SUN, width=4)
    return VGroup(disc, rays)


PILL = "#e86bb4"  # the drug


def capsule(size=0.8):
    """A two-tone capsule (the drug), tilted: a white half and a pink half, with a glint."""
    from manim import Intersection, Rectangle, RoundedRectangle
    body = RoundedRectangle(width=size, height=0.4 * size, corner_radius=0.2 * size)
    left = Intersection(body, Rectangle(width=size / 2, height=size).shift(size / 4 * LEFT))
    right = Intersection(body, Rectangle(width=size / 2, height=size).shift(size / 4 * RIGHT))
    left.set_fill(INK, opacity=1).set_stroke(width=0)
    right.set_fill(PILL, opacity=1).set_stroke(width=0)
    glint = Line(0.3 * size * LEFT + 0.09 * size * UP, 0.05 * size * LEFT + 0.09 * size * UP).set_stroke("#ffffff", width=2.5, opacity=0.7)
    return VGroup(left, right, glint).rotate(0.6)

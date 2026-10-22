"""Transition-function equations and the scrolling list of every state-action pair,
shared by Maths 02 (which builds them) and Maths 03 (which starts on them)."""

from manim import UP, FadeTransform, MathTex, ReplacementTransform, Text, VGroup

from .grid import ACTIONS
from .stage import RIGHT_X
from .theme import INK, MODEL, MUTED

EQ_Y = 1.6  # the general rule and the worked example share this line
STREAM_TOP, STREAM_BOTTOM = 1.0, -3.45  # rows fade out completely at these edges
ROW_GAP = 0.5
STREAM_END = 18.3  # final scroll offset: the last rows (s8, s9) in view
ORDER = list(ACTIONS)  # up, down, left, right


def transition_tex(s, action, result, **kwargs):
    return MathTex("f(", f"s_{{{s}}}", r",\;\;", rf"\text{{{action}}}", ")", "=", result, color=INK, **kwargs)


def general_rule():
    rule = MathTex("f(", "s", r",\;\;", "a", ")", "=", "s'", font_size=64, color=INK).move_to([RIGHT_X, EQ_Y, 0])
    rule[1].set_color(MODEL)
    rule[6].set_color(MODEL)
    return rule


def morph_parts(src, dst):
    """Move each part of one equation onto the matching part of another. Parts that read
    the same (f(, the comma, ), =) just slide; parts that differ cross-fade as they move."""
    return [
        ReplacementTransform(a, b) if a.get_tex_string() == b.get_tex_string() else FadeTransform(a, b, stretch=False)
        for a, b in zip(src, dst)
    ]


def rule_heading():
    """The small "transition function" heading above the general rule."""
    return Text("transition function", font_size=30, color=MODEL).next_to([RIGHT_X, EQ_Y, 0], UP, buff=0.5)


def stream_dots():
    return MathTex(r"\vdots", color=MUTED).move_to([RIGHT_X, STREAM_BOTTOM - 0.25, 0])


def stream_rows(grid):
    """One row per state-action pair, computed from the grid's transition function."""
    return VGroup(*[
        transition_tex(s, a, f"s_{{{grid.step(s, a)}}}").scale(0.75).set_x(RIGHT_X)
        for s in range(1, grid.rows * grid.cols + 1) for a in ORDER
    ])


def row_y(i, offset):
    return STREAM_BOTTOM - 0.4 - i * ROW_GAP + offset


def window_opacity(y):
    return max(0.0, min(1.0, min(y - STREAM_BOTTOM, STREAM_TOP - y) / 0.8))


def place_rows(rows, offset):
    """Position and fade every row for a given scroll offset."""
    for i, row in enumerate(rows):
        y = row_y(i, offset)
        row.set_y(y).set_opacity(window_opacity(y))
    return rows

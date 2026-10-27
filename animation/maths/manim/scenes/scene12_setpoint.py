"""Maths 12 — Homeostatic reinforcement learning: the setpoint and the deviation.

Narration: from "This brings us to an idea called homeostatic reinforcement learning." to
"...The further H moves away in either direction, the greater the deviation."
Starts on Maths 11's last frame.

H runs from 0 to 100 with the setpoint H* = 50, as in our simulation; on the gauge a level v
in [0, 1] is H = 100 v, so H* sits at the top of the dial. D(H) = (H* - H)^2 / H*.
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Axes,
    Cross,
    Dot,
    FadeIn,
    FadeOut,
    Indicate,
    LaggedStart,
    MathTex,
    Rectangle,
    Square,
    RoundedRectangle,
    Scene,
    Text,
    VGroup,
    Write,
    always_redraw,
    rate_functions,
)

from common import DOPAMINE, HARM, HOMEO, INK, MUTED, Agent, Gauge, PacedScene, brain_light, water_glass

SETPOINT = 50  # H*
M11_AGENT, M11_GAUGE = np.array([-2.3, -0.2, 0]), np.array([2.2, 0.1, 0])  # where Maths 11 leaves them
AGENT_POS = np.array([-5.3, -0.75, 0])
GAUGE_POS = np.array([-1.9, -0.55, 0])  # the gauge's bounding-box centre
RX = 3.7  # centre of the right-hand column


def drive(h):
    """Homeostatic deviation D(H) = (H* - H)^2 / H*."""
    return (SETPOINT - h) ** 2 / SETPOINT


def mini_case(x, level, caption, reward_height):
    """One copy of the agent with a small gauge (setpoint marked), the same glass in front, and the
    reward that glass would give it, as a bar."""
    who = Agent(radius=0.5).move_to([x - 1.05, -0.35, 0])
    gauge = Gauge(value=level, radius=0.75, label=None)
    gauge.shift(np.array([x + 0.55, -0.55, 0]) - gauge.center())
    target = gauge.mark(0.5)
    glass = water_glass(height=0.75).move_to([x - 0.25, -1.75, 0])
    bar = Rectangle(width=0.32, height=reward_height, stroke_width=0, fill_color=DOPAMINE, fill_opacity=0.9)
    bar.move_to([x + 0.55, -2.15, 0], aligned_edge=DOWN)
    bar_label = Text("reward", font_size=18, color=DOPAMINE).next_to(bar, RIGHT, buff=0.15).align_to(bar, DOWN)
    label = Text(caption, font_size=22, color=MUTED).move_to([x, 0.75, 0])
    return VGroup(label, who, gauge, target, glass), VGroup(bar, bar_label)


def squared_deviation():
    """D(H) = (H* - H)^2 / H*, as it sits in the right column."""
    eq = MathTex("D(H)", "=", r"{(", "H^*", "-", "H", r")^2", r"\over", "H^*", "}", font_size=46, color=INK)
    eq.move_to([RX, 1.0, 0])
    eq.set_color_by_tex("H^*", INK)
    eq[0].set_color(HARM)
    eq[5].set_color(HOMEO)
    return eq


def setpoint_marks(gauge):
    """The H* tick on the gauge and the word "setpoint" beside it."""
    target = gauge.mark(0.5, label="H^*")
    return target, Text("setpoint", font_size=22, color=INK).next_to(target[1], RIGHT, buff=0.15)


def deviation_plot(gauge):
    """The D(H) plot in the right column, and a dot that rides the curve with the gauge's needle.
    Returns (axes, curve, x_name, y_name, tracer, zero)."""
    axes = Axes(x_range=[0, 100, 25], y_range=[0, 50, 25], x_length=4.4, y_length=2.0, tips=False,
                axis_config={"color": MUTED, "stroke_width": 2, "include_numbers": True, "font_size": 18})
    axes.move_to([RX, -1.55, 0])
    curve = axes.plot(drive, x_range=[0, 100], color=HARM, stroke_width=4)
    x_name = MathTex("H", font_size=28, color=HOMEO).next_to(axes.x_axis, RIGHT, buff=0.15)
    y_name = MathTex("D(H)", font_size=28, color=HARM).next_to(axes.y_axis, UP, buff=0.1)
    tracer = always_redraw(lambda: Dot(axes.c2p(100 * gauge.value.get_value(), drive(100 * gauge.value.get_value())),
                                       radius=0.08, color=INK))
    zero = MathTex("0", font_size=24, color=HARM).next_to(axes.c2p(SETPOINT, 0), UP, buff=0.12)
    return axes, curve, x_name, y_name, tracer, zero


def end_frame():
    """Everything on screen when Maths 12 ends, built in place (for the next scene to start from).
    Returns a dict of the pieces."""
    agent = Agent(radius=1.08).move_to(M11_AGENT)
    brain = brain_light(agent)
    VGroup(agent, brain).scale(0.9 / 1.08).move_to(AGENT_POS)
    gauge = Gauge(value=0.5, radius=1.5).move_to(M11_GAUGE)
    gauge.shift(GAUGE_POS - gauge.get_center())
    target, setpoint_word = setpoint_marks(gauge)
    axes, curve, x_name, y_name, tracer, zero = deviation_plot(gauge)
    return {
        "title": Text("Homeostatic reinforcement learning", font_size=40, color=INK).move_to([0, 3.35, 0]),
        "agent": agent, "brain": brain, "gauge": gauge, "target": target, "setpoint_word": setpoint_word,
        "gap": gauge.gap(0.5),
        "deviation": Text("homeostatic deviation", font_size=28, color=HARM).move_to([RX, 2.1, 0]),
        "squared": squared_deviation(),
        "plot": VGroup(axes, curve, x_name, y_name, zero), "axes": axes, "tracer": tracer,
    }


class Scene12Setpoint(PacedScene, Scene):
    """Paced like Maths 10 and 11: animations 35% slower, every narration line keeps its full time."""

    REPAY_ACROSS_SECTIONS = False

    def construct(self):
        # Maths 11's last frame: the agent with H in its brain, and the "internal state" gauge.
        agent = Agent(radius=1.08).move_to(M11_AGENT)
        brain = brain_light(agent)
        gauge = Gauge(value=0.5, radius=1.5).move_to(M11_GAUGE)
        gauge_title = Text("internal state", font_size=30, color=HOMEO).next_to(gauge, UP, buff=0.45)
        self.add(agent, brain, gauge, gauge_title)

        # "This brings us to an idea called homeostatic reinforcement learning."
        self.next_section("HRL")
        title = Text("Homeostatic reinforcement learning", font_size=40, color=INK).move_to([0, 3.35, 0])
        self.play(VGroup(agent, brain).animate.scale(0.9 / 1.08).move_to(AGENT_POS),
                  gauge.animate.shift(GAUGE_POS - gauge.get_center()), FadeOut(gauge_title),
                  FadeIn(title, shift=0.15 * DOWN), run_time=1.1)
        self.wait(2.1)

        # "The central idea, developed by Keramati and colleagues, is that reward learning and regulating
        # our internal state are not separate problems."  Two labels slide together and merge.
        self.next_section("not separate")
        cite = Text("Keramati & Gutkin, 2014", font_size=20, color=MUTED).next_to(title, DOWN, buff=0.15)
        learning = Text("reward learning", font_size=28, color=DOPAMINE)
        regulating = Text("regulating an internal state", font_size=28, color=HOMEO)
        VGroup(learning, regulating).arrange(RIGHT, buff=1.4).move_to([0, 1.95, 0])
        self.play(FadeIn(cite), run_time=0.5)
        self.wait(2.2)
        self.play(FadeIn(learning, shift=0.2 * RIGHT), FadeIn(regulating, shift=0.2 * LEFT), run_time=0.7)
        self.wait(1.4)
        # "...are not separate problems."
        merged = VGroup(learning.copy(), regulating.copy()).arrange(RIGHT, buff=0.35).move_to([0, 1.95, 0])
        frame = RoundedRectangle(corner_radius=0.18, width=merged.width + 0.6, height=merged.height + 0.45,
                                 stroke_color=INK, stroke_width=2).move_to(merged)
        self.play(learning.animate.move_to(merged[0]), regulating.animate.move_to(merged[1]), run_time=0.8)
        self.play(FadeIn(frame, scale=1.1), run_time=0.5)
        self.wait(0.9)

        # "An outcome can be rewarding because it corrects an internal imbalance."  Two copies of the
        # agent, one near its target and one far below it, with the same glass in front: far below,
        # the glass is worth much more.
        self.next_section("imbalance")
        near, near_bar = mini_case(-3.4, 0.43, "close to its target", 0.2)
        far, far_bar = mini_case(3.4, 0.12, "far from its target", 1.0)
        # Fade (not set_opacity) so they come back exactly as they were: setting opacity back to 1
        # would also switch on the fills of outline-only shapes like the gauge's arcs.
        self.play(FadeOut(agent, brain, gauge), FadeOut(learning, regulating, frame), run_time=0.7)
        self.play(FadeIn(near, shift=0.15 * UP), FadeIn(far, shift=0.15 * UP), run_time=0.8)
        self.wait(0.5)
        self.play(FadeIn(near_bar[0], scale=0.2), FadeIn(far_bar[0], scale=0.2), FadeIn(near_bar[1], far_bar[1]),
                  run_time=0.8)
        self.wait(0.8)

        # "Let's call the agent's internal state H. Imagine it as a simplified, dopamine-like signal.
        # This is only an analogy, because a single number can't capture dopamine's full biology."
        self.next_section("H")
        tag = Text("≈ a dopamine-like signal", font_size=24, color=DOPAMINE).next_to(gauge, DOWN, buff=0.3)
        caveat = Text("an analogy: one number can't capture dopamine's biology", font_size=18, color=MUTED)
        caveat.next_to(tag, DOWN, buff=0.12)
        self.play(FadeOut(near, near_bar, far, far_bar, cite), FadeIn(agent, brain, gauge), run_time=0.8)
        self.play(Indicate(gauge.label, color=HOMEO, scale_factor=1.6), Indicate(brain[1], color=HOMEO, scale_factor=1.5),
                  run_time=0.8)
        self.play(gauge.value.animate.set_value(0.7), run_time=0.9)
        # "...a simplified, dopamine-like signal."
        self.play(FadeIn(tag, shift=0.1 * UP), gauge.value.animate.set_value(0.3), run_time=0.9)
        self.wait(1.6)
        # "This is only an analogy..."
        self.play(FadeIn(caveat), gauge.value.animate.set_value(0.6), run_time=0.9)
        self.wait(3.3)

        # "The target is the homeostatic setpoint, H*. It is the level the agent is trying to maintain."
        self.next_section("setpoint")
        target, setpoint_word = setpoint_marks(gauge)
        self.play(FadeOut(tag, caveat), run_time=0.4)
        self.play(FadeIn(target, scale=1.3), FadeIn(setpoint_word), run_time=0.7)
        self.wait(1.4)
        # "...the level the agent is trying to maintain."  The needle wobbles and settles on it.
        self.play(gauge.value.animate.set_value(0.42), run_time=0.5)
        self.play(gauge.value.animate.set_value(0.55), run_time=0.5)
        self.play(gauge.value.animate(rate_func=rate_functions.ease_out_sine).set_value(0.5), run_time=0.7)
        self.wait(1)

        # "Importantly, the agent shouldn't simply maximise H. Being above the target isn't automatically
        # better. What matters is the distance from the setpoint."
        self.next_section("not maximise")
        self.wait(0.6)
        self.play(gauge.value.animate.set_value(1.0), run_time=0.9)
        more = Text("more H  ≠  better", font_size=26, color=HARM).move_to([RX, 1.6, 0])
        cross = Cross(Square(side_length=0.55), stroke_color=HARM, stroke_width=6).move_to(gauge._point(0.97, 1.0))
        self.play(FadeIn(more, shift=0.1 * DOWN), FadeIn(cross, scale=1.3), run_time=0.7)
        self.wait(1.6)
        # "What matters is the distance from the setpoint."  Below it, then above it: the red arc.
        self.play(FadeOut(cross, more), gauge.value.animate.set_value(0.22), run_time=1.0)
        # Built only now, with the needle below the setpoint, so it fades in pointing the right way;
        # then it swells once to draw the eye (not a box around it).
        gap = gauge.gap(0.5)
        self.play(FadeIn(gap), run_time=0.3)
        self.play(gap.animate(rate_func=rate_functions.there_and_back).set_stroke(width=14), run_time=0.5)
        self.play(gauge.value.animate.set_value(0.8), run_time=1.3)
        self.wait(0.4)

        # "We call this homeostatic deviation."
        self.next_section("deviation")
        deviation = Text("homeostatic deviation", font_size=28, color=HARM).move_to([RX, 2.1, 0])
        self.play(FadeIn(deviation, shift=0.1 * DOWN), Indicate(gap, color=HARM, scale_factor=1.05), run_time=0.8)
        self.wait(0.4)

        # "In our model, we measure it as a scaled squared deviation:"
        self.next_section("D(H)")
        squared = squared_deviation()
        sq_note = Text("scaled squared deviation", font_size=20, color=MUTED).next_to(squared, DOWN, buff=0.2)
        self.wait(0.8)
        self.play(Write(squared), run_time=1.1)
        self.play(FadeIn(sq_note), run_time=0.4)
        self.wait(0.6)

        # "At the setpoint, deviation is zero. The further H moves away in either direction, the greater
        # the deviation."  A plot of D(H), with a dot that follows the needle.
        self.next_section("curve")
        axes, curve, x_name, y_name, tracer, zero = deviation_plot(gauge)
        self.play(FadeOut(sq_note), FadeIn(axes, x_name, y_name), run_time=0.6)
        self.play(Write(curve), FadeIn(tracer), run_time=0.9)
        # "At the setpoint, deviation is zero."
        self.play(gauge.value.animate.set_value(0.5), run_time=0.9)
        self.play(FadeIn(zero, scale=1.4), run_time=0.4)
        self.wait(0.4)
        # "The further H moves away in either direction, the greater the deviation."
        self.play(gauge.value.animate.set_value(0.05), run_time=1.3)
        self.play(gauge.value.animate.set_value(0.95), run_time=1.9)
        self.play(gauge.value.animate.set_value(0.5), run_time=1.0)
        self.wait(0.8)

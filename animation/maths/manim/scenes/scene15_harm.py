"""Maths 15 — Harm.

Narration: from "So far, nothing in the model says the drug is harmful." to "...It's just been
outweighed."  Starts on Maths 14's last frame.

Our simulation's reward, r = D(H) - D(H') + (R0 - c)·[drug], with the drug's pleasure R0 = 2 and its
harm c = 10. A dose raises H by 25 while H relaxes a tenth of the way to its baseline B, so:
  healthy    (H = 50, B = 40): H' = 74, relief D(50) - D(74) = -11.5, total -11.5 + 2 - 10 = -19.5
  withdrawal (H = 20, B = 0):  H' = 43, relief D(20) - D(43) = +17.0, total +17.0 + 2 - 10 = +9.0
The balance weighs what is for the drug (left) against what is against it (right).
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    ArcBetweenPoints,
    Dot,
    FadeIn,
    FadeOut,
    FadeTransform,
    Line,
    MathTex,
    Rectangle,
    RoundedRectangle,
    Scene,
    Text,
    Transform,
    ValueTracker,
    VGroup,
    Write,
    always_redraw,
    rate_functions,
)

from common import DOPAMINE, HARM, HOMEO, INK, MUTED, PILL, Agent, Gauge, PacedScene, brain_light, capsule
from scene12_setpoint import drive
from scene14_drugs import end_frame

R0, COST = 2, 10
UNIT = 0.06  # block height per unit of reward
HEALTHY = (50, 74)  # H before and after a dose
WITHDRAWAL = (20, 43)


def block(value, color, label):
    """A weight: a block as tall as |value|, with its number above it."""
    rect = Rectangle(width=0.6, height=UNIT * abs(value), stroke_color=color, stroke_width=0, fill_color=color,
                     fill_opacity=0.85)
    return VGroup(rect, MathTex(label, font_size=26, color=color).next_to(rect, UP, buff=0.08))


def tilt_for(total):
    """How far the beam tips: towards the drug (left down) for a positive total."""
    return 0.25 * np.tanh(total / 8)


class Balance(VGroup):
    """A balance scale. `tilt` (radians) tips it, left pan down for positive values; `put(weight,
    side, slot)` seats a weight on a pan (side -1 left, 1 right; slot -1 or 1 on the pan) and keeps it
    there as the beam moves."""

    def __init__(self, pivot, half=2.3, drop=0.95, dish=1.8):
        super().__init__()
        self.pivot, self.half, self.drop, self.dish = np.array(pivot, dtype=float), half, drop, dish
        self.tilt = ValueTracker(0.0)
        foot = self.pivot + 2.2 * DOWN
        stand = VGroup(Line(foot, self.pivot), Line(foot + 0.8 * LEFT, foot + 0.8 * RIGHT)).set_stroke(MUTED, width=5)
        beam = always_redraw(lambda: Line(self.end(-1), self.end(1)).set_stroke(INK, width=5))
        pans = [always_redraw(lambda s=side: self.pan(s)) for side in (-1, 1)]
        self.add(stand, *pans, beam, Dot(self.pivot, radius=0.09, color=INK))

    def end(self, side):
        a = self.tilt.get_value()
        return self.pivot + side * self.half * np.array([np.cos(a), np.sin(a), 0])

    def seat(self, side):
        return self.end(side) + self.drop * DOWN

    def pan(self, side):
        top, left, right = self.end(side), self.seat(side) + self.dish / 2 * LEFT, self.seat(side) + self.dish / 2 * RIGHT
        strings = VGroup(Line(top, left), Line(top, right)).set_stroke(MUTED, width=2)
        bowl = ArcBetweenPoints(left, right, angle=0.8).set_stroke(INK, width=4)
        return VGroup(strings, Line(left, right).set_stroke(INK, width=4), bowl)

    def spot(self, side, slot):
        return self.seat(side) + 0.42 * slot * RIGHT

    def put(self, weight, side, slot):
        weight.add_updater(lambda m: m.move_to(self.spot(side, slot), aligned_edge=DOWN))


def sum_line(relief, total):
    """relief + R0 - c = total, colour-coded: relief teal, pleasure amber, harm red."""
    line = MathTex(f"{relief:+.1f}", "+", str(R0), "-", str(COST), "=", f"{total:+.1f}", font_size=42, color=INK)
    line[0].set_color(HOMEO)
    line[2].set_color(DOPAMINE)
    line[4].set_color(HARM)
    return line


class Scene15Harm(PacedScene, Scene):
    """Paced like Maths 10–14: animations 35% slower, every narration line keeps its full time."""

    REPAY_ACROSS_SECTIONS = False

    def construct(self):
        f = end_frame()
        self.add(f["title"], f["proposal"], f["claims"], f["boxes"], f["link"])

        # "So far, nothing in the model says the drug is harmful. But in real life, drugs come with a cost."
        self.next_section("no harm yet")
        so_far = MathTex("r", "=", "D(H) - D(H')", font_size=48, color=INK).move_to([0, 1.3, 0])
        so_far[0].set_color(DOPAMINE)
        so_far[2].set_color(HOMEO)
        pill = capsule(1.1).move_to([0, -1.1, 0])
        harmless = Text("no cost in the model", font_size=26, color=MUTED).next_to(pill, DOWN, buff=0.4)
        cost_tag = VGroup(RoundedRectangle(width=1.2, height=0.5, corner_radius=0.12).set_stroke(HARM, width=2.5)
                          .set_fill(HARM, opacity=0.15), Text("cost", font_size=26, color=HARM))
        cost_tag[1].move_to(cost_tag[0])
        cost_tag.next_to(pill, RIGHT, buff=0.35)
        self.play(FadeOut(f["proposal"], f["claims"], f["boxes"], f["link"]), run_time=0.6)
        self.play(Write(so_far), FadeIn(pill, scale=0.8), run_time=1.0)
        self.play(FadeIn(harmless), run_time=0.5)
        self.wait(2.0)
        # "But in real life, drugs come with a cost."
        self.play(FadeOut(harmless), FadeIn(cost_tag, shift=0.15 * LEFT), run_time=0.6)
        self.wait(2.0)

        # "This is where our own simulation comes in. We added a harm term: a cost, c, that the agent pays
        # every time it takes the drug."  The reward grows its drug term; the cost tag becomes c.
        self.next_section("harm term")
        ours = Text("our simulation", font_size=24, color=MUTED).move_to([0, 2.55, 0])
        full = MathTex("r", "=", "D(H) - D(H')", "+", "(", "R_0", "-", "c", ")", r"\cdot", r"[\text{drug}]",
                       font_size=48, color=INK).move_to([0, 1.9, 0])
        full[0].set_color(DOPAMINE)
        full[2].set_color(HOMEO)
        full[5].set_color(DOPAMINE)
        full[7].set_color(HARM)
        full[10].set_color(PILL)
        names = VGroup(*[
            Text(name, font_size=22, color=color).next_to(full[i], DOWN, buff=0.2)
            for name, color, i in (("relief", HOMEO, 2), ("pleasure", DOPAMINE, 5), ("harm", HARM, 7))
        ])
        names[1].shift(0.15 * LEFT)
        names[2].shift(0.15 * RIGHT)
        each_time = Text("[drug] = 1 when it takes the drug", font_size=20, color=MUTED).next_to(full[10], DOWN, buff=0.6)
        each_time.align_to(full[10], RIGHT)
        self.play(FadeIn(ours), Transform(so_far, full[:3]), pill.animate.scale(0.7).move_to([-5.4, -1.0, 0]),
                  cost_tag.animate.scale(0.8).next_to([-5.4, -1.0, 0], RIGHT, buff=0.55), run_time=0.9)
        self.wait(1.6)
        # "We added a harm term: a cost, c..."
        self.play(Write(full[3:7]), Write(full[8:]), FadeTransform(cost_tag, full[7]), run_time=1.3)
        self.play(FadeIn(names[2], shift=0.1 * UP), run_time=0.5)
        self.wait(1.0)
        # "...that the agent pays every time it takes the drug."
        self.play(FadeIn(names[0], names[1], each_time, shift=0.1 * UP), run_time=0.7)
        self.wait(2.9)

        # "In our example, the drug's pleasure, R0, is worth 2, and its harm, c, costs 10. The harm is five
        # times bigger than the pleasure."  Each becomes a block: the harm's is five times taller.
        self.next_section("values")
        pleasure_value = MathTex("R_0", "=", str(R0), font_size=36, color=DOPAMINE).move_to([4.5, 0.35, 0])
        harm_value = MathTex("c", "=", str(COST), font_size=36, color=HARM).move_to([4.5, -1.0, 0])
        pleasure_block = block(R0, DOPAMINE, f"+{R0}").next_to(pleasure_value, RIGHT, buff=0.4).align_to(pleasure_value, DOWN)
        harm_block = block(COST, HARM, f"-{COST}").next_to(harm_value, RIGHT, buff=0.4).align_to(harm_value, DOWN)
        self.play(FadeIn(pleasure_value, shift=0.1 * UP), run_time=0.6)
        self.play(FadeIn(pleasure_block, shift=0.1 * UP), run_time=0.5)
        self.wait(1.6)
        self.play(FadeIn(harm_value, shift=0.1 * UP), run_time=0.6)
        self.play(FadeIn(harm_block, shift=0.1 * UP), run_time=0.5)
        self.wait(0.8)
        # "The harm is five times bigger than the pleasure."  Five pleasure blocks stack up beside the harm.
        five = VGroup(*[pleasure_block[0].copy() for _ in range(5)]).arrange(UP, buff=0)
        five.next_to(harm_block[0], RIGHT, buff=0.15).align_to(harm_block[0], DOWN).set_stroke(DOPAMINE, width=1.5)
        times = MathTex(r"\times 5", font_size=28, color=DOPAMINE).next_to(five, RIGHT, buff=0.12)
        self.play(*[FadeTransform(pleasure_block[0].copy(), b) for b in five], FadeIn(times), run_time=0.9)
        self.wait(2.1)
        self.play(FadeOut(five, times), run_time=0.4)

        # "Shouldn't that stop it? Not necessarily. What matters is the total."  A balance: what is for
        # the drug on the left, what is against it on the right.
        self.next_section("balance")
        scale = Balance(pivot=[0.4, -0.95, 0])
        for_name = Text("for the drug", font_size=24, color=MUTED).move_to([0.4 - 2.3, -3.55, 0])
        against_name = Text("against", font_size=24, color=MUTED).move_to([0.4 + 2.3, -3.55, 0])
        self.play(FadeIn(scale, for_name, against_name), run_time=0.7)
        pleasure_weight, harm_weight = pleasure_block.copy(), harm_block.copy()
        self.play(pleasure_weight.animate.move_to(scale.spot(-1, 1), aligned_edge=DOWN),
                  harm_weight.animate.move_to(scale.spot(1, -1), aligned_edge=DOWN), run_time=0.8)
        scale.put(pleasure_weight, -1, 1)
        scale.put(harm_weight, 1, -1)
        self.wait(2.2)

        # "For a healthy agent, the drug overshoots the setpoint, so it makes things worse, not better.
        # Add the harm, and the total is -19.5. It walks away."
        self.next_section("healthy")
        before, after = HEALTHY
        relief = drive(before) - drive(after)
        total = relief + R0 - COST
        agent = Agent(radius=0.6, expression="happy").move_to([-5.4, 0.35, 0])
        brain = brain_light(agent)
        gauge = Gauge(value=before / 100, radius=0.75)
        gauge.shift(np.array([-5.4, -2.45, 0]) - gauge.center())
        mark, gap = gauge.mark(0.5), gauge.gap(0.5)
        who = Text("healthy", font_size=24, color=INK).next_to(agent, UP, buff=0.2)
        self.play(FadeIn(agent, brain, who, gauge, mark, gap), pill.animate.move_to([-3.85, -0.35, 0]), run_time=0.7)
        self.wait(1.3)
        # "...the drug overshoots the setpoint, so it makes things worse..."  Its expected effect on H.
        line = sum_line(relief, total).move_to([0.4, 0.0, 0])
        overshoot = block(relief, HOMEO, f"{relief:.1f}")
        self.play(gauge.value.animate.set_value(after / 100), run_time=0.8)
        self.play(FadeIn(line[0], shift=0.1 * UP), FadeIn(overshoot.move_to(line[0]), scale=0.6), run_time=0.6)
        self.play(overshoot.animate.move_to(scale.spot(1, 1), aligned_edge=DOWN), run_time=0.7)
        scale.put(overshoot, 1, 1)
        self.wait(0.6)
        # "Add the harm, and the total is -19.5."
        self.play(FadeIn(line[1:5], shift=0.1 * UP), run_time=0.6)
        self.play(FadeIn(line[5:], shift=0.1 * UP), scale.tilt.animate.set_value(tilt_for(total)), run_time=1.0,
                  rate_func=rate_functions.ease_out_back)
        self.wait(0.8)
        # "It walks away."
        walks = Text("walks away", font_size=26, color=INK).next_to(gauge, DOWN, buff=0.2)
        self.play(gauge.value.animate.set_value(before / 100), VGroup(agent, brain).animate.shift(0.35 * LEFT),
                  pill.animate.set_opacity(0.35), FadeIn(walks), run_time=0.8)
        self.wait(0.6)

        # "An agent in withdrawal gets huge relief. Same cost, but the total is +9.0. It takes the drug."
        self.next_section("withdrawal")
        before, after = WITHDRAWAL
        relief = drive(before) - drive(after)
        total = relief + R0 - COST
        sick = Agent(radius=0.6).move_to([-5.4, 0.35, 0])
        sick_mouth, sick_marks = sick.mood("tired")
        sick.mouth.become(sick_mouth)
        sick_brain = brain_light(sick)
        who2 = Text("in withdrawal", font_size=24, color=INK).next_to(sick, UP, buff=0.2)
        new_line = sum_line(relief, total).move_to(line)
        relief_weight = block(relief, HOMEO, f"+{relief:.1f}")
        self.play(FadeOut(agent, brain, who, walks, line, overshoot), FadeIn(sick, sick_marks, sick_brain, who2),
                  gauge.value.animate.set_value(before / 100), pill.animate.set_opacity(1),
                  scale.tilt.animate.set_value(tilt_for(R0 - COST)), run_time=0.8)
        # "...gets huge relief."
        self.play(gauge.value.animate.set_value(after / 100), run_time=0.8)
        self.play(FadeIn(new_line[0], shift=0.1 * UP), FadeIn(relief_weight.move_to(new_line[0]), scale=0.6), run_time=0.5)
        self.play(relief_weight.animate.move_to(scale.spot(-1, -1), aligned_edge=DOWN), run_time=0.6)
        scale.put(relief_weight, -1, -1)
        # "Same cost, but the total is +9.0."
        self.play(FadeIn(new_line[1:], shift=0.1 * UP), scale.tilt.animate.set_value(tilt_for(total)), run_time=1.0,
                  rate_func=rate_functions.ease_out_back)
        self.wait(0.4)
        # "It takes the drug."
        happy_mouth, _ = sick.mood("satisfied")
        self.play(pill.animate.scale(0.3).move_to(sick.mouth.get_center()).set_opacity(0), run_time=0.6,
                  rate_func=rate_functions.ease_in_sine)
        self.remove(pill)
        self.play(Transform(sick.mouth, happy_mouth), FadeOut(sick_marks), run_time=0.5)
        self.wait(0.4)

        # "The harm hasn't disappeared. It's just been outweighed."  The red block is still on the scale.
        self.next_section("outweighed")
        still = Text("still there", font_size=24, color=HARM).next_to(harm_weight, UP, buff=0.15)
        still.add_updater(lambda m: m.next_to(harm_weight, UP, buff=0.15))
        self.play(harm_weight[0].animate(rate_func=rate_functions.there_and_back).set_fill(opacity=1).set_stroke(INK, width=4),
                  FadeIn(still), run_time=0.9)
        self.wait(1.6)

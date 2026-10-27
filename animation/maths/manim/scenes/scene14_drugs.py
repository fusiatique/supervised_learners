"""Maths 14 — Drugs in HRL.

Narration: from "But it also gives us a way to think about drugs." to "...links homeostatic regulation
with learning and planning."  Starts on Maths 13's last frame.

A dose raises H by 25, the drug's effect in our simulation, and D(H) = (H* - H)^2 / H* with H* = 50:
from H = 25 a dose is worth D(25) - D(50) = +12.5, from H = 45 it overshoots, D(45) - D(70) = -7.5.
The rising setpoint (Keramati and colleagues' 2017 model of cocaine addiction) is illustrative.
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arc,
    ArcBetweenPoints,
    Create,
    CurvedArrow,
    Dot,
    DoubleArrow,
    FadeIn,
    FadeOut,
    FadeTransform,
    GrowFromEdge,
    LaggedStart,
    Line,
    MathTex,
    MoveAlongPath,
    Rectangle,
    RoundedRectangle,
    Scene,
    Succession,
    Text,
    Transform,
    ValueTracker,
    VGroup,
    Write,
    always_redraw,
    linear,
    rate_functions,
)

from common import DOPAMINE, HARM, HOMEO, INK, MODEL, MUTED, PILL, PacedScene, apple, capsule
from scene12_setpoint import drive
from scene13_homeostatic_reward import end_frame as scene13_end_frame, fmt, signed

AGENT_POS = np.array([-5.2, -0.7, 0])
GAUGE_POS = np.array([-1.7, -1.0, 0])  # the gauge's hub
RX = 3.9  # the right-hand column
DOSE = 25


def choice(icon, name, gain):
    """An option on offer: its picture, its name, its effect on H and a bar as long as that effect."""
    bar = Rectangle(width=0.065 * gain, height=0.14, stroke_width=0, fill_color=HOMEO, fill_opacity=0.9)
    return VGroup(icon, Text(name, font_size=22, color=MUTED), MathTex(f"H + {gain}", font_size=30, color=INK),
                  bar).arrange(DOWN, buff=0.18)


def reward_line(before, after, font_size=30):
    """r = D(before) - D(after) = its values = the reward."""
    r = drive(before) - drive(after)
    line = MathTex("r", "=", f"D({before})", "-", f"D({after})", "=", fmt(drive(before)), "-", fmt(drive(after)),
                   "=", signed(r), font_size=font_size, color=INK)
    line[0].set_color(DOPAMINE)
    line[-1].set_color(DOPAMINE if r > 0 else HARM)
    return line


def strike(mob):
    """A red line through a claim."""
    return Line(mob.get_left() + 0.1 * LEFT, mob.get_right() + 0.1 * RIGHT).set_stroke(HARM, width=5)


def moving_setpoint(gauge, setpoint):
    """The setpoint mark and the deviation arc, following a setpoint that can move (a ValueTracker)."""
    mark = always_redraw(lambda: gauge.mark(setpoint.get_value(), label="H^*"))
    gap = always_redraw(lambda: Arc(
        radius=1.14 * gauge.radius, start_angle=gauge.angle(setpoint.get_value()),
        angle=gauge.angle(gauge.value.get_value()) - gauge.angle(setpoint.get_value()) or 1e-3,
        arc_center=gauge.center(),
    ).set_stroke(HARM, width=7))
    return mark, gap


def edge(mob, toward, pad=0.12):
    """Where a ray from mob's centre towards a point leaves its bounding box (plus a margin)."""
    c = mob.get_center()
    d = toward - c
    w, h = mob.width / 2 + pad, mob.height / 2 + pad
    t = min(w / abs(d[0]) if d[0] else np.inf, h / abs(d[1]) if d[1] else np.inf)
    return c + t * d


def caveat_frame():
    """The last beat: the proposal, the claim it doesn't make, and the link it draws."""
    proposal = Text("a proposed explanation", font_size=34, color=INK).move_to([0, 1.7, 0])
    claims = VGroup(*[
        VGroup(MathTex(r"\times", font_size=40, color=HARM), Text(c, font_size=26, color=MUTED)).arrange(RIGHT, buff=0.25)
        for c in ("addiction comes down to one variable",)
    ]).arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to([0, 0.35, 0])
    boxes = VGroup(*[
        VGroup(RoundedRectangle(width=t.width + 0.6, height=t.height + 0.5, corner_radius=0.15).set_stroke(c, width=2.5), t)
        for t, c in ((Text("homeostatic regulation", font_size=28, color=HOMEO), HOMEO),
                     (Text("learning and planning", font_size=28, color=MODEL), MODEL))
    ])
    boxes[0].move_to([-3.3, -1.75, 0])
    boxes[1].move_to([3.3, -1.75, 0])
    link = DoubleArrow(boxes[0].get_right(), boxes[1].get_left(), buff=0.2, color=INK, stroke_width=4, tip_length=0.2)
    return proposal, claims, boxes, link


def end_frame():
    """Maths 14's last frame, for Maths 15 to start from."""
    proposal, claims, boxes, link = caveat_frame()
    return {"title": scene13_end_frame()["title"], "proposal": proposal, "claims": claims, "boxes": boxes, "link": link}


class Scene14Drugs(PacedScene, Scene):
    """Paced like Maths 10–13: animations 35% slower, every narration line keeps its full time."""

    REPAY_ACROSS_SECTIONS = False

    def take(self, pill, agent, gauge, to):
        """A copy of the pill goes to the agent's mouth; H jumps, fast."""
        dose = pill.copy()
        self.play(dose.animate.scale(0.35).move_to(agent.mouth.get_center()).set_opacity(0), run_time=0.6,
                  rate_func=rate_functions.ease_in_sine)
        self.remove(dose)
        self.play(gauge.value.animate.set_value(to / 100), run_time=0.4, rate_func=rate_functions.rush_from)

    def construct(self):
        f = scene13_end_frame()
        agent, brain, gauge = f["agent"], f["brain"], f["gauge"]
        self.add(f["title"], f["heading"], f["not_yet"], agent, brain, gauge, f["mark"], f["gap"])

        # "But it also gives us a way to think about drugs."  The agent, low on H, is offered a natural
        # reward and a drug: both raise H, by very different amounts.
        self.next_section("drugs")
        heading = Text("drugs in HRL", font_size=34, color=INK).move_to([0, 2.45, 0])
        natural = choice(apple(size=0.7), "natural reward", 2).move_to([2.7, 0.55, 0])
        drug = choice(capsule(0.7), "drug", DOSE).move_to([5.3, 0.55, 0])
        self.play(FadeOut(f["heading"], f["not_yet"]), FadeIn(heading, shift=0.1 * DOWN),
                  VGroup(agent, brain).animate.move_to(AGENT_POS),
                  VGroup(gauge, f["mark"]).animate.shift(GAUGE_POS - gauge.center()), run_time=0.9)
        self.play(gauge.value.animate.set_value(0.25), Transform(agent.mouth, agent.make_mouth("blank")), run_time=0.8)
        self.play(LaggedStart(FadeIn(natural, shift=0.15 * UP), FadeIn(drug, shift=0.15 * UP), lag_ratio=0.4),
                  run_time=1.0)
        self.wait(0.8)

        # "A drug can rapidly and powerfully change the internal state."
        self.next_section("relief")
        self.play(natural.animate.set_opacity(0.35), run_time=0.4)
        self.take(drug[0], agent, gauge, 50)
        self.play(Transform(agent.mouth, agent.make_mouth("happy")), run_time=0.4)
        self.wait(0.5)
        # "If that change brings the agent closer to its setpoint, the drug gains value by relieving the
        # deviation."
        first = reward_line(25, 50).move_to([RX - 0.4, -1.35, 0])
        relief = Text("relief", font_size=24, color=HOMEO).next_to(first, DOWN, buff=0.15)
        worth_word = Text("worth", font_size=22, color=MUTED)
        worth = MathTex(signed(12.5), font_size=32, color=DOPAMINE)
        VGroup(worth_word, worth).arrange(RIGHT, buff=0.15).next_to(drug, DOWN, buff=0.3)
        self.play(Write(first), run_time=1.2)
        self.play(FadeIn(relief, shift=0.1 * UP), FadeIn(worth_word), FadeTransform(first[-1].copy(), worth), run_time=0.7)
        self.wait(4.6)
        # "The agent doesn't need to see the drug as 'good' in the abstract."
        good = Text("“good”", font_size=30, color=INK).next_to(drug, UP, buff=0.2)
        cross = strike(good)
        self.play(FadeIn(good, shift=0.1 * DOWN), run_time=0.5)
        self.play(Create(cross), run_time=0.4)
        self.wait(3.0)
        # "Its value emerges from the effect it is expected to have on the current state."  The same
        # dose, from near the setpoint: it overshoots, and its worth turns negative.
        self.play(FadeOut(good, cross, relief), first.animate.set_opacity(0.4),
                  gauge.value.animate.set_value(0.45), Transform(agent.mouth, agent.make_mouth("blank")), run_time=0.7)
        self.take(drug[0], agent, gauge, 70)
        second = reward_line(45, 70).move_to([RX - 0.4, -2.15, 0])
        overshoot = Text("overshoot", font_size=24, color=HARM).next_to(second, DOWN, buff=0.15)
        self.play(Write(second), Transform(agent.mouth, agent.make_mouth("sad")), run_time=1.2)
        self.play(FadeIn(overshoot), Transform(worth, MathTex(signed(-7.5), font_size=32, color=HARM).move_to(worth)),
                  run_time=0.6)
        self.wait(2.4)

        # "This is the first part of Keramati and colleagues' account: drug taking is reinforced by relief,
        # not just pleasure."  The drug's reward, split: mostly relief.
        self.next_section("corrective")
        cite = Text("Keramati and colleagues", font_size=22, color=MUTED).move_to([RX, 1.75, 0])
        point = Text("1. reinforced by its corrective effect", font_size=28, color=HOMEO).move_to([RX, 1.2, 0])
        not_just = Text("not just by its immediate pleasure", font_size=24, color=DOPAMINE).move_to([RX, 0.65, 0])
        relief_part = Rectangle(width=3.2, height=0.5, stroke_width=0, fill_color=HOMEO, fill_opacity=0.85)
        pleasure_part = Rectangle(width=0.55, height=0.5, stroke_width=0, fill_color=DOPAMINE, fill_opacity=0.9)
        split = VGroup(relief_part, pleasure_part).arrange(RIGHT, buff=0).move_to([RX, -0.75, 0])
        split_name = Text("the drug's reward", font_size=22, color=MUTED).next_to(split, UP, buff=0.2)
        relief_name = Text("relief", font_size=24, color=HOMEO).next_to(relief_part, DOWN, buff=0.15)
        pleasure_name = Text("pleasure", font_size=24, color=DOPAMINE).next_to(pleasure_part, DOWN, buff=0.15)
        pleasure_name.shift(0.25 * RIGHT)
        self.play(FadeOut(natural, drug, worth_word, worth, first, second, overshoot),
                  gauge.value.animate.set_value(0.25), Transform(agent.mouth, agent.make_mouth("blank")), run_time=0.6)
        self.play(FadeIn(cite), FadeIn(point, shift=0.1 * DOWN), run_time=0.8)
        self.wait(1.4)
        # "...drug taking is reinforced by relief..."
        self.play(FadeIn(split_name), GrowFromEdge(relief_part, LEFT), FadeIn(relief_name), run_time=1.0)
        self.wait(0.3)
        # "...not just pleasure."
        self.play(FadeIn(not_just, shift=0.1 * DOWN), GrowFromEdge(pleasure_part, LEFT), FadeIn(pleasure_name), run_time=0.9)
        self.wait(1.6)

        # "The second part is that chronic drug use can gradually alter the homeostatic system itself.
        # In their 2017 model of cocaine addiction, repeated use gradually elevates the setpoint."
        # Dose after dose, the setpoint mark creeps up; between doses H falls back.
        self.next_section("setpoint rises")
        point2 = Text("2. chronic use changes the system itself", font_size=28, color=HOMEO).move_to([RX, 1.2, 0])
        cite2 = Text("Keramati and colleagues, 2017 · cocaine", font_size=22, color=MUTED).move_to([RX, 1.75, 0])
        setpoint = ValueTracker(0.5)
        mark, gap = moving_setpoint(gauge, setpoint)
        original = gauge.mark(0.5).set_stroke(opacity=0.3)
        self.play(FadeOut(point, not_just, split, split_name, relief_name, pleasure_name),
                  FadeTransform(cite, cite2), FadeIn(point2, shift=0.1 * DOWN), run_time=0.8)
        self.remove(f["mark"], f["gap"])
        self.add(original, mark, gap)
        pill = capsule(0.45).move_to(AGENT_POS + np.array([1.5, 1.0, 0]))
        self.play(FadeIn(pill), run_time=0.3)
        for _ in range(3):
            self.take(pill, agent, gauge, 100 * setpoint.get_value() - 2)
            self.play(gauge.value.animate.set_value(0.32), setpoint.animate.increment_value(0.06), run_time=1.0,
                      rate_func=rate_functions.ease_out_sine)
        # "So when the drug is absent, the deviation is larger."  Read down the column as it builds.
        steps = VGroup(
            Text("setpoint ↑", font_size=26, color=HOMEO),
            Text("deviation without the drug ↑", font_size=26, color=HARM),
            Text("value of a dose ↑", font_size=26, color=DOPAMINE),
            Text("drug seeking ↑", font_size=26, color=PILL),
        ).arrange(DOWN, buff=0.3).move_to([RX, -0.75, 0])
        self.play(FadeIn(steps[0], shift=0.1 * UP), run_time=0.5)
        self.wait(1.4)
        self.play(FadeIn(steps[1], shift=0.1 * UP), Transform(agent.mouth, agent.make_mouth("sad")), run_time=0.6)
        self.wait(2.8)
        # "A dose becomes valuable because it temporarily reduces that deviation..."
        self.take(pill, agent, gauge, 66)
        self.play(FadeIn(steps[2], shift=0.1 * UP), Transform(agent.mouth, agent.make_mouth("happy")), run_time=0.6)
        self.play(gauge.value.animate.set_value(0.32), Transform(agent.mouth, agent.make_mouth("sad")), run_time=1.2,
                  rate_func=rate_functions.ease_in_sine)
        # "...and the elevated setpoint helps sustain further drug seeking."
        self.play(FadeIn(steps[3], shift=0.1 * UP), run_time=0.6)
        self.wait(2.6)

        # "This creates a feedback loop. Drug use changes the system, the changed system changes how
        # rewarding the next dose is, and that drives future drug seeking. So the agent doesn't like the drug
        # more; it needs it more."
        self.next_section("loop")
        loop_heading = Text("a feedback loop", font_size=34, color=INK).move_to(heading)
        names = (("drug use", PILL), ("homeostatic\nsystem changes", HOMEO), ("deviation when\ndrug is absent", HARM),
                 ("expected\ncorrective reward", DOPAMINE), ("drug seeking", MODEL))
        places = ((0, 1.2), (4.0, 0.0), (2.5, -2.3), (-2.5, -2.3), (-4.0, 0.0))
        nodes = VGroup(*[Text(n, font_size=26, color=c, line_spacing=0.8).move_to([x, y - 0.4, 0])
                         for (n, c), (x, y) in zip(names, places)])
        arcs, arrows = [], VGroup()
        for i, a in enumerate(nodes):
            b = nodes[(i + 1) % len(nodes)]
            start, end = edge(a, b.get_center()), edge(b, a.get_center())
            arcs.append(ArcBetweenPoints(start, end, angle=-0.45))
            arrows.add(CurvedArrow(start, end, angle=-0.45, color=MUTED, stroke_width=3, tip_length=0.18))
        self.play(FadeOut(agent, brain, gauge, original, mark, gap, pill, steps, point2, cite2),
                  FadeTransform(heading, loop_heading), run_time=0.7)
        self.play(FadeIn(nodes[0], scale=0.9), run_time=0.5)
        self.wait(0.4)
        # "Drug use changes the system..."
        self.play(Create(arrows[0]), FadeIn(nodes[1], shift=0.1 * DOWN), run_time=0.6)
        self.wait(0.6)
        # "...the changed system changes how rewarding the next dose is..."
        self.play(Create(arrows[1]), FadeIn(nodes[2], shift=0.1 * LEFT), run_time=0.6)
        self.play(Create(arrows[2]), FadeIn(nodes[3], shift=0.1 * LEFT), run_time=0.6)
        self.wait(0.5)
        # "...and that drives future drug seeking."
        self.play(Create(arrows[3]), FadeIn(nodes[4], shift=0.1 * UP), run_time=0.6)
        self.play(Create(arrows[4]), run_time=0.5)
        runner = Dot(arcs[0].get_start(), radius=0.09, color=INK)
        self.play(FadeIn(runner, scale=0.5), run_time=0.2)
        self.play(Succession(*[MoveAlongPath(runner, arc, rate_func=linear) for arc in arcs]), run_time=2.4)
        self.play(FadeOut(runner), run_time=0.2)
        # "So the agent doesn't like the drug more; it needs it more."  In the middle of the loop.
        liking = Text("likes it more", font_size=28, color=MUTED).move_to([0, -0.75, 0])
        no = strike(liking)
        needing = Text("needs it more", font_size=30, color=HOMEO).next_to(liking, DOWN, buff=0.3)
        self.play(FadeIn(liking, shift=0.1 * DOWN), run_time=0.5)
        self.play(Create(no), run_time=0.4)
        self.play(FadeIn(needing, shift=0.1 * UP), run_time=0.6)
        self.wait(2.4)

        # "This is a proposed explanation, not a claim that addiction comes down to one variable. Its
        # usefulness is that it links homeostatic regulation with learning and planning."
        self.next_section("caveat")
        proposal, claims, boxes, link = caveat_frame()
        self.play(FadeOut(nodes, arrows, loop_heading, liking, no, needing), run_time=0.6)
        self.play(FadeIn(proposal, shift=0.1 * DOWN), run_time=0.8)
        self.wait(0.8)
        # "...not a claim that addiction comes down to one variable."
        self.play(FadeIn(claims[0], shift=0.1 * RIGHT), run_time=0.6)
        self.wait(1.8)
        # "Its usefulness is that it links homeostatic regulation with learning and planning."
        self.play(FadeIn(boxes[0], shift=0.1 * RIGHT), run_time=0.7)
        self.play(FadeIn(boxes[1], shift=0.1 * LEFT), run_time=0.7)
        self.play(Create(link), run_time=0.6)
        self.wait(2.9)

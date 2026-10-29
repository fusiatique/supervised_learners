"""Maths 14 — Drugs in HRL.

Narration: from "But it also gives us a way to think about drugs." to "...but it links homeostatic
regulation with learning."  Starts on Maths 13's last frame.

A dose raises H by 25, the drug's effect in our simulation, and D(H) = (H* - H)^2 / H* with H* = 50: from
H = 25 a dose is worth D(25) - D(50) = +12.5. The second half is our simulation's mechanism (js/model.js):
when nothing happens H drifts back to a baseline B, which starts at 40; each dose lowers B; natural rewards
can hold H at most at B + 20, so once B is below the tipping point (30) only the drug reaches the setpoint.
The drops in B are compressed for the animation: in the simulation each dose lowers it by 1.
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    ArcBetweenPoints,
    Create,
    CurvedArrow,
    DashedVMobject,
    Dot,
    DoubleArrow,
    FadeIn,
    FadeOut,
    FadeTransform,
    GrowFromEdge,
    Indicate,
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
B0, TIPPING, NATURAL_REACH = 0.40, 0.30, 0.20  # the baseline, the tipping point and B + 20, as gauge levels

# Narration cues (seconds from the start), at about 150 words per minute with short pauses between
# sentences. Each beat waits for its cue with self.at(); change them if the narrator is faster or slower.
T_RAPIDLY = 4.0  # "A drug can change the internal state rapidly and powerfully.
T_CLOSER = 7.7  # If that brings the agent closer to its setpoint, the drug is valuable because it relieves the deviation."
T_RELIEF = 14.0  # "So, as Keramati and colleagues put it, drug taking is reinforced by relief,
T_PLEASURE = 19.6  # ...not just pleasure."
T_CHRONIC = 21.5  # "Chronic use also changes the system itself.
T_BASELINE = 24.4  # In our simulation, each dose lowers the baseline that H drifts back to.
T_TIPPING = 29.7  # Below a tipping point,
T_NATURAL = 31.3  # natural rewards can no longer bring H up to the setpoint.
T_ONLY_DRUG = 35.4  # Only the drug can,
T_FURTHER = 37.8  # and every dose lowers the baseline further."
T_LOOP = 40.0  # "This creates a feedback loop:
T_USE = 42.0  # drug use lowers the baseline,
T_GROWS = 44.0  # the deviation without the drug grows,
T_NEXT_DOSE = 47.0  # and the next dose becomes more rewarding.
T_LIKE = 49.9  # The agent doesn't like the drug more;  ("doesn't" at 49.5; this lands on "like")
T_NEEDS = 52.0  # it needs it more."
T_PROPOSED = 54.0  # "This is a proposed explanation, not the whole story of addiction,
T_LINKS = 58.4  # but it links homeostatic regulation with learning."
T_END = 62.5


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


def baseline_mark(gauge, level):
    """The baseline B on the gauge: a grey tick across the track, labelled B."""
    return gauge.mark(level, label="B", color=MUTED)


def tipping_mark(gauge):
    """The tipping point: a dashed red tick, labelled outside the dial."""
    tick = DashedVMobject(Line(gauge._point(TIPPING, 0.74), gauge._point(TIPPING, 1.2)), num_dashes=4)
    label = Text("tipping point", font_size=18, color=HARM).move_to(gauge._point(TIPPING, 1.85))
    return VGroup(tick.set_stroke(HARM, width=4), label)


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
        for c in ("the whole story of addiction",)
    ]).arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to([0, 0.35, 0])
    boxes = VGroup(*[
        VGroup(RoundedRectangle(width=t.width + 0.6, height=t.height + 0.5, corner_radius=0.15).set_stroke(c, width=2.5), t)
        for t, c in ((Text("homeostatic regulation", font_size=28, color=HOMEO), HOMEO),
                     (Text("reward learning", font_size=28, color=MODEL), MODEL))
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
    """Paced like Maths 10–13 (animations 35% slower), with every beat on its narration cue."""

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

        # "A drug can change the internal state rapidly and powerfully."
        self.next_section("relief")
        self.at(T_RAPIDLY)
        self.play(natural.animate.set_opacity(0.35), run_time=0.4)
        self.take(drug[0], agent, gauge, 50)
        self.play(Transform(agent.mouth, agent.make_mouth("happy")), run_time=0.4)
        # "If that brings the agent closer to its setpoint, the drug is valuable because it relieves the
        # deviation."
        first = reward_line(25, 50).move_to([RX - 0.4, -1.35, 0])
        relief = Text("relief", font_size=24, color=HOMEO).next_to(first, DOWN, buff=0.15)
        worth_word = Text("worth", font_size=22, color=MUTED)
        worth = MathTex(signed(12.5), font_size=32, color=DOPAMINE)
        VGroup(worth_word, worth).arrange(RIGHT, buff=0.15).next_to(drug, DOWN, buff=0.3)
        self.at(T_CLOSER)
        self.play(Write(first), run_time=1.2)
        self.play(FadeIn(relief, shift=0.1 * UP), FadeIn(worth_word), FadeTransform(first[-1].copy(), worth), run_time=0.7)

        # "So, as Keramati and colleagues put it, drug taking is reinforced by relief, not just pleasure."
        # The drug's reward, split: mostly relief.
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
        self.at(T_RELIEF)
        self.play(FadeOut(natural, drug, worth_word, worth, first, relief),
                  gauge.value.animate.set_value(0.25), Transform(agent.mouth, agent.make_mouth("blank")), run_time=0.6)
        self.play(FadeIn(cite), FadeIn(point, shift=0.1 * DOWN), FadeIn(split_name), GrowFromEdge(relief_part, LEFT),
                  FadeIn(relief_name), run_time=1.0)
        # "...not just pleasure."
        self.at(T_PLEASURE)
        self.play(FadeIn(not_just, shift=0.1 * DOWN), GrowFromEdge(pleasure_part, LEFT), FadeIn(pleasure_name), run_time=0.9)

        # "Chronic use also changes the system itself. In our simulation, each dose lowers the baseline that
        # H drifts back to."  The baseline B is marked on the gauge; after each dose H drifts back to it,
        # and it is a little lower each time.
        self.next_section("baseline")
        cite2 = Text("our simulation", font_size=22, color=MUTED).move_to([RX, 1.75, 0])
        point2 = Text("2. chronic use changes the system itself", font_size=25, color=HOMEO).move_to([RX - 0.15, 1.2, 0])
        baseline = ValueTracker(B0)
        b_mark = always_redraw(lambda: baseline_mark(gauge, baseline.get_value()))
        pill = capsule(0.45).move_to(AGENT_POS + np.array([1.5, 1.0, 0]))
        food = apple(0.5).move_to(AGENT_POS + np.array([1.5, -1.25, 0]))
        steps = VGroup(
            Text("each dose: baseline B ↓", font_size=24, color=INK),
            Text("below the tipping point,\nnatural rewards fall short", font_size=24, color=HARM, line_spacing=0.8),
            Text("only the drug reaches H*", font_size=24, color=PILL),
            Text("and B drops further", font_size=24, color=INK),
        ).arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to([RX, -0.85, 0])
        self.at(T_CHRONIC)
        self.play(FadeOut(point, not_just, split, split_name, relief_name, pleasure_name),
                  FadeTransform(cite, cite2), FadeIn(point2, shift=0.1 * DOWN), gauge.value.animate.set_value(B0),
                  run_time=0.8)
        self.at(T_BASELINE)
        self.play(FadeIn(b_mark), FadeIn(pill), FadeIn(steps[0], shift=0.1 * UP), run_time=0.5)
        for _ in range(2):
            self.take(pill, agent, gauge, 100 * gauge.value.get_value() + DOSE)
            self.play(baseline.animate.increment_value(-0.08), gauge.value.animate.set_value(baseline.get_value() - 0.08),
                      run_time=0.7, rate_func=rate_functions.ease_out_sine)
        # "Below a tipping point..."  B is now under it.
        tip = tipping_mark(gauge)
        self.at(T_TIPPING)
        self.play(FadeIn(tip, scale=1.2), Transform(agent.mouth, agent.make_mouth("sad")), run_time=0.6)
        # "...natural rewards can no longer bring H up to the setpoint."  Food lifts H only to B + 20, short
        # of H*: the red deviation arc stays.
        self.at(T_NATURAL)
        self.play(FadeIn(food, scale=1.2), FadeIn(steps[1], shift=0.1 * UP), run_time=0.5)
        self.play(gauge.value.animate.set_value(baseline.get_value() + NATURAL_REACH),
                  food.animate(rate_func=rate_functions.there_and_back).scale(1.25), run_time=1.4)
        self.play(Indicate(f["gap"], color=HARM, scale_factor=1.05), run_time=0.6)
        # "Only the drug can..."  Without anything, H sinks back to B; a dose brings it to the setpoint.
        self.at(T_ONLY_DRUG)
        self.play(gauge.value.animate.set_value(baseline.get_value()), food.animate.set_opacity(0.35), run_time=0.4)
        self.take(pill, agent, gauge, 100 * baseline.get_value() + DOSE)
        self.play(Transform(agent.mouth, agent.make_mouth("happy")), FadeIn(steps[2], shift=0.1 * UP), run_time=0.3)
        # "...and every dose lowers the baseline further."
        self.at(T_FURTHER)
        self.play(baseline.animate.increment_value(-0.08), gauge.value.animate.set_value(baseline.get_value() - 0.06),
                  Transform(agent.mouth, agent.make_mouth("sad")), FadeIn(steps[3], shift=0.1 * UP), run_time=1.2,
                  rate_func=rate_functions.ease_in_sine)

        # "This creates a feedback loop: drug use lowers the baseline, the deviation without the drug grows,
        # and the next dose becomes more rewarding. The agent doesn't like the drug more; it needs it more."
        self.next_section("loop")
        loop_heading = Text("a feedback loop", font_size=34, color=INK).move_to(heading)
        names = (("drug use", PILL), ("baseline B\ndrops", HOMEO), ("deviation when\ndrug is absent", HARM),
                 ("next dose\nmore rewarding", DOPAMINE), ("drug seeking", MODEL))
        places = ((0, 1.2), (4.0, 0.0), (2.5, -2.3), (-2.5, -2.3), (-4.0, 0.0))
        nodes = VGroup(*[Text(n, font_size=26, color=c, line_spacing=0.8).move_to([x, y - 0.4, 0])
                         for (n, c), (x, y) in zip(names, places)])
        arcs, arrows = [], VGroup()
        for i, a in enumerate(nodes):
            b = nodes[(i + 1) % len(nodes)]
            start, end = edge(a, b.get_center()), edge(b, a.get_center())
            arcs.append(ArcBetweenPoints(start, end, angle=-0.45))
            arrows.add(CurvedArrow(start, end, angle=-0.45, color=MUTED, stroke_width=3, tip_length=0.18))
        self.at(T_LOOP)
        self.play(FadeOut(agent, brain, gauge, f["mark"], f["gap"], b_mark, tip, pill, food, steps, point2, cite2),
                  FadeTransform(heading, loop_heading), run_time=0.7)
        self.play(FadeIn(nodes[0], scale=0.9), run_time=0.5)
        # "...drug use lowers the baseline..."
        self.at(T_USE)
        self.play(Create(arrows[0]), FadeIn(nodes[1], shift=0.1 * DOWN), run_time=0.6)
        # "...the deviation without the drug grows..."
        self.at(T_GROWS)
        self.play(Create(arrows[1]), FadeIn(nodes[2], shift=0.1 * LEFT), run_time=0.6)
        # "...and the next dose becomes more rewarding."  The loop closes through drug seeking, and a dot
        # runs once around it.
        self.at(T_NEXT_DOSE)
        self.play(Create(arrows[2]), FadeIn(nodes[3], shift=0.1 * LEFT), run_time=0.5)
        self.play(Create(arrows[3]), FadeIn(nodes[4], shift=0.1 * UP), run_time=0.4)
        self.play(Create(arrows[4]), run_time=0.3)
        runner = Dot(arcs[0].get_start(), radius=0.09, color=INK)
        self.play(FadeIn(runner, scale=0.5), run_time=0.1)
        self.play(Succession(*[MoveAlongPath(runner, arc, rate_func=linear) for arc in arcs]), run_time=0.8)
        self.play(FadeOut(runner), run_time=0.1)
        # "The agent doesn't like the drug more; it needs it more."  In the middle of the loop.
        liking = Text("likes it more", font_size=28, color=MUTED).move_to([0, -0.75, 0])
        no = strike(liking)
        needing = Text("needs it more", font_size=30, color=HOMEO).next_to(liking, DOWN, buff=0.3)
        self.at(T_LIKE)
        self.play(FadeIn(liking, shift=0.1 * DOWN), run_time=0.5)
        self.play(Create(no), run_time=0.4)
        # "...it needs it more."
        self.at(T_NEEDS)
        self.play(FadeIn(needing, shift=0.1 * UP), run_time=0.6)

        # "This is a proposed explanation, not the whole story of addiction, but it links homeostatic
        # regulation with learning."
        self.next_section("caveat")
        proposal, claims, boxes, link = caveat_frame()
        self.at(T_PROPOSED)
        self.play(FadeOut(nodes, arrows, loop_heading, liking, no, needing), run_time=0.6)
        self.play(FadeIn(proposal, shift=0.1 * DOWN), run_time=0.7)
        # "...not the whole story of addiction..."
        self.play(FadeIn(claims[0], shift=0.1 * RIGHT), run_time=0.6)
        # "...but it links homeostatic regulation with learning."
        self.at(T_LINKS)
        self.play(FadeIn(boxes[0], shift=0.1 * RIGHT), run_time=0.6)
        self.play(FadeIn(boxes[1], shift=0.1 * LEFT), run_time=0.6)
        self.play(Create(link), run_time=0.5)
        self.at(T_END)

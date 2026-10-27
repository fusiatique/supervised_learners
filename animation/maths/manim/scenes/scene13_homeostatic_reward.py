"""Maths 13 — The homeostatic reward.

Narration: from the stage direction "Place two possible outcomes in front of the agent..." (under
"Now we can redefine reward by asking...") to "...become more valuable when they restore a
regulated state."  Starts on Maths 12's last frame.

Every number is D(H) = (50 - H)^2 / 50 and r = D(H_before) - D(H_after), as in our simulation.
The reward is shown as something you can see before it is a number: a bar for the deviation D,
a ghost of where it was before the outcome, and an arrow for the change, which is the reward.
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    AnimationGroup,
    Arrow,
    Circle,
    Create,
    DashedVMobject,
    Dot,
    FadeIn,
    FadeOut,
    FadeTransform,
    GrowArrow,
    Indicate,
    LaggedStart,
    ManimColor,
    MathTex,
    Rectangle,
    Scene,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
    always_redraw,
    rate_functions,
    UpdateFromAlphaFunc,
    interpolate_color,
    smooth,
)

from common import (
    DOPAMINE, HARM, HOMEO, INK, MUTED, Agent, Gauge, PacedScene, apple, brain_light, moon, sun, water_glass,
)
from scene12_setpoint import RX, drive, end_frame as scene12_end_frame

START_H = 30  # where H sits when the outcomes are offered (D = 8)
BAR_SCALE = 0.09  # bar height per unit of D: D = 24.5 is 2.2 units tall


def reward(before, after):
    return drive(before) - drive(after)


def fmt(x):
    """+7.5, -16.5, 0.5, 8: one decimal place, dropped when it is .0."""
    return f"{x:.1f}".rstrip("0").rstrip(".")


def signed(x):
    return ("+" if x > 0 else "") + fmt(x)


def three_glasses(height=0.55):
    return VGroup(*[water_glass(height=height) for _ in range(3)]).arrange(RIGHT, buff=0.08)


def outcome(icon, caption):
    """An outcome on offer: its picture and what it does to H."""
    label = MathTex(caption, font_size=26, color=INK)
    return VGroup(icon, label).arrange(DOWN, buff=0.15)


def neon(alpha):
    """Brightness of a neon sign switching on: a few stutters, a full blaze, then a slow settle back."""
    for start, end, level in ((0, 0.05, 0.8), (0.05, 0.09, 0.1), (0.09, 0.13, 1), (0.13, 0.17, 0.35)):
        if start <= alpha < end:
            return level
    return 1 if alpha < 0.5 else 1 - smooth((alpha - 0.5) / 0.5)


def light_up(agent, brain, run_time=2.4):
    """The brain flickers on like a neon sign, with a soft teal glow over the head, then settles back."""
    disc, h = brain
    base = disc.get_fill_opacity()
    layers = 18  # stacked translucent discs: a smooth falloff
    halo = VGroup(*[
        Circle(radius=1.1 * agent.radius * (k + 1) / layers, stroke_width=0, fill_color=HOMEO, fill_opacity=0)
        for k in range(layers)
    ]).move_to(disc).set_z_index(agent.z_index + 0.5)  # over the face, under the disc and the H

    def update(_, alpha):
        v = neon(alpha)
        disc.set_fill(opacity=base + (0.8 - base) * v)
        h.set_color(interpolate_color(ManimColor(HOMEO), ManimColor(INK), v))
        for layer in halo:
            layer.set_fill(opacity=0.025 * v)

    return UpdateFromAlphaFunc(halo, update, run_time=run_time, remover=True)


class DeviationBar(VGroup):
    """A vertical bar for the deviation D of a gauge's current H, kept live. `ghost()` freezes an
    outline of the current level (where D was before an outcome), and `change()` draws the arrow
    from that level to the current one."""

    def __init__(self, gauge, bottom, height=2.4, width=0.44, label_size=30):
        super().__init__()
        self.gauge = gauge
        self.track = Rectangle(width=width, height=height, stroke_color=MUTED, stroke_width=1.5, stroke_opacity=0.6)
        self.track.move_to(bottom, aligned_edge=DOWN)
        self.fill = always_redraw(lambda: Rectangle(
            width=width, height=max(0.002, self.d() * BAR_SCALE), stroke_width=0, fill_color=HARM, fill_opacity=0.85,
        ).move_to(self.track.get_bottom(), aligned_edge=DOWN))
        self.name = MathTex("D", font_size=label_size, color=HARM).next_to(self.track, DOWN, buff=0.12)
        self.add(self.track, self.fill, self.name)

    def d(self):
        return drive(100 * self.gauge.value.get_value())

    def level(self, d):
        return self.track.get_bottom() + d * BAR_SCALE * UP

    def ghost(self):
        """A dashed outline at the current level, labelled with its value on the left."""
        d = self.d()
        outline = Rectangle(width=self.track.width, height=max(0.002, d * BAR_SCALE)).move_to(
            self.track.get_bottom(), aligned_edge=DOWN)
        outline = DashedVMobject(outline, num_dashes=24).set_stroke(INK, width=2, opacity=0.8)
        value = MathTex(fmt(d), font_size=26, color=INK).next_to(self.level(d), LEFT, buff=0.35)
        return VGroup(outline, value)

    def after_value(self):
        d = self.d()
        return MathTex(fmt(d), font_size=26, color=HARM).next_to(self.level(d), LEFT, buff=0.35)

    def change(self, before, after):
        """The arrow from the before level to the after level, beside the bar: amber when D shrinks."""
        color = DOPAMINE if reward(before, after) > 0 else HARM
        x = self.track.get_right()[0] + 0.3
        start, end = self.level(drive(before)), self.level(drive(after))
        arrow = Arrow([x, start[1], 0], [x, end[1], 0], buff=0, stroke_width=6, color=color,
                      max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=40)
        return arrow


def motivated_frame(level=0.5, expression="happy"):
    """The last beat's stage: its heading, one agent (with H in its brain) and its gauge at `level`."""
    title = Text("a theory of motivated behaviour", font_size=34, color=INK).move_to([0, 2.45, 0])
    not_yet = Text("not yet of addiction", font_size=24, color=MUTED).next_to(title, DOWN, buff=0.15)
    agent = Agent(radius=0.85, expression=expression).move_to([-3.2, -0.6, 0])
    brain = brain_light(agent)
    gauge = Gauge(value=level, radius=1.5)
    gauge.shift(np.array([0.6, -0.7, 0]) - gauge.center())
    return {"heading": title, "not_yet": not_yet, "agent": agent, "brain": brain, "gauge": gauge,
            "mark": gauge.mark(0.5, label="H^*"), "gap": gauge.gap(0.5)}


def end_frame():
    """Maths 13's last frame, for Maths 14 to start from."""
    return {"title": scene12_end_frame()["title"], **motivated_frame()}


class Scene13HomeostaticReward(PacedScene, Scene):
    """Paced like Maths 10–12: animations 35% slower, every narration line keeps its full time."""

    REPAY_ACROSS_SECTIONS = False

    def show_case(self, gauge, bar, axes, before, after, formula_at=None):
        """One worked case: freeze the before state (a ghost arc on the gauge, a dashed outline on the
        bar, a hollow marker on the plot), move H, then draw the change as an arrow with the reward.
        With formula_at, also write r = D(before) - D(after) = r there, the two D values flying in
        from the bar. Returns everything it added, to clear later."""
        if abs(gauge.value.get_value() - before / 100) > 1e-6:
            self.play(gauge.value.animate.set_value(before / 100), run_time=0.4)
        arc_before = gauge.gap(0.5).copy().clear_updaters().set_stroke(opacity=0.3)
        bar_before = bar.ghost()
        plot_before = Circle(radius=0.09).set_stroke(INK, width=2.5).move_to(axes.c2p(before, drive(before)))
        self.play(FadeIn(arc_before, bar_before, plot_before), run_time=0.3)
        self.play(gauge.value.animate.set_value(after / 100), run_time=0.7)
        after_value = bar.after_value()
        arrow = bar.change(before, after)
        self.play(FadeIn(after_value), GrowArrow(arrow), run_time=0.5)
        added = [arc_before, bar_before, plot_before, after_value, arrow]
        if formula_at is not None:
            r = reward(before, after)
            line = MathTex("r", "=", fmt(drive(before)), "-", fmt(drive(after)), "=", signed(r), font_size=38,
                           color=INK).move_to(formula_at)
            line[2].set_color(INK)
            line[4].set_color(HARM)
            line[6].set_color(DOPAMINE if r > 0 else HARM)
            self.play(FadeIn(line[:2]), FadeTransform(bar_before[1].copy(), line[2]), FadeIn(line[3]),
                      FadeTransform(after_value.copy(), line[4]), run_time=0.6)
            self.play(FadeIn(line[5], line[6]), run_time=0.3)
            added.append(line)
        return VGroup(*added)

    def construct(self):
        # Maths 12's last frame.
        f = scene12_end_frame()
        agent, brain, gauge, axes = f["agent"], f["brain"], f["gauge"], f["axes"]
        self.add(f["title"], agent, brain, gauge, f["target"], f["setpoint_word"], f["gap"], f["deviation"],
                 f["squared"], f["plot"], f["tracer"])
        bar = DeviationBar(gauge, bottom=np.array([0.3, -2.6, 0]))

        # "Now we can redefine reward by asking: how much will this outcome reduce the agent's
        # homeostatic deviation?"  H sits below the setpoint; two outcomes are offered, a glass of water
        # and a hot day. Each is previewed as a dot on the plot; the one that brings H closer lights up.
        self.next_section("two outcomes")
        water = outcome(water_glass(height=0.6), r"H + 15").move_to([-5.15, -2.9, 0])
        hot_day = outcome(sun(size=0.7), r"H - 15").move_to([-3.3, -2.9, 0])
        water_name = Text("a glass of water", font_size=18, color=MUTED).next_to(water, UP, buff=0.1)
        hot_name = Text("a hot day", font_size=18, color=MUTED).next_to(hot_day, UP, buff=0.1)
        # The plot slides a little right, to leave room for the bar and its arrow.
        # The bar comes in empty (H is on the setpoint), then fills to D = 8 as H falls to 30.
        self.play(FadeOut(f["deviation"]), f["squared"].animate.scale(0.7).move_to([RX + 0.45, 0.45, 0]),
                  VGroup(f["plot"], f["tracer"]).animate.shift(0.45 * RIGHT), FadeIn(bar), run_time=0.6)
        self.play(gauge.value.animate.set_value(START_H / 100), run_time=1.0)
        self.play(FadeIn(water, water_name, shift=0.15 * UP), FadeIn(hot_day, hot_name, shift=0.15 * UP), run_time=0.6)
        self.wait(0.6)
        # "...how much will this outcome reduce the agent's homeostatic deviation?"
        previews = {}
        for name, after, color, item in (("water", START_H + 15, HOMEO, water), ("hot", START_H - 15, MUTED, hot_day)):
            previews[name] = Dot(axes.c2p(after, drive(after)), radius=0.08, color=color)
            self.play(Indicate(item, color=color, scale_factor=1.1), FadeIn(previews[name]), run_time=0.7)
            self.wait(0.3)
        chosen = SurroundingRectangle(VGroup(water, water_name), color=DOPAMINE, buff=0.12, corner_radius=0.1)
        self.play(Create(chosen), previews["hot"].animate.set_opacity(0.25),
                  VGroup(hot_day, hot_name).animate.set_opacity(0.4), run_time=0.6)
        self.wait(0.6)

        # "Moving H closer to the setpoint gives a positive reward. Moving it further away can give a
        # negative one. And overshooting the target can make an outcome less beneficial, or even aversive."
        # r = D(before) - D(after) once, then each case as a change in the bar: down is good, up is bad.
        self.next_section("redefine reward")
        r_eq = MathTex(r"r_{\text{homeostatic}}", "=", r"D(H_{\text{before}})", "-", r"D(H_{\text{after}})",
                       font_size=34, color=INK).move_to([RX, 2.3, 0])
        r_eq[0].set_color(DOPAMINE)
        self.play(FadeOut(previews["water"], previews["hot"]), Write(r_eq), run_time=1.1)
        # "...closer to the setpoint gives a positive reward."
        case = self.show_case(gauge, bar, axes, START_H, START_H + 15, formula_at=[RX, 1.5, 0])
        self.wait(0.3)
        # "...further away can give a negative one."
        self.play(FadeOut(case), chosen.animate.become(SurroundingRectangle(VGroup(hot_day, hot_name), color=HARM,
                                                                            buff=0.12, corner_radius=0.1)),
                  VGroup(hot_day, hot_name).animate.set_opacity(1), VGroup(water, water_name).animate.set_opacity(0.4),
                  gauge.value.animate.set_value(START_H / 100), run_time=0.4)
        case = self.show_case(gauge, bar, axes, START_H, START_H - 15, formula_at=[RX, 1.5, 0])
        self.wait(0.3)
        # "...overshooting the target can make an outcome less beneficial, or even aversive."  Three glasses.
        flood = outcome(three_glasses(), r"H + 45").move_to(hot_day)
        flood_name = Text("three glasses", font_size=18, color=MUTED).next_to(flood, UP, buff=0.1)
        self.play(FadeOut(case, chosen), FadeOut(hot_day, hot_name), FadeIn(flood, flood_name),
                  VGroup(water, water_name).animate.set_opacity(0.4), gauge.value.animate.set_value(START_H / 100),
                  run_time=0.4)
        case = self.show_case(gauge, bar, axes, START_H, START_H + 45, formula_at=[RX, 1.5, 0])
        overshoot_note = Text("overshoot", font_size=22, color=HARM).next_to(gauge._point(0.75, 1.3), RIGHT, buff=0.05)
        self.play(FadeIn(overshoot_note, shift=0.1 * LEFT), run_time=0.4)
        self.wait(0.4)

        # "This is the core HRL idea. Reward comes from the anticipated reduction in deviation, and the
        # agent uses it to learn which actions are worth pursuing."
        self.next_section("core idea")
        # Only the agent and the equation stay.
        self.play(FadeOut(case, overshoot_note, water, water_name, flood, flood_name, gauge, f["target"],
                          f["setpoint_word"], f["gap"], bar, f["squared"], f["plot"], f["tracer"]),
                  VGroup(agent, brain).animate.scale(1.2).move_to([-3.4, -0.6, 0]),
                  r_eq.animate.scale(1.1).move_to([1.7, -0.75, 0]), run_time=1.0)
        box = SurroundingRectangle(r_eq, color=DOPAMINE, buff=0.2, corner_radius=0.12)
        core = Text("the core HRL idea", font_size=24, color=DOPAMINE).next_to(box, UP, buff=0.15)
        self.play(FadeIn(box, core), run_time=0.7)
        self.wait(1.4)
        # "...the agent uses it to learn which actions are worth pursuing."  The whole boxed card glides
        # into the brain, which lights up as it arrives.
        card = VGroup(r_eq, box, core).set_z_index(agent.z_index + 3)  # in front of the head all the way in
        landed = card.copy().scale(0.08).move_to(agent.brain_point())
        landed[0].set_opacity(0.5)
        landed[1].set_stroke(opacity=0.5)  # (set_opacity would also fill the box)
        landed[2].set_opacity(0.5)
        self.play(Transform(card, landed, path_arc=0.5, rate_func=smooth), run_time=1.4)
        self.remove(card)
        self.play(light_up(agent, brain))
        self.wait(0.6)

        # "So far, this is a theory of motivated behaviour, not yet of addiction. It explains why food,
        # water, or rest become more valuable when they restore a regulated state."
        # One agent, low on H: a glass of water, an apple and a rest each bring it back to the setpoint.
        self.next_section("motivated behaviour")
        m = motivated_frame(level=0.2, expression="blank")
        title, not_yet, one, g = m["heading"], m["not_yet"], m["agent"], m["gauge"]
        self.play(FadeOut(agent, brain), run_time=0.6)
        self.play(FadeIn(title, shift=0.1 * DOWN), FadeIn(one, m["brain"], g, m["mark"], m["gap"]), run_time=0.8)
        self.play(FadeIn(not_yet), run_time=0.5)
        self.wait(2.5)
        # "...food, water, or rest become more valuable when they restore a regulated state."
        items = VGroup(water_glass(height=0.8), apple(size=0.85), moon(size=0.85))
        items.arrange(RIGHT, buff=0.8).move_to([4.6, -0.6, 0])
        self.play(LaggedStart(*[FadeIn(i, shift=0.15 * UP) for i in items], lag_ratio=0.25), run_time=0.9)
        for item, level in zip(items, (0.32, 0.43, 0.5)):
            self.play(item.animate.scale(0.25).move_to(one.get_center()).set_opacity(0),
                      g.value.animate.set_value(level), run_time=0.8, rate_func=rate_functions.ease_in_sine)
            self.remove(item)
        self.play(Transform(one.mouth, one.make_mouth("happy")), run_time=0.4)
        self.wait(1)

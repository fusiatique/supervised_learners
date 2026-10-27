"""Maths 11 — Is a reward always worth the same? Giving the agent an internal state.

Narration: from "But there is a subtle assumption hiding underneath." to "...and gives the
agent something to regulate."  Starts on Maths 10's last frame; ends on the agent and an
internal-state gauge, where the homeostatic scenes begin.
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    PI,
    AnimationGroup,
    ArcBetweenPoints,
    Circle,
    Circumscribe,
    Dot,
    MoveAlongPath,
    Succession,
    FadeIn,
    FadeOut,
    LaggedStart,
    MathTex,
    MovingCameraScene,
    Text,
    Transform,
    VGroup,
    always_redraw,
    config,
    rate_functions,
    there_and_back,
)

from common import (
    DOPAMINE, HARM, HOMEO, INK, MODEL, MUTED, WORLD_SHIFT, Agent, Gauge, PacedScene, PolicyBox, Reward, big_world,
    brain_light, glow_square, policy_arrow, value_tex, water_glass,
)
from scene09_exploration import EGREEDY_TEX, GOAL, HIDDEN, after_discovery, glow_opacity, maths08_policy
from scene10_q_learning import takeaway_list

FIVE = 18
TEN_POS, FIVE_POS = np.array([-2.6, 0.2, 0]), np.array([2.6, 0.2, 0])  # where the two rewards settle
GOLD_GLOW = "#ffd27a"  # the 10 at its brightest
# Three agents, the same glass: what it is worth depends on the agent.
WATER_VALUES = {"thirsty": "+10", "satisfied": "+2", "overfull": "-3"}
VALUE_COLORS = {"thirsty": DOPAMINE, "satisfied": DOPAMINE, "overfull": HARM}
AGENT_POS = np.array([-2.3, -0.2, 0])  # where the one agent ends up, with its gauge to the right
GAUGE_POS = np.array([2.2, 0.1, 0])


def soft_halo(radius, strength=1.0):
    """A soft amber glow: stacked translucent discs, densest at the centre. Sits behind a star."""
    layers = 18  # many thin layers, so the falloff is smooth rather than banded
    return VGroup(*[
        Circle(radius=radius * (k + 1) / layers, stroke_width=0, fill_color=DOPAMINE, fill_opacity=0.0225 * strength)
        for k in range(layers)
    ]).set_z_index(4)


def dim(halo, factor):
    """Fade a soft halo to `factor` of its strength, layer by layer (setting one opacity on the
    whole group would make every layer equally strong, i.e. brighter)."""
    return AnimationGroup(*[d.animate.set_fill(opacity=d.get_fill_opacity() * factor) for d in halo])


def worth(v):
    """What the glass is worth at internal level v in [0, 1]: a lot when low, little or less when high."""
    return 10 - 16 * v


class Scene11InternalState(PacedScene, MovingCameraScene):
    """Paced like Maths 10: animations run 35% slower than written and every narration line keeps
    its full time."""

    REPAY_ACROSS_SECTIONS = False

    def construct(self):
        frame = self.camera.frame
        # Maths 10's last frame: the learned grid, the smiling agent on the 20, the takeaways.
        stage, _, stars, start_tag = big_world(s=HIDDEN)
        grid = stage.grid
        VGroup(stage.group, *stars.values(), start_tag).shift(WORLD_SHIFT)
        arrows = stage.add_arrows()
        agent = stage.agent
        agent.mouth.become(agent.make_mouth("happy"))
        V, known, learned_policy, _, _ = after_discovery(grid, maths08_policy(grid))
        valued = known + [GOAL, FIVE, HIDDEN, 25]
        glows = VGroup(*[glow_square(grid, s, V[s]).set_fill(opacity=glow_opacity(V[s])) for s in valued])
        values = {s: value_tex(V[s], grid, s) for s in valued}
        cell_arrows = VGroup(*[policy_arrow(grid, s, learned_policy[s]) for s in known if s != 19],
                             policy_arrow(grid, 25, "left"))
        twenty = Reward(size=0.4).set_z_index(5).move_to(grid.center_of(HIDDEN))
        takeaways = takeaway_list()
        box = PolicyBox(EGREEDY_TEX, font_size=32)
        self.add(stage.group, arrows, *stars.values(), twenty, start_tag, glows, *values.values(), cell_arrows,
                 takeaways, box)

        # "But there is a subtle assumption hiding underneath."  The maze swells towards us and
        # dissolves; only the two rewards remain, drifting apart into empty space.
        self.next_section("assumption")
        ten_star, five_star = stars[GOAL], stars[FIVE]
        world = VGroup(stage.group, arrows, twenty, start_tag, glows, *values.values(), cell_arrows)
        pivot = (grid.center_of(GOAL) + grid.center_of(FIVE)) / 2
        ten_halo, five_halo = soft_halo(1.15).move_to(TEN_POS), soft_halo(0.95).move_to(FIVE_POS)
        self.play(FadeOut(takeaways, box), run_time=0.5)
        self.play(world.animate(rate_func=rate_functions.ease_in_out_sine).scale(1.6, about_point=pivot).set_opacity(0),
                  ten_star.animate.scale(1.9).move_to(TEN_POS), five_star.animate.scale(1.6).move_to(FIVE_POS),
                  FadeIn(ten_halo, five_halo), run_time=1.6, rate_func=rate_functions.ease_in_out_sine)

        # "We've treated rewards as properties of the environment. One is worth ten, another is worth
        # five, and the agent prefers the first."  Each number rises into view on its word.
        self.next_section("worth ten")
        num_ten = MathTex("10", font_size=84, color=DOPAMINE).move_to(TEN_POS + 1.25 * UP)
        num_five = MathTex("5", font_size=84, color=DOPAMINE).move_to(FIVE_POS + 1.1 * UP)
        self.wait(2.4)
        # "...One is worth ten..."
        self.play(FadeIn(num_ten, shift=0.35 * UP), ten_halo.animate(rate_func=there_and_back).scale(1.25), run_time=0.6)
        self.wait(0.4)
        # "...another is worth five..."
        self.play(FadeIn(num_five, shift=0.35 * UP), five_halo.animate(rate_func=there_and_back).scale(1.25), run_time=0.6)
        self.wait(0.2)
        # "...and the agent prefers the first."  It appears between them, glances at the 10, and glides
        # over in a slow arc as the camera eases in and the 5 dims. When it arrives, the 10 blooms.
        hero = Agent(radius=0.55).move_to([0, -1.7, 0])
        self.play(FadeIn(hero, scale=0.8), run_time=0.5)
        self.play(hero.eyes.animate.shift(0.05 * hero.radius * LEFT), run_time=0.3)
        beside_ten = TEN_POS + np.array([1.15, -0.85, 0])
        self.play(MoveAlongPath(hero, ArcBetweenPoints(hero.get_center(), beside_ten, angle=-0.7)),
                  frame.animate.scale(0.82).move_to(TEN_POS + np.array([0.7, 0.05, 0])),
                  VGroup(five_star, num_five).animate.set_opacity(0.15), dim(five_halo, 0.15),
                  run_time=1.6, rate_func=rate_functions.ease_in_out_sine)
        wash = soft_halo(3.6, strength=0.5).move_to(TEN_POS).set_z_index(-1)  # a warm glow spreading over the frame
        rings = VGroup(*[Circle(radius=0.55).set_stroke(DOPAMINE, width=5).move_to(TEN_POS) for _ in range(3)])
        sparks = VGroup(*[Dot(TEN_POS, radius=0.045, color=DOPAMINE) for _ in range(18)])
        self.add(rings, sparks)
        self.play(
            LaggedStart(*[r.animate(rate_func=rate_functions.ease_out_cubic).scale(4.5).set_stroke(opacity=0)
                          for r in rings], lag_ratio=0.25),
            *[d.animate(rate_func=rate_functions.ease_out_cubic).shift(
                2.3 * np.array([np.cos(a), np.sin(a), 0])).set_opacity(0)
              for d, a in zip(sparks, np.linspace(0, 2 * PI, 18, endpoint=False))],
            FadeIn(wash, scale=0.4),
            num_ten.animate.scale(1.35).set_color(GOLD_GLOW),
            ten_halo.animate.scale(1.7),
            Transform(hero.mouth, hero.make_mouth("happy")),
            run_time=1.3,
        )
        self.remove(rings, sparks)

        # "But is a reward always worth the same?"  A dip to darkness; the same star and the same 10
        # return, cold and still. The agent drifts in exhausted and touches it: the 10 barely flickers,
        # greys, and its digits drift apart and fade. It has lost its meaning.
        self.next_section("always worth the same")
        self.play(FadeOut(hero, num_ten, ten_star, ten_halo, wash, five_star, num_five, five_halo), run_time=0.6)
        again_star = Reward(size=0.61).set_z_index(5).move_to(TEN_POS)
        again_halo = soft_halo(1.15, strength=0.6).move_to(TEN_POS)
        again_ten = MathTex("10", font_size=84, color=DOPAMINE).move_to(TEN_POS + 1.25 * UP)
        self.play(FadeIn(again_star, again_halo, again_ten), run_time=0.8)
        tired = Agent(radius=0.55).move_to(TEN_POS + np.array([4.2, -0.85, 0]))
        tired_mouth, tired_marks = tired.mood("tired")
        tired.mouth.become(tired_mouth)
        tired.add(tired_marks)
        self.add(tired)
        self.play(tired.animate.move_to(beside_ten), run_time=1.6, rate_func=rate_functions.ease_out_sine)
        self.play(Succession(again_ten.animate(run_time=0.12).set_opacity(0.4),
                             again_ten.animate(run_time=0.12).set_opacity(0.85),
                             again_ten.animate(run_time=0.2).set_opacity(0.35)))
        one, zero = again_ten[0]
        self.play(one.animate.shift(0.35 * LEFT + 0.1 * DOWN).rotate(0.25).set_color(MUTED).set_opacity(0.18),
                  zero.animate.shift(0.35 * RIGHT + 0.15 * DOWN).rotate(-0.2).set_color(MUTED).set_opacity(0.18),
                  again_star.animate.set_color(MUTED).set_opacity(0.45), FadeOut(again_halo),
                  run_time=1.3, rate_func=rate_functions.ease_out_sine)
        self.wait(0.4)

        # "A glass of water is far more valuable when you're thirsty. Food is more rewarding when you're
        # hungry. And something rewarding can become less satisfying when you've had too much of it."
        # The maze returns as a faint backdrop; three agents stand beside the same glass.
        self.next_section("water")
        trios = {}
        for kind, x in zip(("thirsty", "satisfied", "overfull"), (-4.6, 0.0, 4.6)):
            who = Agent(radius=0.6).move_to([x - 0.65, 0.0, 0])
            mouth, marks = who.mood(kind)
            who.mouth.become(mouth)
            who.add(marks)
            glass = water_glass(height=1.0).move_to([x + 0.75, -0.1, 0])
            value = MathTex(WATER_VALUES[kind], font_size=44, color=VALUE_COLORS[kind]).next_to(glass, UP, buff=0.3)
            label = Text(kind, font_size=24, color=MUTED).next_to(who, DOWN, buff=0.35)
            trios[kind] = VGroup(who, glass, value, label)
        self.play(FadeOut(again_star, again_ten, tired), frame.animate.set(width=config.frame_width).move_to(ORIGIN),
                  world.animate.scale(1 / 1.6, about_point=pivot).set_opacity(0.05), run_time=1)
        # "...far more valuable when you're thirsty."
        self.wait(1.6)
        self.play(FadeIn(trios["thirsty"], shift=0.2 * UP), run_time=0.7)
        self.wait(2.3)
        # "Food is more rewarding when you're hungry."  (Not hungry, not thirsty: the glass is worth less.)
        self.play(FadeIn(trios["satisfied"], shift=0.2 * UP), run_time=0.7)
        self.wait(2.8)
        # "...less satisfying when you've had too much of it."
        self.play(FadeIn(trios["overfull"], shift=0.2 * UP), run_time=0.7)
        self.wait(1.8)

        # "The environment hasn't changed. The reward hasn't changed."
        self.next_section("hasn't changed")
        self.play(world.animate(rate_func=there_and_back).set_opacity(0.3), run_time=0.8)
        self.wait(0.5)
        self.play(*[Circumscribe(t[1], color=INK, buff=0.1) for t in trios.values()], run_time=0.9)

        # "The agent has."
        self.next_section("the agent has")
        self.play(*[t[0].animate(rate_func=there_and_back).scale(1.18) for t in trios.values()], run_time=0.7)

        # "So let's give the agent an internal state as well. This state changes over time, influences
        # how rewarding an action feels, and gives the agent something to regulate."
        # One agent stays: its brain lights up with a new variable, H, and a gauge appears beside it.
        self.next_section("internal state")
        one = trios["satisfied"][0]
        others = VGroup(*[trios[k] for k in ("thirsty", "overfull")], *trios["satisfied"][1:])
        self.play(FadeOut(others, world), one.animate.scale(1.8).move_to(AGENT_POS), run_time=0.9)
        self.play(Transform(one.mouth, one.make_mouth("blank")), run_time=0.3)
        brain, h_in_brain = brain_light(one)
        # "...an internal state..."
        self.play(FadeIn(brain, scale=0.5), FadeIn(h_in_brain, scale=1.6), run_time=0.7)
        gauge = Gauge(value=0.0, radius=1.5).move_to(GAUGE_POS)
        title = Text("internal state", font_size=30, color=HOMEO).next_to(gauge, UP, buff=0.45)
        self.play(FadeIn(gauge, scale=0.9), FadeIn(title, shift=0.1 * DOWN), run_time=0.8)
        self.wait(0.3)
        # "This state changes over time..."
        self.play(gauge.value.animate.set_value(0.75), run_time=1.1)
        self.play(gauge.value.animate.set_value(0.25), run_time=1.0)
        # "...influences how rewarding an action feels..."  A glass beside the gauge: its worth follows H.
        glass = water_glass(height=0.9).move_to(GAUGE_POS + np.array([2.9, -0.4, 0]))
        glass_value = always_redraw(lambda: MathTex(f"{worth(gauge.value.get_value()):+.0f}", font_size=40,
                                                    color=DOPAMINE if worth(gauge.value.get_value()) >= 0 else HARM)
                                    .next_to(glass, UP, buff=0.25))
        self.play(FadeIn(glass, glass_value), run_time=0.5)
        self.play(gauge.value.animate.set_value(0.85), run_time=1.3)
        self.play(gauge.value.animate.set_value(0.1), run_time=1.3)
        # "...and gives the agent something to regulate."  The needle settles in the middle.
        self.play(gauge.value.animate.set_value(0.5), FadeOut(glass, glass_value), run_time=1.1)
        self.wait(0.8)

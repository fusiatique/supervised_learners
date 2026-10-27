"""Maths 11 — Is a reward always worth the same? Giving the agent an internal state.

Narration: from "But there is a subtle assumption hiding underneath." to "...and gives the
agent something to regulate."  Starts on Maths 10's last frame; ends on the agent and an
internal-state gauge, where the homeostatic scenes begin.
"""

import numpy as np
from manim import (
    DOWN,
    RIGHT,
    UP,
    AnimationGroup,
    Wait,
    Circle,
    Circumscribe,
    Succession,
    FadeIn,
    FadeOut,
    LaggedStart,
    MathTex,
    Scene,
    Text,
    VGroup,
    always_redraw,
    rate_functions,
    there_and_back,
)

from common import (
    DOPAMINE, HARM, HOMEO, INK, MUTED, WORLD_SHIFT, Agent, Gauge, PacedScene, PolicyBox, Reward, absorb,
    big_world, final_policy, brain_light, glow_square, policy_arrow, value_tex, water_glass,
)
from scene09_exploration import EGREEDY_TEX, GOAL, HIDDEN, after_discovery, glow_opacity
from scene10_q_learning import takeaway_list

FIVE = 18
TEN_POS, FIVE_POS = np.array([-2.6, 0.2, 0]), np.array([2.6, 0.2, 0])  # where the two rewards settle
# Three agents, the same glass: what it is worth depends on the agent.
WATER_VALUES = {"thirsty": "+10", "satisfied": "+2", "overfull": "-3"}
VALUE_COLORS = {"thirsty": DOPAMINE, "satisfied": DOPAMINE, "overfull": HARM}
AGENT_POS = np.array([-2.3, -0.2, 0])  # where the one agent ends up, with its gauge to the right
GAUGE_POS = np.array([2.2, 0.1, 0])

# Narration cues (seconds from the start), at about 145 words per minute. The opening line is paced by
# its own animation.
T_TEN = 6.5  # "We've treated rewards as properties of the environment: one is worth ten,
T_FIVE = 8.2  # ...another is worth five."
T_SAME = 10.2  # "But is a reward always worth the same?"
T_THIRSTY = 14.6  # "A glass of water is worth a lot when you're thirsty.
T_ENOUGH = 19.5  # Less when you've already had enough to drink.
T_TOO_MUCH = 23.2  # And when you've had too much, another glass can even feel unpleasant."
T_GLASS = 29.3  # "The glass hasn't changed.
T_AGENT_HAS = 31.3  # The agent has."
T_INTERNAL = 32.9  # "So let's give the agent an internal state as well.
T_CHANGES = 39.0  # This state changes over time,
T_INFLUENCES = 41.1  # influences how rewarding an action feels,
T_REGULATE = 43.6  # and gives the agent something to regulate."
T_END = 47.6


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


class Scene11InternalState(PacedScene, Scene):
    """Paced like Maths 10: animations run 35% slower than written and every narration line keeps
    its full time; from the question on, each beat waits for its narration cue."""

    REPAY_ACROSS_SECTIONS = False

    def construct(self):
        # Maths 10's last frame: the learned grid, the smiling agent on the 20, the takeaways.
        stage, _, stars, start_tag = big_world(s=HIDDEN)
        grid = stage.grid
        VGroup(stage.group, *stars.values(), start_tag).shift(WORLD_SHIFT)
        arrows = stage.add_arrows()
        agent = stage.agent
        agent.mouth.become(agent.make_mouth("happy"))
        V, known, learned_policy, _, _ = after_discovery(grid, final_policy(grid))
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

        # "We've treated rewards as properties of the environment: one is worth ten, another is worth
        # five."  Each number rises into view on its word.
        self.next_section("worth ten")
        num_ten = MathTex("10", font_size=84, color=DOPAMINE).move_to(TEN_POS + 1.25 * UP)
        num_five = MathTex("5", font_size=84, color=DOPAMINE).move_to(FIVE_POS + 1.1 * UP)
        self.at(T_TEN)
        self.play(FadeIn(num_ten, shift=0.35 * UP), ten_halo.animate(rate_func=there_and_back).scale(1.25), run_time=0.6)
        self.at(T_FIVE)
        self.play(FadeIn(num_five, shift=0.35 * UP), five_halo.animate(rate_func=there_and_back).scale(1.25), run_time=0.6)

        # "But is a reward always worth the same?"  A question mark hangs beside each number.
        self.next_section("always worth the same")
        doubts = VGroup(MathTex("?", font_size=84, color=INK).next_to(num_ten, RIGHT, buff=0.3),
                        MathTex("?", font_size=84, color=INK).next_to(num_five, RIGHT, buff=0.3))
        self.at(T_SAME + 0.6)
        self.play(LaggedStart(*[FadeIn(d, scale=1.6) for d in doubts], lag_ratio=0.3), dim(ten_halo, 0.6),
                  dim(five_halo, 0.6), run_time=0.8)

        # "A glass of water is worth a lot when you're thirsty. Less when you've already had enough to
        # drink. And when you've had too much, another glass can even feel unpleasant."
        # The maze comes back as a faint backdrop; three agents stand beside the same glass, and each
        # face is already in its state, and moving, as it appears.
        self.next_section("water")
        trios = {}
        for kind, x in zip(("thirsty", "satisfied", "overfull"), (-4.6, 0.0, 4.6)):
            who = Agent(radius=0.6).move_to([x - 0.65, 0.0, 0]).show_mood(kind)
            glass = water_glass(height=1.0).move_to([x + 0.75, -0.1, 0])
            value = MathTex(WATER_VALUES[kind], font_size=44, color=VALUE_COLORS[kind]).next_to(glass, UP, buff=0.3)
            label = Text(kind, font_size=24, color=MUTED).next_to(who, DOWN, buff=0.35)
            trios[kind] = VGroup(who, glass, value, label)
        self.at(T_THIRSTY - 1.4)
        self.play(FadeOut(num_ten, doubts, ten_star, ten_halo, five_star, num_five, five_halo),
                  world.animate.scale(1 / 1.6, about_point=pivot).set_opacity(0.05), run_time=1)
        for kind, cue in (("thirsty", T_THIRSTY), ("satisfied", T_ENOUGH), ("overfull", T_TOO_MUCH)):
            who, glass, value, label = trios[kind]
            self.at(cue)
            self.play(FadeIn(who, glass, label, shift=0.2 * UP), run_time=0.6)
            who.idle()  # moving from the moment it is there
            self.play(FadeIn(value, scale=1.4), run_time=0.5)

        # "The glass hasn't changed."  The faint maze stays as it is; the three glasses are circled.
        self.next_section("hasn't changed")
        self.at(T_GLASS)
        self.play(*[Circumscribe(t[1], color=INK, buff=0.1) for t in trios.values()], run_time=0.9)

        # "...The agent has."
        self.next_section("the agent has")
        self.at(T_AGENT_HAS)
        self.play(*[t[0].animate(rate_func=there_and_back).scale(1.18) for t in trios.values()], run_time=0.7)

        # "So let's give the agent an internal state as well. This state changes over time, influences
        # how rewarding an action feels, and gives the agent something to regulate."
        # One agent stays: a new variable, H, goes into its brain, which lights up, and a gauge for it
        # appears beside it.
        self.next_section("internal state")
        one = trios["satisfied"][0]
        others = VGroup(*[trios[k] for k in ("thirsty", "overfull")], *trios["satisfied"][1:])
        self.at(T_INTERNAL)
        self.play(FadeOut(others, world), one.animate.scale(1.8).move_to(AGENT_POS), run_time=0.9)
        # "...an internal state..."
        brain, h_in_brain = brain_light(one)
        brain.set_fill(opacity=0)
        h_in_brain.set_fill(opacity=0)  # both switch on as H arrives
        new_h = MathTex("H", font_size=110, color=HOMEO).move_to(AGENT_POS + np.array([2.6, 1.2, 0]))
        self.play(one.set_mood("blank"), FadeIn(new_h, scale=1.5), run_time=0.5)
        self.add(brain, h_in_brain)
        gauge = Gauge(value=0.0, radius=1.5).move_to(GAUGE_POS)
        title = Text("internal state", font_size=30, color=HOMEO).next_to(gauge, UP, buff=0.45)
        self.play(absorb(new_h, one, (brain, h_in_brain), color=HOMEO, settle=0.35),
                  Succession(Wait(1.6), AnimationGroup(FadeIn(gauge, scale=0.9), FadeIn(title, shift=0.1 * DOWN))))
        # "This state changes over time..."
        self.at(T_CHANGES)
        self.play(gauge.value.animate.set_value(0.75), run_time=0.9)
        self.play(gauge.value.animate.set_value(0.25), run_time=0.8)
        # "...influences how rewarding an action feels..."  A glass beside the gauge: its worth follows H.
        glass = water_glass(height=0.9).move_to(GAUGE_POS + np.array([2.9, -0.4, 0]))
        glass_value = always_redraw(lambda: MathTex(f"{worth(gauge.value.get_value()):+.0f}", font_size=40,
                                                    color=DOPAMINE if worth(gauge.value.get_value()) >= 0 else HARM)
                                    .next_to(glass, UP, buff=0.25))
        self.at(T_INFLUENCES)
        self.play(FadeIn(glass, glass_value), run_time=0.4)
        self.play(gauge.value.animate.set_value(0.85), run_time=0.8)
        self.play(gauge.value.animate.set_value(0.1), run_time=0.8)
        # "...and gives the agent something to regulate."  The needle settles in the middle.
        self.at(T_REGULATE)
        self.play(gauge.value.animate.set_value(0.5), FadeOut(glass, glass_value), run_time=1.1)
        self.at(T_END)

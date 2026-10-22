"""Maths 05 — Rewards several steps away: the state-value function and discounting.

Narration: from "So far, we only considered the immediate rewards..."
to "...A gamma close to one means it values future rewards more."
Starts on Maths 04's last frame.
"""

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Create,
    FadeIn,
    FadeOut,
    FadeTransform,
    Indicate,
    LaggedStart,
    MathTex,
    Scene,
    Square,
    ValueTracker,
    VGroup,
    Write,
)

from common import (
    ACTIONS, CELL_5X5, DOPAMINE, GREEDY_TEX, MODEL, MUTED, REWARDS_5X5, START, WORLD_SHIFT, PolicyBox,
    big_world, dashed_trail, g_equation, g_gammas, g_rewards, gamma_slider, reward_block, sv_title, v_equation,
    value_field,
)

NEAR_GOAL = 6  # three squares from the 10 at s9, with s7 and s8 empty between
PATH_TO_TEN = [8, 7, 6]  # lit backwards from the reward towards the agent
# Two agents from the start: with a small gamma, the 5 three steps away; with a large gamma,
# the 10 six steps away. Valued as gamma^d * r: 5*0.1^3 = 0.005 > 10*0.1^6; 5*0.9^3 = 3.6 < 10*0.9^6 = 5.3.
LOW_GAMMA_PATH = ["right", "right", "up"]  # s21 -> s22 -> s23 -> s18 (5)
HIGH_GAMMA_PATH = ["up", "up", "up", "right", "right", "right"]  # s21 -> s16 -> s11 -> s6 -> s7 -> s8 -> s9 (10)


class Scene05StateValue(Scene):
    def walk(self, stage, actions, trail_color):
        """Take the actions, lighting each arrow, and leave a dashed trail of the path."""
        points = [stage.agent.get_center()]
        for action in actions:
            lands = stage.grid.step(stage.state, action) in REWARDS_5X5
            self.play(stage.light(action, color=DOPAMINE if lands else MODEL), run_time=0.15)
            self.play(stage.move(action, run_time=0.35))
            points.append(stage.grid.center_of(stage.state))
        self.play(stage.unlight(), run_time=0.15)
        return dashed_trail(points, trail_color)

    def construct(self):
        # Maths 04's last frame.
        stage, values, stars, start_tag = big_world()
        grid = stage.grid
        arrows = stage.add_arrows()
        block = reward_block()
        box = PolicyBox(GREEDY_TEX, font_size=30)
        self.add(stage.group, arrows, *values.values(), *stars.values(), start_tag, block, box)

        # "So far, we only considered the immediate rewards, but what if the reward is several
        # steps away and no action gives an immediate reward?"
        self.next_section("several steps away")
        world = VGroup(stage.group, arrows, *values.values(), *stars.values(), start_tag)
        self.play(world.animate.shift(WORLD_SHIFT), run_time=1)
        self.wait(0.6)
        self.play(stage.place(NEAR_GOAL))
        self.wait(1.8)
        # "...several steps away..."  The two empty squares between the agent and the 10.
        gap = VGroup(*[grid[s].copy().set_fill(opacity=0).set_stroke(DOPAMINE, width=4).set_z_index(4) for s in (7, 8)])
        self.play(LaggedStart(*[Create(g) for g in gap], lag_ratio=0.3), run_time=0.8)
        self.wait(1)
        # "...no action gives an immediate reward?"  Every arrow reads 0.
        zeros = stage.arrow_labels({a: "0" for a in ACTIONS}, font_size=28, colors={a: MUTED for a in ACTIONS})
        zero_group = VGroup(*zeros.values())
        stage.riders.add(zero_group)
        self.play(LaggedStart(*[FadeIn(z, scale=1.3) for z in zeros.values()], lag_ratio=0.1), FadeOut(gap), run_time=0.8)
        self.wait(1.9)

        # "Remember when I introduced the 'reward function' earlier?"
        self.next_section("state-value function")
        self.play(Indicate(block, color=DOPAMINE, scale_factor=1.1), run_time=1)
        self.wait(2.3)
        # "What we can do is we can give a 'value' to the non-reward states too."
        self.play(FadeOut(zero_group), run_time=0.4)
        stage.riders.remove(zero_group)
        self.wait(4.7)
        # "And this is done through the state-value function."
        title = sv_title(colored=False)
        self.play(FadeOut(block, shift=0.2 * UP), FadeIn(title, shift=0.2 * UP), run_time=0.7)
        self.play(title[:5].animate.set_color(MODEL), run_time=0.4)  # "state"
        self.play(title[6:11].animate.set_color(DOPAMINE), run_time=0.4)  # "value"
        self.wait(1.8)

        # "Intuitively, we know that some states are better than others, even without a reward on them."
        # The squares on the way to the 10 glow, from the reward back towards the agent.
        self.next_section("better states")
        glow = VGroup(*[
            Square(side_length=CELL_5X5, stroke_width=0, fill_color=DOPAMINE, fill_opacity=0.32 - 0.09 * i)
            .move_to(grid.center_of(s)).set_z_index(1)
            for i, s in enumerate(PATH_TO_TEN)
        ])
        self.wait(1.8)
        self.play(LaggedStart(*[FadeIn(g) for g in glow], lag_ratio=0.45), run_time=1.6)
        self.wait(2.4)

        # "The state-value function captures how good it is to be in a state, based on the
        # future return the agent can expect to receive."
        self.next_section("V")
        v_eq = v_equation(highlighted=False)
        self.wait(2)
        self.play(Write(v_eq), run_time=1.4)
        self.wait(3.6)
        self.play(v_eq[3].animate.set_color(DOPAMINE), run_time=0.5)
        self.wait(1.2)

        # "We'll use a discounted sum of rewards as our definition of future return."
        self.next_section("G")
        g_eq = g_equation()
        self.wait(1.3)
        self.play(FadeTransform(v_eq[3].copy(), g_eq[0]), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(p, shift=0.1 * LEFT) for p in g_eq[1:]], lag_ratio=0.08), run_time=1.4)
        self.wait(1.2)

        # "Each R is a reward at a future time step, and gamma is a discount factor between zero and one."
        # Each reward lights up in turn, each a little smaller than the last; then the gammas go bold.
        self.next_section("gamma")
        rewards_r = g_rewards(g_eq)
        self.wait(0.8)
        for k, r in enumerate(rewards_r):
            self.play(r.animate.set_color(DOPAMINE).scale(1 - 0.12 * k), run_time=0.45)
        self.wait(0.6)
        gammas = g_gammas(g_eq)
        self.play(gammas.animate.set_color(MODEL).set_stroke(MODEL, width=1.2), Indicate(gammas, color=MODEL), run_time=0.8)
        # "...between zero and one."  A slider for gamma, with the weight each future reward gets.
        gamma = ValueTracker(0.0)
        line, gamma_label, knob, readout, weight_labels, bars = gamma_slider(gamma)
        # The hand-drawn path glow gives way to the full value field, which follows the slider:
        # at gamma 0 only the rewards themselves glow; as gamma grows the glow spreads, the 10's
        # further than the 5's.
        field = value_field(grid, gamma)
        self.play(FadeIn(line, gamma_label, knob, readout, weight_labels, bars), FadeOut(glow), FadeIn(field), run_time=0.7)
        self.play(gamma.animate.set_value(1.0), run_time=2)
        self.wait(0.6)

        # "A gamma close to zero means the agent cares mostly about immediate rewards."
        # From the start, a low-gamma agent heads for the nearby 5: only the rewards' surroundings glow.
        self.next_section("low gamma")
        self.play(gamma.animate.set_value(0.1), stage.place(START, run_time=0.8), run_time=0.8)
        # The tag rides on the agent's upper-right diagonal, clear of all four arrows.
        tag_offset = CELL_5X5 * (0.4 * UP + 0.68 * RIGHT)
        tag = MathTex(r"\gamma = 0.1", font_size=24, color=MODEL).move_to(stage.agent.get_center() + tag_offset).set_z_index(11)
        stage.riders.add(tag)
        self.play(FadeIn(tag, shift=0.1 * DOWN), run_time=0.3)
        self.wait(0.8)
        low_trail = self.walk(stage, LOW_GAMMA_PATH, MODEL)
        self.play(Create(low_trail), stars[18].collect(), run_time=0.6)

        # "A gamma close to one means it values future rewards more."
        # Back to the start; a high-gamma agent takes the longer path to the 10.
        self.next_section("high gamma")
        self.play(gamma.animate.set_value(0.9), stage.place(START, run_time=0.8), run_time=0.8)
        new_tag = MathTex(r"\gamma = 0.9", font_size=24, color=DOPAMINE).move_to(stage.agent.get_center() + tag_offset).set_z_index(11)
        self.play(FadeTransform(tag, new_tag), run_time=0.3)
        stage.riders.remove(tag)
        stage.riders.add(new_tag)
        high_trail = self.walk(stage, HIGH_GAMMA_PATH, DOPAMINE)
        self.play(Create(high_trail), stars[9].collect(), run_time=0.6)
        self.wait(1)

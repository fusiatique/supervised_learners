"""Maths 06 — The Bellman equation.

Narration: from "Now every state can have a value. But how do we calculate it?" to "So value spreads
backwards from the reward, to every state."  Starts on Maths 05's last frame.
"""

from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    FadeIn,
    FadeOut,
    FadeTransform,
    Indicate,
    LaggedStart,
    MathTex,
    MovingCameraScene,
    Rectangle,
    Text,
    ValueTracker,
    VGroup,
    config,
)

from common import (
    BG, CELL_5X5, COL_X, DOPAMINE, GREEDY_TEX, INK, MODEL, WORLD_SHIFT, PolicyBox, big_world, dashed_trail,
    discounted_value, g_equation, gamma_slider, glow_square, policy_arrow, style_g_equation, sv_title, v_equation,
    value_field, value_tex,
)

GAMMA = 0.9
LOW_TRAIL = [21, 22, 23, 18]
HIGH_TRAIL = [21, 16, 11, 6, 7, 8, 9]
GOAL, EXAMPLE = 9, 8  # the 10, and the state just before it
# Back along the gamma = 0.9 agent's path: (state, the action the policy takes there).
BACKWARDS = [(7, "right"), (6, "right"), (11, "up"), (16, "up"), (21, "up")]

# Narration cues (seconds from the start), at about 145 words per minute.
T_HOW = 3.2  # "But how do we calculate it?"
T_BELLMAN = 6.9  # "With the Bellman equation:
T_VALUE = 8.9  # ...a state's value is
T_REWARD = 10.5  # ...the reward for leaving it,
T_NEXT = 12.6  # ...plus the discounted value of the state you end up in."
T_EXAMPLE = 18.3  # "Say a step gives no reward,
T_TEN = 20.8  # ...but leads to a state worth ten.
T_DISCOUNT = 24.0  # With a discount of 0.9,
T_NINE = 27.9  # ...this state is worth nine."
T_SPREADS = 30.2  # "So value spreads backwards from the reward,
T_EVERY = 33.0  # ...to every state."
T_END = 36.4


def bellman_idea():
    """The right column at the end of Maths 06: the heading and the idea in words."""
    heading = Text("the Bellman equation", font_size=34, color=MODEL).move_to([COL_X, 2.9, 0])
    idea = VGroup(
        MathTex(r"\text{value}(s)", "=", font_size=36, color=INK),
        MathTex(r"\text{reward for leaving } s", font_size=36, color=DOPAMINE),
        MathTex(r"+\ \gamma \cdot \text{value}(\text{next state})", font_size=36, color=INK),
    ).arrange(DOWN, buff=0.3).move_to([COL_X, 1.3, 0])
    idea[0][0].set_color(MODEL)
    return heading, idea


def valued_world(s=EXAMPLE):
    """The 5x5 world with every state valued and glowing at gamma = 0.9 (Maths 06's end).
    Returns (stage, stars, start_tag, glows, values); the stage is shifted into place."""
    stage, _, stars, start_tag = big_world(s=s)
    stage.add_arrows()
    VGroup(stage.group, stage.arrows, *stars.values(), start_tag).shift(WORLD_SHIFT)
    grid = stage.grid
    V = {x: discounted_value(x, GAMMA, grid) for x in range(1, 26)}
    glows = {x: glow_square(grid, x, V[x]) for x in V}
    values = {x: value_tex(V[x], grid, x) for x in V}
    return stage, stars, start_tag, glows, values


class Scene06Bellman(MovingCameraScene):
    def at(self, t):
        """Wait until t seconds into the scene (a no-op if that time has passed)."""
        if t - self.time >= 1 / config.frame_rate:
            self.wait(t - self.time)

    def construct(self):
        frame = self.camera.frame
        # Maths 05's last frame.
        stage, r_values, stars, start_tag = big_world(s=GOAL)
        grid = stage.grid
        arrows = stage.add_arrows()
        VGroup(stage.group, arrows, *r_values.values(), *stars.values(), start_tag).shift(WORLD_SHIFT)
        tag = MathTex(r"\gamma = 0.9", font_size=24, color=DOPAMINE).set_z_index(11).move_to(
            stage.agent.get_center() + CELL_5X5 * (0.4 * UP + 0.68 * RIGHT))
        stage.riders.add(tag)
        trails = VGroup(dashed_trail([grid.center_of(s) for s in LOW_TRAIL], MODEL),
                        dashed_trail([grid.center_of(s) for s in HIGH_TRAIL], DOPAMINE))
        gamma = ValueTracker(GAMMA)
        field = value_field(grid, gamma)
        title, v_eq, g_eq = sv_title(), v_equation(), style_g_equation(g_equation())
        slider = VGroup(*gamma_slider(gamma))
        box = PolicyBox(GREEDY_TEX, font_size=30)
        self.add(stage.group, arrows, *r_values.values(), *stars.values(), start_tag, tag, trails, field,
                 title, v_eq, g_eq, slider, box)

        # "Now every state can have a value."  The trails and slider go; the glowing field stays.
        self.next_section("every state")
        self.play(FadeOut(trails, tag, slider, g_eq, *r_values.values()), run_time=0.8)
        stage.riders.remove(tag)

        # "But how do we calculate it?"
        question = MathTex("?", font_size=40, color=DOPAMINE).next_to(v_eq[1], RIGHT, buff=0.25)
        self.at(T_HOW)
        self.play(FadeOut(v_eq[2:], shift=0.2 * DOWN), FadeIn(question, scale=1.6), run_time=0.6)

        # "With the Bellman equation: a state's value is the reward for leaving it, plus the discounted
        # value of the state you end up in."  The idea builds in words as it is said.
        self.next_section("idea")
        heading, idea = bellman_idea()
        self.at(T_BELLMAN)
        self.play(FadeOut(title, v_eq[:2], question), FadeIn(heading, shift=0.1 * DOWN), run_time=0.8)
        self.at(T_VALUE)
        self.play(FadeIn(idea[0], shift=0.1 * DOWN), run_time=0.6)
        self.at(T_REWARD)
        self.play(FadeIn(idea[1], shift=0.1 * DOWN), run_time=0.6)
        self.at(T_NEXT)
        self.play(FadeIn(idea[2], shift=0.1 * DOWN), run_time=0.6)

        # "Say a step gives no reward, but leads to a state worth ten. With a discount of 0.9, this
        # state is worth nine."  The camera closes in on the row before the 10; the agent steps back to s8.
        self.next_section("example")
        row_center = grid.center_of(EXAMPLE)
        self.at(T_EXAMPLE - 1.0)
        self.play(
            FadeOut(field),
            frame.animate.set(width=7.4).move_to(row_center + 0.6 * UP),
            stage.place(EXAMPLE, run_time=1.2),
            run_time=1.2,
        )
        # In the cell's lower-left corner, clear of the agent's four arrows.
        r_label = MathTex("r = 0", font_size=22, color=DOPAMINE).move_to(
            row_center + 0.3 * grid.cell * (LEFT + DOWN)).set_z_index(12)
        v_goal = MathTex("V = 10", font_size=24, color=DOPAMINE).move_to(grid.center_of(GOAL) + 0.4 * grid.cell * DOWN).set_z_index(12)
        calc = MathTex("V(s_8)", "=", "0", "+", "0.9", r"\,(10)", "=", "9", font_size=40, color=INK)
        calc.move_to(row_center + 1.45 * UP + 0.6 * RIGHT).set_z_index(12)
        # A dark panel behind the calculation so it reads cleanly over the row of cells above.
        calc_panel = Rectangle(width=calc.width + 0.5, height=calc.height + 0.35, stroke_width=0,
                               fill_color=BG, fill_opacity=0.92).move_to(calc).set_z_index(11)
        calc[0].set_color(MODEL)
        calc[2].set_color(DOPAMINE)
        calc[4].set_color(MODEL)
        calc[5].set_color(DOPAMINE)
        calc[7].set_color(DOPAMINE)
        # "...no reward..."
        self.at(T_EXAMPLE + 0.8)
        self.play(stage.light("right", color=DOPAMINE), FadeIn(r_label, scale=1.3), run_time=0.6)
        # "...a state worth ten."
        self.at(T_TEN + 1.2)
        self.play(FadeIn(v_goal, scale=1.3), Indicate(stars[GOAL], color=DOPAMINE), run_time=0.7)
        # "With a discount of 0.9..."
        self.at(T_DISCOUNT)
        self.play(FadeIn(calc_panel), FadeIn(calc[0], calc[1]), run_time=0.5)
        self.play(FadeTransform(r_label.copy(), calc[2]), run_time=0.5)
        self.play(FadeIn(calc[3], calc[4]), run_time=0.5)
        self.play(FadeTransform(v_goal.copy(), calc[5]), FadeIn(calc[6]), run_time=0.6)
        # "...worth nine."
        self.at(T_NINE)
        self.play(FadeIn(calc[7], scale=1.8), run_time=0.4)

        # "So value spreads backwards from the reward, to every state."  The 9 settles on its state; back
        # along the agent's path each state is worth 0.9 of the next, as the camera pulls out; then every
        # other state fills in, outwards from the rewards.
        self.next_section("spreads")
        nine = value_tex(9, grid, EXAMPLE)
        goal_value = value_tex(10, grid, GOAL)
        self.at(T_SPREADS)
        self.play(FadeTransform(calc[7].copy(), nine), FadeTransform(v_goal, goal_value),
                  FadeIn(glow_square(grid, EXAMPLE, 9), glow_square(grid, GOAL, 10)), FadeOut(r_label), run_time=0.8)
        self.add(nine, goal_value)
        self.play(stage.unlight(), FadeOut(calc, calc_panel),
                  frame.animate(run_time=2.2).set(width=config.frame_width).move_to(ORIGIN), run_time=0.5)
        path_marks = VGroup()
        value = 9.0
        for s, action in BACKWARDS:
            value *= GAMMA
            mark = policy_arrow(grid, s, action)
            path_marks.add(mark)
            self.play(FadeIn(glow_square(grid, s, value)), FadeIn(value_tex(value, grid, s), shift=0.15 * LEFT),
                      FadeIn(mark), run_time=0.3)
        # "...to every state."
        others = [s for s in range(1, 26) if s not in (EXAMPLE, GOAL) and s not in [b for b, _ in BACKWARDS]]
        others.sort(key=lambda s: -discounted_value(s, GAMMA, grid))  # fill outward from the rewards
        fills = [VGroup(glow_square(grid, s, discounted_value(s, GAMMA, grid)),
                        value_tex(discounted_value(s, GAMMA, grid), grid, s)) for s in others]
        self.at(T_EVERY)
        self.play(FadeOut(path_marks), LaggedStart(*[FadeIn(f) for f in fills], lag_ratio=0.12), run_time=2.4)
        self.at(T_END)

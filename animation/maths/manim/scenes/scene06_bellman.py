"""Maths 06 — The Bellman equation.

Narration: from "Now every state can have a value. But how do we calculate it? The Bellman Equation."
to "...the rewards, and the values of those next states."
Starts on Maths 05's last frame.
"""

from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    Circumscribe,
    FadeIn,
    FadeOut,
    FadeTransform,
    Flash,
    Indicate,
    LaggedStart,
    MathTex,
    MovingCameraScene,
    Rectangle,
    Text,
    ValueTracker,
    VGroup,
    Write,
    config,
    rate_functions,
)

from common import (
    BG, CELL_5X5, COL_X, DOPAMINE, GREEDY_TEX, INK, MODEL, MUTED, WORLD_SHIFT, PolicyBox, big_world, dashed_trail,
    discounted_value, g_equation, gamma_slider, glow_square, policy_arrow, style_g_equation, sv_title, v_equation,
    value_field, value_tex,
)

GAMMA = 0.9
LOW_TRAIL = [21, 22, 23, 18]
HIGH_TRAIL = [21, 16, 11, 6, 7, 8, 9]
GOAL, EXAMPLE = 9, 8  # the 10, and the state just before it
# Back along the gamma = 0.9 agent's path: (state, the action the policy takes there).
BACKWARDS = [(7, "right"), (6, "right"), (11, "up"), (16, "up"), (21, "up")]

class Scene06Bellman(MovingCameraScene):
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
        self.wait(2)

        # "But how do we calculate it?"
        question = MathTex("?", font_size=40, color=DOPAMINE).next_to(v_eq[1], RIGHT, buff=0.25)
        self.play(FadeOut(v_eq[2:], shift=0.2 * DOWN), FadeIn(question, scale=1.6), run_time=0.6)
        self.wait(1)

        # "The Bellman Equation."  Everything dims; the title writes in with a burst and a slow push-in.
        self.next_section("the bellman equation")
        dim = Rectangle(width=config.frame_width * 1.2, height=config.frame_height * 1.2, stroke_width=0,
                        fill_color=BG, fill_opacity=0.88).set_z_index(30)
        bellman = Text("The Bellman Equation", font_size=76, color=INK, weight="BOLD").set_z_index(32)
        halo = VGroup(*[
            bellman.copy().set_fill(opacity=0).set_stroke(MODEL, width=w, opacity=0.12).set_z_index(31)
            for w in (6, 12, 20)
        ])
        self.play(FadeIn(dim), run_time=0.6)
        self.play(
            Write(bellman, run_time=1.6),
            FadeIn(halo, run_time=1.6),
            frame.animate(run_time=3.2, rate_func=rate_functions.ease_out_sine).scale(0.94),
            Flash(ORIGIN, color=MODEL, num_lines=28, line_length=1.2, flash_radius=3.6, run_time=1.2),
        )
        self.wait(0.6)

        # "The central idea behind the Bellman equation is defining the value of a state is equal to
        # the reward we receive from leaving that state, plus the discounted value of the state we end up in."
        self.next_section("central idea")
        heading = Text("the Bellman equation", font_size=34, color=MODEL).move_to([COL_X, 2.9, 0])
        self.play(
            FadeOut(dim, halo), frame.animate.scale(1 / 0.94),
            FadeTransform(bellman, heading),
            FadeOut(title, v_eq[:2], question),
            run_time=1,
        )
        idea = VGroup(
            MathTex(r"\text{value}(s)", "=", font_size=36, color=INK),
            MathTex(r"\text{reward for leaving } s", font_size=36, color=DOPAMINE),
            MathTex(r"+\ \gamma \cdot \text{value}(\text{next state})", font_size=36, color=INK),
        ).arrange(DOWN, buff=0.3).move_to([COL_X, 1.3, 0])
        idea[0][0].set_color(MODEL)
        self.wait(2.8)
        # "...the value of a state..."
        self.play(FadeIn(idea[0], shift=0.1 * DOWN), run_time=0.6)
        self.wait(2.3)
        # "...the reward we receive from leaving that state..."
        self.play(FadeIn(idea[1], shift=0.1 * DOWN), run_time=0.6)
        self.wait(2.3)
        # "...plus the discounted value of the state we end up in."
        self.play(FadeIn(idea[2], shift=0.1 * DOWN), run_time=0.6)
        self.wait(2.2)

        # "Say moving from our state gives no immediate reward, but leads to a state with a value of 10.
        # With a discount factor of 0.9, our current state's value would be..."
        # The camera closes in on the row before the 10; the agent steps back to s8.
        self.next_section("example")
        row_center = grid.center_of(EXAMPLE)
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
        self.wait(1)
        # "...no immediate reward..."
        self.play(stage.light("right", color=DOPAMINE), FadeIn(r_label, scale=1.3), run_time=0.6)
        self.wait(1.5)
        # "...leads to a state with a value of 10."
        self.play(FadeIn(v_goal, scale=1.3), Indicate(stars[GOAL], color=DOPAMINE), run_time=0.7)
        self.wait(1.5)
        # "With a discount factor of 0.9, our current state's value would be..."
        self.play(FadeIn(calc_panel), FadeIn(calc[0], calc[1]), run_time=0.5)
        self.play(FadeTransform(r_label.copy(), calc[2]), run_time=0.5)
        self.play(FadeIn(calc[3], calc[4]), run_time=0.5)
        self.play(FadeTransform(v_goal.copy(), calc[5]), FadeIn(calc[6]), run_time=0.6)
        self.wait(1.1)

        # "Nine."
        self.next_section("nine")
        self.play(FadeIn(calc[7], scale=1.8), run_time=0.4)
        self.wait(0.3)

        # "So even without a reward, this state is valuable because it leads towards one."
        nine = value_tex(9, grid, EXAMPLE)
        goal_value = value_tex(10, grid, GOAL)
        self.play(FadeTransform(calc[7].copy(), nine), FadeTransform(v_goal, goal_value),
                  FadeIn(glow_square(grid, EXAMPLE, 9), glow_square(grid, GOAL, 10)), FadeOut(r_label), run_time=0.9)
        self.add(nine, goal_value)
        self.wait(3.9)

        # "This way, the value of a reward propagates backwards through the environment."
        # Back along the agent's path, each state is worth 0.9 of the next; the camera pulls out.
        self.next_section("propagate")
        self.play(stage.unlight(), FadeOut(calc, calc_panel), frame.animate(run_time=2.6).set(width=config.frame_width).move_to(ORIGIN),
                  run_time=0.5)
        path_values = VGroup()
        policy_marks = VGroup()
        value = 9.0
        for s, action in BACKWARDS:
            value *= GAMMA
            label, glow, mark = value_tex(value, grid, s), glow_square(grid, s, value), policy_arrow(grid, s, action)
            path_values.add(label)
            policy_marks.add(mark)
            self.play(FadeIn(glow), FadeIn(label, shift=0.15 * LEFT), FadeIn(mark), run_time=0.4)
        self.wait(1.9)

        # "For a deterministic environment following a fixed policy, the Bellman equation is:"
        self.next_section("equation")
        bellman_eq = MathTex(r"V^\pi(s)", "=", "r(s, a, s')", "+", r"\gamma", r"V^\pi(s')", font_size=46, color=INK)
        bellman_eq.move_to([COL_X, 1.3, 0])
        where = MathTex(r"\text{where } a = \pi(s)", font_size=32, color=MUTED).next_to(bellman_eq, DOWN, buff=0.35)
        self.wait(2.4)
        self.play(FadeTransform(idea, bellman_eq), run_time=1)
        self.play(FadeIn(where, shift=0.1 * UP), run_time=0.5)
        self.wait(0.6)

        # "Vπ(s) is the value of state s under policy π, r is the immediate reward, and s' is the next state."
        # Each symbol lights as it is named; the policy box and its arrows in the grid show the chosen actions.
        self.next_section("symbols")
        self.play(bellman_eq[0].animate.set_color(MODEL), Circumscribe(bellman_eq[0], color=MODEL), run_time=0.8)
        self.play(Indicate(box, color=MODEL, scale_factor=1.05), Indicate(policy_marks, color=MODEL), run_time=0.9)
        self.wait(1.4)
        self.play(bellman_eq[2].animate.set_color(DOPAMINE), Circumscribe(bellman_eq[2], color=DOPAMINE), run_time=0.8)
        self.wait(1.3)
        self.play(bellman_eq[5].animate.set_color(MODEL), Circumscribe(bellman_eq[5], color=MODEL), run_time=0.8)
        self.wait(0.9)

        # "This is called the Bellman expectation equation."
        self.next_section("expectation")
        label = Text("Bellman expectation equation:", font_size=28, color=MUTED).next_to(bellman_eq, UP, buff=0.4)
        self.play(FadeIn(label, shift=0.1 * DOWN), FadeOut(heading), run_time=0.6)
        self.wait(2.3)

        # "A state's value depends on the policy's actions, the next states, the rewards, and the values
        # of those next states."  The equation is applied everywhere: every state gets its value.
        self.next_section("everywhere")
        others = [s for s in range(1, 26) if s not in (EXAMPLE, GOAL) and s not in [b for b, _ in BACKWARDS]]
        others.sort(key=lambda s: -discounted_value(s, GAMMA, grid))  # fill outward from the rewards
        fills = []
        for s in others:
            v = discounted_value(s, GAMMA, grid)
            fills.append(VGroup(glow_square(grid, s, v), value_tex(v, grid, s)))
        self.play(Indicate(bellman_eq, color=DOPAMINE, scale_factor=1.05), run_time=0.8)
        self.play(FadeOut(policy_marks), LaggedStart(*[FadeIn(f) for f in fills], lag_ratio=0.12), run_time=4.5)
        self.wait(1.5)

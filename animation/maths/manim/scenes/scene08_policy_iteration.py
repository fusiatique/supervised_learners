"""Maths 08 — Policy iteration and the Bellman optimality equation.

Narration: from "Now, there is one final step." to "...one that systematically improves
its behaviour."  Starts on Maths 07's last frame.

The iterations are real and run on the narration: iteration 1 (the random policy's values,
then improvement) on "We improved our policy using the state values", iteration 2 on
"So we recalculate... and improve the policy again", and iterations 3 and 4 on each
"And again." Iteration 4 changes nothing, so the policy is optimal.
"""

import random

from manim import (
    DOWN,
    LEFT,
    PI,
    RIGHT,
    UP,
    ArcBetweenPoints,
    Circumscribe,
    CurvedArrow,
    Dot,
    FadeIn,
    FadeOut,
    Indicate,
    LaggedStart,
    MathTex,
    MovingCameraScene,
    MoveAlongPath,
    RoundedRectangle,
    Text,
    Transform,
    VGroup,
    Write,
)

from common import (
    ACTIONS, BG, CELL, COL_X, DOPAMINE, HIGHLIGHT, INK, MODEL, MUTED, REWARDS_5X5, START, TIE_ORDER, WORLD_SHIFT,
    PolicyBox, absorb, bellman_expectation, big_world, dashed_trail, discounted_value, evaluate_policy, field_opacity,
    glow_square, improve_policy, policy_arrow, policy_route, value_tex,
)

GAMMA = 0.9
EXAMPLE = 8  # where Maths 07 leaves the agent
ARGMAX_TEX = r"\pi(s) = \arg\max_a Q^\pi(s, a)"
OLD_S8 = "up"  # Maths 07 never drew s8's old (random) arrow: the agent stood on it
LOOP_Y = 0.85  # centre line of the evaluation / improvement loop in the right column
ROW_Y = -0.55  # first row of the iteration history, under the loop
ROW_GAP = 0.32
ROW_COLUMNS = (COL_X - 2.75, COL_X - 1.05, COL_X + 1.4)  # left edges: iteration, route, states changed

# Narration cues (seconds from the start), at about 165 words per minute.
T_IMPROVED = 2.7  # "We improved our policy using the state values,
T_OLD = 6.0  # ...but those values are from the old policy."
T_INACCURATE = 10.8  # "Once the policy changes, the values may no longer be accurate."
T_RECALC = 14.2  # "So we recalculate the values with the new policy,
T_AGAIN_POLICY = 16.6  # ...and improve the policy again."
T_AGAIN_1 = 19.4  # "And again."
T_AGAIN_2 = 22.4  # "And again."
T_PI = 25.2  # "This is policy iteration."
T_REPEAT = 27.3  # "We then repeat this
T_OPTIMAL = 29.4  # ...until we reach an optimal policy."
T_MATH = 31.6  # "Mathematically, an optimal policy satisfies:"
T_OPTIMALITY = 34.4  # "This is the Bellman optimality equation expressed as a policy choice.
T_MAXIMISES = 41.3  # ...It tells us to pick the action that maximises
T_IMMEDIATE = 41.8  # ...immediate reward
T_DISCOUNTED = 42.8  # ...plus discounted future value."
T_JUST = 44.8  # "And just like that, we have gone from a random agent to one that systematically
T_ABSORB = 48.4  # ...improves its behaviour."
T_END = 52.5


def value_label(v, grid, s):
    """A state's value in its corner: amber when it is worth something, faint for 0."""
    return value_tex(v, grid, s).set_color(DOPAMINE if v > 0 else MUTED)


def loop_box(title, tex, x):
    """One stage of the policy-iteration loop: a rounded box with a title and a formula."""
    frame = RoundedRectangle(corner_radius=0.15, width=2.85, height=1.15, stroke_color=MODEL, stroke_width=2,
                             fill_color=BG, fill_opacity=0.9)
    label = Text(title, font_size=20, color=INK)
    formula = MathTex(tex, font_size=28, color=MUTED)
    VGroup(label, formula).arrange(DOWN, buff=0.14).move_to(frame)
    return VGroup(frame, label, formula).move_to([x, LOOP_Y, 0])


def history_row(k, reached, changed):
    """One line of the iteration history: where the route from the start goes, and how many
    states the improvement step changed."""
    route = f"reaches the {REWARDS_5X5[reached]}" if reached else "loops, no reward"
    parts = VGroup(
        Text(f"Iteration {k}", font_size=20, color=INK),
        Text(route, font_size=20, color=DOPAMINE if reached else MUTED),
        Text(f"{changed} states changed" if changed else "no change", font_size=20,
             color=MUTED if changed else MODEL),
    )
    y = ROW_Y - (k - 1) * ROW_GAP
    for part, x in zip(parts, ROW_COLUMNS):
        part.move_to([x, y, 0], aligned_edge=LEFT)
    return parts


class Scene08PolicyIteration(MovingCameraScene):
    def at(self, t):
        """Wait until t seconds into the scene (a no-op if that time has passed)."""
        if t > self.time:
            self.wait(t - self.time)

    def construct(self):
        # Maths 07's last frame.
        stage, r_values, stars, start_tag = big_world(s=EXAMPLE)
        grid = stage.grid
        arrows = stage.add_arrows()
        VGroup(stage.group, arrows, *stars.values(), start_tag).shift(WORLD_SHIFT)
        V_star = {s: discounted_value(s, GAMMA, grid) for s in range(1, 26)}
        glows = {s: glow_square(grid, s, V_star[s]) for s in V_star}
        values = {s: value_tex(V_star[s], grid, s) for s in V_star}
        _, bellman_eq, _ = bellman_expectation()
        bellman_eq.scale(0.62).move_to([COL_X, 3.05, 0])
        q_eq = MathTex(r"Q^\pi(s, a)", "=", "r(s, a, s')", "+", r"\gamma", r"V^\pi(s')", font_size=44, color=INK)
        q_eq.move_to([COL_X, 0.55, 0])
        q_eq[0].set_color(MODEL)
        q_eq[2].set_color(DOPAMINE)
        q_eq[5].set_color(DOPAMINE)
        q_title = Text("action-value function", font_size=28, color=MODEL).next_to(q_eq, UP, buff=0.3)
        argmax = MathTex(r"\pi_{\text{new}}(s)", "=", r"\arg\max_a", r"Q^\pi(s, a)", font_size=44, color=INK)
        argmax.move_to([COL_X, -0.75, 0])
        argmax[0].set_color(MODEL)
        argmax[3][0].set_color(MODEL)
        meaning = Text("choose the action with the highest Q", font_size=22, color=MUTED).next_to(argmax, DOWN, buff=0.25)
        improvement = Text("policy improvement", font_size=32, color=MODEL).move_to([COL_X, 2.0, 0])
        box = PolicyBox(ARGMAX_TEX, font_size=32)

        cells = [s for s in range(1, 26) if s not in REWARDS_5X5]
        others = [s for s in cells if s != EXAMPLE]
        rng = random.Random(7)  # the same seed and order as Maths 07's old policy
        old_policy = {s: rng.choice(list(ACTIONS)) for s in others}
        old_policy[EXAMPLE] = OLD_S8

        def greedy(s):
            return max(TIE_ORDER, key=lambda a: (GAMMA * V_star[grid.step(s, a)], -TIE_ORDER.index(a)))

        improved = {s: greedy(s) for s in others}  # Maths 07's improved policy
        policy_arrows = {s: policy_arrow(grid, s, improved[s]) for s in others}
        no_reward_tex = MathTex("r = 0", font_size=24, color=DOPAMINE)
        no_reward = VGroup(
            RoundedRectangle(corner_radius=0.08, width=no_reward_tex.width + 0.18, height=no_reward_tex.height + 0.14,
                             stroke_width=0, fill_color=BG, fill_opacity=0.88),
            no_reward_tex,
        ).move_to(grid.center_of(7) + 0.28 * grid.cell * (LEFT + UP)).set_z_index(12)
        stage.arrow["right"].set_color(MODEL)
        self.add(stage.group, arrows, *stars.values(), start_tag, *glows.values(), *values.values(), bellman_eq,
                 q_title, q_eq, argmax, meaning, improvement, box, *policy_arrows.values(), no_reward)
        body = stage.agent

        # The loop, history and route caption, shared by the iterations below.
        eval_box = loop_box("1. Policy evaluation", r"V^\pi(s)", COL_X - 1.5)
        improve_box = loop_box("2. Policy improvement", r"\pi \leftarrow \arg\max_a Q^\pi", COL_X + 1.5)
        top_path = ArcBetweenPoints(eval_box.get_top() + 0.08 * UP, improve_box.get_top() + 0.08 * UP, angle=-PI / 2)
        bottom_path = ArcBetweenPoints(improve_box.get_bottom() + 0.08 * DOWN, eval_box.get_bottom() + 0.08 * DOWN,
                                       angle=-PI / 2)
        top_arrow = CurvedArrow(top_path.get_start(), top_path.get_end(), angle=-PI / 2, color=MUTED, stroke_width=3)
        bottom_arrow = CurvedArrow(bottom_path.get_start(), bottom_path.get_end(), angle=-PI / 2, color=MUTED,
                                   stroke_width=3)
        dot = Dot(top_path.get_start(), radius=0.08, color=DOPAMINE).set_z_index(20)
        caption = Text("starting again from a random policy", font_size=24, color=MUTED).move_to(
            [grid.get_x(), -3.45, 0])
        policy, rows, trail, reached = dict(old_policy), [], None, None

        def evaluate(round_loop=True, run_time=0.8):
            """Step one: V^pi of the current policy into every cell, and the route from the start.
            round_loop moves the dot back round the loop to evaluation."""
            nonlocal trail, reached
            V = evaluate_policy(policy, grid, GAMMA)
            anims = [Transform(values[s], value_label(V[s], grid, s)) for s in cells]
            anims += [glows[s].animate.set_fill(opacity=field_opacity(V[s])) for s in cells]
            if round_loop:
                anims += [MoveAlongPath(dot, bottom_path), Indicate(eval_box, color=MODEL, scale_factor=1.06)]
            self.play(*anims, run_time=run_time)
            path, reached = policy_route(policy, START, grid)
            new_trail = dashed_trail([grid.center_of(s) for s in path], DOPAMINE if reached else MUTED)
            if reached:
                text = f"from the start: reaches the {REWARDS_5X5[reached]} in {len(path) - 1} steps"
            else:
                text = "from the start: never reaches a reward"
            new_caption = Text(text, font_size=24, color=DOPAMINE if reached else MUTED).move_to(caption)
            self.play(*([FadeOut(trail)] if trail else []), FadeIn(new_trail), Transform(caption, new_caption),
                      run_time=0.5)
            trail = new_trail
            return V

        def improve(V, round_loop=True, run_time=0.8):
            """Step two: swing every arrow whose state has a strictly better action; log the iteration.
            round_loop moves the dot along the loop to improvement."""
            nonlocal policy
            new = improve_policy(policy, V, grid, GAMMA)
            changed = [s for s in cells if new[s] != policy[s]]
            policy = new
            row = history_row(len(rows) + 1, reached, len(changed))
            rows.append(row)
            anims = [FadeIn(row, shift=0.1 * UP)]
            if changed:
                anims.append(LaggedStart(*[Transform(policy_arrows[s], policy_arrow(grid, s, policy[s]))
                                           for s in changed], lag_ratio=0.06))
            if round_loop:
                anims += [MoveAlongPath(dot, top_path), Indicate(improve_box, color=MODEL, scale_factor=1.06)]
            self.play(*anims, run_time=run_time)

        # "Now, there is one final step."  The right column clears and the grid goes back to
        # Maths 07's random policy, whose values are evaluated: every state is worth 0.
        self.next_section("final step")
        policy_arrows[EXAMPLE] = policy_arrow(grid, EXAMPLE, OLD_S8, color=MUTED)
        self.play(FadeOut(q_title, q_eq, argmax, meaning, improvement, no_reward, arrows),
                  FadeOut(body, scale=0.6), grid[EXAMPLE].animate.set_fill(CELL), run_time=0.6)
        stage.arrows = VGroup()
        self.play(*[Transform(policy_arrows[s], policy_arrow(grid, s, old_policy[s], color=MUTED)) for s in others],
                  FadeIn(policy_arrows[EXAMPLE]), FadeIn(caption, shift=0.1 * UP), run_time=0.9)
        V = evaluate(round_loop=False)

        # "We improved our policy using the state values,
        self.next_section("iteration 1")
        self.at(T_IMPROVED)
        self.play(Indicate(box, color=MODEL, scale_factor=1.05), run_time=0.6)
        improve(V, round_loop=False, run_time=1.0)
        # ...but those values are from the old policy."
        self.at(T_OLD)
        old_tag = Text("these values came from the old policy", font_size=22, color=MUTED).move_to(
            [grid.get_x(), 3.45, 0])
        self.play(FadeIn(old_tag, shift=0.1 * DOWN),
                  LaggedStart(*[Indicate(values[s], color=MUTED, scale_factor=1.4) for s in cells], lag_ratio=0.03),
                  run_time=1.2)

        # "Once the policy changes, the values may no longer be accurate."
        self.at(T_INACCURATE)
        self.play(FadeOut(old_tag),
                  LaggedStart(*[Transform(values[s], MathTex("?", font_size=28, color=MUTED).move_to(values[s])
                                          .set_z_index(6)) for s in cells], lag_ratio=0.04),
                  run_time=1.3)

        # "So we recalculate the values with the new policy,
        self.next_section("iteration 2")
        self.at(T_RECALC)
        self.play(FadeIn(eval_box, scale=0.9), FadeIn(dot, scale=0.5), run_time=0.5)
        V = evaluate(round_loop=False)
        # ...and improve the policy again."
        self.at(T_AGAIN_POLICY)
        self.play(FadeIn(improve_box, scale=0.9), FadeIn(top_arrow), run_time=0.5)
        improve(V)
        self.play(FadeIn(bottom_arrow), run_time=0.4)

        # "And again."
        self.next_section("iteration 3")
        self.at(T_AGAIN_1)
        improve(evaluate())
        # "And again."
        self.next_section("iteration 4")
        self.at(T_AGAIN_2)
        improve(evaluate())

        # "This is policy iteration."
        self.next_section("policy iteration")
        self.at(T_PI)
        title = Text("policy iteration", font_size=30, color=MODEL).move_to([COL_X, 2.35, 0])
        self.play(FadeIn(title, shift=0.1 * DOWN), run_time=0.6)

        # "We then repeat this until we reach an optimal policy."
        self.next_section("optimal")
        self.at(T_REPEAT)
        self.play(LaggedStart(*[Indicate(row, color=INK, scale_factor=1.06) for row in rows], lag_ratio=0.3),
                  run_time=1.4)
        self.at(T_OPTIMAL)
        optimal = Text("optimal policy", font_size=26, color=MODEL).move_to(
            [COL_X, ROW_Y - len(rows) * ROW_GAP - 0.12, 0])
        self.play(*[policy_arrows[s].animate.set_color(MODEL) for s in cells], FadeIn(optimal, scale=1.2),
                  Circumscribe(rows[-1], color=MODEL, buff=0.06), FadeOut(dot), run_time=1.0)

        # "Mathematically, an optimal policy satisfies:"
        self.next_section("optimality")
        self.at(T_MATH)
        opt_eq = MathTex(r"\pi^*(s)", "=", r"\arg\max_a", r"\big[", "r(s, a, s')", "+", r"\gamma", r"V^*(s')", r"\big]",
                         font_size=40, color=INK).move_to([COL_X, -1.4, 0])
        opt_eq[0].set_color(MODEL)
        opt_eq[4].set_color(DOPAMINE)
        opt_eq[7].set_color(MODEL)
        self.play(FadeOut(*rows, optimal, shift=0.1 * UP), run_time=0.5)
        self.play(Write(opt_eq), run_time=1.4)
        # "This is the Bellman optimality equation expressed as a policy choice.
        self.at(T_OPTIMALITY)
        opt_label = Text("Bellman optimality equation:", font_size=24, color=MUTED).next_to(opt_eq, UP, buff=0.3)
        self.play(FadeIn(opt_label, shift=0.1 * DOWN), run_time=0.6)
        # ...It tells us to pick the action that maximises immediate reward plus discounted future value."
        self.at(T_MAXIMISES)
        self.play(Indicate(opt_eq[2], color=DOPAMINE, scale_factor=1.15), run_time=0.5)
        self.at(T_IMMEDIATE)
        self.play(Circumscribe(opt_eq[4], color=DOPAMINE, buff=0.06), run_time=0.9)
        self.at(T_DISCOUNTED)
        self.play(Circumscribe(VGroup(opt_eq[6], opt_eq[7]), color=MODEL, buff=0.06), run_time=0.9)

        # "And just like that, we have gone from a random agent to one that systematically improves
        # its behaviour."  The agent takes the optimal route; the camera pushes in and the
        # equations go into its brain, leaving the final policy around it.
        self.next_section("into the brain")
        self.at(T_JUST)
        self.play(FadeOut(trail, caption), run_time=0.4)
        body.move_to(grid.center_of(START))
        stage.state = START
        self.play(FadeIn(body, scale=0.6), grid[START].animate.set_fill(HIGHLIGHT), run_time=0.4)
        route, goal = policy_route(policy, START, grid)
        for s, s2 in zip(route, route[1:]):
            action = next(a for a in ACTIONS if grid.step(s, a) == s2)
            self.play(stage.move(action, run_time=0.32))
        agent = stage.agent
        self.play(stars[goal].collect(), Transform(agent.mouth, agent.make_mouth("happy")), run_time=0.6)
        self.at(T_ABSORB)
        frame = self.camera.frame
        self.play(frame.animate.scale(0.5).move_to(agent.get_center() + 0.6 * DOWN + 0.5 * LEFT),
                  LaggedStart(*[absorb(m, agent) for m in (opt_eq, opt_label, bellman_eq,
                                                          VGroup(eval_box, improve_box, top_arrow, bottom_arrow), title)],
                              lag_ratio=0.15),
                  run_time=2.4)
        self.remove(opt_eq, opt_label, bellman_eq, eval_box, improve_box, top_arrow, bottom_arrow, title)
        self.play(agent.blink())
        self.at(T_END)

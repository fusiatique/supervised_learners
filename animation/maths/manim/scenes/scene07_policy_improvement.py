"""Maths 07 — The action-value function and policy improvement.

Narration: from "Now we can evaluate how good a state is under a policy."
to "...This is precisely why the state-value function matters."
Starts on Maths 06's last frame.
"""

import random

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Circumscribe,
    RoundedRectangle,
    FadeIn,
    FadeOut,
    FadeTransform,
    Indicate,
    LaggedStart,
    MathTex,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
)

from common import (
    ACTIONS, BG, CELL, COL_X, DOPAMINE, GREEDY_TEX, HIGHLIGHT, INK, MODEL, MUTED, REWARDS_5X5, START, WORLD_SHIFT,
    PolicyBox, bellman_expectation, big_world, discounted_value, glow_square, policy_arrow, value_tex,
)

GAMMA = 0.9
EXAMPLE = 8  # the state before the 10, where the agent ends Maths 06
ARGMAX_TEX = r"\pi(s) = \arg\max_a Q^\pi(s, a)"
# The current (reward-greedy) policy, followed for a few steps: from s8 the 10 is next door;
# after the reset it wanders (every neighbour is 0) until the 5 is next door.
GREEDY_RUN_1 = ["right"]  # s8 -> s9 (10)
GREEDY_RUN_2 = ["up", "right", "right"]  # s21 -> s16 -> s17 -> s18 (5)
TIE_ORDER = ["up", "right", "left", "down"]  # how ties are broken when choosing the arg max


def fmt(v):
    return f"{v:.0f}" if abs(v - round(v)) < 1e-9 else f"{v:.1f}"


def pill(tex, point, color=DOPAMINE):
    """A small label on a dark pill, so it reads cleanly over a cell's own number and glow."""
    label = MathTex(tex, font_size=24, color=color)
    back = RoundedRectangle(corner_radius=0.08, width=label.width + 0.18, height=label.height + 0.14,
                            stroke_width=0, fill_color=BG, fill_opacity=0.88)
    return VGroup(back, label).move_to(point).set_z_index(12)


def action_pills(grid, s, texts):
    """One pill per action, inside the cell the action leads to, nudged off the arrow
    (right of the vertical arrows, above the horizontal ones) and clear of that cell's value."""
    c = grid.center_of(s)
    return {
        a: pill(texts[a], c + d * grid.cell + 0.36 * grid.cell * (RIGHT if d[0] == 0 else UP))
        for a, d in ACTIONS.items()
    }


class Scene07PolicyImprovement(Scene):
    def walk(self, stage, actions, stars):
        for action in actions:
            lands = stage.grid.step(stage.state, action) in REWARDS_5X5
            self.play(stage.light(action, color=DOPAMINE if lands else MODEL), run_time=0.15)
            self.play(stage.move(action, run_time=0.35))
        self.play(stage.unlight(), stars[stage.state].collect(), run_time=0.5)

    def construct(self):
        # Maths 06's last frame.
        stage, r_values, stars, start_tag = big_world(s=EXAMPLE)
        grid = stage.grid
        arrows = stage.add_arrows()
        VGroup(stage.group, arrows, *stars.values(), start_tag).shift(WORLD_SHIFT)
        V = {s: discounted_value(s, GAMMA, grid) for s in range(1, 26)}
        glows = VGroup(*[glow_square(grid, s, V[s]) for s in V])
        values = {s: value_tex(V[s], grid, s) for s in V}
        label, bellman_eq, where = bellman_expectation()
        box = PolicyBox(GREEDY_TEX, font_size=30)
        self.add(stage.group, arrows, *stars.values(), start_tag, glows, *values.values(), label, bellman_eq, where, box)

        def q(s, a):
            """Q(s, a) = r(s, a, s') + gamma V(s'): no reward for leaving an ordinary state."""
            return GAMMA * V[grid.step(s, a)]

        # "Now we can evaluate how good a state is under a policy."
        self.next_section("evaluate")
        self.play(Indicate(bellman_eq, color=MODEL, scale_factor=1.05), run_time=0.9)
        self.wait(3.1)

        # "But remember, our ultimate goal is to make our agent behave intelligently. So we need to
        # utilise these values."  The current policy flashes; the agent follows it, ignoring the values.
        self.next_section("current policy")
        self.play(Indicate(box, color=MODEL, scale_factor=1.06), run_time=0.8)
        self.walk(stage, GREEDY_RUN_1, stars)
        body = VGroup(stage.agent, arrows)
        self.play(FadeOut(body, scale=0.6), grid[stage.state].animate.set_fill(CELL), run_time=0.35)
        body.shift(grid.center_of(START) - stage.agent.get_center())
        stage.state = START
        self.play(FadeIn(body, scale=0.6), grid[START].animate.set_fill(HIGHLIGHT), run_time=0.35)
        self.walk(stage, GREEDY_RUN_2, stars)
        self.wait(1.5)

        # "Suppose we've calculated the value of every state in the maze."
        self.next_section("suppose")
        self.play(stage.place(EXAMPLE, run_time=1),
                  LaggedStart(*[Indicate(v, color=DOPAMINE, scale_factor=1.4) for v in values.values()], lag_ratio=0.03),
                  run_time=1.6)
        self.wait(2)

        # "For every action, we ask two questions."
        self.next_section("two questions")
        compact = bellman_eq.copy().scale(0.62).move_to([COL_X, 3.05, 0])
        self.play(FadeOut(label, where), Transform(bellman_eq, compact), run_time=0.7)
        self.wait(1.6)
        # "First, what immediate reward does it give?"
        q1 = Text("1.  What immediate reward does it give?", font_size=24, color=INK).move_to([COL_X, 2.25, 0])
        q2 = Text("2.  How valuable is the state it takes us to?", font_size=24, color=INK).move_to([COL_X, 1.75, 0])
        VGroup(q1, q2).align_to(q2, LEFT)
        q1[2:].set_color(INK)
        rewards_r = action_pills(grid, EXAMPLE, {a: "r = 0" for a in ACTIONS})
        self.play(FadeIn(q1, shift=0.1 * DOWN), run_time=0.5)
        self.play(LaggedStart(*[FadeIn(l, scale=1.3) for l in rewards_r.values()], lag_ratio=0.1), run_time=0.7)
        self.wait(1.3)
        # "Second, how valuable is the state it takes us to?"
        neighbours = [grid.step(EXAMPLE, a) for a in ACTIONS]
        self.play(FadeIn(q2, shift=0.1 * DOWN), run_time=0.5)
        self.play(LaggedStart(*[Circumscribe(values[s], color=DOPAMINE, buff=0.06) for s in neighbours], lag_ratio=0.15),
                  run_time=1.4)
        self.wait(1.3)

        # "For our deterministic environment, combining these gives us:"
        self.next_section("Q")
        q_eq = MathTex(r"Q^\pi(s, a)", "=", "r(s, a, s')", "+", r"\gamma", r"V^\pi(s')", font_size=44, color=INK)
        q_eq.move_to([COL_X, 0.55, 0])
        q_eq[0].set_color(MODEL)
        q_eq[2].set_color(DOPAMINE)
        q_eq[5].set_color(DOPAMINE)
        self.wait(1)
        self.play(Write(q_eq), run_time=1.3)
        self.wait(0.6)

        # "This is the action-value function. It tells us how good a particular action is in a particular
        # state, assuming we follow our current policy. It works like the state-value function, but for an action."
        self.next_section("action-value")
        q_title = Text("action-value function", font_size=28, color=MODEL).next_to(q_eq, UP, buff=0.3)
        self.play(FadeIn(q_title, shift=0.1 * DOWN), run_time=0.6)
        self.wait(1.8)
        # "...how good a particular action is in a particular state..."  Each arrow's r becomes its Q.
        q_values = {a: q(EXAMPLE, a) for a in ACTIONS}
        best = max(q_values, key=q_values.get)
        q_labels = action_pills(grid, EXAMPLE, {a: f"Q = {fmt(v)}" for a, v in q_values.items()})
        self.wait(0.8)
        self.play(*[FadeTransform(rewards_r[a], q_labels[a]) for a in ACTIONS], run_time=0.9)
        self.wait(4.6)
        # "It works like the state-value function, but for an action."
        self.play(Indicate(bellman_eq, color=MODEL, scale_factor=1.08), Indicate(q_eq[0], color=MODEL), run_time=1)
        self.wait(3.3)

        # "In this example, right has the highest value. So we update our policy to choose right whenever
        # the agent finds itself in this state."
        self.next_section("choose right")
        self.wait(0.8)
        self.play(stage.light(best, color=DOPAMINE), Indicate(q_labels[best], color=DOPAMINE, scale_factor=1.4), run_time=0.8)
        self.wait(3)
        # "...update our policy to choose right..."
        self.play(Circumscribe(grid[EXAMPLE], color=MODEL, buff=0), run_time=1)
        self.wait(3.1)

        # "More generally:"
        self.next_section("arg max")
        argmax = MathTex(r"\pi_{\text{new}}(s)", "=", r"\arg\max_a", r"Q^\pi(s, a)", font_size=44, color=INK)
        argmax.move_to([COL_X, -0.75, 0])
        argmax[0].set_color(MODEL)
        argmax[3][0].set_color(MODEL)
        self.play(Write(argmax), run_time=1.2)
        self.wait(1.6)
        # "Arg max simply means: choose the action with the highest value."
        meaning = Text("choose the action with the highest Q", font_size=22, color=MUTED).next_to(argmax, DOWN, buff=0.25)
        self.play(Indicate(argmax[2], color=DOPAMINE, scale_factor=1.15), FadeIn(meaning, shift=0.1 * UP), run_time=0.9)
        self.wait(2)
        # The new policy replaces the old one in the box.
        self.play(box.swap(ARGMAX_TEX, font_size=32), run_time=0.9)
        self.wait(0.8)

        # "Doing this for every state gives a new policy that is at least as good as the old one.
        # This process is called policy improvement."
        # The old policy (a random arrow in every state) swings, state by state, to the arg max.
        self.next_section("improve")
        self.play(stage.unlight(), FadeOut(*q_labels.values()), run_time=0.5)
        cells = [s for s in range(1, 26) if s not in REWARDS_5X5 and s != EXAMPLE]
        rng = random.Random(7)
        old = {s: policy_arrow(grid, s, rng.choice(list(ACTIONS)), color=MUTED) for s in cells}
        new_action = {s: max(TIE_ORDER, key=lambda a: (q(s, a), -TIE_ORDER.index(a))) for s in cells}
        new = {s: policy_arrow(grid, s, new_action[s]) for s in cells}
        self.play(LaggedStart(*[FadeIn(old[s]) for s in cells], lag_ratio=0.03), run_time=1)
        self.wait(0.6)
        order = sorted(cells, key=lambda s: -V[s])  # the wave starts next to the rewards
        self.play(LaggedStart(*[Transform(old[s], new[s]) for s in order], lag_ratio=0.08), run_time=3)
        self.play(stage.light(best, color=MODEL), run_time=0.4)
        self.wait(0.8)
        # "This process is called policy improvement."
        improvement = Text("policy improvement", font_size=32, color=MODEL).move_to([COL_X, 2.0, 0])
        self.play(FadeOut(q1, q2), FadeIn(improvement, shift=0.1 * DOWN), run_time=0.7)
        self.wait(1.4)

        # "Notice that the agent can now choose an action with no immediate reward if it leads to a more
        # valuable state. This is precisely why the state-value function matters."
        # s7's arrow points right: no reward for the step, but it leads to s8, worth 9.
        self.next_section("why values matter")
        focus = 7
        self.wait(1.6)
        no_reward = pill("r = 0", grid.center_of(focus) + 0.28 * grid.cell * (LEFT + UP))
        self.play(Circumscribe(grid[focus], color=MODEL, buff=0), Indicate(old[focus], color=MODEL, scale_factor=1.4),
                  FadeIn(no_reward, scale=1.3), run_time=1.2)
        self.wait(0.8)
        self.play(Circumscribe(values[EXAMPLE], color=DOPAMINE, buff=0.06), Indicate(values[EXAMPLE], color=DOPAMINE),
                  run_time=1)
        self.wait(2.5)
        # "This is precisely why the state-value function matters."
        self.play(Indicate(bellman_eq, color=DOPAMINE, scale_factor=1.1),
                  LaggedStart(*[Indicate(v, color=DOPAMINE, scale_factor=1.3) for v in values.values()], lag_ratio=0.02),
                  run_time=1.6)
        self.wait(1.5)

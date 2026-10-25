"""Maths 10 — Learning from experience: Q-learning, and the end of the RL part.

Narration: from "So far we assumed the agent knows the whole maze." to "...evaluate possible
futures, and keep improving."  Starts on Maths 09's last frame.
"""

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    PI,
    UP,
    Brace,
    FadeIn,
    FadeOut,
    Indicate,
    LaggedStart,
    MathTex,
    NumberLine,
    RoundedRectangle,
    Scene,
    Text,
    Transform,
    Triangle,
    ValueTracker,
    VGroup,
    Write,
    always_redraw,
    there_and_back,
)

from common import (
    ACTIONS, BG, COL_X, DOPAMINE, INK, MODEL, MUTED, WORLD_SHIFT, PacedScene, PolicyBox, Reward, big_world,
    dashed_trail, glow_square, policy_arrow, policy_route, value_tex,
)
from scene09_exploration import (
    EGREEDY_TEX, GAMMA, GOAL, HIDDEN, HIDDEN_REWARD, JUNCTION, REWARDS_ALL, after_discovery, epsilon_controls,
    epsilon_heading, fog_cell, glow_opacity, maths08_policy,
)

ALPHA = 0.5
HERE = 19  # where Maths 09 leaves the agent, just above the 20
TITLE_Y = 2.95
LINE_Y = 1.75  # the estimate / target number line
EQ_Y = 0.25


def q_pill(tex, point, color=DOPAMINE):
    """A small label on a dark pill, so it reads cleanly over a cell."""
    label = MathTex(tex, font_size=24, color=color)
    back = RoundedRectangle(corner_radius=0.08, width=label.width + 0.18, height=label.height + 0.14,
                            stroke_width=0, fill_color=BG, fill_opacity=0.9)
    return VGroup(back, label).move_to(point).set_z_index(12)


def action_pills(grid, s, texts):
    """One pill per action, inside the cell the action leads to, nudged off the arrow."""
    c = grid.center_of(s)
    return {a: q_pill(texts[a], c + d * grid.cell + 0.4 * grid.cell * (RIGHT if d[0] == 0 else UP))
            for a, d in ACTIONS.items()}


def fmt(v):
    return f"{v:.0f}" if abs(v - round(v)) < 1e-9 else f"{v:.1f}"


class Scene10QLearning(PacedScene, Scene):
    """Paced like Maths 09: every animation runs 35% slower than written. Each narration line keeps
    its full time: slow-down not absorbed by a line's own pauses lengthens that line, not the next."""

    REPAY_ACROSS_SECTIONS = False

    def construct(self):
        # Maths 09's last frame.
        stage, _, stars, start_tag = big_world(s=HERE)
        grid = stage.grid
        VGroup(stage.group, *stars.values(), start_tag).shift(WORLD_SHIFT)
        arrows = stage.add_arrows()
        policy = maths08_policy(grid)
        V, known, learned_policy, _, _ = after_discovery(grid, policy)
        glows = {s: glow_square(grid, s, V[s]).set_fill(opacity=glow_opacity(V[s]))
                 for s in known + [GOAL, 18, HIDDEN]}
        values = {s: value_tex(V[s], grid, s) for s in known + [GOAL, 18, HIDDEN]}
        cell_arrows = {s: policy_arrow(grid, s, learned_policy[s]) for s in known if s != HERE}
        twenty = Reward(size=0.4).set_z_index(5).move_to(grid.center_of(HIDDEN))
        stars[HIDDEN] = twenty
        fog = {25: fog_cell(grid, 25)}
        route, _ = policy_route(learned_policy | {HIDDEN: "up"}, JUNCTION, grid, rewards=REWARDS_ALL)
        trail = dashed_trail([grid.center_of(s) for s in route], DOPAMINE).set_z_index(9)
        eps_title, eps_rule = epsilon_heading()
        eps_controls = VGroup(*epsilon_controls(ValueTracker(0.1)))
        box = PolicyBox(EGREEDY_TEX, font_size=32)
        self.add(stage.group, arrows, *stars.values(), start_tag, *glows.values(), *values.values(),
                 *cell_arrows.values(), fog[25], trail, eps_title, eps_rule, eps_controls, box)

        # "So far we assumed the agent knows the whole maze. In practice, it doesn't; it learns
        # Q-values from experience."  Everything it knew goes, the maze greys out, and its four
        # actions start at Q = 0.
        self.next_section("unknown maze")
        self.play(FadeOut(eps_title, eps_rule, eps_controls, trail), run_time=0.6)
        self.play(LaggedStart(*[Indicate(v, color=DOPAMINE, scale_factor=1.3) for v in values.values()],
                              lag_ratio=0.02), run_time=1)
        self.wait(1)
        # "In practice, it doesn't..."
        for s in range(1, 26):
            if s not in fog and s != HERE:
                fog[s] = fog_cell(grid, s)
        self.play(FadeOut(*values.values(), *glows.values(), *cell_arrows.values()),
                  LaggedStart(*[FadeIn(fog[s]) for s in fog if s != 25], lag_ratio=0.03), run_time=1.2)
        # "...it learns Q-values from experience."
        title = Text("learning from experience", font_size=32, color=INK).move_to([COL_X, TITLE_Y, 0])
        pills = action_pills(grid, HERE, {a: "Q = 0" for a in ACTIONS})
        self.play(FadeIn(title, shift=0.1 * DOWN), LaggedStart(*[FadeIn(p, scale=1.2) for p in pills.values()],
                                                                 lag_ratio=0.1), run_time=0.9)
        self.wait(1.3)

        # "Each time it acts, it nudges its estimate towards what actually happened..."
        # It steps down into the unknown, finds the 20, and its estimate for that action moves halfway there.
        self.next_section("first nudge")
        line = NumberLine(x_range=[0, 20, 5], length=4.4, include_numbers=True, font_size=22, color=MUTED)
        line.move_to([COL_X, LINE_Y, 0])
        estimate = ValueTracker(0)
        target = ValueTracker(20)
        est_marker = always_redraw(lambda: Triangle(stroke_width=0, fill_color=MODEL, fill_opacity=1).scale(0.11)
                                   .rotate(PI).next_to(line.n2p(estimate.get_value()), UP, buff=0.05))
        est_label = always_redraw(lambda: Text("estimate", font_size=18, color=MODEL)
                                  .next_to(est_marker, UP, buff=0.08))
        tgt_marker = always_redraw(lambda: Triangle(stroke_width=0, fill_color=DOPAMINE, fill_opacity=1)
                                   .scale(0.11).next_to(line.n2p(target.get_value()), DOWN, buff=0.4))
        tgt_label = always_redraw(lambda: Text("what actually happened", font_size=18, color=DOPAMINE)
                                  .next_to(tgt_marker, DOWN, buff=0.08))
        self.wait(0.3)
        self.play(stage.light("down", color=MODEL), run_time=0.3)
        self.play(stage.move("down", run_time=0.4), FadeOut(fog.pop(HIDDEN), scale=1.1), run_time=0.4)
        reward_pill = q_pill("r = 20", grid.center_of(HIDDEN) + 0.4 * grid.cell * (LEFT + DOWN))
        self.play(twenty.collect(), FadeIn(reward_pill, scale=1.3), run_time=0.6)
        self.play(FadeIn(line, est_marker, est_label), run_time=0.5)
        self.play(FadeIn(tgt_marker, tgt_label), run_time=0.4)
        # Nudged halfway (alpha = 0.5): 0 -> 10.
        new_pill = q_pill("Q = 10", pills["down"].get_center())
        self.play(estimate.animate.set_value(10), Transform(pills["down"], new_pill), run_time=0.9)
        self.wait(0.3)

        # "...the reward plus the discounted value of where it landed."
        # Another try from s14: no reward this time, but where it lands (s19) is now worth up to 10,
        # so what actually happened is 0 + 0.9 x 10 = 9, and the estimate moves halfway, to 4.5.
        self.next_section("second nudge")
        self.play(FadeOut(reward_pill, *[p for a, p in pills.items() if a != "down"]), stage.unlight(),
                  FadeOut(fog.pop(JUNCTION), scale=1.1), stage.place(JUNCTION, run_time=0.7),
                  estimate.animate.set_value(0), run_time=0.7)
        second = action_pills(grid, JUNCTION, {a: "Q = 0" for a in ACTIONS})
        self.play(FadeIn(second["down"], scale=1.2), stage.light("down", color=MODEL), run_time=0.4)
        self.play(stage.move("down", run_time=0.4))
        landed = q_pill(r"\max Q = 10", grid.center_of(HERE) + 0.38 * grid.cell * (LEFT + DOWN), color=MODEL)
        self.play(FadeIn(landed, scale=1.2), Indicate(pills["down"], color=DOPAMINE, scale_factor=1.2), run_time=0.6)
        happened = q_pill(r"0 + 0.9 \times 10 = 9", [COL_X, LINE_Y - 1.05, 0])
        self.play(target.animate.set_value(9), FadeIn(happened, shift=0.1 * UP), run_time=0.8)
        self.play(estimate.animate.set_value(4.5),
                  Transform(second["down"], q_pill("Q = 4.5", second["down"].get_center())), run_time=0.9)
        self.wait(0.4)

        # "This is called Q-learning, and it's what our simulation uses."
        self.next_section("Q-learning")
        update = MathTex(r"Q(s,a)", r"\leftarrow", r"Q(s,a)", "+", r"\alpha", r"\big[", r"r + \gamma \max_{a'} Q(s',a')",
                         "-", r"Q(s,a)", r"\big]", font_size=32, color=INK).move_to([COL_X, EQ_Y, 0])
        update[0].set_color(MODEL)
        update[2].set_color(MODEL)
        update[4].set_color(MODEL)
        update[6].set_color(DOPAMINE)
        estimate_brace = Brace(update[2], DOWN, buff=0.08, color=MODEL)
        estimate_note = Text("estimate", font_size=18, color=MODEL).next_to(estimate_brace, DOWN, buff=0.06)
        target_brace = Brace(update[6], DOWN, buff=0.08, color=DOPAMINE)
        target_note = Text("what actually happened", font_size=18, color=DOPAMINE).next_to(target_brace, DOWN, buff=0.06)
        alpha_note = Text("α: how big a nudge", font_size=18, color=MODEL).next_to(update[4], UP, buff=0.35)
        q_title = Text("Q-learning", font_size=34, color=MODEL).move_to([COL_X, TITLE_Y, 0])
        sim_tag = Text("used in our simulation", font_size=20, color=MUTED).next_to(q_title, DOWN, buff=0.15)
        self.play(FadeOut(happened, landed, line, est_marker, est_label, tgt_marker, tgt_label), Transform(title, q_title),
                  Write(update), run_time=1.3)
        self.play(FadeIn(estimate_brace, estimate_note, target_brace, target_note, alpha_note), run_time=0.7)
        self.play(FadeIn(sim_tag, shift=0.1 * DOWN), run_time=0.5)
        self.wait(1)

        # "For the rest of this explanation, we'll focus on how the agent evaluates rewards. But keep in
        # mind that exploration can be an important part of learning."
        self.next_section("focus")
        self.play(FadeOut(estimate_brace, estimate_note, target_brace, target_note, alpha_note, sim_tag),
                  update.animate.scale(0.8).move_to([COL_X, 2.25, 0]), stage.unlight(), run_time=0.8)
        self.wait(1.3)
        # "...how the agent evaluates rewards."
        self.play(Indicate(twenty, color=DOPAMINE, scale_factor=1.4), Indicate(update[6], color=DOPAMINE),
                  run_time=1)
        self.wait(2.3)
        # "...exploration can be an important part of learning."
        # fog holds only the cells still unexplored: lifted ones were popped as the agent entered them.
        self.play(box.frame.animate(rate_func=there_and_back).scale(1.05).set_stroke(MODEL, width=5),
                  LaggedStart(*[f[0].animate(rate_func=there_and_back).set_stroke(MODEL, width=4) for f in fog.values()],
                              lag_ratio=0.02),
                  run_time=1.2)
        self.wait(1.6)

        # "Of course, this is a simplified model. But we've established something important. An agent can
        # learn to choose actions based on expected rewards, evaluate possible futures, and keep improving."
        # Enough experience fills in what it knows: the grey lifts on the learned values and policy,
        # the agent takes its route to the 20, and the three takeaways tick in.
        self.next_section("wrap up")
        learned = {s: VGroup(glows[s], values[s]) for s in glows}
        # s25 was never explored in Maths 09; once learned it is worth 0.9 x 20 and points to the 20.
        extra = VGroup(glow_square(grid, 25, V[25]).set_fill(opacity=glow_opacity(V[25])), value_tex(V[25], grid, 25),
                       policy_arrow(grid, 25, "left"))
        self.play(FadeOut(*pills.values(), *second.values(), update, title), run_time=0.6)
        self.wait(2.2)
        self.play(LaggedStart(*[FadeOut(f, scale=1.05) for f in fog.values()], lag_ratio=0.03),
                  LaggedStart(*[FadeIn(g) for g in learned.values()], lag_ratio=0.03),
                  FadeIn(*[a for s, a in cell_arrows.items() if s != stage.state], extra), run_time=1.6)
        takeaways = VGroup(*[
            VGroup(MathTex(r"\checkmark", font_size=34, color=DOPAMINE), Text(t, font_size=24, color=INK)).arrange(RIGHT, buff=0.2)
            for t in ("choose actions based on expected rewards", "evaluate possible futures", "keep improving")
        ]).arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to([COL_X, 1.4, 0])
        self.wait(1)
        # "...choose actions based on expected rewards..."
        self.play(FadeIn(takeaways[0], shift=0.15 * RIGHT), run_time=0.5)
        self.play(stage.light("down", color=DOPAMINE), run_time=0.3)
        self.play(stage.move("down", run_time=0.4))
        self.play(twenty.collect(), stage.unlight(),
                  Transform(stage.agent.mouth, stage.agent.make_mouth("happy")), run_time=0.6)
        # "...evaluate possible futures..."
        self.play(FadeIn(takeaways[1], shift=0.15 * RIGHT), run_time=0.5)
        self.wait(1)
        # "...and keep improving."
        self.play(FadeIn(takeaways[2], shift=0.15 * RIGHT), run_time=0.5)
        self.wait(1.3)

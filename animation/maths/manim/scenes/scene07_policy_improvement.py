"""Maths 07 — Choosing actions by their value.

Narration: from "Now let's use these values to choose actions." to "...and heads straight for the
reward."  Starts on Maths 06's last frame.
"""

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    FadeIn,
    FadeOut,
    Indicate,
    LaggedStart,
    MathTex,
    RoundedRectangle,
    Scene,
    Text,
    VGroup,
    Write,
    config,
)

from common import (
    ACTIONS, BG, COL_X, DOPAMINE, GREEDY_TEX, MODEL, MUTED, REWARDS_5X5, INK, PolicyBox, discounted_value,
    final_policy, policy_arrow,
)
from scene06_bellman import GAMMA, bellman_idea, valued_world

EXAMPLE, GOAL = 8, 9  # the agent starts on the state before the 10, and steps onto it
CHOOSE_TEX = r"\pi(s) = \text{action with the highest } Q(s, a)"

# Narration cues (seconds from the start), at about 145 words per minute.
T_ACTION = 4.5  # "The value of an action is
T_GIVES = 6.9  # ...the reward it gives,
T_LEADS = 8.6  # ...plus the discounted value of where it leads."
T_PICKS = 13.1  # "In every state, the agent simply picks the action with the highest value,
T_HEADS = 18.4  # ...and heads straight for the reward."
T_END = 22.4


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


def q_column():
    """The right column at the end of Maths 07: the Bellman idea (small, at the top), the action value
    Q(s, a) and the rule for choosing. Returns (idea, title, q_eq, rule)."""
    _, idea = bellman_idea()
    idea.scale(0.7).move_to([COL_X, 2.6, 0])
    q_eq = MathTex("Q(s, a)", "=", "r(s, a, s')", r"+\ \gamma V(s')", font_size=44, color=INK).move_to([COL_X, 0.55, 0])
    q_eq[0].set_color(MODEL)
    q_eq[2].set_color(DOPAMINE)
    title = Text("the value of an action", font_size=28, color=MODEL).next_to(q_eq, UP, buff=0.35)
    rule = Text("choose the action with the highest Q", font_size=24, color=MUTED).next_to(q_eq, DOWN, buff=0.4)
    return idea, title, q_eq, rule


def end_frame():
    """Everything on screen when Maths 07 ends, built in place: the agent smiling on the 10, every
    state valued with its best action, and the right column. Returns a dict of the pieces."""
    stage, stars, start_tag, glows, values = valued_world(s=GOAL)
    stage.agent.mouth.become(stage.agent.make_mouth("happy"))
    grid = stage.grid
    policy = final_policy(grid)
    idea, title, q_eq, rule = q_column()
    return {
        "stage": stage, "stars": stars, "start_tag": start_tag, "glows": glows, "values": values,
        "policy": policy, "arrows": {s: policy_arrow(grid, s, a) for s, a in policy.items()},
        "idea": idea, "title": title, "q_eq": q_eq, "rule": rule, "box": PolicyBox(CHOOSE_TEX, font_size=30),
    }


class Scene07PolicyImprovement(Scene):
    def at(self, t):
        """Wait until t seconds into the scene (a no-op if that time has passed)."""
        if t - self.time >= 1 / config.frame_rate:
            self.wait(t - self.time)

    def construct(self):
        # Maths 06's last frame.
        stage, stars, start_tag, glows, values = valued_world(s=EXAMPLE)
        grid = stage.grid
        heading, idea = bellman_idea()
        box = PolicyBox(GREEDY_TEX, font_size=30)
        self.add(stage.group, stage.arrows, *stars.values(), start_tag, *glows.values(), *values.values(),
                 heading, idea, box)

        # "Now let's use these values to choose actions."  The idea moves up out of the way; the values
        # pulse in a wave.
        self.next_section("choose actions")
        small_idea, title, q_eq, rule = q_column()
        cells = [s for s in range(1, 26) if s not in REWARDS_5X5]
        self.play(FadeOut(heading), idea.animate.become(small_idea), run_time=0.8)
        self.play(LaggedStart(*[Indicate(values[s], color=DOPAMINE, scale_factor=1.35) for s in cells],
                              lag_ratio=0.04), run_time=1.6)

        # "The value of an action is the reward it gives, plus the discounted value of where it leads."
        # Q(s, a) builds term by term; then each of the agent's four actions gets its Q.
        self.next_section("action value")
        self.at(T_ACTION)
        self.play(FadeIn(title, shift=0.1 * DOWN), Write(q_eq[:2]), run_time=0.7)
        self.at(T_GIVES)
        self.play(FadeIn(q_eq[2], shift=0.1 * LEFT), run_time=0.5)
        self.at(T_LEADS)
        self.play(FadeIn(q_eq[3], shift=0.1 * LEFT), run_time=0.6)
        V = {s: discounted_value(s, GAMMA, grid) for s in range(1, 26)}
        q = {a: GAMMA * V[grid.step(EXAMPLE, a)] for a in ACTIONS}
        pills = action_pills(grid, EXAMPLE, {a: f"Q = {fmt(v)}" for a, v in q.items()})
        self.play(LaggedStart(*[FadeIn(p, scale=1.2) for p in pills.values()], lag_ratio=0.15), run_time=1.0)

        # "In every state, the agent simply picks the action with the highest value..."  Here that is
        # right; the rule replaces the old one in the box, and every state gets its best action.
        self.next_section("highest value")
        best = max(q, key=q.get)
        policy = final_policy(grid)
        arrows = {s: policy_arrow(grid, s, a) for s, a in policy.items() if s != EXAMPLE}
        order = sorted(arrows, key=lambda s: -V[s])  # outwards from the rewards
        self.at(T_PICKS)
        self.play(stage.light(best, color=DOPAMINE), Indicate(pills[best], color=DOPAMINE, scale_factor=1.3),
                  FadeIn(rule, shift=0.1 * UP), run_time=0.8)
        self.play(box.swap(CHOOSE_TEX, font_size=30),
                  LaggedStart(*[FadeIn(arrows[s], scale=0.6) for s in order], lag_ratio=0.08), run_time=2.2)

        # "...and heads straight for the reward."  The agent steps onto the 10 and smiles; its own
        # state's arrow shows as it leaves.
        self.at(T_HEADS)
        agent = stage.agent
        self.play(FadeOut(*pills.values(), stage.arrows), run_time=0.4)
        stage.arrows = VGroup()
        self.play(stage.move(best, run_time=0.5), FadeIn(policy_arrow(grid, EXAMPLE, policy[EXAMPLE])))
        self.play(stars[GOAL].collect(), agent.mouth.animate.become(agent.make_mouth("happy")), run_time=0.6)
        self.at(T_END)

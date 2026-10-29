"""Maths 04 — The reward function, and a first greedy policy.

Narration: from "We need a way for the agent to know which state is good."
to "...reset the agent to the start state whenever it reaches a 'reward state'."
Starts on Maths 03's last frame.
"""

from manim import (
    DOWN,
    LEFT,
    UP,
    FadeIn,
    FadeOut,
    FadeTransform,
    GrowFromPoint,
    Indicate,
    LaggedStart,
    MathTex,
    Rectangle,
    ReplacementTransform,
    Scene,
    Text,
    Transform,
    VGroup,
    Write,
    config,
)

from common import (
    ACTIONS, BG, CELL, DOPAMINE, EQ_Y, GREEDY_TEX, HIGHLIGHT, INK, MODEL, MUTED, REWARDS_5X5, RIGHT_X, START, GridStage,
    PolicyBox, Reward, absorb, big_world, reward_rule, reward_title, reward_values,
)

QUARTER = r"\tfrac{1}{4}"
REWARDS_3X3 = {7: 10, 3: 5}
# One episode in the 5x5 grid under the greedy policy. Every step but the last is a tie
# (no neighbour holds a reward), so it is a random choice; from s17 the 5 is next door.
# s21 -> s16 -> s11 -> s12 -> s17 -> s18 (reward 5)
EPISODE = ["up", "up", "right", "down", "right"]


class Scene04RewardFunction(Scene):
    def walk(self, stage, actions, rewards):
        for action in actions:
            lands_on_reward = stage.grid.step(stage.state, action) in rewards
            self.play(stage.light(action, color=DOPAMINE if lands_on_reward else MODEL), run_time=0.2)
            self.play(stage.move(action, run_time=0.45))
        self.play(stage.unlight(), run_time=0.2)

    def construct(self):
        # Maths 03's last frame.
        stage = GridStage(s=8)
        stage.drop_panel()
        grid = stage.grid
        arrows = stage.add_arrows()
        quarters = VGroup(*stage.arrow_labels({a: QUARTER for a in ACTIONS}).values())
        stage.riders.add(quarters)
        ten = Reward().set_z_index(5).move_to(grid.center_of(7))
        box = PolicyBox(r"\pi(a \mid s) = " + QUARTER)
        dim = Rectangle(width=config.frame_width, height=config.frame_height, stroke_width=0,
                        fill_color=BG, fill_opacity=0.8).set_z_index(20)
        question = Text("?", font_size=380, color=INK).set_z_index(21)
        self.add(stage.group, arrows, quarters, ten, box, dim, question)

        # "We need a way for the agent to know which state is good."
        self.next_section("which state is good")
        self.play(FadeOut(dim), question.animate.scale(0.3).move_to([RIGHT_X, EQ_Y, 0]), run_time=1)
        self.wait(3.2)

        # "For now, this is the reward function."
        self.next_section("reward function")
        title = reward_title()
        self.wait(0.8)
        self.play(FadeTransform(question, title), run_time=0.8)
        self.wait(0.6)

        # "The idea is simple. If reward x exists in state sx, the reward is the value of the reward x."
        self.next_section("definition")
        values = reward_values(grid, REWARDS_3X3)
        five = Reward().set_z_index(5)
        self.wait(1.3)
        # "...if reward x exists in state sx..."
        self.play(five.drop_into(grid.center_of(3)))
        self.play(LaggedStart(*[FadeIn(values[s], scale=1.4) for s in REWARDS_3X3], lag_ratio=0.3), run_time=0.7)
        self.wait(1.2)
        # "...the reward is the value of the reward x."
        rule = reward_rule()
        self.play(title.animate.scale(30 / 46).move_to([RIGHT_X, EQ_Y + 0.6, 0]), Write(rule), run_time=1.2)
        self.wait(1.5)

        # "That's our reward function."  Every state gets its R(s).
        zeros = [values[s] for s in values if s not in REWARDS_3X3]
        self.play(LaggedStart(*[FadeIn(v, scale=1.4) for v in zeros], lag_ratio=0.1), run_time=1)
        self.wait(0.2)

        # "Now, we can add our first bit of intelligence: take the action that leads to the
        # highest reward state."
        self.next_section("greedy")
        reward_def = VGroup(title, rule)
        self.play(reward_def.animate.scale(0.7).move_to([RIGHT_X, 2.9, 0]), run_time=0.7)
        greedy = VGroup(
            MathTex(r"\pi(s) = \text{the action } a", font_size=42, color=INK),
            MathTex(r"\text{with the highest } R(f(s,a))", font_size=42, color=INK),
        ).arrange(DOWN, buff=0.2).move_to([RIGHT_X, 0.6, 0])
        greedy[0][0][:4].set_color(MODEL)
        self.wait(2.6)
        # "...take the action that leads to the highest reward state."
        self.play(Write(greedy[0]), run_time=0.9)
        self.play(Write(greedy[1]), run_time=0.9)
        self.wait(1.8)

        # "That's our agent's new 'policy'."
        new_policy = Text("new policy", font_size=30, color=MODEL).next_to(greedy, UP, buff=0.35)
        self.play(FadeIn(new_policy, shift=0.15 * DOWN), run_time=0.5)
        self.wait(0.9)

        # "If no action leads to a higher value, it chooses randomly, like before."
        tie = Text("if tied: choose at random", font_size=24, color=MUTED).next_to(greedy, DOWN, buff=0.3)
        self.play(FadeIn(tie, shift=0.1 * UP), run_time=0.5)
        self.wait(0.8)
        # The rule glides into the agent's brain, which lights up, and replaces the random policy in
        # the box; the 1/4s go with the old policy.
        thought = VGroup(new_policy, greedy, tie)
        self.play(absorb(thought, stage.agent), box.swap(GREEDY_TEX, font_size=30), FadeOut(quarters))
        stage.riders.remove(quarters)

        # "Now if the agent is next to a reward state, it will go towards that!"
        # Beside each arrow: the reward of the state it leads to. The 10 wins.
        self.next_section("next to a reward")
        next_r = {a: REWARDS_3X3.get(grid.step(stage.state, a), 0) for a in ACTIONS}
        r_labels = stage.arrow_labels(
            {a: str(v) for a, v in next_r.items()},
            colors={a: DOPAMINE if v else MUTED for a, v in next_r.items()},
        )
        r_group = VGroup(*r_labels.values())
        stage.riders.add(r_group)
        self.play(LaggedStart(*[FadeIn(l, scale=1.3) for l in r_labels.values()], lag_ratio=0.1), run_time=0.7)
        self.wait(1)
        best = max(next_r, key=next_r.get)
        self.play(stage.light(best, color=DOPAMINE), Indicate(r_labels[best], color=DOPAMINE, scale_factor=1.5),
                  run_time=0.7)
        self.play(stage.move(best, run_time=0.5))
        self.play(ten.collect(), Transform(stage.agent.mouth, stage.agent.make_mouth("happy")), run_time=0.6)
        self.wait(0.6)

        # "Now we can make the environment bigger..."
        self.next_section("bigger")
        big, big_values, big_rewards, start_tag = big_world()
        stage.riders.remove(r_group)
        old = VGroup(grid, stage.labels, arrows, r_group, ten, five, *values.values())
        self.play(FadeOut(old), ReplacementTransform(stage.agent, big.agent), run_time=0.8)
        self.play(
            LaggedStart(*[FadeIn(c, scale=0.85) for c in big.grid.cells], lag_ratio=0.02),
            FadeIn(big.labels),
            run_time=1,
        )
        self.play(
            LaggedStart(*[r.drop_into(r.get_center(), run_time=0.7) for r in big_rewards.values()], lag_ratio=0.2),
            LaggedStart(*[FadeIn(v) for v in big_values.values()], lag_ratio=0.02),
            FadeIn(start_tag),
            run_time=1,
        )
        big_arrows = big.add_arrows()
        center = big.agent.get_center()
        self.play(LaggedStart(*[GrowFromPoint(a, center) for a in big_arrows], lag_ratio=0.08, run_time=0.7))

        # "...and reset the agent to the start state whenever it reaches a 'reward state'."
        self.next_section("episode")
        self.walk(big, EPISODE, REWARDS_5X5)
        self.play(big_rewards[big.state].collect(), run_time=0.6)
        # Reset: the agent fades out on the reward and reappears at the start.
        body = VGroup(big.agent, big_arrows)
        self.play(FadeOut(body, scale=0.6), big.grid[big.state].animate.set_fill(CELL), run_time=0.4)
        body.shift(big.grid.center_of(START) - big.agent.get_center())
        big.state = START
        self.play(FadeIn(body, scale=0.6), big.grid[START].animate.set_fill(HIGHLIGHT),
                  Indicate(start_tag, color=INK, scale_factor=1.4), run_time=0.5)
        self.wait(0.8)

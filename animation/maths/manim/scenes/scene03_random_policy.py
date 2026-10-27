"""Maths 03 — A random policy, and why it cannot learn.

Narration: from "But how does the agent actually move?"
to "So how can we give it a better policy?"
Starts on Maths 02's last frame.
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
    GrowFromCenter,
    Indicate,
    LaggedStart,
    MathTex,
    Rectangle,
    Scene,
    Text,
    VGroup,
    Write,
    config,
    rate_functions,
)

from common import (
    ACTIONS, BG, CELL_3X3, EQ_Y, INK, MODEL, MUTED, RIGHT_X, STREAM_END, GridStage, PolicyBox, Reward,
    general_rule, place_rows, rule_heading, stream_dots, stream_rows,
)

REWARD_STATE = 7
# The "random" walk is scripted to tell the story: it wanders, sits right next to the reward
# without caring, stumbles onto it by chance, and wanders off again.
BEFORE_REWARD = ["up", "up", "left", "down", "down"]  # s6 -> s3 -> (bump) -> s2 -> s5 -> s8
AFTER_REWARD = ["up", "right", "left", "down", "left", "right"]  # s8 -> s5 -> s6 -> s5 -> s8 -> s7 (reward) -> s8
QUARTER = r"\tfrac{1}{4}"


class Scene03RandomPolicy(Scene):
    def walk(self, stage, actions, reward=None):
        """Light each chosen arrow, then take the action; burst the reward if the agent lands on it."""
        for action in actions:
            self.play(stage.light(action), run_time=0.2)
            self.play(stage.move(action, run_time=0.45))
            if reward is not None and stage.state == REWARD_STATE:
                self.play(reward.collect())
        self.play(stage.unlight(), run_time=0.2)

    def construct(self):
        # Maths 02's last frame.
        stage = GridStage(s=6)
        stage.drop_panel()
        arrows = stage.add_arrows()
        heading = rule_heading()
        rule = general_rule()
        rows = place_rows(stream_rows(stage.grid), STREAM_END)
        dots = stream_dots()
        self.add(stage.group, arrows, heading, rule, rows, dots)

        # "But how does the agent actually move?"
        self.next_section("how")
        self.play(FadeOut(rows, dots, heading, rule), run_time=0.6)
        # The arrows step aside; the agent shrugs, with a question mark beside its head.
        agent = stage.agent
        hands = agent.make_hands()
        puzzled = Text("?", font_size=72, color=INK).next_to(agent.head, UP, buff=0.2)
        self.play(
            FadeOut(arrows),
            LaggedStart(*[Create(h) for h in hands], lag_ratio=0.0),
            GrowFromCenter(puzzled, rate_func=rate_functions.ease_out_back),
            run_time=0.6,
        )
        self.play(agent.shrug(hands))
        self.wait(0.6)

        # "We give it a rule, the simplest being: choose a random action from a uniform distribution."
        self.next_section("random rule")
        policy_word = Text("policy", font_size=34, color=MODEL).move_to([RIGHT_X, EQ_Y + 0.75, 0])
        policy = MathTex(r"\pi(a \mid s)", "=", r"\frac{1}{|A|}", "=", r"\frac{1}{4}", font_size=60, color=INK)
        policy.move_to([RIGHT_X, EQ_Y - 0.2, 0])
        policy[0].set_color(MODEL)
        caption = Text("chance of choosing action a in state s", font_size=22, color=MUTED)
        caption.next_to(policy, DOWN, buff=0.35)
        # The shrug ends and the arrows come back.
        self.play(FadeOut(hands, puzzled), FadeIn(arrows), run_time=0.5)
        self.wait(0.1)
        # "...a rule..."
        self.play(FadeIn(policy_word, shift=0.15 * DOWN), run_time=0.5)
        self.wait(1.2)
        # "...choose a random action..."
        self.play(Write(policy[0]), FadeIn(caption), run_time=0.8)
        self.play(FadeIn(policy[1], policy[2]), run_time=0.5)
        self.wait(0.9)
        # "...from a uniform distribution."
        self.play(FadeIn(policy[3], policy[4], shift=0.1 * LEFT), run_time=0.5)
        self.wait(0.3)

        # "This means, each action is equally likely."
        # A 1/4 flies from the equation to each arrow, and travels with the agent from now on.
        self.next_section("equally likely")
        quarters = VGroup(*stage.arrow_labels({a: QUARTER for a in ACTIONS}).values())
        stage.riders.add(quarters)
        self.play(LaggedStart(*[FadeTransform(policy[4].copy(), q) for q in quarters], lag_ratio=0.12, run_time=1.2))
        self.wait(0.6)
        # The rule settles into the "current policy" box in the corner.
        box = PolicyBox(r"\pi(a \mid s) = " + QUARTER)
        self.play(
            Create(box.frame),
            FadeTransform(policy_word, box.title),
            FadeTransform(policy, box.formula),
            FadeOut(caption),
            run_time=0.9,
        )
        self.add(box)

        # (A few random steps under the uniform policy.)
        self.next_section("random steps")
        self.walk(stage, BEFORE_REWARD)

        # "But there is no learning here, even if there was a reward somewhere."
        self.next_section("reward")
        reward = Reward().set_z_index(5)
        self.wait(3)
        # "...a reward somewhere."
        self.play(reward.drop_into(stage.grid.center_of(REWARD_STATE)))
        self.wait(0.3)

        # "Nothing gives the agent an incentive to choose one action over another."
        # Right next to the reward, every arrow still says 1/4 — and the agent wanders off,
        # stumbles onto the reward by chance, and wanders off again.
        self.next_section("no incentive")
        self.play(LaggedStart(*[Indicate(q, color=MODEL, scale_factor=1.35) for q in quarters], lag_ratio=0.1, run_time=0.9))
        self.walk(stage, AFTER_REWARD, reward=reward)

        # "So how can we give it a better policy?"
        self.next_section("question")
        self.wait(1.2)
        dim = Rectangle(width=config.frame_width, height=config.frame_height, stroke_width=0,
                        fill_color=BG, fill_opacity=0.8).set_z_index(20)
        question = Text("?", font_size=380, color=INK).set_z_index(21)
        self.play(FadeIn(dim), GrowFromCenter(question, rate_func=rate_functions.ease_out_back), run_time=0.8)
        self.wait(1)

"""The 5x5 reward world that Maths 04 builds and Maths 05 onwards start from, and the
reward-function block shown in the top right."""

from manim import LEFT, UP, MathTex, Text, VGroup

from .reward import Reward, reward_values
from .stage import RIGHT_X, GridStage
from .theme import DOPAMINE, INK, MUTED
from .transitions import EQ_Y

CELL_5X5 = 1.2
REWARDS_5X5 = {9: 10, 18: 5}
START = 21
GREEDY_TEX = r"\pi(s) = \text{action with highest } R(f(s,a))"
REWARD_RULE_TEX = r"R(s) = \begin{cases} x & \text{if a reward } x \text{ is in } s \\ 0 & \text{otherwise} \end{cases}"


def reward_title():
    return Text("reward function", font_size=46, color=DOPAMINE).move_to([RIGHT_X, EQ_Y, 0])


def reward_rule():
    return MathTex(REWARD_RULE_TEX, font_size=42, color=INK).move_to([RIGHT_X, EQ_Y - 0.6, 0])


def reward_block():
    """The reward function as it sits in the top right at the end of Maths 04."""
    title = reward_title().scale(30 / 46).move_to([RIGHT_X, EQ_Y + 0.6, 0])
    return VGroup(title, reward_rule()).scale(0.7).move_to([RIGHT_X, 2.9, 0])


def big_world(s=START):
    """The 5x5 stage with its rewards, R(s) values and start tag. Returns
    (stage, values, stars, start_tag); stage.drop_panel() has been applied."""
    stage = GridStage(s=s, rows=5, cols=5, cell=CELL_5X5)
    stage.drop_panel()
    values = reward_values(stage.grid, REWARDS_5X5, font_size=22)
    stars = {r: Reward(size=0.32).set_z_index(5).move_to(stage.grid.center_of(r)) for r in REWARDS_5X5}
    start_tag = Text("start", font_size=18, color=MUTED).move_to(
        stage.grid.center_of(START) + CELL_5X5 * (0.28 * UP + 0.22 * LEFT)).set_z_index(2)
    return stage, values, stars, start_tag

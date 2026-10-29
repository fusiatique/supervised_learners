"""Shared building blocks for the maths scenes."""

from .agent import Agent, absorb, brain_light, light_up, neon
from .grid import ACTIONS, GridWorld, Maze
from .theme import BG, CELL, DOPAMINE, HARM, HOMEO, INK, MODEL, MUTED, WALL
from .stage import AGENT_RATIO, CELL_3X3, GRID_SHIFT, HIGHLIGHT, PANEL_POS, RIGHT_X, GridStage, state_panel
from .policy import POLICY_POS, PolicyBox
from .reward import Reward, reward_values
from .transitions import (
    EQ_Y, ORDER, ROW_GAP, STREAM_BOTTOM, STREAM_END, STREAM_TOP, general_rule, morph_parts, place_rows, row_y,
    rule_heading, stream_dots, stream_rows, transition_tex, window_opacity,
)
from .world import (
    CELL_5X5, GREEDY_TEX, REWARDS_5X5, START, big_world, reward_block, reward_rule, reward_title,
)
from .value import (
    COL_X, DIRS, TIE_ORDER, WORLD_SHIFT, bellman_expectation, evaluate_policy, final_policy, improve_policy, policy_route, glow_square, policy_arrow, value_tex, dashed_trail, discounted_value, field_opacity, g_equation, g_gammas, g_rewards, gamma_slider,
    style_g_equation, sv_title, v_equation, value_field,
)
from .pacing import PacedScene
from .gauge import Gauge
from .icons import PILL, WATER, apple, capsule, moon, sun, water_glass

"""State values and discounting, shared by Maths 05 (which builds them) and Maths 06
(which starts on them): the gamma-driven value field, the right-column equations, the
gamma slider with its weight bars, and dashed path trails."""

import random
from collections import deque
from functools import lru_cache

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    DashedVMobject,
    DecimalNumber,
    MathTex,
    NumberLine,
    Rectangle,
    Square,
    Text,
    VGroup,
    VMobject,
    always_redraw,
)

from .grid import ACTIONS
from .theme import DOPAMINE, INK, MODEL, MUTED
from .world import REWARDS_5X5

WORLD_SHIFT = 1.4 * LEFT  # the 5x5 grid is wider than the 3x3, so it moves left to free the right column
COL_X = 3.3  # centre of the right column once the grid has moved


@lru_cache(maxsize=None)
def _steps_to(goal, rows, cols, blocked):
    """Shortest number of steps from every cell to goal, never passing through a blocked cell
    (another reward: reaching one ends the episode). Unreachable cells are left out."""
    def neighbours(x):
        r, c = divmod(x - 1, cols)
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            if 0 <= r + dr < rows and 0 <= c + dc < cols:
                yield (r + dr) * cols + (c + dc) + 1

    dist, frontier = {goal: 0}, deque([goal])
    while frontier:
        x = frontier.popleft()
        for y in neighbours(x):
            if y not in dist and y not in blocked:
                dist[y] = dist[x] + 1
                frontier.append(y)
    return dist


def discounted_value(s, gamma, grid, rewards=REWARDS_5X5):
    """The best discounted reward reachable from s, matching the Bellman convention used from
    Maths 06 on: a reward r that is d steps away is worth gamma^d * r, so a reward's own cell is
    worth r, its neighbours gamma * r, and so on. Reaching a reward ends the episode, so a reward
    cell is worth exactly its own reward, and a path to one reward cannot pass through another."""
    if s in rewards:
        return float(rewards[s])
    best = 0.0
    for goal, r in rewards.items():
        dist = _steps_to(goal, grid.rows, grid.cols, frozenset(rewards) - {goal})
        if s in dist:
            best = max(best, r * gamma ** dist[s])
    return best


def field_opacity(value):
    # A steep curve keeps the brightest cells distinct when gamma is high and values bunch up.
    return 0.7 * (value / 10) ** 1.6


def value_field(grid, gamma):
    """An amber overlay on every cell whose brightness follows the discounted value of that
    cell for the current gamma (a ValueTracker), so the glow spreads as gamma grows."""
    states = range(1, grid.rows * grid.cols + 1)
    field = VGroup(*[
        Square(side_length=grid.cell, stroke_width=0, fill_color=DOPAMINE, fill_opacity=0)
        .move_to(grid.center_of(s)).set_z_index(1)
        for s in states
    ])

    def update(group):
        g = gamma.get_value()
        for s, square in zip(states, group):
            square.set_fill(opacity=field_opacity(discounted_value(s, g, grid)))

    return field.add_updater(update)


def sv_title(colored=True):
    """"state-value function", with "state" violet and "value" amber once colored."""
    title = Text("state-value function", font_size=40, color=INK).move_to([COL_X, 2.9, 0])
    if colored:
        title[:5].set_color(MODEL)
        title[6:11].set_color(DOPAMINE)
    return title


def v_equation(highlighted=True):
    v_eq = MathTex("V(s)", "=", r"\text{expected }", r"\text{future return}", r"\text{ from } s",
                   font_size=34, color=INK).move_to([COL_X, 2.0, 0])
    v_eq[0].set_color(MODEL)
    if highlighted:
        v_eq[3].set_color(DOPAMINE)
    return v_eq


def g_equation():
    g_eq = MathTex("G_t", "=", "R_{t+1}", "+", r"\gamma", "R_{t+2}", "+", r"\gamma^2", "R_{t+3}", "+", r"\cdots",
                   font_size=40, color=INK).move_to([COL_X, 0.95, 0])
    g_eq[0].set_color(DOPAMINE)
    return g_eq


def g_rewards(g_eq):
    return [g_eq[2], g_eq[5], g_eq[8]]


def g_gammas(g_eq):
    return VGroup(g_eq[4], g_eq[7])


def style_g_equation(g_eq):
    """The end state of Maths 05's highlighting: rewards amber, each a little smaller; gammas bold violet."""
    for k, r in enumerate(g_rewards(g_eq)):
        r.set_color(DOPAMINE).scale(1 - 0.12 * k)
    g_gammas(g_eq).set_color(MODEL).set_stroke(MODEL, width=1.2)
    return g_eq


def gamma_slider(gamma):
    """A slider for gamma (a ValueTracker) and four weight bars (1, gamma, gamma^2, gamma^3).
    Returns (line, label, knob, readout, weight_labels, bars); knob, readout and bars redraw live."""
    line = NumberLine(x_range=[0, 1, 0.5], length=3.2, include_numbers=True, font_size=24, color=MUTED)
    line.move_to([COL_X + 0.3, 0.0, 0])
    label = MathTex(r"\gamma", font_size=40, color=MODEL).next_to(line, LEFT, buff=0.35)
    knob = always_redraw(lambda: Rectangle(width=0.12, height=0.42, stroke_width=0, fill_color=MODEL, fill_opacity=1)
                         .move_to(line.n2p(gamma.get_value())))
    readout = always_redraw(lambda: DecimalNumber(gamma.get_value(), num_decimal_places=1, font_size=26, color=MODEL)
                            .next_to(line.n2p(gamma.get_value()), UP, buff=0.3))
    base_y, max_h = -1.7, 0.9
    weight_labels = VGroup(*[MathTex(t, font_size=26, color=MUTED) for t in ("1", r"\gamma", r"\gamma^2", r"\gamma^3")])
    weight_labels.arrange(RIGHT, buff=0.55).move_to([COL_X, base_y - 0.25, 0])

    def weight_bars():
        g = gamma.get_value()
        return VGroup(*[
            Rectangle(width=0.4, height=max(0.02, max_h * g ** k), stroke_width=0, fill_color=DOPAMINE, fill_opacity=0.85)
            .move_to([label_k.get_x(), base_y, 0], aligned_edge=DOWN)
            for k, label_k in enumerate(weight_labels)
        ])

    return line, label, knob, readout, weight_labels, always_redraw(weight_bars)


def dashed_trail(points, color):
    """A dashed line through cell centres, marking a path the agent took."""
    trail = DashedVMobject(VMobject().set_points_as_corners(points), num_dashes=6 * (len(points) - 1))
    return trail.set_stroke(color, width=4).set_z_index(3)


DIRS = {"up": UP, "down": DOWN, "left": LEFT, "right": RIGHT}


def value_tex(v, grid, s):
    """A state's value, written in the cell's bottom-right corner where R(s) used to be."""
    text = f"{v:.0f}" if abs(v - round(v)) < 1e-9 else f"{v:.1f}"
    return MathTex(text, font_size=26, color=DOPAMINE).move_to(
        grid.center_of(s) + 0.3 * grid.cell * (RIGHT + DOWN)).set_z_index(6)


def glow_square(grid, s, v):
    """A cell's amber glow for value v (the same brightness curve as the value field)."""
    return Square(side_length=grid.cell, stroke_width=0, fill_color=DOPAMINE, fill_opacity=field_opacity(v)) \
        .move_to(grid.center_of(s)).set_z_index(1)


def policy_arrow(grid, s, action, color=MODEL):
    """A small arrow inside a cell showing the action the policy takes there."""
    c, d = grid.center_of(s), DIRS[action]
    return Arrow(c - 0.28 * grid.cell * d, c + 0.28 * grid.cell * d, buff=0, stroke_width=4,
                 max_tip_length_to_length_ratio=0.35, color=color).set_z_index(5)


TIE_ORDER = ["up", "right", "left", "down"]  # how ties are broken when choosing the arg max


def evaluate_policy(policy, grid, gamma, rewards=REWARDS_5X5):
    """V^pi for a deterministic policy (state -> action), with the same convention as
    discounted_value: follow the policy from s; a reward r reached after d steps is worth
    gamma^d * r, and a policy that loops (or bumps forever) without reaching one is worth 0."""
    V = {}
    for s in range(1, grid.rows * grid.cols + 1):
        x, d, seen = s, 0, set()
        while x not in rewards and x not in seen:
            seen.add(x)
            x, d = grid.step(x, policy[x]), d + 1
        V[s] = rewards[x] * gamma ** d if x in rewards else 0.0
    return V


def improve_policy(policy, V, grid, gamma):
    """Policy improvement: in each state switch to the arg max of Q(s, a) = gamma V(s'), but
    only when it is strictly better than the current action, so ties never flip an arrow."""
    def q(s, a):
        return gamma * V[grid.step(s, a)]
    new = {}
    for s, a in policy.items():
        best = max(TIE_ORDER, key=lambda b: (q(s, b), -TIE_ORDER.index(b)))
        new[s] = best if q(s, best) > q(s, a) + 1e-9 else a
    return new


def policy_route(policy, start, grid, rewards=REWARDS_5X5):
    """The states visited following the policy from start, until a reward or a repeat.
    Returns (path, reward reached or None)."""
    path, seen, s = [start], {start}, start
    while s not in rewards:
        s = grid.step(s, policy[s])
        path.append(s)
        if s in seen:
            return path, None
        seen.add(s)
    return path, s


def bellman_expectation():
    """Maths 06's end state in the right column: the label, the equation with its symbols
    coloured, and "where a = pi(s)". Returns (label, equation, where)."""
    eq = MathTex(r"V^\pi(s)", "=", "r(s, a, s')", "+", r"\gamma", r"V^\pi(s')", font_size=46, color=INK)
    eq.move_to([COL_X, 1.3, 0])
    eq[0].set_color(MODEL)
    eq[2].set_color(DOPAMINE)
    eq[5].set_color(MODEL)
    where = MathTex(r"\text{where } a = \pi(s)", font_size=32, color=MUTED).next_to(eq, DOWN, buff=0.35)
    label = Text("Bellman expectation equation:", font_size=28, color=MUTED).next_to(eq, UP, buff=0.4)
    return label, eq, where


def final_policy(grid, gamma=0.9):
    """The policy the agent follows from Maths 07 on: a seeded random policy (s8 starting on "up"),
    improved until it stops changing. It is optimal; where actions tie it keeps its current one."""
    states = [s for s in range(1, grid.rows * grid.cols + 1) if s not in REWARDS_5X5]
    rng = random.Random(7)
    policy = {s: rng.choice(list(ACTIONS)) for s in states if s != 8}
    policy[8] = "up"
    for _ in range(4):
        policy = improve_policy(policy, evaluate_policy(policy, grid, gamma), grid, gamma)
    return policy

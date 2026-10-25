"""Maths 09 — Exploration versus exploitation, and epsilon-greedy.

Narration: from "But there is another problem." to "That best-known action can change as it learns."
Starts on Maths 08's last frame (zoomed in on the agent at the 10).
"""

import random
from pathlib import Path

import numpy as np
from PIL import Image as PILImage
from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    PI,
    RIGHT,
    UP,
    Create,
    DashedVMobject,
    FadeIn,
    FadeOut,
    ImageMobject,
    Indicate,
    LaggedStart,
    Line,
    MathTex,
    MovingCameraScene,
    Rectangle,
    Rotate,
    RoundedRectangle,
    Square,
    Star,
    Text,
    Transform,
    Triangle,
    ValueTracker,
    VGroup,
    Write,
    always_redraw,
    config,
    rate_functions,
)

from common import (
    ACTIONS, BG, CELL, COL_X, PacedScene, DOPAMINE, HIGHLIGHT, INK, MODEL, MUTED, REWARDS_5X5, WORLD_SHIFT, PolicyBox, Reward,
    big_world, dashed_trail, discounted_value, evaluate_policy, field_opacity, glow_square, improve_policy,
    policy_arrow, policy_route, value_tex,
)

GAMMA = 0.9
GOAL = 9  # where Maths 08 leaves the agent, on the 10
JUNCTION = 14  # the known 10 is one step up; the unexplored corner is one step down
FOG = [19, 20, 24, 25]  # the unexplored corner
HIDDEN = 24  # the bigger reward hidden in it
HIDDEN_REWARD = 20
REWARDS_ALL = {**REWARDS_5X5, HIDDEN: HIDDEN_REWARD}
ARGMAX_TEX = r"\pi(s) = \arg\max_a Q^\pi(s, a)"
EGREEDY_TEX = r"\pi = \varepsilon\text{-greedy on } Q^\pi"
HAMSTER_IMAGE = Path(__file__).resolve().parents[2] / "suffering_hamster.jpg"  # animation/maths/
WORD_Y = 2.95
LEFT_X, RIGHT_X2 = COL_X - 1.65, COL_X + 1.65  # the exploitation and exploration sides of the column


def maths08_policy(grid):
    """The optimal policy Maths 08 ends on: Maths 07's seeded random policy, improved four times."""
    others = [s for s in range(1, 26) if s not in REWARDS_5X5 and s != 8]
    rng = random.Random(7)
    policy = {s: rng.choice(list(ACTIONS)) for s in others}
    policy[8] = "up"
    for _ in range(4):
        policy = improve_policy(policy, evaluate_policy(policy, grid, GAMMA), grid, GAMMA)
    return policy


def fog_cell(grid, s):
    """An unexplored cell: dark, with a question mark, above everything in the cell but the agent."""
    cover = Square(side_length=grid.cell, stroke_color=MUTED, stroke_width=1, fill_color="#0b111c", fill_opacity=0.97)
    mark = Text("?", font_size=34, color=MUTED)
    fog = VGroup(cover, mark).move_to(grid.center_of(s)).set_z_index(8)
    mark.set_z_index(9)  # stays above the cover even when the cover is animated (which redraws it on top)
    return fog


def epsilon_heading():
    """The "ε-greedy" title and its cases rule, for the right column."""
    title = Text("ε-greedy", font_size=34, color=INK).move_to([COL_X, WORD_Y, 0])
    rule = MathTex(
        r"\pi(a \mid s) = \begin{cases} \text{random action} & \text{with probability } \varepsilon \\"
        r" \text{best-known action} & \text{with probability } 1 - \varepsilon \end{cases}",
        font_size=26, color=INK,
    ).move_to([COL_X, 1.75, 0])
    return title, rule


def epsilon_controls(eps):
    """The epsilon slider and the explore / exploit split bar, driven by the ValueTracker eps.
    Returns (line, ends, label, knob, readout, bar, bar_labels); knob, readout and bar redraw live."""
    line = Line([COL_X - 1.4, 0.4, 0], [COL_X + 1.8, 0.4, 0]).set_stroke(MUTED, width=3)
    ends = VGroup(MathTex("0", font_size=24, color=MUTED).next_to(line.get_start(), DOWN, buff=0.15),
                  MathTex("1", font_size=24, color=MUTED).next_to(line.get_end(), DOWN, buff=0.15))
    label = MathTex(r"\varepsilon", font_size=40, color=MODEL).next_to(line, LEFT, buff=0.35)

    def at(v):
        return line.point_from_proportion(v)

    knob = always_redraw(lambda: Rectangle(width=0.12, height=0.42, stroke_width=0, fill_color=MODEL,
                                           fill_opacity=1).move_to(at(eps.get_value())))
    readout = always_redraw(lambda: MathTex(f"{eps.get_value():.1f}", font_size=26, color=MODEL)
                            .next_to(at(eps.get_value()), UP, buff=0.3))
    bar_left, bar_w, bar_y = COL_X - 1.6, 3.2, -0.55

    def split_bar():
        e = eps.get_value()
        explore_part = Rectangle(width=max(0.001, bar_w * e), height=0.34, stroke_width=0, fill_color=MODEL,
                                 fill_opacity=0.85).move_to([bar_left, bar_y, 0], aligned_edge=LEFT)
        exploit_part = Rectangle(width=max(0.001, bar_w * (1 - e)), height=0.34, stroke_width=0,
                                 fill_color=DOPAMINE, fill_opacity=0.85).move_to([bar_left + bar_w, bar_y, 0],
                                                                                aligned_edge=RIGHT)
        return VGroup(explore_part, exploit_part)

    # Either side of the bar: the random share (explore) on the left, the best-known share (exploit) on the right.
    bar_labels = VGroup(Text("explore", font_size=20, color=MODEL), Text("exploit", font_size=20, color=DOPAMINE))
    bar_labels[0].next_to([bar_left, bar_y, 0], LEFT, buff=0.2)
    bar_labels[1].next_to([bar_left + bar_w, bar_y, 0], RIGHT, buff=0.2)
    return line, ends, label, knob, readout, always_redraw(split_bar), bar_labels


def glow_opacity(v):
    """Once the 20 is known, values reach 20, so the glow is rescaled to that maximum."""
    return field_opacity(v * 10 / HIDDEN_REWARD)


def after_discovery(grid, policy):
    """What the agent knows once it has found the 20: every value (s25 is still unexplored), the
    improved policy, the states whose arrows change and the two cells newly revealed beside s24.
    Returns (V_new, known, new_policy, changed, revealed)."""
    V_new = {s: discounted_value(s, GAMMA, grid, rewards=REWARDS_ALL) for s in range(1, 26)}
    known = [s for s in range(1, 26) if s not in REWARDS_ALL and s != 25]
    new_policy = improve_policy({s: policy.get(s, "up") for s in known}, V_new, grid, GAMMA)
    changed = [s for s in known if s in policy and new_policy[s] != policy[s]]
    return V_new, known, new_policy, changed, [19, 20]


def pill(text, point, color=DOPAMINE):
    label = Text(text, font_size=20, color=color)
    back = RoundedRectangle(corner_radius=0.08, width=label.width + 0.22, height=label.height + 0.16,
                            stroke_width=0, fill_color=BG, fill_opacity=0.9)
    return VGroup(back, label).move_to(point).set_z_index(12)


class Scene09Exploration(PacedScene, MovingCameraScene):
    """Every animation runs 35% slower than written (PacedScene), with the extra time taken
    back out of the following pauses, so the screen is easier to follow."""

    def reset_to(self, stage, s, run_time=0.3):
        """The agent fades out where it is and reappears at s (each half takes run_time)."""
        body = VGroup(stage.agent, stage.arrows)
        self.play(FadeOut(body, scale=0.6), stage.grid[stage.state].animate.set_fill(CELL), run_time=run_time)
        body.shift(stage.grid.center_of(s) - stage.agent.get_center())
        stage.state = s
        self.play(FadeIn(body, scale=0.6), stage.grid[s].animate.set_fill(HIGHLIGHT), run_time=run_time)

    def construct(self):
        frame = self.camera.frame
        # Maths 08's last frame: zoomed in on the smiling agent at the 10, with the optimal policy.
        stage, _, stars, start_tag = big_world(s=GOAL)
        grid = stage.grid
        VGroup(stage.group, *stars.values(), start_tag).shift(WORLD_SHIFT)
        stage.agent.mouth.become(stage.agent.make_mouth("happy"))
        V = {s: discounted_value(s, GAMMA, grid) for s in range(1, 26)}
        glows = {s: glow_square(grid, s, V[s]) for s in V}
        values = {s: value_tex(V[s], grid, s) for s in V}
        policy = maths08_policy(grid)
        arrows_in_cells = {s: policy_arrow(grid, s, a) for s, a in policy.items()}
        box = PolicyBox(ARGMAX_TEX, font_size=32)
        frame.scale(0.5).move_to(stage.agent.get_center() + 0.6 * DOWN + 0.5 * LEFT)
        self.add(stage.group, *stars.values(), start_tag, *glows.values(), *values.values(), *arrows_in_cells.values(), box)

        # "But there is another problem."  The camera pulls back out, and the suffering hamster
        # flashes over the whole screen for a split second, half see-through: an attention grabber.
        self.next_section("another problem")
        self.play(frame.animate.set(width=config.frame_width).move_to(ORIGIN),
                  stage.agent.mouth.animate.become(stage.agent.make_mouth("blank")), run_time=1)
        # Loaded through Pillow as RGBA: Manim cannot set the opacity of a plain RGB JPEG.
        hamster = ImageMobject(np.array(PILImage.open(HAMSTER_IMAGE).convert("RGBA"))).set_z_index(40)
        # Fitted to the screen height so the whole picture shows, mouth included, without distortion.
        hamster.scale_to_fit_height(config.frame_height).move_to(ORIGIN).set_opacity(0.5)
        self.play(FadeIn(hamster, scale=1.08), run_time=0.08)
        self.wait(0.32)
        self.play(FadeOut(hamster), run_time=0.2)

        # "Once the agent finds a rewarding path, should it always follow it? Or should it sometimes
        # try something new, in case there's a better reward elsewhere?"
        # The agent steps to a junction: the known 10 above, an unexplored corner below.
        self.next_section("junction")
        hidden_star = Reward(size=0.4).set_z_index(5).move_to(grid.center_of(HIDDEN))
        hidden_value = value_tex(HIDDEN_REWARD, grid, HIDDEN)
        fog = {s: fog_cell(grid, s) for s in FOG}
        self.play(stage.place(JUNCTION, run_time=0.9))
        arrows = stage.add_arrows()
        self.play(LaggedStart(*[FadeIn(a) for a in arrows], lag_ratio=0.1), run_time=0.5)
        self.wait(1.2)
        # "...should it always follow it?"  The known path up to the 10.
        self.play(stage.light("up", color=DOPAMINE), Indicate(stars[GOAL], color=DOPAMINE), run_time=0.8)
        self.wait(2)
        # "...try something new, in case there's a better reward elsewhere?"  The corner below is unexplored.
        under_fog = [glows[s] for s in FOG] + [values[s] for s in FOG] + [arrows_in_cells[s] for s in FOG]
        self.play(LaggedStart(*[FadeIn(fog[s], scale=1.05) for s in FOG], lag_ratio=0.15),
                  FadeOut(*under_fog), run_time=1)
        self.play(stage.light("down", color=MODEL), Indicate(VGroup(*fog.values()), color=MODEL, scale_factor=1.03),
                  run_time=0.8)
        self.wait(2.3)

        # "This is the exploration-exploitation dilemma."
        self.next_section("dilemma")
        exploit = Text("Exploitation", font_size=34, color=DOPAMINE).move_to([LEFT_X, WORD_Y, 0])
        explore = Text("Exploration", font_size=34, color=MODEL).move_to([RIGHT_X2, WORD_Y, 0])
        self.play(FadeIn(exploit, shift=0.3 * RIGHT), FadeIn(explore, shift=0.3 * LEFT), run_time=0.8)
        self.wait(0.8)

        # "Exploration means trying actions to discover new outcomes. Exploitation means using what the
        # agent already knows to get the best known reward."  Each comes with its path, as a ghost.
        self.next_section("definitions")
        explore_def = Text("try actions to discover\nnew outcomes", font_size=19, color=MUTED,
                           line_spacing=0.8).next_to(explore, DOWN, buff=0.25)
        exploit_def = Text("use what it knows to get\nthe best known reward", font_size=19, color=MUTED,
                           line_spacing=0.8).next_to(exploit, DOWN, buff=0.25)
        explore_trail = dashed_trail([grid.center_of(s) for s in (JUNCTION, 19, HIDDEN)], MODEL).set_z_index(9)
        guess = Star(n=5, outer_radius=0.4, inner_radius=0.18, color=MODEL).set_fill(opacity=0)
        guess = VGroup(DashedVMobject(guess, num_dashes=20), Text("?", font_size=26, color=MODEL)).move_to(
            grid.center_of(HIDDEN)).set_z_index(9)
        exploit_trail = dashed_trail([grid.center_of(s) for s in (JUNCTION, GOAL)], DOPAMINE).set_z_index(9)
        self.wait(0.8)
        self.play(FadeIn(explore_def, shift=0.1 * DOWN), Create(explore_trail), run_time=0.9)
        self.play(FadeIn(guess, scale=1.3), run_time=0.5)
        self.wait(2.1)
        self.play(FadeIn(exploit_def, shift=0.1 * DOWN), Create(exploit_trail),
                  Indicate(stars[GOAL], color=DOPAMINE), run_time=0.9)
        self.wait(2.4)

        # "A smart agent needs both. If it only explores, it never uses what it learns. If it only
        # exploits, it might never find something better."
        self.next_section("needs both")
        self.play(Indicate(exploit, color=DOPAMINE), Indicate(explore, color=MODEL), run_time=0.8)
        self.wait(1.4)
        only_explore = Text("only exploring:\nnever uses what it learns", font_size=18, color=MODEL,
                            line_spacing=0.8).next_to(explore_def, DOWN, buff=0.45)
        only_exploit = Text("only exploiting: might\nnever find something better", font_size=18, color=DOPAMINE,
                            line_spacing=0.8).next_to(exploit_def, DOWN, buff=0.45)
        # "If it only explores..."
        self.play(FadeIn(only_explore, shift=0.1 * DOWN), run_time=0.6)
        self.wait(2.4)
        # "If it only exploits..."
        self.play(FadeIn(only_exploit, shift=0.1 * DOWN), run_time=0.6)
        self.wait(2.9)

        # "So how do we balance the two?"  The two words sit on a seesaw that tips each way, then levels.
        self.next_section("balance")
        pivot_point = np.array([COL_X, 0.9, 0])
        beam = Line(pivot_point + 2.0 * LEFT, pivot_point + 2.0 * RIGHT).set_stroke(INK, width=5)
        pivot = Triangle(stroke_width=0, fill_color=MUTED, fill_opacity=1).scale(0.22).next_to(pivot_point, DOWN, buff=0)
        self.play(FadeOut(explore_def, exploit_def, only_explore, only_exploit, explore_trail, exploit_trail, guess),
                  FadeIn(beam, pivot),
                  exploit.animate.scale(0.72).next_to(beam.get_start(), UP, buff=0.12).shift(0.55 * RIGHT),
                  explore.animate.scale(0.72).next_to(beam.get_end(), UP, buff=0.12).shift(0.55 * LEFT),
                  stage.unlight(), run_time=0.8)
        seesaw = VGroup(beam, exploit, explore)
        self.play(Rotate(seesaw, 0.14, about_point=pivot_point), run_time=0.45)
        self.play(Rotate(seesaw, -0.28, about_point=pivot_point), run_time=0.6)
        self.play(Rotate(seesaw, 0.14, about_point=pivot_point), run_time=0.45)

        # "One common approach is epsilon-greedy exploration."
        self.next_section("epsilon-greedy")
        title, rule = epsilon_heading()
        self.play(FadeOut(beam, pivot, exploit, explore), FadeIn(title, shift=0.1 * DOWN), run_time=0.6)
        self.play(Write(rule), run_time=1.3)
        self.wait(0.4)

        # "Epsilon controls how often the agent explores."  A slider for epsilon, and a bar split into
        # the share of random (exploring) and best-known (exploiting) choices.
        self.next_section("slider")
        eps = ValueTracker(0.5)
        line, ends, eps_label, knob, readout, bar, bar_labels = epsilon_controls(eps)
        self.play(FadeIn(line, ends, eps_label, knob, readout, bar, bar_labels), box.swap(EGREEDY_TEX, font_size=32),
                  run_time=0.8)
        self.wait(1.4)

        # "At zero, it always exploits. At one, it always explores. In between, it usually picks its
        # best-known action but sometimes tries something else."  The demo runs under the last part.
        self.next_section("extremes")
        # "At zero, it always exploits."
        self.play(eps.animate.set_value(0), run_time=0.8)
        self.wait(0.8)
        # "At one, it always explores."
        self.play(eps.animate.set_value(1), run_time=1.2)
        self.wait(0.6)
        # "In between..."
        self.play(eps.animate.set_value(0.1), run_time=1.2)

        def choose(kind):
            part = bar[0] if kind == "explore" else bar[1]
            color = MODEL if kind == "explore" else DOPAMINE
            return Indicate(part, color=color, scale_factor=1.12)

        # "...it usually picks its best-known action..."  The amber part of the bar pulses and the
        # agent takes the known path to the 10, then resets to the junction.
        self.play(choose("exploit"), stage.light("up", color=DOPAMINE), run_time=0.3)
        self.play(stage.move("up", run_time=0.35))
        self.play(stars[GOAL].collect(), run_time=0.35)
        self.reset_to(stage, JUNCTION, run_time=0.25)
        # "...but sometimes tries something else."  The violet part pulses: a random step into the
        # fog, which lifts around the agent to reveal a bigger reward.
        dice = pill("random!", grid.center_of(JUNCTION) + 0.5 * grid.cell * (RIGHT + UP), color=MODEL)
        self.play(choose("explore"), FadeIn(dice, scale=1.3), stage.light("down", color=MODEL), run_time=0.4)
        self.play(stage.move("down", run_time=0.35), FadeOut(dice), FadeOut(fog[19], scale=1.1), run_time=0.35)
        self.add(hidden_star, hidden_value)
        self.bring_to_front(fog[25])
        self.play(FadeOut(fog[20], fog[24], scale=1.1), FadeIn(hidden_star, scale=1.6), FadeIn(hidden_value), run_time=0.5)
        self.play(hidden_star.collect(), Indicate(hidden_value, color=DOPAMINE, scale_factor=1.6), stage.unlight(),
                  run_time=0.5)

        # "That best-known action can change as it learns."
        # With the 20 known, every value is recalculated and the arrows swing; the route from the
        # junction now heads down to the 20 instead of up to the 10.
        self.next_section("route changes")
        V_new, known, new_policy, changed, revealed = after_discovery(grid, policy)
        self.wait(0.6)
        self.play(
            *[Transform(values[s], value_tex(V_new[s], grid, s)) for s in known if s not in revealed],
            *[glows[s].animate.set_fill(opacity=glow_opacity(V_new[s])) for s in known if s not in revealed],
            *[glows[s].animate.set_fill(opacity=glow_opacity(V_new[s])) for s in REWARDS_5X5],
            *[FadeIn(glow_square(grid, s, V_new[s]).set_fill(opacity=glow_opacity(V_new[s])), value_tex(V_new[s], grid, s))
              for s in revealed],
            FadeIn(glow_square(grid, HIDDEN, HIDDEN_REWARD).set_fill(opacity=glow_opacity(HIDDEN_REWARD))),
            run_time=1,
        )
        self.play(LaggedStart(*[Transform(arrows_in_cells[s], policy_arrow(grid, s, new_policy[s])) for s in changed],
                              lag_ratio=0.1),
                  *[FadeIn(policy_arrow(grid, s, new_policy[s])) for s in revealed if s != stage.state],
                  run_time=1.2)
        route, _ = policy_route(new_policy | {HIDDEN: "up"}, JUNCTION, grid, rewards=REWARDS_ALL)
        new_route = dashed_trail([grid.center_of(s) for s in route], DOPAMINE).set_z_index(9)
        self.play(Create(new_route), Indicate(arrows_in_cells[JUNCTION], color=DOPAMINE, scale_factor=1.5), run_time=1)
        self.wait(1.2)

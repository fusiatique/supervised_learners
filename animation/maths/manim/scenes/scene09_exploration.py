"""Maths 09 — Exploration versus exploitation, and epsilon-greedy.

Narration: from "But there is another problem." to "...and what it finds can change its best-known
action."  Starts on Maths 07's last frame (the agent smiling on the 10).
"""

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
    BG, CELL, COL_X, PacedScene, DOPAMINE, HIGHLIGHT, INK, MODEL, MUTED, REWARDS_5X5, Reward, dashed_trail,
    discounted_value, field_opacity, glow_square, improve_policy, policy_arrow, policy_route, value_tex,
)
from scene07_policy_improvement import end_frame as scene07_end_frame

GAMMA = 0.9
GOAL = 9  # where Maths 07 leaves the agent, on the 10
JUNCTION = 14  # the known 10 is one step up; the unexplored corner is one step down
FOG = [19, 20, 24, 25]  # the unexplored corner
HIDDEN = 24  # the bigger reward hidden in it
HIDDEN_REWARD = 20
REWARDS_ALL = {**REWARDS_5X5, HIDDEN: HIDDEN_REWARD}
EGREEDY_TEX = r"\pi = \varepsilon\text{-greedy on } Q^\pi"
HAMSTER_IMAGE = Path(__file__).resolve().parents[2] / "suffering_hamster.jpg"  # animation/maths/
WORD_Y = 2.95
LEFT_X, RIGHT_X2 = COL_X - 1.65, COL_X + 1.65  # the exploitation and exploration sides of the column

# Narration cues (seconds from the start), at about 145 words per minute.
T_HAMSTER = 1.0  # (during "But there is another problem.")
T_FOLLOW = 3.2  # "Should the agent always follow the path it knows,
T_NEW = 6.9  # ...or sometimes try something new?"
T_EGREEDY = 10.2  # "A common answer is epsilon-greedy:
T_USUALLY = 13.0  # ...the agent usually takes its best-known action,
T_RANDOM = 16.3  # ...but with probability epsilon, tries a random one."
T_MATTERS = 20.8  # "That matters, because the agent only learns about states it visits.
T_BARELY = 25.7  # Where it has barely been, it can't tell which action is best,
T_FINDS = 30.6  # ...and what it finds
T_CHANGE = 32.3  # ...can change its best-known action."
T_END = 36.6


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
    """Every animation runs 35% slower than written (PacedScene); each beat waits for its narration cue."""

    def reset_to(self, stage, s, run_time=0.3):
        """The agent fades out where it is and reappears at s (each half takes run_time)."""
        body = VGroup(stage.agent, stage.arrows)
        self.play(FadeOut(body, scale=0.6), stage.grid[stage.state].animate.set_fill(CELL), run_time=run_time)
        body.shift(stage.grid.center_of(s) - stage.agent.get_center())
        stage.state = s
        self.play(FadeIn(body, scale=0.6), stage.grid[s].animate.set_fill(HIGHLIGHT), run_time=run_time)

    def construct(self):
        # Maths 07's last frame: the agent smiling on the 10, every state valued with its best action.
        f = scene07_end_frame()
        stage, stars, grid = f["stage"], f["stars"], f["stage"].grid
        glows, values, policy, arrows_in_cells, box = f["glows"], f["values"], f["policy"], f["arrows"], f["box"]
        column = VGroup(f["idea"], f["title"], f["q_eq"], f["rule"])
        self.add(stage.group, *stars.values(), f["start_tag"], *glows.values(), *values.values(),
                 *arrows_in_cells.values(), column, box)

        # "But there is another problem."  The right column clears, the smile fades, and the suffering
        # hamster flashes over the whole screen for a split second, half see-through: an attention grabber.
        self.next_section("another problem")
        self.play(FadeOut(column), stage.agent.mouth.animate.become(stage.agent.make_mouth("blank")), run_time=0.6)
        # Loaded through Pillow as RGBA: Manim cannot set the opacity of a plain RGB JPEG.
        hamster = ImageMobject(np.array(PILImage.open(HAMSTER_IMAGE).convert("RGBA"))).set_z_index(40)
        # Fitted to the screen height so the whole picture shows, mouth included, without distortion.
        hamster.scale_to_fit_height(config.frame_height).move_to(ORIGIN).set_opacity(0.5)
        self.at(T_HAMSTER)
        self.play(FadeIn(hamster, scale=1.08), run_time=0.08)
        self.wait(0.32)
        self.play(FadeOut(hamster), run_time=0.2)

        # "Should the agent always follow the path it knows, or sometimes try something new?"
        # The agent steps to a junction: the known 10 above (exploiting), an unexplored corner below
        # (exploring).
        self.next_section("dilemma")
        hidden_star = Reward(size=0.4).set_z_index(5).move_to(grid.center_of(HIDDEN))
        hidden_value = value_tex(HIDDEN_REWARD, grid, HIDDEN)
        fog = {s: fog_cell(grid, s) for s in FOG}
        exploit = Text("Exploitation", font_size=34, color=DOPAMINE).move_to([LEFT_X, WORD_Y, 0])
        explore = Text("Exploration", font_size=34, color=MODEL).move_to([RIGHT_X2, WORD_Y, 0])
        self.play(stage.place(JUNCTION, run_time=0.8))
        arrows = stage.add_arrows()
        self.play(LaggedStart(*[FadeIn(a) for a in arrows], lag_ratio=0.1), run_time=0.5)
        # "...always follow the path it knows..."
        self.at(T_FOLLOW + 0.6)
        self.play(stage.light("up", color=DOPAMINE), Indicate(stars[GOAL], color=DOPAMINE),
                  FadeIn(exploit, shift=0.3 * RIGHT), run_time=0.8)
        # "...or sometimes try something new?"  The corner below is unexplored.
        under_fog = [glows[s] for s in FOG] + [values[s] for s in FOG] + [arrows_in_cells[s] for s in FOG]
        self.at(T_NEW)
        self.play(LaggedStart(*[FadeIn(fog[s], scale=1.05) for s in FOG], lag_ratio=0.15),
                  FadeOut(*under_fog), run_time=0.9)
        self.play(stage.light("down", color=MODEL), FadeIn(explore, shift=0.3 * LEFT), run_time=0.7)

        # "A common answer is epsilon-greedy: the agent usually takes its best-known action, but with
        # probability epsilon, tries a random one."  The rule, a slider at 0.1 and a bar split into
        # "explore" (violet, epsilon) and "exploit" (amber, 1 - epsilon); then one of each.
        self.next_section("epsilon-greedy")
        title, rule = epsilon_heading()
        eps = ValueTracker(0.1)
        line, ends, eps_label, knob, readout, bar, bar_labels = epsilon_controls(eps)
        self.at(T_EGREEDY)
        self.play(FadeOut(exploit, explore), FadeIn(title, shift=0.1 * DOWN), stage.unlight(), run_time=0.6)
        self.play(Write(rule), FadeIn(line, ends, eps_label, knob, readout, bar, bar_labels),
                  box.swap(EGREEDY_TEX, font_size=32), run_time=1.2)

        def choose(kind):
            part = bar[0] if kind == "explore" else bar[1]
            color = MODEL if kind == "explore" else DOPAMINE
            return Indicate(part, color=color, scale_factor=1.12)

        # "...usually takes its best-known action..."  The amber part pulses and the agent takes the
        # known path to the 10, then resets to the junction.
        self.at(T_USUALLY)
        self.play(choose("exploit"), stage.light("up", color=DOPAMINE), run_time=0.5)
        self.play(stage.move("up", run_time=0.6))
        self.play(stars[GOAL].collect(), run_time=0.5)
        self.reset_to(stage, JUNCTION, run_time=0.35)
        # "...but with probability epsilon, tries a random one."  The violet part pulses: a random step
        # into the fog, which lifts from the cell it lands on.
        dice = pill("random!", grid.center_of(JUNCTION) + 0.5 * grid.cell * (RIGHT + UP), color=MODEL)
        self.at(T_RANDOM)
        self.play(choose("explore"), FadeIn(dice, scale=1.3), stage.light("down", color=MODEL), run_time=0.6)
        self.play(stage.move("down", run_time=0.6), FadeOut(dice), FadeOut(fog[19], scale=1.1), run_time=0.6)
        self.play(stage.unlight(), run_time=0.3)

        # "That matters, because the agent only learns about states it visits. Where it has barely been,
        # it can't tell which action is best..."  The rest of the corner is still fogged: unvisited,
        # nothing learned there yet (the grey cells of our simulation's policy map).
        unknown = Text("never visited: no idea yet which action is best", font_size=22, color=MUTED).move_to(
            [grid.get_x(), -3.45, 0])
        self.at(T_MATTERS)
        self.play(Indicate(VGroup(*[fog[s] for s in (20, 24, 25)]), color=MODEL, scale_factor=1.04),
                  FadeIn(unknown, shift=0.1 * UP), run_time=0.9)
        self.at(T_BARELY)
        self.play(*[fog[s][1].animate(rate_func=rate_functions.there_and_back).scale(1.4) for s in (20, 24, 25)],
                  run_time=0.8)
        # "...and what it finds..."  Exploring the corner reveals a bigger reward, a 20.
        self.at(T_FINDS)
        self.add(hidden_star, hidden_value)
        self.bring_to_front(fog[25])
        self.play(FadeOut(fog[20], fog[24], unknown, scale=1.1), FadeIn(hidden_star, scale=1.6), FadeIn(hidden_value),
                  run_time=0.6)
        self.play(hidden_star.collect(), Indicate(hidden_value, color=DOPAMINE, scale_factor=1.6), run_time=0.5)

        # "...can change its best-known action."  With the 20 known, every value is recalculated and the
        # arrows that now have a better action swing; the route from the junction now heads down to the 20.
        self.next_section("route changes")
        V_new, known, new_policy, changed, revealed = after_discovery(grid, policy)
        self.at(T_CHANGE)
        self.play(
            *[Transform(values[s], value_tex(V_new[s], grid, s)) for s in known if s not in revealed],
            *[glows[s].animate.set_fill(opacity=glow_opacity(V_new[s])) for s in known if s not in revealed],
            *[glows[s].animate.set_fill(opacity=glow_opacity(V_new[s])) for s in REWARDS_5X5],
            *[FadeIn(glow_square(grid, s, V_new[s]).set_fill(opacity=glow_opacity(V_new[s])), value_tex(V_new[s], grid, s))
              for s in revealed],
            FadeIn(glow_square(grid, HIDDEN, HIDDEN_REWARD).set_fill(opacity=glow_opacity(HIDDEN_REWARD))),
            run_time=1.0,
        )
        self.play(LaggedStart(*[Transform(arrows_in_cells[s], policy_arrow(grid, s, new_policy[s])) for s in changed],
                              lag_ratio=0.15),
                  *[FadeIn(policy_arrow(grid, s, new_policy[s])) for s in revealed if s != stage.state],
                  run_time=1.2)
        route, _ = policy_route(new_policy | {HIDDEN: "up"}, JUNCTION, grid, rewards=REWARDS_ALL)
        new_route = dashed_trail([grid.center_of(s) for s in route], DOPAMINE).set_z_index(9)
        self.play(Create(new_route), Indicate(arrows_in_cells[JUNCTION], color=DOPAMINE, scale_factor=1.5), run_time=1.0)
        self.at(T_END)

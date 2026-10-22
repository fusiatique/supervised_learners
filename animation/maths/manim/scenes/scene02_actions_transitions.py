"""Maths 02 — Actions and the transition function.

Narration: from "From any state, the agent can choose from several 'actions'."
to "...the environment needs this for every state-action pair."
The worked example uses s5 and "right" (-> s6), where the agent already is.
Starts on Maths 01's last frame.
"""

from manim import (
    DOWN,
    UP,
    Create,
    FadeIn,
    FadeOut,
    GrowFromPoint,
    Indicate,
    LaggedStart,
    Line,
    MathTex,
    Scene,
    Text,
    ValueTracker,
    VGroup,
    Write,
    rate_functions,
)

from common import (
    EQ_Y, GRID_SHIFT, INK, MODEL, MUTED, ORDER, RIGHT_X, STREAM_END, GridStage, general_rule, morph_parts, row_y,
    rule_heading, stream_dots, stream_rows, window_opacity,
)

GHOSTS = 5  # motion-blur copies trailing each row while the stream moves fast


def rule_with(state="s", action="a", result="s'"):
    """f(state, action) = result at the general rule's size and place, with the states in violet."""
    eq = MathTex("f(", state, r",\;\;", action, ")", "=", result, font_size=64, color=INK).move_to([RIGHT_X, EQ_Y, 0])
    eq[1].set_color(MODEL)
    if result != "?":
        eq[6].set_color(MODEL)
    return eq


class Scene02ActionsTransitions(Scene):
    def construct(self):
        stage = GridStage(s=5)
        self.add(stage.group)
        grid = stage.grid

        # "From any state, the agent can choose from several 'actions'."
        self.next_section("actions")
        # The readout goes and the grid moves to the centre until the transition function needs the space.
        self.play(stage.drop_panel(), stage.group.animate.shift(-GRID_SHIFT), run_time=0.8)
        # The arrows slide out from under the agent.
        arrows = stage.add_arrows()
        center = stage.agent.get_center()
        self.play(LaggedStart(*[GrowFromPoint(a, center) for a in arrows], lag_ratio=0.08, run_time=1.1))
        actions_word = Text("actions", font_size=40, color=INK).next_to(stage.grid, UP, buff=0.3)
        self.play(Write(actions_word), run_time=0.8)
        self.wait(1.8)

        # "In this case, this would be up, down, left and right."
        # Each action lights up and is taken as it is named: s5 -> s2 -> s5 -> s4 -> s5.
        for name in ORDER:
            self.play(stage.light(name), run_time=0.2)
            self.play(stage.move(name, run_time=0.45))
        self.play(stage.unlight(), run_time=0.3)

        # "Now, for the agent to 'interact' with the environment, the environment needs a set of
        # rules that takes the agent's current state and action as input..."
        self.next_section("rules")
        rule = general_rule()
        s_label = Text("state", font_size=24, color=MUTED).next_to(rule[1], DOWN, buff=0.3)
        a_label = Text("action", font_size=24, color=MUTED).next_to(rule[3], DOWN, buff=0.3)
        new_label = Text("new state", font_size=24, color=MUTED).next_to(rule[6], DOWN, buff=0.3)
        self.play(
            FadeOut(actions_word, shift=0.2 * UP),
            VGroup(stage.group, arrows).animate.shift(GRID_SHIFT),
            run_time=0.8,
        )
        self.wait(1.3)
        # "...with the environment..."
        self.play(Indicate(grid, color=INK, scale_factor=1.03))
        self.wait(4)
        # "...the agent's current state and action as input..."
        self.play(FadeIn(rule[1], s_label, shift=0.2 * DOWN), run_time=0.6)
        self.wait(0.3)
        self.play(FadeIn(rule[3], a_label, shift=0.2 * DOWN), run_time=0.6)
        self.wait(0.9)

        # "...and output the agent's new state."
        self.play(FadeIn(rule[0], rule[2], rule[4]), run_time=0.6)
        self.play(FadeIn(rule[5], rule[6], new_label, shift=0.2 * DOWN), run_time=0.6)
        self.wait(0.6)

        # The general rule becomes the worked example one piece at a time, each on its word.
        # The agent is already at s5 after naming the actions.
        self.next_section("example")
        with_state = rule_with(state="s_{5}")
        with_action = rule_with(state="s_{5}", action=r"\text{right}")
        question = rule_with(state="s_{5}", action=r"\text{right}", result="?")
        answer = rule_with(state="s_{5}", action=r"\text{right}", result="s_{6}")
        # "So if the agent's state is s5..."
        self.wait(2.4)
        self.play(
            *morph_parts(rule, with_state), FadeOut(s_label),
            stage.agent.animate(rate_func=rate_functions.there_and_back).scale(1.15),
            run_time=0.6,
        )
        self.wait(2.2)
        # "...and the agent chooses the action 'right'..."
        self.play(*morph_parts(with_state, with_action), FadeOut(a_label), stage.light("right"), run_time=0.6)
        self.wait(1)
        # "...what is the resulting state?"
        self.play(*morph_parts(with_action, question), FadeOut(new_label), run_time=0.6)
        self.wait(1.6)

        # "Hopefully it's intuitive: s6."
        self.play(*morph_parts(question, answer), stage.move("right"))
        self.play(stage.unlight(), run_time=0.3)

        # "This is an example of a ... [pause] ... transition function."
        self.next_section("transition function")
        self.wait(1.6)
        heading = Text("transition function", font_size=46, color=MODEL).move_to([RIGHT_X, 0.1, 0])
        underline = Line(heading.get_left(), heading.get_right(), color=MODEL, stroke_width=3).next_to(heading, DOWN, buff=0.15)
        self.play(Write(heading), run_time=0.9)
        self.play(Create(underline), Indicate(heading, color=MODEL, scale_factor=1.08), run_time=0.7)
        self.wait(0.7)

        # "...and the environment needs this for every state-action pair."
        # The heading settles above the rule, the example generalises back to f(s, a) = s',
        # and every state-action pair streams up underneath.
        self.next_section("all pairs")
        small_heading = rule_heading()
        self.play(
            FadeOut(heading, underline, shift=0.2 * DOWN),
            FadeIn(small_heading, shift=0.2 * DOWN),
            *morph_parts(answer, general_rule()),
            run_time=0.8,
        )
        rows = stream_rows(grid)
        ghosts = VGroup(*[VGroup(*[row.copy() for _ in range(GHOSTS)]) for row in rows])
        travel = STREAM_END  # brings the last rows (s8, s9) up into view
        run_time = 3.2
        peak_speed = 1.9 * travel / run_time  # smooth's steepest slope is a little under 2
        offset = ValueTracker(0)
        motion = {"last": 0.0, "speed": 0.0}

        # Each row is placed by the scroll offset and faded at the window's edges. While the
        # stream moves fast, the row dims and a trail of fainter copies smears out below it.
        def stream(group, dt):
            value = offset.get_value()
            if dt > 0:
                motion["speed"] = (value - motion["last"]) / dt
            motion["last"] = value
            smear = min(1.0, motion["speed"] / peak_speed)
            for i, (row, trail) in enumerate(zip(rows, ghosts)):
                y = row_y(i, value)
                row.set_y(y).set_opacity(window_opacity(y) * (1 - 0.45 * smear))
                for j, ghost in enumerate(trail, 1):
                    gy = y - j * 0.16 * smear
                    ghost.set_y(gy).set_opacity(window_opacity(gy) * 0.3 * smear * (1 - j / (GHOSTS + 1)))

        holder = VGroup(ghosts, rows)
        holder.add_updater(stream)
        self.add(holder)
        self.play(offset.animate.set_value(travel), run_time=run_time, rate_func=rate_functions.smooth)
        holder.clear_updaters()
        self.remove(ghosts)
        dots = stream_dots()
        self.play(FadeIn(dots, shift=0.1 * UP), run_time=0.4)
        self.wait(0.5)

"""The reward marker: an amber star that sits in a grid cell."""

from manim import DOWN, RIGHT, UP, Flash, MathTex, Star, VGroup, rate_functions

from .theme import DOPAMINE, MUTED


class Reward(VGroup):
    def __init__(self, size=0.45, **kwargs):
        super().__init__(**kwargs)
        self.star = Star(n=5, outer_radius=size, inner_radius=0.45 * size, stroke_width=0,
                         fill_color=DOPAMINE, fill_opacity=1)
        self.add(self.star)

    def drop_into(self, point, height=5.0, run_time=0.9):
        """Fall from above and bounce into place at point."""
        self.move_to(point + height * UP)
        return self.animate(rate_func=rate_functions.ease_out_bounce, run_time=run_time).move_to(point)

    def collect(self):
        """A burst when the agent lands on it."""
        return Flash(self.get_center(), color=DOPAMINE, line_length=0.35, flash_radius=0.6, num_lines=12, run_time=0.6)


def reward_values(grid, rewards, font_size=28):
    """R(s) for every open cell, written small in the cell's bottom-right corner: amber for a
    reward, faint for 0. Returns a dict state -> MathTex."""
    values = {}
    for s in range(1, grid.rows * grid.cols + 1):
        if s in grid.walls:
            continue
        r = rewards.get(s, 0)
        tex = MathTex(str(r), font_size=font_size, color=DOPAMINE if r else MUTED)
        tex.move_to(grid.center_of(s) + 0.33 * grid.cell * (RIGHT + DOWN)).set_z_index(2)
        values[s] = tex
    return values

"""A grid-world environment. States are numbered s1, s2, ... row by row from the
top left, so a 3x3 grid has s5 in the centre."""

from manim import DOWN, LEFT, ORIGIN, RIGHT, UL, UP, MathTex, Square, VGroup

from .theme import CELL, INK, WALL

ACTIONS = {"up": UP, "down": DOWN, "left": LEFT, "right": RIGHT}
_DELTAS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}


class GridWorld(VGroup):
    def __init__(self, rows=3, cols=3, cell=1.8, walls=(), **kwargs):
        super().__init__(**kwargs)
        self.rows, self.cols, self.cell = rows, cols, cell
        self.walls = set(walls)
        self.cells = VGroup()
        for s in range(1, rows * cols + 1):
            r, c = divmod(s - 1, cols)
            fill = WALL if s in self.walls else CELL
            square = Square(side_length=cell, stroke_color=INK, stroke_width=2, fill_color=fill, fill_opacity=1)
            square.move_to(ORIGIN + (c - (cols - 1) / 2) * cell * RIGHT + (r - (rows - 1) / 2) * cell * DOWN)
            self.cells.add(square)
        self.add(self.cells)

    def __getitem__(self, s):
        """The cell for state s (1-based)."""
        return self.cells[s - 1]

    def center_of(self, s):
        return self[s].get_center()

    def make_labels(self, opacity=0.5, font_size=30):
        """Faint s_i labels in each open cell's top-left corner, clear of the agent."""
        labels = VGroup()
        for s in range(1, self.rows * self.cols + 1):
            if s in self.walls:
                continue
            label = MathTex(f"s_{{{s}}}", font_size=font_size, color=INK).set_opacity(opacity)
            label.move_to(self[s].get_corner(UL)).shift(0.14 * self.cell * (RIGHT + DOWN))
            labels.add(label)
        return labels

    def step(self, s, action):
        """The transition function f(s, a): the next state, staying put at edges and walls."""
        r, c = divmod(s - 1, self.cols)
        dr, dc = _DELTAS[action]
        r2, c2 = r + dr, c + dc
        if not (0 <= r2 < self.rows and 0 <= c2 < self.cols):
            return s
        s2 = r2 * self.cols + c2 + 1
        return s if s2 in self.walls else s2


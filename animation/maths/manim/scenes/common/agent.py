"""The agent glyph: a round face whose expression can change, with a
'brain' that equations can be absorbed into."""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    AnimationGroup,
    ArcBetweenPoints,
    CapStyleType,
    Circle,
    Ellipse,
    Intersection,
    Line,
    ManimColor,
    MathTex,
    Rectangle,
    Succession,
    Transform,
    UpdateFromAlphaFunc,
    VGroup,
    VMobject,
    interpolate_color,
    smooth,
    there_and_back,
)

from .theme import HOMEO, INK, MODEL, MUTED

EXPRESSIONS = ("blank", "happy", "sad", "open", "wavy", "weary", "tight")
MOODS = ("blank", "dumb", "tired", "thirsty", "satisfied", "overfull")
SWEAT, BLUSH, TONGUE = "#8ec9ef", "#e58c9a", "#e58c9a"
FACE = "#1a1530"  # head fill: background tinted towards violet


def teardrop(size):
    """A drop of sweat, point up: size is its height."""
    rho = size / 2
    ts = np.linspace(0, 2 * np.pi, 40)
    drop = VMobject().set_points_smoothly([rho * np.array([np.sin(t) * np.sin(t / 2), np.cos(t), 0]) for t in ts])
    drop.set_stroke(width=0).set_fill(SWEAT, opacity=0.95)
    glint = Circle(radius=0.12 * rho, stroke_width=0, fill_color="#ffffff", fill_opacity=0.7).move_to(
        rho * np.array([-0.18, -0.35, 0]))
    return VGroup(drop, glint)


def _set_opacity(mob, opacity):
    """Set every part's fill and stroke opacity (set_opacity would fill outlines); returns mob."""
    for part in mob.family_members_with_points():
        part.set_fill(opacity=opacity if part.get_fill_opacity() > 0 else 0)
        part.set_stroke(opacity=opacity if part.get_stroke_opacity() > 0 else 0)
    return mob


def soft_disc(radius, color, strength=1.0, layers=10):
    """A soft-edged disc: stacked translucent discs, densest at the centre (a blush, a glow)."""
    return VGroup(*[
        Circle(radius=radius * (k + 1) / layers, stroke_width=0, fill_color=color, fill_opacity=0.06 * strength)
        for k in range(layers)
    ])


class Agent(VGroup):
    def __init__(self, radius=1.0, expression="blank", **kwargs):
        super().__init__(**kwargs)
        self.head = Circle(radius=radius, stroke_color=MODEL, stroke_width=4, fill_color=FACE, fill_opacity=1)
        self.eyes = self.make_eyes("open")
        self.mouth = self.make_mouth(expression)
        self.marks = VGroup()  # what a mood adds to the face: lids, sweat, blush, a tongue
        self.add(self.head, self.eyes, self.mouth, self.marks)
        self._moving = self.marks  # the marks the idle motion moves (a drop of sweat, bubbles)
        self._faded = []  # old marks set_mood has faded out, dropped at the next change
        self.kind = "blank"
        self._pose = (0.0, 0.0, 0.0, 1.0)  # tilt, dx, dy (in radii) and how open the mouth is
        self._idle = None
        self._clock = 0.0

    @property
    def radius(self):
        return self.head.height / 2  # (a puffed head is wider, never taller)

    def make_head(self, kind="round"):
        """The head outline: "round", or "puffed", bulging at the cheeks."""
        r, c = self.radius, self.head.get_center()
        if kind == "round":
            return Circle(radius=r).match_style(self.head).move_to(c)
        if kind != "puffed":
            raise ValueError("head must be round or puffed")

        def bulge(a, centre):  # a smooth bump around the angle centre
            return np.exp(-(((a - centre + np.pi) % (2 * np.pi) - np.pi) / 0.42) ** 2)

        angles = np.linspace(0, 2 * np.pi, 72, endpoint=False)
        radii = [r * (1 + 0.09 * (bulge(a, -0.55) + bulge(a, np.pi + 0.55))) for a in angles]
        head = VMobject().set_points_smoothly([c + q * np.array([np.cos(a), np.sin(a), 0]) for a, q in zip(angles, radii)]
                                              + [c + radii[0] * RIGHT])
        return head.match_style(self.head)

    def make_eyes(self, kind="open"):
        """Eyes for the head's current size and position; Transform self.eyes into them.
        "open" (the usual ovals), "heavy" (half closed under drooping lids), "squeeze" (shut tight:
        > <) or "derp" (one small and low, one big and high)."""
        r, c = self.radius, self.head.get_center()
        eyes = VGroup()
        for side in (-1, 1):
            at = c + r * (0.33 * side * RIGHT + 0.12 * UP)
            oval = Ellipse(width=0.15 * r, height=0.24 * r, stroke_width=0, fill_color=INK, fill_opacity=1).move_to(at)
            if kind == "open":
                eye = oval
            elif kind == "heavy":  # only the lower half shows, under a lid that droops to the outside
                lid = Rectangle(width=0.5 * r, height=0.4 * r).move_to(at, aligned_edge=UP).shift(0.02 * r * DOWN)
                eye = Intersection(oval, lid.rotate(-0.22 * side, about_point=at)).set_fill(INK, opacity=1).set_stroke(width=0)
            elif kind == "squeeze":
                w, h = 0.09 * r, 0.075 * r
                eye = VMobject().set_points_as_corners([at + side * w * RIGHT + h * UP, at - side * w * RIGHT,
                                                        at + side * w * RIGHT + h * DOWN])
                eye.set_stroke(INK, width=3.5).set_fill(opacity=0)
                eye.cap_style = CapStyleType.ROUND
            elif kind == "derp":
                eye = oval.scale(0.7 if side < 0 else 1.25).shift(r * (0.06 * DOWN if side < 0 else 0.05 * UP))
            else:
                raise ValueError("eyes must be open, heavy, squeeze or derp")
            eyes.add(eye)
        return eyes

    def make_mouth(self, expression):
        """A mouth for the head's current size and position; Transform self.mouth into it."""
        r = self.radius
        c = self.head.get_center()
        left = c + r * (0.26 * LEFT + 0.4 * DOWN)
        right = c + r * (0.26 * RIGHT + 0.4 * DOWN)
        if expression == "blank":
            mouth = Line(left, right)
        elif expression == "happy":
            mouth = ArcBetweenPoints(left, right, angle=0.9)
        elif expression == "sad":
            mouth = ArcBetweenPoints(left + 0.1 * r * DOWN, right + 0.1 * r * DOWN, angle=-0.9)
        elif expression == "weary":  # small, slack and turned down
            mouth = ArcBetweenPoints(left + 0.12 * r * (RIGHT + DOWN), right + 0.12 * r * (LEFT + DOWN), angle=-0.6)
        elif expression == "open":  # a small dry "o": panting, thirsty
            mouth = Ellipse(width=0.26 * r, height=0.18 * r).move_to(c + 0.42 * r * DOWN)
        elif expression in ("wavy", "tight"):  # queasy: lips pressed together
            width = 0.28 if expression == "wavy" else 0.16
            xs = np.linspace(-width, width, 25)
            mouth = VMobject().set_points_smoothly([c + r * np.array([x, -0.44 + 0.04 * np.sin(x * 38), 0]) for x in xs])
        else:
            raise ValueError(f"expression must be one of {EXPRESSIONS}")
        mouth.set_stroke(INK, width=3.5)
        mouth.cap_style = CapStyleType.ROUND
        return mouth

    def mood(self, kind):
        """The face for a mood, built for the agent at rest: returns (eyes, mouth, marks).
        "blank", "dumb" (mismatched eyes, the tongue poking out), "tired" (heavy lids, bags, a
        weary mouth, a drop of sweat), "thirsty" (panting, a drop of sweat), "satisfied" (a smile) or
        "overfull" (eyes squeezed shut, lips pressed, puffed and flushed cheeks, rising bubbles).
        Use set_mood() to animate into it or show_mood() to apply it at once."""
        r, c = self.radius, self.head.get_center()
        marks = VGroup()
        eyes = self.make_eyes({"dumb": "derp", "tired": "heavy", "overfull": "squeeze"}.get(kind, "open"))
        mouth = self.make_mouth({"tired": "weary", "thirsty": "open", "satisfied": "happy",
                                 "overfull": "tight"}.get(kind, "blank"))
        if kind == "dumb":  # the tongue pokes out from under the plain mouth, a little off-centre
            tongue = Ellipse(width=0.14 * r, height=0.14 * r, stroke_width=0, fill_color=TONGUE, fill_opacity=1)
            marks.add(tongue.move_to(mouth.get_center() + r * np.array([0.08, -0.06, 0])))
        if kind == "tired":
            for side, eye in zip((-1, 1), eyes):
                at = c + r * (0.33 * side * RIGHT + 0.12 * UP) + 0.02 * r * DOWN  # the middle of the lid's edge
                lid = Line(at + 0.12 * r * LEFT, at + 0.12 * r * RIGHT).rotate(-0.22 * side).set_stroke(INK, width=3)
                bag = ArcBetweenPoints(eye.get_bottom() + 0.07 * r * (LEFT + DOWN), eye.get_bottom() + 0.07 * r * (RIGHT + DOWN),
                                       angle=0.9).set_stroke(MUTED, width=2, opacity=0.6)
                marks.add(lid, bag)
        if kind in ("tired", "thirsty"):
            marks.drop = teardrop(0.2 * r).move_to(c + r * np.array([0.88, 0.45, 0]))
            marks.add(marks.drop)
        if kind == "overfull":
            for side in (-1, 1):
                marks.add(soft_disc(0.16 * r, BLUSH, strength=1.6).move_to(c + r * np.array([side * 0.62, -0.22, 0])))
            # Made at the mouth, not at the origin: even while invisible they count towards the agent's
            # size, so anything that centres or scales the agent would otherwise pull it off its face.
            marks.bubbles = VGroup(*[Circle(radius=0.05 * r).set_stroke(SWEAT, width=3, opacity=0).move_to(mouth)
                                     for _ in range(3)])
            marks.add(marks.bubbles)
        return eyes, mouth, marks.set_z_index(self.z_index + 1)

    def show_mood(self, kind):
        """Put the face straight into a mood (no animation)."""
        self.stop_idle()
        self._set_pose(0, 0, 0, 1)
        eyes, mouth, marks = self.mood(kind)
        self.head.become(self.make_head("puffed" if kind == "overfull" else "round"))
        self.eyes.become(eyes)
        self.mouth.become(mouth)
        self.marks.remove(*self.marks.submobjects)
        self.marks.add(*marks)
        self._faded = []
        self._moving = marks
        self.kind = kind
        return self

    def set_mood(self, kind, run_time=0.8):
        """Animate into a mood: the eyes and mouth change shape, the old marks fade and the new ones
        appear, and any idle motion settles back. Call idle() afterwards to keep the new mood moving.

        Everything is animated in place, as one group that is the agent itself. Animating the parts as
        separate mobjects, or fading marks with FadeIn / FadeOut (which add them to and remove them from
        the scene), makes the scene split the agent into loose pieces, and its idle motion stops."""
        self.stop_idle()
        self.marks.remove(*self._faded)  # marks the previous change faded out
        pose = self._pose
        self._set_pose(0, 0, 0, 1)  # build the new face at rest...
        head = self.make_head("puffed" if kind == "overfull" else "round")
        eyes, mouth, marks = self.mood(kind)
        self._set_pose(*pose)  # ...and animate to it from where the face is now
        self._pose = (0.0, 0.0, 0.0, 1.0)
        old = VGroup(*self.marks.submobjects)
        shown = marks.copy()
        _set_opacity(marks, 0)  # the new marks start invisible, in place
        self.marks.add(*marks)
        self._faded = list(old.submobjects)
        self._moving = marks
        self.kind = kind
        anims = [Transform(self.head, head), Transform(self.eyes, eyes), Transform(self.mouth, mouth)]
        if old.submobjects:
            anims.append(Transform(old, _set_opacity(old.copy(), 0)))
        if marks.submobjects:
            anims.append(Transform(marks, shown))
        return AnimationGroup(*anims, group=self, run_time=run_time)

    def idle(self):
        """Keep the current mood alive while the agent is on screen: a dumb wobble, a tired nod with
        sweat running down, a thirsty pant, or an overfull queasy sway with hiccups and rising bubbles.
        It pauses while the agent is animated, and stops at the next set_mood() or stop_idle()."""
        motion = IDLE.get(self.kind)
        if motion is None:
            return self
        self.stop_idle()

        def update(_, dt):
            self._clock += dt
            motion(self, self._clock)

        self._idle = update
        self.add_updater(update)
        return self

    def stop_idle(self):
        """Stop the idle motion, leaving the face where it is."""
        if self._idle is not None:
            self.remove_updater(self._idle)
            self._idle = None
        return self

    def _set_pose(self, tilt, dx, dy, pant):
        """Move the face from its current pose to a new one: tilted about the head's centre, shifted
        (in radii) and with the mouth opened by a factor. Exactly undoes itself."""
        t0, x0, y0, p0 = self._pose
        r = self.radius
        face = VGroup(self.head, self.eyes, self.mouth, self.marks)
        face.shift(r * ((dx - x0) * RIGHT + (dy - y0) * UP))
        face.rotate(tilt - t0, about_point=self.head.get_center())
        if pant != p0:
            self.mouth.stretch(pant / p0, 1)
        self._pose = (tilt, dx, dy, pant)

    def blink(self):
        """Close and reopen the eyes."""
        return self.eyes.animate(rate_func=there_and_back, run_time=0.3).stretch(0.1, 1)

    def make_hands(self):
        """Shrugging arms, like ¯\\_(ツ)_/¯: out from each side of the head, then up."""
        r, c = self.radius, self.head.get_center()
        hands = VGroup()
        for side in (-1, 1):
            corners = [c + r * np.array(p) for p in ((side * 0.95, -0.32, 0), (side * 1.45, -0.32, 0), (side * 1.85, 0.3, 0))]
            hand = VMobject().set_points_as_corners(corners).set_stroke(INK, width=4.5)
            hand.cap_style = CapStyleType.ROUND
            hands.add(hand)
        return hands.set_z_index(self.z_index)

    def shrug(self, hands, times=2):
        """Bob the hands up and back, `times` times."""
        lift = 0.14 * self.radius * np.array((0, 1, 0))
        return Succession(*[
            hands.animate(rate_func=there_and_back, run_time=0.35).shift(lift) for _ in range(times)
        ])

    def brain_point(self):
        return self.head.get_center() + 0.55 * self.radius * UP


def _bump(x, width):
    return np.exp(-(x / width) ** 2)


def _slide_drop(agent, t, period=2.2):
    """The drop of sweat runs down the temple, fades and starts again."""
    drop = getattr(agent._moving, "drop", None)
    if drop is None:
        return
    r, c = agent.radius, agent.head.get_center()
    p = (t % period) / period
    drop.move_to(c + r * np.array([0.88 + 0.06 * p, 0.45 - 0.55 * p ** 1.6, 0]))
    drop[0].set_fill(opacity=0.95 * (1 - p ** 4) * min(1, 6 * p))
    drop[1].set_fill(opacity=0.7 * (1 - p ** 4) * min(1, 6 * p))


def _idle_dumb(agent, t):
    agent._set_pose(0.09 * np.sin(2 * np.pi * t / 2.4), 0.03 * np.sin(2 * np.pi * t / 2.4), 0, 1)


def _idle_tired(agent, t):
    # Nodding off: the head sinks slowly, then jerks back up.
    p = (t % 3.0) / 3.0
    sink = smooth(min(1, p / 0.8)) if p < 0.8 else 1 - smooth((p - 0.8) / 0.2)
    agent._set_pose(0.06 * sink, 0, -0.06 * sink, 1)
    _slide_drop(agent, t)


def _idle_thirsty(agent, t):
    agent._set_pose(0, 0, 0.015 * np.sin(2 * np.pi * t / 0.8), 1 + 0.35 * np.sin(2 * np.pi * t / 0.8))
    _slide_drop(agent, t)


def _idle_overfull(agent, t):
    # A queasy sway, a hiccup every couple of seconds, and bubbles rising from the mouth.
    hic = _bump((t % 2.4) - 0.25, 0.07)
    agent._set_pose(0.07 * np.sin(2 * np.pi * t / 2.0), 0.02 * np.sin(2 * np.pi * t / 2.0), 0.07 * hic, 1)
    r, mouth = agent.radius, agent.mouth.get_center()
    for k, bubble in enumerate(agent._moving.bubbles):
        p = ((t + 0.6 * k) % 1.8) / 1.8
        bubble.set(width=r * (0.1 + 0.1 * p)).move_to(
            # Up and out over the cheek, clear of the eye and inside the head.
            mouth + r * np.array([0.3 + 0.45 * p + 0.04 * np.sin(7 * p + k), -0.05 + 0.6 * p, 0]))
        bubble.set_stroke(opacity=np.sin(np.pi * p))


IDLE = {"dumb": _idle_dumb, "tired": _idle_tired, "thirsty": _idle_thirsty, "overfull": _idle_overfull}


def neon(alpha):
    """Brightness of a neon sign switching on: a few stutters, a full blaze, then a slow settle back."""
    for start, end, level in ((0, 0.05, 0.8), (0.05, 0.09, 0.1), (0.09, 0.13, 1), (0.13, 0.17, 0.35)):
        if start <= alpha < end:
            return level
    return 1 if alpha < 0.5 else 1 - smooth((alpha - 0.5) / 0.5)


def light_up(agent, brain=None, color=MODEL, settle=None, run_time=1.8):
    """The brain switches on like a neon sign: a few stutters, a full blaze with a soft glow over the
    head, then a slow settle. With brain (the disc and H from brain_light) it drives them, ending at
    `settle` opacity (default: the disc's current one); without, a disc of `color` glows in the brain
    and goes out again."""
    if brain is None:
        disc, h = Circle(radius=0.26 * agent.radius, stroke_width=0, fill_color=color, fill_opacity=0).move_to(
            agent.brain_point()).set_z_index(agent.z_index + 1), None
    else:
        disc, h = brain
    base = disc.get_fill_opacity() if settle is None else settle
    layers = 18  # stacked translucent discs: a smooth falloff
    halo = VGroup(*[
        Circle(radius=1.1 * agent.radius * (k + 1) / layers, stroke_width=0, fill_color=color, fill_opacity=0)
        for k in range(layers)
    ]).move_to(disc).set_z_index(agent.z_index + 0.5)  # over the face, under the disc and the H

    def update(_, alpha):
        v = neon(alpha)
        disc.set_fill(opacity=base + (0.8 - base) * v)
        if h is not None:
            h.set_fill(interpolate_color(ManimColor(color), ManimColor(INK), v), opacity=1)
        for layer in halo:
            layer.set_fill(opacity=0.025 * v)

    shown = VGroup(halo) if brain is not None else VGroup(halo, disc)
    return UpdateFromAlphaFunc(shown, update, run_time=run_time, remover=True)


def absorb(mob, agent, brain=None, color=MODEL, settle=None, glide_time=1.3, glow_time=1.8):
    """A property goes into the agent's brain: the same beat for every equation the agent takes in.
    mob glides in on a gentle arc, shrinking into the brain (drawn in front of the head all the way),
    and the brain lights up like a neon sign (light_up). mob is removed from the scene."""
    mob.set_z_index(agent.z_index + 3)
    landed = mob.copy()
    # It lands inside the brain disc and has faded out by then (a Succession only removes it at the
    # very end, so anything left visible would sit over the brain while it lights up).
    landed.scale(min(1, 0.3 * agent.radius / max(landed.width, landed.height))).move_to(agent.brain_point())
    for part in landed.family_members_with_points():  # (fill and stroke separately, so outlines don't fill)
        part.set_fill(opacity=0)
        part.set_stroke(opacity=0)
    return Succession(
        Transform(mob, landed, path_arc=0.6, rate_func=smooth, run_time=glide_time, remover=True),
        light_up(agent, brain, color, settle, run_time=glow_time),
    )


def brain_light(agent):
    """The teal disc and H in the agent's brain (its internal state), sized to sit clear of the eyes."""
    glow = Circle(radius=0.26 * agent.radius, stroke_width=0, fill_color=HOMEO, fill_opacity=0.35).move_to(
        agent.brain_point()).set_z_index(agent.z_index + 1)
    h = MathTex("H", font_size=27 * agent.radius / 1.08, color=HOMEO).move_to(glow).set_z_index(agent.z_index + 2)
    return VGroup(glow, h)

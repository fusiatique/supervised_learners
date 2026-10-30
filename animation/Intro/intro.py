"""
INTRO animation - The Supervised Learners

Make the video (in the VS Code terminal):
    manim -qh intro.py Intro
"""



from manim import *

BG = "#111318"
TEAL = "#1D9E75"
DRUG = "#D4537E"
NATURAL = "#639922"
GOLD = "#EF9F27"
HARM = "#E24B4A"
GREY = "#5F5E5A"

config.background_color = BG


# ---------- reusable pieces ----------

def robot(scale=1.0):
    """Simple robot agent: head, eyes, antenna, body."""
    head = RoundedRectangle(corner_radius=0.15, width=1.0, height=0.8,
                            color=WHITE, fill_color="#2C2C2A", fill_opacity=1)
    eye_l = Dot(head.get_center() + LEFT * 0.22 + UP * 0.05, radius=0.08, color=TEAL)
    eye_r = Dot(head.get_center() + RIGHT * 0.22 + UP * 0.05, radius=0.08, color=TEAL)
    antenna = Line(head.get_top(), head.get_top() + UP * 0.25, color=WHITE)
    bulb = Dot(antenna.get_end(), radius=0.06, color=GOLD)
    body = RoundedRectangle(corner_radius=0.1, width=0.7, height=0.6,
                            color=WHITE, fill_color="#2C2C2A", fill_opacity=1)
    body.next_to(head, DOWN, buff=0.05)
    bot = VGroup(body, head, eye_l, eye_r, antenna, bulb)
    bot.head = head
    return bot.scale(scale)


def stick_figure():
    head = Circle(radius=0.3, color=WHITE)
    torso = Line(head.get_bottom(), head.get_bottom() + DOWN * 1.0, color=WHITE)
    arms = Line(LEFT * 0.5, RIGHT * 0.5, color=WHITE).move_to(torso.get_center() + UP * 0.2)
    leg_l = Line(torso.get_end(), torso.get_end() + DOWN * 0.7 + LEFT * 0.35, color=WHITE)
    leg_r = Line(torso.get_end(), torso.get_end() + DOWN * 0.7 + RIGHT * 0.35, color=WHITE)
    return VGroup(head, torso, arms, leg_l, leg_r)


def drug_icon():
    pill = RoundedRectangle(corner_radius=0.18, width=0.75, height=0.36,
                            color=DRUG, fill_color=DRUG, fill_opacity=0.9)
    split = Line(pill.get_top(), pill.get_bottom(), color=BG, stroke_width=3)
    return VGroup(pill, split)


def natural_icon():
    apple = Circle(radius=0.25, color=NATURAL, fill_color=NATURAL, fill_opacity=0.9)
    leaf = Ellipse(width=0.18, height=0.1, color=NATURAL, fill_opacity=1).next_to(apple, UP, buff=0)
    return VGroup(apple, leaf)


def track(n=7, size=0.9):
    """The straight-line environment: a row of states."""
    cells = VGroup(*[Square(side_length=size, color=GREY) for _ in range(n)])
    cells.arrange(RIGHT, buff=0)
    return cells


def glow(mob, color, radius=0.7, opacity=0.35):
    return Circle(radius=radius, stroke_width=0, fill_color=color,
                  fill_opacity=opacity).move_to(mob)


def brain():
    """Brain outline with the three regions from the bio part."""
    outline = Ellipse(width=4.2, height=3.0, color=GREY)
    pfc = LabeledDot(Text("PFC", font_size=20), radius=0.35, color="#534AB7").move_to(outline.get_center() + LEFT * 1.25 + UP * 0.45)
    nacc = LabeledDot(Text("NAcc", font_size=18), radius=0.35, color="#534AB7").move_to(outline.get_center() + LEFT * 0.15 + DOWN * 0.3)
    vta = LabeledDot(Text("VTA", font_size=20), radius=0.35, color="#534AB7").move_to(outline.get_center() + RIGHT * 1.2 + DOWN * 0.6)
    p1 = Line(vta.get_left(), nacc.get_right(), color=GOLD, stroke_width=3)
    p2 = ArcBetweenPoints(vta.get_top(), pfc.get_right(), angle=0.6, color=GOLD, stroke_width=3)
    g = VGroup(outline, p1, p2, pfc, nacc, vta)
    g.pfc, g.nacc, g.vta, g.p_nacc, g.p_pfc = pfc, nacc, vta, p1, p2
    return g


def gauge(level=0.5, target=0.5, height=3.0):
    """Vertical bar H with dashed target line H*."""
    frame = Rectangle(width=0.7, height=height, color=GREY)
    bar = Rectangle(width=0.7, height=height * level, stroke_width=0,
                    fill_color=TEAL, fill_opacity=0.9)
    bar.align_to(frame, DOWN)
    tgt = DashedLine(LEFT * 0.6, RIGHT * 0.6, color=GOLD, stroke_width=4)
    tgt.move_to(frame.get_bottom() + UP * height * target)
    lab_h = Text("H", font_size=24, color=TEAL).next_to(frame, DOWN)
    lab_t = Text("H*", font_size=24, color=GOLD).next_to(tgt, RIGHT)
    return frame, bar, tgt, lab_h, lab_t


# ---------- Intro ----------

class Intro(Scene):
    def construct(self):
        person = stick_figure().shift(LEFT * 2)
        obj = Star(n=5, outer_radius=0.4, color=GOLD, fill_opacity=0.9).shift(RIGHT * 2.5)
        halo = glow(obj, GOLD, radius=0.8)
        self.play(FadeIn(person), FadeIn(halo), FadeIn(obj))
        self.play(halo.animate.scale(1.2), rate_func=there_and_back, run_time=1.2)

        # step away, hesitate, turn back
        self.play(person.animate.shift(LEFT * 1.5), run_time=1.2)
        self.wait(0.6)
        self.play(Wiggle(person, scale_value=1.05), run_time=0.8)
        self.play(person.animate.shift(RIGHT * 1.5), run_time=1.0)

        q = Text("?", font_size=72, color=WHITE).next_to(person, UP)
        self.play(FadeIn(q, shift=UP * 0.3))
        self.wait(0.8)

        # person -> robot, object -> reward on a line
        bot = robot().move_to(person).shift(UP * 0.3)
        line = track(5).move_to(DOWN * 2.2)
        reward = drug_icon().move_to(line[-1])
        self.play(FadeOut(q), Transform(person, bot), FadeOut(halo),
                  Transform(obj, reward), Create(line), run_time=1.8)
        self.play(person.animate.scale(0.7).move_to(line[0].get_center() + UP * 1.0), run_time=1.0)
        self.wait(0.5)

        title = Text("We are the supervised learners.", font_size=40).to_edge(UP)
        self.play(Write(title))
        self.wait(1.5)



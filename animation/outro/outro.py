"""
OUTRO animations - The Supervised Learners
Three videos: BringingTogether, WhereItGoesWrong, Conclusion

Make all three videos (in the VS Code terminal):
    manim -qh -a outro.py
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


# ---------- Outro 1 ----------

class BringingTogether(Scene):
    def construct(self):
        divider = Line(UP * 4, DOWN * 4, color=GREY)
        b = brain().scale(0.9).shift(LEFT * 3.5 + DOWN * 0.3)
        bot = robot(0.8).shift(RIGHT * 3.5 + UP * 1.6)
        line = track(5, 0.6).shift(RIGHT * 3.5 + DOWN * 0.6)
        self.play(Create(divider), FadeIn(b), FadeIn(bot), Create(line))

        # four pairs, one dotted line each
        cue = Text("cue", font_size=20).next_to(b, UP, buff=0.15)
        values = VGroup(*[Text("V", font_size=18, color=GOLD).next_to(c, UP, buff=0.05) for c in line])
        arrows = VGroup(*[Arrow(c.get_left(), c.get_right(), buff=0.12, color=TEAL, stroke_width=3,
                                max_tip_length_to_length_ratio=0.3) for c in line])
        pairs = [
            ("states ↔ cues", line[2], cue, [cue]),
            ("value ↔ accumbens", values, b.nacc, [values]),
            ("policy ↔ prefrontal cortex", arrows, b.pfc, [arrows]),
            ("error ↔ dopamine", bot, b.vta, []),
        ]
        connectors = VGroup()
        label = None
        for i, (txt, agent_part, brain_part, extras) in enumerate(pairs):
            new_label = Text(txt, font_size=28).to_edge(DOWN)
            if extras:
                self.play(*[FadeIn(e) for e in extras], run_time=0.6)
            dl = DashedLine(agent_part.get_left(), brain_part.get_right(), color=GOLD, dash_length=0.12)
            anims = [Create(dl), Indicate(agent_part, color=GOLD), Indicate(brain_part, color=GOLD)]
            anims.append(Transform(label, new_label) if label else FadeIn(new_label))
            self.play(*anims, run_time=1.4)
            if label is None:
                label = new_label
            connectors.add(dl)
            self.wait(0.6)

        # pulse along dopamine pathways and through the agent
        p1 = Dot(color=GOLD).move_to(b.p_nacc.get_start())
        p2 = Dot(color=GOLD).move_to(b.p_pfc.get_start())
        self.play(MoveAlongPath(p1, b.p_nacc), MoveAlongPath(p2, b.p_pfc),
                  Flash(bot, color=GOLD), run_time=1.2)
        self.play(FadeOut(p1), FadeOut(p2))
        self.wait(1)


# ---------- Outro 2 ----------
class WhereItGoesWrong(Scene):
    def construct(self):
        # --- "Now let's translate addiction into robot language." ---
        bot = robot(1.3)
        self.play(FadeIn(bot))
        book = VGroup(
            Rectangle(width=1.4, height=1.0, color=GOLD, fill_color="#412402", fill_opacity=1),
            Text("Human → Maths", font_size=16, color=GOLD),
        ).next_to(bot, RIGHT, buff=0.3).shift(DOWN * 0.3)
        self.play(FadeIn(book, shift=LEFT * 0.5))
        page_l = Rectangle(width=1.2, height=1.0, color=WHITE, fill_color="#F1EFE8", fill_opacity=1)
        pages = VGroup(page_l, page_l.copy()).arrange(RIGHT, buff=0.02).move_to(book)
        lines = VGroup(*[Line(LEFT * 0.4, RIGHT * 0.4, color=GREY, stroke_width=2) for _ in range(6)])
        lines[:3].arrange(DOWN, buff=0.15).move_to(pages[0])
        lines[3:].arrange(DOWN, buff=0.15).move_to(pages[1])
        opened = VGroup(pages, lines)
        self.play(ReplacementTransform(book, opened), run_time=0.9)
        e0, e1 = bot[2], bot[3]
        glasses = VGroup(
            Circle(radius=0.22, color=WHITE).move_to(e0),
            Circle(radius=0.22, color=WHITE).move_to(e1),
            Line(e0.get_center() + RIGHT * 0.22, e1.get_center() + LEFT * 0.22, color=WHITE),
        )
        self.play(FadeIn(glasses, shift=DOWN * 0.6), run_time=0.8)
        self.wait(1.2)
        self.play(FadeOut(VGroup(bot, opened, glasses)))

        # --- hijacked value, stuck policy, changed agent ---
        line = track(7).shift(UP * 1.5 + LEFT * 1.5)
        drug = drug_icon().move_to(line[-1])
        nat_a = natural_icon().move_to(line[0])
        nat_b = natural_icon().move_to(line[1])
        bot = robot(0.55).next_to(line[3], UP, buff=0.1)
        self.play(Create(line), FadeIn(drug), FadeIn(nat_a), FadeIn(nat_b), FadeIn(bot))
        halo = glow(drug, DRUG, radius=0.55, opacity=0.2)
        self.add(halo); self.bring_to_front(drug)
        self.play(halo.animate.scale(1.5).set_fill(opacity=0.45),
                  nat_a.animate.set_opacity(0.25), nat_b.animate.set_opacity(0.25), run_time=1.5)
        start = bot.get_center()
        end = np.array([line[-1].get_x(), start[1], 0])
        for _ in range(3):
            self.play(bot.animate.move_to(end), run_time=0.7)
            self.play(Flash(drug, color=DRUG), run_time=0.4)
            self.play(bot.animate.move_to(start), run_time=0.5)

        frame, bar, tgt, lab_h, lab_t = gauge(level=0.4, target=0.4)
        g = VGroup(frame, bar, tgt, lab_h, lab_t).shift(RIGHT * 4.6 + DOWN * 1.3)
        self.play(FadeIn(g))
        gap = always_redraw(lambda: Rectangle(
            width=0.25, height=max(0.001, tgt.get_y() - bar.get_top()[1]),
            stroke_width=0, fill_color=HARM, fill_opacity=0.9
        ).move_to([frame.get_left()[0] - 0.25, (tgt.get_y() + bar.get_top()[1]) / 2, 0]))
        self.add(gap)
        base_h = bar.height
        for _ in range(3):
            self.play(bar.animate.stretch_to_fit_height(frame.height * 0.85, about_edge=DOWN), run_time=0.4)
            self.play(bar.animate.stretch_to_fit_height(base_h, about_edge=DOWN),
                      tgt.animate.shift(UP * 0.35), lab_t.animate.shift(UP * 0.35), run_time=0.9)
        self.wait(1)

        # --- "And harm doesn't fix it." ---
        sign = VGroup(
            Triangle(color=HARM, fill_color=HARM, fill_opacity=0.25).scale(0.6),
            Text("!", font_size=40, color=HARM),
            Text("Harm", font_size=24, color=HARM),
        )
        sign[1].move_to(sign[0]).shift(DOWN * 0.08)
        sign[2].next_to(sign[0], DOWN, buff=0.1)
        sign.next_to(line[4], DOWN, buff=0.4)
        self.play(FadeIn(sign, shift=DOWN * 0.5), run_time=0.8)
        self.play(Wiggle(sign), run_time=0.8)
        self.play(bot.animate.move_to(end), run_time=2, rate_func=linear)
        self.play(Flash(drug, color=DRUG))
        self.wait(1)


# ---------- Outro 3 ----------
class Conclusion(MovingCameraScene):
    def construct(self):
        # --- the question, agent between drug and natural reward ---
        q = Text("So why would someone keep making\na choice they know is harmful?",
                 font_size=38, line_spacing=1.2).to_edge(UP)
        line = track(7).shift(DOWN * 1.2)
        drug = drug_icon().move_to(line[-1])
        nat = natural_icon().move_to(line[0])
        bot = robot(0.55).next_to(line[3], UP, buff=0.1)
        self.play(Write(q), run_time=2)
        self.play(Create(line), FadeIn(drug), FadeIn(nat), FadeIn(bot))
        self.play(bot.animate.shift(LEFT * 0.15), run_time=0.4)
        self.play(bot.animate.shift(RIGHT * 0.3), run_time=0.5)
        self.play(bot.animate.shift(LEFT * 0.15), run_time=0.4)
        self.wait(0.8)

        # --- values rewritten: drug brighter, natural reward fades ---
        halo_d = glow(drug, DRUG, radius=0.5, opacity=0.15)
        halo_n = glow(nat, NATURAL, radius=0.7, opacity=0.35)
        self.add(halo_d, halo_n); self.bring_to_front(drug, nat)
        self.play(halo_d.animate.scale(1.8).set_fill(opacity=0.5), drug.animate.scale(1.3),
                  halo_n.animate.scale(0.4).set_fill(opacity=0.05),
                  nat.animate.set_opacity(0.25), FadeOut(q), run_time=2.5)
        self.wait(0.8)

        # --- Bellman quote, "irrational" crossed out, agent turns to natural reward ---
        l1 = Text("\u201cIn dealing with a human being and a human society,", font_size=28)
        pre = Text("we enjoy the luxury of being", font_size=28)
        word = Text("irrational,", font_size=28, color=GOLD)
        l2 = VGroup(pre, word).arrange(RIGHT, buff=0.15)
        l3 = Text("illogical and inconsistent.\u201d", font_size=28)
        quote = VGroup(l1, l2, l3).arrange(DOWN, buff=0.2).shift(UP * 1.9)
        who = Text("Richard Bellman, 1966", font_size=20, color=GREY).next_to(quote, DOWN)
        self.play(FadeIn(quote), FadeIn(who), run_time=1.2)
        self.wait(0.6)
        self.play(Create(Line(word.get_left(), word.get_right(), color=HARM, stroke_width=6)), run_time=0.6)
        self.wait(0.4)
        nat.set_opacity(1)
        self.play(halo_d.animate.set_fill(opacity=0.15).scale(0.6), drug.animate.scale(1 / 1.3),
                  halo_n.animate.scale(2.5).set_fill(opacity=0.35), run_time=1)
        self.play(bot.animate.flip(UP), run_time=0.4)
        self.play(bot.animate.shift(LEFT * 1.6), run_time=1.8)
        self.play(Flash(nat, color=NATURAL))
        self.wait(0.6)
        self.play(*[FadeOut(m) for m in self.mobjects])

        # --- split screen returns, brain and agent light up together ---
        divider = Line(UP * 4, DOWN * 4, color=GREY)
        b = brain().scale(0.9).shift(LEFT * 3.5)
        bot = robot(1.0).shift(RIGHT * 3.5)
        bg = glow(b, GOLD, radius=2.3, opacity=0.0)
        rg = glow(bot, GOLD, radius=1.3, opacity=0.0)
        self.add(bg, rg)
        self.play(Create(divider), FadeIn(b), FadeIn(bot))
        self.play(bg.animate.set_fill(opacity=0.3), rg.animate.set_fill(opacity=0.3),
                  *[r.animate.set_color(GOLD) for r in (b.pfc, b.nacc, b.vta)],
                  bot[2].animate.set_color(GOLD), bot[3].animate.set_color(GOLD), run_time=1.5)
        self.wait(1)

        # --- zoom into the agent's head, brain glows, fade to black ---
        self.play(FadeOut(VGroup(divider, b, bg, rg)))
        head = bot.head
        brain_glow = Circle(radius=0.25, stroke_width=0, fill_color=GOLD,
                            fill_opacity=0).move_to(head.get_center() + UP * 0.05)
        self.add(brain_glow)
        self.play(self.camera.frame.animate.set(width=head.width * 1.8).move_to(head),
                  run_time=3, rate_func=smooth)
        self.play(brain_glow.animate.set_fill(opacity=0.45).scale(1.3), run_time=1.5)
        self.play(FadeOut(VGroup(bot, brain_glow)), run_time=2.5)

        # --- team name (add the group picture after this in your editor) ---
        self.camera.frame.set(width=config.frame_width).move_to(ORIGIN)
        team = Text("The Supervised Learners", font_size=54)
        thanks = Text("Thanks for watching", font_size=30, color=GREY).next_to(team, DOWN)
        self.play(Write(team), run_time=1.5)
        self.play(FadeIn(thanks, shift=UP * 0.2))
        self.wait(2)

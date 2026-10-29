"""Unhurried pacing for a scene: every animation runs SLOW times longer than written, and the
extra time is taken back out of the pauses that follow (never below MIN_PAUSE), so beats stay on
their narration and the scene only grows where the pauses cannot absorb it."""

from manim import config
from manim.animation.animation import Wait, prepare_animation


class PacedScene:
    """Mix in before the Scene class: `class MyScene(PacedScene, Scene)`."""

    SLOW = 1.35
    MIN_PAUSE = 0.3
    # When False, extra time still owed at the end of a section (one narration line) is written
    # off instead of being taken out of the next line's pauses, so every line keeps its full time.
    REPAY_ACROSS_SECTIONS = True
    slow_debt = 0.0  # extra seconds added by SLOW, still to be taken back out of pauses

    def next_section(self, *args, **kwargs):
        if not self.REPAY_ACROSS_SECTIONS:
            self.slow_debt = 0.0
        super().next_section(*args, **kwargs)

    def play(self, *animations, **kwargs):
        animations = [prepare_animation(a) for a in animations]
        written = kwargs.pop("run_time", None) or max(a.get_run_time() for a in animations)
        self.slow_debt += written * (self.SLOW - 1)
        super().play(*animations, run_time=written * self.SLOW, **kwargs)

    def wait(self, duration=1.0, **kwargs):
        repaid = min(self.slow_debt, max(0.0, duration - self.MIN_PAUSE))
        self.slow_debt -= repaid
        super().wait(duration - repaid, **kwargs)

    def at(self, t):
        """Wait until t seconds into the scene (a no-op once that time has passed). A cue already
        allows for the extra time SLOW added before it, so nothing is left to repay."""
        self.slow_debt = 0.0
        if t - self.time >= 1 / config.frame_rate:
            super().play(Wait(run_time=t - self.time))  # (Scene.wait would go through play() and be slowed)

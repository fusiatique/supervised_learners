"""Colours shared by every maths scene, matching the presentation's CSS tokens."""

from manim import config

BG = "#101827"  # page background in the scene HTML template
INK = "#e8ecf4"  # primary text and outlines
MUTED = "#8a94a8"  # secondary text, faint labels
CELL = "#1b2538"  # empty grid cell fill
WALL = "#3a4560"  # maze wall fill

DOPAMINE = "#f5b041"  # --c-dopamine: rewards, pleasure
HOMEO = "#2ec4b6"  # --c-homeo: internal state H, setpoint, relief
HARM = "#e5484d"  # --c-harm: harm, cost
MODEL = "#9d7cf2"  # --c-model: agent, values, policy

config.background_color = BG

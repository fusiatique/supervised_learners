#!/usr/bin/env sh
# Render a Manim scene at 1080p60 and copy the MP4 to ../video/.
# Usage: ./render.sh scenes/scene01_bellman.py Scene01Bellman scene01-bellman
set -e
cd "$(dirname "$0")"
uv run manim render -qh --media_dir build -o "$3" "$1" "$2"
cp "build/videos/$(basename "$1" .py)/1080p60/$3.mp4" ../video/

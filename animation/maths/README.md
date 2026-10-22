# Maths scenes (Manim)

Same layout as [`../bio`](../bio/README.md), with Manim in place of Remotion:

- `manim/scenes/sceneNN_name.py`: one Manim `Scene` per file.
- `video/sceneNN-name.mp4`: the rendered output, committed.
- `html/sceneNN.html`: a standalone page that plays the video and is embedded by `../index.html`.
- `docs/SCENENN.md`: timeline, sources and handoff notes.

## Rendering

`manim/` is a [uv](https://docs.astral.sh/uv/) project: `pyproject.toml` and `uv.lock` pin Manim, and `.python-version` pins Python 3.12. Run every command from `animation/maths/manim`:

```sh
uv sync                                                      # first time: installs Python 3.12 and Manim into .venv
uv run manim -pql scenes/scene01_bellman.py Scene01Bellman   # quick low-quality preview
./render.sh scenes/scene01_bellman.py Scene01Bellman scene01-bellman
```

Use `uv add <package>` to add a dependency. It only works in this folder, because uv looks for the nearest `pyproject.toml`.

`MathTex` and `Tex` need a LaTeX install. On macOS, run `brew install --cask mactex-no-gui`, then open a new terminal. `Text`, shapes and graphs work without it.

`render.sh` renders at 1080p60 and copies the MP4 to `video/`. Manim's working files go to `manim/build/`, which git ignores.

## Scene page

Copy this into `html/sceneNN.html`. `video-player.js` plays and pauses the video when the presentation navigates to or away from it:

```html
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maths 01 — Bellman equation</title>
<style>html,body{width:100%;height:100%;margin:0;background:#101827;overflow:hidden}video{width:100%;height:100%;object-fit:contain}</style></head>
<body><video data-prefix="maths01" src="../video/scene01-bellman.mp4" controls playsinline muted></video><script src="video-player.js"></script></body>
</html>
```

Then register it in `../presentation/js/main.js` with `['<section-id>', '<iframe-id>', 'maths01']`. Use the `mathsNN` prefix so its messages stay separate from the biology scenes' `sceneNN`.

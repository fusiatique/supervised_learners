# Maths scenes (Manim)

Same layout as [`../bio`](../bio/README.md), with Manim in place of Remotion:

- `manim/scenes/sceneNN_name.py`: one Manim `Scene` per file.
- `video/sceneNN-name.mp4`: the rendered output, committed.
- `html/sceneNN.html`: a standalone page that plays the video and is embedded by `../index.html`.
- `docs/SCENENN.md`: timeline, sources and handoff notes.

## Rendering

With Python 3.10+ and Manim's system dependencies (see the [Manim install guide](https://docs.manim.community/en/stable/installation.html)), from `animation/maths/manim`:

```sh
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
manim -pql scenes/scene01_bellman.py Scene01Bellman   # quick low-quality preview
./render.sh scenes/scene01_bellman.py Scene01Bellman scene01-bellman
```

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

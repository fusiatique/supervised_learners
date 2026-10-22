# Animation

A full-screen, scene-based presentation, "Hacking the Reward Learner". Serve the repository (for example with Live Server) and open `animation/index.html`. See [STORYBOARD.md](STORYBOARD.md) for the narrative.

## Layout

```
animation/
├── index.html          Presentation shell: every scene, in order
├── STORYBOARD.md       Narrative for the whole presentation
├── presentation/       Shell styling and navigation
│   ├── css/            styles.css
│   └── js/             main.js (beats, navigation, embedded-player control)
│                       scenes/ in-page canvas scenes (e.g. dopamine.js)
├── bio/                Biology scenes, built with Remotion (React)
│   ├── html/           Standalone scene pages, embedded by index.html
│   ├── player/         Bundled Remotion players (generated, committed)
│   ├── video/          Rendered MP4s
│   ├── docs/           One SCENEnn.md per scene: timeline, sources, commands
│   └── remotion/       Source project (package.json, src/, scripts/)
└── maths/              Maths scenes, built with Manim (Python)
    ├── html/           Standalone scene pages, embedded by index.html
    ├── video/          Rendered MP4s
    ├── docs/           One SCENEnn.md per scene
    └── manim/          Source project (requirements.txt, scenes/)
```

`bio/` and `maths/` share the same shape: `html/` for pages, `video/` for renders, `docs/` for notes, and one source folder per tool. Maths has no `player/` folder because Manim scenes play as video.

## Adding a scene to the presentation

1. Build the scene in `bio/` or `maths/` (see that folder's README).
2. Add a `<section class="scene scene--video">` with an `<iframe>` pointing at its `html/` page in `index.html`.
3. Register the iframe in the embedded-player list at the top of `presentation/js/main.js` so it plays and pauses with navigation.

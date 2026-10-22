# Biology scenes (Remotion)

| Scene | Page | Notes |
| --- | --- | --- |
| 01 Human vs computer | [html/scene01.html](html/scene01.html) | [docs/SCENE01.md](docs/SCENE01.md) |
| 02 Risk and addiction | [html/scene02.html](html/scene02.html) | [docs/SCENE02.md](docs/SCENE02.md) |
| 03 Addiction and reward learning | [html/scene03.html](html/scene03.html) | [docs/SCENE03.md](docs/SCENE03.md) |
| 03.5 Dopamine introduction | [html/scene035.html](html/scene035.html) | [docs/SCENE03_5.md](docs/SCENE03_5.md) |
| 04 Mesocorticolimbic introduction | [html/scene04.html](html/scene04.html) | [docs/SCENE04.md](docs/SCENE04.md) |
| 05 Dopamine reward prediction errors | [html/scene05.html](html/scene05.html) | [docs/SCENE05.md](docs/SCENE05.md) |

| 06 Mesocortical pathway and planning | [html/scene06.html](html/scene06.html) | [docs/SCENE06.md](docs/SCENE06.md) |
| 07 Prefrontal control and addiction | [html/scene07.html](html/scene07.html) | [docs/SCENE07.md](docs/SCENE07.md) |
| 08 Synaptic plasticity and addiction | [html/scene08.html](html/scene08.html) | [docs/SCENE08.md](docs/SCENE08.md) |

- `html/sceneNN.html` loads `player/sceneNN-player.js`, a bundled, scrubbable Remotion Player. Watching needs no install.
- `video/` holds the rendered MP4 of each scene.
- `remotion/` is the source. With Node.js 22+, from `animation/bio/remotion`:

```sh
npm ci
npm run studio            # edit in Remotion Studio
npm run typecheck
npm run check:sceneNN     # timing checks (scenes 02–07, including 03.5)
npm run build:sceneNN     # refresh player/sceneNN-player.js
npm run render:sceneNN    # write video/sceneNN-*.mp4
```

Each scene has `src/SceneNN_*.tsx` (composition) and `src/playerNN.tsx` (player entry). Shared artwork lives in `src/components.tsx`, `src/BrainAnatomy.tsx` and the `*-components.tsx` files; motion helpers live in `src/motion.ts`.

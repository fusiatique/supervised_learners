import { SOURCE_TYPES } from './hrl/config.js';

// Maze definitions. `cols`/`rows` must be odd; the outside edge is a fixed
// wall boundary and all interior cells start open for users to edit.
//
// A maze may also carry a `layout`: one string per row, where `#` is a wall,
// `.` an open cell, `S` the agent's start and a source's `char` (`F`, `C`,
// `R`, `A`, `B`, see hrl/config.js) that source. The "Copy layout" button in
// the UI produces one from whatever is currently on screen.
export const MAZES = [
  // Five dead-end arms whose ends are all six steps from the start, one per
  // source, so that no source is favoured by being closer: food, social
  // interaction and rest on the left and in the middle, the drugs on the right.
  { id: 'arms', name: 'Five arms (13 × 13)', cols: 13, rows: 13, layout: [
      '#############',
      '#############',
      '##....S....##',
      '##.#.#.#.#.##',
      '##F#.#.#.#B##',
      '####.#.#.####',
      '####C#.#A####',
      '######.######',
      '######R######',
      '#############',
      '#############',
      '#############',
      '#############',
    ]},
];

export function getMaze(id) {
  return MAZES.find((m) => m.id === id) ?? MAZES[0];
}

// Returns { cols, rows, walls, start, defaultItems } where `walls[y * cols + x]`
// is 1 for a wall, `start` is the index of the agent's starting cell and
// `defaultItems` lists the [cell, source id] pairs of the layout (none for a
// maze without one).
export function buildMaze({ cols, rows, layout }) {
  const walls = new Uint8Array(cols * rows);
  const index = (x, y) => y * cols + x;

  if (layout) {
    let start = index(1, 1);
    const defaultItems = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const char = layout[y]?.[x] ?? '#';
        const item = SOURCE_TYPES.find((t) => t.char === char);
        if (char === '#') walls[index(x, y)] = 1;
        else if (char === 'S') start = index(x, y);
        else if (item) defaultItems.push([index(x, y), item.id]);
      }
    }
    return { cols, rows, walls, start, defaultItems };
  }

  for (let x = 0; x < cols; x++) {
    walls[index(x, 0)] = 1;
    walls[index(x, rows - 1)] = 1;
  }
  for (let y = 1; y < rows - 1; y++) {
    walls[index(0, y)] = 1;
    walls[index(cols - 1, y)] = 1;
  }

  return { cols, rows, walls, start: index(1, 1), defaultItems: [] };
}

// The environment's current walls, start and sources as `layout` rows.
export function layoutOf(env) {
  const rows = [];
  for (let y = 0; y < env.rows; y++) {
    let row = '';
    for (let x = 0; x < env.cols; x++) {
      const cell = y * env.cols + x;
      const item = SOURCE_TYPES.find((t) => t.id === env.items.get(cell));
      if (env.isWall(cell)) row += '#';
      else if (cell === env.start) row += 'S';
      else row += item ? item.char : '.';
    }
    rows.push(row);
  }
  return rows;
}

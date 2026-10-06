// Maze definitions. Each maze is generated from a fixed seed, so it is the
// same every time. `cols`/`rows` must be odd (walls occupy grid cells).
// `braid` is the chance of knocking out an extra wall, which creates loops and
// therefore more than one route between places.
export const MAZES = [
  { id: 'small', name: 'Small (9 × 9)', cols: 9, rows: 9, seed: 4, braid: 0.2 },
  { id: 'medium', name: 'Medium (13 × 13)', cols: 13, rows: 13, seed: 3, braid: 0.15 },
  { id: 'large', name: 'Large (19 × 19)', cols: 19, rows: 19, seed: 21, braid: 0.1 },
];

export function getMaze(id) {
  return MAZES.find((m) => m.id === id) ?? MAZES[0];
}

function seededRandom(seed) {
  // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Returns { cols, rows, walls, start } where `walls[y * cols + x]` is 1 for a
// wall and `start` is the index of the agent's starting cell.
export function buildMaze({ cols, rows, seed, braid }) {
  const random = seededRandom(seed);
  const walls = new Uint8Array(cols * rows).fill(1);
  const index = (x, y) => y * cols + x;

  // Depth-first carve between "rooms", which sit on odd coordinates.
  const stack = [[1, 1]];
  walls[index(1, 1)] = 0;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const options = [[0, -2], [2, 0], [0, 2], [-2, 0]]
      .map(([dx, dy]) => [x + dx, y + dy, x + dx / 2, y + dy / 2])
      .filter(([nx, ny]) => nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && walls[index(nx, ny)]);
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [nx, ny, wx, wy] = options[Math.floor(random() * options.length)];
    walls[index(wx, wy)] = 0;
    walls[index(nx, ny)] = 0;
    stack.push([nx, ny]);
  }

  // Open some of the walls that separate two rooms.
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const betweenRooms = (x % 2) !== (y % 2);
      if (betweenRooms && walls[index(x, y)] && random() < braid) walls[index(x, y)] = 0;
    }
  }

  return { cols, rows, walls, start: index(1, 1) };
}

// Maze definitions. `cols`/`rows` must be odd; the outside edge is a fixed
// wall boundary and all interior cells start open for users to edit.
export const MAZES = [
  { id: 'medium', name: 'Medium (13 × 13)', cols: 13, rows: 13 },
];

export function getMaze(id) {
  return MAZES.find((m) => m.id === id) ?? MAZES[0];
}

// Returns { cols, rows, walls, start } where `walls[y * cols + x]` is 1 for a
// wall and `start` is the index of the agent's starting cell.
export function buildMaze({ cols, rows }) {
  const walls = new Uint8Array(cols * rows);
  const index = (x, y) => y * cols + x;

  for (let x = 0; x < cols; x++) {
    walls[index(x, 0)] = 1;
    walls[index(x, rows - 1)] = 1;
  }
  for (let y = 1; y < rows - 1; y++) {
    walls[index(0, y)] = 1;
    walls[index(cols - 1, y)] = 1;
  }

  return { cols, rows, walls, start: index(1, 1) };
}

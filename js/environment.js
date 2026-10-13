import { buildMaze } from './mazes.js';

// Up, right, down, left.
export const ACTIONS = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

// The grid itself: walls, the start, the agent's cell and which cell holds
// which source. A cell is an index (y * cols + x). hrl/environment.js extends
// this with the internal states and what using a source does; there a
// learning state is more than a cell, hence `numCells` next to `numStates`.
export class Environment {
  constructor(mazeDef) {
    Object.assign(this, buildMaze(mazeDef));
    this.numCells = this.cols * this.rows;
    this.numStates = this.numCells;
    this.numActions = ACTIONS.length;
    this.items = new Map(this.defaultItems); // cell index -> source type id
    this.state = this.start;
    this.layoutVersion = 0; // goes up whenever a wall changes
  }

  isWall(cell) {
    return this.walls[cell] === 1;
  }

  setWall(cell, isWall) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= this.numCells || cell === this.start) return false;
    const x = cell % this.cols;
    const y = Math.floor(cell / this.cols);
    if (x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1) return false;
    if (this.isWall(cell) === isWall) return false;

    this.walls[cell] = Number(isWall);
    this.layoutVersion++;
    if (isWall) this.items.delete(cell);
    return true;
  }

  isValidCell(cell) {
    return Number.isInteger(cell) && cell >= 0 && cell < this.numCells;
  }

  neighbor(cell, { dx, dy }) {
    const x = cell % this.cols + dx;
    const y = Math.floor(cell / this.cols) + dy;
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows ? y * this.cols + x : null;
  }

  canAddWall(cell) {
    return this.isValidCell(cell) && !this.isWall(cell) && cell !== this.start && cell !== this.state && !this.items.has(cell);
  }

  addWall(cell) {
    if (!this.canAddWall(cell)) return false;
    this.walls[cell] = 1;
    this.layoutVersion++;
    return true;
  }

  removeWall(cell) {
    if (!this.isValidCell(cell) || !this.isWall(cell)) return false;
    this.walls[cell] = 0;
    this.layoutVersion++;
    return true;
  }

  moveWall(from, to) {
    if (!this.isValidCell(from) || !this.isWall(from) || !this.canAddWall(to)) return false;
    this.walls[from] = 0;
    this.walls[to] = 1;
    this.layoutVersion++;
    return true;
  }

  clearWalls() {
    this.walls.fill(0);
    this.layoutVersion++;
  }

  canStartAt(cell) {
    return this.isValidCell(cell) && !this.isWall(cell) && !this.items.has(cell);
  }

  // Moves the starting cell and puts the agent on it.
  setStart(cell) {
    if (!this.canStartAt(cell)) return false;
    this.start = cell;
    this.state = cell;
    return true;
  }

  reset() {
    this.state = this.start;
    return this.state;
  }

  // Moves the agent; walking into a wall leaves it where it is.
  step(action) {
    const next = this.neighbor(this.state, ACTIONS[action]);
    if (next !== null && !this.isWall(next)) this.state = next;
    return this.state;
  }

  canHoldItem(cell) {
    return this.isValidCell(cell) && !this.isWall(cell) && cell !== this.start;
  }

  placeItem(cell, itemId) {
    if (this.canHoldItem(cell)) this.items.set(cell, itemId);
  }

  removeItem(cell) {
    this.items.delete(cell);
  }

  // Shortest-path length from `from` to every cell (Infinity if unreachable).
  distancesFrom(from) {
    const dist = new Array(this.numCells).fill(Infinity);
    dist[from] = 0;
    const queue = [from];
    for (let i = 0; i < queue.length; i++) {
      const cell = queue[i];
      for (const action of ACTIONS) {
        const next = this.neighbor(cell, action);
        if (next !== null && !this.isWall(next) && dist[next] === Infinity) {
          dist[next] = dist[cell] + 1;
          queue.push(next);
        }
      }
    }
    return dist;
  }
}

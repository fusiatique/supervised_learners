import { buildMaze } from './mazes.js';
import { getItemType } from './items.js';

// Up, right, down, left.
export const ACTIONS = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

// Grid world. A state is a cell index (y * cols + x). Reaching a cell that
// holds an item ends the episode. The environment only reports what happened;
// turning that into a reward is the simulation's job.
export class Environment {
  constructor(mazeDef) {
    Object.assign(this, buildMaze(mazeDef));
    this.numStates = this.cols * this.rows;
    this.numActions = ACTIONS.length;
    this.items = new Map(); // cell index -> item type id
    this.state = this.start;
  }

  isWall(cell) {
    return this.walls[cell] === 1;
  }

  isValidCell(cell) {
    return Number.isInteger(cell) && cell >= 0 && cell < this.numStates;
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
    return true;
  }

  removeWall(cell) {
    if (!this.isValidCell(cell) || !this.isWall(cell)) return false;
    this.walls[cell] = 0;
    return true;
  }

  moveWall(from, to) {
    if (!this.isValidCell(from) || !this.isWall(from) || !this.canAddWall(to)) return false;
    this.walls[from] = 0;
    this.walls[to] = 1;
    return true;
  }

  clearWalls() {
    this.walls.fill(0);
  }

  reset() {
    this.state = this.start;
    return this.state;
  }

  step(action) {
    const next = this.neighbor(this.state, ACTIONS[action]);
    if (next !== null && !this.isWall(next)) this.state = next;
    const item = getItemType(this.items.get(this.state));
    return { state: this.state, item, done: item !== null };
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
    const dist = new Array(this.numStates).fill(Infinity);
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

  isDeadEnd(cell) {
    const open = ACTIONS.filter((action) => {
      const next = this.neighbor(cell, action);
      return next !== null && !this.isWall(next);
    });
    return !this.isWall(cell) && open.length === 1;
  }

  // Spread one of each item type across the maze, far from the start and from
  // each other, with the most valuable item furthest from the start. Items go
  // in dead ends so that none of them blocks the way to another.
  placeDefaultItems(itemTypes) {
    this.items.clear();
    const fromStart = this.distancesFrom(this.start);
    const spread = [...fromStart];
    const cells = [];
    const pick = (allowed) => {
      let best = -1;
      for (let cell = 0; cell < this.numStates; cell++) {
        if (!this.canHoldItem(cell) || !allowed(cell) || cells.includes(cell)) continue;
        if (best === -1 || spread[cell] > spread[best]) best = cell;
      }
      return best;
    };
    for (let n = 0; n < itemTypes.length; n++) {
      let best = pick((cell) => this.isDeadEnd(cell));
      if (best === -1) best = pick(() => true);
      if (best === -1) break;
      cells.push(best);
      const fromBest = this.distancesFrom(best);
      for (let cell = 0; cell < this.numStates; cell++) spread[cell] = Math.min(spread[cell], fromBest[cell]);
    }
    cells.sort((a, b) => fromStart[a] - fromStart[b]);
    const byValue = [...itemTypes].sort((a, b) => a.value - b.value);
    cells.forEach((cell, i) => this.items.set(cell, byValue[i].id));
  }
}

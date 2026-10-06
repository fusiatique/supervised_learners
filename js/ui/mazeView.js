import { ACTIONS } from '../environment.js';
import { getItemType } from '../items.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

// Draws the maze, the items, the agent and (optionally) what the agent has
// learned. Reports clicks on cells through `onCellClick(cellIndex)`.
export class MazeView {
  constructor(canvas, { onCellClick }) {
    this.canvas = canvas;
    this.showValues = true;
    this.hoverCell = null;
    this.env = null;

    canvas.addEventListener('click', (e) => {
      const cell = this.cellAt(e);
      if (cell !== null) onCellClick(cell);
    });
    canvas.addEventListener('mousemove', (e) => {
      this.hoverCell = this.cellAt(e);
    });
    canvas.addEventListener('mouseleave', () => {
      this.hoverCell = null;
    });
  }

  cellAt(event) {
    if (!this.env) return null;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * this.env.cols);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * this.env.rows);
    if (x < 0 || y < 0 || x >= this.env.cols || y >= this.env.rows) return null;
    return y * this.env.cols + x;
  }

  draw(sim) {
    const env = (this.env = sim.env);
    const { ctx, width } = prepareCanvas(this.canvas);
    const size = width / env.cols;
    const xOf = (cell) => (cell % env.cols) * size;
    const yOf = (cell) => Math.floor(cell / env.cols) * size;

    ctx.fillStyle = cssVar('--maze-wall');
    ctx.fillRect(0, 0, width, width);

    // Floor. Cells are drawn slightly oversized so no wall colour shows
    // through the seams between neighbours.
    ctx.fillStyle = cssVar('--maze-floor');
    for (let cell = 0; cell < env.numStates; cell++) {
      if (!env.isWall(cell)) ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
    }

    if (this.showValues) this.drawValues(ctx, sim, size, xOf, yOf);

    // Start marker
    ctx.strokeStyle = cssVar('--agent');
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(xOf(env.start) + size * 0.14, yOf(env.start) + size * 0.14, size * 0.72, size * 0.72);
    ctx.setLineDash([]);

    // Items
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.max(10, size * 0.36)}px ${CANVAS_FONT}`;
    for (const [cell, itemId] of env.items) {
      const item = getItemType(itemId);
      if (!item) continue;
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(item.colorVar);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = cssVar('--maze-floor');
      ctx.stroke();
      if (size >= 18) {
        ctx.fillStyle = cssVar('--on-item');
        ctx.fillText(String(item.value), cx, cy + 1);
      }
    }

    // Agent
    ctx.beginPath();
    ctx.arc(xOf(env.state) + size / 2, yOf(env.state) + size / 2, size * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = cssVar('--agent');
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = cssVar('--maze-floor');
    ctx.stroke();

    if (this.hoverCell !== null && env.canHoldItem(this.hoverCell)) {
      ctx.strokeStyle = cssVar('--text-secondary');
      ctx.lineWidth = 2;
      ctx.strokeRect(xOf(this.hoverCell) + 1, yOf(this.hoverCell) + 1, size - 2, size - 2);
    }
  }

  // Tint each visited cell by its learned value (relative to the other
  // visited cells) and draw an arrow for the action the agent prefers there.
  drawValues(ctx, sim, size, xOf, yOf) {
    const { env, agent } = sim;
    const shown = (cell) => !env.isWall(cell) && !env.items.has(cell) && agent.hasVisited(cell);
    let min = Infinity;
    let max = -Infinity;
    for (let cell = 0; cell < env.numStates; cell++) {
      if (!shown(cell)) continue;
      min = Math.min(min, agent.stateValue(cell));
      max = Math.max(max, agent.stateValue(cell));
    }

    const tint = cssVar('--agent');
    const arrow = cssVar('--text-secondary');
    for (let cell = 0; cell < env.numStates; cell++) {
      if (!shown(cell)) continue;

      const strength = max > min ? (agent.stateValue(cell) - min) / (max - min) : 0;
      ctx.globalAlpha = 0.06 + 0.5 * strength;
      ctx.fillStyle = tint;
      ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
      ctx.globalAlpha = 1;

      if (cell === env.state) continue;
      const { dx, dy } = ACTIONS[agent.bestAction(cell)];
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      const r = size * 0.16;
      ctx.beginPath();
      ctx.moveTo(cx + dx * r, cy + dy * r);
      ctx.lineTo(cx - dx * r + dy * r, cy - dy * r + dx * r);
      ctx.lineTo(cx - dx * r - dy * r, cy - dy * r - dx * r);
      ctx.closePath();
      ctx.fillStyle = arrow;
      ctx.fill();
    }
  }
}

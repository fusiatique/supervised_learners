import { AgentView } from './agentView.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

// Draws the maze, the sources, the agent and what the agent has learned.
export class MazeView {
  constructor(canvas) {
    this.canvas = canvas;
    this.faceView = new AgentView(null);
  }

  draw(sim, mood, now = performance.now()) {
    const { env } = sim;
    const { ctx, width, height } = prepareCanvas(this.canvas);
    // Fit the walkable layout with a little breathing room around its edges.
    const cells = Array.from({ length: env.numCells }, (_, cell) => cell)
      .filter((cell) => !env.isWall(cell));
    const cols = cells.map((cell) => cell % env.cols);
    const rows = cells.map((cell) => Math.floor(cell / env.cols));
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const padding = 0.8;
    const size = Math.min(width / (maxCol - minCol + 1 + padding * 2),
      height / (maxRow - minRow + 1 + padding * 2));
    const offsetX = (width - (maxCol - minCol + 1) * size) / 2;
    const offsetY = (height - (maxRow - minRow + 1) * size) / 2;
    const xOf = (cell) => offsetX + (cell % env.cols - minCol) * size;
    const yOf = (cell) => offsetY + (Math.floor(cell / env.cols) - minRow) * size;

    ctx.fillStyle = cssVar('--maze-backdrop');
    ctx.fillRect(0, 0, width, height);

    // Floor. Cells are drawn slightly oversized so no wall colour shows
    // through the seams between neighbours.
    ctx.fillStyle = cssVar('--maze-floor');
    for (let cell = 0; cell < env.numCells; cell++) {
      if (!env.isWall(cell)) ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
    }

    // Quiet outlines separate steps without colouring the learned values.
    ctx.strokeStyle = cssVar('--maze-edge');
    ctx.lineWidth = 0.7;
    for (let cell = 0; cell < env.numCells; cell++) {
      if (!env.isWall(cell)) ctx.strokeRect(xOf(cell), yOf(cell), size, size);
    }

    const startCell = env.start;
    const agentCell = env.state;

    // Label the starting point outside the corridor so it stays legible.
    ctx.fillStyle = cssVar('--text-secondary');
    ctx.font = `600 ${Math.max(10, size * 0.24)}px ${CANVAS_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('START', xOf(startCell) + size / 2, yOf(startCell) - size * 0.18);
    ctx.beginPath();
    ctx.arc(xOf(startCell) + size / 2, yOf(startCell) + size / 2, size * 0.2, 0, Math.PI * 2);
    ctx.strokeStyle = cssVar('--maze-edge');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sources, each with its letter, faded while they cannot be used.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const cell of env.items.keys()) {
      const source = env.sourceAt(cell);
      if (!source) continue;
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      const radius = size * 0.36;
      const available = !env.isRefractory(cell);
      ctx.globalAlpha = available ? 1 : 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(source.colorVar);
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, size * 0.045);
      ctx.strokeStyle = cssVar('--maze-floor');
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = cssVar('--on-item');
      ctx.font = `700 ${Math.max(9, size * 0.3)}px ${CANVAS_FONT}`;
      ctx.fillText(source.char, cx, cy + 1);
    }

    // Same expression and harm colouring as the state panel, at marker size.
    this.faceView.drawFace(ctx, xOf(agentCell) + size / 2,
      yOf(agentCell) + size / 2, size * 0.38, mood, env.h, now);
  }

}

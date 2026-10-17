import { AgentView } from './agentView.js';
import { sourceIcon } from './sourceIcons.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

// Draws the maze, the sources, the agent and what the agent has learned.
export class MazeView {
  constructor(canvas) {
    this.canvas = canvas;
    this.faceView = new AgentView(null);
    this.consumption = null;
    this.activeConsumption = null;
    this.consumedAt = 0;
  }

  draw(sim, mood, now = performance.now()) {
    if (this.consumption !== sim.lastConsumption) {
      this.consumption = sim.lastConsumption;
      if (!this.consumption) {
        this.activeConsumption = null;
      } else {
        const sameSource = this.activeConsumption?.cell === this.consumption.cell
          && this.activeConsumption?.source.id === this.consumption.source.id;
        // Do not pin the animation to its first frame when the same source is
        // consumed repeatedly at high simulation speeds. Let this burst finish.
        if (!sameSource || now - this.consumedAt >= 1400) {
          this.activeConsumption = this.consumption;
          this.consumedAt = now;
        }
      }
    }
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
    const padding = 1.2;
    const size = Math.min(width / (maxCol - minCol + 1 + padding * 2),
      height / (maxRow - minRow + 1 + padding * 2));
    const offsetX = (width - (maxCol - minCol + 1) * size) / 2;
    const offsetY = (height - (maxRow - minRow + 1) * size) / 2;
    const xOf = (cell) => offsetX + (cell % env.cols - minCol) * size;
    const yOf = (cell) => offsetY + (Math.floor(cell / env.cols) - minRow) * size;

    ctx.fillStyle = cssVar('--maze-backdrop');
    ctx.fillRect(0, 0, width, height);

    // Square cells preserve the maze's sharp corridor edges.
    ctx.fillStyle = cssVar('--maze-floor');
    for (const cell of cells) {
      ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
    }
    ctx.strokeStyle = cssVar('--maze-edge');
    ctx.lineWidth = 0.7;
    for (const cell of cells) {
      ctx.strokeRect(xOf(cell), yOf(cell), size, size);
    }

    const startCell = env.start;
    const agentCell = env.state;

    // Label the starting point outside the corridor so it stays legible.
    ctx.fillStyle = cssVar('--maze-label');
    ctx.font = `700 ${Math.max(10, size * 0.2)}px ${CANVAS_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('START', xOf(startCell) + size / 2, yOf(startCell) - size * 0.18);
    ctx.beginPath();
    ctx.arc(xOf(startCell) + size / 2, yOf(startCell) + size / 2, size * 0.2, 0, Math.PI * 2);
    ctx.strokeStyle = cssVar('--agent');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Food and drug pictograms, faded while they cannot be used.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const cell of env.items.keys()) {
      const source = env.sourceAt(cell);
      if (!source) continue;
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      const radius = size * 0.36;
      const available = !env.isRefractory(cell);
      ctx.save();
      ctx.globalAlpha = available ? 1 : 0.45;
      ctx.shadowColor = cssVar('--maze-shadow');
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(source.colorVar);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.lineWidth = Math.max(2, size * 0.06);
      ctx.strokeStyle = cssVar('--maze-floor');
      ctx.stroke();
      ctx.fillStyle = cssVar('--on-item');
      const pictogram = source.id === 'food' || source.id === 'drugB';
      ctx.font = `${pictogram ? '' : '700 '}${Math.max(9, size * (pictogram ? 0.52 : 0.3))}px "Apple Color Emoji", "Segoe UI Emoji", ${CANVAS_FONT}`;
      ctx.fillText(sourceIcon(source), cx, cy + 1);
      ctx.restore();
      // Labels stay outside the corridor at source endpoints.
      const below = cell + env.cols;
      if (below >= env.numCells || env.isWall(below)) {
        ctx.fillStyle = cssVar('--maze-label');
        ctx.font = `600 ${Math.max(10, size * 0.19)}px ${CANVAS_FONT}`;
        ctx.fillText(source.name.replace(/ \(.*\)$/, ''), cx, cy + size * 0.69);
      }
    }

    // Ground the face marker with a soft shadow, independent of mood colour.
    ctx.save();
    ctx.fillStyle = cssVar('--maze-shadow');
    ctx.beginPath();
    ctx.ellipse(xOf(agentCell) + size / 2, yOf(agentCell) + size * 0.82,
      size * 0.25, size * 0.075, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Same expression and harm colouring as the state panel, at marker size.
    this.faceView.drawFace(ctx, xOf(agentCell) + size / 2,
      yOf(agentCell) + size / 2, size * 0.38, mood, env.h, now);

    // Persist the cue across frames even when many simulation steps run at once.
    const age = (now - this.consumedAt) / 1400;
    if (this.activeConsumption && age < 1) {
      const { cell, source } = this.activeConsumption;
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const progress = reducedMotion ? 0.3 : age;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1 - age) * 3);
      ctx.strokeStyle = cssVar(source.colorVar);
      ctx.lineWidth = Math.max(2, size * 0.07);
      ctx.beginPath();
      ctx.arc(cx, cy, size * (0.45 + progress * 0.6), 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI / 5;
        const radius = size * (0.65 + progress * 0.8);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.lineTo(cx + Math.cos(angle) * (radius + size * 0.18), cy + Math.sin(angle) * (radius + size * 0.18));
        ctx.stroke();
      }
      ctx.font = `700 ${Math.max(14, size * 0.32)}px ${CANVAS_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = source.id === 'food' ? 'Ate food!'
        : source.isDrug ? `Took ${source.name.replace(/ \(.*\)$/, '')}!`
          : `Used ${source.name}!`;
      const labelX = Math.max(ctx.measureText(text).width / 2 + 8,
        Math.min(width - ctx.measureText(text).width / 2 - 8, cx));
      const labelY = Math.max(size * 0.3, cy - size * 1.25);
      ctx.strokeStyle = cssVar('--maze-backdrop');
      ctx.lineWidth = 5;
      ctx.strokeText(text, labelX, labelY);
      ctx.fillStyle = cssVar(source.colorVar);
      ctx.fillText(text, labelX, labelY);
      ctx.restore();
    }
  }

}

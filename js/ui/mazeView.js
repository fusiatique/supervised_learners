import { ACTIONS } from '../environment.js';
import { INTERACT } from '../hrl/environment.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

function drawDirectionCone(ctx, cx, cy, size, { dx, dy }, slotX = 0, slotY = 0, scale = 1) {
  const centerX = cx + slotX * size;
  const centerY = cy + slotY * size;
  const length = size * 0.3 * scale;
  const halfWidth = size * 0.19 * scale;
  const tipX = centerX + dx * length / 2;
  const tipY = centerY + dy * length / 2;
  const baseX = centerX - dx * length / 2;
  const baseY = centerY - dy * length / 2;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseX - dy * halfWidth, baseY + dx * halfWidth);
  ctx.lineTo(baseX + dy * halfWidth, baseY - dx * halfWidth);
  ctx.closePath();
  ctx.fill();
}

const ARROW_SLOTS = [
  [0, -0.24],
  [0.24, 0],
  [0, 0.24],
  [-0.24, 0],
];

// Draws the maze, the sources, the agent and what the agent has learned.
export class MazeView {
  constructor(canvas) {
    this.canvas = canvas;
  }

  draw(sim) {
    const { env } = sim;
    const { ctx, width } = prepareCanvas(this.canvas);
    const size = width / env.cols;
    const xOf = (cell) => (cell % env.cols) * size;
    const yOf = (cell) => Math.floor(cell / env.cols) * size;

    ctx.fillStyle = cssVar('--maze-wall');
    ctx.fillRect(0, 0, width, width);

    // Floor. Cells are drawn slightly oversized so no wall colour shows
    // through the seams between neighbours.
    ctx.fillStyle = cssVar('--maze-floor');
    for (let cell = 0; cell < env.numCells; cell++) {
      if (!env.isWall(cell)) ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
    }

    this.drawValues(ctx, sim, size, xOf, yOf);

    const startCell = env.start;
    const agentCell = env.state;

    // Start marker
    ctx.strokeStyle = cssVar('--agent');
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(xOf(startCell) + size * 0.14, yOf(startCell) + size * 0.14, size * 0.72, size * 0.72);
    ctx.setLineDash([]);

    // Sources, each with its letter, faded while they cannot be used. A ring
    // marks one the agent would use if it stood there in its current state.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const cell of env.items.keys()) {
      const source = env.sourceAt(cell);
      if (!source) continue;
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      const radius = size * 0.36;
      const available = !env.isRefractory(cell);
      ctx.globalAlpha = available ? 1 : 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(source.colorVar);
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, size * 0.045);
      ctx.strokeStyle = cssVar('--maze-floor');
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (available && this.preferredActions(sim, cell).includes(INTERACT)) {
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(2, size * 0.05);
        ctx.strokeStyle = cssVar('--agent');
        ctx.stroke();
      }

      ctx.fillStyle = cssVar('--on-item');
      ctx.font = `700 ${Math.max(9, size * 0.3)}px ${CANVAS_FONT}`;
      ctx.fillText(source.char, cx, cy + 1);
    }

    // Agent
    const agentX = xOf(agentCell) + size / 2;
    const agentY = yOf(agentCell) + size / 2;
    const agentRadius = size * 0.38;
    ctx.beginPath();
    ctx.arc(agentX, agentY, agentRadius, 0, Math.PI * 2);
    ctx.fillStyle = cssVar('--agent');
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = cssVar('--maze-floor');
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(agentX, agentY, size * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = cssVar('--agent-core');
    ctx.fill();

  }

  // The actions the agent rates best on `cell` at its current d and h, or
  // none while it has not learned to tell them apart there.
  preferredActions(sim, cell) {
    const { env, agent } = sim;
    if (!agent.hasVisited(cell)) return [];
    const state = env.qStateAt(cell);
    const best = agent.bestActions(state);
    return best.length === agent.validActions(state).length ? [] : best;
  }

  // Tint each visited cell by its learned value (relative to the other
  // visited cells) and draw arrows for the moves the agent prefers there.
  // Both are for the agent's current d and h, so they shift as those change.
  drawValues(ctx, sim, size, xOf, yOf) {
    const { env, agent } = sim;
    const shown = (cell) => !env.isWall(cell) && agent.hasVisited(cell);
    const valueOf = (cell) => agent.stateValue(env.qStateAt(cell));

    let min = Infinity;
    let max = -Infinity;
    for (let cell = 0; cell < env.numCells; cell++) {
      if (!shown(cell)) continue;
      min = Math.min(min, valueOf(cell));
      max = Math.max(max, valueOf(cell));
    }

    const tint = cssVar('--agent');
    const arrow = cssVar('--text-secondary');
    for (let cell = 0; cell < env.numCells; cell++) {
      if (!shown(cell)) continue;

      const strength = max > min ? (valueOf(cell) - min) / (max - min) : 0;
      ctx.globalAlpha = 0.06 + 0.5 * strength;
      ctx.fillStyle = tint;
      ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
      ctx.globalAlpha = 1;

      if (cell === env.state || env.items.has(cell)) continue;
      const moves = this.preferredActions(sim, cell).filter((action) => action !== INTERACT);
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      ctx.fillStyle = arrow;
      if (moves.length > 1) {
        for (const action of moves) {
          const [slotX, slotY] = ARROW_SLOTS[action];
          drawDirectionCone(ctx, cx, cy, size, ACTIONS[action], slotX, slotY, 0.65);
        }
      } else if (moves.length === 1) {
        drawDirectionCone(ctx, cx, cy, size, ACTIONS[moves[0]]);
      }
    }
  }
}

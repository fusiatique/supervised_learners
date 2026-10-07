import { ACTIONS } from '../environment.js';
import { getItemType } from '../items.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

const GLITCH_INTERVAL_MS = 250;

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
  [-0.24, 0],
  [0, -0.24],
  [0.24, 0],
  [0, 0.24],
];

// Draws the maze, the items, the agent and what the agent has learned.
// Reports clicks and drag-painting on cells through its callbacks.
export class MazeView {
  constructor(canvas, { onCellClick, onCellDrag, onCellDragEnd }) {
    this.canvas = canvas;
    this.hoverCell = null;
    this.env = null;
    this.pointerDown = false;
    this.glitchPhase = -1;
    this.glitchActions = new Map();
    this.wasPolicyConverged = false;
    this.onCellDrag = onCellDrag;
    this.onCellDragEnd = onCellDragEnd;

    canvas.addEventListener('click', (e) => {
      const cell = this.cellAt(e);
      if (cell !== null) onCellClick(cell);
    });
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.pointerDown = true;
      canvas.setPointerCapture(e.pointerId);
      this.paintCell(e);
    });
    canvas.addEventListener('pointermove', (e) => {
      this.hoverCell = this.cellAt(e);
      if (this.pointerDown) this.paintCell(e);
    });
    const endPointer = () => {
      if (!this.pointerDown) return;
      this.pointerDown = false;
      this.onCellDragEnd();
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('lostpointercapture', endPointer);
    canvas.addEventListener('pointerleave', () => {
      this.hoverCell = null;
    });
  }

  paintCell(event) {
    const cell = this.cellAt(event);
    if (cell !== null) this.onCellDrag(cell);
  }

  cellAt(event) {
    if (!this.env) return null;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * this.env.cols);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * this.env.rows);
    if (x < 0 || y < 0 || x >= this.env.cols || y >= this.env.rows) return null;
    return y * this.env.cols + x;
  }

  draw(sim, now = performance.now()) {
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

    this.drawValues(ctx, sim, size, xOf, yOf, now);

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
      const radius = size * 0.36;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(item.colorVar);
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, size * 0.045);
      ctx.strokeStyle = cssVar('--maze-floor');
      ctx.stroke();

      ctx.fillStyle = cssVar('--on-item');
      ctx.font = `700 ${Math.max(9, size * 0.3)}px ${CANVAS_FONT}`;
      ctx.fillText(String(item.value), cx, cy + 1);
    }

    // Agent
    const agentX = xOf(env.state) + size / 2;
    const agentY = yOf(env.state) + size / 2;
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

    if (this.hoverCell !== null && env.canHoldItem(this.hoverCell)) {
      ctx.strokeStyle = cssVar('--text-secondary');
      ctx.lineWidth = 2;
      ctx.strokeRect(xOf(this.hoverCell) + 1, yOf(this.hoverCell) + 1, size - 2, size - 2);
    }
  }

  // Tint each visited cell by its learned value (relative to the other
  // visited cells) and draw an arrow for the action the agent prefers there.
  drawValues(ctx, sim, size, xOf, yOf, now) {
    const { env, agent } = sim;
    const shown = (cell) => !env.isWall(cell) && !env.items.has(cell) && agent.hasVisited(cell);
    if (agent.policyConverged) {
      this.wasPolicyConverged = true;
    } else {
      const phase = Math.floor(now / GLITCH_INTERVAL_MS);
      if (this.wasPolicyConverged || phase !== this.glitchPhase) {
        this.glitchActions.clear();
        this.glitchPhase = phase;
        this.wasPolicyConverged = false;
      }
    }

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
      let actions;
      if (agent.policyConverged) {
        actions = agent.bestActions(cell);
      } else {
        if (!this.glitchActions.has(cell)) {
          this.glitchActions.set(cell, Math.floor(Math.random() * ACTIONS.length));
        }
        actions = [this.glitchActions.get(cell)];
      }
      const cx = xOf(cell) + size / 2;
      const cy = yOf(cell) + size / 2;
      ctx.strokeStyle = arrow;
      ctx.fillStyle = arrow;
      ctx.lineWidth = actions.length > 1 ? Math.max(1.5, size * 0.0525) : Math.max(1.5, size * 0.0675);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (actions.length > 1) {
        actions.forEach((action, i) => {
          const [slotX, slotY] = ARROW_SLOTS[action];
          drawDirectionCone(ctx, cx, cy, size, ACTIONS[action], slotX, slotY, 0.65);
        });
      } else {
        drawDirectionCone(ctx, cx, cy, size, ACTIONS[actions[0]]);
      }
    }
  }
}

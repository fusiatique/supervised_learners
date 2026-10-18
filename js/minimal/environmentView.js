import { ACTIONS, NOTHING, NATURAL, naturalCeiling } from './model.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from '../ui/theme.js';

// The environment panel: three stations the agent walks between, one per
// action, each showing the value the agent has learned for that action in the
// state it last chose in, and the values for the state it will choose in on
// the next step. Below them, a meter of H against the setpoint and the range
// natural rewards can still reach.

const ACTION_COLORS = ['--act-nothing', '--act-natural', '--act-drug'];
const MARGIN = 12;
const CARD_TOP = 10;
const CARD_H = 112;
// Left-to-right slot of each action's station.
const SLOT = [1, 0, 2];

function layout(width) {
  const cardW = (width - 4 * MARGIN) / 3;
  const centers = ACTIONS.map((_, a) => MARGIN + cardW / 2 + SLOT[a] * (cardW + MARGIN));
  return { cardW, centers };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// A small picture for each action: an empty ring, an apple, a capsule.
function drawIcon(ctx, action, x, y) {
  const color = cssVar(ACTION_COLORS[action]);
  ctx.lineWidth = 2;
  if (action === NOTHING) {
    ctx.strokeStyle = cssVar('--text-muted');
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (action === NATURAL) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y + 1, 9, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = cssVar('--text-secondary');
    ctx.beginPath();
    ctx.moveTo(x, y - 7);
    ctx.lineTo(x + 3, y - 12);
    ctx.stroke();
  } else {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 5);
    roundRect(ctx, -12, -5, 24, 10, 5);
    ctx.fillStyle = cssVar('--surface');
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
    roundRect(ctx, 0, -5, 12, 10, [0, 5, 5, 0]);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  ctx.lineWidth = 1;
}

function drawStations(ctx, life, view, shares, { cardW, centers }, advanced) {
  const s = view.s;
  const values = s === null ? [0, 0, 0] : ACTIONS.map((_, a) => life.agent.q[s * ACTIONS.length + a]);
  const valid = life.agent.validActions();
  const nextS = life.nextChoiceState();
  const nextValues = ACTIONS.map((_, a) => life.agent.q[nextS * ACTIONS.length + a]);
  const nextBest = life.agent.bestActions(nextS);
  const scale = Math.max(1e-9, ...valid.map((a) => Math.abs(values[a])));

  ACTIONS.forEach((action, a) => {
    const x = centers[a] - cardW / 2;
    const available = valid.includes(a);
    const chosen = view.action === a && s !== null;
    ctx.globalAlpha = available ? 1 : 0.4;

    roundRect(ctx, x, CARD_TOP, cardW, CARD_H, 8);
    ctx.fillStyle = cssVar('--surface');
    ctx.fill();
    ctx.strokeStyle = chosen ? cssVar(ACTION_COLORS[a]) : cssVar('--border');
    ctx.lineWidth = chosen ? 3 : 1;
    ctx.stroke();
    ctx.lineWidth = 1;

    drawIcon(ctx, a, x + 20, CARD_TOP + 22);
    ctx.fillStyle = cssVar('--text-primary');
    ctx.font = `600 12px ${CANVAS_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(action.name, x + 38, CARD_TOP + 26, cardW - 46);

    ctx.font = `11px ${CANVAS_FONT}`;
    ctx.fillStyle = cssVar('--text-secondary');
    if (!available) {
      ctx.fillText('Not available', x + 12, CARD_TOP + 56);
    } else if (!advanced) {
      ctx.fillText(chosen ? 'Chosen this step' : 'Available', x + 12, CARD_TOP + 56, cardW - 24);
    } else {
      // Learned value as a bar either side of a zero line.
      const barY = CARD_TOP + 46;
      const mid = x + cardW / 2;
      const half = cardW / 2 - 12;
      const len = (values[a] / scale) * half;
      ctx.fillStyle = cssVar('--grid');
      ctx.fillRect(x + 12, barY, cardW - 24, 10);
      ctx.fillStyle = cssVar(ACTION_COLORS[a]);
      ctx.fillRect(Math.min(mid, mid + len), barY, Math.abs(len), 10);
      ctx.fillStyle = cssVar('--text-secondary');
      ctx.fillRect(mid - 0.5, barY - 3, 1, 16);
      ctx.fillText(`Q-value ${s === null ? '–' : values[a].toFixed(2)}`, x + 12, barY + 26, cardW - 24);
      // Value in the state the next step will choose in; the greedy pick in bold.
      const isNext = nextBest.includes(a);
      ctx.font = `${isNext ? '600 ' : ''}11px ${CANVAS_FONT}`;
      ctx.fillStyle = isNext ? cssVar('--text-primary') : cssVar('--text-secondary');
      ctx.fillText(`next ${nextValues[a].toFixed(2)}${isNext ? ' ◂ next pick' : ''}`, x + 12, barY + 42, cardW - 24);
      ctx.font = `11px ${CANVAS_FONT}`;
    }
    ctx.fillStyle = cssVar('--text-muted');
    ctx.fillText(`${(shares[a] * 100).toFixed(1)}% of last 1,000`, x + 12, CARD_TOP + CARD_H - 10, cardW - 24);
    ctx.globalAlpha = 1;
  });
}

function drawAgent(ctx, view, centers, floorY, now) {
  const t = view.duration > 0 ? Math.min(1, (now - view.at) / view.duration) : 1;
  const ease = t * t * (3 - 2 * t);
  const x = centers[view.from] + (centers[view.to] - centers[view.from]) * ease;
  const y = floorY - Math.sin(Math.PI * t) * (view.from === view.to ? 6 : 18);

  ctx.strokeStyle = cssVar('--border');
  ctx.setLineDash([2, 5]);
  ctx.beginPath();
  ctx.moveTo(Math.min(...centers), floorY + 16);
  ctx.lineTo(Math.max(...centers), floorY + 16);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const cx of centers) {
    ctx.beginPath();
    ctx.moveTo(cx, CARD_TOP + CARD_H);
    ctx.lineTo(cx, floorY + 16);
    ctx.strokeStyle = cssVar('--grid');
    ctx.stroke();
  }

  ctx.fillStyle = cssVar('--agent');
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = cssVar('--agent-core');
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();

  // A forced dose shows briefly as a tag above the agent.
  if (now - view.forcedAt < 900) {
    ctx.font = `600 11px ${CANVAS_FONT}`;
    ctx.textAlign = 'center';
    const label = 'forced dose';
    const w = ctx.measureText(label).width + 12;
    roundRect(ctx, x - w / 2, y - 36, w, 18, 9);
    ctx.fillStyle = cssVar('--text-primary');
    ctx.fill();
    ctx.fillStyle = cssVar('--surface');
    ctx.fillText(label, x, y - 23);
  }
  return t < 1;
}

// H on a 0 to 100 track, with the setpoint, the baseline B and the band
// natural rewards alone can hold H in (B up to B + natural gain / k).
function drawMeter(ctx, life, width, top) {
  const p = life.p;
  const { H, B } = life.state;
  const left = MARGIN + 18;
  const right = width - MARGIN - 18;
  const xOf = (v) => left + ((v - p.hMin) / (p.hMax - p.hMin)) * (right - left);
  const barY = top + 18;

  ctx.font = `11px ${CANVAS_FONT}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = cssVar('--text-secondary');
  ctx.fillText('Current State (D)', left, top + 8);

  roundRect(ctx, left, barY, right - left, 12, 6);
  ctx.fillStyle = cssVar('--grid');
  ctx.fill();
  const ceiling = Math.min(p.hMax, naturalCeiling(B, p));
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = cssVar('--act-natural');
  ctx.fillRect(xOf(B), barY, xOf(ceiling) - xOf(B), 12);
  ctx.globalAlpha = 1;

  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = cssVar('--text-primary');
  ctx.beginPath();
  ctx.moveTo(xOf(p.S), barY - 5);
  ctx.lineTo(xOf(p.S), barY + 17);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = cssVar('--line-b');
  ctx.fillRect(xOf(B) - 1.5, barY - 4, 3, 20);
  ctx.fillStyle = cssVar('--line-h');
  ctx.strokeStyle = cssVar('--surface');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(xOf(H), barY + 6, 7, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.textAlign = 'center';
  ctx.fillStyle = cssVar('--text-muted');
  ctx.fillText('setpoint', xOf(p.S), barY + 30);
  ctx.fillStyle = cssVar('--line-b');
  if (Math.abs(xOf(B) - xOf(p.S)) > 44) ctx.fillText('B', xOf(B), barY + 30);
}

// Draws the panel. Returns true while the agent is still walking, so the
// caller knows to draw another frame.
export function drawEnvironment(canvas, life, view, shares, now, advanced = false) {
  const { ctx, width, height } = prepareCanvas(canvas);
  const geometry = layout(width);
  const floorY = CARD_TOP + CARD_H + 34;
  drawStations(ctx, life, view, shares, geometry, advanced);
  const moving = drawAgent(ctx, view, geometry.centers, floorY, now);
  drawMeter(ctx, life, width, height - 52);
  return moving;
}

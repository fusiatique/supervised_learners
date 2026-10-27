import { ACTIONS, NOTHING, NATURAL, DRUG, naturalCeiling } from './model.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

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

// The bio videos' apple and capsule (animation/bio/remotion/src/
// risk-components.tsx RewardSymbol and CapsuleSymbol), in their own units: both
// fit a 160 by 160 box around 0, 0. Doing nothing is a dashed ring.
const APPLE = {
  body: 'M0 -30C-31 -57 -67 -26 -56 11C-46 48 -23 62 0 47C23 62 46 48 56 11C67 -26 31 -57 0 -30Z',
  stem: 'M0 -29Q-7 -50 7 -65',
  leaf: 'M6 -52Q21 -77 43 -65Q35 -43 6 -52Z',
  shine: 'M-40 -9Q-46 4 -37 17',
};
const CAPSULE = {
  left: 'M0 -31H-43A31 31 0 0 0 -43 31H0Z',
  right: 'M0 -31H43A31 31 0 0 1 43 31H0Z',
  outline: 'M-43 -31H43A31 31 0 0 1 43 31H-43A31 31 0 0 1 -43 -31Z M0 -31V31',
};

// The same icons as SVG markup, for the tutorial; style.css colours them.
export function actionIconSvg(action) {
  const inner = action === NATURAL
    ? `<g transform="translate(0 7)"><path class="icon-apple" d="${APPLE.body}" /><path class="icon-line" d="${APPLE.stem}" /><path class="icon-leaf" d="${APPLE.leaf}" /><path class="icon-shine" d="${APPLE.shine}" /></g>`
    : action === DRUG
      ? `<g transform="rotate(-25)"><path class="icon-pill-red" d="${CAPSULE.left}" /><path class="icon-pill-white" d="${CAPSULE.right}" /><path class="icon-line" d="${CAPSULE.outline}" /></g>`
      : '<circle class="icon-nothing" r="58" />';
  return `<svg class="action-icon" viewBox="-80 -80 160 160" aria-hidden="true">${inner}</svg>`;
}

// Draws an action's icon centred on (x, y), about 22 pixels across. Outlines are
// in the text colour, so they are white in the dark theme, as in the videos.
function drawIcon(ctx, action, x, y) {
  const size = 22 / 160;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.lineWidth = 1.1 / size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const ink = cssVar('--text-primary');
  if (action === NOTHING) {
    ctx.strokeStyle = cssVar('--text-muted');
    ctx.setLineDash([3 / size, 3 / size]);
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (action === NATURAL) {
    const green = cssVar('--act-natural');
    ctx.translate(0, 7);
    const body = new Path2D(APPLE.body);
    ctx.fillStyle = green;
    ctx.globalAlpha = 0.25;
    ctx.fill(body);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ink;
    ctx.stroke(body);
    ctx.stroke(new Path2D(APPLE.stem));
    ctx.strokeStyle = green;
    ctx.stroke(new Path2D(APPLE.leaf));
    ctx.globalAlpha = 0.6;
    ctx.stroke(new Path2D(APPLE.shine));
    ctx.globalAlpha = 1;
  } else {
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = cssVar('--act-drug');
    ctx.fill(new Path2D(CAPSULE.left));
    ctx.fillStyle = '#ffffff';
    ctx.fill(new Path2D(CAPSULE.right));
    ctx.strokeStyle = ink;
    ctx.stroke(new Path2D(CAPSULE.outline));
  }
  ctx.restore();
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
      ctx.fillText(`Previous state Q ${s === null ? '–' : values[a].toFixed(2)}`, x + 12, barY + 26, cardW - 24);
      // Value in the state the next step will choose in; the greedy pick in bold.
      const isNext = nextBest.includes(a);
      ctx.font = `${isNext ? '600 ' : ''}11px ${CANVAS_FONT}`;
      ctx.fillStyle = isNext ? cssVar('--text-primary') : cssVar('--text-secondary');
      ctx.fillText(`Current state Q ${nextValues[a].toFixed(2)}${isNext ? ' ◂ next pick' : ''}`, x + 12, barY + 42, cardW - 24);
      ctx.font = `11px ${CANVAS_FONT}`;
    }
    ctx.fillStyle = cssVar('--text-muted');
    ctx.fillText(`${(shares[a] * 100).toFixed(1)}% of last 1,000`, x + 12, CARD_TOP + CARD_H - 10, cardW - 24);
    ctx.globalAlpha = 1;
  });
}

// How content the agent is: 1 with H at the setpoint, 0 when H is
// MOOD_RANGE / 2 away, -1 when it is MOOD_RANGE or more away, either way.
const MOOD_RANGE = 20;
const moodOf = (H, S) => 1 - 2 * Math.min(1, Math.abs(H - S) / MOOD_RANGE);

// Mixes two #rrggbb colours, t = 0 giving a and t = 1 giving b.
function mix(a, b, t) {
  const channel = (hex, i) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  const rgb = [0, 1, 2].map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t));
  return `rgb(${rgb.join(', ')})`;
}

// Face colour: red when distressed (mood -1), yellow when neutral, green when content (1).
const faceColor = (mood) => mood < 0
  ? mix(cssVar('--face-neutral'), cssVar('--face-sad'), -mood)
  : mix(cssVar('--face-neutral'), cssVar('--face-happy'), mood);

// The bio videos' character's face (animation/bio/remotion/src/components.tsx
// HumanCharacter), in units of its head radius of 37: short upright eyes, a
// mouth (half width, height, curve control) that blends from 'satisfied'
// (mood 1) through 'neutral' (0) to 'disappointed' (-1), and the disappointed
// brows, faded in as the mood falls.
const FACE_UNIT = 37;
const MOUTHS = { satisfied: [13, 11, 26], neutral: [10, 13, 20], disappointed: [10, 18, 10] };
function faceShape(mood) {
  const [a, b, t] = mood >= 0 ? [MOUTHS.neutral, MOUTHS.satisfied, mood] : [MOUTHS.neutral, MOUTHS.disappointed, -mood];
  const [half, y, control] = a.map((v, i) => v + (b[i] - v) * t);
  return { half, y, control, brows: Math.max(0, -mood) };
}

// Draws the face at (x, y) with a head radius of 13, in the page's colours.
function drawFace(ctx, x, y, mood) {
  const r = 13;
  const k = r / FACE_UNIT;
  const ink = cssVar('--agent-ink');
  ctx.fillStyle = faceColor(mood);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  const { half, y: mouthY, control, brows } = faceShape(mood);
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    ctx.moveTo(x + side * 12 * k, y - 6 * k);
    ctx.lineTo(x + side * 12 * k, y - 2 * k);
  }
  ctx.moveTo(x - half * k, y + mouthY * k);
  ctx.quadraticCurveTo(x, y + control * k, x + half * k, y + mouthY * k);
  ctx.stroke();
  if (brows > 0) {
    ctx.globalAlpha = brows;
    ctx.beginPath();
    ctx.moveTo(x - 19 * k, y - 12 * k);
    ctx.lineTo(x - 7 * k, y - 15 * k);
    ctx.moveTo(x + 7 * k, y - 15 * k);
    ctx.lineTo(x + 19 * k, y - 12 * k);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.lineCap = 'butt';
  ctx.lineWidth = 1;
}

function drawAgent(ctx, view, centers, floorY, now, mood) {
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

  drawFace(ctx, x, y, mood);

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
  ctx.fillText('Internal level H', left, top + 8);

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
  ctx.fillText(String(p.hMin), xOf(p.hMin), barY + 30);
  ctx.fillText(String(p.hMax), xOf(p.hMax), barY + 30);
  ctx.fillStyle = cssVar('--line-b');
  if (Math.abs(xOf(B) - xOf(p.S)) > 44 && xOf(B) - xOf(p.hMin) > 16) ctx.fillText('B', xOf(B), barY + 30);
}

// Draws the panel. Returns true while the agent is still walking, so the
// caller knows to draw another frame.
export function drawEnvironment(canvas, life, view, shares, now, advanced = false) {
  const { ctx, width, height } = prepareCanvas(canvas);
  const geometry = layout(width);
  const floorY = CARD_TOP + CARD_H + 34;
  drawStations(ctx, life, view, shares, geometry, advanced);
  const mood = moodOf(life.state.H, life.p.S);
  const moving = drawAgent(ctx, view, geometry.centers, floorY, now, mood);
  drawMeter(ctx, life, width, height - 52);
  return moving;
}

export { faceShape, FACE_UNIT };

import { pallor } from '../hrl/mood.js';
import { prepareCanvas } from './theme.js';

const HEALTHY_SKIN = [245, 203, 163];
const ASHEN_SKIN = [178, 182, 184];
const INK = '#34313d';
const BLUSH = 'rgb(226 104 124 / 40%)';
const SHADOW = 'rgb(52 49 61 / 22%)';
const SWEAT = '#8fc4e8';

function skinColor(h) {
  const t = pallor(h);
  const channel = (i) => Math.round(HEALTHY_SKIN[i] + (ASHEN_SKIN[i] - HEALTHY_SKIN[i]) * t);
  return `rgb(${channel(0)} ${channel(1)} ${channel(2)})`;
}

// Draws the agent as a face: the expression is its mood (hrl/mood.js) and
// the skin turns greyer and paler with accumulated harm.
export class AgentView {
  constructor(canvas) {
    this.canvas = canvas;
  }

  draw(mood, h, now = performance.now()) {
    const { ctx, width, height } = prepareCanvas(this.canvas);
    const r = Math.min(width, height) * 0.42;
    this.drawFace(ctx, width / 2, height / 2, r, mood, h, now);
  }

  // Shared renderer keeps the maze marker and state panel identical.
  drawFace(ctx, x, y, r, mood, h, now = performance.now()) {
    ctx.save();
    // In withdrawal the face trembles.
    const tremble = mood.id === 'withdrawal' ? Math.sin(now / 35) * r * 0.025 : 0;
    ctx.translate(x + tremble, y);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = skinColor(h);
    ctx.fill();
    ctx.lineWidth = Math.max(0.8, r * 0.045);
    ctx.strokeStyle = INK;
    ctx.stroke();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = INK;
    this[mood.id](ctx, r);
    ctx.restore();
  }

  // Both eyes (and anything else mirrored) are drawn through this.
  mirrored(ctx, drawSide) {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      drawSide();
      ctx.restore();
    }
  }

  dotEyes(ctx, r) {
    this.mirrored(ctx, () => {
      ctx.beginPath();
      ctx.arc(0.34 * r, -0.16 * r, 0.075 * r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Eyebrows with their inner ends raised by `lift`.
  worriedBrows(ctx, r, lift) {
    this.mirrored(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(0.52 * r, -0.36 * r);
      ctx.lineTo(0.2 * r, (-0.36 - lift) * r);
      ctx.stroke();
    });
  }

  neutral(ctx, r) {
    this.dotEyes(ctx, r);
    ctx.beginPath();
    ctx.moveTo(-0.28 * r, 0.38 * r);
    ctx.lineTo(0.28 * r, 0.38 * r);
    ctx.stroke();
  }

  happy(ctx, r) {
    this.dotEyes(ctx, r);
    ctx.beginPath();
    ctx.arc(0, 0.18 * r, 0.4 * r, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
  }

  euphoric(ctx, r) {
    ctx.fillStyle = BLUSH;
    this.mirrored(ctx, () => {
      ctx.beginPath();
      ctx.arc(0.56 * r, 0.14 * r, 0.14 * r, 0, Math.PI * 2);
      ctx.fill();
    });
    // Eyes squeezed into arcs, mouth wide open.
    this.mirrored(ctx, () => {
      ctx.beginPath();
      ctx.arc(0.34 * r, -0.1 * r, 0.13 * r, Math.PI, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, 0.2 * r, 0.44 * r, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  sad(ctx, r) {
    this.dotEyes(ctx, r);
    this.worriedBrows(ctx, r, 0.1);
    ctx.beginPath();
    ctx.arc(0, 0.72 * r, 0.36 * r, 1.22 * Math.PI, 1.78 * Math.PI);
    ctx.stroke();
  }

  withdrawal(ctx, r) {
    // Shadows under wide, hollow eyes.
    ctx.fillStyle = SHADOW;
    this.mirrored(ctx, () => {
      ctx.beginPath();
      ctx.ellipse(0.34 * r, -0.02 * r, 0.17 * r, 0.09 * r, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = INK;
    this.mirrored(ctx, () => {
      ctx.beginPath();
      ctx.arc(0.34 * r, -0.16 * r, 0.12 * r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0.34 * r, -0.16 * r, 0.035 * r, 0, Math.PI * 2);
      ctx.fill();
    });
    this.worriedBrows(ctx, r, 0.2);

    // A wavering mouth.
    ctx.beginPath();
    ctx.moveTo(-0.34 * r, 0.44 * r);
    for (let i = 1; i <= 6; i++) ctx.lineTo((-0.34 + i * 0.68 / 6) * r, (i % 2 ? 0.36 : 0.44) * r);
    ctx.stroke();

    // A bead of sweat on the brow.
    ctx.fillStyle = SWEAT;
    ctx.beginPath();
    ctx.moveTo(0.7 * r, -0.62 * r);
    ctx.quadraticCurveTo(0.84 * r, -0.4 * r, 0.7 * r, -0.36 * r);
    ctx.quadraticCurveTo(0.56 * r, -0.4 * r, 0.7 * r, -0.62 * r);
    ctx.fill();
  }
}

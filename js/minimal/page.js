import { DRUG, NATURAL, config, naturalCeiling, tippingPoint } from './model.js';
import { stateShape } from './agent.js';
import { Life } from './life.js';
import { DEPENDENT_SHARE, WINDOW } from './experiments.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from '../ui/theme.js';

// The interactive page for the minimal model: one life, stepped in real time.

const HISTORY = 50000; // steps kept for the time plot; the window select picks how many are shown
const MIN_VISITS = 20; // states visited less often are drawn as not learned

const SLIDERS = [
  { key: 'c', label: 'Drug harm cost (c)', min: 0, max: 20, step: 0.5 },
  { key: 'R0', label: 'Drug pleasure (R0)', min: 0, max: 5, step: 0.5 },
  { key: 'delta', label: 'Baseline drop per drug use (δ)', min: 0, max: 3, step: 0.1 },
  { key: 'rho', label: 'Baseline healing rate (ρ)', min: 0, max: 0.01, step: 0.0005 },
  { key: 'naturalGain', label: 'Natural reward gain', min: 0.5, max: 5, step: 0.5 },
];

const $ = (id) => document.getElementById(id);
let life;
let recent; // the last WINDOW actions, as a ring buffer
// The last HISTORY steps as ring buffers indexed by step % HISTORY. `event`
// is 1 for a chosen drug use and 2 for a forced dose.
const history = { H: new Float32Array(HISTORY), B: new Float32Array(HISTORY), event: new Uint8Array(HISTORY) };
let playing = false;
let carry = 0;

function reset() {
  const overrides = Object.fromEntries(SLIDERS.map(({ key }) => [key, Number($(`param-${key}`).value)]));
  life = new Life({ ...overrides, drugAvailable: $('drug-available').checked }, Date.now() >>> 0);
  recent = new Int8Array(WINDOW).fill(-1);
  render();
}

function tick() {
  const { action, forced } = life.tick();
  recent[life.t % WINDOW] = action;
  const i = (life.t - 1) % HISTORY;
  history.H[i] = life.state.H;
  history.B[i] = life.state.B;
  history.event[i] = forced ? 2 : action === DRUG ? 1 : 0;
}

function share(action) {
  const filled = recent.filter((a) => a !== -1);
  return filled.length ? filled.filter((a) => a === action).length / filled.length : 0;
}

// --- Drawing ------------------------------------------------------------------

// Summarises the shown steps per pixel column: the range and mean of H, the
// mean of B, and whether a drug was chosen or a dose forced.
function columns(count) {
  const span = Math.min(Number($('window').value), HISTORY);
  const first = life.t - span;
  const cols = [];
  for (let c = 0; c < count; c++) {
    const from = Math.max(0, first + Math.floor((c * span) / count));
    const to = Math.min(life.t, first + Math.floor(((c + 1) * span) / count));
    if (to <= from) { cols.push(null); continue; }
    let hMin = Infinity, hMax = -Infinity, hSum = 0, bSum = 0, drug = false, forced = false;
    for (let t = from; t < to; t++) {
      const i = t % HISTORY;
      hMin = Math.min(hMin, history.H[i]);
      hMax = Math.max(hMax, history.H[i]);
      hSum += history.H[i];
      bSum += history.B[i];
      drug ||= history.event[i] === 1;
      forced ||= history.event[i] === 2;
    }
    cols.push({ hMin, hMax, hMean: hSum / (to - from), bMean: bSum / (to - from), drug, forced });
  }
  return cols;
}

function drawTrace() {
  const { ctx, width, height } = prepareCanvas($('trace'));
  const pad = { left: 30, right: 84, top: 8, bottom: 26 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const cols = columns(Math.max(1, Math.floor(plotW)));
  const x = (c) => pad.left + c + 0.5;
  const y = (v) => pad.top + (1 - v / 100) * plotH;
  ctx.font = `11px ${CANVAS_FONT}`;

  ctx.fillStyle = cssVar('--text-muted');
  ctx.textAlign = 'right';
  for (let v = 0; v <= 100; v += 25) {
    ctx.strokeStyle = cssVar('--grid');
    ctx.beginPath();
    ctx.moveTo(pad.left, Math.round(y(v)) + 0.5);
    ctx.lineTo(width - pad.right, Math.round(y(v)) + 0.5);
    ctx.stroke();
    ctx.fillText(String(v), pad.left - 6, y(v) + 4);
  }

  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = cssVar('--text-secondary');
  for (const v of [life.p.S, tippingPoint(life.p)]) {
    ctx.beginPath();
    ctx.moveTo(pad.left, y(v));
    ctx.lineTo(width - pad.right, y(v));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.textAlign = 'left';
  ctx.fillStyle = cssVar('--text-secondary');
  ctx.fillText('setpoint S', width - pad.right + 6, y(life.p.S) + 4);
  ctx.fillText('tipping point', width - pad.right + 6, y(tippingPoint(life.p)) + 4);

  // Drug uses and forced doses as ticks along the bottom.
  cols.forEach((col, c) => {
    if (col?.drug) {
      ctx.fillStyle = cssVar('--act-drug');
      ctx.fillRect(x(c) - 0.5, height - pad.bottom + 6, 1, 8);
    }
    if (col?.forced) {
      ctx.fillStyle = cssVar('--text-primary');
      ctx.fillRect(x(c) - 1, height - pad.bottom + 4, 2, 14);
    }
  });

  // H swings within a column: draw its range faintly, its mean on top.
  ctx.strokeStyle = cssVar('--line-h');
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  cols.forEach((col, c) => {
    if (!col) return;
    ctx.moveTo(x(c), y(col.hMax));
    ctx.lineTo(x(c), y(col.hMin) + 0.5);
  });
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (const [key, color, lineWidth] of [['hMean', '--line-h', 1.5], ['bMean', '--line-b', 2.5]]) {
    ctx.strokeStyle = cssVar(color);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    let started = false;
    cols.forEach((col, c) => {
      if (!col) return;
      if (started) ctx.lineTo(x(c), y(col[key]));
      else ctx.moveTo(x(c), y(col[key]));
      started = true;
    });
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

function drawPolicy() {
  const { ctx, width, height } = prepareCanvas($('policy'));
  const p = life.p;
  const { hBins, bBins } = stateShape(p);
  const pad = { left: 34, right: 6, top: 6, bottom: 34 };
  const cellW = (width - pad.left - pad.right) / bBins;
  const cellH = (height - pad.top - pad.bottom) / hBins;
  const colors = [cssVar('--act-nothing'), cssVar('--act-natural'), cssVar('--act-drug')];
  const xOfB = (B) => pad.left + (B / p.B0) * bBins * cellW;
  const yOfH = (H) => pad.top + (1 - H / p.hMax) * hBins * cellH;

  for (let h = 0; h < hBins; h++) {
    for (let b = 0; b < bBins; b++) {
      const action = life.agent.preferred(h * bBins + b, MIN_VISITS);
      ctx.fillStyle = action === null ? cssVar('--unlearned') : colors[action];
      ctx.fillRect(pad.left + b * cellW + 1, pad.top + (hBins - 1 - h) * cellH + 1, cellW - 2, cellH - 2);
    }
  }

  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = cssVar('--text-primary');
  ctx.beginPath();
  ctx.moveTo(pad.left, yOfH(p.S));
  ctx.lineTo(width - pad.right, yOfH(p.S));
  const tx = xOfB(Math.max(0, tippingPoint(p)));
  ctx.moveTo(tx, pad.top);
  ctx.lineTo(tx, height - pad.bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = cssVar('--text-muted');
  ctx.font = `11px ${CANVAS_FONT}`;
  ctx.textAlign = 'center';
  for (let b = 0; b <= bBins; b += 2) ctx.fillText(String(b * p.bBinWidth), pad.left + b * cellW, height - pad.bottom + 14);
  ctx.fillText('Baseline B', pad.left + (bBins * cellW) / 2, height - 4);
  ctx.textAlign = 'right';
  for (let h = 0; h <= hBins; h += 2) ctx.fillText(String(h * p.hBinWidth), pad.left - 6, yOfH(h * p.hBinWidth) + 4);

  ctx.fillStyle = cssVar('--text-primary');
  ctx.strokeStyle = cssVar('--surface');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(xOfB(life.state.B), yOfH(life.state.H), 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1;
}

function renderReadouts() {
  const { H, B } = life.state;
  const drugShare = share(DRUG);
  const tipping = tippingPoint(life.p);
  let status = 'Clean';
  let kind = 'clean';
  let hint = `B is above the tipping point (${tipping.toFixed(0)}), so natural rewards alone can hold H at the setpoint.`;
  if (drugShare >= DEPENDENT_SHARE) {
    status = 'Dependent';
    kind = 'dependent';
    hint = `It takes the drug on ${(drugShare * 100).toFixed(0)}% of steps. Each use keeps B down, and with B at ${B.toFixed(0)} natural rewards can only reach H = ${naturalCeiling(B, life.p).toFixed(0)}.`;
  } else if (B < tipping) {
    status = 'At risk';
    kind = '';
    hint = `B is below the tipping point: natural rewards can only reach H = ${naturalCeiling(B, life.p).toFixed(0)}, short of the setpoint.`;
  }
  if (!life.p.drugAvailable) hint += ' The drug is not available.';
  $('status').textContent = status;
  $('status').className = `status ${kind}`;
  $('status-hint').textContent = hint;
  $('r-step').textContent = life.t.toLocaleString('en');
  $('r-eps').textContent = life.agent.epsilon.toFixed(3);
  $('r-h').textContent = H.toFixed(1);
  $('r-b').textContent = B.toFixed(1);
  $('r-drug').textContent = `${(drugShare * 100).toFixed(1)}%`;
  $('r-natural').textContent = `${(share(NATURAL) * 100).toFixed(1)}%`;
  $('tipping').textContent = tipping.toFixed(1);
}

function render() {
  drawTrace();
  drawPolicy();
  renderReadouts();
}

// --- Controls -------------------------------------------------------------------

function stepsPerSecond() {
  return 2 * 10 ** ((Number($('speed').value) / 100) * 4.7);
}

function updateSpeedLabel() {
  const rate = stepsPerSecond();
  $('speed-label').textContent = `${rate >= 100 ? Math.round(rate).toLocaleString('en') : rate.toFixed(1)} steps/s`;
}

function frame() {
  if (!playing) return;
  carry += stepsPerSecond() / 60;
  const n = Math.floor(carry);
  carry -= n;
  for (let i = 0; i < n; i++) tick();
  render();
  requestAnimationFrame(frame);
}

// Slider changes apply to the running life at once; Reset keeps them.
function buildSliders() {
  const defaults = config();
  for (const slider of SLIDERS) {
    const label = document.createElement('label');
    label.className = 'param';
    label.innerHTML = `<span>${slider.label}</span><output></output>
      <input id="param-${slider.key}" type="range" min="${slider.min}" max="${slider.max}" step="${slider.step}">`;
    const input = label.querySelector('input');
    const output = label.querySelector('output');
    input.value = defaults[slider.key];
    output.textContent = input.value;
    input.addEventListener('input', () => {
      life.p[slider.key] = Number(input.value);
      output.textContent = input.value;
      render();
    });
    $('params').append(label);
  }
}

buildSliders();
reset();
updateSpeedLabel();

$('play').addEventListener('click', () => {
  playing = !playing;
  $('play').textContent = playing ? 'Pause' : 'Play';
  if (playing) requestAnimationFrame(frame);
});
$('step').addEventListener('click', () => { tick(); render(); });
$('reset').addEventListener('click', reset);
$('speed').addEventListener('input', updateSpeedLabel);
$('window').addEventListener('change', render);
$('drug-available').addEventListener('change', (e) => { life.p.drugAvailable = e.target.checked; render(); });
$('dose').addEventListener('click', () => { life.dose(1); render(); });
$('dose10').addEventListener('click', () => { life.dose(10); render(); });
window.addEventListener('resize', render);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);

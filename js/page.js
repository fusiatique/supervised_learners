import { ACTIONS, DRUG, NATURAL, NOTHING, config, naturalCeiling, tippingPoint } from './model.js';
import { stateShape } from './agent.js';
import { Life } from './life.js';
import { DEPENDENT_SHARE, WINDOW } from './experiments.js';
import { drawEnvironment } from './environmentView.js';
import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

// The interactive page for the minimal model: one life, stepped in real time.

const HISTORY = 50000; // steps kept for the time plot; the window select picks how many are shown
const MIN_VISITS = 20; // states visited less often are drawn as not learned
const TRAIL = 100; // recent steps drawn as a fading trail on the policy map
const Y_MIN_SPAN = 2; // the time plot's y-axis zooms in no further than this
const X_MIN_SPAN = 20; // nor its time axis further than this many steps

const SLIDERS = [
  { key: 'c', label: 'Drug harm cost (c)', help: 'Reward points subtracted when the agent chooses the drug. Increase this to make drug use less attractive. It does not change the baseline drop caused by a dose.', min: 0, max: 20, step: 0.5 },
  { key: 'R0', label: 'Drug pleasure (R0)', help: 'Extra reward points for choosing the drug, on top of any reward from moving the internal level H toward its target. Higher values make drug use more attractive; they do not make H rise more.', min: 0, max: 5, step: 0.5 },
  { key: 'delta', label: 'Baseline drop per drug use (δ)', help: 'How much each drug dose lowers the baseline B, the level H drifts toward. Higher values make repeated use lower the baseline faster, potentially making the drug more useful for relieving a low internal state.', min: 0, max: 3, step: 0.1 },
  { key: 'rho', label: 'Baseline healing rate (ρ)', help: 'How quickly baseline B recovers toward its original value of 40 each step. Higher values mean faster recovery. At 0, the baseline does not recover automatically. This is a fraction of the remaining gap, not a fixed increase.', min: 0, max: 0.01, step: 0.0005 },
  { key: 'naturalGain', label: 'Natural reward gain', help: 'How much a natural action raises the internal level H. This is not a direct reward-point bonus: moving H closer to the target earns reward, while overshooting can lose reward. Higher values help natural rewards compensate for a lower baseline and lower the tipping point.', min: 0.5, max: 5, step: 0.5 },
];

const $ = (id) => document.getElementById(id);
let life;
let recent; // the last WINDOW actions, as a ring buffer
// The last HISTORY steps as ring buffers indexed by step % HISTORY. `event`
// is 1 for a chosen drug use and 2 for a forced dose.
const history = { H: new Float32Array(HISTORY), B: new Float32Array(HISTORY), event: new Uint8Array(HISTORY) };
let showLearningDetails = false;
let playing = false;
let carry = 0;
// The agent's last decision and its walk to that station, for the environment
// panel. `s` is the state it chose in, null before the first step.
let view;
let walking = false;
// The time plot's y-axis: shown range, and whether it follows the data. The
// last drawn geometry is kept for the mouse handlers.
let yRange = [0, 100];
let yFit = false;
// The time axis: how many steps are shown, and the last one shown, or null to
// follow the newest step.
let xSpan = HISTORY;
let xEnd = null;
let traceGeometry = null;

function reset() {
  const overrides = Object.fromEntries(SLIDERS.map(({ key }) => [key, Number($(`param-${key}`).value)]));
  life = new Life({ ...overrides, drugAvailable: $('drug-available').checked }, Date.now() >>> 0);
  recent = new Int8Array(WINDOW).fill(-1);
  xEnd = null;
  view = { s: null, action: NOTHING, explored: false, reward: 0, from: NOTHING, to: NOTHING, at: 0, duration: 0, forcedAt: -Infinity };
  render();
}

function tick() {
  const { action, reward, forced, s, explored } = life.tick();
  const now = performance.now();
  // Walk for most of the time until the next step; too fast to follow, snap.
  const duration = Math.min(450, 800 / stepsPerSecond());
  view = { ...view, s, action, explored, reward, from: view.to, to: action, at: now, duration: duration < 40 ? 0 : duration };
  if (forced) view.forcedAt = now;
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

// The steps the time plot shows, [first, last). Before the plot has filled,
// the steps before 0 are left empty.
function xView() {
  const oldest = Math.max(0, life.t - HISTORY);
  const span = Math.min(xSpan, HISTORY);
  const last = xEnd === null ? life.t : Math.min(life.t, Math.max(xEnd, oldest + span));
  return { first: last - span, last, live: last === life.t };
}

// Sets the time axis, snapping back to following the newest step at the end.
function setX(span, last) {
  xSpan = Math.round(Math.min(HISTORY, Math.max(X_MIN_SPAN, span)));
  const oldest = Math.max(0, life.t - HISTORY);
  const earliestEnd = Math.min(life.t, oldest + xSpan);
  const end = Math.min(life.t, Math.max(earliestEnd, Math.round(last)));
  xEnd = end >= life.t ? null : end;
  render();
}

// Zooms the time axis by `factor` (below 1 zooms in) keeping step `at` in place.
function zoomX(factor, at) {
  const { first, last } = xView();
  at ??= (first + last) / 2;
  const span = Math.min(HISTORY, Math.max(X_MIN_SPAN, (last - first) * factor));
  setX(span, at + (last - at) * (span / (last - first)));
}

// Summarises the shown steps per pixel column: the range and mean of H, the
// mean of B, and whether a drug was chosen or a dose forced.
function columns(count, { first, last }) {
  const span = last - first;
  const oldest = Math.max(0, life.t - HISTORY);
  const cols = [];
  for (let c = 0; c < count; c++) {
    const from = Math.max(oldest, first + Math.floor((c * span) / count));
    const to = Math.min(last, first + Math.floor(((c + 1) * span) / count));
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

// Keeps a y range inside 0 to 100 and at least Y_MIN_SPAN wide.
function clampRange([lo, hi]) {
  const span = Math.min(100, Math.max(Y_MIN_SPAN, hi - lo));
  const mid = (lo + hi) / 2;
  lo = Math.min(100 - span, Math.max(0, mid - span / 2));
  return [lo, lo + span];
}

// The range of H and B in the shown columns, with a margin.
function fitRange(cols) {
  let lo = Infinity, hi = -Infinity;
  for (const col of cols) {
    if (!col) continue;
    lo = Math.min(lo, col.hMin, col.bMean);
    hi = Math.max(hi, col.hMax, col.bMean);
  }
  if (lo > hi) return [0, 100];
  const margin = Math.max(1, (hi - lo) * 0.1);
  return clampRange([lo - margin, hi + margin]);
}

// Zooms the y-axis by `factor` (below 1 zooms in) keeping `at` in place.
function zoomY(factor, at = (yRange[0] + yRange[1]) / 2) {
  yFit = false;
  yRange = clampRange([at - (at - yRange[0]) * factor, at + (yRange[1] - at) * factor]);
  updateYControls();
  render();
}

function updateYControls() {
  $('y-fit').setAttribute('aria-pressed', String(yFit));
}

function drawTrace() {
  const { ctx, width, height } = prepareCanvas($('trace'));
  const pad = { left: 30, right: 84, top: 8, bottom: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const view = xView();
  const cols = columns(Math.max(1, Math.floor(plotW)), view);
  if (yFit) yRange = fitRange(cols);
  const [lo, hi] = yRange;
  traceGeometry = { top: pad.top, plotH, lo, hi, left: pad.left, plotW, ...view };
  const steps = (n) => Math.max(0, n).toLocaleString('en');
  $('trace-range').textContent = `Elapsed: ${steps(life.t)} simulation steps. Viewing steps ${steps(view.first)} to ${steps(view.last)}${view.live ? ', following the newest step' : ''}.`;
  const x = (c) => pad.left + c + 0.5;
  const y = (v) => pad.top + (1 - (v - lo) / (hi - lo)) * plotH;
  const inRange = (v) => v >= lo && v <= hi;
  ctx.font = `11px ${CANVAS_FONT}`;

  // About four to five gridlines whatever the zoom.
  const tick = [0.5, 1, 2, 5, 10, 25, 50].find((s) => (hi - lo) / s <= 5);
  ctx.fillStyle = cssVar('--text-muted');
  ctx.textAlign = 'right';
  for (let v = Math.ceil(lo / tick) * tick; v <= hi + 1e-9; v += tick) {
    ctx.strokeStyle = cssVar('--grid');
    ctx.beginPath();
    ctx.moveTo(pad.left, Math.round(y(v)) + 0.5);
    ctx.lineTo(width - pad.right, Math.round(y(v)) + 0.5);
    ctx.stroke();
    ctx.fillText(tick < 1 ? v.toFixed(1) : String(Math.round(v)), pad.left - 6, y(v) + 4);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(pad.left, pad.top, plotW, plotH);
  ctx.clip();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = cssVar('--text-secondary');
  for (const v of [life.p.S, tippingPoint(life.p)]) {
    ctx.beginPath();
    ctx.moveTo(pad.left, y(v));
    ctx.lineTo(width - pad.right, y(v));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.fillStyle = cssVar('--text-secondary');
  if (inRange(life.p.S)) ctx.fillText('setpoint S', width - pad.right + 6, y(life.p.S) + 4);
  if (inRange(tippingPoint(life.p))) ctx.fillText('tipping point', width - pad.right + 6, y(tippingPoint(life.p)) + 4);

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

  // Elapsed simulation steps, with readable integer ticks at every zoom level.
  // Event marks occupy a separate strip above the axis labels.
  const axisY = height - pad.bottom + 23;
  const span = view.last - view.first;
  const targetTicks = Math.max(2, Math.floor(plotW / 95));
  const roughStep = span / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const tickStep = Math.max(1, [1, 2, 5, 10].find((n) => n * magnitude >= roughStep) * magnitude);
  const stepX = (step) => pad.left + ((step - view.first) / span) * plotW;
  ctx.save();
  ctx.strokeStyle = cssVar('--axis');
  ctx.fillStyle = cssVar('--text-secondary');
  ctx.beginPath();
  ctx.moveTo(pad.left, axisY);
  ctx.lineTo(width - pad.right, axisY);
  ctx.stroke();
  ctx.textBaseline = 'top';
  for (let step = Math.ceil(Math.max(0, view.first) / tickStep) * tickStep; step <= view.last; step += tickStep) {
    const px = stepX(step);
    ctx.beginPath();
    ctx.moveTo(px, axisY);
    ctx.lineTo(px, axisY + 4);
    ctx.stroke();
    ctx.textAlign = px < pad.left + 30 ? 'left' : px > width - pad.right - 30 ? 'right' : 'center';
    ctx.fillText(steps(step), px, axisY + 7);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = `600 11px ${CANVAS_FONT}`;
  ctx.fillText('Time elapsed (simulation steps)', pad.left + plotW / 2, height - 2);
  ctx.restore();

  // H swings within a column: draw its range faintly, its mean on top.
  ctx.save();
  ctx.beginPath();
  ctx.rect(pad.left, pad.top, plotW, plotH);
  ctx.clip();
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
  ctx.restore();
  ctx.lineWidth = 1;
}

function drawPolicy() {
  const { ctx, width, height } = prepareCanvas($('policy'));
  const p = life.p;
  const { hBins, bBins } = stateShape(p);
  const pad = { left: 50, right: 6, top: 6, bottom: 34 };
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
  ctx.save();
  ctx.translate(12, pad.top + (hBins * cellH) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Current State (D)', 0, 0);
  ctx.restore();

  // The last TRAIL states, oldest faintest, ending at the dot.
  const n = Math.min(life.t, TRAIL);
  ctx.strokeStyle = cssVar('--text-primary');
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  for (let j = 1; j < n; j++) {
    const a = (life.t - n + j - 1) % HISTORY;
    const b = (life.t - n + j) % HISTORY;
    ctx.globalAlpha = 0.8 * (j / n);
    ctx.beginPath();
    ctx.moveTo(xOfB(history.B[a]), yOfH(history.H[a]));
    ctx.lineTo(xOfB(history.B[b]), yOfH(history.H[b]));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = cssVar('--text-primary');
  ctx.strokeStyle = cssVar('--surface');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(xOfB(life.state.B), yOfH(life.state.H), 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawEnvironmentPanel() {
  const shares = ACTIONS.map((_, a) => share(a));
  walking = drawEnvironment($('environment'), life, view, shares, performance.now(), showLearningDetails);
  let caption = 'Press Play or Step. Each step the agent picks one station.';
  if (view.s !== null) {
    const name = ACTIONS[view.action].name.toLowerCase();
    const why = view.explored ? 'a random pick while exploring' : 'a highest-valued option (ties are random)';
    const sign = view.reward >= 0 ? '+' : '−';
    caption = showLearningDetails
      ? `Chose ${name}, ${why}. Reward ${sign}${Math.abs(view.reward).toFixed(2)}.`
      : `Chose ${name}.`;
  }
  const best = life.agent.bestActions(life.nextChoiceState());
  const next = best.length === 1 ? ACTIONS[best[0]].name.toLowerCase() : 'a tie, broken at random';
  if (showLearningDetails) caption += ` Next step: ${next} (${(life.agent.epsilon * 100).toFixed(1)}% chance of exploring instead).`;
  $('env-caption').textContent = caption;
}

// Keeps drawing the environment while the agent walks and the page is paused.
function animateWalk() {
  if (playing) return;
  drawEnvironmentPanel();
  if (walking) requestAnimationFrame(animateWalk);
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
  $('r-eps').textContent = `${(life.agent.epsilon * 100).toFixed(1)}%`;
  $('r-h').textContent = H.toFixed(1);
  $('r-b').textContent = B.toFixed(1);
  $('r-drug').textContent = `${(drugShare * 100).toFixed(1)}%`;
  $('r-natural').textContent = `${(share(NATURAL) * 100).toFixed(1)}%`;
  $('tipping').textContent = tipping.toFixed(1);
}

function render() {
  drawEnvironmentPanel();
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
    const label = document.createElement('div');
    label.className = 'param minimal-param';
    const helpId = `help-${slider.key}`;
    label.innerHTML = `<label for="param-${slider.key}">${slider.label}</label>
      <div class="parameter-value">
        <output for="param-${slider.key}"></output>
        <button class="info-button parameter-info" type="button"
          aria-label="About ${slider.label}" aria-describedby="${helpId}"
          aria-expanded="false" aria-controls="${helpId}">i</button>
      </div>
      <input id="param-${slider.key}" type="range" min="${slider.min}" max="${slider.max}" step="${slider.step}" aria-describedby="${helpId}">
      <span id="${helpId}" class="parameter-tooltip" role="tooltip" hidden></span>`;
    const info = label.querySelector('.parameter-info');
    const tooltip = label.querySelector('.parameter-tooltip');
    tooltip.textContent = slider.help;
    let pinned = false;
    const show = () => { tooltip.hidden = false; info.setAttribute('aria-expanded', 'true'); };
    const hide = () => { pinned = false; tooltip.hidden = true; info.setAttribute('aria-expanded', 'false'); };
    info.addEventListener('mouseenter', show);
    info.addEventListener('focus', show);
    info.addEventListener('blur', hide);
    info.addEventListener('click', () => { pinned = !pinned; if (pinned) show(); else hide(); });
    label.addEventListener('mouseleave', () => { if (!pinned && document.activeElement !== info) hide(); });
    document.addEventListener('click', (event) => { if (!label.contains(event.target)) hide(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hide(); });
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
$('show-learning-details').addEventListener('change', (event) => {
  showLearningDetails = event.target.checked;
  for (const element of document.querySelectorAll('[data-learning-details]')) element.hidden = !showLearningDetails;
  render();
});
const stateInfo = $('state-info');
const statePopup = $('state-info-popup');
const stateHelp = stateInfo.parentElement;
function openStateInfo() {
  statePopup.hidden = false;
  stateInfo.setAttribute('aria-expanded', 'true');
}
function closeStateInfo() {
  statePopup.hidden = true;
  stateInfo.setAttribute('aria-expanded', 'false');
}
stateHelp.addEventListener('mouseenter', openStateInfo);
stateHelp.addEventListener('mouseleave', () => {
  if (!stateHelp.contains(document.activeElement)) closeStateInfo();
});
stateHelp.addEventListener('focusin', openStateInfo);
stateHelp.addEventListener('focusout', (event) => {
  if (!stateHelp.contains(event.relatedTarget)) closeStateInfo();
});
stateInfo.addEventListener('click', openStateInfo);
document.addEventListener('click', (event) => {
  if (!stateInfo.contains(event.target) && !statePopup.contains(event.target)) closeStateInfo();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !statePopup.hidden) {
    stateInfo.focus();
    closeStateInfo();
  }
});
xSpan = Number($('window').value);
reset();
updateSpeedLabel();

$('play').addEventListener('click', () => {
  playing = !playing;
  $('play').textContent = playing ? 'Pause' : 'Play';
  requestAnimationFrame(playing ? frame : animateWalk);
});
$('step').addEventListener('click', () => { tick(); render(); requestAnimationFrame(animateWalk); });
$('reset').addEventListener('click', reset);
$('speed').addEventListener('input', updateSpeedLabel);
$('window').addEventListener('change', () => setX(Number($('window').value), life.t));

// Time plot zoom: buttons; pinch or Ctrl/⌘ + scroll zooms the y-axis and
// Alt/Option + scroll the time axis, at the pointer; drag to pan; double-click
// to show 0 to 100 over the chosen window.
$('x-in').addEventListener('click', () => zoomX(1 / 2));
$('x-out').addEventListener('click', () => zoomX(2));
$('x-now').addEventListener('click', () => setX(xSpan, life.t));
$('y-in').addEventListener('click', () => zoomY(1 / 1.5));
$('y-out').addEventListener('click', () => zoomY(1.5));
$('y-fit').addEventListener('click', () => { yFit = !yFit; updateYControls(); render(); });
$('y-full').addEventListener('click', () => { yFit = false; yRange = [0, 100]; updateYControls(); render(); });
const valueAt = (clientY) => {
  const { top, plotH, lo, hi } = traceGeometry;
  const fraction = (clientY - $('trace').getBoundingClientRect().top - top) / plotH;
  return hi - Math.min(1, Math.max(0, fraction)) * (hi - lo);
};
const stepAt = (clientX) => {
  const { left, plotW, first, last } = traceGeometry;
  const fraction = (clientX - $('trace').getBoundingClientRect().left - left) / plotW;
  return first + Math.min(1, Math.max(0, fraction)) * (last - first);
};
$('trace').addEventListener('wheel', (e) => {
  if (e.altKey) {
    e.preventDefault();
    zoomX(Math.exp((e.deltaY || e.deltaX) * 0.01), stepAt(e.clientX));
  } else if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    zoomY(Math.exp(e.deltaY * 0.01), valueAt(e.clientY));
  } else if (e.shiftKey
    || e.clientX - $('trace').getBoundingClientRect().left < traceGeometry.left
    || (yRange[1] - yRange[0] < 100 - 1e-9 && Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY !== 0)) {
    e.preventDefault();
    // Ordinary vertical scrolling pans a zoomed y-axis, anywhere on the plot.
    // Shift-wheel and scrolling over y labels also select vertical panning.
    const delta = e.deltaY || e.deltaX;
    const pixels = delta * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? traceGeometry.plotH : 1);
    const [lo, hi] = yRange;
    const shift = -pixels * (hi - lo) / traceGeometry.plotH;
    yFit = false;
    yRange = clampRange([lo + shift, hi + shift]);
    updateYControls();
    render();
  } else {
    // Wheel up / trackpad left goes earlier; down / right goes later.
    // Keep the selected window length, rather than zooming out to see history.
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const pixels = delta * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? traceGeometry.plotW : 1);
    setX(xSpan, xView().last + pixels * xSpan / traceGeometry.plotW);
  }
}, { passive: false });
let drag = null;
$('trace').addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return; // leave touch for scrolling the page
  const { lo, hi, plotH, first, last, plotW } = traceGeometry;
  drag = { x: e.clientX, y: e.clientY, range: yRange, perPixel: (hi - lo) / plotH, last, stepsPerPixel: (last - first) / plotW };
  $('trace').setPointerCapture(e.pointerId);
});
$('trace').addEventListener('pointermove', (e) => {
  if (!drag) return;
  const shift = (e.clientY - drag.y) * drag.perPixel;
  if (shift !== 0) {
    yFit = false;
    yRange = clampRange([drag.range[0] + shift, drag.range[1] + shift]);
    updateYControls();
  }
  setX(xSpan, drag.last - (e.clientX - drag.x) * drag.stepsPerPixel);
});
$('trace').addEventListener('pointerup', () => { drag = null; });
$('trace').addEventListener('pointercancel', () => { drag = null; });
$('trace').addEventListener('dblclick', () => {
  $('y-full').click();
  setX(Number($('window').value), life.t);
});
$('drug-available').addEventListener('change', (e) => { life.p.drugAvailable = e.target.checked; render(); });
$('dose').addEventListener('click', () => { life.dose(1); render(); });
$('dose10').addEventListener('click', () => { life.dose(10); render(); });
window.addEventListener('resize', render);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);

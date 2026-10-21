// Interactive figures for tutorial.html. The explainers run the real model
// from model.js; the live panels are the simulation itself, embedded.
import { NOTHING, NATURAL, DRUG, ACTIONS, config, step, naturalCeiling, tippingPoint } from './model.js';

const $ = (id) => document.getElementById(id);
const fmt = (value, digits = 1) => Number(value.toFixed(digits)).toString();

// Maps a value range onto a pixel range.
function scale([d0, d1], [r0, r1]) {
  return (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

function bindRange(id, onInput) {
  const input = $(id);
  const output = document.querySelector(`output[for="${id}"]`);
  const update = () => {
    if (output) output.textContent = input.value;
    onInput(Number(input.value));
  };
  input.addEventListener('input', update);
  return { input, update };
}

// --- Natural-reward ceiling ------------------------------------------------

function ceilingExplorer() {
  const svg = $('ceiling-svg');
  if (!svg) return;
  const p = config();
  const x = scale([0, p.B0], [76, 604]);
  const y = scale([0, 100], [246, 26]);

  function render() {
    const B = Number($('ceiling-b').value);
    p.naturalGain = Number($('ceiling-gain').value);
    const tip = tippingPoint(p);
    const ceilingAt = (b) => Math.min(p.hMax, naturalCeiling(b, p));
    const reach = ceilingAt(B);
    const short = p.S - reach;

    const hTicks = [0, 25, 50, 75, 100].map((v) =>
      `<line class="diagram-grid" x1="76" y1="${y(v)}" x2="604" y2="${y(v)}" />
       <text class="diagram-tick" x="65" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('');
    const bTicks = [0, 10, 20, 30, 40].map((v) =>
      `<text class="diagram-tick" x="${x(v)}" y="264" text-anchor="middle">${v}</text>`).join('');
    const risk = tip > 0
      ? `<rect class="diagram-risk-zone" x="76" y="${y(100)}" width="${x(Math.min(tip, p.B0)) - 76}" height="${y(0) - y(100)}" rx="4" />
         <text class="diagram-risk-label" x="${(76 + x(Math.min(tip, p.B0))) / 2}" y="${y(6)}" text-anchor="middle">${tip > 12 ? 'Natural reward cannot reach setpoint' : ''}</text>`
      : '';
    const tipMark = tip > 0 && tip <= p.B0
      ? `<line class="diagram-threshold" x1="${x(tip)}" y1="${y(100)}" x2="${x(tip)}" y2="${y(0)}" />
         <circle class="diagram-threshold-dot" cx="${x(tip)}" cy="${y(p.S)}" r="5" />
         <text class="diagram-threshold-label" x="${x(tip) + (tip > 30 ? -8 : 8)}" y="${y(96)}" text-anchor="${tip > 30 ? 'end' : 'start'}">Tipping point B = ${fmt(tip)}</text>`
      : '';
    // The ceiling line, bent where it hits the top of the range.
    const kink = p.hMax - p.naturalGain / p.k;
    const ceilingPath = kink < p.B0
      ? `M ${x(0)} ${y(ceilingAt(0))} L ${x(kink)} ${y(p.hMax)} L ${x(p.B0)} ${y(p.hMax)}`
      : `M ${x(0)} ${y(ceilingAt(0))} L ${x(p.B0)} ${y(ceilingAt(p.B0))}`;
    const ok = short <= 0;

    svg.innerHTML = `
      <title>Natural-reward ceiling for natural reward gain ${p.naturalGain}</title>
      ${risk}${hTicks}
      <line class="diagram-setpoint" x1="76" y1="${y(p.S)}" x2="604" y2="${y(p.S)}" />
      <text class="diagram-label" x="84" y="${y(p.S) - 8}">Setpoint H = ${p.S}</text>
      ${tipMark}
      <path class="diagram-ceiling" d="${ceilingPath}" />
      <line class="diagram-current" x1="${x(B)}" y1="${y(0)}" x2="${x(B)}" y2="${y(reach)}" />
      ${ok ? '' : `<line class="diagram-gap" x1="${x(B)}" y1="${y(reach)}" x2="${x(B)}" y2="${y(p.S)}" />`}
      <circle class="diagram-current-dot ${ok ? 'ok' : 'short'}" cx="${x(B)}" cy="${y(reach)}" r="7" />
      <line class="diagram-axis" x1="76" y1="${y(100)}" x2="76" y2="246" />
      <line class="diagram-axis" x1="76" y1="246" x2="604" y2="246" />
      ${bTicks}
      <text class="diagram-axis-label" x="340" y="296" text-anchor="middle">Baseline B</text>
      <text class="diagram-axis-label" transform="translate(18 136) rotate(-90)" text-anchor="middle">Internal level H</text>`;

    $('ceiling-readout').innerHTML = ok
      ? `At <strong>B = ${B}</strong>, choosing natural reward every step brings H to <strong>${fmt(reach)}</strong>: it can reach the setpoint.`
      : `At <strong>B = ${B}</strong>, choosing natural reward every step only brings H to <strong>${fmt(reach)}</strong>, which is <strong>${fmt(short)} short</strong> of the setpoint.`;
    $('ceiling-formula').textContent = `Ceiling H = B + ${p.naturalGain} / ${p.k} = B + ${fmt(p.naturalGain / p.k)}`;
  }

  bindRange('ceiling-b', render).update();
  bindRange('ceiling-gain', render).update();
}

// --- Immediate reward of each action ---------------------------------------

function rewardExplorer() {
  const rows = $('reward-rows');
  if (!rows) return;
  const p = config();
  const LIMIT = 40; // bars span -LIMIT to +LIMIT reward points
  const classes = { [NOTHING]: 'nothing', [NATURAL]: 'natural', [DRUG]: 'drug' };

  function render() {
    const H = Number($('reward-h').value);
    const B = Number($('reward-b').value);
    const results = ACTIONS.map((_, action) => ({ action, ...step({ H, B }, action, p) }));
    const best = results.reduce((a, b) => (b.reward > a.reward ? b : a));

    rows.innerHTML = results.map(({ action, H: nextH, reward, driveReduction, drugTerm }) => {
      const width = (Math.min(Math.abs(reward), LIMIT) / LIMIT) * 50;
      const left = reward >= 0 ? 50 : 50 - width;
      const detail = action === DRUG
        ? `drive change ${fmt(driveReduction)}, pleasure − harm ${drugTerm >= 0 ? '+' : ''}${fmt(drugTerm)}`
        : `drive change ${fmt(driveReduction)}`;
      return `<div class="reward-row${action === best.action ? ' best' : ''}">
        <span class="reward-name">${ACTIONS[action].name}</span>
        <span class="reward-track" aria-hidden="true">
          <span class="reward-bar ${classes[action]}" style="left:${left}%;width:${width}%"></span>
        </span>
        <span class="reward-value">${reward >= 0 ? '+' : ''}${fmt(reward)}</span>
        <span class="reward-detail">H ${H} → ${fmt(nextH)} · ${detail}</span>
      </div>`;
    }).join('');

    const distance = Math.abs(p.S - H);
    $('reward-readout').innerHTML = distance < 1 && best.action !== DRUG
      ? `H is at the setpoint, so the drug’s +${p.drugGain} overshoots and is punished. Staying put is best.`
      : `Best right now: <strong>${ACTIONS[best.action].name.toLowerCase()}</strong> (${best.reward >= 0 ? '+' : ''}${fmt(best.reward)} reward points).`;
  }

  const h = bindRange('reward-h', render);
  const b = bindRange('reward-b', render);
  document.querySelectorAll('[data-reward-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const [presetH, presetB] = button.dataset.rewardPreset.split(',');
      h.input.value = presetH;
      b.input.value = presetB;
      h.update();
      b.update();
    });
  });
  h.update();
}

// --- Embedded simulation panels -------------------------------------------

// Each iframe reports its content height, so it never needs its own scrollbar.
window.addEventListener('message', (event) => {
  if (event.data?.type !== 'simulation-height') return;
  for (const frame of document.querySelectorAll('.simulation-embed iframe')) {
    if (frame.contentWindow === event.source) frame.style.height = `${event.data.height}px`;
  }
});

// Reloading an embed brings back its starting agent, which Reset cannot:
// Reset gives an agent that has learned nothing.
for (const figure of document.querySelectorAll('.simulation-embed')) {
  const frame = figure.querySelector('iframe');
  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'embed-restart';
  restart.textContent = 'Restart panel';
  restart.addEventListener('click', () => frame.contentWindow.location.reload());
  figure.querySelector('figcaption').prepend(restart);
}

ceilingExplorer();
rewardExplorer();

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
  const boxes = $('reward-rows');
  if (!boxes) return;
  const p = config();
  const LIMIT = 40; // bars span -LIMIT to +LIMIT reward points
  // Same left-to-right order, symbols and colours as the Environment panel.
  const ORDER = [NATURAL, NOTHING, DRUG];
  const classes = { [NOTHING]: 'nothing', [NATURAL]: 'natural', [DRUG]: 'drug' };
  const icons = {
    [NATURAL]: '<circle class="action-icon-natural" cx="0" cy="1" r="9" /><path class="action-icon-stem" d="M 0 -7 L 3 -12" />',
    [NOTHING]: '<circle class="action-icon-nothing" cx="0" cy="0" r="9" />',
    [DRUG]: '<g transform="rotate(-36)"><rect class="action-icon-capsule" x="-12" y="-5" width="24" height="10" rx="5" /><path class="action-icon-drug" d="M 0 -5 H 7 A 5 5 0 0 1 7 5 H 0 Z" /></g>',
  };
  const signed = (v) => `${v >= 0 ? '+' : '−'}${fmt(Math.abs(v), 2)}`;

  // The agent's face as the Environment panel draws it (environmentView.js
  // drawFace): mood 1 with H at the setpoint, -1 when H is 20 or more away.
  function face(H) {
    const mood = 1 - 2 * Math.min(1, Math.abs(H - p.S) / 20);
    const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const mix = (a, b, t) => {
      const channel = (hex, i) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
      return `rgb(${[0, 1, 2].map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t)).join(', ')})`;
    };
    const fill = mood < 0 ? mix(css('--face-neutral'), css('--face-sad'), -mood) : mix(css('--face-neutral'), css('--face-happy'), mood);
    const worry = Math.max(0, -mood) * 2.5;
    const arch = Math.max(0, mood) * 1.5;
    const brows = [-1, 1].map((side) => {
      const outer = side * 7.5;
      const inner = side * 2;
      return `M ${outer} ${-7 + worry} Q ${(outer + inner) / 2} ${-8.5 - arch} ${inner} ${-8 - worry}`;
    }).join(' ');
    const mouthY = 5 - Math.max(0, -mood) * 2;
    return `<svg class="agent-face" viewBox="-15 -15 30 30" role="img" aria-label="The agent">
      <circle r="13" fill="${fill}" />
      <path d="${brows} M -6 ${mouthY} Q 0 ${mouthY + 7 * mood} 6 ${mouthY}" />
      <circle class="face-eye" cx="-4.5" cy="-2.5" r="1.7" /><circle class="face-eye" cx="4.5" cy="-2.5" r="1.7" />
    </svg>`;
  }

  // The Environment panel's H bar (environmentView.js drawMeter), drawn at
  // the same pixel sizes, with a triangle where each option would take H.
  function meter(H, B, results) {
    const width = $('reward-meter').clientWidth || 600;
    const left = 30;
    const right = width - 30;
    const barY = 42;
    const xOf = scale([p.hMin, p.hMax], [left, right]);
    const top = Math.min(p.hMax, naturalCeiling(B, p));
    const markers = results.map(({ action, H: nextH }) =>
      `<path class="meter-target ${classes[action]}" d="M ${xOf(nextH) - 6} ${barY - 12} L ${xOf(nextH) + 6} ${barY - 12} L ${xOf(nextH)} ${barY - 4} Z" />`).join('');
    // Each triangle's value straight above it.
    const values = results.map(({ action, H: nextH }) =>
      `<text class="meter-value ${classes[action]}" x="${xOf(nextH)}" y="${barY - 17}" text-anchor="middle">${fmt(nextH)}</text>`).join('');
    const labelY = barY + 30;
    const ends = [p.hMin, p.hMax].map((v) =>
      `<text class="meter-label" x="${xOf(v)}" y="${labelY}" text-anchor="middle">${v}</text>`).join('');
    const showB = Math.abs(xOf(B) - xOf(p.S)) > 44 && xOf(B) - xOf(p.hMin) > 16;
    return `<svg viewBox="0 0 ${width} ${labelY + 6}" width="${width}" height="${labelY + 6}" role="img" aria-label="Internal level H is ${H}, baseline B is ${B}">
      <text class="meter-title" x="${left}" y="10">Internal level H</text>
      <rect class="meter-track" x="${left}" y="${barY}" width="${right - left}" height="12" rx="6" />
      <rect class="meter-band" x="${xOf(B)}" y="${barY}" width="${Math.max(0, xOf(top) - xOf(B))}" height="12" />
      <line class="meter-setpoint" x1="${xOf(p.S)}" y1="${barY - 5}" x2="${xOf(p.S)}" y2="${barY + 17}" />
      <rect class="meter-b" x="${xOf(B) - 1.5}" y="${barY - 4}" width="3" height="20" />
      ${markers}${values}
      <circle class="meter-h" cx="${xOf(H)}" cy="${barY + 6}" r="7" />
      ${ends}
      <text class="meter-label" x="${xOf(p.S)}" y="${labelY}" text-anchor="middle">setpoint</text>
      ${showB ? `<text class="meter-label b" x="${xOf(B)}" y="${labelY}" text-anchor="middle">B</text>` : ''}
    </svg>`;
  }

  function render() {
    const H = Number($('reward-h').value);
    const B = Number($('reward-b').value);
    const results = ACTIONS.map((_, action) => ({ action, ...step({ H, B }, action, p) }));
    const best = results.reduce((a, b) => (b.reward > a.reward ? b : a));

    boxes.innerHTML = ORDER.map((action) => {
      const { H: nextH, reward, driveReduction, drugTerm } = results[action];
      const width = (Math.min(Math.abs(reward), LIMIT) / LIMIT) * 50;
      const left = reward >= 0 ? 50 : 50 - width;
      const isBest = action === best.action;
      const parts = action === DRUG
        ? `H change ${signed(driveReduction)} · pleasure − harm ${signed(drugTerm)}`
        : '';
      return `<div class="option-box ${classes[action]}${isBest ? ' best' : ''}">
        <div class="option-name"><svg class="action-icon" viewBox="-13 -13 26 26" aria-hidden="true">${icons[action]}</svg>${ACTIONS[action].name}</div>
        <div class="option-move">H ${H} → ${fmt(nextH)}</div>
        <div class="option-track" aria-hidden="true"><span class="option-bar ${classes[action]}" style="left:${left}%;width:${width}%"></span></div>
        <div class="option-reward">Reward <strong>${signed(reward)}</strong></div>
        <div class="option-parts">${parts}</div>
        <div class="option-best">${isBest ? 'Best choice' : ''}</div>
      </div>`;
    }).join('');
    $('reward-agent').innerHTML = `<div style="grid-column: ${ORDER.indexOf(best.action) + 1}">${face(H)}</div>`;
    $('reward-meter').innerHTML = meter(H, B, results);

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
  b.update();
  // Redraw at the new pixel width when the figure is resized.
  let shownWidth = $('reward-meter').clientWidth;
  new ResizeObserver(() => {
    if ($('reward-meter').clientWidth === shownWidth) return;
    shownWidth = $('reward-meter').clientWidth;
    render();
  }).observe($('reward-meter'));
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

// Keeps hover popups inside the window: a popup that would stick out on the
// right is shifted left, and one that would stick out on the left, right.
for (const word of document.querySelectorAll('.hover-info')) {
  const popup = word.querySelector('.hover-info-popup');
  const place = () => {
    popup.style.left = '0px';
    const box = popup.getBoundingClientRect();
    const margin = 8;
    let shift = 0;
    if (box.right > window.innerWidth - margin) shift = window.innerWidth - margin - box.right;
    if (box.left + shift < margin) shift = margin - box.left;
    popup.style.left = `${shift}px`;
  };
  word.addEventListener('mouseenter', place);
  word.addEventListener('focusin', place);
}

ceilingExplorer();
rewardExplorer();

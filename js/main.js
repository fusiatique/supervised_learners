import { PARAMS } from './config.js';
import { SOURCE_TYPES, DEPENDENCE, HRL_SLIDERS, hrlConfig, getSourceType } from './hrl/config.js';
import { harmWeight } from './hrl/reward.js';
import { MOODS, moodOf } from './hrl/mood.js';
import { Simulation } from './simulation.js';
import { MazeView } from './ui/mazeView.js';
import { AgentView } from './ui/agentView.js';
import { LineChart } from './ui/chart.js';
import { buildParamControls, renderStats, renderLegend, renderMeter, renderChoices } from './ui/controls.js';

const $ = (id) => document.getElementById(id);

// Reserve space for every mood at the current width, including wrapped text.
// Hidden copies share a grid cell, so the longest text sets a stable height.
for (const [id, field] of [['mood-name', 'name'], ['mood-text', 'description']]) {
  const live = $(id);
  const slot = document.createElement('div');
  slot.className = 'mood-slot';
  live.before(slot);
  slot.append(live);
  for (const mood of MOODS) {
    const reserve = document.createElement('p');
    reserve.className = `${live.className} mood-reserve`;
    reserve.textContent = mood[field];
    reserve.setAttribute('aria-hidden', 'true');
    slot.append(reserve);
  }
}

// Keep the letter key aligned with the source colours used in the maze.
for (const source of SOURCE_TYPES.filter((source) => source.id === 'food' || source.id === 'drugB')) {
  const entry = document.createElement('span');
  const marker = document.createElement('span');
  marker.className = 'swatch';
  marker.textContent = source.char;
  marker.style.background = `var(${source.colorVar})`;
  const name = source.name.replace(' (moderate)', '').replace(' (potent)', '');
  entry.append(marker, document.createTextNode(name));
  $('maze-source-key').append(entry);
}

// The source the "Give" button administers.
const DOSE = getSourceType('drugB');

const params = hrlConfig(DEPENDENCE);
const sim = new Simulation(params);
let running = false;
let stepsPerSecond = 1;

// --- Views -----------------------------------------------------------------

const mazeView = new MazeView($('maze'));
const agentView = new AgentView($('agent-state'));
const chart = new LineChart($('state-chart'), {
  series: [
    { name: 'd', colorVar: '--agent' },
    { name: 'resting', colorVar: '--text-muted' },
  ],
  xLabel: 'Step',
  yLabel: 'Dopamine-related level',
  yRange: [0, 100],
  xWindow: 200,
  reference: '--target',
});
renderLegend($('state-legend'), [
  { name: 'Current state (d)', colorVar: '--agent' },
  { name: 'Resting level', colorVar: '--text-muted' },
  { name: 'Neutral threshold (50)', colorVar: '--target', dashed: true },
]);

// --- Controls --------------------------------------------------------------

// Group related controls; cooldown and discount remain directly visible.
const sliders = [...HRL_SLIDERS, ...PARAMS];
const controlGroups = {
  dopamine: ['dBackgroundDrift', 'kD'],
  reward: ['beta', 'omega'],
  dependence: ['rhoA'],
  exploration: ['epsilonStart', 'epsilonDecay', 'epsilonMin'],
  harm: ['lambdaMin', 'lambdaMax'],
};
const syncParamControls = [
  buildParamControls($('discount-params'), params, sliders.filter((def) => def.key === 'gamma')),
  buildParamControls($('cooldown-params'), params, sliders.filter((def) => def.key === 'refractorySteps')),
];
for (const [name, keys] of Object.entries(controlGroups)) {
  syncParamControls.push(buildParamControls(
    $(`${name}-params`), params, keys.map((key) => sliders.find((def) => def.key === key)),
  ));
  if (name === 'dependence') continue;
  const button = $(`toggle-${name}-params`);
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    $(`${name}-params`).hidden = expanded;
  });
}
// Info buttons are separate from the disclosure buttons, so tips do not open sliders.
for (const button of document.querySelectorAll('.info-button')) {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
  });
}
document.addEventListener('click', (event) => {
  for (const button of document.querySelectorAll('.info-button')) {
    if (!button.parentElement.contains(event.target)) button.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    for (const button of document.querySelectorAll('.info-button')) button.setAttribute('aria-expanded', 'false');
  }
});
function syncDependenceControl() {
  $('dependence').checked = params.drugDeficit;
  $('dependence-params').hidden = !params.drugDeficit;
}
syncDependenceControl();
$('dependence').addEventListener('change', () => {
  // Rebuild the environment because dependence changes the Q-table dimensions.
  sim.setDependenceOnly($('dependence').checked);
  syncDependenceControl();
});

function setRunning(value) {
  running = value;
  $('play').textContent = running ? 'Pause' : 'Play';
}
$('play').addEventListener('click', () => setRunning(!running));
$('step').addEventListener('click', () => {
  setRunning(false);
  sim.step();
});
$('reset').addEventListener('click', () => sim.resetLearning());
$('restore-defaults').addEventListener('click', () => {
  setRunning(false);
  const defaults = hrlConfig(DEPENDENCE);
  for (const { key } of sliders) params[key] = defaults[key];
  sim.setModel('adaptive');
  sim.setDependenceOnly(defaults.drugDeficit);
  syncDependenceControl();
  for (const sync of syncParamControls) sync();
});
$('dose').addEventListener('click', () => sim.administer(DOSE));

// The speed slider is logarithmic: 1 to 10,000 steps per second.
function updateSpeed() {
  stepsPerSecond = Math.round(10 ** (Number($('speed').value) / 25));
  $('speed-label').textContent = `${stepsPerSecond.toLocaleString()} steps/s`;
}
$('speed').addEventListener('input', updateSpeed);
updateSpeed();

// --- Main loop -------------------------------------------------------------

let lastTime = performance.now();
let stepDebt = 0;

function frame(now) {
  const elapsed = Math.min(now - lastTime, 100);
  lastTime = now;

  if (running) {
    stepDebt += (elapsed / 1000) * stepsPerSecond;
    // Stop early if a frame's worth of steps takes too long to compute.
    const deadline = performance.now() + 12;
    while (stepDebt >= 1 && performance.now() < deadline) {
      sim.step();
      stepDebt--;
    }
    if (stepDebt >= 1) stepDebt = 0;
  }

  const { env } = sim;
  const mood = moodOf(env.d, env.restingLevel, params);
  mazeView.draw(sim, mood, now);
  agentView.draw(mood, env.h, now);
  $('mood-name').textContent = mood.name;
  $('mood-text').textContent = mood.description;
  renderMeter($('harm-meter'), env.h, params.hMax);
  chart.draw([sim.history.d.points, sim.history.rest.points], params.dTarget);
  renderStats($('stats'), [
    ['Steps', sim.steps.toLocaleString()],
    ['Current state (d)', env.d.toFixed(1)],
    ['Resting level', env.restingLevel.toFixed(1)],
    ['Drug B doses given', sim.dosesGiven.toLocaleString()],
  ]);
  renderStats($('learning-stats'), [
    ['Episodes', sim.episodes.toLocaleString()],
    ['Harm weight λ', harmWeight(env.d, params).toFixed(2)],
    ['Reward, last step', sim.lastOutcome ? sim.lastOutcome.reward.toFixed(2) : '–'],
    ...sim.agent.info(),
  ]);
  const choicesWindow = Number($('choices-window').value);
  renderChoices($('choices'), sim.recentChoices(choicesWindow));

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

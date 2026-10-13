import { PARAMS, RECENT_EPISODES } from './config.js';
import { DEPENDENCE, HRL_SLIDERS, MODELS, hrlConfig, getSourceType } from './hrl/config.js';
import { harmWeight } from './hrl/reward.js';
import { moodOf } from './hrl/mood.js';
import { Simulation } from './simulation.js';
import { MazeView } from './ui/mazeView.js';
import { AgentView } from './ui/agentView.js';
import { LineChart } from './ui/chart.js';
import { fillSelect, buildParamControls, renderStats, renderLegend, renderMeter, renderChoices } from './ui/controls.js';

const $ = (id) => document.getElementById(id);

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
  reference: '--target',
});
renderLegend($('state-legend'), [
  { name: 'd, dopamine-related state', colorVar: '--agent' },
  { name: 'level d rests at', colorVar: '--text-muted' },
  { name: 'level the agent wants (target)', colorVar: '--target', dashed: true },
]);

// --- Controls --------------------------------------------------------------

// The few sliders marked essential are always on show, the rest fold away.
const sliders = [...HRL_SLIDERS, ...PARAMS];
const syncParamControls = [
  buildParamControls($('params'), params, sliders.filter((def) => def.essential)),
  buildParamControls($('more-params'), params, sliders.filter((def) => !def.essential)),
];
fillSelect($('model-select'), MODELS, (id) => {
  sim.setModel(id);
  for (const sync of syncParamControls) sync();
});
$('model-select').value = sim.modelId;
$('dependence').checked = sim.dependence;
$('dependence').addEventListener('change', () => sim.setDependence($('dependence').checked));

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
  mazeView.draw(sim);
  agentView.draw(mood, env.h, now);
  $('mood-name').textContent = mood.name;
  $('mood-text').textContent = mood.description;
  renderMeter($('harm-meter'), env.h, params.hMax);
  chart.draw([sim.history.d.points, sim.history.rest.points], params.dTarget);
  renderStats($('stats'), [
    ['Steps', sim.steps.toLocaleString()],
    ['Episodes', sim.episodes.toLocaleString()],
    ['d', env.d.toFixed(1)],
    ['Resting level of d', env.restingLevel.toFixed(1)],
    ['Harm weight λ', harmWeight(env.d, params).toFixed(2)],
    ['Reward, last step', sim.lastOutcome ? sim.lastOutcome.reward.toFixed(2) : '–'],
    ['Doses given', sim.dosesGiven.toLocaleString()],
    ...sim.agent.info(),
  ]);
  renderChoices($('choices'), sim.recentChoices());
  $('choices-title').textContent = `Sources the agent chose, last ${Math.min(sim.episodes + 1, RECENT_EPISODES + 1)} episodes`;

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

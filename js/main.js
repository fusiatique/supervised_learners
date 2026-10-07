import { defaultParams, RECENT_EPISODES } from './config.js';
import { AGENTS } from './agents/index.js';
import { Simulation } from './simulation.js';
import { MazeView } from './ui/mazeView.js';
import { LineChart } from './ui/chart.js';
import { ERASER, WALL_TOOL, fillSelect, buildParamControls, buildItemPalette, renderStats, renderChoices } from './ui/controls.js';

const $ = (id) => document.getElementById(id);

const params = defaultParams();
const sim = new Simulation(params);
let tool = null;
let running = false;
let stepsPerSecond = 1;
let wallStrokeReset = false;

// --- Views -----------------------------------------------------------------

const mazeView = new MazeView($('maze'), {
  onCellClick(cell) {
    const env = sim.env;
    if (tool === WALL_TOOL) return;
    if (!env.canHoldItem(cell)) return;
    if (tool === ERASER || env.items.get(cell) === tool) env.removeItem(cell);
    else env.placeItem(cell, tool);
  },
  onCellDrag(cell) {
    if (tool !== WALL_TOOL && tool !== ERASER) return;
    if (running) setRunning(false);
    const changed = sim.env.setWall(cell, tool === WALL_TOOL);
    if (changed && !wallStrokeReset) {
      sim.resetLearning();
      wallStrokeReset = true;
    }
  },
  onCellDragEnd() {
    wallStrokeReset = false;
  },
});
const chart = new LineChart($('reward-chart'), { colorVar: '--agent', xLabel: 'Step' });

// --- Controls --------------------------------------------------------------

fillSelect($('agent-select'), AGENTS, (id) => sim.setAgent(id));
buildParamControls($('params'), params);
tool = buildItemPalette($('items'), (id) => {
  tool = id;
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

  mazeView.draw(sim, now);
  chart.draw(sim.history.points);
  renderStats($('stats'), [
    ['Steps', sim.steps.toLocaleString()],
    ['Episodes', sim.episodes.toLocaleString()],
    ['Last episode length', sim.lastEpisodeSteps === null ? '–' : `${sim.lastEpisodeSteps} steps`],
    ['Reward state', sim.rewardState.level.toFixed(2)],
    ...sim.agent.info(),
  ]);
  renderChoices($('choices'), sim.recentChoices(), sim.outcomes.length);
  $('choices-title').textContent = `Item reached, last ${Math.min(sim.outcomes.length, RECENT_EPISODES)} episodes`;

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

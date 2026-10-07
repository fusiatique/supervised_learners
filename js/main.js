import { defaultParams, RECENT_EPISODES } from './config.js';
import { MAZES } from './mazes.js';
import { AGENTS } from './agents/index.js';
import { Simulation } from './simulation.js';
import { MazeView } from './ui/mazeView.js';
import { LineChart } from './ui/chart.js';
import { ERASER, fillSelect, buildParamControls, buildItemPalette, renderStats, renderChoices } from './ui/controls.js';

const $ = (id) => document.getElementById(id);

const params = defaultParams();
const sim = new Simulation(params);
let tool = null;
let running = false;
let stepsPerSecond = 1;
let wallTool = null;
const wallButtons = ['add-wall', 'erase-wall', 'move-wall'];
const wallHints = {
  'add-wall': 'Click an empty cell to add a wall. The start, agent, and items are protected.',
  'erase-wall': 'Click a wall to erase it.',
  'move-wall': 'Click a wall, then click an empty cell to move it. Click the selected wall to cancel.',
};

function selectWallTool(id) {
  wallTool = id;
  mazeView.selectedWall = null;
  mazeView.editingWalls = id !== null;
  for (const buttonId of wallButtons) $(buttonId).setAttribute('aria-pressed', String(buttonId === id));
  for (const button of $('items').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(id === null && button.dataset.tool === tool));
  }
  $('wall-hint').textContent = wallHints[id] ?? 'Choose a wall tool to edit the maze. Editing pauses the simulation.';
  if (id !== null) setRunning(false);
}

// --- Views -----------------------------------------------------------------

const mazeView = new MazeView($('maze'), {
  onCellClick(cell) {
    const env = sim.env;
    if (wallTool !== null) {
      setRunning(false);
      if (wallTool === 'add-wall') {
        $('wall-hint').textContent = env.addWall(cell) ? wallHints[wallTool] : 'Choose an empty cell without the start, agent, or an item.';
      } else if (wallTool === 'erase-wall') {
        env.removeWall(cell);
      } else if (cell === mazeView.selectedWall) {
        mazeView.selectedWall = null;
        $('wall-hint').textContent = wallHints[wallTool];
      } else if (mazeView.selectedWall !== null && env.moveWall(mazeView.selectedWall, cell)) {
        mazeView.selectedWall = null;
        $('wall-hint').textContent = wallHints[wallTool];
      } else if (env.isWall(cell)) {
        mazeView.selectedWall = cell;
        $('wall-hint').textContent = 'Wall selected. Click an empty cell to move it.';
      } else {
        $('wall-hint').textContent = mazeView.selectedWall === null ? 'Select a wall first.' : 'Choose an empty cell without the start, agent, or an item.';
      }
      return;
    }
    if (!env.canHoldItem(cell)) return;
    if (tool === ERASER || env.items.get(cell) === tool) env.removeItem(cell);
    else env.placeItem(cell, tool);
  },
});
const chart = new LineChart($('reward-chart'), { colorVar: '--agent', xLabel: 'Step' });

// --- Controls --------------------------------------------------------------

fillSelect($('maze-select'), MAZES, (id) => {
  sim.setMaze(id);
  selectWallTool(wallTool);
});
fillSelect($('agent-select'), AGENTS, (id) => sim.setAgent(id));
buildParamControls($('params'), params);
tool = buildItemPalette($('items'), (id) => {
  tool = id;
  selectWallTool(null);
});

for (const id of wallButtons) $(id).addEventListener('click', () => selectWallTool(wallTool === id ? null : id));
$('clear-walls').addEventListener('click', () => {
  setRunning(false);
  sim.env.clearWalls();
  mazeView.selectedWall = null;
  $('wall-hint').textContent = 'All walls erased. Choose Add walls to build a new layout.';
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

$('show-values').addEventListener('change', (e) => {
  mazeView.showValues = e.target.checked;
});

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

  mazeView.draw(sim);
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

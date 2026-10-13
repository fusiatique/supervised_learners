import { defaultParams } from '../config.js';

// Everything that defines the homeostatic model lives in this file: the
// sources, where they sit in the maze, the internal-state dynamics and the
// reward function's parameters. All values are illustrative simulation units,
// not measurements.

// Things the agent can interact with. `reward` is the immediate reward R0,
// `dopamineGain` the jump in d, `harmGain` what is added to accumulated harm h
// and `acuteHarm` the immediate harm cost. `deficitGain` is how far one use
// lowers the resting level of d, and only applies when `drugDeficit` is on.
// `char` is the source's letter in a maze layout (mazes.js) and on the maze,
// `colorVar` names its CSS custom property. To add a source, add an entry
// here and put its letter in a layout.
export const SOURCE_TYPES = [
  { id: 'food', name: 'Food', char: 'F', colorVar: '--item-3', reward: 1.5, dopamineGain: 7, harmGain: 0, acuteHarm: 0, deficitGain: 0, isDrug: false },
  { id: 'social', name: 'Social interaction', char: 'C', colorVar: '--item-1', reward: 1.4, dopamineGain: 6, harmGain: 0, acuteHarm: 0, deficitGain: 0, isDrug: false },
  { id: 'rest', name: 'Rest', char: 'R', colorVar: '--item-4', reward: 1.0, dopamineGain: 4, harmGain: 0, acuteHarm: 0, deficitGain: 0, isDrug: false },
  { id: 'drugA', name: 'Drug A (moderate)', char: 'A', colorVar: '--item-2', reward: 3.5, dopamineGain: 18, harmGain: 1.5, acuteHarm: 2.5, deficitGain: 2, isDrug: true },
  { id: 'drugB', name: 'Drug B (potent)', char: 'B', colorVar: '--item-5', reward: 5.0, dopamineGain: 30, harmGain: 3.0, acuteHarm: 5.0, deficitGain: 4, isDrug: true },
];

export const HRL_DEFAULTS = {
  // Learning rate, discount, ε schedule and step cost.
  ...defaultParams(),

  // Maze from mazes.js; its layout also says where the sources start out.
  mazeId: 'arms',
  // Episodes only end on this step limit; null means two steps per cell.
  maxEpisodeSteps: null,
  // Steps for which a source stays unavailable after it has been used, on top
  // of having to leave its cell and come back. 0 switches this off.
  refractorySteps: 0,

  // Dopamine-related state d.
  dMin: 0,
  dMax: 100,
  dTarget: 50, // preferred level, used by the benefit and harm-sensitivity functions
  dBase: 50, // level that passive recovery pulls towards
  dInitial: 50,
  kD: 0.04,
  dBackgroundDrift: 0, // optional depletion pressure per step (a modelling assumption)

  // Accumulated harm h.
  hMin: 0,
  hMax: 100,
  hInitial: 0,
  rhoH: 0.98,

  // Drug-induced deficit a: how far drug use has lowered the level that d
  // recovers towards, which is then dBase - a. Off by default; when it is off
  // a stays at zero and is not part of the Q-table. This is an added
  // modelling assumption, like the background drift.
  drugDeficit: false,
  aMax: 50,
  aInitial: 0,
  rhoA: 0.9995,

  // Width of the bins d, h and a are sorted into for the Q-table.
  dBinWidth: 10,
  hBinWidth: 10,
  aBinWidth: 10,

  // Reward: r = R0 + beta * Δphi - lambda(d) * (acuteHarm + omega * hNext) - stepCost
  beta: 1.0,
  omega: 0.1,
  phiA: 10,
  phiB: 3,
  phiC: 0.05,
  lambdaMin: 0.15,
  lambdaMax: 1.0,
  lambdaS: 8,
  harmWeightMode: 'adaptive', // 'adaptive': lambda(d); 'fixed': (lambdaMin + lambdaMax) / 2
};

// The parameters above that get a slider in the UI, next to those in PARAMS
// (../config.js). The values themselves stay in HRL_DEFAULTS. The `essential`
// ones are always on show; the rest sit under "More parameters".
export const HRL_SLIDERS = [
  { key: 'dInitial', group: 'Internal states', label: 'Starting d', min: 0, max: 100, step: 1, essential: true },
  { key: 'kD', group: 'Internal states', label: 'Recovery rate of d (k_d)', min: 0, max: 0.2, step: 0.005 },
  { key: 'dBackgroundDrift', group: 'Internal states', label: 'Background drift of d', min: 0, max: 4, step: 0.1, essential: true },
  { key: 'rhoH', group: 'Internal states', label: 'Harm persistence (ρ_h)', min: 0.8, max: 1, step: 0.005 },
  { key: 'rhoA', group: 'Internal states', label: 'Deficit persistence (ρ_a)', min: 0.99, max: 1, step: 0.0005 },
  { key: 'beta', group: 'Reward', label: 'State benefit weight (β)', min: 0, max: 3, step: 0.1 },
  { key: 'omega', group: 'Reward', label: 'Accumulated harm weight (ω)', min: 0, max: 0.5, step: 0.01 },
  { key: 'lambdaMin', group: 'Reward', label: 'Lowest harm weight (λ min)', min: 0.01, max: 1, step: 0.01 },
  { key: 'lambdaMax', group: 'Reward', label: 'Highest harm weight (λ max)', min: 0.01, max: 2, step: 0.01 },
  { key: 'lambdaS', group: 'Reward', label: 'Harm weight slope (s)', min: 1, max: 30, step: 0.5 },
];

// The two optional mechanisms under which dependence can develop, as the page
// switches them on together: drug use lowers the resting level of d, and a
// used source needs time before it can be used again.
export const DEPENDENCE = { drugDeficit: true, refractorySteps: 15 };

// The three models that are compared. Each is the defaults plus only the
// parameters that are meant to differ.
export const MODELS = [
  { id: 'fixed', name: 'A: fixed trade-off', overrides: { harmWeightMode: 'fixed' } },
  { id: 'adaptive', name: 'B: adaptive trade-off', overrides: { harmWeightMode: 'adaptive' } },
  { id: 'noAccumulated', name: 'C: no accumulated-harm penalty', overrides: { harmWeightMode: 'adaptive', omega: 0 } },
];

export function getModel(id) {
  const model = MODELS.find((m) => m.id === id);
  if (!model) throw new Error(`Unknown model "${id}". Choose one of: ${MODELS.map((m) => m.id).join(', ')}`);
  return model;
}

export function getSourceType(id) {
  return SOURCE_TYPES.find((s) => s.id === id) ?? null;
}

export function hrlConfig(overrides = {}) {
  const config = { ...HRL_DEFAULTS, ...overrides };
  const positive = ['dBinWidth', 'hBinWidth', 'aBinWidth', 'aMax', 'lambdaS', 'dTarget'];
  for (const key of positive) {
    if (!(config[key] > 0)) throw new Error(`${key} must be positive, got ${config[key]}`);
  }
  if (!(config.dMin < config.dMax) || !(config.hMin < config.hMax)) throw new Error('State ranges must have min < max');
  if (!['adaptive', 'fixed'].includes(config.harmWeightMode)) {
    throw new Error(`harmWeightMode must be "adaptive" or "fixed", got "${config.harmWeightMode}"`);
  }
  return config;
}

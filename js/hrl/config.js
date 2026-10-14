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
  { key: 'dInitial', description: 'Sets the agent’s dopamine-related state, d, at the beginning of a run. A value of 50 is neutral. This is only the starting value; d can change as the simulation runs.', tryIt: 'Choose a lower value to start below neutral, or a higher value to start above it.', group: 'Internal states', label: 'Starting d', min: 0, max: 100, step: 1, essential: true },
  { key: 'kD', description: 'Controls how quickly the agent’s dopamine-related state, d, naturally returns toward its resting level. This is the level d settles toward when the agent is not using anything. For example, with a resting level of 50 and a recovery rate of 0.04, recovery raises d from 30 to 30.8 in one step. If d is above the resting level, recovery lowers it instead.', tryIt: 'Increase it for a faster return to the resting level. Lower it to make both high and low states last longer.', group: 'Internal states', label: 'Recovery rate of d (k_d)', min: 0, max: 0.2, step: 0.005 },
  { key: 'dBackgroundDrift', description: 'Makes the agent’s dopamine-related state, d, decrease by a set amount each simulation step. For example, a value of 1 subtracts 1 from d each step. Recovery and the things the agent uses can also change d, so its overall change may be different.', tryIt: 'Set it to 0 to turn this effect off. Increase it to see how the agent behaves when d is continually pushed downward.', group: 'Internal states', label: 'Background drift of d', min: 0, max: 4, step: 0.1, essential: true },
  { key: 'rhoH', description: 'Controls how much harm from past actions stays with the agent. At 0.98, the agent retains 98% of its existing harm and loses 2% each step. Using a harmful source can add new harm on top of what remains.', tryIt: 'Lower it to make harm fade faster. Increase it to make harm last longer. At 1, existing harm never fades.', group: 'Internal states', label: 'Harm persistence (ρ_h)', min: 0.8, max: 1, step: 0.005 },
  { key: 'rhoA', description: 'Drug use can lower the agent’s resting level below 50. This controls how long that effect lasts. Only applies when dependence mechanisms are enabled.', tryIt: 'Lower it for faster recovery. Increase it to make the effect last longer. At 1, the resting level does not recover.', group: 'Internal states', label: 'Deficit persistence (ρ_a)', min: 0.99, max: 1, step: 0.0005 },
  { key: 'beta', description: "Controls how much the agent values an increase in d, its dopamine-related state. Higher values make that increase more rewarding, without changing how much d rises.", tryIt: "Increase it to make raising d more important to the agent. Set it to 0 to remove this extra reward; food, social interaction, rest and drugs still have their own rewards.", group: 'Reward', label: 'State benefit weight (β)', min: 0, max: 3, step: 0.1 },
  { key: 'omega', description: "Harm from drug use can stay with the agent over time. This controls how much that lasting harm lowers the reward, the score the agent learns to increase. It changes how much harm matters in its decisions, not how much harm it has.", tryIt: "Increase it to make lasting harm more costly to the agent. At 0, lasting harm no longer lowers its reward, even though the harm is still there.", group: 'Reward', label: 'Accumulated harm weight (ω)', min: 0, max: 0.5, step: 0.01 },
  { key: 'lambdaMin', description: "Controls how much harm matters to the agent when its dopamine-related state, d, is low. A higher value means harm reduces its reward more.", tryIt: "Increase it to make harm matter more even when d is low. Keep it below the highest harm weight.", group: 'Reward', label: 'Lowest harm weight (λ min)', min: 0.01, max: 1, step: 0.01 },
  { key: 'lambdaMax', description: "Controls how much harm matters to the agent when its dopamine-related state, d, is high. A higher value means harm reduces its reward more.", tryIt: "Increase it to make harm matter more when d is high. Keep it above the lowest harm weight.", group: 'Reward', label: 'Highest harm weight (λ max)', min: 0.01, max: 2, step: 0.01 },
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

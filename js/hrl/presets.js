import { DEPENDENCE, hrlConfig } from './config.js';

// Illustrative parameter scenarios, not forced actions or pre-trained policies.
export const BEHAVIOR_PRESETS = {
  addiction: {
    name: 'Addiction-prone',
    description: 'Dependence is on, raising d is valuable, and harm carries little weight. Press Play to let the agent learn.',
    overrides: {
      drugDeficit: true, rhoA: 1, refractorySteps: 6,
      beta: 2, kappa: 2, omega: 0.01, lambdaMin: 0.05, lambdaMax: 0.2,
      dBackgroundDrift: 0.5, gamma: 0.95,
      epsilonStart: 1, epsilonDecay: 0.98, epsilonMin: 0.05,
    },
  },
  noAddiction: {
    name: 'Non-addicted',
    description: 'Dependence is off and harm carries more weight. Food remains rewarding. Press Play to let the agent learn.',
    overrides: {
      drugDeficit: false, rhoA: 0.99, refractorySteps: 6,
      beta: 0, kappa: 0, omega: 0.5, lambdaMin: 1, lambdaMax: 2,
      dBackgroundDrift: 0, gamma: 0.95,
      epsilonStart: 1, epsilonDecay: 0.98, epsilonMin: 0.05,
    },
  },
};

export function applyBehaviorPreset(sim, id) {
  const preset = BEHAVIOR_PRESETS[id];
  if (!preset) throw new Error(`Unknown behavior preset: ${id}`);
  sim.setModel('adaptive');
  // Start from defaults so earlier slider edits do not leak into a scenario.
  Object.assign(sim.params, hrlConfig({ ...DEPENDENCE, ...preset.overrides }));
  // Rebuild the Q-state dimensions for the chosen dependence setting.
  sim.setDependenceOnly(sim.params.drugDeficit);
  return preset;
}

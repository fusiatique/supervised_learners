// Learning parameters and the step cost. The sliders in the UI are generated
// from this list together with HRL_SLIDERS in hrl/config.js, which holds the
// rest of the model's parameters.
export const PARAMS = [
  { key: 'alpha', group: 'Agent', label: 'Learning rate (α)', min: 0.01, max: 1, step: 0.01, value: 0.5 },
  { key: 'gamma', group: 'Agent', label: 'Discount factor (γ)', min: 0.5, max: 0.99, step: 0.01, value: 0.98 },
  { key: 'epsilonStart', group: 'Agent', label: 'Initial exploration (ε)', min: 0, max: 1, step: 0.01, value: 0.3 },
  { key: 'epsilonDecay', group: 'Agent', label: 'ε decay per episode', min: 0.9, max: 1, step: 0.001, value: 0.985 },
  { key: 'epsilonMin', group: 'Agent', label: 'Minimum ε', min: 0, max: 0.5, step: 0.01, value: 0.05 },
  { key: 'stepCost', group: 'Reward', label: 'Cost per step', min: 0, max: 0.5, step: 0.01, value: 0.02 },
];

// Number of most recent episodes used for the "which sources did it use" tally.
export const RECENT_EPISODES = 50;

export function defaultParams() {
  return Object.fromEntries(PARAMS.map((p) => [p.key, p.value]));
}

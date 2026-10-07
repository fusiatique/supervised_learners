// Tunable parameters. The sliders in the UI are generated from this list, so a
// new parameter (e.g. a reward threshold or harm factor) only needs an entry
// here; it is then available everywhere as `params.<key>`.
export const PARAMS = [
  { key: 'alpha', group: 'Agent', label: 'Learning rate (α)', min: 0.01, max: 1, step: 0.01, value: 0.5 },
  { key: 'gamma', group: 'Agent', label: 'Discount factor (γ)', min: 0.5, max: 0.99, step: 0.01, value: 0.98 },
  { key: 'epsilonStart', group: 'Agent', label: 'Initial exploration (ε)', min: 0, max: 1, step: 0.01, value: 0.3 },
  { key: 'epsilonDecay', group: 'Agent', label: 'ε decay per episode', min: 0.9, max: 1, step: 0.001, value: 0.985 },
  { key: 'epsilonMin', group: 'Agent', label: 'Minimum ε', min: 0, max: 0.5, step: 0.01, value: 0.05 },
  { key: 'stepCost', group: 'Environment', label: 'Cost per step', min: 0, max: 0.5, step: 0.01, value: 0.02 },
  { key: 'rewardDecay', group: 'Environment', label: 'Reward state decay', min: 0, max: 0.2, step: 0.005, value: 0.02 },
];

// Number of most recent episodes used for the "which item did it pick" tally.
export const RECENT_EPISODES = 50;

export function defaultParams() {
  return Object.fromEntries(PARAMS.map((p) => [p.key, p.value]));
}

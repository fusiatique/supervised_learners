// Learning parameters. The sliders in the UI are generated
// from this list together with HRL_SLIDERS in hrl/config.js, which holds the
// rest of the model's parameters.
export const PARAMS = [
  { key: 'gamma', description: "Controls how much the agent values rewards it could get later, compared with rewards it can get now.", tryIt: "Increase it to give future rewards more importance. Lower it to focus more on immediate rewards.", group: 'Learning and exploration', label: 'Discount factor (γ)', min: 0.5, max: 0.99, step: 0.01, value: 0.98 },
  { key: 'epsilonStart', description: "Sets the starting chance of trying a random action instead of following what the agent has learned. At 0.3, this chance is 30%.", tryIt: "Increase it to try random actions more often at the start. Lower it to follow learned choices more often. Reset learning to compare starting values.", group: 'Addiction experiment', label: 'Exploration at the start (ε)', min: 0, max: 1, step: 0.01, value: 0.3 },
  { key: 'epsilonDecay', description: "Controls how quickly random exploration decreases after each episode, a block of simulation steps. At 0.985, the exploration chance keeps 98.5% of its previous value.", tryIt: "Lower it to reduce exploration faster. Increase it to keep exploring longer. At 1, exploration does not decrease.", group: 'Addiction experiment', label: 'ε decay per episode', min: 0.9, max: 1, step: 0.001, value: 0.985 },
  { key: 'epsilonMin', description: "Sets the lowest chance of trying a random action as exploration decreases. At 0.05, that chance never falls below 5%.", tryIt: "Increase it to keep trying alternatives more often later on. Set it to 0 to allow random exploration to approach zero.", group: 'Learning and exploration', label: 'Continued exploration (minimum ε)', min: 0, max: 0.5, step: 0.01, value: 0.05 },
];

// Maximum completed-episode history retained for the source-choice tally.
export const RECENT_EPISODES = 10000;

export function defaultParams() {
  return { ...Object.fromEntries(PARAMS.map((p) => [p.key, p.value])), alpha: 0.5, stepCost: 0.02 };
}

import { modelConfig } from '../js/hrl/experiment.js';

export { hrlConfig, getSourceType, SOURCE_TYPES } from '../js/hrl/config.js';

// Config of one of the compared models, with optional overrides.
export const modelConfigFor = (modelId, overrides) => modelConfig(modelId, overrides);

// Action indices of the moves.
export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;

// Moves from the start of the 'arms' maze to the source at each arm's end.
export const PATHS = {
  food: [LEFT, LEFT, LEFT, LEFT, DOWN, DOWN],
  social: [LEFT, LEFT, DOWN, DOWN, DOWN, DOWN],
  rest: [DOWN, DOWN, DOWN, DOWN, DOWN, DOWN],
  drugA: [RIGHT, RIGHT, DOWN, DOWN, DOWN, DOWN],
  drugB: [RIGHT, RIGHT, RIGHT, RIGHT, DOWN, DOWN],
};

export function walk(env, actions) {
  let outcome = null;
  for (const action of actions) outcome = env.step(action);
  return outcome;
}

import { QLearningAgent } from './qlearning.js';

// Learning models offered in the "Learning model" menu. To add one, write a
// class with the interface described in qlearning.js and register it here.
export const AGENTS = [
  { id: 'qlearning', name: 'Q-learning', create: (env, params) => new QLearningAgent(env, params) },
];

export function createAgent(id, env, params) {
  const entry = AGENTS.find((a) => a.id === id) ?? AGENTS[0];
  return entry.create(env, params);
}

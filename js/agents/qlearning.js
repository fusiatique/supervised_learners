import { ACTIONS } from '../environment.js';

// Tabular Q-learning with ε-greedy exploration. ε starts at `epsilonStart` and
// shrinks by `epsilonDecay` every episode down to `epsilonMin`.
// Estimates start at zero. Exploration comes from ε-greedy random moves,
// with random tie-breaking when moves have equal estimated values.
//
// Every agent exposes the same interface so the simulation and the views can
// work with any learning model:
//   act(state) -> action
//   learn(state, action, reward, nextState, done)
//   endEpisode()
//   stateValue(state) -> number   (used for the value overlay)
//   bestActions(state) -> action[] (used for the policy arrows)
//   info() -> [[label, text], ...] (model-specific readouts for the stats panel)
//
// `random` is the source of randomness; pass a seeded generator for
// reproducible runs. `cellOf` and `validActions` are identity/"everything"
// here and are overridden where a state is more than a cell (hrl/agent.js).

export class QLearningAgent {
  constructor(env, params, random = Math.random) {
    this.params = params;
    this.env = env;
    this.random = random;
    this.numActions = env.numActions;
    this.allActions = Array.from({ length: this.numActions }, (_, a) => a);
    this.q = new Float64Array(env.numStates * env.numActions);
    this.visited = new Uint8Array(env.numCells); // by cell
    this.episodes = 0;
  }

  get epsilon() {
    const { epsilonStart, epsilonDecay, epsilonMin } = this.params;
    return Math.max(epsilonMin, epsilonStart * epsilonDecay ** this.episodes);
  }

  // The cell the agent stands on in `state`.
  cellOf(state) {
    return state;
  }

  // Actions that may be taken in `state`.
  validActions(state) {
    return this.allActions;
  }

  act(state) {
    const cell = this.cellOf(state);
    this.visited[cell] = 1;
    const coverageAction = this.actionTowardUnvisited(cell);
    if (coverageAction !== null) return coverageAction;
    if (this.random() < this.epsilon) {
      const valid = this.validActions(state);
      return valid[Math.floor(this.random() * valid.length)];
    }
    return this.bestAction(state);
  }

  learn(state, action, reward, nextState, done) {
    const { alpha, gamma } = this.params;
    const target = reward + (done ? 0 : gamma * this.stateValue(nextState));
    const i = state * this.numActions + action;
    this.q[i] += alpha * (target - this.q[i]);
    this.visited[this.cellOf(state)] = 1;
    this.visited[this.cellOf(nextState)] = 1;
  }

  // First move of a shortest path from cell `from` to the nearest cell not
  // yet visited, or null once every reachable cell has been.
  actionTowardUnvisited(from) {
    const firstAction = new Int8Array(this.visited.length).fill(-1);
    const queue = [from];
    this.visited[from] = 1;

    for (let i = 0; i < queue.length; i++) {
      const cell = queue[i];
      for (let action = 0; action < ACTIONS.length; action++) {
        const next = this.env.neighbor(cell, ACTIONS[action]);
        if (next === null || this.env.isWall(next) || firstAction[next] !== -1 || next === from) continue;
        firstAction[next] = cell === from ? action : firstAction[cell];
        if (!this.visited[next]) return firstAction[next];
        queue.push(next);
      }
    }
    return null;
  }

  endEpisode() {
    this.episodes++;
  }

  stateValue(state) {
    const base = state * this.numActions;
    let best = -Infinity;
    for (const a of this.validActions(state)) best = Math.max(best, this.q[base + a]);
    return best;
  }

  bestActions(state) {
    const base = state * this.numActions;
    let bestValue = -Infinity;
    const best = [];
    for (const a of this.validActions(state)) {
      const value = this.q[base + a];
      if (value > bestValue) {
        bestValue = value;
        best.length = 0;
        best.push(a);
      } else if (value === bestValue) {
        best.push(a);
      }
    }
    return best;
  }

  // Ties are broken at random for the agent's actual moves.
  bestAction(state) {
    const best = this.bestActions(state);
    return best[Math.floor(this.random() * best.length)];
  }

  info() {
    return [['Exploration ε', this.epsilon.toFixed(2)]];
  }
}

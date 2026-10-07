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
//   hasVisited(state) -> boolean  (the overlay only covers visited cells)
//   stateValue(state) -> number   (used for the value overlay)
//   bestActions(state) -> action[] (used for the policy arrows)
//   info() -> [[label, text], ...] (model-specific readouts for the stats panel)
const POLICY_STABILITY_EPISODES = 20;

export class QLearningAgent {
  constructor(env, params) {
    this.params = params;
    this.env = env;
    this.numActions = env.numActions;
    this.q = new Float64Array(env.numStates * env.numActions);
    this.visited = new Uint8Array(env.numStates);
    this.episodes = 0;
    this.policySnapshot = null;
    this.policyStableEpisodes = 0;
    this.policyConverged = false;
  }

  get epsilon() {
    const { epsilonStart, epsilonDecay, epsilonMin } = this.params;
    return Math.max(epsilonMin, epsilonStart * epsilonDecay ** this.episodes);
  }

  act(state) {
    this.visited[state] = 1;
    const coverageAction = this.actionTowardUnvisited(state);
    if (coverageAction !== null) return coverageAction;
    if (Math.random() < this.epsilon) return Math.floor(Math.random() * this.numActions);
    return this.bestAction(state);
  }

  learn(state, action, reward, nextState, done) {
    const { alpha, gamma } = this.params;
    const target = reward + (done ? 0 : gamma * this.stateValue(nextState));
    const i = state * this.numActions + action;
    this.q[i] += alpha * (target - this.q[i]);
    this.visited[state] = 1;
    this.visited[nextState] = 1;
    if (this.policyConverged && this.bestActionMask(state) !== this.policySnapshot[state]) {
      this.policyConverged = false;
    }
  }

  actionTowardUnvisited(state) {
    const firstAction = new Int8Array(this.visited.length).fill(-1);
    const queue = [state];
    this.visited[state] = 1;

    for (let i = 0; i < queue.length; i++) {
      const cell = queue[i];
      for (let action = 0; action < this.numActions; action++) {
        const next = this.env.neighbor(cell, ACTIONS[action]);
        if (next === null || this.env.isWall(next) || firstAction[next] !== -1 || next === state) continue;
        firstAction[next] = cell === state ? action : firstAction[cell];
        if (!this.visited[next]) return firstAction[next];
        queue.push(next);
      }
    }
    return null;
  }

  hasVisitedReachableCells() {
    const distances = this.env.distancesFrom(this.env.start);
    return distances.every((distance, cell) => distance === Infinity || this.visited[cell] === 1);
  }

  endEpisode() {
    this.episodes++;
    const policy = new Uint8Array(this.visited.length);
    for (let state = 0; state < policy.length; state++) policy[state] = this.bestActionMask(state);

    if (this.hasVisitedReachableCells()
      && this.policySnapshot
      && policy.every((actions, state) => actions === this.policySnapshot[state])) {
      this.policyStableEpisodes++;
    } else {
      this.policyStableEpisodes = 0;
    }
    this.policySnapshot = policy;
    this.policyConverged = this.hasVisitedReachableCells()
      && this.policyStableEpisodes >= POLICY_STABILITY_EPISODES;
  }

  bestActionMask(state) {
    return this.bestActions(state).reduce((mask, action) => mask | (1 << action), 0);
  }

  hasVisited(state) {
    return this.visited[state] === 1;
  }

  stateValue(state) {
    const base = state * this.numActions;
    let best = this.q[base];
    for (let a = 1; a < this.numActions; a++) best = Math.max(best, this.q[base + a]);
    return best;
  }

  bestActions(state) {
    const base = state * this.numActions;
    let bestValue = -Infinity;
    const best = [];
    for (let a = 0; a < this.numActions; a++) {
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
    return best[Math.floor(Math.random() * best.length)];
  }

  info() {
    return [['Exploration ε', this.epsilon.toFixed(2)]];
  }
}

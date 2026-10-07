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
//   bestAction(state) -> action   (used for the policy arrows)
//   info() -> [[label, text], ...] (model-specific readouts for the stats panel)
export class QLearningAgent {
  constructor(env, params) {
    this.params = params;
    this.numActions = env.numActions;
    this.q = new Float64Array(env.numStates * env.numActions);
    this.visited = new Uint8Array(env.numStates);
    this.episodes = 0;
  }

  get epsilon() {
    const { epsilonStart, epsilonDecay, epsilonMin } = this.params;
    return Math.max(epsilonMin, epsilonStart * epsilonDecay ** this.episodes);
  }

  act(state) {
    if (Math.random() < this.epsilon) return Math.floor(Math.random() * this.numActions);
    return this.bestAction(state);
  }

  learn(state, action, reward, nextState, done) {
    const { alpha, gamma } = this.params;
    const target = reward + (done ? 0 : gamma * this.stateValue(nextState));
    const i = state * this.numActions + action;
    this.q[i] += alpha * (target - this.q[i]);
    this.visited[state] = 1;
  }

  endEpisode() {
    this.episodes++;
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

  // Ties are broken at random so an untrained agent wanders instead of
  // repeatedly walking into the same wall.
  bestAction(state) {
    const base = state * this.numActions;
    let best = 0;
    let ties = 1;
    for (let a = 1; a < this.numActions; a++) {
      const diff = this.q[base + a] - this.q[base + best];
      if (diff > 0) {
        best = a;
        ties = 1;
      } else if (diff === 0 && Math.random() < 1 / ++ties) {
        best = a;
      }
    }
    return best;
  }

  info() {
    return [['Exploration ε', this.epsilon.toFixed(2)]];
  }
}

import { ACTIONS, clip } from './model.js';

// Tabular Q-learning over the binned internal states (H, B), as one
// continuing life: there are no episodes, and ε decays per step.

export function stateShape(p) {
  return {
    hBins: Math.ceil((p.hMax - p.hMin) / p.hBinWidth),
    bBins: Math.ceil((p.B0 - p.bMin) / p.bBinWidth),
  };
}

// Index of the (H, B) state. The top of each range goes in the last bin.
export function stateIndex({ H, B }, p) {
  const { hBins, bBins } = stateShape(p);
  const h = clip(Math.floor((H - p.hMin) / p.hBinWidth), 0, hBins - 1);
  const b = clip(Math.floor((B - p.bMin) / p.bBinWidth), 0, bBins - 1);
  return h * bBins + b;
}

export class Agent {
  constructor(p, random = Math.random) {
    this.p = p;
    this.random = random;
    const { hBins, bBins } = stateShape(p);
    this.numStates = hBins * bBins;
    this.q = new Float64Array(this.numStates * ACTIONS.length);
    this.visits = new Uint32Array(this.numStates);
    this.steps = 0;
    this.explored = false;
  }

  get epsilon() {
    const { epsilonStart, epsilonDecay, epsilonMin } = this.p;
    return Math.max(epsilonMin, epsilonStart * epsilonDecay ** this.steps);
  }

  validActions() {
    return this.p.drugAvailable ? [0, 1, 2] : [0, 1];
  }

  // Best valid actions in state `s`, ties included.
  bestActions(s) {
    let best = -Infinity;
    let actions = [];
    for (const a of this.validActions()) {
      const value = this.q[s * ACTIONS.length + a];
      if (value > best) {
        best = value;
        actions = [a];
      } else if (value === best) {
        actions.push(a);
      }
    }
    return actions;
  }

  value(s) {
    return Math.max(...this.validActions().map((a) => this.q[s * ACTIONS.length + a]));
  }

  // The action the greedy policy prefers in `s`, or null when the state has
  // been visited fewer than `minVisits` times, too few to have learned much.
  preferred(s, minVisits = 1) {
    if (this.visits[s] < minVisits) return null;
    const best = this.bestActions(s);
    return best.length === 1 ? best[0] : null;
  }

  // Also records in `explored` whether the action was a random pick.
  act(s) {
    const valid = this.validActions();
    this.explored = this.random() < this.epsilon;
    if (this.explored) return valid[Math.floor(this.random() * valid.length)];
    const best = this.bestActions(s);
    return best[Math.floor(this.random() * best.length)];
  }

  learn(s, a, reward, nextS) {
    const { alpha, gamma } = this.p;
    const i = s * ACTIONS.length + a;
    this.q[i] += alpha * (reward + gamma * this.value(nextS) - this.q[i]);
    this.visits[s]++;
    this.steps++;
  }
}

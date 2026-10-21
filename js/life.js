import { config, step, NOTHING } from './model.js';
import { Agent, stateIndex } from './agent.js';
import { seededRandom } from './rng.js';

// Forced doses are given this many steps apart.
export const DOSE_SPACING = 5;

// One agent's continuing life: its parameters, its internal states and its
// learner, advanced one step at a time. Used by the experiments and the page.
export class Life {
  constructor(overrides = {}, seed = 1) {
    this.p = config(overrides);
    this.agent = new Agent(this.p, seededRandom(seed));
    this.state = { H: this.p.hInitial, B: this.p.bInitial };
    this.t = 0;
    this.pendingDoses = [];
  }

  // Schedules `n` forced doses, the first on the next step. A forced dose
  // changes H and B like a drug use but is not chosen, rewarded or learned from.
  dose(n = 1) {
    const from = Math.max(this.t, (this.pendingDoses.at(-1) ?? -Infinity) + DOSE_SPACING);
    for (let i = 0; i < n; i++) this.pendingDoses.push(from + i * DOSE_SPACING);
  }

  // The state index the next tick will choose in: the current state, after
  // the forced dose if one is due on that step.
  nextChoiceState() {
    const due = this.pendingDoses[0] === this.t;
    const state = due ? step(this.state, NOTHING, this.p, { forced: true }) : this.state;
    return stateIndex(state, this.p);
  }

  tick() {
    let forced = false;
    if (this.pendingDoses[0] === this.t) {
      this.pendingDoses.shift();
      this.state = step(this.state, NOTHING, this.p, { forced: true });
      forced = true;
    }
    const s = stateIndex(this.state, this.p);
    const action = this.agent.act(s);
    const next = step(this.state, action, this.p);
    this.agent.learn(s, action, next.reward, stateIndex(next, this.p));
    this.state = { H: next.H, B: next.B };
    this.t++;
    return { action, reward: next.reward, forced, s, explored: this.agent.explored };
  }
}

import { QLearningAgent } from '../agents/qlearning.js';

// The Q-learning agent on the homeostatic environment. The update rule, ε
// schedule and exploration are inherited unchanged; this class only tells the
// agent that a state is more than a cell and that not every action is
// available everywhere. Both the action choice and the max over the next
// state's values then run over valid actions only.
export class HrlQLearningAgent extends QLearningAgent {
  cellOf(state) {
    return this.env.cellOf(state);
  }

  validActions(state) {
    return this.env.validActions(state);
  }

  // Once the search for unvisited cells has come up empty it is not repeated
  // on every step, only after a wall has changed.
  actionTowardUnvisited(from) {
    if (this.coveredLayout === this.env.layoutVersion) return null;
    const action = super.actionTowardUnvisited(from);
    if (action === null) this.coveredLayout = this.env.layoutVersion;
    return action;
  }

  // The parent class also tracks whether its policy has stopped changing.
  // That scan covers every state after every episode, which is too slow for
  // this state space and not used.
  endEpisode() {
    this.episodes++;
  }
}

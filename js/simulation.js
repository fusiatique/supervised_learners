import { RECENT_EPISODES } from './config.js';
import { getMaze } from './mazes.js';
import { ITEM_TYPES } from './items.js';
import { Environment } from './environment.js';
import { RewardState } from './rewardState.js';
import { AGENTS, createAgent } from './agents/index.js';

// A time series that stays a bounded size however long the run is: once it
// fills up, neighbouring points are averaged together and the sampling
// interval doubles.
class Series {
  constructor(maxPoints = 800) {
    this.maxPoints = maxPoints;
    this.points = [];
    this.stride = 1;
    this.sum = 0;
    this.count = 0;
  }

  add(x, y) {
    this.sum += y;
    if (++this.count < this.stride) return;
    this.points.push({ x, y: this.sum / this.count });
    this.sum = 0;
    this.count = 0;
    if (this.points.length >= this.maxPoints) {
      const merged = [];
      for (let i = 0; i + 1 < this.points.length; i += 2) {
        merged.push({ x: this.points[i + 1].x, y: (this.points[i].y + this.points[i + 1].y) / 2 });
      }
      this.points = merged;
      this.stride *= 2;
    }
  }
}

// Ties the environment, the agent and the reward state together and keeps the
// statistics the UI displays. Contains no DOM code.
export class Simulation {
  constructor(params) {
    this.params = params;
    this.agentId = AGENTS[0].id;
    this.setMaze(getMaze().id);
  }

  setMaze(mazeId) {
    this.mazeId = mazeId;
    this.env = new Environment(getMaze(mazeId));
    this.env.placeDefaultItems(ITEM_TYPES);
    this.maxEpisodeSteps = this.env.numStates * 2;
    this.resetLearning();
  }

  setAgent(agentId) {
    this.agentId = agentId;
    this.resetLearning();
  }

  // Forget everything learned; the maze and the placed items stay.
  resetLearning() {
    this.agent = createAgent(this.agentId, this.env, this.params);
    this.rewardState = new RewardState(this.params);
    this.history = new Series();
    this.steps = 0;
    this.episodes = 0;
    this.episodeSteps = 0;
    this.lastEpisodeSteps = null;
    this.outcomes = []; // item id (or null for a timeout) of recent episodes
    this.env.reset();
  }

  // The learning signal for one transition. Extend here for harm, withdrawal
  // penalties and the like.
  reward(outcome) {
    return (outcome.item ? outcome.item.value : 0) - this.params.stepCost;
  }

  step() {
    const state = this.env.state;
    const action = this.agent.act(state);
    const outcome = this.env.step(action);
    this.agent.learn(state, action, this.reward(outcome), outcome.state, outcome.done);

    this.steps++;
    this.episodeSteps++;
    this.rewardState.update(outcome.item ? outcome.item.value : 0);
    this.history.add(this.steps, this.rewardState.level);

    if (outcome.done || this.episodeSteps >= this.maxEpisodeSteps) {
      this.outcomes.push(outcome.item ? outcome.item.id : null);
      if (this.outcomes.length > RECENT_EPISODES) this.outcomes.shift();
      this.lastEpisodeSteps = this.episodeSteps;
      this.episodeSteps = 0;
      this.episodes++;
      this.agent.endEpisode();
      this.env.reset();
    }
  }

  // Map of item id (null = no item reached) -> number of recent episodes.
  recentChoices() {
    const counts = new Map();
    for (const id of this.outcomes) counts.set(id, (counts.get(id) ?? 0) + 1);
    return counts;
  }
}

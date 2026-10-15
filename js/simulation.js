import { RECENT_EPISODES } from './config.js';
import { DEPENDENCE, HRL_DEFAULTS, MODELS, SOURCE_TYPES, getModel } from './hrl/config.js';
import { HrlEnvironment } from './hrl/environment.js';
import { HrlQLearningAgent } from './hrl/agent.js';

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

const zeroPerSource = () => Object.fromEntries(SOURCE_TYPES.map((s) => [s.id, 0]));

// Ties the environment and the agent together one step at a time and keeps
// the statistics the UI displays. Contains no DOM code. `params` is the
// model's config (hrl/config.js); it is read live, so changing a value takes
// effect on the next step. `random` replaces Math.random for the agent.
export class Simulation {
  constructor(params, random, modelId = 'adaptive') {
    this.params = params;
    this.random = random;
    this.env = new HrlEnvironment(params);
    this.setModel(modelId);
  }

  // Switches to one of the compared models: whatever the models differ in
  // goes back to its default, then the chosen model's own values apply.
  setModel(modelId) {
    const model = getModel(modelId);
    for (const { overrides } of MODELS) {
      for (const key of Object.keys(overrides)) this.params[key] = HRL_DEFAULTS[key];
    }
    Object.assign(this.params, model.overrides);
    this.modelId = modelId;
    this.resetLearning();
  }

  // Switches the mechanisms in DEPENDENCE on or off together. They change
  // what a state is, so the environment is rebuilt and learning starts over.
  setDependence(enabled) {
    for (const [key, value] of Object.entries(DEPENDENCE)) this.params[key] = enabled ? value : HRL_DEFAULTS[key];
    this.env = new HrlEnvironment(this.params);
    this.resetLearning();
  }

  get dependence() {
    return Object.entries(DEPENDENCE).every(([key, value]) => this.params[key] === value);
  }

  // Forget everything learned; the maze and the placed sources stay.
  resetLearning() {
    this.agent = new HrlQLearningAgent(this.env, this.params, this.random);
    this.history = { d: new Series(), rest: new Series() };
    this.steps = 0;
    this.episodes = 0;
    this.lastOutcome = null;
    this.dosesGiven = 0;
    this.recent = []; // interactions per source in each of the recent episodes
    this.beginEpisode(true);
  }

  // An episode puts the agent back on the start. Its internal states carry
  // over from the one before unless `fresh` asks for the initial values.
  beginEpisode(fresh = false) {
    const { d, h, a } = this.env;
    this.env.reset(fresh ? undefined : { d, h, a });
    this.episodeSteps = 0;
    this.episodeInteractions = zeroPerSource();
  }

  // Move the agent's starting cell. What was learned is kept; the episode in
  // progress is abandoned and a new one begins from the new start.
  setStart(cell) {
    if (!this.env.setStart(cell)) return false;
    this.beginEpisode();
    return true;
  }

  // Gives the agent a dose of `source` wherever it stands. It is not one of
  // the agent's actions, so nothing is learned from it directly and it does
  // not count among the sources the agent chose.
  administer(source) {
    this.env.administer(source);
    this.dosesGiven++;
  }

  step() {
    // d and h may have been changed from outside since the last step.
    const state = this.env.qState();
    const action = this.agent.act(state);
    const outcome = this.env.step(action);
    this.agent.learn(state, action, outcome.reward, outcome.state, outcome.done);

    this.steps++;
    this.episodeSteps++;
    this.lastOutcome = outcome;
    if (outcome.source) this.episodeInteractions[outcome.source.id]++;
    this.history.d.add(this.steps, this.env.d);
    this.history.rest.add(this.steps, this.env.restingLevel);

    if (this.episodeSteps >= this.env.maxEpisodeSteps) {
      this.recent.push(this.episodeInteractions);
      if (this.recent.length > RECENT_EPISODES) this.recent.shift();
      this.episodes++;
      this.agent.endEpisode();
      this.beginEpisode();
    }
  }

  // Interactions with each source over the recent episodes and the one in
  // progress, as a Map of source id -> count.
  recentChoices(window = 100) {
    const counts = new Map(SOURCE_TYPES.map((s) => [s.id, 0]));
    for (const episode of [...this.recent.slice(-(window - 1)), this.episodeInteractions]) {
      for (const [id, n] of Object.entries(episode)) counts.set(id, counts.get(id) + n);
    }
    return counts;
  }
}

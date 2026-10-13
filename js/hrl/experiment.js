import { hrlConfig, getModel, SOURCE_TYPES } from './config.js';
import { HrlEnvironment, INTERACT } from './environment.js';
import { HrlQLearningAgent } from './agent.js';
import { seededRandom } from './rng.js';

// Training and evaluation of the homeostatic model, and the per-episode
// metrics. No file or DOM access here; scripts/hrl.js writes the results.

// Bands of d used to ask "what does the agent choose when d is low?".
export const D_BANDS = ['low', 'mid', 'high'];
export const D_BAND_HALF_WIDTH = 10;

export function dBand(d, config) {
  if (d < config.dTarget - D_BAND_HALF_WIDTH) return 'low';
  if (d > config.dTarget + D_BAND_HALF_WIDTH) return 'high';
  return 'mid';
}

const REWARD_COMPONENTS = ['sourceReward', 'stateBenefit', 'acuteHarmCost', 'accumulatedHarmCost', 'stepCost'];
const zeroPerSource = () => Object.fromEntries(SOURCE_TYPES.map((s) => [s.id, 0]));

// Runs one episode from the environment's start. With `learn` the agent
// explores and updates its Q-table; without, it follows its greedy policy and
// learns nothing. Every step is appended to `trace` if one is given.
export function runEpisode(env, agent, { learn = true, trace = null, start } = {}) {
  const { config } = env;
  let state = env.reset(start);
  const interactions = zeroPerSource();
  const choicesByBand = Object.fromEntries(D_BANDS.map((band) => [band, zeroPerSource()]));
  const stepsByBand = Object.fromEntries(D_BANDS.map((band) => [band, 0]));
  const components = Object.fromEntries(REWARD_COMPONENTS.map((key) => [key, 0]));
  let totalReward = 0;
  let sumD = 0;
  let sumH = 0;
  let sumA = 0;
  let minD = env.d;
  let sumHarmWeight = 0;
  let moves = 0;
  let rejected = 0;
  let length = 0;

  while (length < env.maxEpisodeSteps) {
    const action = learn ? agent.act(state) : agent.bestAction(state);
    const outcome = env.step(action);
    if (learn) agent.learn(state, action, outcome.reward, outcome.state, outcome.done);
    state = outcome.state;
    length++;

    const band = dBand(outcome.d, config);
    stepsByBand[band]++;
    if (outcome.source) {
      interactions[outcome.source.id]++;
      choicesByBand[band][outcome.source.id]++;
    } else if (action === INTERACT) {
      rejected++;
    } else {
      moves++;
    }
    totalReward += outcome.reward;
    for (const key of REWARD_COMPONENTS) components[key] += outcome[key];
    sumHarmWeight += outcome.harmWeight;
    sumD += outcome.dNext;
    sumH += outcome.hNext;
    sumA += outcome.aNext;
    minD = Math.min(minD, outcome.dNext);
    if (trace) {
      trace.push({
        step: length,
        cell: outcome.cell,
        action: action === INTERACT ? 'interact' : 'move',
        source: outcome.source ? outcome.source.id : '',
        d: outcome.d,
        dAction: outcome.dAction,
        dNext: outcome.dNext,
        hNext: outcome.hNext,
        aNext: outcome.aNext,
        reward: outcome.reward,
        sourceReward: outcome.sourceReward,
        stateBenefit: outcome.stateBenefit,
        harmWeight: outcome.harmWeight,
        acuteHarmCost: outcome.acuteHarmCost,
        accumulatedHarmCost: outcome.accumulatedHarmCost,
        stepCost: outcome.stepCost,
      });
    }
    if (outcome.done) break;
  }
  if (learn) agent.endEpisode();

  const drugIds = SOURCE_TYPES.filter((s) => s.isDrug).map((s) => s.id);
  const drugInteractions = drugIds.reduce((sum, id) => sum + interactions[id], 0);
  const allInteractions = Object.values(interactions).reduce((sum, n) => sum + n, 0);
  return {
    totalReward,
    length,
    interactions,
    drugInteractions,
    ordinaryInteractions: allInteractions - drugInteractions,
    rejectedInteractions: rejected,
    meanD: sumD / length,
    finalD: env.d,
    minD,
    meanH: sumH / length,
    finalH: env.h,
    meanA: sumA / length,
    finalA: env.a,
    meanHarmWeight: sumHarmWeight / length,
    moveShare: moves / length,
    ordinaryShare: (allInteractions - drugInteractions) / length,
    drugShare: drugInteractions / length,
    components,
    choicesByBand,
    stepsByBand,
  };
}

export function createRun(config, seed) {
  const env = new HrlEnvironment(config);
  const agent = new HrlQLearningAgent(env, config, seededRandom(seed));
  return { env, agent };
}

// Trains a fresh agent (its Q-table starts at zero) and returns it with the
// metrics of every training episode.
export function train(config, { seed = 1, episodes = 1000 } = {}) {
  const { env, agent } = createRun(config, seed);
  const training = [];
  for (let i = 0; i < episodes; i++) training.push(runEpisode(env, agent, { learn: true }));
  return { env, agent, training };
}

// Greedy episodes with learning switched off. Returns the metrics of each
// episode and the step-by-step trace of the first one.
export function evaluate(env, agent, { episodes = 5, start } = {}) {
  const trace = [];
  const results = [];
  for (let i = 0; i < episodes; i++) {
    results.push(runEpisode(env, agent, { learn: false, trace: i === 0 ? trace : null, start }));
  }
  return { episodes: results, trace };
}

// Config of one of the models in MODELS, with experiment-wide `overrides`
// (e.g. a background drift) applied to every model alike.
export function modelConfig(modelId, overrides = {}) {
  return hrlConfig({ ...overrides, ...getModel(modelId).overrides });
}

// --- Summaries ---------------------------------------------------------------

export function mean(values) {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;
}

// Sample standard deviation (0 for a single value).
export function sd(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1));
}

// Flattens one episode's metrics into a row of numbers for CSV output and for
// averaging.
export function flatten(metrics) {
  const row = {};
  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === 'number') row[key] = value;
  }
  for (const [id, n] of Object.entries(metrics.interactions)) row[`n_${id}`] = n;
  for (const [key, value] of Object.entries(metrics.components)) row[`sum_${key}`] = value;
  for (const band of D_BANDS) {
    row[`steps_${band}D`] = metrics.stepsByBand[band];
    for (const [id, n] of Object.entries(metrics.choicesByBand[band])) row[`n_${id}_${band}D`] = n;
  }
  return row;
}

// Column-wise mean of rows with the same keys.
export function meanRow(rows) {
  return Object.fromEntries(Object.keys(rows[0]).map((key) => [key, mean(rows.map((r) => r[key]))]));
}

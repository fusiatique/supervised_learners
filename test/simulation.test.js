import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrlConfig, modelConfigFor, getSourceType, SOURCE_TYPES } from './helpers.js';
import { train } from '../js/hrl/experiment.js';
import { DEPENDENCE } from '../js/hrl/config.js';
import { MAZES, layoutOf } from '../js/mazes.js';
import { Simulation } from '../js/simulation.js';
import { seededRandom } from '../js/hrl/rng.js';

// The simulation behind the page, run without a browser.

const total = (counts) => [...counts.values()].reduce((sum, n) => sum + n, 0);

test('source-choice windows include the current episode and the most recent completed episodes', () => {
  const sim = new Simulation(hrlConfig(), seededRandom(1));
  sim.recent = Array.from({ length: 10000 }, () => ({ food: 1 }));
  sim.episodeInteractions = { food: 2 };
  for (const window of [100, 1000, 10000]) {
    assert.equal(sim.recentChoices(window).get('food'), window + 1);
  }
  sim.recent = [{ food: 3 }];
  assert.equal(sim.recentChoices(10000).get('food'), 5);
});

test('the simulation learns to use sources, step by step', () => {
  const sim = new Simulation(hrlConfig(), seededRandom(1));
  assert.equal(sim.modelId, 'adaptive');
  const stepsPerEpisode = sim.env.maxEpisodeSteps;
  for (let i = 0; i < stepsPerEpisode * 60 + 10; i++) sim.step();

  assert.equal(sim.episodes, 60);
  assert.equal(sim.episodeSteps, 10);
  assert.equal(sim.recent.length, 60);
  assert.ok(sim.agent.q.every(Number.isFinite));
  assert.ok(sim.history.d.points.length > 0 && sim.history.d.points.length === sim.history.rest.points.length);
  assert.ok(Number.isFinite(sim.lastOutcome.reward));
  // While still exploring it already uses a source on more than a fifth of
  // its steps.
  assert.ok(total(sim.recentChoices()) > 50 * stepsPerEpisode / 5);

  sim.resetLearning();
  assert.equal(sim.steps, 0);
  assert.equal(total(sim.recentChoices()), 0);
  assert.ok(sim.agent.q.every((value) => value === 0));
});

test('switching model changes only what the models differ in', () => {
  const params = hrlConfig();
  const sim = new Simulation(params);
  params.dBackgroundDrift = 2;
  for (let i = 0; i < 100; i++) sim.step();

  sim.setModel('noAccumulated');
  assert.equal(sim.steps, 0);
  assert.deepEqual([params.harmWeightMode, params.omega, params.dBackgroundDrift], ['adaptive', 0, 2]);
  sim.setModel('fixed');
  assert.deepEqual([params.harmWeightMode, params.omega, params.dBackgroundDrift], ['fixed', 0.1, 2]);
  sim.setModel('adaptive');
  assert.deepEqual([params.harmWeightMode, params.omega], ['adaptive', 0.1]);
});

test('parameters changed while running take effect', () => {
  const params = hrlConfig();
  const sim = new Simulation(params, seededRandom(2));
  params.dBackgroundDrift = 4;
  for (let i = 0; i < 30; i++) sim.step();
  assert.ok(sim.env.d < 50);
});

test('the maze can be edited between steps', () => {
  const sim = new Simulation(hrlConfig(), seededRandom(3));
  const { env } = sim;
  for (let i = 0; i < 400; i++) sim.step();
  const reachable = () => env.distancesFrom(env.start).filter((d) => d !== Infinity).length;
  assert.equal(sim.agent.visited.reduce((sum, v) => sum + v, 0), reachable());

  // A newly opened cell gets explored, a walled-off source is gone.
  const opened = 2 * env.cols + 1;
  assert.ok(env.removeWall(opened));
  const drugB = [...env.items].find(([, id]) => id === 'drugB')[0];
  assert.ok(env.setWall(drugB, true));
  assert.equal(env.items.size, SOURCE_TYPES.length - 1);
  for (let i = 0; i < 400; i++) sim.step();
  assert.equal(sim.agent.visited[opened], 1);
  assert.equal(sim.recentChoices().get('drugB'), sim.recent.reduce((sum, e) => sum + e.drugB, 0) + sim.episodeInteractions.drugB);

  // Moving the start begins a new episode there and keeps what was learned.
  assert.ok(sim.setStart(opened));
  assert.equal(env.state, opened);
  assert.equal(sim.episodeSteps, 0);
  assert.ok(sim.agent.q.some((value) => value !== 0));
  assert.ok(!sim.setStart(0));
});

test('a dose given from outside changes d and h and nothing else', () => {
  const sim = new Simulation(hrlConfig(), seededRandom(4));
  const drugB = getSourceType('drugB');
  for (let i = 0; i < 20; i++) sim.step();
  const { steps, episodeSteps } = sim;
  const d = sim.env.d;
  const cell = sim.env.state;
  const q = Float64Array.from(sim.agent.q);

  sim.administer(drugB);
  assert.equal(sim.env.d, d + 30);
  assert.equal(sim.env.h, 3);
  assert.deepEqual([sim.steps, sim.episodeSteps, sim.env.state, sim.dosesGiven], [steps, episodeSteps, cell, 1]);
  assert.deepEqual(sim.agent.q, q);
  assert.equal(sim.recentChoices().get('drugB'), 0);

  // Both states stay in range however many doses are given, and the agent
  // carries on from the state it now finds itself in.
  for (let i = 0; i < 50; i++) sim.administer(drugB);
  assert.deepEqual([sim.env.d, sim.env.h], [100, 100]);
  sim.step();
  assert.ok(sim.lastOutcome.accumulatedHarmCost > 0);
  assert.ok(Number.isFinite(sim.lastOutcome.reward));

  sim.resetLearning();
  assert.deepEqual([sim.dosesGiven, sim.env.d, sim.env.h], [0, 50, 0]);
});

test('the first episode is the experiment runner\'s, later ones carry the internal states over', () => {
  const sim = new Simulation(hrlConfig(), seededRandom(1));
  const stepsPerEpisode = sim.env.maxEpisodeSteps;
  for (let i = 0; i < stepsPerEpisode; i++) sim.step();
  const { training } = train(modelConfigFor('adaptive'), { seed: 1, episodes: 1 });
  assert.deepEqual(sim.recent[0], training[0].interactions);

  // The agent is back on the start with d where it was, not back at 50.
  assert.equal(sim.episodes, 1);
  assert.equal(sim.env.state, sim.env.start);
  assert.equal(sim.env.d, sim.lastOutcome.dNext);
  assert.notEqual(sim.env.d, 50);
});

test('the dependence mechanisms switch on and off together', () => {
  const params = hrlConfig();
  const sim = new Simulation(params, seededRandom(5));
  assert.equal(sim.dependence, false);
  const plainStates = sim.env.numStates;
  for (let i = 0; i < 50; i++) sim.step();

  sim.setDependence(true);
  assert.equal(sim.dependence, true);
  assert.deepEqual([params.drugDeficit, params.refractorySteps], [DEPENDENCE.drugDeficit, DEPENDENCE.refractorySteps]);
  assert.equal(sim.steps, 0);
  assert.equal(sim.env.numStates, plainStates * 6);
  assert.equal(sim.agent.q.length, sim.env.numStates * 5);

  // Doses now lower the resting level, and that outlasts the episode.
  for (let i = 0; i < 5; i++) sim.administer(getSourceType('drugB'));
  assert.equal(sim.env.restingLevel, 30);
  for (let i = 0; i < sim.env.maxEpisodeSteps + 5; i++) sim.step();
  assert.equal(sim.episodes, 1);
  assert.ok(sim.env.a > 10);
  assert.ok(sim.agent.q.every(Number.isFinite));
  assert.equal(sim.history.rest.points.length, sim.history.d.points.length);

  sim.setDependence(false);
  assert.deepEqual([params.drugDeficit, params.refractorySteps, sim.env.numStates, sim.env.a], [false, 0, plainStates, 0]);
});

test('a copied layout reproduces the maze', () => {
  const sim = new Simulation(hrlConfig());
  assert.deepEqual(layoutOf(sim.env), MAZES[0].layout);
});

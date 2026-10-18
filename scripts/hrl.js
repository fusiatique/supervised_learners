// Command-line entry point for the homeostatic model (js/hrl).
//
//   node scripts/hrl.js train        [--model adaptive] [--seed 1] [--episodes 1500] [--out DIR]
//   node scripts/hrl.js evaluate     --policy DIR [--episodes 5] [--seed 1] [--out DIR]
//   node scripts/hrl.js compare      [--seeds 20] [--episodes 1500] [--out DIR]
//   node scripts/hrl.js sensitivity  [--seeds 20] [--episodes 1500] [--out DIR]
//
// Any config value can be overridden with --set key=value (repeatable), e.g.
// --set dBackgroundDrift=0.2 --set dInitial=20 --set drugDeficit=true. See the
// README for the output.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { MODELS, SOURCE_TYPES, hrlConfig } from '../js/hrl/config.js';
import { HrlEnvironment } from '../js/hrl/environment.js';
import { HrlQLearningAgent } from '../js/hrl/agent.js';
import { seededRandom } from '../js/hrl/rng.js';
import { D_BANDS, D_BAND_HALF_WIDTH, train, evaluate, modelConfig, flatten, meanRow, mean, sd } from '../js/hrl/experiment.js';
import { COLORS, lineChart, barChart } from './lib/svgChart.js';

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    model: { type: 'string', default: 'adaptive' },
    seed: { type: 'string', default: '1' },
    seeds: { type: 'string', default: '20' },
    episodes: { type: 'string' },
    'eval-episodes': { type: 'string', default: '5' },
    policy: { type: 'string' },
    out: { type: 'string' },
    set: { type: 'string', multiple: true, default: [] },
  },
});

const overrides = Object.fromEntries(args.set.map((pair) => {
  const [key, raw] = pair.split('=');
  if (!(key in hrlConfig())) throw new Error(`Unknown config key "${key}"`);
  if (raw === 'true' || raw === 'false') return [key, raw === 'true'];
  return [key, Number.isNaN(Number(raw)) ? raw : Number(raw)];
}));
const evalEpisodes = Number(args['eval-episodes']);
const SOURCE_LABELS = { food: 'Food', social: 'Social', rest: 'Rest', drugA: 'Drug A', drugB: 'Drug B' };
const sourceLabel = (source) => SOURCE_LABELS[source.id] ?? source.name;

// --- Output helpers ----------------------------------------------------------

function writeCsv(path, rows) {
  const columns = Object.keys(rows[0]);
  const cell = (v) => (typeof v === 'number' && !Number.isInteger(v) ? String(+v.toFixed(6)) : String(v));
  writeFileSync(path, [columns.join(','), ...rows.map((row) => columns.map((c) => cell(row[c])).join(','))].join('\n') + '\n');
}

function outDir(fallback) {
  const dir = args.out ?? fallback;
  mkdirSync(dir, { recursive: true });
  return dir;
}

// Means over blocks of episodes, so a training curve has ~50 points.
function blockMeans(rows, key) {
  const size = Math.max(1, Math.round(rows.length / 50));
  const points = [];
  for (let i = 0; i + size <= rows.length; i += size) {
    points.push({ x: i + size, y: mean(rows.slice(i, i + size).map((r) => r[key])) });
  }
  return points;
}

// Averages curves from several seeds point by point, with their sd.
function acrossSeeds(curves) {
  return curves[0].map((point, i) => {
    const ys = curves.map((curve) => curve[i].y);
    return { x: point.x, y: mean(ys), sd: sd(ys) };
  });
}

function trajectoryChart(traces, subtitle) {
  return lineChart({
    title: 'Internal states during one greedy evaluation episode',
    subtitle,
    yDomain: [0, 100],
    yLabel: 'Simulation units',
    xLabel: 'Step',
    panels: traces.map(({ title, trace }) => ({
      title,
      series: [
        { name: 'd (dopamine-related state)', color: COLORS.d, points: trace.map((t) => ({ x: t.step, y: t.dNext })) },
        { name: 'h (accumulated harm)', color: COLORS.h, points: trace.map((t) => ({ x: t.step, y: t.hNext })) },
      ],
    })),
  });
}

function printSummary(title, rows) {
  console.log(`\n${title}`);
  console.table(rows);
}

const round = (n) => +n.toFixed(2);
function describe(row) {
  return {
    reward: round(row.totalReward),
    ...Object.fromEntries(SOURCE_TYPES.map((s) => [sourceLabel(s), round(row[`n_${s.id}`])])),
    drugs: round(row.drugInteractions),
    meanD: round(row.meanD),
    minD: round(row.minD),
    meanH: round(row.meanH),
    finalH: round(row.finalH),
  };
}

// --- Single runs -------------------------------------------------------------

function runTrain() {
  const config = modelConfig(args.model, overrides);
  const seed = Number(args.seed);
  const episodes = Number(args.episodes ?? 1500);
  const dir = outDir(join('results', `train-${args.model}`));

  const { env, agent, training } = train(config, { seed, episodes });
  const evaluation = evaluate(env, agent, { episodes: evalEpisodes });
  const trainingRows = training.map((m, i) => ({ episode: i + 1, ...flatten(m) }));
  const evaluationRows = evaluation.episodes.map((m, i) => ({ episode: i + 1, ...flatten(m) }));

  writeFileSync(join(dir, 'config.json'), JSON.stringify({ model: args.model, seed, episodes, config }, null, 2));
  writeFileSync(join(dir, 'policy.bin'), Buffer.from(agent.q.buffer));
  writeCsv(join(dir, 'training.csv'), trainingRows);
  writeCsv(join(dir, 'evaluation.csv'), evaluationRows);
  writeCsv(join(dir, 'trace.csv'), evaluation.trace);
  writeFileSync(join(dir, 'training.svg'), lineChart({
    title: `Training, model "${args.model}", seed ${seed}`,
    subtitle: 'Means over blocks of episodes, with exploration on',
    xLabel: 'Episode',
    legend: [],
    panels: [
      { title: 'Total reward per episode', series: [{ name: 'Reward', color: COLORS[args.model], points: blockMeans(trainingRows, 'totalReward') }] },
    ],
  }));
  writeFileSync(join(dir, 'training_drugs.svg'), lineChart({
    title: `Drug interactions per training episode, model "${args.model}", seed ${seed}`,
    subtitle: 'Means over blocks of episodes, with exploration on',
    xLabel: 'Episode',
    legend: [],
    panels: [{ series: [{ name: 'Drug interactions', color: COLORS[args.model], points: blockMeans(trainingRows, 'drugInteractions') }] }],
  }));
  writeFileSync(join(dir, 'trajectory.svg'), trajectoryChart([{ title: args.model, trace: evaluation.trace }], `Seed ${seed}`));

  printSummary(`Greedy evaluation of "${args.model}" (seed ${seed}, ${episodes} training episodes), mean of ${evalEpisodes} episodes`, [describe(meanRow(evaluationRows))]);
  console.log(`\nPolicy, metrics and plots written to ${dir}`);
}

function runEvaluate() {
  if (!args.policy) throw new Error('evaluate needs --policy <directory written by train>');
  const saved = JSON.parse(readFileSync(join(args.policy, 'config.json'), 'utf8'));
  // The policy is evaluated in the world it was trained in unless told otherwise.
  const config = hrlConfig({ ...saved.config, ...overrides });
  const env = new HrlEnvironment(config);
  const agent = new HrlQLearningAgent(env, config, seededRandom(Number(args.seed)));
  const bytes = readFileSync(join(args.policy, 'policy.bin'));
  const q = new Float64Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 8);
  if (q.length !== agent.q.length) throw new Error('The saved Q-table does not fit this configuration (different maze or bins)');
  agent.q.set(q);

  const dir = outDir(join(args.policy, 'evaluation'));
  const evaluation = evaluate(env, agent, { episodes: evalEpisodes });
  const rows = evaluation.episodes.map((m, i) => ({ episode: i + 1, ...flatten(m) }));
  writeCsv(join(dir, 'evaluation.csv'), rows);
  writeCsv(join(dir, 'trace.csv'), evaluation.trace);
  writeFileSync(join(dir, 'trajectory.svg'), trajectoryChart([{ title: saved.model, trace: evaluation.trace }], `Policy from ${args.policy}`));
  printSummary(`Greedy evaluation of the policy in ${args.policy}, mean of ${evalEpisodes} episodes`, [describe(meanRow(rows))]);
  console.log(`\nMetrics, trace and plot written to ${dir}`);
}

// --- Comparisons over seeds --------------------------------------------------

const CURVES = ['totalReward', 'drugInteractions'];

// Trains and evaluates every model under `conditionOverrides` for each seed.
// The same seeds are used for every model. Of the training episodes only the
// block means of the plotted curves are kept.
function runModels(conditionOverrides, seeds, episodes) {
  return MODELS.map((model) => {
    const config = modelConfig(model.id, conditionOverrides);
    const runs = [];
    for (let seed = 1; seed <= seeds; seed++) {
      const { env, agent, training } = train(config, { seed, episodes });
      const evaluation = evaluate(env, agent, { episodes: evalEpisodes });
      const trainingRows = training.map(flatten);
      runs.push({
        seed,
        curves: Object.fromEntries(CURVES.map((key) => [key, blockMeans(trainingRows, key)])),
        evaluation: meanRow(evaluation.episodes.map(flatten)),
        trace: evaluation.trace,
      });
    }
    return { model, config, runs };
  });
}

// One row per model and metric: mean and sd over seeds of the per-seed
// evaluation means.
function summarise(results, extra = {}) {
  return results.flatMap(({ model, runs }) =>
    Object.keys(runs[0].evaluation).map((metric) => {
      const perSeed = runs.map((run) => run.evaluation[metric]);
      return { ...extra, model: model.id, metric, mean: mean(perSeed), sd: sd(perSeed), seeds: runs.length };
    }));
}

const statsOf = (runs, metric) => {
  const perSeed = runs.map((run) => run.evaluation[metric]);
  return { mean: mean(perSeed), sd: sd(perSeed) };
};

function sourceGroups(results, suffix = '') {
  return results.map(({ model, runs }) => ({
    name: model.name,
    color: COLORS[model.id],
    values: SOURCE_TYPES.map((s) => statsOf(runs, `n_${s.id}${suffix}`)),
  }));
}

function runCompare() {
  const seeds = Number(args.seeds);
  const episodes = Number(args.episodes ?? 1500);
  const dir = outDir(join('results', 'compare'));
  const results = runModels(overrides, seeds, episodes);
  const setup = `${seeds} seeds, ${episodes} training episodes each`;
  const config = hrlConfig(overrides);

  writeFileSync(join(dir, 'config.json'), JSON.stringify({ seeds, episodes, evalEpisodes, overrides, config, models: MODELS }, null, 2));
  writeCsv(join(dir, 'evaluation_by_seed.csv'), results.flatMap(({ model, runs }) =>
    runs.map((run) => ({ model: model.id, seed: run.seed, ...run.evaluation }))));
  writeCsv(join(dir, 'evaluation_summary.csv'), summarise(results));
  for (const { model, runs } of results) writeCsv(join(dir, `trace_${model.id}.csv`), runs[0].trace);

  const curve = (key) => results.map(({ model, runs }) => ({
    name: model.name,
    color: COLORS[model.id],
    points: acrossSeeds(runs.map((run) => run.curves[key])),
  }));
  const curves = { totalReward: curve('totalReward'), drugInteractions: curve('drugInteractions') };
  writeCsv(join(dir, 'training_curves.csv'), results.flatMap(({ model }, m) =>
    curves.totalReward[m].points.map((point, i) => ({
      model: model.id,
      episode: point.x,
      rewardMean: point.y,
      rewardSd: point.sd,
      drugInteractionsMean: curves.drugInteractions[m].points[i].y,
      drugInteractionsSd: curves.drugInteractions[m].points[i].sd,
    }))));

  writeFileSync(join(dir, 'training_reward.svg'), lineChart({
    title: 'Total reward per training episode',
    subtitle: [`Mean ± sd over ${setup}; exploration on.`, 'The models have different reward functions, so their levels are not directly comparable.'],
    xLabel: 'Episode',
    panels: [{ series: curves.totalReward }],
  }));
  writeFileSync(join(dir, 'training_drugs.svg'), lineChart({
    title: 'Drug interactions per training episode',
    subtitle: `Mean ± sd over ${setup}; exploration on`,
    xLabel: 'Episode',
    floor: 0,
    panels: [{ series: curves.drugInteractions }],
  }));
  writeFileSync(join(dir, 'trajectories.svg'), trajectoryChart(
    results.map(({ model, runs }) => ({ title: model.name, trace: runs[0].trace })),
    'Seed 1 of each model, exploration off',
  ));
  const { dTarget } = config;
  const bandTitles = {
    low: `Low d (below ${dTarget - D_BAND_HALF_WIDTH})`,
    mid: `Intermediate d (${dTarget - D_BAND_HALF_WIDTH} to ${dTarget + D_BAND_HALF_WIDTH})`,
    high: `High d (above ${dTarget + D_BAND_HALF_WIDTH})`,
  };
  writeFileSync(join(dir, 'choices_by_d.svg'), barChart({
    title: 'Source choices by level of d',
    subtitle: [`Interactions per greedy evaluation episode, by d before the interaction. Mean ± sd over ${seeds} seeds.`, 'A band the agent never entered stays empty.'],
    yLabel: 'Interactions per episode',
    panels: D_BANDS.map((band) => ({
      title: bandTitles[band],
      categories: SOURCE_TYPES.map(sourceLabel),
      groups: sourceGroups(results, `_${band}D`),
    })),
  }));
  writeFileSync(join(dir, 'model_comparison.svg'), barChart({
    title: 'Source use of the three models',
    subtitle: `Interactions per greedy evaluation episode. Mean ± sd over ${setup}.`,
    yLabel: 'Interactions per episode',
    panels: [{ categories: SOURCE_TYPES.map(sourceLabel), groups: sourceGroups(results) }],
  }));

  printSummary(`Greedy evaluation, mean over ${setup}`, Object.fromEntries(
    results.map(({ model, runs }) => [model.id, describe(meanRow(runs.map((run) => run.evaluation)))])));
  printSummary('Drug interactions per evaluation episode, by seed', Object.fromEntries(
    results.map(({ model, runs }) => [model.id, runs.map((run) => round(run.evaluation.drugInteractions)).join(' ')])));
  console.log(`\nMetrics and plots written to ${dir}`);
}

// Drift 0 and 0.2 crossed with a start at and below the target are the
// planned conditions. The stronger drifts are exploratory: they show how much
// depletion pressure it takes before the models part ways.
const SENSITIVITY_CONDITIONS = [
  { id: 'base', name: 'Base: drift 0, start d 50', overrides: {} },
  { id: 'drift0.2', name: 'Drift 0.2, start d 50', overrides: { dBackgroundDrift: 0.2 } },
  { id: 'start20', name: 'Drift 0, start d 20', overrides: { dInitial: 20 } },
  { id: 'drift0.2_start20', name: 'Drift 0.2, start d 20', overrides: { dBackgroundDrift: 0.2, dInitial: 20 } },
  { id: 'drift1', name: 'Drift 1 (exploratory)', overrides: { dBackgroundDrift: 1 } },
  { id: 'drift2', name: 'Drift 2 (exploratory)', overrides: { dBackgroundDrift: 2 } },
  { id: 'drift3', name: 'Drift 3 (exploratory)', overrides: { dBackgroundDrift: 3 } },
];

function runSensitivity() {
  const seeds = Number(args.seeds);
  const episodes = Number(args.episodes ?? 1500);
  const dir = outDir(join('results', 'sensitivity'));
  const setup = `${seeds} seeds, ${episodes} training episodes each`;
  const bySeed = [];
  const summary = [];
  const panels = [];
  const table = {};

  for (const condition of SENSITIVITY_CONDITIONS) {
    const conditionOverrides = { ...overrides, ...condition.overrides };
    const results = runModels(conditionOverrides, seeds, episodes);
    for (const { model, runs } of results) {
      for (const run of runs) bySeed.push({ condition: condition.id, model: model.id, seed: run.seed, ...run.evaluation });
      const row = meanRow(runs.map((run) => run.evaluation));
      table[`${condition.id} / ${model.id}`] = {
        ...describe(row),
        drugsSd: round(sd(runs.map((run) => run.evaluation.drugInteractions))),
        seedsUsingDrugs: `${runs.filter((run) => run.evaluation.drugInteractions > 0).length}/${seeds}`,
      };
    }
    summary.push(...summarise(results, { condition: condition.id }));
    panels.push({ title: condition.name, categories: SOURCE_TYPES.map(sourceLabel), groups: sourceGroups(results) });
    console.log(`finished ${condition.id}`);
  }

  writeFileSync(join(dir, 'config.json'), JSON.stringify({ seeds, episodes, evalEpisodes, overrides, conditions: SENSITIVITY_CONDITIONS, models: MODELS }, null, 2));
  writeCsv(join(dir, 'evaluation_by_seed.csv'), bySeed);
  writeCsv(join(dir, 'evaluation_summary.csv'), summary);
  writeFileSync(join(dir, 'sensitivity_sources.svg'), barChart({
    title: 'Source use under background drift and a low starting state',
    subtitle: `Interactions per greedy evaluation episode. Mean ± sd over ${setup}.`,
    yLabel: 'Interactions per episode',
    panels,
  }));
  printSummary(`Greedy evaluation, mean over ${setup}`, table);
  console.log(`\nMetrics and plot written to ${dir}`);
}

const commands = { train: runTrain, evaluate: runEvaluate, compare: runCompare, sensitivity: runSensitivity };
const command = commands[positionals[0]];
if (!command) {
  console.error(`Usage: node scripts/hrl.js <${Object.keys(commands).join('|')}> [options]`);
  process.exit(1);
}
command();

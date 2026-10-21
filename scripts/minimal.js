// Command-line entry point for the minimal model (js/).
//
//   node scripts/minimal.js [all|acquisition|doses|compulsion|relapse|policy] [--seeds 20] [--out DIR]
//
// Any config value can be overridden with --set key=value (repeatable), e.g.
// --set rho=0.002 --set c=3. Output goes to results/minimal/ by default.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { ACTIONS, config, tippingPoint } from '../js/model.js';
import { stateShape } from '../js/agent.js';
import { acquisition, doses, compulsion, relapse, runLife, isDependent } from '../js/experiments.js';
import { lineChart, barChart } from './lib/svgChart.js';

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    seeds: { type: 'string', default: '20' },
    out: { type: 'string', default: 'results/minimal' },
    set: { type: 'string', multiple: true, default: [] },
  },
});

const overrides = Object.fromEntries(args.set.map((pair) => {
  const [key, raw] = pair.split('=');
  if (!(key in config())) throw new Error(`Unknown config key "${key}"`);
  if (raw === 'true' || raw === 'false') return [key, raw === 'true'];
  return [key, Number(raw)];
}));
const seeds = Number(args.seeds);
const dir = args.out;
mkdirSync(dir, { recursive: true });

const COLORS = { clean: '#2a78d6', dependent: '#e34948', control: '#898781', nothing: '#d9d7d0', natural: '#1baf7a', drug: '#e34948' };

function writeCsv(name, rows) {
  const columns = Object.keys(rows[0]);
  const cell = (v) => (typeof v === 'number' && !Number.isInteger(v) ? String(+v.toFixed(6)) : String(v));
  writeFileSync(join(dir, name), [columns.join(','), ...rows.map((row) => columns.map((c) => cell(row[c])).join(','))].join('\n') + '\n');
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// --- Experiments --------------------------------------------------------------

function runAcquisition() {
  const { lives, perSeed } = acquisition({ seeds, overrides });
  writeCsv('acquisition_by_seed.csv', perSeed);
  const groups = [
    { name: 'Became dependent', color: COLORS.dependent, lives: lives.filter((l) => isDependent(l.windows)) },
    { name: 'Stayed clean', color: COLORS.clean, lives: lives.filter((l) => !isDependent(l.windows)) },
  ].filter((g) => g.lives.length);
  const curve = (group, key, scale = 1) => group.lives[0].windows.map((w, i) => ({
    x: w.step / 1000,
    y: mean(group.lives.map((l) => l.windows[i][key])) * scale,
  }));
  const counts = groups.map((g) => `${g.name.toLowerCase()}: ${g.lives.length}`).join(', ');
  writeFileSync(join(dir, 'acquisition.svg'), lineChart({
    title: 'Acquisition: the drug becomes available at step 20,000',
    subtitle: [`Mean per group over ${seeds} agents (${counts}).`, 'Nothing is forced: every drug use is the agent’s own choice.'],
    xLabel: 'Step (thousands)',
    panels: [
      { title: 'Drug choices (% of steps)', series: groups.map((g) => ({ name: g.name, color: g.color, points: curve(g, 'drugShare', 100) })) },
      { title: 'Baseline B', series: groups.map((g) => ({ name: g.name, color: g.color, points: curve(g, 'meanB') })) },
    ],
  }));
  console.log(`Acquisition: ${perSeed.filter((r) => r.dependent).length} of ${seeds} agents became dependent on their own.`);
}

function runDoses() {
  const withDeficit = doses({ seeds, overrides });
  const control = doses({ seeds, overrides: { ...overrides, delta: 0 } });
  writeCsv('doses.csv', withDeficit.map((r, i) => ({ doses: r.doses, dependent: r.dependent, dependentControl: control[i].dependent, seeds })));
  writeFileSync(join(dir, 'doses.svg'), barChart({
    title: 'Forced doses at step 40,000',
    subtitle: `Agents dependent at step 80,000, of ${seeds}. The control's drug cannot lower B (delta = 0).`,
    xLabel: 'Number of forced doses',
    panels: [{
      categories: withDeficit.map((r) => String(r.doses)),
      groups: [
        { name: 'Drug lowers B', color: COLORS.dependent, values: withDeficit.map((r) => ({ mean: r.dependent })) },
        { name: 'Control (delta = 0)', color: COLORS.control, values: control.map((r) => ({ mean: r.dependent })) },
      ],
    }],
  }));
  console.log('Forced doses -> dependent agents:', withDeficit.map((r, i) => `${r.doses}: ${r.dependent} (control ${control[i].dependent})`).join(', '));
}

function runCompulsion() {
  const rows = compulsion({ seeds, overrides });
  writeCsv('compulsion.csv', rows);
  writeFileSync(join(dir, 'compulsion.svg'), barChart({
    title: 'Compulsion: raising the drug’s harm cost c at step 50,000',
    subtitle: `Drug choices in the last 1,000 steps, mean over ${seeds} agents. The dosed group got 20 forced doses at step 40,000.`,
    xLabel: 'Harm cost c',
    panels: [{
      categories: rows.map((r) => String(r.c)),
      groups: [
        { name: 'Not dosed', color: COLORS.clean, values: rows.map((r) => ({ mean: r.cleanDrugShare * 100 })) },
        { name: 'Dosed', color: COLORS.dependent, values: rows.map((r) => ({ mean: r.dosedDrugShare * 100 })) },
      ],
    }],
    yLabel: 'Drug choices (% of steps)',
  }));
  console.log('Compulsion (c: dependent not dosed / dosed):', rows.map((r) => `${r.c}: ${r.cleanDependent}/${r.dosedDependent}`).join(', '));
}

function runRelapse() {
  const rows = relapse({ seeds, overrides });
  writeCsv('relapse.csv', rows);
  writeFileSync(join(dir, 'relapse.svg'), barChart({
    title: 'Relapse after abstinence',
    subtitle: [`Dependent agents (20 forced doses) lose access to the drug, then get it back. Of ${seeds}, dependent 20,000 steps later.`,
      `Mean B when the drug returns: ${rows.map((r) => `${r.abstinence} steps → ${r.bAtReturn.toFixed(0)}`).join(', ')}.`],
    xLabel: 'Steps of abstinence',
    panels: [{
      categories: rows.map((r) => String(r.abstinence)),
      groups: [{ name: 'Relapsed', color: COLORS.dependent, values: rows.map((r) => ({ mean: r.dependent })) }],
    }],
  }));
  console.log('Relapse (abstinence: dependent, B at return):', rows.map((r) => `${r.abstinence}: ${r.dependent} (B ${r.bAtReturn.toFixed(1)})`).join(', '));
}

// States visited less often than this are drawn pale: too few visits to have learned much.
const MIN_VISITS = 50;

// The greedy policy over (H, B) of one clean and one dosed agent, as heatmaps.
function runPolicy() {
  const lives = [
    { title: 'Not dosed', life: runLife({ overrides, events: drugEvents(0), steps: 60000, seed: 3 }) },
    { title: 'After 20 forced doses', life: runLife({ overrides, events: drugEvents(20), steps: 60000, seed: 3 }) },
  ];
  writeFileSync(join(dir, 'policy.svg'), policySvg(lives));
  console.log('Policy heatmaps written.');
}

const drugEvents = (n) => [
  { at: 0, set: { drugAvailable: false } },
  { at: 20000, set: { drugAvailable: true } },
  { at: 40000, doses: n },
];

function policySvg(lives) {
  const p = lives[0].life.p;
  const { hBins, bBins } = stateShape(p);
  const cell = 26;
  const panelWidth = bBins * cell;
  const panelHeight = hBins * cell;
  const left = 60;
  const top = 100;
  const gap = 70;
  const width = Math.max(760, left + lives.length * (panelWidth + gap));
  const height = top + panelHeight + 70;
  const color = (a) => (a === null ? '#f3f2ee' : COLORS[ACTIONS[a].id]);
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family='system-ui, sans-serif' font-size="11">`,
    `<rect width="${width}" height="${height}" fill="#fcfcfb"/>`,
    `<text x="${left}" y="22" font-size="14" font-weight="600" fill="#0b0b0b">What the agent chooses in each internal state</text>`,
    `<text x="${left}" y="39" fill="#52514e">Greedy action per (H, B) bin after 60,000 steps. Pale: visited fewer than ${MIN_VISITS} times. Dashed: setpoint S and tipping point.</text>`,
  ];
  let legendX = left;
  for (const action of ACTIONS) {
    out.push(`<rect x="${legendX}" y="50" width="12" height="12" rx="2" fill="${COLORS[action.id]}"/><text x="${legendX + 17}" y="60" fill="#52514e">${action.name}</text>`);
    legendX += 120;
  }
  lives.forEach(({ title, life }, i) => {
    const x0 = left + i * (panelWidth + gap);
    out.push(`<text x="${x0}" y="${top - 6}" font-weight="600" fill="#0b0b0b">${title}</text>`);
    for (let h = 0; h < hBins; h++) {
      for (let b = 0; b < bBins; b++) {
        const a = life.agent.preferred(h * bBins + b, MIN_VISITS);
        const x = x0 + b * cell;
        const y = top + (hBins - 1 - h) * cell;
        const label = `H ${h * p.hBinWidth}–${(h + 1) * p.hBinWidth}, B ${b * p.bBinWidth}–${(b + 1) * p.bBinWidth}: ${a === null ? 'too few visits' : ACTIONS[a].name}`;
        out.push(`<rect x="${x}" y="${y}" width="${cell - 1}" height="${cell - 1}" fill="${color(a)}"><title>${label}</title></rect>`);
      }
    }
    const sy = top + panelHeight - (p.S / p.hMax) * panelHeight;
    const tx = x0 + (tippingPoint(p) / p.B0) * panelWidth;
    out.push(`<line x1="${x0}" x2="${x0 + panelWidth}" y1="${sy}" y2="${sy}" stroke="#0b0b0b" stroke-dasharray="4 3"/>`);
    out.push(`<line x1="${tx}" x2="${tx}" y1="${top}" y2="${top + panelHeight}" stroke="#0b0b0b" stroke-dasharray="4 3"/>`);
    for (let b = 0; b <= bBins; b += 2) out.push(`<text x="${x0 + b * cell}" y="${top + panelHeight + 14}" fill="#898781" text-anchor="middle">${b * p.bBinWidth}</text>`);
    for (let h = 0; h <= hBins; h += 2) out.push(`<text x="${x0 - 6}" y="${top + panelHeight - h * cell + 4}" fill="#898781" text-anchor="end">${h * p.hBinWidth}</text>`);
    out.push(`<text x="${x0 + panelWidth / 2}" y="${top + panelHeight + 32}" fill="#898781" text-anchor="middle">Baseline B</text>`);
    out.push(`<text x="${x0 + panelWidth / 2}" y="${top + panelHeight + 48}" fill="#52514e" text-anchor="middle">ends at B = ${life.state.B.toFixed(0)}</text>`);
  });
  out.push(`<text transform="translate(16 ${top + panelHeight / 2}) rotate(-90)" fill="#898781" text-anchor="middle">Internal level H</text>`);
  out.push('</svg>');
  return out.join('\n');
}

// --- Main -----------------------------------------------------------------------

const commands = { acquisition: runAcquisition, doses: runDoses, compulsion: runCompulsion, relapse: runRelapse, policy: runPolicy };
const command = positionals[0] ?? 'all';
if (command === 'all') {
  for (const run of Object.values(commands)) run();
} else if (commands[command]) {
  commands[command]();
} else {
  throw new Error(`Unknown command "${command}". Choose one of: all, ${Object.keys(commands).join(', ')}`);
}
writeFileSync(join(dir, 'config.json'), JSON.stringify(config(overrides), null, 2) + '\n');
console.log(`Written to ${dir}/`);

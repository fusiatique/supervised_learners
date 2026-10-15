import { Environment, ACTIONS } from '../environment.js';
import { getMaze } from '../mazes.js';
import { getSourceType } from './config.js';
import { transition, dAfterAction, deficitGain, clip, binIndex, numBins } from './dynamics.js';
import { computeReward } from './reward.js';

// The four moves keep their indices; "use the source on this cell" is added
// after them.
export const INTERACT = ACTIONS.length;

const MOVES = ACTIONS.map((_, action) => action);
const MOVES_AND_INTERACT = [...MOVES, INTERACT];

// The grid world with the homeostatic model on top:
//  - a source on a cell (`items`) is only used through the INTERACT action
//    and only once per visit (leave the cell and come back to use it again);
//    with `refractorySteps` it also stays unavailable for that many steps;
//  - the agent carries a dopamine-related state `d`, accumulated harm `h`
//    and, if `drugDeficit` is on, a drug-induced deficit `a`;
//  - nothing ends an episode but the step limit, `maxEpisodeSteps`.
// `state` is still the agent's cell. What the Q-table is indexed by is
// `qState()`: the cell, the bins of d, h and a, and whether the source on the
// cell is unavailable (used on this visit or still refractory).
export class HrlEnvironment extends Environment {
  constructor(config) {
    super(getMaze(config.mazeId));
    this.config = config;

    this.dBins = numBins(config.dMin, config.dMax, config.dBinWidth);
    this.hBins = numBins(config.hMin, config.hMax, config.hBinWidth);
    // Without the drug-induced deficit a is always zero and needs no bins.
    this.aBins = config.drugDeficit ? numBins(0, config.aMax, config.aBinWidth) : 1;
    this.statesPerCell = this.dBins * this.hBins * this.aBins * 2;
    this.numStates = this.numCells * this.statesPerCell;
    this.numActions = MOVES_AND_INTERACT.length;
    this.maxEpisodeSteps = config.maxEpisodeSteps ?? this.numCells * 2;
    this.reset();
  }

  // Starts an episode. The internal states default to their configured
  // initial values.
  reset({ d = this.config.dInitial, h = this.config.hInitial, a = this.config.aInitial } = {}) {
    super.reset();
    this.d = d;
    this.h = h;
    this.a = this.config.drugDeficit ? a : 0;
    this.clock = 0;
    this.readyAt = new Map(); // cell -> step from which its source can be used again
    this.sourceUsed = false;
    return this.qState();
  }

  qState() {
    return this.qStateAt(this.state, this.sourceUsed || this.isRefractory(this.state));
  }

  isRefractory(cell) {
    return this.clock < (this.readyAt.get(cell) ?? 0);
  }

  // The level d recovers towards: dBase lowered by the drug-induced deficit.
  get restingLevel() {
    return this.config.dBase - this.a;
  }

  // The Q-state the agent would be in on `cell` with its current d, h and a,
  // with the source there available unless `sourceUnavailable` says otherwise.
  qStateAt(cell, sourceUnavailable = false) {
    const { dMin, dMax, dBinWidth, hMin, hMax, hBinWidth, aMax, aBinWidth } = this.config;
    const aBin = this.aBins === 1 ? 0 : binIndex(this.a, 0, aMax, aBinWidth);
    return this.encode(cell, binIndex(this.d, dMin, dMax, dBinWidth), binIndex(this.h, hMin, hMax, hBinWidth), sourceUnavailable, aBin);
  }

  encode(cell, dBin, hBin, sourceUsed, aBin = 0) {
    return (((cell * this.dBins + dBin) * this.hBins + hBin) * this.aBins + aBin) * 2 + Number(sourceUsed);
  }

  decode(qState) {
    const sourceUsed = qState % 2 === 1;
    let rest = Math.floor(qState / 2);
    const aBin = rest % this.aBins;
    rest = Math.floor(rest / this.aBins);
    const hBin = rest % this.hBins;
    rest = Math.floor(rest / this.hBins);
    return { cell: Math.floor(rest / this.dBins), dBin: rest % this.dBins, hBin, aBin, sourceUsed };
  }

  cellOf(qState) {
    return Math.floor(qState / this.statesPerCell);
  }

  sourceAt(cell) {
    return getSourceType(this.items.get(cell));
  }

  // The source that INTERACT would use right now, or null.
  usableSource() {
    return this.sourceUsed || this.isRefractory(this.state) ? null : this.sourceAt(this.state);
  }

  // Moves are always allowed (walking into a wall leaves the agent in
  // place); INTERACT only on a source that is available.
  validActions(qState = this.qState()) {
    const usable = qState % 2 === 0 && this.items.has(this.cellOf(qState));
    return usable ? MOVES_AND_INTERACT : MOVES;
  }

  // Applies a source's effects on the internal states from outside: the
  // agent did not choose it, no step passes and no reward is given.
  administer(source) {
    const { hMin, hMax, aMax } = this.config;
    this.d = dAfterAction(this.d, source.dopamineGain, this.config);
    this.h = clip(this.h + source.harmGain, hMin, hMax);
    this.a = clip(this.a + deficitGain(source, this.config), 0, aMax);
  }

  // An INTERACT with nothing to use is rejected: the step passes like a move
  // into a wall, with no source reward or source effects.
  step(action) {
    const d = this.d;
    let source = null;
    let rejected = false;
    if (action === INTERACT) {
      source = this.usableSource();
      if (source) {
        this.sourceUsed = true;
        this.readyAt.set(this.state, this.clock + 1 + this.config.refractorySteps);
      } else {
        rejected = true;
      }
    } else {
      const from = this.state;
      super.step(action);
      if (this.state !== from) this.sourceUsed = false;
    }

    this.clock++;
    const { dAction, dNext, hNext, aNext } = transition(d, this.h, source, this.config, this.a);
    this.d = dNext;
    this.h = hNext;
    this.a = aNext;
    const reward = computeReward({ d, dAction, dNext, hNext, source }, this.config);
    return { state: this.qState(), cell: this.state, source, rejected, done: false, d, dAction, dNext, hNext, aNext, ...reward };
  }
}

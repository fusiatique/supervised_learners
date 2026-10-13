# Maze RL Simulation

A Q-learning agent in a grid-world maze with two internal state variables and five usable sources: food, social interaction, rest and two drugs. It is a prototype of a homeostatic reinforcement-learning model for asking when an agent chooses drugs despite their costs. It runs as an interactive page (`index.html`) and as command-line experiments.

> **What this model is and is not.** The model is a computational hypothesis, not a validated account of dopamine physiology or of clinical addiction. `d` and `h` are abstract simulation units, every parameter value is illustrative rather than measured, and the results depend on those values. The model does not claim that dopamine is pleasure.

## Running it

Requires Node.js 22 or newer. There are no runtime dependencies; `npm install` is only needed for the optional esbuild bundle.

| What | Command |
|---|---|
| Interactive page | serve the folder (for example `npx serve .`) and open `index.html` |
| Tests | `npm test` |
| Train the adaptive model | `npm run hrl:train` (options: `-- --model fixed --seed 2 --episodes 1500`) |
| Evaluate a trained policy | `npm run hrl:evaluate -- --policy results/train-adaptive` |
| Compare the three models | `npm run hrl:compare` (options: `-- --seeds 20 --episodes 1500`) |
| Background-drift and low-start experiment | `npm run hrl:sensitivity` |

Every `hrl:` command takes `--out <directory>`, and every model parameter can be overridden with `--set key=value`, as often as needed:

```
npm run hrl:compare -- --set dBackgroundDrift=0.2 --set dInitial=20 --out results/compare-drift
```

Runs are seeded, so the same command produces the same numbers.

## The interactive page

The page runs the same model one step at a time and shows what the agent is learning.

- **Maze.** Sources are the lettered circles (F food, C social interaction, R rest, A and B the drugs); the layout is fixed. Shading and arrows show the learned values and preferred moves *for the agent's current `d` and `h`*, so they shift as those change. A ring around a source means the agent would use it now.
- **Harm trade-off.** Switches between the three models described below. Switching resets learning.
- **Dependence mechanisms.** On by default on the page. Switches on the two optional mechanisms described under "Drug-induced deficit and refractory sources": each drug use lowers the level `d` rests at, and a used source cannot be used again for 15 steps. A source that is not yet available again is drawn faded.
- **Parameters.** Two sliders are always shown, the starting `d` and the background drift of `d`; the remaining dynamics, reward weights and learning settings are under "More parameters". Changes take effect on the next step; what was learned under the old values is kept until "Reset learning".
- **Give Drug B.** Gives the agent one dose of the potent drug wherever it is: `d` rises by the drug's gain, `h` by its harm gain and, with the dependence mechanisms on, the resting level of `d` drops by 4. The agent did not choose it, so it gets no reward for it, learns nothing from it directly, and the dose is not counted among the sources it chose. About 13 doses in quick succession take the resting level to its floor.
- **Agent state.** A face that shows the agent's condition at a glance. Its expression follows `d`: euphoric at 80 and above, happy from 60, neutral from 40 to 60, and sad below 40, which becomes "in withdrawal" when drug use has lowered the resting level of `d` by 10 or more. Its skin turns greyer and paler as accumulated harm `h` rises, and a bar next to it shows `h` on its full scale of 0 to 100. The face is a reading aid (`js/hrl/mood.js`); it has no effect on the model.
- **Dopamine-related state over time** plots `d`, the level it currently rests at, and as a dashed line the level the agent wants `d` to be at (`dTarget`). **Progress** shows the current values of `d` and the resting level, the harm weight and the last reward, and how the agent's interactions over recent episodes are split between the sources.

Changes made on the page are not saved and do not affect the command-line experiments, which always start from `js/hrl/config.js` and `js/mazes.js`. The maze itself is not editable from the page; the environment still supports moving walls, sources and the start (`js/environment.js`), and the layout is the text block in `js/mazes.js`.

On the page the agent's internal states carry over from one episode to the next; an episode boundary only puts the agent back on the start. (The command-line experiments start every episode from the initial values.)

### What to expect from dosing

With the dependence mechanisms on, the model has two stable ways of living. A clean agent works the ordinary sources, keeps `d` around 55 to 60 and takes no drugs. A dependent agent has its resting level at or near the floor, sits at a `d` of about 25 and takes Drug A as often as the refractory period allows, about 20 times per episode, with few or no ordinary sources. Once there, most agents stayed there for hundreds of episodes: all four adaptive agents that were dependent before the doses still were 300 episodes later, while the one fixed agent recovered in the dosed run and not in the undosed one.

How an agent gets there varies a great deal from run to run. In a check with 16 seeds per model, each run for 300 episodes, given 15 doses of Drug B ten steps apart, and run for 300 more:

| | A: fixed | B: adaptive |
|---|---|---|
| Dependent after the first 300 episodes, before any dose | 1 of 16 | 4 of 16 |
| Of those still clean: dependent 31 to 50 episodes after the doses | 1 of 15 | 2 of 12 |
| Of those still clean: dependent 300 episodes after the doses | 1 of 15 | 1 of 12 |
| Of those still clean: dependent at that point *without* any doses | 1 of 15 | 1 of 12 |

("Dependent" meaning five or more self-chosen drug uses per episode.) So:

- Some agents become dependent on their own, through the drug uses of their early exploration, and more of them under the adaptive model. With 16 seeds this difference is suggestive, not established.
- The doses push every agent into a deep deficit, and for some tens of episodes afterwards many of them take drugs they did not take before. Most then heal and return to the clean pattern; only a few stay dependent, about as many as drift into dependence without any doses.
- To watch a transition, give the doses and watch the next 20 or so episodes at high speed. If the agent recovers, that is the more common outcome, not a fault.

## The model

### Files

| File | Purpose |
|---|---|
| `js/hrl/config.js` | **All parameters**: sources, dynamics, reward, and the three model variants |
| `js/config.js` | Learning parameters and the step cost |
| `js/mazes.js` | The maze layout, including where the sources start out |
| `js/hrl/dynamics.js` | How `d` and `h` change, and how they are binned for the Q-table |
| `js/hrl/reward.js` | The reward function and its components |
| `js/environment.js`, `js/hrl/environment.js` | The grid (walls, start, moves) and `HrlEnvironment` on top of it: sources, `d`, `h` and the interact action |
| `js/agents/qlearning.js`, `js/hrl/agent.js` | Tabular Q-learning and `HrlQLearningAgent`, which tells it about valid actions and the larger state |
| `js/hrl/experiment.js` | Training, greedy evaluation and per-episode metrics |
| `js/hrl/mood.js` | Which mood and skin pallor the page's face shows for given internal states |
| `js/simulation.js`, `js/main.js`, `js/ui/` | The interactive page |
| `scripts/hrl.js` | Command line: train, evaluate, compare, sensitivity |
| `test/` | Automated tests (`node:test`) |

### Internal states

- `d` is a dopamine-related internal state between 0 and 100. `dTarget` (50) is the level the agent "prefers"; it is used by the benefit and harm-sensitivity functions. `dBase` (50) is the level that passive recovery pulls towards. They are separate parameters that happen to start equal.
- `h` is accumulated harm between 0 and 100. It grows with drug use and fades slowly.
- `a` is the optional drug-induced deficit between 0 and 50: how far drug use has lowered the level `d` rests at. It is zero, and not part of the model, unless `drugDeficit` is on.

Episodes start at `d = 50`, `h = 0`, `a = 0`.

### Sources and interaction

| Source | Immediate reward | Dopamine gain | Harm gain | Acute harm cost |
|---|---:|---:|---:|---:|
| Food | 1.5 | 7 | 0 | 0 |
| Social interaction | 1.4 | 6 | 0 | 0 |
| Rest | 1.0 | 4 | 0 | 0 |
| Drug A (moderate) | 3.5 | 18 | 1.5 | 2.5 |
| Drug B (potent) | 5.0 | 30 | 3.0 | 5.0 |

A fifth action, **interact**, uses the source on the agent's cell. Standing on a source gives nothing. A source can be used once per visit: the agent has to step off the cell and return before it can use it again (walking into a wall does not count as leaving). Interact is not offered to the agent anywhere else, and if it is forced through the environment directly, the step passes with no reward and no source effects.

Reaching a source does not end the episode, because the agent has to be able to stand on a source and decide whether to use it. Episodes only end on a step limit of two steps per cell (338 steps).

### The maze

The maze in `js/mazes.js` is a corridor with five dead-end arms, one source at the end of each, every source exactly six steps from the start.

```
#############
#############
##....S....##      S  start
##.#.#.#.#.##
##F#.#.#.#B##      F  food      B  drug B
####.#.#.####
####C#.#A####      C  social    A  drug A
######.######
######R######      R  rest
#############
```

Equal distances matter: in an earlier layout where one source was closer to the start, the agent simply used the nearest one in every model. The letters in the layout place the sources; "Copy layout" on the page produces a layout from whatever is on screen.

### State transitions

Each step, in this order:

```
dAction = clip(d + dopamineGain, dMin, dMax)                              gain is 0 unless a source was used
dNext   = clip(dAction + kD * (dBase - dAction) - dBackgroundDrift, dMin, dMax)
hNext   = clip(rhoH * h + harmGain, hMin, hMax)
```

with `kD = 0.04`, `rhoH = 0.98` and `dBackgroundDrift = 0` by default.

**Why the background drift is configurable.** With no drift, a start at 50 and only non-negative gains, `d` can never fall below 50, so the base configuration has no below-target deficits at all. Two ways of getting below the target are provided: starting an episode low (`--set dInitial=20`), and a constant depletion pressure per step (`--set dBackgroundDrift=0.2`), under which an idle agent settles at `dBase - drift / kD`. The drift is an extra modelling assumption for exploring the model, not an empirically established mechanism.

### Drug-induced deficit and refractory sources

Two optional mechanisms, both off in `js/hrl/config.js` and so in the experiments reported below, and both switched on by the page's "Dependence mechanisms" box. Like the background drift they are added modelling assumptions, not established mechanisms. They exist because without them nothing in the model makes past drug use increase later drug use, and an agent with free, unlimited ordinary sources never needs a drug.

**Drug-induced deficit** (`drugDeficit`). Each use of a drug adds its `deficitGain` (Drug A 2, Drug B 4, ordinary sources 0) to `a`, and `d` recovers towards `dBase - a` instead of `dBase`:

```
aNext = clip(rhoA * a + deficitGain, 0, aMax)
dNext = clip(dAction + kD * ((dBase - aNext) - dAction) - dBackgroundDrift, dMin, dMax)
```

with `rhoA = 0.9995` and `aMax = 50`. The deficit heals with a half-life of about 1,400 steps, far more slowly than `d` itself moves (its half-life is under 20 steps), so the high from a dose is gone long before the lowered resting level is. The reward function is unchanged: a lowered resting level matters because it leaves `d` below the target, where raising `d` is worth more and, in the adaptive model, harm weighs less.

**Refractory sources** (`refractorySteps`). After a source is used it cannot be used again for that many steps (15 on the page), in addition to the agent having to leave and return. This applies to every source alike. It caps how much `d` the ordinary sources can supply, which is what lets a deficit actually bite: without it, steady use of the ordinary sources holds `d` at about 40, not far below the target, even at the largest deficit.

### Reward

```
r = R0 + beta * (phi(dAction) - phi(d)) - lambda(d) * (acuteHarm + omega * hNext) - stepCost
```

| Term | Meaning | Default |
|---|---|---|
| `R0` | the source's immediate reward; 0 for a move | see table above |
| `beta` | weight of the state-dependent benefit | 1.0 |
| `phi` | state utility of `d` (below) | `phiA = 10`, `phiB = 3`, `phiC = 0.05` |
| `lambda(d)` | harm-sensitivity weight (below) | `lambdaMin = 0.15`, `lambdaMax = 1.0`, `lambdaS = 8` |
| `acuteHarm` | the source's acute harm cost; 0 for a move | see table above |
| `omega` | weight of accumulated harm | 0.1 |
| `stepCost` | cost of spending a step | 0.02 |

**State-dependent benefit.**

```
phi(d) = -phiA * ((dTarget - d) / dTarget)^2        for d <  dTarget
phi(d) =  phiB * (1 - exp(-phiC * (d - dTarget)))   for d >= dTarget
```

`phi` is zero and continuous at the target, rises steeply from below it and flattens above it. The benefit term uses `dAction`, the state right after the source's effect and before passive recovery, so that what is rewarded is the action's own effect and not the drift back to baseline that would have happened anyway.

**State-dependent harm sensitivity.** This is the model's central assumption:

```
lambda(d) = lambdaMin + (lambdaMax - lambdaMin) / (1 + exp(-(d - dTarget) / lambdaS))
```

Harm weighs little when `d` is far below the target (0.17 at `d = 20`), 0.575 at the target, and nearly fully above it (0.98 at `d = 80`). It never reaches zero. That an agent in deficit discounts harm is a hypothesis to be explored here, not an established mechanism of the brain.

The harm term uses `d` from before the action and `h` from after it, for every action. Accumulated harm is therefore paid on every step while it lasts, including moves; acute harm only when a drug is actually used.

### Q-learning and the state

The update is standard tabular Q-learning:

```
Q(s, a) += alpha * (r + gamma * max over valid a' of Q(s', a') - Q(s, a))
```

with `alpha = 0.5`, `gamma = 0.98` and ε schedule (0.3, decaying by 0.985 per episode to 0.05). Action selection and the maximum over next actions both run over valid actions only. Episodes end only by the step limit, which is not treated as a terminal state.

The environment keeps `d` and `h` as continuous numbers. The Q-table is indexed by

```
(cell, dBin, hBin, sourceUnavailable)
```

where the bins are 10 wide: `[0, 10)` is bin 0, …, `[90, 100)` is bin 9, and exactly 100 is bin 10, giving 11 bins each. The last component says whether the source on the cell has been used on this visit or is still refractory; it is what makes interact valid or not, so the valid actions can be read off the state. That is 169 × 11 × 11 × 2 = 40,898 states and 5 actions. With `drugDeficit` on, the bin of `a` (six bins of width 10) joins the state, making it six times larger. Each model is trained from scratch with a zero Q-table.

### The three models

| Model | `harmWeightMode` | `omega` | Purpose |
|---|---|---|---|
| A: fixed trade-off | `fixed`: `lambda = (lambdaMin + lambdaMax) / 2 = 0.575` everywhere | 0.1 | control |
| B: adaptive trade-off | `adaptive`: `lambda(d)` | 0.1 | the proposed model |
| C: no accumulated-harm penalty | `adaptive` | 0 | `h` is still tracked but costs nothing |

A against B tests the adaptive harm-sensitivity assumption with everything else equal. B against C shows what the ongoing cost of accumulated harm does.

## Experiments and their output

`npm run hrl:compare` trains each model with 20 seeds for 1,500 episodes and then runs 5 greedy episodes (exploration off, no learning) per trained agent. It writes to `results/compare/`:

| File | Content |
|---|---|
| `evaluation_by_seed.csv` | one row per model and seed: every evaluation metric |
| `evaluation_summary.csv` | mean and standard deviation over seeds of every metric |
| `training_curves.csv`, `training_reward.svg`, `training_drugs.svg` | reward and drug interactions per training episode (exploration on) |
| `trace_<model>.csv`, `trajectories.svg` | every step of one evaluation episode, with `d`, `h` and each reward component |
| `choices_by_d.svg` | which sources are used while `d` is low (below 40), intermediate, or high (above 60) |
| `model_comparison.svg` | interactions with each source, per model |
| `config.json` | the exact configuration used |

`npm run hrl:sensitivity` repeats that for seven conditions and writes `results/sensitivity/`: drift 0 and 0.2, each from a start at 50 and at 20, and three stronger drifts (1, 2, 3) that are exploratory additions to see how much pressure it takes before the models differ.

`npm run hrl:train` writes one trained agent to `results/train-<model>/` (`policy.bin` is its Q-table, `training.csv` has every training episode), and `npm run hrl:evaluate` re-runs a saved policy greedily. A policy can be evaluated under other settings with `--set`, but states it never saw in training have all-zero values, where it acts at random.

### Reading the metrics

Per episode: `totalReward`, `length`, interactions per source (`n_food`, …), `drugInteractions`, `ordinaryInteractions`, the shares of steps spent moving, on ordinary sources and on drugs, the mean, final and minimum `d`, the mean and final `h`, the mean harm weight, and the summed reward components (`sum_sourceReward`, `sum_stateBenefit`, `sum_acuteHarmCost`, `sum_accumulatedHarmCost`, `sum_stepCost`). Columns ending in `_lowD`, `_midD`, `_highD` count interactions by the level of `d` just before them, and `steps_lowD` etc. say how long the agent spent at each level.

Things to keep in mind:

- **Reward is not a measure of realism.** The models have different reward functions, so a higher total says nothing about which is the better model. What bears on the hypothesis is how often and when drugs are chosen, what they replace, and how `d` and `h` move.
- **Look at the spread over seeds.** Trained agents usually settle on working a single source for the whole episode, so a per-seed count is typically either 0 or about 111 (one use every three steps). A mean of 11 over ten seeds means "one seed in ten", not "a little, every time". `evaluation_by_seed.csv` shows this directly, and the error bars in the plots are standard deviations over seeds.
- **Training curves include exploration**, evaluation numbers do not.

## Results of the included runs

These are the numbers from the runs saved under `results/`, produced by the commands above with their defaults (20 seeds, 1,500 training episodes, 5 greedy evaluation episodes of 338 steps). Drug interactions are per evaluation episode, mean ± standard deviation over seeds; the last number is how many of the 20 trained agents used a drug at all.

| Condition | A: fixed | B: adaptive | C: no accumulated-harm penalty |
|---|---|---|---|
| Base (drift 0, start 50) | 0.1 ± 0.5 (1) | 0 ± 0 (0) | 8.3 ± 27.0 (2) |
| Drift 0.2 | 0.3 ± 1.0 (2) | 0.4 ± 0.8 (5) | 16.7 ± 40.7 (3) |
| Start at d = 20 | 1.1 ± 1.8 (6) | 0.8 ± 1.4 (6) | 32.9 ± 51.5 (6) |
| Drift 0.2, start at d = 20 | 0.9 ± 1.8 (4) | 0.9 ± 1.4 (6) | 27.4 ± 48.6 (5) |
| Drift 1 (exploratory) | 0 (0) | 0 (0) | 0 (0) |
| Drift 2 (exploratory) | 0 (0) | 0 (0) | 32.7 ± 22.5 (14) |
| Drift 3 (exploratory) | 1.9 ± 8.5 (1) | 19.7 ± 18.3 (11) | 47.9 ± 23.6 (17) |

What these runs show, for these parameter values:

- **In the base configuration the adaptive and fixed models do not differ, and neither seeks drugs.** Both spend the episode on ordinary sources, which hold `d` around 86 on average. `d` never goes below 50, so the low end of `lambda(d)` is never reached; the adaptive model's average harm weight is 0.97 against the fixed model's 0.575, which makes it the *more* harm-averse of the two here.
- **A drift of 0.2 or a start at `d = 20` does not separate them either.** A drift of 0.2 only lowers the resting level to 45, and from a start at 20 the agent is below 40 for about 10 of 338 steps. In that window a handful of agents take a drug once or twice, equally often under A and B.
- **The two models part ways only under strong, sustained depletion.** With a drift of 3, `d` stays below 40 for practically the whole episode (mean about 20). The adaptive model's harm weight is then about 0.19, and 11 of 20 adaptive agents use Drug A regularly against 1 of 20 fixed agents. This is the regime in which the adaptive-sensitivity assumption changes source selection. The drifts of 1 to 3 were added to find that regime; they are far larger than the 0.2 the experiment was planned with.
- **Accumulated harm is what holds drug use back.** Without its ongoing cost (C), drug use appears in every condition but drift 1, and in most agents once the drift reaches 2.
- **Drug B is almost never chosen**, in any model or condition. Where drugs are used, it is the moderate one.

Two caveats on reading these:

- **Seed-to-seed variation is large**, and part of it is incomplete learning rather than behaviour. Which ordinary source an agent settles on differs between seeds, and Rest (the least rewarding) is often the one, so the exploration settings leave many agents in a local optimum. As a check, `npm run hrl:compare -- --set epsilonStart=1 --set epsilonDecay=0.998 --set epsilonMin=0.1 --episodes 3000 --out results/compare-more-exploration` repeats the base comparison with much more exploration: drug use is then zero in all 60 agents, including model C. The drug use of C in the base row above is therefore better read as a few agents stuck on a drug than as a preference. The same check has not been run for the drift conditions.
- These are 20 seeds of one parameter set and one maze. They say when the adaptive assumption matters in this model, not whether the assumption is true.

## What is in the model, and what is not

Included: a single dopamine-related state with passive recovery and optional constant drift; optionally, a drug-induced lowering of its resting level and a refractory period on sources; accumulated harm with gradual decay; immediate source rewards; a state-dependent benefit; acute and accumulated harm costs weighted by a fixed or state-dependent sensitivity.

Deliberately left out of this version: tolerance (a drug's effect does not shrink with use), any opponent process beyond the lowered resting level, receptor sensitisation, a rebound of `d` caused by harm, separate hunger, fatigue or social-need variables, function approximation, and fitting to data. The dynamics, the reward and the sources are separate modules so that these can be added later.

## Limitations

- All parameters are illustrative and the conclusions above hold for these values only.
- Nothing limits the ordinary sources. They never run out and cost nothing, so an agent can keep `d` far above the target indefinitely, which is why low-`d` states are rare unless they are imposed.
- The exploration settings (ε-greedy, after a first walk to every cell) are enough to find a workable policy but not a reliably optimal one: which source a trained agent settles on varies with the seed. Differences between models should be judged against that seed-to-seed variation.
- Binning `d` and `h` in steps of 10 hides differences inside a bin from the agent.
- The layout matters. Sources are equidistant from the start but not from each other, and travelling costs steps.
- The dependence mechanisms have only been examined on the page's simulation, in the 16-seed check described above, with one set of values (`rhoA`, the deficit gains and the refractory period were chosen by trying a few). The command-line experiments reset the internal states every episode, so they cannot show a dependence that outlasts an episode.
- With the dependence mechanisms on, which regime an agent ends up in depends heavily on the seed, and forced doses tip only a minority of agents into lasting dependence.
- On the page, arrows and shading are only drawn for internal states the agent has actually been in; right after `d` or `h` crosses into a new bin they can be missing.

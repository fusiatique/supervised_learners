# A minimal homeostatic RL model of dependence

How an agent learning from reward can become dependent on a drug: two internal states, three actions, no maze. Dependence forms through one mechanism, a drug-induced drop in the baseline the agent's internal level returns to.

> **What this model is and is not.** It is a computational hypothesis, not a validated account of dopamine physiology or of clinical addiction. All states are abstract simulation units, every parameter value is illustrative rather than measured, and the results depend on those values.

## Running it

(No need to read this, technical specifications)

Requires Node.js 22 or newer and no dependencies.

| What | Command |
|---|---|
| Interactive page | serve the folder (for example `npx serve .` or `python -m http.server`) and open `index.html` (`tutorial.html` walks through it) |
| All experiments | `npm run minimal` (writes CSVs and SVG figures to `results/minimal/`, about 20 s) |
| One experiment | `node scripts/minimal.js doses` (or `acquisition`, `compulsion`, `relapse`, `policy`) |
| Tests | `npm test` |

Options: `--seeds 20`, `--out <directory>`, and `--set key=value` for any parameter in `js/model.js`, e.g. `node scripts/minimal.js doses --set rho=0.002`.

## The model

Two internal states:

- `H`, the internal level the agent cares about (0 to 100). It wants `H` at the **setpoint** `S = 50`.
- `B`, the **baseline** `H` relaxes towards when the agent does nothing. It starts at, and heals back to, `B0 = 40`.

Each step the agent chooses one of three actions: **nothing**, **natural reward** (`H` + 2) or **drug** (`H` + 25).

```
H' = H + gain + k·(B − H)                    k = 0.1     H relaxes 10% of the way to B
B' = B − δ·[drug] + ρ·(B0 − B)               δ = 1, ρ = 0.001   each use lowers B; it heals slowly (half-life ~700 steps)
D(H) = (S − H)² / S                                      drive: how far H is from the setpoint
r  = D(H) − D(H') + (R0 − c)·[drug]          R0 = 2, c = 1      drive reduction, plus drug pleasure minus harm
```

The reward is the drive reduction of homeostatic reinforcement learning (Keramati & Gutkin, 2014): moving `H` towards the setpoint is rewarded and moving it away is punished, in either direction. So a drug that overshoots the setpoint is unpleasant for an agent that is already content.

**The tipping point.** If the agent took the natural reward every step, `H` would settle at `B + naturalGain / k = B + 20`. While `B` is above `S − naturalGain / k = 30`, natural rewards can hold `H` at the setpoint. Below it they cannot, and only the drug can lift `H` that far. Each drug use pushes `B` further down, so once an agent is below the tipping point and using the drug, it tends to stay there: dependence feeds itself.

| Situation | Nothing | Natural | Drug |
|---|---:|---:|---:|
| Healthy, `H = 50`, `B = 40` | −0.02 | −0.02 | **−10.5** (overshoot) |
| Withdrawal, `H = 20`, `B = 0` | −2.5 | 0.0 | **+18.0** |

**Learning.** Tabular Q-learning (`α = 0.1`, `γ = 0.9`) over `(H, B)` in bins of 10 and 5: 80 states × 3 actions. The agent lives one continuing life with no episodes, so a lowered `B` carries over. ε decays per step from 0.3 to 0.02. The experiments give every agent a drug-free "childhood" of 20,000 steps, in which it learns to use natural rewards, before the drug becomes available; otherwise the heavy random exploration at the start would decide the outcome.

An agent counts as **dependent** when it chooses the drug on at least 5% of the steps in the last 1,000. Clean agents take it only while exploring, about 1% of steps.

(No need to read each files)

| File | Purpose |
|---|---|
| `js/model.js` | Parameters and the four equations |
| `js/agent.js` | Q-learning over binned `(H, B)` |
| `js/life.js` | One agent's continuing life, stepped one step at a time, with forced doses |
| `js/experiments.js` | The experiments below |
| `js/page.js`, `index.html` | The interactive page |
| `tutorial.html` | Step-by-step tutorial for the page |
| `js/environmentView.js` | The page's environment panel: the agent walking between the three actions, their learned values, and a meter of `H` |
| `js/rng.js`, `js/theme.js` | Seeded random numbers; colours and canvas helpers for the page |
| `scripts/minimal.js` | Command line, CSVs and figures |

## Results

From `npm run minimal` with the defaults, 20 agents (seeds) per condition.

**1. Acquisition.** With the drug available and nothing forced, **2 of 20** agents become dependent through their own exploration. The others take it only at exploration's ~1% rate, which holds their `B` around 33, just above the tipping point.

**2. Forced doses.** Doses given at step 40,000, dependent agents at step 80,000:

| Doses | 0 | 5 | 10 | 15 | 20 | 30 |
|---|---:|---:|---:|---:|---:|---:|
| Drug lowers `B` | 2 | 3 | 7 | 19 | 20 | 20 |
| Control, `δ = 0` | 0 | 0 | 0 | 0 | 0 | 0 |

Twenty doses take `B` from 40 to about 20, well below the tipping point, and every agent becomes dependent. In the control the drug cannot lower `B`, and no agent becomes dependent, not even the two from experiment 1. The baseline drop is the whole mechanism.

**3. Compulsion.** At step 50,000 the drug's harm cost `c` is raised. Dependent agents, out of 20:

| `c` | 1 | 3 | 6 | 10 | 15 |
|---|---:|---:|---:|---:|---:|
| Not dosed | 2 | 2 | 2 | 2 | 0 |
| Dosed (20 doses at step 40,000) | 20 | 20 | 20 | 7 | 0 |

Already-dependent agents keep using the drug at costs that would deter a clean agent from starting: in separate acquisition runs with `c` = 3, 6 or 10 from the start, none of 20 agents became dependent. (The 2 "not dosed" agents had already become dependent on their own before the cost rose.) Above a cost of about 10 to 15, withdrawal relief no longer outweighs the harm, and they quit.

**4. Relapse.** Dependent agents (20 doses) lose access to the drug, then get it back:

| Steps of abstinence | 0 | 250 | 500 | 1,000 | 2,000 | 5,000 |
|---|---:|---:|---:|---:|---:|---:|
| Mean `B` when the drug returns | 0 | 9 | 16 | 25 | 35 | 40 |
| Relapsed, of 20 | 20 | 20 | 17 | 0 | 0 | 0 |

Agents relapse when the drug returns before `B` has healed and recover when it has. Once `B` is back, a former user behaves exactly like an agent that never used: a sudden drop in `H` (a "stressor") after long abstinence had the same effect on both. The model therefore has **no lasting relapse vulnerability**, because the only trace of past use is `B`, and `B` heals. Real addiction leaves longer-lasting traces, such as drug-associated cues and changes to learning itself; adding one, for example Redish's (2004) drug-driven learning signal, would be the natural next step.

**5. Policy.** `policy.svg` shows the agent's preferred action in each `(H, B)` state for a clean and a dosed agent. The dosed agent lives at `B` near 0 and chooses the drug whenever `H` falls into the 30s.

## Limitations

- All parameter values were chosen by hand so that the arithmetic is easy to follow and the tipping point lies inside the range `B` moves in. The qualitative results follow from the tipping point. How many agents cross it on their own depends on the exploration settings and `ρ`.
- A first version with a smaller range (`B0 = 20`, natural gain 4) produced no dependence at all: at `B = 0` natural rewards still reached `H = 40`, and the remaining drive was too small to matter. Dependence needs the baseline to be able to fall well below the tipping point.
- With 20 seeds per condition, counts like 2 of 20 are rough.


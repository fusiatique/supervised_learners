# Storyboard — "Hacking the Reward Learner"
*From dopamine to Homeostatic Reinforcement Learning (HRL)*

Format: a full-screen, scene-based web animation. Each **scene** has a visual **stage**
(where the animation lives) and a **narration** panel. Within a scene, content advances in
**beats** (→ / space / click); after the last beat, the next scene transitions in.

Recurring visual language (keeps the story coherent across biology ↔ math):

| Motif | Meaning | Colour token |
|---|---|---|
| Glowing particles flowing along a path | Dopamine release / signal | `--c-dopamine` (amber) |
| Blue gauge with a set-point notch | Internal state `H` vs set-point `H*` | `--c-homeo` (teal) |
| Red pulses / cracks | Harm, adverse consequences | `--c-harm` (red) |
| Violet nodes and edges | RL agent / value / computation | `--c-model` (violet) |
| A small "agent" glyph (circle + eye) | The learner — appears in every section | — |

The same agent glyph and the same sagittal brain outline are re-used throughout, so the
viewer sees the *same* system being described first biologically, then computationally.

---

## 0 · Title
- **Stage:** Dark field; a single dopamine particle drifts in, splits into a network that resolves into a brain outline.
- **Text:** Title, subtitle, author. "Press → to begin".

## 1 · Introduction — Addiction as a hacked learning system
**1.1 Hook**
- **Stage:** The agent glyph pressing a lever → small reward glow → learns. Then a "drug" pellet: glow is oversized, the learning arrow saturates, the lever becomes all it sees.
- **Beats:** (1) Learning normally improves behaviour. (2) Drugs act directly on the teaching signal. (3) "What if addiction is learning working *too well* on the wrong signal?"

**1.2 Roadmap**
- **Stage:** Chapter map: Biology → RL → HRL → Harm → Mapping → Limits.
- **Beat:** Each chapter node lights up in sequence.

**1.3 Human vs computer — 42-second Remotion sequence**
- **0–9 s:** Human draws in, considers uncertain branching routes, shrugs, and makes a workable choice.
- **9–21 s:** Split screen introduces conventional programmed computation. Incomplete instructions cause a warning; an explicit IF/ELSE resolves it.
- **21–32 s:** A brain and processor draw in and exchange signals, showing how neuroscience can inspire computational models.
- **32–42 s:** Both move upward; “HOW DO WE LEARN TO MAKE DECISIONS?” and Action → Outcome → Learning form the final composition, held for one second.
- **Attribution:** “Bellman, 1966” remains at the lower left after its first-second fade-in. No quotation or audio.
- **Implementation:** `remotion/src/Scene01_HumanVsComputer.tsx`; embedded player in `scene01.html`. See `remotion/README.md` for editing and MP4 export.

## 2 · Biological processes
**2a Risk & decision making — learning through consequences**
- **Stage:** Agent at a fork: path A (small, certain reward), path B (larger, risky reward / occasional penalty). Repeated trials; choice frequency bar shifts as consequences accumulate.
- **Beats:** options → outcomes → updated preference → "behaviour is shaped by consequences".

**Standalone Scene 02 — Risk, learning, and addiction (23 seconds)**
- **Page:** `scene02.html`; Remotion composition: `Scene02-RiskAndAddiction`.
- **0–7 s:** The closing learning loop from Scene 01 gives way to a persistent crossroads. An uncertain mystery-box choice reveals an undesirable outcome.
- **7–15 s:** The character returns, remembers the warning, and chooses the safer apple.
- **15–23 s:** The same box becomes a capsule. Despite the remembered warning, the character approaches it; no consumption is shown. End on “LEARNING CAN BECOME MALADAPTIVE.”
- **Sources:** Yates & Stone, 1992 → Piantadosi et al., 2021 around 15 seconds.
- **Handoff:** The final second holds still. `RiskAndAddictionArtwork` at frame 660 is reusable for Scene 03. See `remotion/SCENE02.md`.

**Scene 03 — Addiction and reward learning (56 seconds)**
- **Presentation:** immediately after Scene 02; direct preview `scene03.html`.
- **0–8 s:** Repeated drug-associated approaches despite visible harm, continuing the same crossroads.
- **8–16 s:** An initially rewarding outcome and its association introduce positive reinforcement.
- **16–27 s:** Repeated choices strengthen the conceptual association; the environment becomes a learning diagram.
- **27–33 s:** Warnings remain as the association receives emphasis. Hold “REWARD LEARNING GONE TOO FAR” through the 33-second boundary.
- **33–46 s:** Bell-cued apple trials show changing anticipation, then form Cue → Action → Reward.
- **46–56 s:** Compare natural and drug-associated conceptual signals; transition to particles around a faint, forming neuron.
- **Source:** Feltenstein et al., 2009 around 12–30 seconds. See `remotion/SCENE03.md` for timing and rendering.

**Scene 04 — Mesocorticolimbic introduction (30 seconds)**
- **Presentation:** immediately after Scene 03; direct preview `scene04.html`.
- **0–7 s:** Continue the particle/neuron handoff into a right-facing head, reveal a medial brain cutaway, and zoom to the full brain.
- **7–15 s:** Highlight VTA in the ventral midbrain, then draw simplified projections to NAc and anterior PFC. Introduce the mesocorticolimbic dopamine system.
- **15–21 s:** Emphasize mesolimbic activity and reward-related learning/motivation while retaining the rest of the brain.
- **21–30 s:** Natural-reward icons and the capsule send conceptual pulses toward shared circuitry. End with the full brain visible and a subtle VTA-centered zoom.
- **Sources:** Piantadosi et al., 2021 → Feltenstein et al., 2009 near 20 seconds.
- **Reusable anatomy:** `remotion/src/BrainAnatomy.tsx`; coordinate references and Scene 05 handoff in `remotion/SCENE04.md`.

**Scene 05 — Dopamine reward prediction errors (80 seconds)**
- **Presentation:** immediately after Scene 04; direct preview `scene05.html`.
- **0–20 s:** Continue the VTA camera movement, reveal a heterogeneous neuronal inset, then trace the established VTA → NAc pathway.
- **20–40 s:** Contrast background and burst firing, then introduce conceptual expected/actual reward bars and the simple prediction-error relationship.
- **40–60 s:** Food-delivery trials transfer a burst from unexpected food to a learned bell cue; omitted food produces a firing pause.
- **60–69 s:** Show expectation updating, a computational analogy, and explicitly schematic rodent stimulation/inhibition conditions.
- **69–80 s:** Return to the same brain, add blue PFC/vHPC/BLA inputs to NAc, and update a conceptual motivational-value indicator. Hold the final second for Scene 06.
- **Sources and validation:** `remotion/SCENE05.md`; deterministic timing checks align bursts and pauses with cue/reward events.

**2b Addiction & reward learning — definition**
- **Stage:** Timeline from *recreational use* → *regular use* → *compulsive use*; goal-directed arrows thinning while a habit loop thickens.
- **Text:** Addiction = chronic, relapsing disorder characterised by compulsive drug seeking/use **despite adverse consequences**. Key features: escalation, tolerance, craving, relapse.

**2c Dopamine & the mesocorticolimbic system**
- **Stage:** Sagittal brain. VTA lights up; dopamine projections draw in one by one: mesolimbic (VTA → NAc), mesocortical (VTA → PFC). (Nigrostriatal SNc → dorsal striatum shown faintly for context.)
- **Beats:** neuron → synapse (DA release, reuptake via DAT) → pathways.

**2d VTA, nucleus accumbens & reward prediction errors (mesolimbic)**
- **Stage:** Three stacked spike-raster panels (Schultz-style):
  1. Unexpected reward → burst at reward.
  2. Learned cue → burst moves to cue, none at reward.
  3. Cue, reward omitted → dip at expected time.
- **Then:** Drug panel — DA rises regardless of prediction (pharmacological, non-compensable surge).
- **Key line:** δ = actual − expected.

**2e Mesocortical pathway & prefrontal cortex**
- **Stage:** PFC (OFC, ACC, dlPFC) sending top-down "brake" arrows to striatum. In the addicted state, brake arrows dim (hypofrontality), striatal loop brightens.
- **Text:** Valuation, inhibitory control, goal maintenance; impaired control in addiction.

## 3 · Reinforcement learning
**3.1 The agent–environment loop**
- **Stage:** Classic loop diagram: state *s* → action *a* → reward *r*, next state *s′*. The agent glyph from Ch.1 becomes the RL agent.

**3.2 The Bellman equation**
- **Stage:** Grid world; values propagate backward from the goal as colour wash.
- **Equation:** `V(s) = max_a [ R(s,a) + γ Σ_{s′} P(s′|s,a) V(s′) ]`

**3.3 Q-learning & the TD error**
- **Stage:** Q-table cells updating; the TD error δ is drawn as the *same amber pulse* used for dopamine in 2d.
- **Equation:** `Q(s,a) ← Q(s,a) + α [ r + γ max_{a′} Q(s′,a′) − Q(s,a) ]`
- **Beat:** Side-by-side: δ ↔ dopamine RPE.

**3.4 Limitation for addiction**
- **Stage:** Redish (2004)-style drug model: `δ = max(r + γV(s′) − V(s) + D, D)` → value of drug-taking grows without bound (graph climbs forever).
- **Problems:** reward is an external, fixed scalar; no internal state; can't explain satiation, tolerance, escalation of intake, or dose-dependence; unbounded value conflicts with behavioural evidence (e.g. blocking still observed with cocaine).

> *(Section 4 is not used — numbering follows the original outline.)*

## 5 · Homeostatic reinforcement learning (Keramati & Gutkin, 2014)
**5.1 Internal state & set-point**
- **Stage:** Gauge for internal state `H` with set-point `H*`; distance from set-point = drive.
- **Equation:** `D(H) = ( Σ_i |h*_i − h_i|^n )^{1/m}`

**5.2 Reward = drive reduction**
- **Stage:** Outcome `K` moves `H` towards `H*`; reward is the size of the drop in drive. Same outcome is rewarding when deprived, neutral/aversive when sated.
- **Equation:** `r(H_t, K_t) = D(H_t) − D(H_t + K_t)`
- **Beat:** Theorem highlight — maximising this reward ≡ minimising deviation from set-point (reward seeking and homeostasis align).

**5.3 Drugs in HRL (Keramati et al., 2017)**
- **Stage:** Repeated drug intake shifts the set-point (allostasis / tolerance); the gauge's notch drifts; the same dose gives less reward; intake escalates to compensate.

## 6 · Adding harm to the model
- **6.1 Formulation:** `r_t = [D(H_t) − D(H_t + K_t)] − λ · harm_t` — harm as an internal-state cost, possibly delayed.
- **6.2 Temporal mismatch:** Animated timeline — reward arrives immediately, harm arrives later and is discounted by γᵏ; harm signal shrinks with distance.
- **6.3 Simulation:** Two agents (low vs high λ, or low vs high γ) — choice curves diverge; "compulsive use despite consequences" emerges when harm is under-weighted.

## 7 · Relating the model to biology
- **Stage:** The sagittal brain from Ch.2 returns; model terms fly in and dock on regions:
  - δ (TD/RPE) → VTA dopamine
  - Q(s,a), action values → striatum / NAc
  - Internal state H, drive D → hypothalamus, insula (interoception)
  - Harm / negative outcomes → lateral habenula, amygdala
  - Goal-directed valuation, λ (harm weighting), control → PFC (OFC/ACC/dlPFC)

## 8 · Limitations of the HRL model
- **Stage:** Two columns that fill in: ✓ *What it captures* / ✗ *What it misses*.
  - ✓ Satiation & dose-dependence; tolerance/escalation via set-point shift; bounded values; unifies homeostasis and reward.
  - ✗ Cue-induced craving & relapse; habit (model-free vs model-based) transitions; individual vulnerability & genetics; social/environmental context; harm weighting λ is a free parameter; set-point dynamics hand-specified.

## 9 · Conclusion
- **Stage:** The brain outline and the RL loop overlay into one image; the agent glyph returns to balance on the set-point gauge.
- **Take-aways:** (1) Addiction exploits the reward-learning machinery. (2) Standard RL misses internal state. (3) HRL grounds reward in homeostasis. (4) Adding harm helps explain use despite consequences.
- **References** panel.

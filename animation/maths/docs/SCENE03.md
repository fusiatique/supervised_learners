# Maths 03 — A random policy, and why it cannot learn

Open `animation/index.html` in Live Server. Maths 03 follows Maths 02 in chapter 3; its direct link is `#maths-random-policy`. `animation/maths/html/scene03.html` also provides standalone playback.

23 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene03_random_policy.py Scene03RandomPolicy   # quick preview
./render.sh scenes/scene03_random_policy.py Scene03RandomPolicy scene03-random-policy
```

## Narration cues

Start reading at 0:00. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "But how does the agent actually move?" | Opens on Maths 02's last frame; the transition rules fade. The arrows step aside, the agent puts out its arms and shrugs twice (¯\\_ _/¯), and a "?" pops up above its head. |
| 0:02.5 | "We give it a rule, the simplest being: choose a random action from a uniform distribution." | The shrug and "?" go and the arrows return. "policy" appears on "rule" (0:03); π(a ∣ s) writes in on "random action" (0:04.5) with the caption "chance of choosing action a in state s", then = 1/∣A∣; = 1/4 on "uniform distribution" (0:07). |
| 0:07.5 | "This means, each action is equally likely." | A ¼ flies from the equation to each of the four arrows and stays beside it. The policy then settles into a "current policy" box in the bottom-right corner (0:09.5–0:10.5). |
| 0:10.5 | *(no narration)* | Two random steps, each chosen arrow lighting first: s6 → s9 → s8. |
| 0:12 | "But there is no learning here, even if there was a reward somewhere." | On "a reward somewhere" (0:15) an amber star drops and bounces into s7, right next to the agent. |
| 0:16.5 | "Nothing gives the agent an incentive to choose one action over another." | The four ¼s pulse: even beside the reward, every action is equally likely. The agent wanders up and back, stumbles onto the reward by chance (a burst, ≈0:19.5), and wanders off again. |
| 0:20.5 | "So how can we give it a better policy?" | On "better policy" (0:21.5) the screen dims and a huge "?" springs up. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene03_random_policy.py`.

## Implementation

- The opening frame is rebuilt from the shared helpers in `common/transitions.py` (`general_rule`, `rule_heading`, `stream_rows`, `place_rows(rows, STREAM_END)`, `stream_dots`), which Maths 02 also uses, so the two scenes join exactly.
- The shrug uses `Agent.make_hands()` and `Agent.shrug(hands)`, shared for later scenes.
- The ¼ labels are added to `GridStage.riders`, so they travel with the agent and its arrows on every move and bump.
- `common/reward.py`: `Reward`, an amber star with `drop_into(point)` (bounce in from above) and `collect()` (a burst).
- `common/policy.py`: `PolicyBox(tex)`, the "current policy" box at `POLICY_POS`, with `swap(tex)` for when the policy changes in Maths 04.
- The "random" walk is scripted (`BEFORE_REWARD`, `AFTER_REWARD`) so the story reads clearly: the agent sits next to the reward without caring, reaches it only by chance, and leaves.

## Handoff

Ends on a dimmed frame (agent at s8, reward at s7, the ¼ labels and the policy box underneath) with a large "?" in the centre. Maths 04 starts by turning the "?" into "Reward function".

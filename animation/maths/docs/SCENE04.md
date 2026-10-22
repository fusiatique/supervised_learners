# Maths 04 — The reward function, and a first greedy policy

Open `animation/index.html` in Live Server. Maths 04 follows Maths 03 in chapter 3; its direct link is `#maths-reward-function`. `animation/maths/html/scene04.html` also provides standalone playback.

41 seconds · 1920 × 1080 · 60 FPS · silent (narration is read over it).

From `animation/maths/manim`:

```sh
uv run manim -pql scenes/scene04_reward_function.py Scene04RewardFunction   # quick preview
./render.sh scenes/scene04_reward_function.py Scene04RewardFunction scene04-reward-function
```

## Narration cues

Start reading at 0:00. Timings assume about 165 words per minute.

| Time | Say | On screen |
| --- | --- | --- |
| 0:00 | "We need a way for the agent to know which state is good." | Opens on Maths 03's last frame. The dimming lifts and the big "?" shrinks into the right-hand column. |
| 0:04 | "For now, this is the reward function." | The "?" turns into "reward function" (amber) on those words (0:05). |
| 0:06.5 | "The idea is simple." | Hold. |
| 0:08 | "If reward x exists in state sx, the reward is the value of the reward x." | A second reward drops into s3 (0:07.5); the reward values 10 (s7) and 5 (s3) appear in their cells' corners; R(s) = x if a reward x is in s, 0 otherwise writes in under the title (0:10.5). |
| 0:13 | "That's our reward function." | Every other cell gets its R(s) = 0. |
| 0:14.5 | "Now, we can add our first bit of intelligence: take the action that leads to the highest reward state." | The reward function moves to the top. On "take the action…" (0:17.5) the rule writes in: π(s) = the action a with the highest R(f(s, a)). |
| 0:21 | "That's our agent's new 'policy'." | "new policy" appears above the rule. |
| 0:22.5 | "If no action leads to a higher value, it chooses randomly, like before." | "if tied: choose at random" appears under it; then (0:24.5) the whole rule shrinks into the agent's brain with a flash, the policy box swaps to π(s) = action with highest R(f(s, a)), and the ¼ labels go. |
| 0:27 | "Now if the agent is next to a reward state, it will go towards that!" | Beside each arrow, the reward of the state it leads to: 0, 0, 10, 0. On "go towards that" (0:29) the 10 and its arrow light amber; the agent steps onto the reward (a burst) and smiles. |
| 0:31.5 | "Now we can make the environment bigger…" | The 3 × 3 grid fades; the agent shrinks into the start cell (s21) of a 5 × 5 grid; rewards drop into s9 (10) and s18 (5); every cell gets its R(s); the arrows return. |
| 0:35 | "…and reset the agent to the start state whenever it reaches a 'reward state'." | One episode under the greedy policy: random while every neighbour is 0 (s21 → s16 → s11 → s12 → s17), then straight onto the 5 (amber arrow, burst, 0:39). The agent fades out and reappears at the start, which pulses. |

Each gap is a `self.wait(...)` under a comment quoting its narration line in `scene04_reward_function.py`.

## Implementation

- `GridStage(s, rows, cols, cell)` now builds any grid size; moves shift the agent by its own offset, so asymmetric riders (like the reward labels) no longer pull it off-centre.
- `GridStage.arrow_labels(texts, colors)` places a label beside each arrow; Maths 03's ¼s use it too.
- `common/reward.py`: `reward_values(grid, rewards)` writes R(s) in each cell's corner (amber for a reward, faint for 0).
- `PolicyBox.swap(tex, font_size)` now resizes the frame, and the box's text is layered above its frame so animating the frame never hides it.
- The greedy rule is written in words rather than with arg max, which the script introduces later (policy improvement).
- The 5 × 5 episode is scripted: every step before the last is a genuine tie, so any order would be a valid random choice. It ends on the nearby 5, not the 10, which sets up Maths 05 (rewards several steps away).

## Handoff

Ends with the agent back at the start (s21) of the 5 × 5 grid, arrows idle, rewards at s9 (10) and s18 (5), R(s) in every cell, the reward function at the top right and the greedy policy in the box.

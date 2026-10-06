// The agent's internal "reward state": a level that jumps by an item's value
// when the item is consumed and leaks back towards zero on every step.
// This is the place to add a maintenance threshold, tolerance, harm, etc.
export class RewardState {
  constructor(params) {
    this.params = params;
    this.level = 0;
  }

  update(consumedValue) {
    this.level = this.level * (1 - this.params.rewardDecay) + consumedValue;
    return this.level;
  }
}

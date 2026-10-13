(() => {
  // js/config.js
  var PARAMS = [
    { key: "alpha", group: "Agent", label: "Learning rate (\u03B1)", min: 0.01, max: 1, step: 0.01, value: 0.5 },
    { key: "gamma", group: "Agent", label: "Discount factor (\u03B3)", min: 0.5, max: 0.99, step: 0.01, value: 0.98 },
    { key: "epsilonStart", group: "Agent", label: "Initial exploration (\u03B5)", min: 0, max: 1, step: 0.01, value: 0.3 },
    { key: "epsilonDecay", group: "Agent", label: "\u03B5 decay per episode", min: 0.9, max: 1, step: 1e-3, value: 0.985 },
    { key: "epsilonMin", group: "Agent", label: "Minimum \u03B5", min: 0, max: 0.5, step: 0.01, value: 0.05 },
    { key: "stepCost", group: "Environment", label: "Cost per step", min: 0, max: 0.5, step: 0.01, value: 0.02 },
    { key: "rewardDecay", group: "Environment", label: "Reward state decay", min: 0, max: 0.2, step: 5e-3, value: 0.02 }
  ];
  var RECENT_EPISODES = 50;
  function defaultParams() {
    return Object.fromEntries(PARAMS.map((p) => [p.key, p.value]));
  }

  // js/mazes.js
  var MAZES = [
    { id: "medium", name: "Medium (13 \xD7 13)", cols: 13, rows: 13 }
  ];
  function getMaze(id) {
    return MAZES.find((m) => m.id === id) ?? MAZES[0];
  }
  function buildMaze({ cols, rows }) {
    const walls = new Uint8Array(cols * rows);
    const index = (x, y) => y * cols + x;
    for (let x = 0; x < cols; x++) {
      walls[index(x, 0)] = 1;
      walls[index(x, rows - 1)] = 1;
    }
    for (let y = 1; y < rows - 1; y++) {
      walls[index(0, y)] = 1;
      walls[index(cols - 1, y)] = 1;
    }
    return { cols, rows, walls, start: index(1, 1) };
  }

  // js/items.js
  var ITEM_TYPES = [
    { id: "low", name: "Low", value: 1, colorVar: "--item-1" },
    { id: "medium", name: "Medium", value: 3, colorVar: "--item-2" },
    { id: "high", name: "High", value: 6, colorVar: "--item-3" }
  ];
  function getItemType(id) {
    return ITEM_TYPES.find((t) => t.id === id) ?? null;
  }

  // js/environment.js
  var ACTIONS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }
  ];
  var Environment = class {
    constructor(mazeDef) {
      Object.assign(this, buildMaze(mazeDef));
      this.numStates = this.cols * this.rows;
      this.numActions = ACTIONS.length;
      this.items = /* @__PURE__ */ new Map();
      this.state = this.start;
    }
    isWall(cell) {
      return this.walls[cell] === 1;
    }
    setWall(cell, isWall) {
      if (!Number.isInteger(cell) || cell < 0 || cell >= this.numStates || cell === this.start) return false;
      const x = cell % this.cols;
      const y = Math.floor(cell / this.cols);
      if (x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1) return false;
      if (this.isWall(cell) === isWall) return false;
      this.walls[cell] = Number(isWall);
      if (isWall) this.items.delete(cell);
      return true;
    }
    isValidCell(cell) {
      return Number.isInteger(cell) && cell >= 0 && cell < this.numStates;
    }
    neighbor(cell, { dx, dy }) {
      const x = cell % this.cols + dx;
      const y = Math.floor(cell / this.cols) + dy;
      return x >= 0 && x < this.cols && y >= 0 && y < this.rows ? y * this.cols + x : null;
    }
    canAddWall(cell) {
      return this.isValidCell(cell) && !this.isWall(cell) && cell !== this.start && cell !== this.state && !this.items.has(cell);
    }
    addWall(cell) {
      if (!this.canAddWall(cell)) return false;
      this.walls[cell] = 1;
      return true;
    }
    removeWall(cell) {
      if (!this.isValidCell(cell) || !this.isWall(cell)) return false;
      this.walls[cell] = 0;
      return true;
    }
    moveWall(from, to) {
      if (!this.isValidCell(from) || !this.isWall(from) || !this.canAddWall(to)) return false;
      this.walls[from] = 0;
      this.walls[to] = 1;
      return true;
    }
    clearWalls() {
      this.walls.fill(0);
    }
    reset() {
      this.state = this.start;
      return this.state;
    }
    step(action) {
      const next = this.neighbor(this.state, ACTIONS[action]);
      if (next !== null && !this.isWall(next)) this.state = next;
      const item = getItemType(this.items.get(this.state));
      return { state: this.state, item, done: item !== null };
    }
    canHoldItem(cell) {
      return this.isValidCell(cell) && !this.isWall(cell) && cell !== this.start;
    }
    placeItem(cell, itemId) {
      if (this.canHoldItem(cell)) this.items.set(cell, itemId);
    }
    removeItem(cell) {
      this.items.delete(cell);
    }
    // Shortest-path length from `from` to every cell (Infinity if unreachable).
    distancesFrom(from) {
      const dist = new Array(this.numStates).fill(Infinity);
      dist[from] = 0;
      const queue = [from];
      for (let i = 0; i < queue.length; i++) {
        const cell = queue[i];
        for (const action of ACTIONS) {
          const next = this.neighbor(cell, action);
          if (next !== null && !this.isWall(next) && dist[next] === Infinity) {
            dist[next] = dist[cell] + 1;
            queue.push(next);
          }
        }
      }
      return dist;
    }
    isDeadEnd(cell) {
      const open = ACTIONS.filter((action) => {
        const next = this.neighbor(cell, action);
        return next !== null && !this.isWall(next);
      });
      return !this.isWall(cell) && open.length === 1;
    }
    // Spread one of each item type across the maze, far from the start and from
    // each other, with the most valuable item furthest from the start. Items go
    // in dead ends so that none of them blocks the way to another.
    placeDefaultItems(itemTypes) {
      this.items.clear();
      const fromStart = this.distancesFrom(this.start);
      const spread = [...fromStart];
      const cells = [];
      const pick = (allowed) => {
        let best = -1;
        for (let cell = 0; cell < this.numStates; cell++) {
          if (!this.canHoldItem(cell) || !allowed(cell) || cells.includes(cell)) continue;
          if (best === -1 || spread[cell] > spread[best]) best = cell;
        }
        return best;
      };
      for (let n = 0; n < itemTypes.length; n++) {
        let best = pick((cell) => this.isDeadEnd(cell));
        if (best === -1) best = pick(() => true);
        if (best === -1) break;
        cells.push(best);
        const fromBest = this.distancesFrom(best);
        for (let cell = 0; cell < this.numStates; cell++) spread[cell] = Math.min(spread[cell], fromBest[cell]);
      }
      cells.sort((a, b) => fromStart[a] - fromStart[b]);
      const byValue = [...itemTypes].sort((a, b) => a.value - b.value);
      cells.forEach((cell, i) => this.items.set(cell, byValue[i].id));
    }
  };

  // js/agents/qlearning.js
  var POLICY_STABILITY_EPISODES = 20;
  var QLearningAgent = class {
    constructor(env, params2) {
      this.params = params2;
      this.env = env;
      this.numActions = env.numActions;
      this.q = new Float64Array(env.numStates * env.numActions);
      this.visited = new Uint8Array(env.numStates);
      this.episodes = 0;
      this.policySnapshot = null;
      this.policyStableEpisodes = 0;
      this.policyConverged = false;
    }
    get epsilon() {
      const { epsilonStart, epsilonDecay, epsilonMin } = this.params;
      return Math.max(epsilonMin, epsilonStart * epsilonDecay ** this.episodes);
    }
    act(state) {
      this.visited[state] = 1;
      const coverageAction = this.actionTowardUnvisited(state);
      if (coverageAction !== null) return coverageAction;
      if (Math.random() < this.epsilon) return Math.floor(Math.random() * this.numActions);
      return this.bestAction(state);
    }
    learn(state, action, reward, nextState, done) {
      const { alpha, gamma } = this.params;
      const target = reward + (done ? 0 : gamma * this.stateValue(nextState));
      const i = state * this.numActions + action;
      this.q[i] += alpha * (target - this.q[i]);
      this.visited[state] = 1;
      this.visited[nextState] = 1;
      if (this.policyConverged && this.bestActionMask(state) !== this.policySnapshot[state]) {
        this.policyConverged = false;
      }
    }
    actionTowardUnvisited(state) {
      const firstAction = new Int8Array(this.visited.length).fill(-1);
      const queue = [state];
      this.visited[state] = 1;
      for (let i = 0; i < queue.length; i++) {
        const cell = queue[i];
        for (let action = 0; action < this.numActions; action++) {
          const next = this.env.neighbor(cell, ACTIONS[action]);
          if (next === null || this.env.isWall(next) || firstAction[next] !== -1 || next === state) continue;
          firstAction[next] = cell === state ? action : firstAction[cell];
          if (!this.visited[next]) return firstAction[next];
          queue.push(next);
        }
      }
      return null;
    }
    hasVisitedReachableCells() {
      const distances = this.env.distancesFrom(this.env.start);
      return distances.every((distance, cell) => distance === Infinity || this.visited[cell] === 1);
    }
    endEpisode() {
      this.episodes++;
      const policy = new Uint8Array(this.visited.length);
      for (let state = 0; state < policy.length; state++) policy[state] = this.bestActionMask(state);
      if (this.hasVisitedReachableCells() && this.policySnapshot && policy.every((actions, state) => actions === this.policySnapshot[state])) {
        this.policyStableEpisodes++;
      } else {
        this.policyStableEpisodes = 0;
      }
      this.policySnapshot = policy;
      this.policyConverged = this.hasVisitedReachableCells() && this.policyStableEpisodes >= POLICY_STABILITY_EPISODES;
    }
    bestActionMask(state) {
      return this.bestActions(state).reduce((mask, action) => mask | 1 << action, 0);
    }
    hasVisited(state) {
      return this.visited[state] === 1;
    }
    stateValue(state) {
      const base = state * this.numActions;
      let best = this.q[base];
      for (let a = 1; a < this.numActions; a++) best = Math.max(best, this.q[base + a]);
      return best;
    }
    bestActions(state) {
      const base = state * this.numActions;
      let bestValue = -Infinity;
      const best = [];
      for (let a = 0; a < this.numActions; a++) {
        const value = this.q[base + a];
        if (value > bestValue) {
          bestValue = value;
          best.length = 0;
          best.push(a);
        } else if (value === bestValue) {
          best.push(a);
        }
      }
      return best;
    }
    // Ties are broken at random for the agent's actual moves.
    bestAction(state) {
      const best = this.bestActions(state);
      return best[Math.floor(Math.random() * best.length)];
    }
    info() {
      return [["Exploration \u03B5", this.epsilon.toFixed(2)]];
    }
  };

  // js/agents/index.js
  var AGENTS = [
    { id: "qlearning", name: "Q-learning", create: (env, params2) => new QLearningAgent(env, params2) }
  ];
  function createAgent(id, env, params2) {
    const entry = AGENTS.find((a) => a.id === id) ?? AGENTS[0];
    return entry.create(env, params2);
  }

  // js/rewardState.js
  var RewardState = class {
    constructor(params2) {
      this.params = params2;
      this.level = 0;
    }
    update(consumedValue) {
      this.level = this.level * (1 - this.params.rewardDecay) + consumedValue;
      return this.level;
    }
  };

  // js/simulation.js
  var Series = class {
    constructor(maxPoints = 800) {
      this.maxPoints = maxPoints;
      this.points = [];
      this.stride = 1;
      this.sum = 0;
      this.count = 0;
    }
    add(x, y) {
      this.sum += y;
      if (++this.count < this.stride) return;
      this.points.push({ x, y: this.sum / this.count });
      this.sum = 0;
      this.count = 0;
      if (this.points.length >= this.maxPoints) {
        const merged = [];
        for (let i = 0; i + 1 < this.points.length; i += 2) {
          merged.push({ x: this.points[i + 1].x, y: (this.points[i].y + this.points[i + 1].y) / 2 });
        }
        this.points = merged;
        this.stride *= 2;
      }
    }
  };
  var Simulation = class {
    constructor(params2) {
      this.params = params2;
      this.agentId = AGENTS[0].id;
      this.setMaze(getMaze().id);
    }
    setMaze(mazeId) {
      this.mazeId = mazeId;
      this.env = new Environment(getMaze(mazeId));
      this.env.placeDefaultItems(ITEM_TYPES);
      this.maxEpisodeSteps = this.env.numStates * 2;
      this.resetLearning();
    }
    setAgent(agentId) {
      this.agentId = agentId;
      this.resetLearning();
    }
    // Forget everything learned; the maze and the placed items stay.
    resetLearning() {
      this.agent = createAgent(this.agentId, this.env, this.params);
      this.rewardState = new RewardState(this.params);
      this.history = new Series();
      this.steps = 0;
      this.episodes = 0;
      this.episodeSteps = 0;
      this.lastEpisodeSteps = null;
      this.outcomes = [];
      this.env.reset();
    }
    // The learning signal for one transition. Extend here for harm, withdrawal
    // penalties and the like.
    reward(outcome) {
      return (outcome.item ? outcome.item.value : 0) - this.params.stepCost;
    }
    step() {
      const state = this.env.state;
      const action = this.agent.act(state);
      const outcome = this.env.step(action);
      this.agent.learn(state, action, this.reward(outcome), outcome.state, outcome.done);
      this.steps++;
      this.episodeSteps++;
      this.rewardState.update(outcome.item ? outcome.item.value : 0);
      this.history.add(this.steps, this.rewardState.level);
      if (outcome.done || this.episodeSteps >= this.maxEpisodeSteps) {
        this.outcomes.push(outcome.item ? outcome.item.id : null);
        if (this.outcomes.length > RECENT_EPISODES) this.outcomes.shift();
        this.lastEpisodeSteps = this.episodeSteps;
        this.episodeSteps = 0;
        this.episodes++;
        this.agent.endEpisode();
        this.env.reset();
      }
    }
    // Map of item id (null = no item reached) -> number of recent episodes.
    recentChoices() {
      const counts = /* @__PURE__ */ new Map();
      for (const id of this.outcomes) counts.set(id, (counts.get(id) ?? 0) + 1);
      return counts;
    }
  };

  // js/ui/theme.js
  var cache = /* @__PURE__ */ new Map();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => cache.clear());
  function cssVar(name) {
    if (!cache.has(name)) {
      cache.set(name, getComputedStyle(document.documentElement).getPropertyValue(name).trim());
    }
    return cache.get(name);
  }
  var CANVAS_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  function prepareCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  // js/ui/mazeView.js
  var GLITCH_INTERVAL_MS = 250;
  function drawDirectionCone(ctx, cx, cy, size, { dx, dy }, slotX = 0, slotY = 0, scale = 1) {
    const centerX = cx + slotX * size;
    const centerY = cy + slotY * size;
    const length = size * 0.3 * scale;
    const halfWidth = size * 0.19 * scale;
    const tipX = centerX + dx * length / 2;
    const tipY = centerY + dy * length / 2;
    const baseX = centerX - dx * length / 2;
    const baseY = centerY - dy * length / 2;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(baseX - dy * halfWidth, baseY + dx * halfWidth);
    ctx.lineTo(baseX + dy * halfWidth, baseY - dx * halfWidth);
    ctx.closePath();
    ctx.fill();
  }
  var ARROW_SLOTS = [
    [0, -0.24],
    [0.24, 0],
    [0, 0.24],
    [-0.24, 0]
  ];
  var MazeView = class {
    constructor(canvas, { onCellClick, onCellDrag, onCellDragEnd }) {
      this.canvas = canvas;
      this.hoverCell = null;
      this.env = null;
      this.pointerDown = false;
      this.glitchPhase = -1;
      this.glitchActions = /* @__PURE__ */ new Map();
      this.wasPolicyConverged = false;
      this.onCellDrag = onCellDrag;
      this.onCellDragEnd = onCellDragEnd;
      this.selectedWall = null;
      this.editingWalls = false;
      canvas.addEventListener("click", (e) => {
        const cell = this.cellAt(e);
        if (cell !== null) onCellClick(cell);
      });
      canvas.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        this.pointerDown = true;
        canvas.setPointerCapture(e.pointerId);
        this.paintCell(e);
      });
      canvas.addEventListener("pointermove", (e) => {
        this.hoverCell = this.cellAt(e);
        if (this.pointerDown) this.paintCell(e);
      });
      const endPointer = () => {
        if (!this.pointerDown) return;
        this.pointerDown = false;
        this.onCellDragEnd();
      };
      canvas.addEventListener("pointerup", endPointer);
      canvas.addEventListener("pointercancel", endPointer);
      canvas.addEventListener("lostpointercapture", endPointer);
      canvas.addEventListener("pointerleave", () => {
        this.hoverCell = null;
      });
    }
    paintCell(event) {
      const cell = this.cellAt(event);
      if (cell !== null) this.onCellDrag(cell);
    }
    cellAt(event) {
      if (!this.env) return null;
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / rect.width * this.env.cols);
      const y = Math.floor((event.clientY - rect.top) / rect.height * this.env.rows);
      if (x < 0 || y < 0 || x >= this.env.cols || y >= this.env.rows) return null;
      return y * this.env.cols + x;
    }
    draw(sim2, now = performance.now()) {
      const env = this.env = sim2.env;
      const { ctx, width } = prepareCanvas(this.canvas);
      const size = width / env.cols;
      const xOf = (cell) => cell % env.cols * size;
      const yOf = (cell) => Math.floor(cell / env.cols) * size;
      ctx.fillStyle = cssVar("--maze-wall");
      ctx.fillRect(0, 0, width, width);
      ctx.fillStyle = cssVar("--maze-floor");
      for (let cell = 0; cell < env.numStates; cell++) {
        if (!env.isWall(cell)) ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
      }
      this.drawValues(ctx, sim2, size, xOf, yOf, now);
      ctx.strokeStyle = cssVar("--agent");
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(xOf(env.start) + size * 0.14, yOf(env.start) + size * 0.14, size * 0.72, size * 0.72);
      ctx.setLineDash([]);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.max(10, size * 0.36)}px ${CANVAS_FONT}`;
      for (const [cell, itemId] of env.items) {
        const item = getItemType(itemId);
        if (!item) continue;
        const cx = xOf(cell) + size / 2;
        const cy = yOf(cell) + size / 2;
        const radius = size * 0.36;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = cssVar(item.colorVar);
        ctx.fill();
        ctx.lineWidth = Math.max(1.5, size * 0.045);
        ctx.strokeStyle = cssVar("--maze-floor");
        ctx.stroke();
        ctx.fillStyle = cssVar("--on-item");
        ctx.font = `700 ${Math.max(9, size * 0.3)}px ${CANVAS_FONT}`;
        ctx.fillText(String(item.value), cx, cy + 1);
      }
      const agentX = xOf(env.state) + size / 2;
      const agentY = yOf(env.state) + size / 2;
      const agentRadius = size * 0.38;
      ctx.beginPath();
      ctx.arc(agentX, agentY, agentRadius, 0, Math.PI * 2);
      ctx.fillStyle = cssVar("--agent");
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = cssVar("--maze-floor");
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(agentX, agentY, size * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = cssVar("--agent-core");
      ctx.fill();
      if (this.selectedWall !== null && env.isWall(this.selectedWall)) {
        ctx.strokeStyle = cssVar("--agent");
        ctx.lineWidth = 3;
        ctx.strokeRect(xOf(this.selectedWall) + 2, yOf(this.selectedWall) + 2, size - 4, size - 4);
      }
      if (this.hoverCell !== null && (this.editingWalls || env.canHoldItem(this.hoverCell))) {
        ctx.strokeStyle = cssVar("--text-secondary");
        ctx.lineWidth = 2;
        ctx.strokeRect(xOf(this.hoverCell) + 1, yOf(this.hoverCell) + 1, size - 2, size - 2);
      }
    }
    // Tint each visited cell by its learned value (relative to the other
    // visited cells) and draw an arrow for the action the agent prefers there.
    drawValues(ctx, sim2, size, xOf, yOf, now) {
      const { env, agent } = sim2;
      const shown = (cell) => !env.isWall(cell) && !env.items.has(cell) && agent.hasVisited(cell);
      if (agent.policyConverged) {
        this.wasPolicyConverged = true;
      } else {
        const phase = Math.floor(now / GLITCH_INTERVAL_MS);
        if (this.wasPolicyConverged || phase !== this.glitchPhase) {
          this.glitchActions.clear();
          this.glitchPhase = phase;
          this.wasPolicyConverged = false;
        }
      }
      let min = Infinity;
      let max = -Infinity;
      for (let cell = 0; cell < env.numStates; cell++) {
        if (!shown(cell)) continue;
        min = Math.min(min, agent.stateValue(cell));
        max = Math.max(max, agent.stateValue(cell));
      }
      const tint = cssVar("--agent");
      const arrow = cssVar("--text-secondary");
      for (let cell = 0; cell < env.numStates; cell++) {
        if (!shown(cell)) continue;
        const strength = max > min ? (agent.stateValue(cell) - min) / (max - min) : 0;
        ctx.globalAlpha = 0.06 + 0.5 * strength;
        ctx.fillStyle = tint;
        ctx.fillRect(xOf(cell) - 0.5, yOf(cell) - 0.5, size + 1, size + 1);
        ctx.globalAlpha = 1;
        if (cell === env.state) continue;
        let actions;
        if (agent.policyConverged) {
          actions = agent.bestActions(cell);
        } else {
          if (!this.glitchActions.has(cell)) {
            this.glitchActions.set(cell, Math.floor(Math.random() * ACTIONS.length));
          }
          actions = [this.glitchActions.get(cell)];
        }
        const cx = xOf(cell) + size / 2;
        const cy = yOf(cell) + size / 2;
        ctx.strokeStyle = arrow;
        ctx.fillStyle = arrow;
        ctx.lineWidth = actions.length > 1 ? Math.max(1.5, size * 0.0525) : Math.max(1.5, size * 0.0675);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (actions.length > 1) {
          actions.forEach((action, i) => {
            const [slotX, slotY] = ARROW_SLOTS[action];
            drawDirectionCone(ctx, cx, cy, size, ACTIONS[action], slotX, slotY, 0.65);
          });
        } else {
          drawDirectionCone(ctx, cx, cy, size, ACTIONS[actions[0]]);
        }
      }
    }
  };

  // js/ui/chart.js
  var MARGIN = { top: 22, right: 14, bottom: 26, left: 38 };
  function niceStep(range, targetTicks) {
    const rough = range / targetTicks;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const unit = rough / magnitude;
    return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * magnitude;
  }
  function compact(n) {
    if (n >= 1e6) return `${+(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${+(n / 1e3).toFixed(1)}k`;
    return String(n);
  }
  var LineChart = class {
    constructor(canvas, { colorVar, xLabel }) {
      this.canvas = canvas;
      this.colorVar = colorVar;
      this.xLabel = xLabel;
      this.hoverX = null;
      canvas.addEventListener("mousemove", (e) => {
        this.hoverX = e.clientX - canvas.getBoundingClientRect().left;
      });
      canvas.addEventListener("mouseleave", () => {
        this.hoverX = null;
      });
    }
    draw(points) {
      const { ctx, width, height } = prepareCanvas(this.canvas);
      const left = MARGIN.left;
      const right = width - MARGIN.right;
      const top = MARGIN.top;
      const bottom = height - MARGIN.bottom;
      const xMax = Math.max(points.length ? points[points.length - 1].x : 0, 10);
      let yMin = 0;
      let yMax = 1;
      for (const p of points) {
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      }
      const yStep = niceStep(yMax - yMin, 4);
      yMin = Math.floor(yMin / yStep) * yStep;
      yMax = Math.ceil(yMax / yStep) * yStep;
      const px = (x) => left + x / xMax * (right - left);
      const py = (y) => bottom - (y - yMin) / (yMax - yMin) * (bottom - top);
      ctx.font = `11px ${CANVAS_FONT}`;
      ctx.lineWidth = 1;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let y = yMin; y <= yMax + yStep / 2; y += yStep) {
        ctx.strokeStyle = Math.abs(y) < yStep / 2 ? cssVar("--axis") : cssVar("--grid");
        ctx.beginPath();
        ctx.moveTo(left, Math.round(py(y)) + 0.5);
        ctx.lineTo(right, Math.round(py(y)) + 0.5);
        ctx.stroke();
        ctx.fillStyle = cssVar("--text-muted");
        ctx.fillText(String(+y.toFixed(6)), left - 6, py(y));
      }
      ctx.textBaseline = "top";
      const xStep = niceStep(xMax, 4);
      for (let x = 0; x <= xMax; x += xStep) {
        ctx.textAlign = x === 0 ? "left" : "center";
        ctx.fillText(compact(x), px(x), bottom + 7);
      }
      if (points.length > 1) {
        ctx.beginPath();
        points.forEach((p, i) => i ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y)));
        ctx.strokeStyle = cssVar(this.colorVar);
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      if (this.hoverX !== null && points.length) this.drawHover(ctx, points, px, py, { left, right, top, bottom });
    }
    drawHover(ctx, points, px, py, { left, right, top, bottom }) {
      let nearest = points[0];
      for (const p of points) {
        if (Math.abs(px(p.x) - this.hoverX) < Math.abs(px(nearest.x) - this.hoverX)) nearest = p;
      }
      const x = px(nearest.x);
      const y = py(nearest.y);
      ctx.strokeStyle = cssVar("--axis");
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, top);
      ctx.lineTo(Math.round(x) + 0.5, bottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(this.colorVar);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = cssVar("--surface");
      ctx.stroke();
      const text = `${this.xLabel} ${nearest.x.toLocaleString()}:  ${nearest.y.toFixed(2)}`;
      ctx.font = `600 12px ${CANVAS_FONT}`;
      ctx.textBaseline = "top";
      ctx.textAlign = x > (left + right) / 2 ? "left" : "right";
      ctx.fillStyle = cssVar("--text-primary");
      ctx.fillText(text, ctx.textAlign === "left" ? left : right, 2);
    }
  };

  // js/ui/controls.js
  var ERASER = "erase";
  var WALL_TOOL = "wall";
  function el(tag, props = {}, children = []) {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  }
  function fillSelect(select, options, onChange) {
    select.replaceChildren(...options.map((o) => el("option", { value: o.id, textContent: o.name })));
    select.addEventListener("change", () => onChange(select.value));
  }
  function buildParamControls(container, params2) {
    const groups = [...new Set(PARAMS.map((p) => p.group))];
    for (const group of groups) {
      container.append(el("h3", { textContent: group }));
      for (const def of PARAMS.filter((p) => p.group === group)) {
        const output = el("output", { textContent: params2[def.key] });
        const input = el("input", { type: "range", min: def.min, max: def.max, step: def.step, value: params2[def.key] });
        input.addEventListener("input", () => {
          params2[def.key] = Number(input.value);
          output.textContent = input.value;
        });
        container.append(el("label", { className: "param" }, [el("span", { textContent: def.label }), output, input]));
      }
    }
  }
  function buildItemPalette(container, onSelect) {
    const buttons = /* @__PURE__ */ new Map();
    const select = (id) => {
      for (const [toolId, button] of buttons) button.setAttribute("aria-pressed", String(toolId === id));
      onSelect(id);
    };
    for (const item of ITEM_TYPES) {
      const swatch = el("span", { className: "swatch" });
      swatch.style.background = `var(${item.colorVar})`;
      const button = el("button", { type: "button", className: "tool" }, [swatch, item.name]);
      button.addEventListener("click", () => select(item.id));
      buttons.set(item.id, button);
      button.dataset.tool = item.id;
      const value = el("input", { type: "number", value: item.value, min: -20, max: 20, step: 0.5, title: `Value of ${item.name}` });
      value.setAttribute("aria-label", `Value of ${item.name}`);
      value.addEventListener("input", () => {
        if (value.value !== "" && Number.isFinite(Number(value.value))) item.value = Number(value.value);
      });
      container.append(el("div", { className: "tool-row" }, [button, value]));
    }
    const eraser = el("button", { type: "button", className: "tool", textContent: "Eraser" });
    eraser.addEventListener("click", () => select(ERASER));
    buttons.set(ERASER, eraser);
    eraser.dataset.tool = ERASER;
    container.append(el("div", { className: "tool-row" }, [eraser]));
    const wall = el("button", { type: "button", className: "tool" }, [
      el("span", { className: "swatch wall-swatch" }),
      "Wall (drag to paint)"
    ]);
    wall.addEventListener("click", () => select(WALL_TOOL));
    buttons.set(WALL_TOOL, wall);
    wall.dataset.tool = WALL_TOOL;
    container.append(el("div", { className: "tool-row" }, [wall]));
    const initial = ITEM_TYPES[ITEM_TYPES.length - 1].id;
    select(initial);
    return initial;
  }
  function renderStats(container, entries) {
    container.replaceChildren(
      ...entries.map(
        ([label, value]) => el("div", { className: "stat" }, [el("dt", { textContent: label }), el("dd", { textContent: value })])
      )
    );
  }
  function renderChoices(container, counts, total) {
    const rows = [...ITEM_TYPES].sort((a, b) => b.value - a.value).map((item) => ({
      name: `${item.name} (${item.value})`,
      count: counts.get(item.id) ?? 0,
      color: `var(${item.colorVar})`
    }));
    rows.push({ name: "None (timed out)", count: counts.get(null) ?? 0, color: "var(--text-muted)" });
    container.replaceChildren(
      ...rows.map((row) => {
        const share = total ? row.count / total : 0;
        const fill = el("span", { className: "bar-fill" });
        fill.style.width = `${share * 100}%`;
        fill.style.background = row.color;
        return el("div", { className: "choice" }, [
          el("span", { className: "choice-name", textContent: row.name }),
          el("span", { className: "bar" }, [fill]),
          el("span", { className: "choice-share", textContent: `${Math.round(share * 100)}%` })
        ]);
      })
    );
  }

  // js/main.js
  var $ = (id) => document.getElementById(id);
  var params = defaultParams();
  var sim = new Simulation(params);
  var tool = null;
  var running = false;
  var stepsPerSecond = 1;
  var wallStrokeReset = false;
  var wallTool = null;
  var wallButtons = ["add-wall", "erase-wall", "move-wall"];
  var wallHints = {
    "add-wall": "Click an empty cell to add a wall. The start, agent, and items are protected.",
    "erase-wall": "Click a wall to erase it.",
    "move-wall": "Click a wall, then click an empty cell to move it. Click the selected wall to cancel."
  };
  function selectWallTool(id) {
    wallTool = id;
    mazeView.selectedWall = null;
    mazeView.editingWalls = id !== null;
    for (const buttonId of wallButtons) $(buttonId).setAttribute("aria-pressed", String(buttonId === id));
    for (const button of $("items").querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(id === null && button.dataset.tool === tool));
    }
    $("wall-hint").textContent = wallHints[id] ?? "Choose a wall tool to edit the maze. Editing pauses the simulation.";
    if (id !== null) setRunning(false);
  }
  var mazeView = new MazeView($("maze"), {
    onCellClick(cell) {
      const env = sim.env;
      if (wallTool !== null) {
        setRunning(false);
        if (wallTool === "add-wall") {
          $("wall-hint").textContent = env.addWall(cell) ? wallHints[wallTool] : "Choose an empty cell without the start, agent, or an item.";
        } else if (wallTool === "erase-wall") {
          env.removeWall(cell);
        } else if (cell === mazeView.selectedWall) {
          mazeView.selectedWall = null;
          $("wall-hint").textContent = wallHints[wallTool];
        } else if (mazeView.selectedWall !== null && env.moveWall(mazeView.selectedWall, cell)) {
          mazeView.selectedWall = null;
          $("wall-hint").textContent = wallHints[wallTool];
        } else if (env.isWall(cell)) {
          mazeView.selectedWall = cell;
          $("wall-hint").textContent = "Wall selected. Click an empty cell to move it.";
        } else {
          $("wall-hint").textContent = mazeView.selectedWall === null ? "Select a wall first." : "Choose an empty cell without the start, agent, or an item.";
        }
        return;
      }
      if (tool === WALL_TOOL) return;
      if (!env.canHoldItem(cell)) return;
      if (tool === ERASER || env.items.get(cell) === tool) env.removeItem(cell);
      else env.placeItem(cell, tool);
    },
    onCellDrag(cell) {
      if (wallTool !== null || tool !== WALL_TOOL && tool !== ERASER) return;
      if (running) setRunning(false);
      const changed = sim.env.setWall(cell, tool === WALL_TOOL);
      if (changed && !wallStrokeReset) {
        sim.resetLearning();
        wallStrokeReset = true;
      }
    },
    onCellDragEnd() {
      wallStrokeReset = false;
    }
  });
  var chart = new LineChart($("reward-chart"), { colorVar: "--agent", xLabel: "Step" });
  fillSelect($("agent-select"), AGENTS, (id) => sim.setAgent(id));
  buildParamControls($("params"), params);
  tool = buildItemPalette($("items"), (id) => {
    tool = id;
    selectWallTool(null);
  });
  for (const id of wallButtons) $(id).addEventListener("click", () => selectWallTool(wallTool === id ? null : id));
  $("clear-walls").addEventListener("click", () => {
    setRunning(false);
    sim.env.clearWalls();
    mazeView.selectedWall = null;
    $("wall-hint").textContent = "All walls erased. Choose Add walls to build a new layout.";
  });
  function setRunning(value) {
    running = value;
    $("play").textContent = running ? "Pause" : "Play";
  }
  $("play").addEventListener("click", () => setRunning(!running));
  $("step").addEventListener("click", () => {
    setRunning(false);
    sim.step();
  });
  $("reset").addEventListener("click", () => sim.resetLearning());
  function updateSpeed() {
    stepsPerSecond = Math.round(10 ** (Number($("speed").value) / 25));
    $("speed-label").textContent = `${stepsPerSecond.toLocaleString()} steps/s`;
  }
  $("speed").addEventListener("input", updateSpeed);
  updateSpeed();
  var lastTime = performance.now();
  var stepDebt = 0;
  function frame(now) {
    const elapsed = Math.min(now - lastTime, 100);
    lastTime = now;
    if (running) {
      stepDebt += elapsed / 1e3 * stepsPerSecond;
      const deadline = performance.now() + 12;
      while (stepDebt >= 1 && performance.now() < deadline) {
        sim.step();
        stepDebt--;
      }
      if (stepDebt >= 1) stepDebt = 0;
    }
    mazeView.draw(sim, now);
    chart.draw(sim.history.points);
    renderStats($("stats"), [
      ["Steps", sim.steps.toLocaleString()],
      ["Episodes", sim.episodes.toLocaleString()],
      ["Last episode length", sim.lastEpisodeSteps === null ? "\u2013" : `${sim.lastEpisodeSteps} steps`],
      ["Reward state", sim.rewardState.level.toFixed(2)],
      ...sim.agent.info()
    ]);
    renderChoices($("choices"), sim.recentChoices(), sim.outcomes.length);
    $("choices-title").textContent = `Item reached, last ${Math.min(sim.outcomes.length, RECENT_EPISODES)} episodes`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

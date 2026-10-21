/* ==========================================================
   Scene 2c · Dopamine & the mesocorticolimbic system
   Manim-style: strokes draw themselves, a camera zooms into
   the VTA, dopamine neurons grow, fire, and project to the
   nucleus accumbens (mesolimbic) and PFC (mesocortical).

   Timeline labels:  intro → b0 → b1 → … → b6
   Beat i (0-based) plays the timeline from b{i} to b{i+1}.
   ========================================================== */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const VB_W = 1000, VB_H = 700;

  /* Pathway centre-lines: start point, then cubic Bézier triplets */
  const PATHWAYS = {
    limbic: [[486, 465], [462, 452], [434, 436], [408, 421]],
    cortical: [[486, 461], [450, 440], [400, 420], [360, 400],
               [320, 380], [295, 330], [290, 290],
               [286, 250], [270, 215], [245, 195]],
  };

  /* Dopamine neuron somata inside the VTA */
  const SOMATA = [[500, 469], [512, 464], [524, 468], [506, 477],
                  [519, 479], [530, 475], [496, 476], [527, 462]];
  const SOMA_R = 1.8;

  const CAM_FULL = { cx: 500, cy: 350, w: 1000 };
  const cam = { ...CAM_FULL };

  let svg, tl, playhead, built = false, active = false;
  let neurons = [], axons = [], particles = [];
  let glow = { limbic: 0, cortical: 0 }, glowEls = {};
  let stageRect = null;

  /* ---------- helpers ---------- */
  const $ = (sel) => svg.querySelector(sel);
  const $$ = (sel) => Array.from(svg.querySelectorAll(sel));

  function seeded(seed) {
    return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  }

  function el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    parent?.appendChild(node);
    return node;
  }

  function pathD(pts, ox = 0, oy = 0) {
    const p = pts.map(([x, y]) => `${(x + ox).toFixed(2)} ${(y + oy).toFixed(2)}`);
    let d = `M ${p[0]}`;
    for (let i = 1; i < p.length; i += 3) d += ` C ${p[i]}, ${p[i + 1]}, ${p[i + 2]}`;
    return d;
  }

  /* Prepare a stroke for a "Create" animation (dash-offset reveal) */
  function prepDraw(node) {
    const L = node.getTotalLength();
    node.style.strokeDasharray = `${L} ${L}`;
    node.style.strokeDashoffset = L;
  }
  const draw = (dur, extra = {}) => ({ strokeDashoffset: 0, duration: dur, ease: 'power1.inOut', ...extra });

  /* Split a <text> into per-character tspans for a "Write" animation */
  function splitText(t) {
    const s = t.textContent;
    t.textContent = '';
    for (const ch of s) el('tspan', { 'fill-opacity': 0 }, t).textContent = ch;
  }
  function write(t, at, dur = 0.9) {
    const chars = t.querySelectorAll('tspan');
    tl.to(chars, { attr: { 'fill-opacity': 1 }, duration: 0.3, stagger: dur / chars.length, ease: 'none' }, at);
  }

  /* ---------- camera ---------- */
  function pxPerUnit() {
    if (!stageRect) stageRect = svg.getBoundingClientRect();
    return Math.min(stageRect.width / cam.w, stageRect.height / (cam.w * VB_H / VB_W)) || 1;
  }
  function applyCam() {
    const h = cam.w * VB_H / VB_W;
    svg.setAttribute('viewBox', `${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`);
    svg.style.setProperty('--z', VB_W / cam.w);
  }

  /* ---------- build neurons ---------- */
  function buildNeurons() {
    const rand = seeded(7);
    const axonLayer = $('#daAxons'), neuronLayer = $('#daNeurons');

    SOMATA.forEach(([sx, sy], i) => {
      const g = el('g', { class: 'da-neuron' }, neuronLayer);

      // dendrites fan out to the right (axon leaves to the left)
      const dends = [];
      const k = 4 + Math.floor(rand() * 2);
      for (let j = 0; j < k; j++) {
        const a = -2.0 + ((j + 0.2 + rand() * 0.6) / k) * 4.0;
        const len = 3.2 + rand() * 3.2;
        const x0 = sx + Math.cos(a) * SOMA_R, y0 = sy + Math.sin(a) * SOMA_R;
        const x1 = sx + Math.cos(a) * (SOMA_R + len), y1 = sy + Math.sin(a) * (SOMA_R + len);
        const bend = (rand() - 0.5) * 2.4;
        const cx = (x0 + x1) / 2 - Math.sin(a) * bend, cy = (y0 + y1) / 2 + Math.cos(a) * bend;
        dends.push(el('path', { class: 'mn-line da-dendrite', d: `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}` }, g));

        // one small branch per dendrite
        const bx = (cx + x1) / 2, by = (cy + y1) / 2;
        const ba = a + (rand() < 0.5 ? -0.7 : 0.7), bl = 1.2 + rand() * 1.6;
        dends.push(el('path', {
          class: 'mn-line da-dendrite',
          d: `M ${bx} ${by} L ${bx + Math.cos(ba) * bl} ${by + Math.sin(ba) * bl}`,
        }, g));
      }

      const ring = el('circle', { class: 'da-ring', cx: sx, cy: sy, r: SOMA_R }, g);
      const soma = el('circle', { class: 'da-soma', cx: sx, cy: sy, r: SOMA_R, 'fill-opacity': 0.9 }, g);

      // axon: leaves the soma, then joins its pathway bundle with a small offset
      const target = i % 2 === 0 ? 'limbic' : 'cortical';
      const P = PATHWAYS[target];
      const ox = (rand() - 0.5) * 5, oy = (rand() - 0.5) * 5;
      const [px, py] = [P[0][0] + ox, P[0][1] + oy];
      const rest = pathD(P, ox, oy).replace(/^M [^C]*/, '');
      const d = `M ${sx - SOMA_R} ${sy} C ${sx - 6} ${sy + (rand() - 0.5) * 3}, ${px + 6} ${py}, ${px} ${py} ${rest}`;
      const path = el('path', { class: 'mn-line da-axon', d }, axonLayer);
      const L = path.getTotalLength();
      path.style.strokeDasharray = `${L} ${L}`;
      path.style.strokeDashoffset = L;
      dends.forEach(prepDraw);
      const axon = { el: path, L, draw: 0, target };
      axons.push(axon);

      neurons.push({ soma, ring, dends, axon, nextFire: 0 });
    });
  }

  /* ---------- particles (dopamine signal) ---------- */
  function spawn(axon) {
    const layer = $('#daParticles');
    const g = el('g', {}, layer);
    const halo = el('circle', { class: 'da-particle-halo', r: 0 }, g);
    const core = el('circle', { class: 'da-particle', r: 0 }, g);
    particles.push({ axon, s: 0, g, halo, core });
  }

  function fire(n) {
    if (n.axon.draw < 2) return;
    gsap.fromTo(n.soma, { fill: '#fff6dc' }, { fill: '#f5b041', duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(n.ring, { attr: { r: SOMA_R }, opacity: 0.9 },
      { attr: { r: SOMA_R * 3.5 }, opacity: 0, duration: 0.6, ease: 'power2.out' });
    for (let k = 0; k < 3; k++) gsap.delayedCall(k * 0.09, () => active && spawn(n.axon));
  }

  function clearParticles() {
    particles.forEach((p) => p.g.remove());
    particles = [];
  }

  /* ---------- per-frame render ---------- */
  function tick(time, deltaMs) {
    const dt = Math.min(deltaMs, 50) / 1000;
    applyCam();
    axons.forEach((a) => (a.el.style.strokeDashoffset = a.L - a.draw));

    const ppu = pxPerUnit();

    // neurons fire spontaneously once beat 3 ("they fire") has started
    if (tl.time() > tl.labels.b2 + 0.05) {
      neurons.forEach((n) => {
        if (time >= n.nextFire) {
          if (n.nextFire) fire(n);
          n.nextFire = time + 0.7 + Math.random() * 1.4;
        }
      });
    }

    // move particles along their axons
    const speed = 260 / ppu;   // ≈ constant on-screen speed, whatever the zoom
    const r = 2.6 / ppu;
    particles = particles.filter((p) => {
      p.s += speed * dt;
      const { axon } = p;
      if (p.s >= axon.L - 0.5 && axon.draw >= axon.L - 0.5) {
        glow[axon.target] = Math.min(1, glow[axon.target] + 0.12);
        p.g.remove();
        return false;
      }
      if (p.s > axon.draw) { p.g.remove(); return false; }
      const pt = axon.el.getPointAtLength(p.s);
      p.core.setAttribute('cx', pt.x); p.core.setAttribute('cy', pt.y); p.core.setAttribute('r', r);
      p.halo.setAttribute('cx', pt.x); p.halo.setAttribute('cy', pt.y); p.halo.setAttribute('r', r * 3);
      return true;
    });

    // target regions glow when dopamine arrives
    for (const k in glow) {
      glow[k] *= Math.exp(-dt * 2.2);
      glowEls[k].style.opacity = (0.4 * glow[k]).toFixed(3);
    }
  }

  /* ---------- timeline ---------- */
  function buildTimeline() {
    tl = gsap.timeline({ paused: true });

    const cortex = $('#daCortex');
    const structs = $$('.da-struct');
    const sulci = $$('.da-sulcus'), folia = $$('.da-folia');
    const fills = $$('.mn-fill');
    const pfc = $('#daPfc'), nac = $('#daNac'), vta = $('#daVta');
    const brain = $('#daBrain');
    const L = {
      pfc: $('#daLblPfc'), nac: $('#daLblNac'), vta: $('#daLblVta'),
      neurons: $('#daLblNeurons'), limbic: $('#daLblLimbic'), cortical: $('#daLblCortical'),
    };
    const ldNac = $('#daLdNac'), ldVta = $('#daLdVta');
    const limbicAxons = axons.filter((a) => a.target === 'limbic');
    const corticalAxons = axons.filter((a) => a.target === 'cortical');

    /* intro: draw the brain (DrawBorderThenFill) */
    tl.to(cortex, draw(2.4), 0)
      .to(structs, draw(1.4, { stagger: 0.18 }), 0.8)
      .to(sulci, draw(1.0, { stagger: 0.1 }), 1.4)
      .to(folia, draw(0.8, { stagger: 0.1 }), 2.0)
      .to(fills, { opacity: 1, duration: 1.2 }, 2.4)
      .to(pfc, draw(1.2), 2.8)
      .to(pfc, { attr: { 'fill-opacity': 0.16 }, duration: 0.8 }, 3.6)
      .to(nac, draw(0.8), 3.2)
      .to(nac, { attr: { 'fill-opacity': 0.3 }, duration: 0.6 }, 3.8)
      .to(vta, draw(0.8), 3.6)
      .to(vta, { attr: { 'fill-opacity': 0.45 }, duration: 0.6 }, 4.2);
    write(L.pfc, 3.6);
    tl.to(ldNac, draw(0.5), 4.0);
    write(L.nac, 4.2);
    tl.to(ldVta, draw(0.5), 4.4);
    write(L.vta, 4.6, 1.2);
    tl.addLabel('b0', 6.0);

    /* beat 1: indicate the VTA, then zoom in */
    tl.to(vta, { scale: 1.4, transformOrigin: '50% 50%', duration: 0.35, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 'b0')
      .to(vta, { attr: { 'fill-opacity': 0.9 }, duration: 0.35, repeat: 1, yoyo: true }, 'b0')
      .to([L.pfc, L.nac, ldNac, L.vta, ldVta], { opacity: 0, duration: 0.5 }, 'b0+=0.7')
      .to(brain, { opacity: 0.3, duration: 2 }, 'b0+=0.9')
      .to(cam, { cx: 512, cy: 470, w: 80, duration: 2.8, ease: 'power2.inOut' }, 'b0+=0.9')
      .to(vta, { attr: { 'fill-opacity': 0.07 }, duration: 1.5 }, 'b0+=2.2');
    tl.addLabel('b1');

    /* beat 2: dopamine neurons grow */
    neurons.forEach((n, i) => {
      const t = `b1+=${(i * 0.16).toFixed(2)}`;
      tl.fromTo(n.soma, { scale: 0 }, { scale: 1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2.2)' }, t)
        .to(n.dends, draw(0.9, { stagger: 0.04, ease: 'power2.out' }), `${t}+=0.25`)
        .to(n.axon, { draw: 28, duration: 1.3, ease: 'power1.out' }, `${t}+=0.5`);
    });
    write(L.neurons, 'b1+=1.6');
    tl.addLabel('b2', '+=0.2');

    /* beat 3: firing (driven by tick); pull back slightly to watch */
    tl.to(cam, { cy: 467, w: 120, duration: 2.2, ease: 'sine.inOut' }, 'b2');
    tl.addLabel('b3');

    /* beat 4: mesolimbic axons grow to the nucleus accumbens */
    tl.to(L.neurons, { opacity: 0, duration: 0.4 }, 'b3')
      .to(cam, { cx: 455, cy: 440, w: 290, duration: 2.8, ease: 'power2.inOut' }, 'b3')
      .to(brain, { opacity: 0.6, duration: 2 }, 'b3')
      .to(limbicAxons, { draw: (i, a) => a.L, duration: 2.6, stagger: 0.1, ease: 'power1.inOut' }, 'b3+=0.3')
      .to([L.nac, ldNac], { opacity: 1, duration: 0.6 }, 'b3+=2.2');
    tl.addLabel('b4');

    /* beat 5: mesocortical axons grow to the prefrontal cortex */
    tl.to(cam, { ...CAM_FULL, duration: 2.8, ease: 'power2.inOut' }, 'b4')
      .to(brain, { opacity: 1, duration: 2 }, 'b4')
      .to(corticalAxons, { draw: (i, a) => a.L, duration: 3.0, stagger: 0.1, ease: 'power1.inOut' }, 'b4+=0.3')
      .to(L.pfc, { opacity: 1, duration: 0.6 }, 'b4+=2.6');
    tl.addLabel('b5');

    /* beat 6: name the pathways */
    tl.to([L.vta, ldVta], { opacity: 1, duration: 0.6 }, 'b5');
    write(L.limbic, 'b5+=0.3');
    write(L.cortical, 'b5+=0.7');
    tl.addLabel('b6', '+=0.3');
  }

  function build() {
    svg = document.getElementById('daSvg');
    $$('.mn-draw').forEach(prepDraw);
    $$('.mn-label').forEach(splitText);
    buildNeurons();
    glowEls = { limbic: $('#daNacGlow'), cortical: $('#daPfcGlow') };
    buildTimeline();
    window.addEventListener('resize', () => (stageRect = null));
    built = true;
  }

  /* ---------- scene hooks ---------- */
  (window.sceneHooks = window.sceneHooks || {})['bio-dopamine'] = {
    enter(scene, shown) {
      if (!window.gsap) return;
      if (!built) build();
      active = true;
      stageRect = null;
      clearParticles();
      neurons.forEach((n) => (n.nextFire = 0));
      playhead?.kill();
      if (shown === 0) {
        tl.pause(0);
        playhead = tl.tweenTo('b0');
      } else {
        tl.pause(`b${shown}`);
      }
      gsap.ticker.add(tick);
    },
    beat(scene, i) {
      if (!built) return;
      playhead?.kill();
      playhead = tl.tweenTo(`b${i + 1}`);
    },
    leave() {
      if (!built) return;
      active = false;
      playhead?.kill();
      tl.pause();
      gsap.ticker.remove(tick);
      clearParticles();
    },
  };
})();

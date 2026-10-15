import { SOURCE_TYPES } from '../hrl/config.js';

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

export function fillSelect(select, options, onChange) {
  select.replaceChildren(...options.map((o) => el('option', { value: o.id, textContent: o.name })));
  select.addEventListener('change', () => onChange(select.value));
}

// One slider per entry in `defs`, grouped under headings. Sliders write
// straight into the shared `params` object, which the simulation reads live.
// Returns a function that brings the sliders back in line with `params` after
// something else has changed it.
export function buildParamControls(container, params, defs) {
  const groups = [...new Set(defs.map((p) => p.group))];
  const controls = [];
  for (const group of groups) {
    container.append(el('h3', { textContent: group }));
    for (const def of defs.filter((p) => p.group === group)) {
      const output = el('output', { textContent: params[def.key] });
      const input = el('input', { id: `param-${def.key}`, type: 'range', min: def.min, max: def.max, step: def.step, value: params[def.key] });
      input.addEventListener('input', () => {
        params[def.key] = Number(input.value);
        output.textContent = input.value;
      });
      controls.push({ def, input, output });
      const label = el('label', { htmlFor: input.id, textContent: def.label });
      output.htmlFor = input.id;
      const row = el('div', { className: 'param' }, [label, output, input]);
      if (def.description) {
        const description = el('p', { id: `${input.id}-help`, textContent: def.description });
        input.setAttribute('aria-describedby', description.id);
        const summary = el('summary', { textContent: 'About this parameter' });
        summary.setAttribute('aria-label', `About ${def.label}`);
        const help = el('details', { className: 'param-help' }, [summary, description]);
        if (def.tryIt) {
          const tip = el('p', { id: `${input.id}-tip`, className: 'param-tip' }, [
            el('strong', { textContent: 'Try it' }),
            el('span', { textContent: def.tryIt }),
          ]);
          help.append(tip);
          input.setAttribute('aria-describedby', `${description.id} ${tip.id}`);
        }
        row.append(help);
      }
      container.append(row);
    }
  }
  return () => {
    for (const { def, input, output } of controls) {
      input.value = params[def.key];
      output.textContent = params[def.key];
    }
  };
}

export function renderStats(container, entries) {
  container.replaceChildren(
    ...entries.map(([label, value]) =>
      el('div', { className: 'stat' }, [el('dt', { textContent: label }), el('dd', { textContent: value })]),
    ),
  );
}

// A line key and a name per chart series; `dashed` for a dashed line.
export function renderLegend(container, series) {
  container.replaceChildren(
    ...series.map(({ name, colorVar, dashed }) => {
      const key = el('span', { className: dashed ? 'legend-key dashed' : 'legend-key' });
      key.style.color = `var(${colorVar})`;
      return el('span', { className: 'legend-item' }, [key, name]);
    }),
  );
}

// Fills a bar to `value` out of `max` and writes the number next to it.
export function renderMeter(meter, value, max) {
  meter.setAttribute('aria-valuenow', value.toFixed(1));
  meter.querySelector('.bar-fill').style.width = `${(Math.min(max, Math.max(0, value)) / max) * 100}%`;
  meter.querySelector('output').textContent = `${value.toFixed(1)} / ${max}`;
}

// Share of the recent interactions that went to each source, with the letter
// and colour the source has on the maze. `counts` maps source id -> number of
// interactions.
export function renderChoices(container, counts) {
  const sources = SOURCE_TYPES.filter((source) => source.id === 'food' || source.id === 'drugB');
  const total = sources.reduce((sum, source) => sum + (counts.get(source.id) ?? 0), 0);
  container.replaceChildren(
    ...sources.map((source) => {
      const count = counts.get(source.id) ?? 0;
      const share = total ? count / total : 0;
      const fill = el('span', { className: 'bar-fill' });
      fill.style.width = `${share * 100}%`;
      fill.style.background = `var(${source.colorVar})`;
      const swatch = el('span', { className: 'swatch', textContent: source.char });
      swatch.style.background = `var(${source.colorVar})`;
      return el('div', { className: 'choice', title: `${count.toLocaleString()} interactions` }, [
        el('span', { className: 'choice-name' }, [swatch, source.name]),
        el('span', { className: 'bar' }, [fill]),
        el('span', { className: 'choice-share', textContent: `${Math.round(share * 100)}%` }),
      ]);
    }),
  );
}

import { PARAMS } from '../config.js';
import { ITEM_TYPES } from '../items.js';

export const ERASER = 'erase';
export const WALL_TOOL = 'wall';

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

export function fillSelect(select, options, onChange) {
  select.replaceChildren(...options.map((o) => el('option', { value: o.id, textContent: o.name })));
  select.addEventListener('change', () => onChange(select.value));
}

// One slider per entry in PARAMS, grouped under headings. Sliders write
// straight into the shared `params` object, which the simulation reads live.
export function buildParamControls(container, params) {
  const groups = [...new Set(PARAMS.map((p) => p.group))];
  for (const group of groups) {
    container.append(el('h3', { textContent: group }));
    for (const def of PARAMS.filter((p) => p.group === group)) {
      const output = el('output', { textContent: params[def.key] });
      const input = el('input', { type: 'range', min: def.min, max: def.max, step: def.step, value: params[def.key] });
      input.addEventListener('input', () => {
        params[def.key] = Number(input.value);
        output.textContent = input.value;
      });
      container.append(el('label', { className: 'param' }, [el('span', { textContent: def.label }), output, input]));
    }
  }
}

// The list of placeable items plus an eraser. Calls `onSelect(toolId)` when
// the active tool changes and returns the initially selected tool.
export function buildItemPalette(container, onSelect) {
  const buttons = new Map();
  const select = (id) => {
    for (const [toolId, button] of buttons) button.setAttribute('aria-pressed', String(toolId === id));
    onSelect(id);
  };

  for (const item of ITEM_TYPES) {
    const swatch = el('span', { className: 'swatch' });
    swatch.style.background = `var(${item.colorVar})`;
    const button = el('button', { type: 'button', className: 'tool' }, [swatch, item.name]);
    button.addEventListener('click', () => select(item.id));
    buttons.set(item.id, button);
    button.dataset.tool = item.id;

    const value = el('input', { type: 'number', value: item.value, min: -20, max: 20, step: 0.5, title: `Value of ${item.name}` });
    value.setAttribute('aria-label', `Value of ${item.name}`);
    value.addEventListener('input', () => {
      if (value.value !== '' && Number.isFinite(Number(value.value))) item.value = Number(value.value);
    });
    container.append(el('div', { className: 'tool-row' }, [button, value]));
  }

  const eraser = el('button', { type: 'button', className: 'tool', textContent: 'Eraser' });
  eraser.addEventListener('click', () => select(ERASER));
  buttons.set(ERASER, eraser);
  eraser.dataset.tool = ERASER;
  container.append(el('div', { className: 'tool-row' }, [eraser]));

  const wall = el('button', { type: 'button', className: 'tool' }, [
    el('span', { className: 'swatch wall-swatch' }),
    'Wall (drag to paint)',
  ]);
  wall.addEventListener('click', () => select(WALL_TOOL));
  buttons.set(WALL_TOOL, wall);
  wall.dataset.tool = WALL_TOOL;
  container.append(el('div', { className: 'tool-row' }, [wall]));

  const initial = ITEM_TYPES[ITEM_TYPES.length - 1].id;
  select(initial);
  return initial;
}

export function renderStats(container, entries) {
  container.replaceChildren(
    ...entries.map(([label, value]) =>
      el('div', { className: 'stat' }, [el('dt', { textContent: label }), el('dd', { textContent: value })]),
    ),
  );
}

// Share of recent episodes that ended at each item type.
export function renderChoices(container, counts, total) {
  const rows = [...ITEM_TYPES].sort((a, b) => b.value - a.value).map((item) => ({
    name: `${item.name} (${item.value})`,
    count: counts.get(item.id) ?? 0,
    color: `var(${item.colorVar})`,
  }));
  rows.push({ name: 'None (timed out)', count: counts.get(null) ?? 0, color: 'var(--text-muted)' });

  container.replaceChildren(
    ...rows.map((row) => {
      const share = total ? row.count / total : 0;
      const fill = el('span', { className: 'bar-fill' });
      fill.style.width = `${share * 100}%`;
      fill.style.background = row.color;
      return el('div', { className: 'choice' }, [
        el('span', { className: 'choice-name', textContent: row.name }),
        el('span', { className: 'bar' }, [fill]),
        el('span', { className: 'choice-share', textContent: `${Math.round(share * 100)}%` }),
      ]);
    }),
  );
}

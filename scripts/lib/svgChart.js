// Dependency-free SVG charts for the experiment reports: rows of small panels
// that share one y scale, holding either lines (with an optional ±sd band) or
// grouped bars (with optional ±sd whiskers). Every mark carries a <title>, so
// hovering it in a browser shows its value.

const INK = { surface: '#fcfcfb', primary: '#0b0b0b', secondary: '#52514e', muted: '#898781', grid: '#e1e0d9' };
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const PANEL = { width: 300, wideWidth: 648, height: 190, gapX: 48, gapY: 58, left: 52, right: 16 };
const FOOTER = 34;
const PER_ROW = 3;

// Colours of the things that are compared across charts.
export const COLORS = {
  fixed: '#2a78d6',
  adaptive: '#eb6834',
  noAccumulated: '#1baf7a',
  d: '#6250d6',
  h: '#e34948',
};

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n) => (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2));
const text = (x, y, content, { size = 11, fill = INK.muted, anchor = 'start', weight = 400 } = {}) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(content)}</text>`;

function niceStep(range, targetTicks) {
  const rough = range / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const unit = rough / magnitude;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * magnitude;
}

// Lays out the panels and draws what they share: title, legend, frames, the
// y grid and axis labels. `drawPanel(panel, area, py)` returns the marks.
// `subtitle` may be an array of lines. A lone panel is drawn wide.
function figure({ title, subtitle, legend, panels, yLabel, xLabel, yValues, yDomain }, drawPanel) {
  let yMin = yDomain ? yDomain[0] : Math.min(0, ...yValues);
  let yMax = yDomain ? yDomain[1] : Math.max(0, ...yValues);
  if (yMax === yMin) yMax = yMin + 1;
  const step = niceStep(yMax - yMin, 4);
  yMin = Math.floor(yMin / step) * step;
  yMax = Math.ceil(yMax / step) * step;

  const columns = Math.min(PER_ROW, panels.length);
  const rows = Math.ceil(panels.length / PER_ROW);
  const panelWidth = panels.length === 1 ? PANEL.wideWidth : PANEL.width;
  const subtitles = [subtitle ?? []].flat();
  const legendY = 34 + subtitles.length * 15;
  const header = legendY + (legend?.length ? 28 : 8);
  const width = PANEL.left + columns * panelWidth + (columns - 1) * PANEL.gapX + PANEL.right;
  const height = header + rows * PANEL.height + (rows - 1) * PANEL.gapY + FOOTER;

  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family='${FONT}'>`,
    `<rect width="${width}" height="${height}" fill="${INK.surface}"/>`,
    text(PANEL.left, 22, title, { size: 14, fill: INK.primary, weight: 600 }),
  ];
  subtitles.forEach((line, i) => out.push(text(PANEL.left, 39 + i * 15, line, { fill: INK.secondary })));

  let legendX = PANEL.left;
  for (const item of legend ?? []) {
    out.push(`<rect x="${legendX}" y="${legendY}" width="12" height="12" rx="2" fill="${item.color}"/>`);
    out.push(text(legendX + 17, legendY + 10, item.name, { fill: INK.secondary }));
    legendX += 17 + item.name.length * 6.2 + 18;
  }

  panels.forEach((panel, i) => {
    const area = {
      left: PANEL.left + (i % PER_ROW) * (panelWidth + PANEL.gapX),
      top: header + Math.floor(i / PER_ROW) * (PANEL.height + PANEL.gapY) + 16,
    };
    area.right = area.left + panelWidth;
    area.bottom = area.top + PANEL.height - 16;
    const py = (y) => area.bottom - ((y - yMin) / (yMax - yMin)) * (area.bottom - area.top);

    if (panel.title) out.push(text(area.left, area.top - 8, panel.title, { fill: INK.primary, weight: 600 }));
    for (let y = yMin; y <= yMax + step / 2; y += step) {
      const line = Math.round(py(y)) + 0.5;
      const color = Math.abs(y) < step / 2 ? INK.muted : INK.grid;
      out.push(`<line x1="${area.left}" x2="${area.right}" y1="${line}" y2="${line}" stroke="${color}" stroke-width="1"/>`);
      out.push(text(area.left - 6, py(y) + 4, String(+y.toFixed(6)), { anchor: 'end' }));
    }
    out.push(...drawPanel(panel, area, py));
    if (xLabel) out.push(text((area.left + area.right) / 2, area.bottom + 30, xLabel, { anchor: 'middle' }));
  });
  if (yLabel) {
    out.push(`<text transform="translate(13 ${header + PANEL.height / 2}) rotate(-90)" font-size="11" fill="${INK.muted}" text-anchor="middle">${esc(yLabel)}</text>`);
  }
  out.push('</svg>');
  return out.join('\n');
}

// panels: [{ title, series: [{ name, color, points: [{ x, y, sd? }] }] }]
// `floor` stops the ±sd band below a value the quantity cannot go under.
export function lineChart(spec) {
  const all = spec.panels.flatMap((p) => p.series.flatMap((s) => s.points));
  const lowerOf = (p) => Math.max(spec.floor ?? -Infinity, p.y - (p.sd ?? 0));
  const yValues = all.flatMap((p) => [lowerOf(p), p.y + (p.sd ?? 0)]);
  const xMax = Math.max(...all.map((p) => p.x));
  const xMin = Math.min(...all.map((p) => p.x));
  const legend = spec.legend ?? spec.panels[0].series.map(({ name, color }) => ({ name, color }));

  return figure({ ...spec, legend, yValues }, (panel, area, py) => {
    const px = (x) => area.left + ((x - xMin) / (xMax - xMin || 1)) * (area.right - area.left);
    const out = [];
    const xStep = niceStep(xMax - xMin || 1, 4);
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      out.push(text(px(x), area.bottom + 15, String(x), { anchor: 'middle' }));
    }
    for (const series of panel.series) {
      if (series.points.some((p) => p.sd)) {
        const upper = series.points.map((p) => `${px(p.x).toFixed(1)},${py(p.y + p.sd).toFixed(1)}`);
        const lower = series.points.map((p) => `${px(p.x).toFixed(1)},${py(lowerOf(p)).toFixed(1)}`).reverse();
        out.push(`<polygon points="${[...upper, ...lower].join(' ')}" fill="${series.color}" fill-opacity="0.12"/>`);
      }
    }
    for (const series of panel.series) {
      const path = series.points.map((p) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
      const last = series.points[series.points.length - 1];
      out.push(`<polyline points="${path}" fill="none" stroke="${series.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><title>${esc(series.name)}: ends at ${fmt(last.y)}</title></polyline>`);
    }
    return out;
  });
}

// panels: [{ title, categories: [label], groups: [{ name, color, values: [{ mean, sd? }] }] }]
export function barChart(spec) {
  const all = spec.panels.flatMap((p) => p.groups.flatMap((g) => g.values));
  const yValues = all.flatMap((v) => [v.mean + (v.sd ?? 0), v.mean]);
  const legend = spec.legend ?? spec.panels[0].groups.map(({ name, color }) => ({ name, color }));

  return figure({ ...spec, legend, yValues }, (panel, area, py) => {
    const out = [];
    const slot = (area.right - area.left) / panel.categories.length;
    const barWidth = Math.min(24, (slot - 14) / panel.groups.length - 2);
    const groupWidth = panel.groups.length * (barWidth + 2) - 2;
    panel.categories.forEach((category, c) => {
      const center = area.left + slot * (c + 0.5);
      out.push(text(center, area.bottom + 15, category, { anchor: 'middle' }));
      panel.groups.forEach((group, g) => {
        const { mean, sd = 0 } = group.values[c];
        const x = center - groupWidth / 2 + g * (barWidth + 2);
        const top = Math.min(py(mean), py(0));
        const barHeight = Math.abs(py(mean) - py(0));
        const label = `${group.name}, ${category}: ${fmt(mean)}${sd ? ` ± ${fmt(sd)}` : ''}`;
        // Rounded at the data end, square on the baseline.
        const r = Math.min(4, barWidth / 2, barHeight);
        const bar = mean >= 0
          ? `M${x},${top + barHeight} v${-(barHeight - r)} q0,${-r} ${r},${-r} h${barWidth - 2 * r} q${r},0 ${r},${r} v${barHeight - r} z`
          : `M${x},${top} v${barHeight - r} q0,${r} ${r},${r} h${barWidth - 2 * r} q${r},0 ${r},${-r} v${-(barHeight - r)} z`;
        out.push(`<path d="${bar}" fill="${group.color}"><title>${esc(label)}</title></path>`);
        if (sd) {
          const mid = (x + barWidth / 2).toFixed(1);
          out.push(`<line x1="${mid}" x2="${mid}" y1="${py(mean + sd).toFixed(1)}" y2="${py(Math.max(0, mean - sd)).toFixed(1)}" stroke="${INK.secondary}" stroke-width="1"/>`);
        }
      });
    });
    return out;
  });
}

import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

const MARGIN = { top: 22, right: 14, bottom: 48, left: 58 };

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

// Line chart of one or more series of [{x, y}] points on a shared y axis,
// with a crosshair readout on hover. `series` gives each line's short name
// and colour; `xLabel` names the x unit in the readout (e.g. "Step").
// `reference` is the colour of an optional dashed horizontal line marking a
// fixed level.
export class LineChart {
  constructor(canvas, { series, xLabel, yLabel = '', yRange = null, xWindow = null, reference = null }) {
    this.canvas = canvas;
    this.series = series;
    this.reference = reference;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.yRange = yRange;
    this.xWindow = xWindow;
    this.hoverX = null;
    this.viewStart = null;
    this.latestStart = 0;
    this.drag = null;

    const pan = (start) => {
      const clamped = Math.max(0, Math.min(this.latestStart, start));
      this.viewStart = clamped >= this.latestStart ? null : clamped;
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.xWindow || e.button !== 0) return;
      this.drag = { x: e.clientX, start: this.viewStart ?? this.latestStart };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const plotWidth = canvas.clientWidth - MARGIN.left - MARGIN.right;
      if (plotWidth > 0) pan(this.drag.start - (e.clientX - this.drag.x) * this.xWindow / plotWidth);
    });
    const endDrag = () => {
      this.drag = null;
      canvas.style.cursor = this.xWindow ? 'grab' : '';
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', endDrag);
    canvas.addEventListener('wheel', (e) => {
      if (!this.xWindow || !e.deltaX) return;
      e.preventDefault();
      const plotWidth = canvas.clientWidth - MARGIN.left - MARGIN.right;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? plotWidth : 1;
      if (plotWidth > 0) pan((this.viewStart ?? this.latestStart) + e.deltaX * unit * this.xWindow / plotWidth);
    }, { passive: false });
    canvas.addEventListener('dblclick', () => { this.viewStart = null; });
    if (this.xWindow) {
      canvas.style.cursor = 'grab';
      canvas.style.touchAction = 'pan-y';
    }

    canvas.addEventListener('mousemove', (e) => {
      this.hoverX = e.clientX - canvas.getBoundingClientRect().left;
    });
    canvas.addEventListener('mouseleave', () => {
      this.hoverX = null;
    });
  }

  // `lines[i]` holds the points of `series[i]`; `referenceValue` is where the
  // reference line goes.
  draw(lines, referenceValue = null) {
    const { ctx, width, height } = prepareCanvas(this.canvas);
    const left = MARGIN.left;
    const right = width - MARGIN.right;
    const top = MARGIN.top;
    const bottom = height - MARGIN.bottom;

    let xMax = 10;
    let yMin = Math.min(0, referenceValue ?? 0);
    let yMax = Math.max(1, referenceValue ?? 0);
    for (const points of lines) {
      if (points.length) xMax = Math.max(xMax, points[points.length - 1].x);
      for (const p of points) {
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      }
    }
    if (this.yRange) [yMin, yMax] = this.yRange;
    const yStep = niceStep(yMax - yMin, 4);
    yMin = Math.floor(yMin / yStep) * yStep;
    yMax = Math.ceil(yMax / yStep) * yStep;

    // A reset replaces the history; resume following the new run.
    if (this.previousMax !== undefined && xMax < this.previousMax) this.viewStart = null;
    this.previousMax = xMax;
    this.latestStart = this.xWindow ? Math.max(0, xMax - this.xWindow) : 0;
    if (this.viewStart !== null) this.viewStart = Math.min(this.viewStart, this.latestStart);
    const xMin = this.xWindow ? (this.viewStart ?? this.latestStart) : 0;
    if (this.xWindow) xMax = xMin + this.xWindow;
    const px = (x) => left + ((x - xMin) / (xMax - xMin)) * (right - left);
    const py = (y) => bottom - ((y - yMin) / (yMax - yMin)) * (bottom - top);

    ctx.font = `11px ${CANVAS_FONT}`;
    ctx.lineWidth = 1;

    // Horizontal grid and y labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = yMin; y <= yMax + yStep / 2; y += yStep) {
      ctx.strokeStyle = Math.abs(y) < yStep / 2 ? cssVar('--axis') : cssVar('--grid');
      ctx.beginPath();
      ctx.moveTo(left, Math.round(py(y)) + 0.5);
      ctx.lineTo(right, Math.round(py(y)) + 0.5);
      ctx.stroke();
      ctx.fillStyle = cssVar('--text-muted');
      ctx.fillText(String(+y.toFixed(6)), left - 6, py(y));
    }

    // x labels
    ctx.textBaseline = 'top';
    const xStep = niceStep(xMax - xMin, 4);
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      ctx.textAlign = x === xMin ? 'left' : x === xMax ? 'right' : 'center';
      ctx.fillText(compact(x), px(x), bottom + 7);
    }

    // Axis titles sit outside the numeric tick labels.
    ctx.save();
    ctx.font = `12px ${CANVAS_FONT}`;
    ctx.fillStyle = cssVar('--text-secondary');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.xLabel === 'Step' ? 'Simulation steps' : this.xLabel, (left + right) / 2, height - 10);
    ctx.translate(13, (top + bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(this.yLabel, 0, 0);
    ctx.restore();

    if (this.reference && referenceValue !== null) {
      ctx.beginPath();
      ctx.moveTo(left, Math.round(py(referenceValue)) + 0.5);
      ctx.lineTo(right, Math.round(py(referenceValue)) + 0.5);
      ctx.strokeStyle = cssVar(this.reference);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();
    lines.forEach((points, i) => {
      if (points.length < 2) return;
      ctx.beginPath();
      points.forEach((p, j) => (j ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y))));
      ctx.strokeStyle = cssVar(this.series[i].colorVar);
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    ctx.restore();
    const visibleLines = lines.map((points) => points.filter((point) => point.x >= xMin && point.x <= xMax));
    if (this.hoverX !== null && this.hoverX >= left && this.hoverX <= right && visibleLines[0]?.length) {
      this.drawHover(ctx, visibleLines, px, py, { left, right, top, bottom });
    }
  }

  // The series are sampled at the same x positions, so one index serves all.
  drawHover(ctx, lines, px, py, { left, right, top, bottom }) {
    let nearest = 0;
    lines[0].forEach((p, i) => {
      if (Math.abs(px(p.x) - this.hoverX) < Math.abs(px(lines[0][nearest].x) - this.hoverX)) nearest = i;
    });
    const x = px(lines[0][nearest].x);

    ctx.strokeStyle = cssVar('--axis');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, top);
    ctx.lineTo(Math.round(x) + 0.5, bottom);
    ctx.stroke();

    const values = [];
    lines.forEach((points, i) => {
      const point = points[nearest];
      if (!point) return;
      ctx.beginPath();
      ctx.arc(x, py(point.y), 4, 0, Math.PI * 2);
      ctx.fillStyle = cssVar(this.series[i].colorVar);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = cssVar('--surface');
      ctx.stroke();
      values.push(`${this.series[i].name} ${point.y.toFixed(1)}`);
    });

    const text = `${this.xLabel} ${lines[0][nearest].x.toLocaleString()}:  ${values.join('   ')}`;
    ctx.font = `600 12px ${CANVAS_FONT}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = x > (left + right) / 2 ? 'left' : 'right';
    ctx.fillStyle = cssVar('--text-primary');
    ctx.fillText(text, ctx.textAlign === 'left' ? left : right, 2);
  }
}

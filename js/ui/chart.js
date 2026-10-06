import { cssVar, prepareCanvas, CANVAS_FONT } from './theme.js';

const MARGIN = { top: 22, right: 14, bottom: 26, left: 38 };

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

// Single-series line chart of [{x, y}] points, with a crosshair readout on
// hover. `xLabel` names the x unit in the readout (e.g. "Step").
export class LineChart {
  constructor(canvas, { colorVar, xLabel }) {
    this.canvas = canvas;
    this.colorVar = colorVar;
    this.xLabel = xLabel;
    this.hoverX = null;

    canvas.addEventListener('mousemove', (e) => {
      this.hoverX = e.clientX - canvas.getBoundingClientRect().left;
    });
    canvas.addEventListener('mouseleave', () => {
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

    const px = (x) => left + (x / xMax) * (right - left);
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
    const xStep = niceStep(xMax, 4);
    for (let x = 0; x <= xMax; x += xStep) {
      ctx.textAlign = x === 0 ? 'left' : 'center';
      ctx.fillText(compact(x), px(x), bottom + 7);
    }

    if (points.length > 1) {
      ctx.beginPath();
      points.forEach((p, i) => (i ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y))));
      ctx.strokeStyle = cssVar(this.colorVar);
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
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

    ctx.strokeStyle = cssVar('--axis');
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
    ctx.strokeStyle = cssVar('--surface');
    ctx.stroke();

    const text = `${this.xLabel} ${nearest.x.toLocaleString()}:  ${nearest.y.toFixed(2)}`;
    ctx.font = `600 12px ${CANVAS_FONT}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = x > (left + right) / 2 ? 'left' : 'right';
    ctx.fillStyle = cssVar('--text-primary');
    ctx.fillText(text, ctx.textAlign === 'left' ? left : right, 2);
  }
}

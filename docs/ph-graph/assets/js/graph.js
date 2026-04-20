export class ForceGraph {
  constructor(canvas, { onSelect } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onSelect = onSelect;
    this.nodes = [];
    this.edges = [];
    this.visibleLayers = new Set(['people', 'supernodes', 'blocks']);
    this.nodeFilter = null;
    this.selectedNodeId = null;
    this.hoverNodeId = null;
    this.transform = { x: 0, y: 0, k: 1 };
    this.drag = null;
    this.lastTime = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.bindEvents();
    this.resize();
    requestAnimationFrame((t) => this.tick(t));
  }

  setData({ nodes, edges }) {
    this.nodes = nodes.map((n, i) => ({ ...n, x: n.x ?? Math.cos(i) * 140, y: n.y ?? Math.sin(i) * 140, vx: 0, vy: 0 }));
    this.edges = edges;
  }

  setVisibleLayers(layers) {
    this.visibleLayers = new Set(layers);
  }

  setNodeFilter(filterFn) {
    this.nodeFilter = typeof filterFn === 'function' ? filterFn : null;
  }

  setSelectedNode(id) {
    this.selectedNodeId = id;
    if (this.onSelect) {
      const node = this.nodes.find((n) => n.id === id) || null;
      const connected = this.getConnectedNodes(id);
      const edges = this.getConnectedEdges(id);
      this.onSelect(node, connected, edges);
    }
  }

  getConnectedEdges(id) {
    if (!id) return [];
    return this.edges.filter((e) => e.source === id || e.target === id);
  }

  getConnectedNodes(id) {
    const linked = new Set();
    for (const e of this.edges) {
      if (e.source === id) linked.add(e.target);
      if (e.target === id) linked.add(e.source);
    }
    return this.nodes.filter((n) => linked.has(n.id));
  }

  visibleNodes() {
    return this.nodes.filter((n) => this.visibleLayers.has(n.layer) && (!this.nodeFilter || this.nodeFilter(n)));
  }

  visibleEdges() {
    const visible = new Set(this.visibleNodes().map((n) => n.id));
    return this.edges.filter((e) => visible.has(e.source) && visible.has(e.target));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * devicePixelRatio);
    this.canvas.height = Math.floor(rect.height * devicePixelRatio);
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture(e.pointerId);
      const world = this.toWorld(e.offsetX, e.offsetY);
      const hit = this.hitNode(world.x, world.y);
      this.drag = { pointerId: e.pointerId, startX: e.offsetX, startY: e.offsetY, mode: hit ? 'node' : 'pan', nodeId: hit?.id || null };
      if (hit) this.setSelectedNode(hit.id);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const world = this.toWorld(e.offsetX, e.offsetY);
      const hit = this.hitNode(world.x, world.y);
      this.hoverNodeId = hit?.id || null;
      if (!this.drag) return;
      if (this.drag.mode === 'pan') {
        this.transform.x += (e.offsetX - this.drag.startX) / this.transform.k;
        this.transform.y += (e.offsetY - this.drag.startY) / this.transform.k;
        this.drag.startX = e.offsetX;
        this.drag.startY = e.offsetY;
      } else {
        const node = this.nodes.find((n) => n.id === this.drag.nodeId);
        if (node) {
          node.x = world.x;
          node.y = world.y;
          node.vx *= 0.4;
          node.vy *= 0.4;
        }
      }
    });

    this.canvas.addEventListener('pointerup', () => { this.drag = null; });
    this.canvas.addEventListener('pointerleave', () => { this.hoverNodeId = null; });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      const nextK = Math.min(3.4, Math.max(0.35, this.transform.k * zoomFactor));
      const anchor = this.toWorld(e.offsetX, e.offsetY);
      this.transform.k = nextK;
      const after = this.toScreen(anchor.x, anchor.y);
      this.transform.x += (e.offsetX - after.x) / this.transform.k;
      this.transform.y += (e.offsetY - after.y) / this.transform.k;
    }, { passive: false });
  }

  resetView() {
    this.transform = { x: 0, y: 0, k: 1 };
  }

  toWorld(sx, sy) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    return {
      x: (sx - w / 2) / this.transform.k - this.transform.x,
      y: (sy - h / 2) / this.transform.k - this.transform.y,
    };
  }

  toScreen(x, y) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    return {
      x: (x + this.transform.x) * this.transform.k + w / 2,
      y: (y + this.transform.y) * this.transform.k + h / 2,
    };
  }

  hitNode(x, y) {
    const list = this.visibleNodes();
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const n = list[i];
      const r = n.radius || 8;
      if ((x - n.x) ** 2 + (y - n.y) ** 2 <= r ** 2) return n;
    }
    return null;
  }

  simulate(dt) {
    const nodes = this.visibleNodes();
    const edges = this.visibleEdges();
    if (!nodes.length) return;

    const repulsion = 5500;
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const d2 = Math.max(45, dx * dx + dy * dy);
        const f = (repulsion / d2) * dt;
        const d = Math.sqrt(d2);
        dx /= d;
        dy /= d;
        a.vx -= dx * f;
        a.vy -= dy * f;
        b.vx += dx * f;
        b.vy += dy * f;
      }
    }

    for (const e of edges) {
      const a = this.nodes.find((n) => n.id === e.source);
      const b = this.nodes.find((n) => n.id === e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const target = 90 + ((a.layer === 'blocks' || b.layer === 'blocks') ? 80 : 0);
      const f = (d - target) * 0.004 * dt;
      const nx = dx / d;
      const ny = dy / d;
      a.vx += nx * f;
      a.vy += ny * f;
      b.vx -= nx * f;
      b.vy -= ny * f;
    }

    for (const n of nodes) {
      n.vx *= 0.9;
      n.vy *= 0.9;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  tick(t) {
    const dt = Math.min(2.5, (t - (this.lastTime || t)) / 16.67);
    this.lastTime = t;
    this.simulate(dt);
    this.draw();
    requestAnimationFrame((tt) => this.tick(tt));
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const nodes = this.visibleNodes();
    const edges = this.visibleEdges();
    const connected = new Set(this.getConnectedNodes(this.selectedNodeId).map((n) => n.id));

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.transform.k, this.transform.k);
    ctx.translate(this.transform.x, this.transform.y);

    for (const e of edges) {
      const a = this.nodes.find((n) => n.id === e.source);
      const b = this.nodes.find((n) => n.id === e.target);
      if (!a || !b) continue;
      const isHighlighted = this.selectedNodeId && (a.id === this.selectedNodeId || b.id === this.selectedNodeId);
      const hue = e.influence >= 0 ? 166 : 349;
      const alpha = isHighlighted ? 0.95 : 0.24;
      ctx.strokeStyle = `hsla(${hue} 90% 66% / ${alpha})`;
      ctx.lineWidth = isHighlighted ? 2.2 : 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (const n of nodes) {
      const isSelected = n.id === this.selectedNodeId;
      const isNeighbor = connected.has(n.id);
      const isFaded = this.selectedNodeId && !isSelected && !isNeighbor;
      const radius = n.radius || 8;
      ctx.globalAlpha = isFaded ? 0.3 : 1;
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isSelected ? radius + 2 : radius, 0, Math.PI * 2);
      ctx.fill();
      if (isSelected || n.id === this.hoverNodeId) {
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      if (isSelected || this.transform.k > 1.35 || n.layer !== 'people') {
        ctx.fillStyle = 'rgba(234,240,255,0.9)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(n.name, n.x + radius + 4, n.y + 4);
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

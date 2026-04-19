import { ForceGraph } from './graph.js';

const LAYER_META = {
  people: { label: 'Pessoas', color: '#7ec4ff' },
  supernodes: { label: 'Supernós', color: '#8b7dff' },
  blocks: { label: 'Blocos', color: '#43d3a6' },
};

const typeColors = {
  institution: '#5ea6ff', political: '#ff8c6f', security: '#f871c8', economic: '#ffd166', civil: '#5de2b1', information: '#9f8cff', group: '#7dcfff', block: '#3dd3a5',
};

const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

function num(n) { return Number.isFinite(n) ? n : 0; }

function buildGraphData(seed) {
  const people = [];
  const edges = [];

  for (const p of seed.players || []) {
    people.push({
      id: `p-${p.id}`,
      sourceId: p.id,
      layer: 'people',
      name: p.name,
      type: p.type,
      score: (num(p.power) + num(p.cohesion) + num(p.legitimacy)) / 3,
      attrs: p,
      color: typeColors[p.type] || '#7ec4ff',
      radius: 7 + num(p.power) * 10,
    });
  }

  for (const g of seed.groups || []) {
    people.push({
      id: `g-${g.id}`,
      sourceId: g.id,
      layer: 'people',
      name: g.name,
      type: 'group',
      score: (num(g.mobilization) + num(g.grievance) + (1 - num(g.trustInstitutions))) / 3,
      attrs: g,
      color: typeColors.group,
      radius: 7 + num(g.size) * 18,
    });
  }

  const playerById = new Map((seed.players || []).map((p) => [p.id, p]));
  for (const r of seed.relations || []) {
    edges.push({
      source: `p-${r.source}`,
      target: `p-${r.target}`,
      influence: num(r.influence),
      kind: r.type,
      weight: Math.abs(num(r.influence)),
      volatility: num(r.volatility),
    });
  }

  // Ligações entre grupos e players derivadas do seed (sem mocks fixos).
  for (const g of seed.groups || []) {
    for (const p of seed.players || []) {
      const affinity = (num(g.trustInstitutions) * num(p.legitimacy) + num(g.mobilization) * num(p.power) + (1 - num(g.grievance)) * num(p.cohesion)) / 3;
      if (affinity > 0.36) {
        edges.push({
          source: `g-${g.id}`,
          target: `p-${p.id}`,
          influence: affinity - 0.5,
          kind: 'social-coupling',
          weight: affinity,
          volatility: 0.35 + (1 - num(g.trustInstitutions)) * 0.3,
        });
      }
    }
  }

  const supernodes = [];
  const playerBuckets = new Map();
  for (const p of seed.players || []) {
    const key = p.type;
    if (!playerBuckets.has(key)) playerBuckets.set(key, []);
    playerBuckets.get(key).push(p);
  }

  for (const [type, list] of playerBuckets.entries()) {
    const id = `s-${type}`;
    const avgPower = list.reduce((acc, it) => acc + num(it.power), 0) / list.length;
    supernodes.push({ id, layer: 'supernodes', name: `Supernó: ${type}`, type, score: avgPower, color: typeColors[type] || '#8b7dff', radius: 14 + avgPower * 12, attrs: { count: list.length, type } });
    for (const p of list) edges.push({ source: id, target: `p-${p.id}`, influence: 0.4, kind: 'aggregation', weight: 0.4, volatility: 0.1 });
  }

  const groupNode = {
    id: 's-groups', layer: 'supernodes', name: 'Supernó: social groups', type: 'group', score: 0.5,
    color: '#66c8ff', radius: 16, attrs: { count: (seed.groups || []).length, type: 'group' },
  };
  supernodes.push(groupNode);
  for (const g of seed.groups || []) edges.push({ source: 's-groups', target: `g-${g.id}`, influence: 0.38, kind: 'aggregation', weight: 0.38, volatility: 0.1 });

  const blocks = [
    { id: 'b-establishment', layer: 'blocks', name: 'Bloco: Establishment', type: 'block', color: '#3dd3a5', radius: 22, attrs: { desc: 'Instituições e poder formal' } },
    { id: 'b-society', layer: 'blocks', name: 'Bloco: Sociedade', type: 'block', color: '#8a86ff', radius: 22, attrs: { desc: 'Grupos sociais e opinião' } },
  ];

  for (const s of supernodes) {
    if (s.id === 's-groups' || s.type === 'civil' || s.type === 'information') {
      edges.push({ source: 'b-society', target: s.id, influence: 0.35, kind: 'block-link', weight: 0.35, volatility: 0.2 });
    } else {
      edges.push({ source: 'b-establishment', target: s.id, influence: 0.4, kind: 'block-link', weight: 0.4, volatility: 0.2 });
    }
  }
  edges.push({ source: 'b-establishment', target: 'b-society', influence: -0.16, kind: 'macro-tension', weight: 0.16, volatility: 0.52 });

  const nodes = [...people, ...supernodes, ...blocks];

  // posição inicial por anéis
  const rings = { blocks: 40, supernodes: 170, people: 290 };
  const grouped = ['blocks', 'supernodes', 'people'];
  grouped.forEach((layer) => {
    const list = nodes.filter((n) => n.layer === layer);
    list.forEach((n, i) => {
      const a = (Math.PI * 2 * i) / Math.max(1, list.length);
      const r = rings[layer] + Math.random() * 20;
      n.x = Math.cos(a) * r;
      n.y = Math.sin(a) * r;
    });
  });

  return { nodes, edges };
}

function updateMetrics(graph, layers) {
  const nodes = graph.nodes.filter((n) => layers.has(n.layer));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  const density = nodes.length > 1 ? (2 * edges.length) / (nodes.length * (nodes.length - 1)) : 0;

  qs('#metricNodes').textContent = nodes.length;
  qs('#metricEdges').textContent = edges.length;
  qs('#metricDensity').textContent = density.toFixed(3);
  qs('#graphStats').textContent = `${[...layers].join(' + ')} · ${nodes.length} nós / ${edges.length} arestas`;
}

function renderDetails(node, connected) {
  const panel = qs('#detailsPanel');
  if (!node) {
    panel.innerHTML = '<h2>Detalhe do nó</h2><p class="empty">Selecione um nó para explorar conexões e atributos.</p>';
    return;
  }
  const attrs = Object.entries(node.attrs || {})
    .filter(([, v]) => ['string', 'number'].includes(typeof v))
    .slice(0, 8)
    .map(([k, v]) => `<div><span>${k}</span><strong>${typeof v === 'number' ? v.toFixed(2) : v}</strong></div>`)
    .join('');
  const links = connected.slice(0, 10).map((n) => `<li>${n.name} <small>(${n.layer})</small></li>`).join('');

  panel.innerHTML = `
    <h2>${node.name}</h2>
    <p class="eyebrow">${node.layer} · ${node.type}</p>
    <div class="kv">${attrs || '<div><span>Sem atributos</span><strong>—</strong></div>'}</div>
    <h3>Conexões (${connected.length})</h3>
    <ul class="connections">${links || '<li>Nenhuma conexão visível</li>'}</ul>
  `;
}

async function init() {
  const seedUrl = '../ph-app/assets/sim/seed.json';
  const seed = await fetch(seedUrl).then((r) => r.json());
  const data = buildGraphData(seed);

  const legend = qs('#legendList');
  legend.innerHTML = Object.entries(LAYER_META)
    .map(([, item]) => `<li><span class="swatch" style="background:${item.color}"></span>${item.label}</li>`)
    .join('');

  const graph = new ForceGraph(qs('#graphCanvas'), { onSelect: renderDetails });
  graph.setData(data);

  const layerBoxes = qsa('input[data-layer]');
  const getLayers = () => new Set(layerBoxes.filter((i) => i.checked).map((i) => i.dataset.layer));

  const refreshLayers = () => {
    const layers = getLayers();
    graph.setVisibleLayers(layers);
    if (graph.selectedNodeId && !layers.has(graph.nodes.find((n) => n.id === graph.selectedNodeId)?.layer)) {
      graph.setSelectedNode(null);
    }
    updateMetrics(graph, layers);
  };

  layerBoxes.forEach((box) => box.addEventListener('change', refreshLayers));
  qs('#resetView').addEventListener('click', () => graph.resetView());

  qs('#themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
  });

  refreshLayers();
}

init().catch((err) => {
  qs('#graphStats').textContent = `Erro ao carregar seed: ${err.message}`;
});

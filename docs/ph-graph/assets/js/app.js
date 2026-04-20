import { ForceGraph } from './graph.js';

const LAYER_META = {
  people: { label: 'Pessoas', color: '#7ec4ff' },
  supernodes: { label: 'Supernós', color: '#8b7dff' },
  blocks: { label: 'Blocos', color: '#43d3a6' },
};

const ENTITY_TYPES = ['country', 'leader', 'person', 'company', 'institution'];
const TOP_INFLUENCERS_LIMIT = 60;
const MAX_VISIBLE_NODES = 220;

const typeColors = {
  institution: '#5ea6ff', political: '#ff8c6f', security: '#f871c8', economic: '#ffd166', civil: '#5de2b1', information: '#9f8cff', group: '#7dcfff', block: '#3dd3a5',
};

const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

function num(n) { return Number.isFinite(n) ? n : 0; }

function normalizeRegion(value) {
  return String(value || 'global').toLowerCase();
}

function inferEntityType(rawType, attrs = {}) {
  const direct = String(attrs.entityType || attrs.entity_type || rawType || '').toLowerCase();
  if (ENTITY_TYPES.includes(direct)) return direct;

  const name = String(attrs.name || '').toLowerCase();
  if (/president|prime minister|chancellor|rei|presidente/.test(name)) return 'leader';

  const map = {
    economic: 'company',
    political: 'leader',
    security: 'institution',
    civil: 'person',
    information: 'person',
    group: 'person',
    block: 'institution',
    institution: 'institution',
  };
  return map[direct] || 'institution';
}

function rankInfluence(node) {
  const attrs = node.attrs || {};
  const baseScore = num(node.score) * 100;
  const power = num(attrs.power || attrs.mobilization || attrs.size) * 100;
  return Math.round(baseScore * 0.6 + power * 0.4);
}

function buildGraphData(seed) {
  const people = [];
  const edges = [];

  for (const p of seed.players || []) {
    const region = normalizeRegion(p.region || p.country || p.geo || p.type);
    const entityType = inferEntityType(p.type, p);
    people.push({
      id: `p-${p.id}`,
      sourceId: p.id,
      layer: 'people',
      name: p.name,
      type: p.type,
      entityType,
      region,
      score: (num(p.power) + num(p.cohesion) + num(p.legitimacy)) / 3,
      influenceRank: 0,
      attrs: p,
      color: typeColors[p.type] || '#7ec4ff',
      radius: 7 + num(p.power) * 10,
    });
  }

  for (const g of seed.groups || []) {
    const region = normalizeRegion(g.region || g.country || 'society');
    const entityType = inferEntityType('group', g);
    people.push({
      id: `g-${g.id}`,
      sourceId: g.id,
      layer: 'people',
      name: g.name,
      type: 'group',
      entityType,
      region,
      score: (num(g.mobilization) + num(g.grievance) + (1 - num(g.trustInstitutions))) / 3,
      influenceRank: 0,
      attrs: g,
      color: typeColors.group,
      radius: 7 + num(g.size) * 18,
    });
  }

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
    const entityType = inferEntityType(type, { type });
    supernodes.push({ id, layer: 'supernodes', name: `Supernó: ${type}`, type, entityType, region: normalizeRegion(type), score: avgPower, influenceRank: 0, color: typeColors[type] || '#8b7dff', radius: 14 + avgPower * 12, attrs: { count: list.length, type } });
    for (const p of list) edges.push({ source: id, target: `p-${p.id}`, influence: 0.4, kind: 'aggregation', weight: 0.4, volatility: 0.1 });
  }

  const groupNode = {
    id: 's-groups', layer: 'supernodes', name: 'Supernó: social groups', type: 'group', entityType: 'person', region: 'society', score: 0.5,
    influenceRank: 0, color: '#66c8ff', radius: 16, attrs: { count: (seed.groups || []).length, type: 'group' },
  };
  supernodes.push(groupNode);
  for (const g of seed.groups || []) edges.push({ source: 's-groups', target: `g-${g.id}`, influence: 0.38, kind: 'aggregation', weight: 0.38, volatility: 0.1 });

  const blocks = [
    { id: 'b-establishment', layer: 'blocks', name: 'Bloco: Establishment', type: 'block', entityType: 'institution', region: 'establishment', score: 0.64, influenceRank: 0, color: '#3dd3a5', radius: 22, attrs: { desc: 'Instituições e poder formal' } },
    { id: 'b-society', layer: 'blocks', name: 'Bloco: Sociedade', type: 'block', entityType: 'person', region: 'society', score: 0.52, influenceRank: 0, color: '#8a86ff', radius: 22, attrs: { desc: 'Grupos sociais e opinião' } },
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
  const influenceById = new Map(nodes.map((n) => [n.id, rankInfluence(n)]));
  for (const e of edges) {
    influenceById.set(e.source, (influenceById.get(e.source) || 0) + Math.round(Math.abs(num(e.influence)) * 25));
    influenceById.set(e.target, (influenceById.get(e.target) || 0) + Math.round(Math.abs(num(e.influence)) * 25));
  }
  for (const n of nodes) n.influenceRank = influenceById.get(n.id) || 0;

  const rings = { blocks: 40, supernodes: 170, people: 290 };
  ['blocks', 'supernodes', 'people'].forEach((layer) => {
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

function updateMetrics(graph) {
  const nodes = graph.visibleNodes();
  const edges = graph.visibleEdges();
  const density = nodes.length > 1 ? (2 * edges.length) / (nodes.length * (nodes.length - 1)) : 0;

  qs('#metricNodes').textContent = nodes.length;
  qs('#metricEdges').textContent = edges.length;
  qs('#metricDensity').textContent = density.toFixed(3);
  qs('#graphStats').textContent = `${nodes.length} nós / ${edges.length} arestas`; 
}

function resolveRole(node) {
  const attrs = node.attrs || {};
  return attrs.role || attrs.title || attrs.position || node.type || 'n/a';
}

function resolveAffiliations(node, connected) {
  const attrs = node.attrs || {};
  if (Array.isArray(attrs.affiliations) && attrs.affiliations.length) return attrs.affiliations;
  return connected.filter((n) => n.layer !== 'people' || n.type !== node.type).slice(0, 4).map((n) => n.name);
}

function renderDetails(node, connected, connectedEdges = []) {
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

  const critical = connectedEdges
    .sort((a, b) => Math.abs(num(b.influence)) - Math.abs(num(a.influence)))
    .slice(0, 6)
    .map((e) => {
      const other = e.source === node.id ? connected.find((n) => n.id === e.target) : connected.find((n) => n.id === e.source);
      return `<li><strong>${other?.name || 'n/a'}</strong> · ${e.kind} · influência ${(num(e.influence) * 100).toFixed(0)}%</li>`;
    }).join('');

  const affiliations = resolveAffiliations(node, connected)
    .map((item) => `<li>${item}</li>`)
    .join('');

  panel.innerHTML = `
    <h2>${node.name}</h2>
    <p class="eyebrow">${node.layer} · ${node.entityType} · ${node.region}</p>
    <div class="kv role-box">
      <div><span>Papel</span><strong>${resolveRole(node)}</strong></div>
      <div><span>Tipo</span><strong>${node.entityType}</strong></div>
      <div><span>Influência</span><strong>${node.influenceRank}</strong></div>
    </div>
    <h3>Afiliações</h3>
    <ul class="connections">${affiliations || '<li>Sem afiliações mapeadas</li>'}</ul>
    <h3>Conexões críticas</h3>
    <ul class="connections">${critical || '<li>Nenhuma conexão visível</li>'}</ul>
    <h3>Atributos</h3>
    <div class="kv">${attrs || '<div><span>Sem atributos</span><strong>—</strong></div>'}</div>
  `;
}

async function init() {
  const seedUrl = '../ph-app/assets/sim/seed.v5.json';
  const seed = await fetch(seedUrl).then((r) => r.json());
  const data = buildGraphData(seed);

  const legend = qs('#legendList');
  legend.innerHTML = Object.entries(LAYER_META)
    .map(([, item]) => `<li><span class="swatch" style="background:${item.color}"></span>${item.label}</li>`)
    .join('');

  const graph = new ForceGraph(qs('#graphCanvas'), { onSelect: renderDetails });
  graph.setData(data);

  const regionFilter = qs('#regionFilter');
  const regions = [...new Set(data.nodes.map((n) => n.region).filter(Boolean))].sort();
  regionFilter.innerHTML += regions.map((r) => `<option value="${r}">${r}</option>`).join('');

  const filters = {
    entityType: 'all',
    region: 'all',
    quick: null,
  };

  const layerBoxes = qsa('input[data-layer]');
  const getLayers = () => new Set(layerBoxes.filter((i) => i.checked).map((i) => i.dataset.layer));

  const applyFilters = () => {
    const influencerIds = new Set(
      [...data.nodes]
        .sort((a, b) => b.influenceRank - a.influenceRank)
        .slice(0, TOP_INFLUENCERS_LIMIT)
        .map((node) => node.id)
    );

    const rankedIds = new Set(
      [...data.nodes]
        .sort((a, b) => b.influenceRank - a.influenceRank)
        .slice(0, MAX_VISIBLE_NODES)
        .map((node) => node.id)
    );

    graph.setNodeFilter((n) => {
      if (!rankedIds.has(n.id)) return false;
      if (filters.entityType !== 'all' && n.entityType !== filters.entityType) return false;
      if (filters.region !== 'all' && n.region !== filters.region) return false;
      if (filters.quick === 'countries' && n.entityType !== 'country') return false;
      if (filters.quick === 'leaders' && n.entityType !== 'leader') return false;
      if (filters.quick === 'companies' && n.entityType !== 'company') return false;
      if (filters.quick === 'influencers' && !influencerIds.has(n.id)) return false;
      return true;
    });

    const layers = getLayers();
    graph.setVisibleLayers(layers);

    const selected = graph.nodes.find((n) => n.id === graph.selectedNodeId);
    if (!selected || !graph.visibleNodes().some((n) => n.id === selected.id)) {
      graph.setSelectedNode(null);
    }
    updateMetrics(graph);
  };

  layerBoxes.forEach((box) => box.addEventListener('change', applyFilters));
  qs('#entityTypeFilter').addEventListener('change', (e) => {
    filters.entityType = e.target.value;
    filters.quick = null;
    applyFilters();
  });
  regionFilter.addEventListener('change', (e) => {
    filters.region = e.target.value;
    filters.quick = null;
    applyFilters();
  });

  qs('#quickViews').querySelectorAll('button[data-quick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.quick = btn.dataset.quick;
      applyFilters();
    });
  });

  qs('#resetView').addEventListener('click', () => graph.resetView());

  qs('#themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
  });

  applyFilters();
}

init().catch((err) => {
  qs('#graphStats').textContent = `Erro ao carregar seed: ${err.message}`;
});

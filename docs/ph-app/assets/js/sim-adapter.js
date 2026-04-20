const KPI_META = {
  riskConflict: { label: "Risco de conflito", kind: "risk" },
  institutionalStability: { label: "Estabilidade institucional", kind: "stability" },
  polarization: { label: "Polarização", kind: "risk" },
  economicResilience: { label: "Resiliência econômica", kind: "stability" }
};

const DRIVER_LABELS = {
  avgGroupGrievance: "Grievance média dos grupos",
  avgGroupMobilization: "Mobilização média dos grupos",
  avgGroupTrust: "Confiança média institucional",
  avgRelationVolatility: "Volatilidade das relações",
  rivalryPressure: "Pressão de rivalidade",
  avgLegitimacy: "Legitimidade média",
  avgCohesion: "Coesão média",
  inflation: "Inflação",
  unemployment: "Desemprego",
  investmentConfidence: "Confiança de investimento",
  tradeFlow: "Fluxo comercial",
  fiscalSpace: "Espaço fiscal",
  gdpTrend: "Tendência do PIB"
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function asNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toPct(v) {
  return Math.round(clamp(asNumber(v, 0), 0, 1) * 100);
}

function scoreGroup(g = {}) {
  const grievance = asNumber(g.grievance, 0.5);
  const mobilization = asNumber(g.mobilization, 0.5);
  const trust = asNumber(g.trustInstitutions ?? g.trust, 0.5);
  return toPct(grievance * 0.45 + mobilization * 0.35 + (1 - trust) * 0.2);
}

function scorePlayer(p = {}) {
  const legitimacy = asNumber(p.legitimacy, 0.5);
  const cohesion = asNumber(p.cohesion, 0.5);
  const power = asNumber(p.power, 0.5);
  const resourceBase = asNumber(p.resourceBase ?? p.resources, 0.5);
  return toPct((1 - legitimacy) * 0.45 + (1 - cohesion) * 0.25 + power * 0.15 + (1 - resourceBase) * 0.15);
}

function scoreRelation(r = {}) {
  const volatility = asNumber(r.volatility, 0.5);
  const influence = asNumber(r.influence, 0);
  return toPct(volatility * 0.6 + Math.max(0, -influence) * 0.4);
}

function scoreNodeByLayer(node = {}, layer) {
  if (typeof node.risk === "number") return toPct(node.risk);
  if (layer === "people") return scoreGroup(node);
  if (layer === "supernodes") return scorePlayer(node);
  if (layer === "blocks") return scoreRelation(node);
  return toPct(asNumber(node.volatility ?? node.grievance ?? node.power, 0.5));
}

function mapEvent(ev) {
  const direction = asNumber(ev.intensity, 0) >= 0.18 ? "+alto" : "+moderado";
  return {
    time: `Step ${ev.step}`,
    title: `${ev.name || "Evento"} [${ev.scope || "generic"}]`,
    impact: direction
  };
}

function buildFrame(step, kpis, explainability, eventsApplied, snapshot) {
  const safe = {
    riskConflict: asNumber(kpis?.riskConflict, 0),
    institutionalStability: asNumber(kpis?.institutionalStability, 0),
    polarization: asNumber(kpis?.polarization, 0),
    economicResilience: asNumber(kpis?.economicResilience, 0)
  };

  return {
    id: step,
    label: step === 0 ? "T0 · Seed" : `T+${step}`,
    score: toPct((safe.riskConflict + safe.polarization + (1 - safe.institutionalStability) + (1 - safe.economicResilience)) / 4),
    events: (eventsApplied || []).map(mapEvent),
    kpis: safe,
    explainability: explainability || { timestamp: step, topDrivers: [] },
    snapshot: snapshot || {}
  };
}

function baselineFrame(sim) {
  const state = sim.getState();
  const kpis = sim.computeKpis();
  const explainability = sim.explain(6);
  return buildFrame(0, kpis, explainability, [], state);
}

function normalizeLayerNode(raw = {}, layer, idx) {
  const id = String(raw.id ?? raw.key ?? `${layer}-${idx}`);
  const label = String(raw.label ?? raw.name ?? raw.title ?? id);
  const region = String(raw.region ?? raw.type ?? raw.segment ?? layer);
  const attrs = raw.attrs && typeof raw.attrs === "object" ? raw.attrs : {
    ...raw,
    id: undefined,
    key: undefined,
    label: undefined,
    name: undefined,
    title: undefined,
    region: undefined,
    layer: undefined,
    risk: undefined
  };

  return {
    id,
    label,
    region,
    risk: scoreNodeByLayer(raw, layer),
    attrs
  };
}

function makePeople(groups = []) {
  return groups.map((g, idx) => ({
    id: String(g.id ?? `group-${idx}`),
    label: g.name || g.label || `Group ${idx + 1}`,
    region: "groups",
    segment: "social",
    risk: scoreGroup(g),
    supernode: "players",
    block: "relations",
    attrs: {
      grievance: toPct(g.grievance),
      mobilization: toPct(g.mobilization),
      trustInstitutions: toPct(g.trustInstitutions),
      size: Math.round(asNumber(g.size, 0) * 100)
    }
  }));
}

function makeSupernodes(players = []) {
  return players.map((p, idx) => ({
    id: String(p.id ?? `player-${idx}`),
    label: p.name || p.label || `Player ${idx + 1}`,
    region: p.type || "institution",
    risk: scorePlayer(p),
    blocks: ["relations"],
    attrs: {
      power: toPct(p.power),
      cohesion: toPct(p.cohesion),
      legitimacy: toPct(p.legitimacy),
      resourceBase: toPct(p.resourceBase)
    }
  }));
}

function makeBlocks(relations = []) {
  return relations.map((r, idx) => ({
    id: String(r.id ?? `${r.source ?? "src"}->${r.target ?? "dst"}-${idx}`),
    label: `${r.source ?? "?"} → ${r.target ?? "?"}`,
    region: r.type || "relation",
    risk: scoreRelation(r),
    attrs: {
      influence: Math.round(asNumber(r.influence, 0) * 100),
      volatility: toPct(r.volatility),
      type: r.type || "relation"
    }
  }));
}

function buildLayerNetwork(snapshot = {}) {
  const fallback = {
    people: makePeople(snapshot.groups || []),
    supernodes: makeSupernodes(snapshot.players || []),
    blocks: makeBlocks(snapshot.relations || [])
  };

  const layers = snapshot.layers || {};
  const people = Array.isArray(layers.people) ? layers.people.map((n, i) => normalizeLayerNode(n, "people", i)) : fallback.people;
  const supernodes = Array.isArray(layers.supernodes) ? layers.supernodes.map((n, i) => normalizeLayerNode(n, "supernodes", i)) : fallback.supernodes;
  const blocks = Array.isArray(layers.blocks) ? layers.blocks.map((n, i) => normalizeLayerNode(n, "blocks", i)) : fallback.blocks;

  return { people, supernodes, blocks };
}

export async function createPHAdapter({ seedUrl = "./assets/sim/seed.json", rngSeed = 1337, apiClient = null } = {}) {
  if (!window.PHSim) {
    throw new Error("PHSim indisponível. Verifique o carregamento de assets/sim/engine.js");
  }

  let seed = null;
  let mode = "local";

  if (apiClient?.isEnabled?.()) {
    try {
      await apiClient.health();
      seed = await apiClient.getSeed();
      mode = "api";
    } catch (err) {
      console.warn("API indisponível; fallback local ativado.", err?.message || err);
    }
  }

  if (!seed) {
    const resp = await fetch(seedUrl);
    if (!resp.ok) throw new Error(`Falha ao carregar seed: ${resp.status}`);
    seed = await resp.json();
  }

  const sim = window.PHSim.createSimulator(seed, { rngSeed });
  const frames = [baselineFrame(sim)];

  function ensureFrame(index) {
    while (frames.length <= index) {
      const next = sim.step({ topDrivers: 6 });
      frames.push(buildFrame(next.step, next.kpis, next.explainability, next.eventsApplied, sim.getState()));
    }
    return frames[index];
  }

  function getFrame(index) {
    if (index < 0) return frames[0];
    return ensureFrame(index);
  }

  function horizonToSteps(horizonDays) {
    if (horizonDays <= 7) return 3;
    if (horizonDays <= 30) return 8;
    return 12;
  }

  function getKpiCards(frame, filters) {
    const horizon = Number(filters?.horizon || 30);
    const stepsInWindow = horizonToSteps(horizon);
    const inWindow = frames.slice(0, Math.max(1, Math.min(frames.length, stepsInWindow + 1)));
    const eventCount = inWindow.reduce((acc, f) => acc + (f.events || []).length, 0);

    const groups = frame?.snapshot?.groups || frame?.snapshot?.layers?.people || [];
    const players = frame?.snapshot?.players || frame?.snapshot?.layers?.supernodes || [];

    return {
      kpiRisk: `${toPct(frame?.kpis?.riskConflict)}%`,
      kpiCritical: String(groups.filter((g) => scoreGroup(g) >= Number(filters?.riskThreshold || 40)).length),
      kpiSupernodes: String(players.length),
      kpiEvents: String(eventCount)
    };
  }

  function getDrivers(frame) {
    const list = frame?.explainability?.topDrivers || [];
    const total = list.reduce((acc, d) => acc + Math.abs(d.signedImpact || 0), 0) || 1;

    return list.map((d) => {
      const pct = Math.round((Math.abs(d.signedImpact || 0) / total) * 100);
      return {
        key: d.driver,
        label: DRIVER_LABELS[d.driver] || d.driver,
        target: KPI_META[d.target]?.label || d.target,
        weight: pct,
        explanation: `Impacto em ${KPI_META[d.target]?.label || d.target}`
      };
    });
  }

  function getNetwork(frame, level, filters) {
    const network = buildLayerNetwork(frame?.snapshot || {});
    let out = network[level] || [];
    const query = String(filters?.query || "").toLowerCase().trim();

    if (filters?.region && filters.region !== "all") {
      out = out.filter((n) => n.region === filters.region || (filters.region === "groups" && n.region === "groups"));
    }

    if (query) out = out.filter((n) => JSON.stringify(n).toLowerCase().includes(query));
    if (filters?.riskThreshold != null) out = out.filter((n) => n.risk >= Number(filters.riskThreshold));
    return out;
  }

  return {
    seed,
    getFrame,
    ensureFrame,
    getKpiCards,
    getDrivers,
    getNetwork,
    getStatus() {
      return { mode };
    }
  };
}

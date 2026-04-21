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

const ENTITY_TYPES = ["country", "leader", "person", "company", "institution"];
const MAX_NETWORK_RESULTS = 140;

const SCENARIO_PRESETS = {
  war: {
    id: "war",
    label: "War",
    description: "Escalada militar, rupturas diplomáticas e choque de confiança institucional.",
    profile: { riskConflict: 1, institutionalStability: -0.45, polarization: 0.7, economicResilience: -0.35 }
  },
  energy_shock: {
    id: "energy_shock",
    label: "Energy Shock",
    description: "Disrupção de energia e cadeias de suprimento com impacto macroeconômico.",
    profile: { riskConflict: 0.35, institutionalStability: -0.2, polarization: 0.35, economicResilience: -0.9 }
  },
  tech_sanctions: {
    id: "tech_sanctions",
    label: "Tech Sanctions",
    description: "Sanções tecnológicas, desacoplamento de blocos e pressão industrial.",
    profile: { riskConflict: 0.4, institutionalStability: -0.25, polarization: 0.45, economicResilience: -0.55 }
  },
  election_crisis: {
    id: "election_crisis",
    label: "Election Crisis",
    description: "Crise eleitoral com contestação de legitimidade e aumento de polarização.",
    profile: { riskConflict: 0.55, institutionalStability: -0.8, polarization: 1, economicResilience: -0.25 }
  }
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function toPct(v) {
  return Math.round(clamp(v, 0, 1) * 100);
}

function normalizeScenarioScope(scope) {
  const allowed = ["global", "americas", "europe", "asia", "middle-east", "africa"];
  return allowed.includes(scope) ? scope : "global";
}

function scopeMatches(region, scope) {
  if (!scope || scope === "global") return true;
  const r = normalizeRegion(region);
  if (scope === "americas") return /america|latam|north america|south america/.test(r);
  if (scope === "europe") return /europe|eu|euro/.test(r);
  if (scope === "asia") return /asia|indo-pacific|pacific/.test(r);
  if (scope === "middle-east") return /middle east|mena|gulf/.test(r);
  if (scope === "africa") return /africa/.test(r);
  return true;
}

function buildScenarioEvent(scenario, frame) {
  return {
    time: frame.label,
    title: `${scenario.label} · intensidade ${scenario.intensity}% · escopo ${scenario.scope}`,
    impact: scenario.intensity >= 70 ? "+alto" : "+moderado"
  };
}

function scoreGroup(g) {
  return toPct(g.grievance * 0.45 + g.mobilization * 0.35 + (1 - g.trustInstitutions) * 0.20);
}

function scorePlayer(p) {
  return toPct((1 - p.legitimacy) * 0.45 + (1 - p.cohesion) * 0.25 + p.power * 0.15 + (1 - p.resourceBase) * 0.15);
}

function scoreRelation(r) {
  return toPct(r.volatility * 0.6 + Math.max(0, -r.influence) * 0.4);
}

function mapEvent(ev) {
  const direction = ev.intensity >= 0.18 ? "+alto" : "+moderado";
  const source = ev.source || ev.sourceRef || ev.origin || "dataset";
  const confidence = String(ev.confidence || ev.confidenceLevel || "medium").toLowerCase();
  return {
    time: `Step ${ev.step}`,
    step: Number(ev.step || 0),
    title: `${ev.name} [${ev.scope}]`,
    impact: direction,
    source,
    confidence,
    category: String(ev.category || "geo").toLowerCase()
  };
}

function buildFrame(step, kpis, explainability, eventsApplied, snapshot) {
  return {
    id: step,
    label: step === 0 ? "T0 · Seed" : `T+${step}`,
    score: toPct((kpis.riskConflict + kpis.polarization + (1 - kpis.institutionalStability) + (1 - kpis.economicResilience)) / 4),
    events: eventsApplied.map(mapEvent),
    kpis,
    explainability,
    snapshot
  };
}

function baselineFrame(sim) {
  const state = sim.getState();
  const kpis = sim.computeKpis();
  const explainability = sim.explain(6);
  return buildFrame(0, kpis, explainability, [], state);
}

function inferEntityType(rawType, attrs = {}) {
  const direct = String(attrs.entityType || attrs.entity_type || rawType || "").toLowerCase();
  if (ENTITY_TYPES.includes(direct)) return direct;

  const name = String(attrs.name || "").toLowerCase();
  if (/president|prime minister|chancellor|rei|presidente/.test(name)) return "leader";

  const map = {
    economic: "company",
    political: "leader",
    security: "institution",
    civil: "person",
    information: "person",
    group: "person",
    block: "institution",
    institution: "institution"
  };

  return map[direct] || "institution";
}

function normalizeRegion(value) {
  return String(value || "global").toLowerCase();
}

function normalizeQuickView(data, quickView) {
  if (!quickView || quickView === "all") return data;
  if (quickView === "countries") return data.filter((n) => n.entityType === "country");
  if (quickView === "leaders") return data.filter((n) => n.entityType === "leader");
  if (quickView === "companies") return data.filter((n) => n.entityType === "company");
  if (quickView === "influencers") {
    return [...data].sort((a, b) => b.influence - a.influence).slice(0, 50);
  }
  return data;
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
  const maxStep = Math.max(12, ...(seed?.events || []).map((e) => Number(e.atStep || e.step || 0)));

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

  function buildScenario(input = {}) {
    const preset = SCENARIO_PRESETS[input.presetId] || SCENARIO_PRESETS.war;
    return {
      name: input.name || preset.label,
      presetId: preset.id,
      label: preset.label,
      description: preset.description,
      intensity: clamp(Number(input.intensity ?? 50), 0, 100),
      scope: normalizeScenarioScope(input.scope || "global"),
      profile: { ...preset.profile }
    };
  }

  function getFrameForScenario(index, scenarioInput) {
    const base = getFrame(index);
    if (!scenarioInput?.presetId) return base;

    const scenario = buildScenario(scenarioInput);
    const strength = scenario.intensity / 100;
    const stepGain = 0.55 + Math.min(index, 12) / 12;

    const applyDelta = (value, profileDelta) => clamp(value + profileDelta * 0.28 * strength * stepGain, 0, 1);

    const kpis = {
      riskConflict: applyDelta(base.kpis.riskConflict, scenario.profile.riskConflict),
      institutionalStability: applyDelta(base.kpis.institutionalStability, scenario.profile.institutionalStability),
      polarization: applyDelta(base.kpis.polarization, scenario.profile.polarization),
      economicResilience: applyDelta(base.kpis.economicResilience, scenario.profile.economicResilience)
    };

    const scopedPlayers = (base.snapshot.players || []).map((p) => {
      if (!scopeMatches(p.region || p.country || p.type, scenario.scope)) return p;
      return {
        ...p,
        legitimacy: clamp(p.legitimacy - 0.2 * strength * Math.max(0, -scenario.profile.institutionalStability), 0, 1),
        cohesion: clamp(p.cohesion - 0.16 * strength * Math.max(0, scenario.profile.polarization), 0, 1),
        resourceBase: clamp(p.resourceBase - 0.18 * strength * Math.max(0, -scenario.profile.economicResilience), 0, 1)
      };
    });

    const scopedGroups = (base.snapshot.groups || []).map((g) => {
      if (!scopeMatches(g.region || g.country, scenario.scope)) return g;
      return {
        ...g,
        grievance: clamp(g.grievance + 0.2 * strength * Math.max(0, scenario.profile.polarization), 0, 1),
        mobilization: clamp(g.mobilization + 0.15 * strength * Math.max(0, scenario.profile.riskConflict), 0, 1),
        trustInstitutions: clamp(g.trustInstitutions - 0.2 * strength * Math.max(0, -scenario.profile.institutionalStability), 0, 1)
      };
    });

    const snapshot = {
      ...base.snapshot,
      players: scopedPlayers,
      groups: scopedGroups
    };

    return {
      ...base,
      score: toPct((kpis.riskConflict + kpis.polarization + (1 - kpis.institutionalStability) + (1 - kpis.economicResilience)) / 4),
      kpis,
      snapshot,
      events: [...(base.events || []), buildScenarioEvent(scenario, base)]
    };
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
    const eventCount = inWindow.reduce((acc, f) => acc + f.events.length, 0);

    return {
      kpiRisk: `${toPct(frame.kpis.riskConflict)}%`,
      kpiCritical: String((frame.snapshot.groups || []).filter((g) => scoreGroup(g) >= Number(filters?.riskThreshold || 40)).length),
      kpiSupernodes: String((frame.snapshot.players || []).length),
      kpiEvents: String(eventCount)
    };
  }

  function explainDirection(target, signedImpact) {
    const up = signedImpact >= 0;
    if (target === "riskConflict" || target === "polarization") {
      return up ? "puxou para cima" : "puxou para baixo";
    }
    return up ? "fortaleceu" : "enfraqueceu";
  }

  function contextualEvidence(driverKey, frame, prevFrame) {
    const macro = frame?.snapshot?.macro || {};
    const prevMacro = prevFrame?.snapshot?.macro || {};
    const rels = frame?.snapshot?.relations || [];
    const prevRels = prevFrame?.snapshot?.relations || [];

    if (driverKey in macro) {
      const now = toPct(macro[driverKey]);
      const before = toPct(prevMacro[driverKey] ?? macro[driverKey]);
      const delta = now - before;
      const trend = delta === 0 ? "estável" : delta > 0 ? `+${delta} pts` : `${delta} pts`;
      return `Macro: ${DRIVER_LABELS[driverKey] || driverKey} em ${now}% (${trend} vs frame anterior).`;
    }

    if (driverKey === "avgRelationVolatility") {
      const now = toPct((rels.reduce((acc, r) => acc + Number(r.volatility || 0), 0) / Math.max(1, rels.length)) || 0);
      const before = toPct((prevRels.reduce((acc, r) => acc + Number(r.volatility || 0), 0) / Math.max(1, prevRels.length)) || 0);
      return `Relações: volatilidade média em ${now}% (${now - before >= 0 ? "+" : ""}${now - before} pts).`;
    }

    if (driverKey === "rivalryPressure") {
      const hostile = rels.filter((r) => Number(r.influence || 0) < 0).length;
      return `Relações: ${hostile} conexões com influência negativa no frame atual.`;
    }

    const groups = frame?.snapshot?.groups || [];
    if (driverKey === "avgGroupMobilization") {
      const v = toPct(groups.reduce((acc, g) => acc + Number(g.mobilization || 0), 0) / Math.max(1, groups.length));
      return `Grupos: mobilização média em ${v}% neste frame.`;
    }
    if (driverKey === "avgGroupGrievance") {
      const v = toPct(groups.reduce((acc, g) => acc + Number(g.grievance || 0), 0) / Math.max(1, groups.length));
      return `Grupos: grievance média em ${v}% neste frame.`;
    }
    if (driverKey === "avgGroupTrust") {
      const v = toPct(groups.reduce((acc, g) => acc + Number(g.trustInstitutions || 0), 0) / Math.max(1, groups.length));
      return `Grupos: confiança institucional média em ${v}% neste frame.`;
    }

    return "Evidência contextual derivada do estado consolidado do frame.";
  }

  function getDrivers(frame, prevFrame = null) {
    const list = frame.explainability?.topDrivers || [];
    const total = list.reduce((acc, d) => acc + Math.abs(d.signedImpact || 0), 0) || 1;

    return list.map((d) => {
      const pct = Math.round((Math.abs(d.signedImpact || 0) / total) * 100);
      const targetLabel = KPI_META[d.target]?.label || d.target;
      return {
        key: d.driver,
        label: DRIVER_LABELS[d.driver] || d.driver,
        target: targetLabel,
        weight: pct,
        explanation: `${DRIVER_LABELS[d.driver] || d.driver} ${explainDirection(d.target, d.signedImpact || 0)} ${targetLabel.toLowerCase()}.`,
        evidence: contextualEvidence(d.driver, frame, prevFrame)
      };
    });
  }

  function getWhyRiskMoved(frame, prevFrame = null) {
    const previous = prevFrame || frame;
    const mainEvent = frame.events?.[0] || null;
    const top = getDrivers(frame, previous)[0] || null;
    const macro = frame?.snapshot?.macro || {};
    const prevMacro = previous?.snapshot?.macro || macro;
    const macroDelta = ["inflation", "unemployment", "investmentConfidence", "tradeFlow", "fiscalSpace", "gdpTrend"]
      .map((k) => ({ key: k, delta: toPct(macro[k]) - toPct(prevMacro[k] ?? macro[k]) }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];

    const rels = frame?.snapshot?.relations || [];
    const relVol = toPct((rels.reduce((acc, r) => acc + Number(r.volatility || 0), 0) / Math.max(1, rels.length)) || 0);

    return {
      summary: top
        ? `O risco mudou porque ${top.label.toLowerCase()} teve maior peso neste frame.`
        : "O risco mudou por combinação de eventos e dinâmica estrutural.",
      chain: [
        {
          stage: "Evento",
          text: mainEvent ? `${mainEvent.title} (${mainEvent.time})` : "Sem evento explícito; mudança veio da dinâmica interna do modelo."
        },
        {
          stage: "Macro",
          text: macroDelta ? `${DRIVER_LABELS[macroDelta.key] || macroDelta.key}: ${macroDelta.delta >= 0 ? "+" : ""}${macroDelta.delta} pts.` : "Sem variação macro relevante no frame."
        },
        {
          stage: "Relações",
          text: `Volatilidade média das relações em ${relVol}%, influenciando propagação de tensão/cooperação.`
        },
        {
          stage: "KPI",
          text: `Risco de conflito: ${toPct(frame.kpis?.riskConflict)}% (antes ${toPct(previous.kpis?.riskConflict)}%).`
        }
      ]
    };
  }

  function getCausalTimeline(frameIndex) {
    const start = Math.max(0, frameIndex - 3);
    const points = [];
    for (let i = start; i <= frameIndex; i += 1) {
      const cur = getFrame(i);
      const prev = getFrame(Math.max(0, i - 1));
      const riskNow = toPct(cur.kpis?.riskConflict);
      const riskPrev = toPct(prev.kpis?.riskConflict);
      const delta = riskNow - riskPrev;
      const top = getDrivers(cur, prev)[0];
      points.push({
        label: cur.label,
        risk: riskNow,
        delta,
        cause: top ? `${top.label} (${top.weight}% do impacto)` : "Causa difusa",
        event: cur.events?.[0]?.title || "Sem evento dominante"
      });
    }
    return points;
  }

  function makePeople(groups) {
    return groups.map((g) => ({
      id: g.id,
      label: g.name,
      entityType: inferEntityType("group", g),
      region: normalizeRegion(g.region || g.country || "society"),
      role: g.role || "Grupo social estratégico",
      affiliations: ["Sociedade civil"],
      risk: scoreGroup(g),
      influence: scoreGroup(g) + toPct(g.mobilization || 0),
      connections: [],
      attrs: {
        grievance: toPct(g.grievance),
        mobilization: toPct(g.mobilization),
        trustInstitutions: toPct(g.trustInstitutions),
        size: Math.round(g.size * 100)
      }
    }));
  }

  function makeSupernodes(players) {
    return players.map((p) => ({
      id: p.id,
      label: p.name,
      entityType: inferEntityType(p.type, p),
      region: normalizeRegion(p.region || p.country || p.type),
      role: p.role || p.title || p.type,
      affiliations: [p.type, "Rede institucional"],
      risk: scorePlayer(p),
      influence: scorePlayer(p) + toPct(p.power || 0),
      connections: [],
      attrs: {
        power: toPct(p.power),
        cohesion: toPct(p.cohesion),
        legitimacy: toPct(p.legitimacy),
        resourceBase: toPct(p.resourceBase)
      }
    }));
  }

  function makeBlocks(relations) {
    return relations.map((r, idx) => ({
      id: `${r.source}->${r.target}-${idx}`,
      label: `${r.source} → ${r.target}`,
      entityType: "institution",
      region: normalizeRegion(r.region || r.type),
      role: "Conexão crítica",
      affiliations: [r.type],
      risk: scoreRelation(r),
      influence: scoreRelation(r) + toPct(Math.abs(r.influence || 0)),
      connections: [],
      attrs: {
        influence: Math.round(r.influence * 100),
        volatility: toPct(r.volatility),
        type: r.type
      }
    }));
  }

  function bindConnections(nodes, relations) {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    for (const rel of relations || []) {
      if (byId.has(rel.source) && byId.has(rel.target)) {
        byId.get(rel.source).connections.push(rel.target);
        byId.get(rel.target).connections.push(rel.source);
      }
    }
    return nodes;
  }

  function getNetwork(frame, level, filters) {
    const { groups = [], players = [], relations = [] } = frame.snapshot || {};

    const people = bindConnections(makePeople(groups), []);
    const supernodes = bindConnections(makeSupernodes(players), relations);
    const blocks = makeBlocks(relations);

    const data = { people, supernodes, blocks };
    let out = data[level] || [];

    if (filters?.entityType && filters.entityType !== "all") {
      out = out.filter((n) => n.entityType === filters.entityType);
    }

    if (filters?.region && filters.region !== "all") {
      out = out.filter((n) => n.region === filters.region);
    }

    const query = String(filters?.query || "").toLowerCase().trim();
    if (query) out = out.filter((n) => JSON.stringify(n).toLowerCase().includes(query));
    if (filters?.riskThreshold != null) out = out.filter((n) => n.risk >= Number(filters.riskThreshold));

    out = normalizeQuickView(out, filters?.quickView || "all");

    out = [...out]
      .sort((a, b) => (b.influence || 0) - (a.influence || 0) || (b.risk || 0) - (a.risk || 0))
      .slice(0, MAX_NETWORK_RESULTS);

    return out;
  }

  function getRegions(frame) {
    const { groups = [], players = [], relations = [] } = frame.snapshot || {};
    const set = new Set();
    [...makePeople(groups), ...makeSupernodes(players), ...makeBlocks(relations)].forEach((n) => set.add(n.region));
    return [...set].filter(Boolean).sort();
  }

  function getMacroTrends(frame) {
    const m = frame?.snapshot?.macro || {};
    const pct = (v) => `${Math.round(clamp(Number(v || 0), 0, 1) * 100)}%`;
    return [
      { key: "inflation", label: "Inflação global", value: pct(m.inflation) },
      { key: "unemployment", label: "Desemprego global", value: pct(m.unemployment) },
      { key: "investmentConfidence", label: "Confiança investimento", value: pct(m.investmentConfidence) },
      { key: "tradeFlow", label: "Fluxo comercial", value: pct(m.tradeFlow) },
      { key: "fiscalSpace", label: "Espaço fiscal", value: pct(m.fiscalSpace) },
      { key: "gdpTrend", label: "Tendência do PIB", value: pct(m.gdpTrend) }
    ];
  }

  function getMacroTrendSeries(key, upToIndex = 12) {
    const absoluteMax = Math.max(12, ...(seed?.events || []).map((e) => Number(e.atStep || e.step || 0)));
    const max = Math.max(0, Math.min(Number(upToIndex || 0), absoluteMax));
    const vals = [];
    for (let i = 0; i <= max; i += 1) {
      const f = getFrame(i);
      vals.push(clamp(Number(f?.snapshot?.macro?.[key] || 0), 0, 1));
    }
    return vals;
  }

  return {
    seed,
    getFrame,
    getFrameForScenario,
    ensureFrame,
    getKpiCards,
    getDrivers,
    getWhyRiskMoved,
    getCausalTimeline,
    getNetwork,
    getRegions,
    getMacroTrends,
    getMacroTrendSeries,
    getMaxStep() {
      return Math.max(12, ...(seed?.events || []).map((e) => Number(e.atStep || e.step || 0)));
    },
    getScenarioPresets() {
      return Object.values(SCENARIO_PRESETS);
    },
    buildScenario,
    getStatus() {
      return { mode };
    }
  };
}

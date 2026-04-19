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

function toPct(v) {
  return Math.round(clamp(v, 0, 1) * 100);
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
  return {
    time: `Step ${ev.step}`,
    title: `${ev.name} [${ev.scope}]`,
    impact: direction
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

export async function createPHAdapter({ seedUrl = "./assets/sim/seed.json", rngSeed = 1337 } = {}) {
  if (!window.PHSim) {
    throw new Error("PHSim indisponível. Verifique o carregamento de assets/sim/engine.js");
  }

  const resp = await fetch(seedUrl);
  if (!resp.ok) throw new Error(`Falha ao carregar seed: ${resp.status}`);
  const seed = await resp.json();

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
    const eventCount = inWindow.reduce((acc, f) => acc + f.events.length, 0);

    return {
      kpiRisk: `${toPct(frame.kpis.riskConflict)}%`,
      kpiCritical: String((frame.snapshot.groups || []).filter((g) => scoreGroup(g) >= Number(filters?.riskThreshold || 40)).length),
      kpiSupernodes: String((frame.snapshot.players || []).length),
      kpiEvents: String(eventCount)
    };
  }

  function getDrivers(frame) {
    const list = frame.explainability?.topDrivers || [];
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

  function makePeople(groups) {
    return groups.map((g) => ({
      id: g.id,
      label: g.name,
      region: "groups",
      segment: "social",
      risk: scoreGroup(g),
      supernode: "players",
      block: "relations",
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
      region: p.type,
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

  function makeBlocks(relations) {
    return relations.map((r, idx) => ({
      id: `${r.source}->${r.target}-${idx}`,
      label: `${r.source} → ${r.target}`,
      region: r.type,
      risk: scoreRelation(r),
      attrs: {
        influence: Math.round(r.influence * 100),
        volatility: toPct(r.volatility),
        type: r.type
      }
    }));
  }

  function getNetwork(frame, level, filters) {
    const { groups = [], players = [], relations = [] } = frame.snapshot || {};
    const data = {
      people: makePeople(groups),
      supernodes: makeSupernodes(players),
      blocks: makeBlocks(relations)
    };

    let out = data[level] || [];
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
    getNetwork
  };
}

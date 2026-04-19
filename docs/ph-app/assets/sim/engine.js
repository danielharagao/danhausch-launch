/* Predictive History Simulation Engine (client-side, no backend) */
(function (global) {
  'use strict';

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // Mulberry32 deterministic PRNG (seedable)
  function createRng(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randn(rng) {
    // Box-Muller
    var u = 0;
    var v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  function weightedMean(items, valueKey, weightKey) {
    var totalWeight = 0;
    var acc = 0;
    for (var i = 0; i < items.length; i++) {
      var w = items[i][weightKey] || 0;
      var v = items[i][valueKey] || 0;
      totalWeight += w;
      acc += v * w;
    }
    return totalWeight > 0 ? acc / totalWeight : 0;
  }

  function stdDev(arr) {
    if (arr.length < 2) return 0;
    var m = avg(arr);
    var s = arr.reduce(function (sum, x) {
      var d = x - m;
      return sum + d * d;
    }, 0);
    return Math.sqrt(s / (arr.length - 1));
  }

  function percentile(sortedArr, p) {
    if (!sortedArr.length) return 0;
    var idx = (sortedArr.length - 1) * p;
    var lo = Math.floor(idx);
    var hi = Math.ceil(idx);
    if (lo === hi) return sortedArr[lo];
    return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
  }

  function applyDeltaToCollection(list, key, delta) {
    for (var i = 0; i < list.length; i++) {
      var current = typeof list[i][key] === 'number' ? list[i][key] : 0;
      list[i][key] = clamp(current + delta, 0, 1);
    }
  }

  function defaultShockLibrary() {
    return {
      commodityCrash: {
        scope: 'economy',
        intensity: 0.2,
        effects: {
          'macro.gdpTrend': -0.14,
          'macro.investmentConfidence': -0.11,
          'groups.grievance': 0.07,
          'groups.economicExposure': 0.05
        }
      },
      constitutionalReform: {
        scope: 'institutional',
        intensity: 0.16,
        effects: {
          'players.legitimacy': 0.07,
          'groups.trustInstitutions': 0.06,
          'relations.volatility': -0.05,
          'macro.fiscalSpace': 0.04
        }
      },
      disinformationSpike: {
        scope: 'information',
        intensity: 0.18,
        effects: {
          'groups.mobilization': 0.08,
          'groups.trustInstitutions': -0.05,
          'relations.volatility': 0.09,
          'macro.investmentConfidence': -0.03
        }
      }
    };
  }

  function computeKpis(state) {
    var institutions = state.players;
    var groups = state.groups;
    var relations = state.relations;
    var macro = state.macro;

    var avgGrievance = weightedMean(groups, 'grievance', 'size');
    var avgMobilization = weightedMean(groups, 'mobilization', 'size');
    var avgTrust = weightedMean(groups, 'trustInstitutions', 'size');
    var avgInstitutionLegitimacy = avg(institutions.map(function (p) { return p.legitimacy; }));
    var avgInstitutionCohesion = avg(institutions.map(function (p) { return p.cohesion; }));

    var rivalryPressure = avg(relations.map(function (r) {
      return r.influence < 0 ? Math.abs(r.influence) * (0.5 + r.volatility) : 0;
    }));

    var poles = groups.map(function (g) { return clamp(g.identityPole, -1, 1); });
    var meanPole = avg(poles);
    var spreadPole = Math.sqrt(avg(poles.map(function (p) {
      var d = p - meanPole;
      return d * d;
    })));

    var economicStress = clamp(
      (clamp(macro.inflation, 0, 1) * 0.35) +
      (clamp(macro.unemployment, 0, 1) * 0.35) +
      ((1 - clamp(macro.investmentConfidence, 0, 1)) * 0.3),
      0,
      1
    );

    var riskConflict = clamp(
      avgGrievance * 0.32 +
      avgMobilization * 0.24 +
      rivalryPressure * 0.24 +
      (1 - avgTrust) * 0.20,
      0,
      1
    );

    var institutionalStability = clamp(
      avgInstitutionLegitimacy * 0.36 +
      avgInstitutionCohesion * 0.28 +
      avgTrust * 0.22 +
      (1 - avg(relations.map(function (r) { return r.volatility; }))) * 0.14,
      0,
      1
    );

    var polarization = clamp(
      spreadPole * 0.55 +
      avg(relations.map(function (r) { return r.volatility; })) * 0.25 +
      avgMobilization * 0.20,
      0,
      1
    );

    var economicResilience = clamp(
      (1 - economicStress) * 0.50 +
      clamp(macro.tradeFlow, 0, 1) * 0.20 +
      clamp(macro.fiscalSpace, 0, 1) * 0.20 +
      avg(institutions.map(function (p) { return p.resourceBase; })) * 0.10,
      0,
      1
    );

    return {
      riskConflict: riskConflict,
      institutionalStability: institutionalStability,
      polarization: polarization,
      economicResilience: economicResilience
    };
  }

  function buildDriverSet(state, kpis) {
    var groups = state.groups;
    var relations = state.relations;
    var players = state.players;

    return {
      avgGroupGrievance: weightedMean(groups, 'grievance', 'size'),
      avgGroupMobilization: weightedMean(groups, 'mobilization', 'size'),
      avgGroupTrust: weightedMean(groups, 'trustInstitutions', 'size'),
      avgRelationVolatility: avg(relations.map(function (r) { return r.volatility; })),
      rivalryPressure: avg(relations.map(function (r) {
        return r.influence < 0 ? Math.abs(r.influence) * (0.5 + r.volatility) : 0;
      })),
      avgLegitimacy: avg(players.map(function (p) { return p.legitimacy; })),
      avgCohesion: avg(players.map(function (p) { return p.cohesion; })),
      inflation: clamp(state.macro.inflation, 0, 1),
      unemployment: clamp(state.macro.unemployment, 0, 1),
      investmentConfidence: clamp(state.macro.investmentConfidence, 0, 1),
      tradeFlow: clamp(state.macro.tradeFlow, 0, 1),
      fiscalSpace: clamp(state.macro.fiscalSpace, 0, 1),
      gdpTrend: clamp(state.macro.gdpTrend, -1, 1)
    };
  }

  function explainState(state, kpis, topN) {
    var n = topN || 5;
    var d = buildDriverSet(state, kpis);

    var contributions = [
      { driver: 'avgGroupGrievance', target: 'riskConflict', signedImpact: d.avgGroupGrievance * 0.32 },
      { driver: 'avgGroupMobilization', target: 'riskConflict', signedImpact: d.avgGroupMobilization * 0.24 },
      { driver: 'rivalryPressure', target: 'riskConflict', signedImpact: d.rivalryPressure * 0.24 },
      { driver: 'avgGroupTrust', target: 'riskConflict', signedImpact: (1 - d.avgGroupTrust) * 0.20 },

      { driver: 'avgLegitimacy', target: 'institutionalStability', signedImpact: d.avgLegitimacy * 0.36 },
      { driver: 'avgCohesion', target: 'institutionalStability', signedImpact: d.avgCohesion * 0.28 },
      { driver: 'avgGroupTrust', target: 'institutionalStability', signedImpact: d.avgGroupTrust * 0.22 },
      { driver: 'avgRelationVolatility', target: 'institutionalStability', signedImpact: (1 - d.avgRelationVolatility) * 0.14 },

      { driver: 'avgRelationVolatility', target: 'polarization', signedImpact: d.avgRelationVolatility * 0.25 },
      { driver: 'avgGroupMobilization', target: 'polarization', signedImpact: d.avgGroupMobilization * 0.20 },

      { driver: 'inflation', target: 'economicResilience', signedImpact: (1 - d.inflation) * 0.175 },
      { driver: 'unemployment', target: 'economicResilience', signedImpact: (1 - d.unemployment) * 0.175 },
      { driver: 'investmentConfidence', target: 'economicResilience', signedImpact: d.investmentConfidence * 0.15 },
      { driver: 'tradeFlow', target: 'economicResilience', signedImpact: d.tradeFlow * 0.20 },
      { driver: 'fiscalSpace', target: 'economicResilience', signedImpact: d.fiscalSpace * 0.20 }
    ];

    contributions
      .forEach(function (c) {
        c.magnitude = Math.abs(c.signedImpact);
      });

    contributions.sort(function (a, b) { return b.magnitude - a.magnitude; });

    return {
      timestamp: state.step,
      topDrivers: contributions.slice(0, n)
    };
  }

  function applyEffect(state, keyPath, effectValue, intensity, noise) {
    var delta = (effectValue || 0) * (intensity || 1) * (1 + noise);

    if (keyPath.indexOf('groups.') === 0) {
      var gField = keyPath.split('.')[1];
      applyDeltaToCollection(state.groups, gField, delta);
      return;
    }
    if (keyPath.indexOf('players.') === 0) {
      var pField = keyPath.split('.')[1];
      applyDeltaToCollection(state.players, pField, delta);
      return;
    }
    if (keyPath.indexOf('relations.') === 0) {
      var rField = keyPath.split('.')[1];
      for (var i = 0; i < state.relations.length; i++) {
        if (rField === 'influence') {
          state.relations[i].influence = clamp(state.relations[i].influence + delta, -1, 1);
        } else {
          state.relations[i][rField] = clamp((state.relations[i][rField] || 0) + delta, 0, 1);
        }
      }
      return;
    }
    if (keyPath.indexOf('macro.') === 0) {
      var mField = keyPath.split('.')[1];
      var current = typeof state.macro[mField] === 'number' ? state.macro[mField] : 0;
      if (mField === 'gdpTrend') {
        state.macro[mField] = clamp(current + delta, -1, 1);
      } else {
        state.macro[mField] = clamp(current + delta, 0, 1);
      }
    }
  }

  function baselineDrift(state, rng, options) {
    var vol = (options && options.baselineVolatility) || 0.03;

    state.groups.forEach(function (g) {
      g.grievance = clamp(g.grievance + randn(rng) * vol * 0.25 + (0.5 - g.trustInstitutions) * 0.01, 0, 1);
      g.mobilization = clamp(g.mobilization + randn(rng) * vol * 0.2 + g.grievance * 0.01, 0, 1);
      g.trustInstitutions = clamp(g.trustInstitutions + randn(rng) * vol * 0.2 - g.grievance * 0.008, 0, 1);
    });

    state.players.forEach(function (p) {
      p.legitimacy = clamp(p.legitimacy + randn(rng) * vol * 0.15 - avg(state.groups.map(function (g) { return g.grievance; })) * 0.006, 0, 1);
      p.cohesion = clamp(p.cohesion + randn(rng) * vol * 0.12, 0, 1);
      p.power = clamp(p.power + randn(rng) * vol * 0.08, 0, 1);
    });

    state.relations.forEach(function (r) {
      r.volatility = clamp(r.volatility + randn(rng) * vol * 0.1 + (r.influence < 0 ? 0.002 : -0.001), 0, 1);
      r.influence = clamp(r.influence + randn(rng) * vol * 0.08, -1, 1);
    });

    state.macro.inflation = clamp(state.macro.inflation + randn(rng) * vol * 0.2, 0, 1);
    state.macro.unemployment = clamp(state.macro.unemployment + randn(rng) * vol * 0.15 - state.macro.gdpTrend * 0.02, 0, 1);
    state.macro.investmentConfidence = clamp(state.macro.investmentConfidence + randn(rng) * vol * 0.15 + state.macro.gdpTrend * 0.02, 0, 1);
    state.macro.tradeFlow = clamp(state.macro.tradeFlow + randn(rng) * vol * 0.12, 0, 1);
    state.macro.fiscalSpace = clamp(state.macro.fiscalSpace + randn(rng) * vol * 0.1 - state.macro.inflation * 0.01, 0, 1);
    state.macro.gdpTrend = clamp(state.macro.gdpTrend + randn(rng) * vol * 0.08 - state.macro.inflation * 0.004, -1, 1);
  }

  function scheduledEventsForStep(events, step) {
    return events.filter(function (e) { return e.atStep === step; });
  }

  function applyShock(state, shock, rng, options) {
    var noiseSigma = (options && options.effectNoiseSigma) || 0.1;
    var effects = shock.effects || {};

    Object.keys(effects).forEach(function (keyPath) {
      var noise = randn(rng) * noiseSigma;
      applyEffect(state, keyPath, effects[keyPath], shock.intensity || 1, noise);
    });

    state.appliedShocks.push({
      id: shock.id || ('custom-' + state.step + '-' + Math.floor(rng() * 1e6)),
      name: shock.name || 'Unnamed Shock',
      step: state.step,
      intensity: shock.intensity || 1,
      scope: shock.scope || 'generic'
    });
  }

  function createSimulator(seedData, options) {
    if (!seedData) throw new Error('seedData is required');

    var opts = options || {};
    var seed = typeof opts.rngSeed === 'number' ? opts.rngSeed : 1337;
    var rng = createRng(seed);

    var state = {
      step: 0,
      players: deepClone(seedData.players || []),
      groups: deepClone(seedData.groups || []),
      relations: deepClone(seedData.relations || []),
      macro: deepClone(seedData.macro || {}),
      scheduledEvents: deepClone(seedData.events || []),
      appliedShocks: [],
      history: []
    };

    function snapshot() {
      return deepClone(state);
    }

    function step(config) {
      var cfg = config || {};
      state.step += 1;

      baselineDrift(state, rng, opts);

      var events = scheduledEventsForStep(state.scheduledEvents, state.step);
      for (var i = 0; i < events.length; i++) {
        applyShock(state, events[i], rng, opts);
      }

      var exogenous = cfg.exogenousShocks || [];
      for (var j = 0; j < exogenous.length; j++) {
        applyShock(state, exogenous[j], rng, opts);
      }

      var kpis = computeKpis(state);
      var explain = explainState(state, kpis, cfg.topDrivers || 5);

      var frame = {
        step: state.step,
        kpis: deepClone(kpis),
        explainability: explain,
        eventsApplied: deepClone(state.appliedShocks.filter(function (s) { return s.step === state.step; }))
      };

      state.history.push(frame);
      return frame;
    }

    function run(steps, config) {
      var out = [];
      for (var i = 0; i < steps; i++) out.push(step(config));
      return out;
    }

    function injectShock(shock) {
      applyShock(state, shock, rng, opts);
      return snapshot();
    }

    return {
      getState: snapshot,
      step: step,
      run: run,
      injectShock: injectShock,
      computeKpis: function () { return computeKpis(state); },
      explain: function (topN) { return explainState(state, computeKpis(state), topN); },
      shockLibrary: defaultShockLibrary()
    };
  }

  function monteCarlo(seedData, config) {
    var cfg = config || {};
    var runs = cfg.runs || 100;
    var steps = cfg.steps || 12;
    var alpha = typeof cfg.alpha === 'number' ? cfg.alpha : 0.05;

    var metrics = {
      riskConflict: [],
      institutionalStability: [],
      polarization: [],
      economicResilience: []
    };

    for (var i = 0; i < runs; i++) {
      var sim = createSimulator(seedData, {
        rngSeed: (cfg.baseSeed || 9000) + i,
        baselineVolatility: cfg.baselineVolatility || 0.03,
        effectNoiseSigma: cfg.effectNoiseSigma || 0.1
      });

      var trace = sim.run(steps, { topDrivers: 5, exogenousShocks: cfg.exogenousShocks || [] });
      var finalKpis = trace[trace.length - 1].kpis;

      Object.keys(metrics).forEach(function (k) {
        metrics[k].push(finalKpis[k]);
      });
    }

    var summary = {};
    Object.keys(metrics).forEach(function (k) {
      var arr = metrics[k].slice().sort(function (a, b) { return a - b; });
      var mean = avg(arr);
      var sd = stdDev(arr);
      var z = 1.96; // normal approx for 95%; keep simple by design
      var sem = sd / Math.sqrt(arr.length || 1);

      summary[k] = {
        mean: mean,
        stdDev: sd,
        ci: {
          level: 1 - alpha,
          lower: clamp(mean - z * sem, 0, 1),
          upper: clamp(mean + z * sem, 0, 1)
        },
        quantiles: {
          p05: percentile(arr, 0.05),
          p50: percentile(arr, 0.5),
          p95: percentile(arr, 0.95)
        }
      };
    });

    return {
      configUsed: {
        runs: runs,
        steps: steps,
        alpha: alpha
      },
      summary: summary,
      samples: metrics
    };
  }

  var api = {
    createSimulator: createSimulator,
    computeKpis: computeKpis,
    monteCarlo: monteCarlo,
    explainState: explainState,
    createRng: createRng
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.PHSim = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);

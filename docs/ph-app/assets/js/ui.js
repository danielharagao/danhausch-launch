import { state, loadPresets, savePreset, deletePreset } from "./state.js";

const $ = (s) => document.querySelector(s);

function adapterFrame() {
  return state.adapter.getFrame(state.frameIndex);
}

function compareFrame() {
  const adapter = state.compareAdapters?.[state.compareTarget];
  if (!adapter) return null;
  return adapter.getFrame(state.frameIndex);
}

function signedDelta(base, candidate) {
  const delta = Math.round((candidate - base) * 100);
  return `${delta > 0 ? "+" : ""}${delta} pp`;
}

export function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.dataset.tab;
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.panel === state.activeTab);
      });
    });
  });
}

export function initFilters() {
  const form = $("#filtersForm");
  const riskInput = form.querySelector('[name="riskThreshold"]');
  const regionSelect = form.querySelector('[name="region"]');

  const regions = state.adapter.getRegions(adapterFrame());
  regionSelect.innerHTML = '<option value="all" selected>Todas</option>' + regions.map((r) => `<option value="${r}">${r}</option>`).join("");

  riskInput.value = String(state.filters.riskThreshold ?? 0);
  $("#riskThresholdValue").textContent = String(state.filters.riskThreshold ?? 0);
  riskInput.addEventListener("input", () => {
    $("#riskThresholdValue").textContent = riskInput.value;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    state.filters = {
      horizon: data.get("horizon"),
      entityType: data.get("entityType") || "all",
      region: data.get("region") || "all",
      quickView: state.filters.quickView || "all",
      riskThreshold: Number(data.get("riskThreshold")),
      query: String(data.get("query") || "").toLowerCase().trim()
    };
    renderAll();
  });

  const quickViews = $("#quickViews");
  quickViews.querySelectorAll("button[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filters.quickView = btn.dataset.quick;
      quickViews.querySelectorAll("button").forEach((el) => el.classList.toggle("is-active", el === btn));
      renderAll();
    });
  });

  $("#resetFiltersBtn").addEventListener("click", () => {
    form.reset();
    riskInput.value = "0";
    $("#riskThresholdValue").textContent = "0";
    state.filters = { horizon: "30", entityType: "all", region: "all", quickView: "all", riskThreshold: 0, query: "" };
    quickViews.querySelectorAll("button").forEach((el) => el.classList.remove("is-active"));
    renderAll();
  });
}

export function initCompareMode() {
  const toggle = $("#compareModeToggle");
  const scenario = $("#compareScenario");
  if (!toggle || !scenario) return;

  toggle.addEventListener("click", () => {
    state.compareMode = !state.compareMode;
    toggle.classList.toggle("is-active", state.compareMode);
    toggle.textContent = state.compareMode ? "Compare: ON" : "Compare: OFF";
    document.body.classList.toggle("compare-on", state.compareMode);
    renderAll();
  });

  scenario.addEventListener("change", () => {
    state.compareTarget = scenario.value;
    renderAll();
  });
}

export function renderKpis() {
  const cards = state.adapter.getKpiCards(adapterFrame(), state.filters);
  $("#kpiRisk").textContent = cards.kpiRisk;
  $("#kpiCritical").textContent = cards.kpiCritical;
  $("#kpiSupernodes").textContent = cards.kpiSupernodes;
  $("#kpiEvents").textContent = cards.kpiEvents;
}

export function initTimeline() {
  const slider = $("#timelineSlider");
  slider.max = "12";

  slider.addEventListener("input", () => {
    state.frameIndex = Number(slider.value);
    state.adapter.ensureFrame(state.frameIndex);
    renderTimeline();
    renderNetwork();
    renderKpis();
    renderDrivers();
    renderCompare();
  });

  $("#playBtn").addEventListener("click", () => {
    if (state.playbackTimer) return;
    state.playbackTimer = window.setInterval(() => {
      state.frameIndex = (state.frameIndex + 1) % 13;
      state.adapter.ensureFrame(state.frameIndex);
      slider.value = String(state.frameIndex);
      renderTimeline();
      renderNetwork();
      renderKpis();
      renderDrivers();
      renderCompare();
    }, 1400);
  });

  $("#pauseBtn").addEventListener("click", () => {
    if (state.playbackTimer) window.clearInterval(state.playbackTimer);
    state.playbackTimer = null;
  });

  state.adapter.ensureFrame(0);
  renderTimeline();
}

export function renderTimeline() {
  const frame = adapterFrame();
  $("#timelineLabel").textContent = frame.label;
  $("#scenarioScore").textContent = `Score: ${frame.score}`;
  $("#timelineEvents").innerHTML = (frame.events || [])
    .map((ev) => `<li><strong>${ev.time}</strong> · ${ev.title} <em>(${ev.impact})</em></li>`)
    .join("") || "<li><em>Sem eventos no frame.</em></li>";
}

export function initNetwork() {
  renderNetwork();
}

function criticalConnectionsFor(node, data) {
  return (node.connections || [])
    .map((id) => data.find((n) => n.id === id))
    .filter(Boolean)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 6);
}

export function renderNetwork() {
  const canvas = $("#networkCanvas");
  const detail = $("#networkDetail");
  const crumb = $("#networkBreadcrumb");

  const data = state.adapter.getNetwork(adapterFrame(), state.networkLevel, state.filters);
  if (!data.length) {
    canvas.innerHTML = `<div class="muted">Sem nós para o filtro atual. Dica: clique em "Resetar" nos filtros.</div>`;
  } else {
    canvas.innerHTML = data
      .map((node) => `<button class="network-node" data-id="${node.id}"><strong>${node.label}</strong><div class="meta">${node.entityType} · ${node.region || "global"} · risco ${node.risk}%</div></button>`)
      .join("");
  }

  crumb.textContent = `Nível: ${state.networkLevel}`;
  detail.innerHTML = "Clique em um nó para detalhar. Use drill-down: pessoa → supernó → bloco.";

  canvas.querySelectorAll(".network-node").forEach((el) => {
    el.addEventListener("click", () => {
      const node = data.find((d) => d.id === el.dataset.id);
      const critical = criticalConnectionsFor(node, data)
        .map((n) => `<li>${n.label} <small>(risco ${n.risk}%)</small></li>`)
        .join("");

      const affiliations = (node.affiliations || []).map((x) => `<li>${x}</li>`).join("");

      detail.innerHTML = `
        <h3>${node.label}</h3>
        <p><strong>Papel:</strong> ${node.role || "n/a"}</p>
        <p><strong>Tipo:</strong> ${node.entityType || "n/a"} · <strong>Região:</strong> ${node.region || "n/a"}</p>
        <p><strong>Risco:</strong> ${node.risk}%</p>
        <h4>Afiliações</h4>
        <ul>${affiliations || "<li>Sem afiliações mapeadas.</li>"}</ul>
        <h4>Conexões críticas</h4>
        <ul>${critical || "<li>Sem conexões críticas no recorte atual.</li>"}</ul>
        <pre class="node-json">${JSON.stringify(node.attrs || {}, null, 2)}</pre>
        <div class="row">
          <button class="btn ghost" id="downBtn">Drill-down</button>
          <button class="btn ghost" id="upBtn">Drill-up</button>
        </div>
      `;

      $("#downBtn").addEventListener("click", () => {
        state.networkLevel = state.networkLevel === "people" ? "supernodes" : state.networkLevel === "supernodes" ? "blocks" : "people";
        renderNetwork();
      });
      $("#upBtn").addEventListener("click", () => {
        state.networkLevel = state.networkLevel === "blocks" ? "supernodes" : state.networkLevel === "supernodes" ? "people" : "blocks";
        renderNetwork();
      });
    });
  });
}

export function renderDrivers() {
  const frame = adapterFrame();
  const prev = state.adapter.getFrame(Math.max(0, state.frameIndex - 1));

  const whyBox = $("#whyRiskMoved");
  const why = state.adapter.getWhyRiskMoved(frame, prev);
  if (whyBox) {
    whyBox.innerHTML = `
      <p><strong>${why.summary}</strong></p>
      <div class="causal-chain">
        ${why.chain.map((c) => `<article class="causal-step"><small>${c.stage}</small><p>${c.text}</p></article>`).join("")}
      </div>
    `;
  }

  const container = $("#driversList");
  const drivers = state.adapter.getDrivers(frame, prev);
  container.innerHTML = drivers
    .map((d) => `
      <article class="driver-item">
        <header><strong>${d.label}</strong><span>${d.weight}% contribuição</span></header>
        <div class="bar"><span style="width:${d.weight}%"></span></div>
        <p class="target">Impacto principal: ${d.target}</p>
        <p>${d.explanation}</p>
        <p class="evidence">${d.evidence}</p>
      </article>
      `)
    .join("");

  const timeline = $("#causalTimeline");
  if (timeline) {
    const points = state.adapter.getCausalTimeline(state.frameIndex);
    timeline.innerHTML = points
      .map((p) => `
        <article class="timeline-cause-item">
          <strong>${p.label}</strong> · risco ${p.risk}% (${p.delta >= 0 ? "+" : ""}${p.delta} pts)
          <div><small>Evento: ${p.event}</small></div>
          <div><small>Causa dominante: ${p.cause}</small></div>
        </article>
      `)
      .join("");
  }
}

export function renderMacroTrends() {
  const container = $("#macroTrends");
  if (!container) return;
  const bars = "▁▂▃▄▅▆▇█";
  const spark = (arr = []) => {
    if (!arr.length) return "";
    return arr.map((v) => bars[Math.max(0, Math.min(7, Math.round(v * 7)))]).join("");
  };

  const trends = state.adapter.getMacroTrends(adapterFrame());
  container.innerHTML = trends
    .map((t) => {
      const series = state.adapter.getMacroTrendSeries(t.key, state.frameIndex || 12);
      return `<article class="macro-item"><p>${t.label}</p><strong>${t.value}</strong><div class="spark">${spark(series)}</div></article>`;
    })
    .join("");
}

export function initPresets() {
  const select = $("#presetSelect");

  const fill = () => {
    const presets = loadPresets();
    select.innerHTML = presets.length
      ? presets.map((p) => `<option value="${p.name}">${p.name}</option>`).join("")
      : '<option value="">Sem presets</option>';
  };

  $("#savePresetBtn").addEventListener("click", () => {
    const name = window.prompt("Nome do preset de cenário:");
    const result = savePreset(name, state.filters);
    if (!result.ok) return;
    fill();
  });

  $("#loadPresetBtn").addEventListener("click", () => {
    const selected = select.value;
    const preset = loadPresets().find((p) => p.name === selected);
    if (!preset) return;
    state.filters = { ...state.filters, ...preset.filters };
    const form = $("#filtersForm");
    Object.entries(state.filters).forEach(([k, v]) => {
      if (form.elements[k]) form.elements[k].value = String(v);
    });
    $("#riskThresholdValue").textContent = String(state.filters.riskThreshold);
    renderAll();
  });

  $("#deletePresetBtn").addEventListener("click", () => {
    if (!select.value) return;
    deletePreset(select.value);
    fill();
  });

  fill();
}

// API config UI removed by design. Configuration now code-only.

export function renderCompare() {
  const panel = $("#comparePanel");
  if (!panel) return;

  if (!state.compareMode) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  const base = adapterFrame();
  const candidate = compareFrame();
  if (!candidate) {
    panel.hidden = false;
    panel.innerHTML = "<p class='muted'>Cenário de comparação indisponível.</p>";
    return;
  }

  const baseSnap = base.snapshot || {};
  const candSnap = candidate.snapshot || {};
  const baseDrivers = new Set((base.explainability?.topDrivers || []).map((d) => d.driver));
  const candDrivers = new Set((candidate.explainability?.topDrivers || []).map((d) => d.driver));
  const driverAdded = [...candDrivers].filter((d) => !baseDrivers.has(d));
  const driverRemoved = [...baseDrivers].filter((d) => !candDrivers.has(d));

  const baseK = base.kpis || {};
  const candK = candidate.kpis || {};

  const baseNodes = (baseSnap.groups?.length || 0) + (baseSnap.players?.length || 0);
  const candNodes = (candSnap.groups?.length || 0) + (candSnap.players?.length || 0);
  const baseEdges = baseSnap.relations?.length || 0;
  const candEdges = candSnap.relations?.length || 0;

  panel.hidden = false;
  panel.innerHTML = `
    <div class="compare-grid">
      <article class="card compare-col">
        <p class="eyebrow">Baseline</p>
        <h3>Seed 1337 · ${base.label}</h3>
        <ul>
          <li>Risco conflito: <strong>${Math.round((baseK.riskConflict || 0) * 100)}%</strong></li>
          <li>Estabilidade: <strong>${Math.round((baseK.institutionalStability || 0) * 100)}%</strong></li>
          <li>Polarização: <strong>${Math.round((baseK.polarization || 0) * 100)}%</strong></li>
          <li>Resiliência econômica: <strong>${Math.round((baseK.economicResilience || 0) * 100)}%</strong></li>
        </ul>
      </article>

      <article class="card compare-col">
        <p class="eyebrow">${state.compareTarget === "scenarioA" ? "Scenario A" : "Scenario B"}</p>
        <h3>${state.compareTarget === "scenarioA" ? "Seed 2024" : "Seed 9090"} · ${candidate.label}</h3>
        <ul>
          <li>Risco conflito: <strong>${Math.round((candK.riskConflict || 0) * 100)}%</strong></li>
          <li>Estabilidade: <strong>${Math.round((candK.institutionalStability || 0) * 100)}%</strong></li>
          <li>Polarização: <strong>${Math.round((candK.polarization || 0) * 100)}%</strong></li>
          <li>Resiliência econômica: <strong>${Math.round((candK.economicResilience || 0) * 100)}%</strong></li>
        </ul>
      </article>
    </div>

    <article class="card compare-deltas">
      <h3>Deltas vs Baseline</h3>
      <div class="delta-grid">
        <div><small>Δ risco conflito</small><strong>${signedDelta(baseK.riskConflict || 0, candK.riskConflict || 0)}</strong></div>
        <div><small>Δ estabilidade</small><strong>${signedDelta(baseK.institutionalStability || 0, candK.institutionalStability || 0)}</strong></div>
        <div><small>Δ polarização</small><strong>${signedDelta(baseK.polarization || 0, candK.polarization || 0)}</strong></div>
        <div><small>Δ resiliência econômica</small><strong>${signedDelta(baseK.economicResilience || 0, candK.economicResilience || 0)}</strong></div>
        <div><small>Δ nós</small><strong>${candNodes - baseNodes > 0 ? "+" : ""}${candNodes - baseNodes}</strong></div>
        <div><small>Δ arestas</small><strong>${candEdges - baseEdges > 0 ? "+" : ""}${candEdges - baseEdges}</strong></div>
      </div>
      <div class="compare-drivers row">
        <div><small>Drivers novos</small><p>${driverAdded.length ? driverAdded.join(", ") : "Nenhum"}</p></div>
        <div><small>Drivers que saíram</small><p>${driverRemoved.length ? driverRemoved.join(", ") : "Nenhum"}</p></div>
      </div>
    </article>
  `;
}

export function initTutorial() {
  const overlay = $("#tutorialOverlay");
  const openBtn = $("#tutorialBtn");
  if (!overlay || !openBtn) return;

  const steps = [
    { selector: "#filtersForm", title: "1) Defina o recorte", text: "Escolha tipo de entidade, região e risco mínimo para limitar o universo da simulação." },
    { selector: "#tabs", title: "2) Navegue por visões", text: "Overview mostra KPIs; Timeline mostra evolução; Network mostra estrutura; Drivers explica causas." },
    { selector: "#timelineSlider", title: "3) Simule no tempo", text: "Arraste o slider ou clique em Play para avançar os steps e observar mudanças de risco." },
    { selector: "#networkCanvas", title: "4) Explore o grafo", text: "Clique em um nó para ver papel, afiliações e conexões críticas." },
    { selector: "#driversList", title: "5) Entenda o porquê", text: "Drivers mostram os fatores que mais empurram o risco no frame atual." },
  ];

  let idx = 0;
  const stepEl = $("#tutorialStep");
  const titleEl = $("#tutorialTitle");
  const textEl = $("#tutorialText");
  const prevBtn = $("#tutorialPrev");
  const nextBtn = $("#tutorialNext");
  const skipBtn = $("#tutorialSkip");

  function clearHighlights() {
    document.querySelectorAll(".tutorial-highlight").forEach((el) => el.classList.remove("tutorial-highlight"));
  }

  function renderStep() {
    const step = steps[idx];
    stepEl.textContent = `Passo ${idx + 1}/${steps.length}`;
    titleEl.textContent = step.title;
    textEl.textContent = step.text;
    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === steps.length - 1 ? "Concluir" : "Próximo";

    clearHighlights();
    const target = document.querySelector(step.selector);
    if (target) {
      target.classList.add("tutorial-highlight");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function openTutorial() {
    idx = 0;
    overlay.hidden = false;
    overlay.style.display = "grid";
    renderStep();
  }

  function closeTutorial() {
    overlay.hidden = true;
    overlay.style.display = "none";
    clearHighlights();
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openTutorial();
  });
  skipBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeTutorial();
  });
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    idx = Math.max(0, idx - 1);
    renderStep();
  });
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (idx >= steps.length - 1) {
      closeTutorial();
      return;
    }
    idx += 1;
    renderStep();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeTutorial();
  });

  window.addEventListener("keydown", (e) => {
    if (!overlay.hidden && e.key === "Escape") closeTutorial();
  });
}

export function renderAll() {
  renderKpis();
  renderMacroTrends();
  renderTimeline();
  renderNetwork();
  renderDrivers();
  renderCompare();
}

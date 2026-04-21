import { state, loadPresets, savePreset, deletePreset, loadScenarios, saveScenario, deleteScenario } from "./state.js";

const $ = (s) => document.querySelector(s);

function adapterFrame() {
  return state.adapter.getFrameForScenario(state.frameIndex, state.activeScenario);
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

function setScenarioBadge() {
  const badge = $("#activeScenarioBadge");
  if (!badge) return;
  if (!state.activeScenario?.presetId) {
    badge.textContent = "Cenário ativo: base (sem choque)";
    return;
  }
  badge.textContent = `Cenário ativo: ${state.activeScenario.name} · ${state.activeScenario.intensity}% · ${state.activeScenario.scope}`;
}

export function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tab"));

  const activateTab = (tab) => {
    state.activeTab = tab.dataset.tab;
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.setAttribute("tabindex", active ? "0" : "-1");
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const active = panel.dataset.panel === state.activeTab;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });
  };

  tabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
      if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") nextIdx = 0;
      if (e.key === "End") nextIdx = tabs.length - 1;
      tabs[nextIdx].focus();
      activateTab(tabs[nextIdx]);
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
  const setQuickViewActive = (activeBtn = null) => {
    quickViews.querySelectorAll("button").forEach((el) => {
      const active = el === activeBtn;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  quickViews.querySelectorAll("button[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filters.quickView = btn.dataset.quick;
      setQuickViewActive(btn);
      renderAll();
    });
  });

  $("#resetFiltersBtn").addEventListener("click", () => {
    form.reset();
    riskInput.value = "0";
    $("#riskThresholdValue").textContent = "0";
    state.filters = { horizon: "30", entityType: "all", region: "all", quickView: "all", riskThreshold: 0, query: "" };
    setQuickViewActive(null);
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
  const playBtn = $("#playBtn");
  const pauseBtn = $("#pauseBtn");
  slider.max = String(state.adapter.getMaxStep?.() || 12);

  const syncPlaybackButtons = () => {
    const isPlaying = Boolean(state.playbackTimer);
    playBtn.disabled = isPlaying;
    pauseBtn.disabled = !isPlaying;
    playBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    pauseBtn.setAttribute("aria-pressed", isPlaying ? "false" : "true");
  };

  slider.addEventListener("input", () => {
    state.frameIndex = Number(slider.value);
    state.adapter.ensureFrame(state.frameIndex);
    renderTimeline();
    renderNetwork();
    renderKpis();
    renderDrivers();
    renderCompare();
  });

  playBtn.addEventListener("click", () => {
    if (state.playbackTimer) return;
    state.playbackTimer = window.setInterval(() => {
      const maxStep = Number(slider.max || 12);
      state.frameIndex = (state.frameIndex + 1) % (maxStep + 1);
      state.adapter.ensureFrame(state.frameIndex);
      slider.value = String(state.frameIndex);
      renderTimeline();
      renderNetwork();
      renderKpis();
      renderDrivers();
      renderCompare();
    }, 1400);
    syncPlaybackButtons();
  });

  pauseBtn.addEventListener("click", () => {
    if (state.playbackTimer) window.clearInterval(state.playbackTimer);
    state.playbackTimer = null;
    syncPlaybackButtons();
  });

  state.adapter.ensureFrame(0);
  renderTimeline();
  syncPlaybackButtons();
}

export function renderTimeline() {
  const frame = adapterFrame();
  $("#timelineLabel").textContent = frame.label;
  $("#scenarioScore").textContent = `Score: ${frame.score}`;
  $("#timelineEvents").innerHTML = (frame.events || [])
    .map((ev) => `<li><strong>${ev.time}</strong> · ${ev.title} <em>(${ev.impact})</em><div class="event-meta"><span class="badge-source">Fonte: ${ev.source}</span><span class="badge-confidence ${ev.confidence}">Confiança: ${ev.confidence}</span></div></li>`)
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
      .map((node) => `<button class="network-node" role="listitem" aria-label="${node.label}, ${node.entityType}, risco ${node.risk}%" data-id="${node.id}"><strong>${node.label}</strong><div class="meta">${node.entityType} · ${node.region || "global"} · risco ${node.risk}%</div></button>`)
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
  const prev = state.frameIndex > 0 ? state.adapter.getFrame(state.frameIndex - 1) : frame;

  const container = $("#driversList");
  const drivers = state.adapter.getDrivers(frame, prev);
  container.innerHTML = drivers
    .map((d) => `
      <article class="driver-item">
        <header><strong>${d.label}</strong><span>${d.weight}% contribuição</span></header>
        <div class="bar"><span style="width:${d.weight}%"></span></div>
        <p>${d.explanation}</p>
        <small class="muted">${d.evidence || ""}</small>
      </article>
      `)
    .join("");

  const why = state.adapter.getWhyRiskMoved?.(frame, prev);
  const whyPanel = $("#whyRiskMoved");
  if (whyPanel) {
    const chain = (why?.chain || [])
      .map((item) => `<li><strong>${item.stage}:</strong> ${item.text}</li>`)
      .join("");
    whyPanel.innerHTML = `
      <article class="card subtle">
        <h3>Resumo</h3>
        <p>${why?.summary || "Sem resumo disponível para este frame."}</p>
        <ul class="stack">${chain || "<li>Sem cadeia causal disponível.</li>"}</ul>
      </article>
    `;
  }

  const causal = state.adapter.getCausalTimeline?.(state.frameIndex || 0) || [];
  const causalEl = $("#causalTimeline");
  if (causalEl) {
    causalEl.innerHTML = causal
      .map((point) => `
        <article class="driver-item">
          <header><strong>${point.label}</strong><span>Risco ${point.risk}% (${point.delta >= 0 ? "+" : ""}${point.delta} pts)</span></header>
          <p><strong>Causa dominante:</strong> ${point.cause}</p>
          <p><strong>Evento:</strong> ${point.event}</p>
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
    const activeQuick = document.querySelector(`#quickViews button[data-quick="${state.filters.quickView}"]`);
    document.querySelectorAll("#quickViews button[data-quick]").forEach((btn) => {
      const active = btn === activeQuick;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    $("#riskThresholdValue").textContent = String(state.filters.riskThreshold);
    renderAll();
  });

  $("#deletePresetBtn").addEventListener("click", () => {
    if (!select.value) return;
    const confirmed = window.confirm(`Excluir preset "${select.value}"?`);
    if (!confirmed) return;
    deletePreset(select.value);
    fill();
  });

  fill();
}

export function initScenarioBuilder() {
  const presets = state.adapter.getScenarioPresets();
  const presetSelect = $("#scenarioPreset");
  const scenarioSelect = $("#scenarioSelect");
  const overlay = $("#scenarioWizardOverlay");
  const wizardForm = $("#scenarioWizardForm");
  const intensityInput = $("#scenarioIntensity");
  const intensityValue = $("#scenarioIntensityValue");
  const scopeSelect = $("#scenarioScope");
  const desc = $("#scenarioPresetDescription");

  presetSelect.innerHTML = presets.map((p) => `<option value="${p.id}">${p.label}</option>`).join("");

  function fillScenarioList() {
    const stored = loadScenarios();
    scenarioSelect.innerHTML = stored.length
      ? stored.map((s) => `<option value="${s.name}">${s.name}</option>`).join("")
      : '<option value="">Sem cenários salvos</option>';
  }

  function updatePresetDescription() {
    const current = presets.find((p) => p.id === presetSelect.value) || presets[0];
    desc.textContent = current?.description || "";
  }

  function openWizard() {
    overlay.hidden = false;
    overlay.style.display = "grid";
  }

  function closeWizard() {
    overlay.hidden = true;
    overlay.style.display = "none";
  }

  $("#openScenarioWizardBtn")?.addEventListener("click", openWizard);
  $("#closeScenarioWizard")?.addEventListener("click", closeWizard);
  $("#cancelScenarioWizard")?.addEventListener("click", closeWizard);

  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeWizard();
  });

  intensityInput.addEventListener("input", () => {
    intensityValue.textContent = `${intensityInput.value}%`;
  });

  presetSelect.addEventListener("change", updatePresetDescription);

  wizardForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(wizardForm);
    const scenario = state.adapter.buildScenario({
      name: String(data.get("name") || "Cenário custom"),
      presetId: String(data.get("presetId") || "war"),
      intensity: Number(data.get("intensity") || 50),
      scope: String(data.get("scope") || "global")
    });

    state.activeScenario = scenario;
    setScenarioBadge();
    saveScenario(scenario.name, scenario);
    fillScenarioList();
    closeWizard();
    renderAll();
  });

  $("#applyScenarioBtn")?.addEventListener("click", () => {
    const selected = scenarioSelect.value;
    const record = loadScenarios().find((s) => s.name === selected);
    if (!record) return;
    state.activeScenario = state.adapter.buildScenario(record);
    setScenarioBadge();
    renderAll();
  });

  $("#clearScenarioBtn")?.addEventListener("click", () => {
    state.activeScenario = null;
    setScenarioBadge();
    renderAll();
  });

  $("#deleteScenarioBtn")?.addEventListener("click", () => {
    if (!scenarioSelect.value) return;
    deleteScenario(scenarioSelect.value);
    fillScenarioList();
  });

  fillScenarioList();
  updatePresetDescription();
  setScenarioBadge();
}

// API config UI removed by design. Configuration now code-only.

export function initCompareMode() {
  const toggle = $("#compareModeToggle");
  const scenario = $("#compareScenario");
  if (!toggle || !scenario) return;

  toggle.addEventListener("click", () => {
    state.compareMode = !state.compareMode;
    toggle.classList.toggle("is-active", state.compareMode);
    toggle.textContent = state.compareMode ? "Compare: ON" : "Compare: OFF";
    renderAll();
  });

  scenario.addEventListener("change", () => {
    state.compareTarget = scenario.value;
    renderAll();
  });
}

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
  if (!candidate) return;

  const baseK = base.kpis || {};
  const candK = candidate.kpis || {};
  const baseSnap = base.snapshot || {};
  const candSnap = candidate.snapshot || {};

  const baseDrivers = new Set((base.explainability?.topDrivers || []).map((d) => d.driver));
  const candDrivers = new Set((candidate.explainability?.topDrivers || []).map((d) => d.driver));

  const baseNodes = (baseSnap.groups?.length || 0) + (baseSnap.players?.length || 0);
  const candNodes = (candSnap.groups?.length || 0) + (candSnap.players?.length || 0);
  const baseEdges = baseSnap.relations?.length || 0;
  const candEdges = candSnap.relations?.length || 0;

  panel.hidden = false;
  panel.innerHTML = `
    <div class="compare-grid">
      <article class="card compare-col">
        <p class="eyebrow">Baseline</p>
        <h3>${base.label}</h3>
        <ul>
          <li>Risco conflito: <strong>${Math.round((baseK.riskConflict || 0) * 100)}%</strong></li>
          <li>Estabilidade: <strong>${Math.round((baseK.institutionalStability || 0) * 100)}%</strong></li>
          <li>Polarização: <strong>${Math.round((baseK.polarization || 0) * 100)}%</strong></li>
          <li>Resiliência econômica: <strong>${Math.round((baseK.economicResilience || 0) * 100)}%</strong></li>
        </ul>
      </article>
      <article class="card compare-col">
        <p class="eyebrow">${state.compareTarget === "scenarioA" ? "Scenario A" : "Scenario B"}</p>
        <h3>${candidate.label}</h3>
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
        <div><small>Drivers novos</small><p>${[...candDrivers].filter((d) => !baseDrivers.has(d)).join(", ") || "Nenhum"}</p></div>
        <div><small>Drivers que saíram</small><p>${[...baseDrivers].filter((d) => !candDrivers.has(d)).join(", ") || "Nenhum"}</p></div>
      </div>
    </article>
  `;
}

export function initTutorial() {
  const overlay = $("#tutorialOverlay");
  const openBtn = $("#tutorialBtn");
  if (!overlay || !openBtn) return;

  const steps = [
    { selector: "#openScenarioWizardBtn", title: "0) Monte o cenário", text: "Abra o Scenario Builder para escolher preset, intensidade e escopo antes da leitura analítica." },
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
  setScenarioBadge();
  renderKpis();
  renderMacroTrends();
  renderTimeline();
  renderNetwork();
  renderDrivers();
  renderCompare();
}

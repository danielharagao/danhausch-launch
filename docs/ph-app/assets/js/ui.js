import { state, loadPresets, savePreset, deletePreset } from "./state.js";

const $ = (s) => document.querySelector(s);

function adapterFrame() {
  return state.adapter.getFrame(state.frameIndex);
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
  const container = $("#driversList");
  const drivers = state.adapter.getDrivers(adapterFrame());
  container.innerHTML = drivers
    .map((d) => `
      <article class="driver-item">
        <header><strong>${d.label}</strong><span>${d.weight}% contribuição</span></header>
        <div class="bar"><span style="width:${d.weight}%"></span></div>
        <p>${d.explanation}</p>
      </article>
      `)
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
  renderTimeline();
  renderNetwork();
  renderDrivers();
}

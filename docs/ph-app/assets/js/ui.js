import { state, loadPresets, savePreset, deletePreset } from "./state.js";
import { createApiClient, loadApiConfig, saveApiConfig } from "./api-client.js";

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
      region: data.get("region"),
      segment: data.get("segment"),
      riskThreshold: Number(data.get("riskThreshold")),
      query: String(data.get("query") || "").toLowerCase().trim()
    };
    renderAll();
  });

  $("#resetFiltersBtn").addEventListener("click", () => {
    form.reset();
    riskInput.value = "0";
    $("#riskThresholdValue").textContent = "0";
    state.filters = { horizon: "30", region: "all", segment: "all", riskThreshold: 0, query: "" };
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

export function renderNetwork() {
  const canvas = $("#networkCanvas");
  const detail = $("#networkDetail");
  const crumb = $("#networkBreadcrumb");

  const data = state.adapter.getNetwork(adapterFrame(), state.networkLevel, state.filters);
  if (!data.length) {
    canvas.innerHTML = `<div class="muted">Sem nós para o filtro atual. Dica: clique em "Resetar" nos filtros.</div>`;
  } else {
    canvas.innerHTML = data
      .map((node) => `<button class="network-node" data-id="${node.id}"><strong>${node.label}</strong><div class="meta">Risco ${node.risk}%</div></button>`)
      .join("");
  }

  crumb.textContent = `Nível: ${state.networkLevel}`;
  detail.innerHTML = "Clique em um nó para detalhar. Use drill-down: pessoa → supernó → bloco.";

  canvas.querySelectorAll(".network-node").forEach((el) => {
    el.addEventListener("click", () => {
      const node = data.find((d) => d.id === el.dataset.id);
      detail.innerHTML = `
        <h3>${node.label}</h3>
        <p>ID: ${node.id}</p>
        <p>Risco: <strong>${node.risk}%</strong></p>
        <p>Região/tipo: ${node.region || "n/a"}</p>
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
    state.filters = preset.filters;
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

export function initApiConfig() {
  const form = $("#apiConfigForm");
  if (!form) return;

  const status = $("#apiStatus");
  const cfg = loadApiConfig();
  form.elements.apiBaseUrl.value = cfg.baseUrl || "";
  form.elements.apiToken.value = cfg.token || "";
  form.elements.apiTimeoutMs.value = String(cfg.timeoutMs || 6000);

  const mode = state.adapter?.getStatus?.().mode || "local";
  status.textContent = `Modo atual: ${mode === "api" ? "API" : "Local"}`;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    saveApiConfig({
      baseUrl: String(data.get("apiBaseUrl") || ""),
      token: String(data.get("apiToken") || ""),
      timeoutMs: Number(data.get("apiTimeoutMs") || 6000)
    });
    status.textContent = "Config salva. Recarregue para aplicar.";
  });

  $("#apiTestBtn").addEventListener("click", async () => {
    const testClient = createApiClient({
      baseUrl: form.elements.apiBaseUrl.value,
      token: form.elements.apiToken.value,
      timeoutMs: Number(form.elements.apiTimeoutMs.value || 6000)
    });
    if (!testClient.isEnabled()) {
      status.textContent = "API desativada (base URL vazia).";
      return;
    }
    try {
      await testClient.health();
      status.textContent = "Conexão OK.";
    } catch (err) {
      status.textContent = `Falha: ${err.message}`;
    }
  });
}

export function renderAll() {
  renderKpis();
  renderTimeline();
  renderNetwork();
  renderDrivers();
}

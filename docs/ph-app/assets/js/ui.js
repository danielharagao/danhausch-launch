import { scenarioFrames, networkData, riskDrivers } from "./data.js";
import { state, loadPresets, savePreset, deletePreset } from "./state.js";

const $ = (s) => document.querySelector(s);

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
    riskInput.value = "40";
    $("#riskThresholdValue").textContent = "40";
    state.filters = { horizon: "30", region: "all", segment: "all", riskThreshold: 40, query: "" };
    renderAll();
  });
}

function filteredPeople() {
  return networkData.people.filter((p) => {
    const regionOk = state.filters.region === "all" || p.region === state.filters.region;
    const segmentOk = state.filters.segment === "all" || p.segment === state.filters.segment;
    const riskOk = p.risk >= state.filters.riskThreshold;
    const queryOk = !state.filters.query || [p.id, p.label, p.supernode, p.block].join(" ").toLowerCase().includes(state.filters.query);
    return regionOk && segmentOk && riskOk && queryOk;
  });
}

export function renderKpis() {
  const people = filteredPeople();
  const avg = people.length ? Math.round(people.reduce((acc, p) => acc + p.risk, 0) / people.length) : 0;
  const critical = people.filter((p) => p.risk >= 70).length;
  const supernodes = new Set(people.map((p) => p.supernode)).size;
  const horizon = Number(state.filters.horizon);
  const eventCount = scenarioFrames.slice(0, Math.max(1, Math.ceil(horizon / 30) + 1)).reduce((a, f) => a + f.events.length, 0);

  $("#kpiRisk").textContent = `${avg}%`;
  $("#kpiCritical").textContent = String(critical);
  $("#kpiSupernodes").textContent = String(supernodes);
  $("#kpiEvents").textContent = String(eventCount);
}

export function initTimeline() {
  const slider = $("#timelineSlider");
  slider.max = String(scenarioFrames.length - 1);

  slider.addEventListener("input", () => {
    state.frameIndex = Number(slider.value);
    renderTimeline();
  });

  $("#playBtn").addEventListener("click", () => {
    if (state.playbackTimer) return;
    state.playbackTimer = window.setInterval(() => {
      state.frameIndex = (state.frameIndex + 1) % scenarioFrames.length;
      slider.value = String(state.frameIndex);
      renderTimeline();
    }, 1400);
  });

  $("#pauseBtn").addEventListener("click", () => {
    if (state.playbackTimer) window.clearInterval(state.playbackTimer);
    state.playbackTimer = null;
  });

  renderTimeline();
}

export function renderTimeline() {
  const frame = scenarioFrames[state.frameIndex];
  $("#timelineLabel").textContent = frame.label;
  $("#scenarioScore").textContent = `Score: ${frame.score}`;
  $("#timelineEvents").innerHTML = frame.events
    .map((ev) => `<li><strong>${ev.time}</strong> · ${ev.title} <em>(${ev.impact})</em></li>`)
    .join("");
}

export function initNetwork() {
  renderNetwork();
}

export function renderNetwork() {
  const canvas = $("#networkCanvas");
  const detail = $("#networkDetail");
  const crumb = $("#networkBreadcrumb");
  const query = state.filters.query;

  let data = networkData[state.networkLevel];
  if (query) data = data.filter((n) => JSON.stringify(n).toLowerCase().includes(query));
  if (state.filters.region !== "all") data = data.filter((n) => n.region === state.filters.region);

  canvas.innerHTML = data
    .map((node) => `<button class="network-node" data-id="${node.id}"><strong>${node.label}</strong><div class="meta">Risco ${node.risk}%</div></button>`)
    .join("");

  crumb.textContent = `Nível: ${state.networkLevel}`;
  detail.innerHTML = "Clique em um nó para detalhar. Use drill-down: pessoa → supernó → bloco.";

  canvas.querySelectorAll(".network-node").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const node = data.find((d) => d.id === id);
      detail.innerHTML = `
        <h3>${node.label}</h3>
        <p>ID: ${node.id}</p>
        <p>Risco: <strong>${node.risk}%</strong></p>
        <p>Região: ${node.region || "n/a"}</p>
        <div class="row">
          <button class="btn ghost" id="downBtn">Drill-down</button>
          <button class="btn ghost" id="upBtn">Drill-up</button>
        </div>
      `;

      $("#downBtn").addEventListener("click", () => {
        const next = state.networkLevel === "people" ? "supernodes" : state.networkLevel === "supernodes" ? "blocks" : "people";
        state.networkLevel = next;
        renderNetwork();
      });
      $("#upBtn").addEventListener("click", () => {
        const prev = state.networkLevel === "blocks" ? "supernodes" : state.networkLevel === "supernodes" ? "people" : "blocks";
        state.networkLevel = prev;
        renderNetwork();
      });
    });
  });
}

export function renderDrivers() {
  const container = $("#driversList");
  container.innerHTML = riskDrivers
    .map((d) => {
      const pct = Math.round(d.weight * 100);
      return `
      <article class="driver-item">
        <header><strong>${d.label}</strong><span>${pct}% contribuição</span></header>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <p>${d.explanation}</p>
      </article>
      `;
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

export function renderAll() {
  renderKpis();
  renderTimeline();
  renderNetwork();
  renderDrivers();
}

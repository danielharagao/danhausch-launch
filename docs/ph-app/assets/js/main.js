import { loadTheme, saveTheme, state } from "./state.js";
import { createPHAdapter } from "./sim-adapter.js";
import { createApiClient, loadApiConfig } from "./api-client.js";
import { initCompareMode, initFilters, initNetwork, initPresets, initScenarioBuilder, initTabs, initTimeline, initTutorial, renderAll } from "./ui.js";

function initTheme() {
  const root = document.documentElement;
  root.dataset.theme = loadTheme();

  document.querySelector("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    saveTheme(next);
  });
}

async function bootstrap() {
  initTheme();

  const apiClient = createApiClient(loadApiConfig());
  state.adapter = await createPHAdapter({
    seedUrl: "./assets/sim/seed.v5.json",
    rngSeed: 1337,
    apiClient
  });

  state.compareAdapters = {
    scenarioA: await createPHAdapter({ seedUrl: "./assets/sim/seed.v5.json", rngSeed: 2024, apiClient }),
    scenarioB: await createPHAdapter({ seedUrl: "./assets/sim/seed.v5.json", rngSeed: 9090, apiClient })
  };

  initTabs();
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab) {
    const el = document.querySelector(`.tab[data-tab="${tab}"]`);
    if (el) el.click();
  }
  initFilters();
  initCompareMode();
  initTimeline();
  initNetwork();
  initPresets();
  initScenarioBuilder();
  initTutorial();
  renderAll();
}

bootstrap().catch((err) => {
  console.error("Falha no bootstrap:", err);
  const root = document.querySelector(".main-content") || document.body;
  const box = document.createElement("article");
  box.className = "card";
  box.innerHTML = `<h2>Erro ao iniciar simulação</h2><p>${err.message}</p>`;
  root.prepend(box);
});

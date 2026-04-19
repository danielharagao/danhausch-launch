import { loadTheme, saveTheme, state } from "./state.js";
import { createPHAdapter } from "./sim-adapter.js";
import { createApiClient, loadApiConfig } from "./api-client.js";
import { initApiConfig, initFilters, initNetwork, initPresets, initTabs, initTimeline, renderAll } from "./ui.js";

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
    seedUrl: "./assets/sim/seed.json",
    rngSeed: 1337,
    apiClient
  });

  initTabs();
  initFilters();
  initTimeline();
  initNetwork();
  initPresets();
  initApiConfig();
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

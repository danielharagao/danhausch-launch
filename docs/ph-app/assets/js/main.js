import { loadTheme, saveTheme, state } from "./state.js";
import { createPHAdapter } from "./sim-adapter.js";
import { initFilters, initNetwork, initPresets, initTabs, initTimeline, renderAll } from "./ui.js";

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
  state.adapter = await createPHAdapter({
    seedUrl: "./assets/sim/seed.json",
    rngSeed: 1337
  });

  initTabs();
  initFilters();
  initTimeline();
  initNetwork();
  initPresets();
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

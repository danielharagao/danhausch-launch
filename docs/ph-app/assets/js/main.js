import { loadTheme, saveTheme } from "./state.js";
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

function bootstrap() {
  initTheme();
  initTabs();
  initFilters();
  initTimeline();
  initNetwork();
  initPresets();
  renderAll();
}

bootstrap();

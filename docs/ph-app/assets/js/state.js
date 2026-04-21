const PRESET_KEY = "phAppPresetsV1";
const SCENARIO_KEY = "phAppScenariosV1";
const THEME_KEY = "phAppTheme";

export const state = {
  activeTab: "overview",
  frameIndex: 0,
  playbackTimer: null,
  networkLevel: "supernodes",
  adapter: null,
  compareAdapters: null,
  compareMode: false,
  compareTarget: "scenarioA",
  selectedNodeId: null,
  selectedNodeLevel: null,
  networkFocus: {
    people: null,
    supernodes: null,
    blocks: null
  },
  filters: {
    horizon: "30",
    entityType: "all",
    region: "all",
    quickView: "all",
    riskThreshold: 0,
    query: ""
  },
  activeScenario: null
};

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

export function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESET_KEY) || "[]");
  } catch {
    return [];
  }
}

export function storePresets(presets) {
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}

export function savePreset(name, filters) {
  const cleanName = name?.trim();
  if (!cleanName) return { ok: false, reason: "Nome vazio" };
  const presets = loadPresets();
  const idx = presets.findIndex((p) => p.name === cleanName);
  const record = { name: cleanName, filters, savedAt: new Date().toISOString() };
  if (idx >= 0) presets[idx] = record;
  else presets.push(record);
  storePresets(presets);
  return { ok: true };
}

export function deletePreset(name) {
  const presets = loadPresets().filter((p) => p.name !== name);
  storePresets(presets);
}

export function loadScenarios() {
  try {
    return JSON.parse(localStorage.getItem(SCENARIO_KEY) || "[]");
  } catch {
    return [];
  }
}

export function storeScenarios(scenarios) {
  localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
}

export function saveScenario(name, scenario) {
  const cleanName = name?.trim();
  if (!cleanName) return { ok: false, reason: "Nome vazio" };
  const scenarios = loadScenarios();
  const idx = scenarios.findIndex((s) => s.name === cleanName);
  const record = { name: cleanName, ...scenario, savedAt: new Date().toISOString() };
  if (idx >= 0) scenarios[idx] = record;
  else scenarios.push(record);
  storeScenarios(scenarios);
  return { ok: true };
}

export function deleteScenario(name) {
  const scenarios = loadScenarios().filter((s) => s.name !== name);
  storeScenarios(scenarios);
}

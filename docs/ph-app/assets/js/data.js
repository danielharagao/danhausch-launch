// Legacy module kept only for backward compatibility.
// Runtime data now comes from seed.json + engine.js through sim-adapter.js.
export const scenarioFrames = [];
export const networkData = { people: [], supernodes: [], blocks: [] };
export const riskDrivers = [];
export async function hydrateRuntimeData() {
  return { seed: null, frames: [], state: null };
}

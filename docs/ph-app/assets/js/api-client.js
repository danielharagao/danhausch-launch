const API_CONFIG_KEY = "phAppApiConfigV1";

const DEFAULT_CONFIG = {
  baseUrl: "",
  token: "",
  timeoutMs: 6000
};

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function withTimeout(promise, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error("Timeout da API")), timeoutMs);
    promise
      .then((v) => {
        window.clearTimeout(id);
        resolve(v);
      })
      .catch((err) => {
        window.clearTimeout(id);
        reject(err);
      });
  });
}

function joinQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v == null || v === "") return;
    qs.set(k, String(v));
  });
  const text = qs.toString();
  return text ? `?${text}` : "";
}

export function loadApiConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || "{}");
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      baseUrl: normalizeBaseUrl(parsed.baseUrl)
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveApiConfig(config) {
  const next = {
    ...DEFAULT_CONFIG,
    ...(config || {})
  };
  next.baseUrl = normalizeBaseUrl(next.baseUrl);
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(next));
  return next;
}

export class PHApiClient {
  constructor(config = loadApiConfig()) {
    this.config = { ...DEFAULT_CONFIG, ...config, baseUrl: normalizeBaseUrl(config.baseUrl) };
  }

  setConfig(next = {}) {
    this.config = { ...this.config, ...next, baseUrl: normalizeBaseUrl(next.baseUrl ?? this.config.baseUrl) };
  }

  getConfig() {
    return { ...this.config };
  }

  isEnabled() {
    return Boolean(this.config.baseUrl);
  }

  async request(path, { method = "GET", query, body } = {}) {
    if (!this.isEnabled()) throw new Error("API desabilitada");
    const url = `${this.config.baseUrl}${path}${joinQuery(query)}`;
    const headers = { "Content-Type": "application/json" };
    if (this.config.token) headers.Authorization = `Bearer ${this.config.token}`;

    const resp = await withTimeout(
      fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      }),
      this.config.timeoutMs
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`API ${resp.status} em ${path}${text ? `: ${text}` : ""}`);
    }

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return resp.json();
    return resp.text();
  }

  async _first(paths, query) {
    let lastErr = null;
    for (const path of paths) {
      try {
        return await this.request(path, { query });
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Falha ao consultar API");
  }

  async health() {
    return this._first(["/health", "/api/health", "/ph/health"], {});
  }

  async getSeed() {
    return this._first(["/ph/seed", "/api/ph/seed", "/seed"], {});
  }

  async getFrame(index) {
    return this._first(["/ph/frame", "/api/ph/frame", "/frame"], { index });
  }

  async getKpiCards(index, filters = {}) {
    return this._first(["/ph/kpis", "/api/ph/kpis", "/kpis"], { index, ...filters });
  }

  async getDrivers(index) {
    return this._first(["/ph/drivers", "/api/ph/drivers", "/drivers"], { index });
  }

  async getNetwork(index, level, filters = {}) {
    return this._first(["/ph/network", "/api/ph/network", "/network"], {
      index,
      level,
      ...filters
    });
  }
}

export function createApiClient(config) {
  return new PHApiClient(config || loadApiConfig());
}

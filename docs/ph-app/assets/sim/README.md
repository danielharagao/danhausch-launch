# Predictive History Simulation Engine (client-side)

Motor de simulação **100% client-side** para cenários de Predictive History, sem backend.

## Estrutura

- `seed.json` — dataset inicial (players, grupos, relações, eventos e macroeconomia)
- `engine.js` — motor de simulação + Monte Carlo + explicabilidade
- `tests.html` — testes básicos executáveis no browser

## Modelo de dados (seed)

### players[]
Atores institucionais/políticos com atributos normalizados `[0..1]`:
- `power`, `cohesion`, `legitimacy`, `economyInfluence`, `resourceBase`

### groups[]
Grupos sociais com peso populacional:
- `size` (peso), `grievance`, `mobilization`, `trustInstitutions`, `economicExposure`, `identityPole` (`[-1..1]`)

### relations[]
Rede de influência entre atores:
- `influence` (`[-1..1]`), `volatility` (`[0..1]`)

### events[]
Choques/eventos agendados por passo temporal:
- `atStep`, `intensity`, `effects` (mapa `"escopo.campo": delta`)

### macro
Indicadores de contexto:
- `gdpTrend`, `inflation`, `unemployment`, `investmentConfidence`, `tradeFlow`, `fiscalSpace`

---

## API interna

`engine.js` exporta `PHSim` no browser (e `module.exports` em ambiente CommonJS).

### `PHSim.createSimulator(seedData, options?)`
Cria uma instância de simulação.

**options** (opcional):
- `rngSeed` (number): seed determinística
- `baselineVolatility` (default `0.03`): volatilidade de drift por passo
- `effectNoiseSigma` (default `0.1`): ruído multiplicativo nos efeitos de choques

**retorno**:
- `step(config?)`
- `run(steps, config?)`
- `getState()`
- `injectShock(shock)`
- `computeKpis()`
- `explain(topN?)`
- `shockLibrary` (choques prontos)

### `sim.step(config?)`
Executa 1 passo temporal:
1. Aplica drift endógeno
2. Aplica eventos agendados do `seed` para o passo atual
3. Aplica choques exógenos passados em `config.exogenousShocks`
4. Recalcula KPIs e explicabilidade

**config**:
- `exogenousShocks`: array de choques `{ scope, intensity, effects }`
- `topDrivers`: número de drivers retornados na explicabilidade

**retorno**:
```js
{
  step,
  kpis: {
    riskConflict,
    institutionalStability,
    polarization,
    economicResilience
  },
  explainability: { timestamp, topDrivers: [...] },
  eventsApplied: [...]
}
```

### `PHSim.computeKpis(state)`
Calcula os 4 KPIs a partir de um estado arbitrário:
- `riskConflict`
- `institutionalStability`
- `polarization`
- `economicResilience`

Todos normalizados em `[0..1]`.

### `PHSim.explainState(state, kpis, topN?)`
Retorna contribuições ordenadas por magnitude (top drivers), úteis para inspeção/UX de interpretabilidade.

### `PHSim.monteCarlo(seedData, config?)`
Roda simulações independentes e resume distribuição dos KPIs finais.

**config**:
- `runs` (default `100`)
- `steps` (default `12`)
- `alpha` (default `0.05`)
- `baseSeed` (default `9000`)
- `baselineVolatility`, `effectNoiseSigma`
- `exogenousShocks`

**retorno**:
```js
{
  configUsed,
  summary: {
    riskConflict: {
      mean,
      stdDev,
      ci: { level, lower, upper },
      quantiles: { p05, p50, p95 }
    },
    ...
  },
  samples
}
```

> Intervalo de confiança usa aproximação normal simples (z=1.96) por design.

---

## Executando testes

Abra `tests.html` em servidor local (recomendado por causa de `fetch` do JSON):

```bash
cd docs/ph-app/assets/sim
python3 -m http.server 8787
# abrir http://localhost:8787/tests.html
```

## Observações

- Implementação intencionalmente leve para browser e prototipagem.
- Não depende de bibliotecas externas.
- Todos os cálculos usam normalização e `clamp` para manter estabilidade numérica.

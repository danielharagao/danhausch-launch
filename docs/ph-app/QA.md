# QA Final — PH App (Zero Mock)

Data: 2026-04-19 (UTC)

## Objetivo
Garantir que a UI do `ph-app` não use dataset mock/hardcoded em runtime e que os dados venham do simulador (`assets/sim/engine.js` + `assets/sim/seed.json`).

---

## 1) Auditoria de código (mock/hardcoded runtime)

### Escopo auditado
- `docs/ph-app/assets/js/*.js`
- `docs/ph-app/assets/sim/*`
- `docs/ph-app/index.html`

### Evidências
- O antigo dataset estático de timeline/rede/drivers foi removido da UI runtime.
- `main.js` usa `createPHAdapter(...)` para carregar seed e conectar no motor.
- `sim-adapter.js`:
  - faz `fetch(seedUrl)`
  - instancia `window.PHSim.createSimulator(...)`
  - produz frames, KPIs, drivers e rede direto do estado do simulador.
- `index.html` carrega `./assets/sim/engine.js` antes de `main.js`.

### Resultado
✅ **Sem mocks de dataset em runtime UI** (dados vêm do simulador/seed).

---

## 2) Substituição por dados reais do simulador

### Implementado
- Conversão de runtime para pipeline:
  1. carregar `seed.json`
  2. instanciar `PHSim.createSimulator(seed, { rngSeed })`
  3. gerar frames incrementalmente (`ensureFrame`) com `sim.step(...)`
  4. derivar rede (`people/supernodes/blocks`) do snapshot real do frame
  5. derivar drivers de risco de `frame.explainability.topDrivers`

### Resultado
✅ UI acoplada ao engine + seed (sem arrays mock fixos para cenário/rede/drivers).

---

## 3) Smoke tests de integração UI-engine

Arquivo:
- `docs/ph-app/assets/sim/tests.html`

Cobertura:
- Engine básico:
  - criação do simulador
  - `step()` com KPIs válidos
  - choque exógeno aplicado
  - Monte Carlo com IC válido
- Integração UI-engine:
  - `hydrateRuntimeData()` popula `scenarioFrames`, `networkData`, `riskDrivers`
  - valida estrutura mínima de frames/eventos

Resultado esperado no browser:
- Lista de checks com ✅
- Log com `Passou: X | Falhou: 0`

---

## 4) Checklist de validação manual

- [ ] Abrir `docs/ph-app/index.html`
- [ ] Confirmar sem erro no console (especialmente `PHSim indisponível`)
- [ ] Ver KPIs preenchidos (não `--`)
- [ ] Ver timeline com labels `T0/T+...` e eventos
- [ ] Aplicar filtros e validar atualização dos cards
- [ ] Network Explorer renderiza nós e detalhe ao clicar
- [ ] Drivers de risco renderizam barras e explicação
- [ ] Executar `assets/sim/tests.html` e confirmar 0 falhas

---

## 5) URLs finais

> Ajustar `<user>` e `<repo>` se necessário no GitHub Pages.

- App:
  - `https://danielharagao.github.io/danhausch-launch/ph-app/`
- Smoke tests:
  - `https://danielharagao.github.io/danhausch-launch/ph-app/assets/sim/tests.html`
- Seed (referência):
  - `https://danielharagao.github.io/danhausch-launch/ph-app/assets/sim/seed.json`

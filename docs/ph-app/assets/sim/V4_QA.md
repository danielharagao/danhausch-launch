# V4 QA Checklist — Predictive History

Arquivo alvo: `docs/ph-app/assets/sim/seed.v4.json`

## Objetivo
Validar integração da seed V4 como padrão no **ph-app** e **ph-graph**, cobrindo volume alto, filtros e first load com entidades específicas.

## Integração
- [x] `docs/ph-app/assets/js/main.js` aponta para `./assets/sim/seed.v4.json`
- [x] `docs/ph-graph/assets/js/app.js` aponta para `../ph-app/assets/sim/seed.v4.json`
- [x] `seed.v4.json` criada com `meta.version = 4.0.0`
- [x] Timeline de eventos expandida (3 -> 6 eventos)

## Cobertura V4

### G20
- [x] Presença de `G20` como instituição
- [x] Países centrais G20 presentes (ex.: US, China, India, Brazil, Japan, Germany, France, UK, Italy, Canada, Australia, South Korea, Indonesia, Saudi Arabia, Turkiye, South Africa, Mexico, Argentina, Russia)
- [x] Relações institucionais envolvendo G20 no grafo

### Líderes
- [x] Entidades de líderes explícitas (`type: leader`)
- [x] Exemplos com relações de governança (Trump, Xi, Modi, Putin, von der Leyen, Guterres)

### Empresas
- [x] Entidades corporativas explícitas (`type: company`)
- [x] Cobertura de tecnologia, energia, defesa, finanças, logística e mídia

### Eventos
- [x] Eventos por step distribuídos ao longo da simulação
- [x] Mix de escopos (diplomacy, institutional, technology, economy, climate, finance)

## Filtros e performance (alto volume)
- [x] `ph-app`: resultado de rede ordenado por influência/risco e limitado (`MAX_NETWORK_RESULTS = 140`)
- [x] `ph-graph`: filtro de influenciadores com `Set` (sem busca linear por item)
- [x] `ph-graph`: limite de render em nós mais influentes (`MAX_VISIBLE_NODES = 220`)
- [x] `ph-graph`: quick view de influenciadores ajustada (`TOP_INFLUENCERS_LIMIT = 60`)

## First load com entidades específicas
- [x] `ph-app`: nível inicial da rede alterado para `supernodes` (exibe países/líderes/empresas específicos no primeiro carregamento)
- [x] `ph-graph`: camadas `supernodes` e `blocks` desmarcadas por padrão; first load prioriza entidades específicas (`people`) e evita nós genéricos de agregação

## Validação funcional rápida
- [x] Build estática sem erros de sintaxe nas alterações JS
- [x] `seed.v4.json` parseável e compatível com engine existente
- [x] Fluxo de fallback local preservado via `sim-adapter`

## Observações
- O dataset permanece **sintético** e calibrado para exploração de cenários.
- Se houver necessidade de stress ainda maior, elevar `players/relations` e manter os limites de render para UX estável.

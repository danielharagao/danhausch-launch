# V5 Events Pack — Geopolitical Conflicts

Arquivo(s) alvo:
- `docs/ph-app/assets/sim/events.v4.json` (pack cronológico de eventos com data)
- `docs/ph-app/assets/sim/seed.v4.json` (seed principal consumida pela app)

## Objetivo
Adicionar um pacote explícito de conflitos geopolíticos com efeitos **mapeáveis no engine** (`effects` em chaves `macro.*`, `players.*`, `groups.*`, `relations.*`), cobrindo:

1. **Guerra do Iraque** (como legado estrutural)
2. **Guerra da Ucrânia** (invasão + desdobramentos de atrito/energia/logística)
3. **Tensões Índia–Paquistão** (ciclo de crise e janela de desescalada)
4. **Tensões no Estreito de Taiwan** (drills, dissuasão e risco de cadeia de chips)
5. Eventos correlatos recentes (ex.: Mar Vermelho, Nagorno-Karabakh, spillovers de segurança)

---

## Critérios de modelagem usados

### 1) Coerência temporal
- Em `events.v4.json`, os eventos foram organizados por `date` e tiveram `atStep` recalculado sequencialmente.
- O recorte temporal inclui histórico estrutural (2003+) e choques recentes (2020–2025).

### 2) Intensidade (`intensity`)
Escala contínua aproximada `[0..1]`:
- `0.10–0.15`: baixa/média (efeitos localizados ou de descompressão)
- `0.16–0.22`: média/alta (efeitos multi-setoriais)
- `0.23+`: alta (choque sistêmico, conflito prolongado, spillovers globais)

### 3) Escopo (`scope`)
Escopos usados para leitura semântica e filtragem:
- `geopolitical`
- `security`
- `technology`

### 4) Alvos (`target`)
Priorizados alvos diretamente impactados por cada evento:
- `players` (estados/blocos/instituições)
- `groups` (segmentos sociais expostos a conflito/custo de vida)
- `companies` quando relevante para logística/semicondutores

### 5) Efeitos mapeáveis no engine
Apenas chaves já compatíveis com o motor:
- **Macro**: `macro.inflation`, `macro.tradeFlow`, `macro.investmentConfidence`, `macro.fiscalSpace`
- **Players**: `players.legitimacy`, `players.cohesion`, `players.power`, `players.resourceBase`
- **Groups**: `groups.grievance`, `groups.mobilization`, `groups.trustInstitutions`, `groups.economicExposure`
- **Relations**: `relations.volatility`, `relations.influence`

---

## Pacotes adicionados (resumo)

### A) Legado estrutural da Guerra do Iraque
- Evento de legado de fragmentação regional e entrincheiramento de milícias.
- Efeitos principais: alta em `relations.volatility`, `groups.grievance`; queda de `players.legitimacy` e `groups.trustInstitutions`.

### B) Guerra da Ucrânia (desdobramentos)
- Mantida invasão de 2022 e adicionados desdobramentos de atrito/infra/Mar Negro.
- Efeitos principais: `macro.inflation`↑, `macro.tradeFlow`↓, `relations.volatility`↑, pressão em grupos vulneráveis.

### C) Índia–Paquistão
- Inserido ciclo de tensão (crise) e janela de desescalada (efeito amortecedor).
- Efeitos principais: volatilidade relacional, mobilização/grievance, impactos moderados de confiança.

### D) Estreito de Taiwan
- Inseridos episódios de drills e pressão geopolítica com risco de cadeia semicondutora.
- Efeitos principais: `relations.volatility`↑, `macro.tradeFlow`↓, `macro.investmentConfidence`↓, `groups.economicExposure`↑.

### E) Correlatos recentes
- Mar Vermelho/logística marítima e choque Nagorno-Karabakh (deslocamento forçado).
- Efeitos principais: pressão de comércio/logística e volatilidade geopolítica regional.

---

## Limitações (importante)

1. **Dataset sintético de simulação**, não é previsão factual nem julgamento normativo.
2. Intensidades e deltas são **heurísticos calibrados** para estabilidade do engine e comparabilidade entre cenários.
3. O modelo representa choques em nível agregado; **não captura** microdinâmicas militares/táticas.
4. Alguns atores/campos em `target` podem não existir no seed como entidade explícita; isso não quebra o motor, mas reduz granularidade de explicação por ator.
5. Eventos históricos estruturais (ex.: Iraque) são tratados como **legado persistente** (path dependence), não como replay detalhado da guerra.

---

## Checklist de QA recomendado
- [ ] JSON válido em `events.v4.json` e `seed.v4.json`
- [ ] `atStep` monotônico em `events.v4.json`
- [ ] `effects` somente em chaves reconhecidas pelo engine
- [ ] Simulação roda sem erro no `tests.html`
- [ ] KPIs respondem aos choques (especialmente `riskConflict` e `economicResilience`)

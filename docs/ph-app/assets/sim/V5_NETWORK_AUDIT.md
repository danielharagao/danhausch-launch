# V5 Network Audit (Nodes & Connections)

**Date:** 2026-04-20  
**Scope:** `docs/ph-app/assets/sim/seed.v5.json`  
**Goal:** validar qualidade da rede e corrigir inconsistências estruturais para simulação.

---

## 1) Escopo técnico da auditoria

Auditoria executada sobre toda a malha de relações (`relations`) e validação cruzada contra os nós existentes (`players` + `groups`).

Foram verificados e tratados os seguintes pontos:

1. Nós órfãos
2. Relações duplicadas
3. Sinal/peso incoerente (`type` vs `influence`)
4. IDs inválidos em `source`/`target`
5. Padronização de `type`
6. Completação/padronização de `pairType`
7. Rebalanceamento de `influence` e `volatility` por envelope semântico

---

## 2) Métricas de rede (antes/depois)

### Core network (players)

| Métrica | Antes | Depois |
|---|---:|---:|
| Nós | 115 | 115 |
| Arestas dirigidas | 242 | 242 |
| Densidade | 0.018459 | 0.018459 |
| Nós órfãos | 0 | 0 |

### Rede expandida (players + groups)

| Métrica | Antes | Depois |
|---|---:|---:|
| Nós | 132 | 132 |
| Arestas dirigidas | 242 | 242 |
| Densidade | 0.013995 | 0.013995 |
| Nós órfãos | 17 | 17 |

> Observação: os 17 órfãos pertencem ao bloco de `groups` (sem arestas explícitas nesta versão do modelo). Não há órfãos no core de `players`.

---

## 3) Achados de qualidade (antes)

- **Duplicatas:** 0
- **IDs inválidos:** 0
- **Sinal incoerente:** 0
- **`pairType` ausente/vazio:** **53**
- **Tipos não padronizados:** **4** (`seguranca`, `energia`)

Distribuição de tipos encontrada no estado original:

- `governanca`: 88
- `dependencia`: 62
- `cooperacao`: 65
- `influencia`: 9
- `rivalidade`: 14
- `seguranca`: 1
- `energia`: 3

---

## 4) Correções aplicadas

### 4.1 Padronização de tipos de relação

Tipos fora do padrão foram mapeados para o conjunto canônico:

`{ governanca, cooperacao, dependencia, influencia, rivalidade }`

Regras de normalização aplicadas:

- `seguranca` → `cooperacao`
- `energia` → `dependencia` (quando influência positiva) / `rivalidade` (quando negativa)

### 4.2 Padronização/completude de `pairType`

Todos os relacionamentos agora possuem `pairType` preenchido usando o par de tipos dos nós:

- `leader-country`
- `country-country`
- `country-institution`
- `institution-country`
- `institution-institution`

### 4.3 Rebalanceamento de pesos

Foi aplicado rebalanceamento leve e determinístico em todas as arestas:

- ajuste fino de `influence` por ruído determinístico pequeno (estável por par)
- ajuste de `volatility` aproximando baseline por tipo de relação
- clamp por envelopes semânticos por tipo

Envelopes usados:

- `governanca`: influence `[0.45..0.88]`, volatility `[0.20..0.52]`
- `cooperacao`: influence `[0.30..0.72]`, volatility `[0.18..0.48]`
- `dependencia`: influence `[0.40..0.82]`, volatility `[0.22..0.55]`
- `influencia`: influence `[0.30..0.78]`, volatility `[0.20..0.58]`
- `rivalidade`: influence `[-0.88..-0.25]`, volatility `[0.40..0.82]`

---

## 5) Estado final (depois)

- **Duplicatas:** 0
- **IDs inválidos:** 0
- **Sinal incoerente:** 0
- **`pairType` ausente/vazio:** 0
- **Tipos fora do padrão:** 0

Distribuição final de tipos:

- `governanca`: 88
- `dependencia`: 65
- `cooperacao`: 66
- `influencia`: 9
- `rivalidade`: 14

---

## 6) Lista de órfãos (rede expandida)

`iran-urban-middle`, `gulf-expat-workers`, `russia-urban-professionals`, `food-insecure`, `russia-defense-workforce`, `global-investors`, `energy-consumers`, `global-migrant`, `north-america-middle`, `israel-security-reservists`, `mena-youth`, `east-asia-export`, `latin-america-informal`, `eu-urban`, `south-asia-youth`, `levant-displaced`, `africa-rural`.

---

## 7) Arquivos alterados

- `docs/ph-app/assets/sim/seed.v5.json`
- `docs/ph-app/assets/sim/V5_NETWORK_AUDIT.md`

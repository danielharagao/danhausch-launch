# V6_LATAM_VENEZUELA

Arquivo alvo: `docs/ph-app/assets/sim/seed.v5.json` (seed ativa da app)

Data: 2026-04-21  
Escopo: ampliar cobertura da América Latina com foco em Venezuela e conexões regionais/globais (últimos 5 anos), com relações tipadas e pesos coerentes para o motor PH.

## 1) Atualização de metadata

- `meta.version`: `6.0.0`
- `meta.name`: `Predictive History Seed Dataset V6 - LATAM Venezuela Expansion`
- `meta.description`: foco explícito em sanções, eleições, energia, migração e disputas regionais
- `meta.snapshotDate`: `2026-04-21`

## 2) Entidades adicionadas (players)

### Países
- `venezuela`
- `colombia`
- `guyana`
- `cuba`

### Lideranças
- `maduro`
- `maria_corina`
- `gonzalez_urrutia`
- `petro`
- `ali`

### Instituições / empresas
- `cne_ve` (CNE Venezuela)
- `caricom`
- `oas`
- `pdvsa`
- `chevron`

## 3) Grupos adicionados

- `ven-urban-opposition` (base urbana oposicionista)
- `ven-public-dependent` (famílias dependentes de setor público)
- `border-migrant-andes` (comunidades migrantes andinas de fronteira)

## 4) Relações adicionadas (principais blocos)

### Governança e disputa interna Venezuela
- `maduro -> venezuela` (governança, alta influência, alta volatilidade)
- `cne_ve -> venezuela` (dependência institucional com baixa legitimidade)
- `maria_corina -> gonzalez_urrutia` (coalizão)
- `maria_corina -> maduro` (rivalidade)
- `gonzalez_urrutia -> maduro` (rivalidade)

### Eixo sanções/energia e realinhamento geopolítico
- `us -> venezuela` (sanções)
- `venezuela -> us` (rivalidade)
- `venezuela -> russia` (cooperação)
- `venezuela -> china` (cooperação)
- `venezuela -> iran` (cooperação)
- `pdvsa -> chevron` (joint venture)
- `pdvsa -> venezuela` (dependência econômica)
- `chevron -> us` (lobby energético)

### Região LATAM e contenção diplomática
- `colombia -> venezuela` (fronteira)
- `petro -> maduro` (mediação)
- `brazil -> venezuela` (mediação)
- `lula -> maduro` (mediação)
- `guyana -> venezuela` (disputa territorial)
- `ali -> guyana` (governança)
- `caricom -> guyana` (cooperação)
- `oas -> venezuela` (pressão diplomática)
- `un -> venezuela` (assistência humanitária)

## 5) Eventos adicionados (últimos 5 anos)

- `ve-sanctions-tightening-2020`
- `ve-opposition-primary-2023`
- `barbados-understanding-2023`
- `essequibo-crisis-cycle-2023`
- `ve-election-contestation-2024`
- `ve-opposition-leadership-repression-2024`
- `ve-us-license-reversal-risk-2024`
- `andean-migration-pressure-2021-2025`
- `regional-mediation-window-brazil-colombia-2025`
- `caribbean-energy-routing-realignment-2025`

Cada evento foi mapeado para efeitos em `groups.*`, `players.*`, `relations.*` e `macro.*` com intensidades entre `0.15` e `0.27`, mantendo coerência com escala já usada no V5.

## 6) Validação de consistência

- JSON válido após edição.
- Eventos reordenados por `atStep`.
- Relações novas com `pairType` e `region`.
- Endpoints de relações resolvidos em `players` (incluindo `cuba`, necessário para conexão Caracas-Havana).

## 7) Resultado

Seed ativa ficou com cobertura LATAM-Venezuela significativamente maior para:
- tensão eleitoral/legitimidade,
- sanções e flexibilizações parciais,
- dinâmica energética (PDVSA/Chevron/licenças),
- migração e stress fiscal regional,
- disputa Venezuela-Guyana/Essequibo,
- mediação Brasil-Colômbia e pressão OEA/CARICOM/ONU.

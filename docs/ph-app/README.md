# Predictive History · War Room (GitHub Pages)

A app `docs/ph-app/` agora opera em dois modos:

- **Local (fallback padrão):** `engine.js` + `seed.json`
- **API (quando disponível):** usa backend HTTP real; se falhar, volta para local sem quebrar a UI.

## O que foi integrado

- `assets/js/api-client.js`
  - Config persistida em `localStorage`
  - Base URL configurável
  - Token opcional em `Authorization: Bearer <token>`
  - Timeout configurável
  - Teste de saúde (`/health`, `/api/health`, `/ph/health`)

- `assets/js/sim-adapter.js`
  - Recebe `apiClient`
  - Tenta `health + seed` via API
  - Se API indisponível, usa seed local automaticamente
  - Expõe `getStatus()` com `mode: "api" | "local"`

- `assets/js/ui.js` + `index.html`
  - Filtros diretos por tipo de entidade (`country`, `leader`, `person`, `company`, `institution`)
  - Filtro dinâmico de região com base no snapshot real
  - Quick views: **Só países**, **Só líderes**, **Só empresas**, **Top 50 influenciadores**
  - Painel de detalhe enriquecido com papel, afiliações e conexões críticas
  - Layout ajustado para mobile

- `assets/js/main.js`
  - Inicializa `apiClient` antes do adapter

## Endpoints esperados (seed/health)

O frontend tenta, nesta ordem:

- Health: `/health` → `/api/health` → `/ph/health`
- Seed: `/ph/seed` → `/api/ph/seed` → `/seed`

> Mesmo com API configurada, qualquer falha mantém o app funcional no modo local.

## Como usar

1. Abra `docs/ph-app/index.html`.
2. (Opcional) Em **Conexão API**, informe a Base URL e Token.
3. Clique em **Salvar API** e recarregue.
4. Use **Testar** para validar o backend.

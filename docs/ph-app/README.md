# Predictive History · War Room (GitHub Pages)

Aplicação estática premium em `docs/ph-app/` com foco em análise de cenários.

## O que está incluído

- Layout **war-room** profissional.
- Navegação por abas: Overview, Timeline & Playback, Network Explorer, Drivers.
- Filtros avançados (horizonte, região, segmento, risco mínimo e busca).
- Timeline com slider e **playback automático** de cenários.
- Explorer de rede com drill-down de **pessoa → supernó → bloco**.
- Painel explicável de **drivers de risco** com pesos.
- Alternância **dark/light mode**.
- Persistência local de presets de cenário via `localStorage`.

## Estrutura

- `index.html`
- `assets/css/{base,layout,components}.css`
- `assets/js/{main,state,data,ui}.js`

## Como usar

1. Abra `docs/ph-app/index.html` (ou pela URL do GitHub Pages).
2. Ajuste filtros e clique em **Aplicar**.
3. Use **Salvar preset** para persistir um cenário localmente.
4. Na aba Timeline, use **Play/Pause** para simular evolução.
5. Na aba Network, clique em nós e use drill-down/up.

> Nota: presets e tema ficam salvos no navegador atual (não sincroniza entre dispositivos).

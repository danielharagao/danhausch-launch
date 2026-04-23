# Analytics Scaffold (Moscow)

Scripts para consolidar dados disponíveis no workspace e gerar dashboard estático.

## Scripts

- `map_sources.py`: inventário de fontes candidatas.
- `build_dashboard.py`: agrega KPIs de funil + CRM (com placeholders quando faltam dados).
- `render_dashboard.py`: gera os artefatos finais em `docs/`.

## Execução

```bash
python3 analytics/map_sources.py
python3 analytics/build_dashboard.py
python3 analytics/render_dashboard.py
```

## Saídas

- `docs/assets/analytics/sources-inventory.json`
- `docs/assets/analytics/funnel-kpis.json`
- `docs/funnel-dashboard-moscow.md`
- `docs/analytics-dashboard.html`

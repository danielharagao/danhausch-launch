#!/usr/bin/env python3
"""Render markdown and static HTML dashboard from generated KPI JSON."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KPI_PATH = ROOT / "docs" / "assets" / "analytics" / "funnel-kpis.json"
MD_PATH = ROOT / "docs" / "funnel-dashboard-moscow.md"
HTML_PATH = ROOT / "docs" / "analytics-dashboard.html"


def fmt(v):
    if v is None:
        return "N/D"
    if isinstance(v, float):
        return f"{v:.2f}"
    return str(v)


def main() -> None:
    data = json.loads(KPI_PATH.read_text(encoding="utf-8"))
    funnel = data.get("funnel", {})
    crm = data.get("crm", {})
    env = funnel.get("env_breakdown", {})

    md = [
        "# Funnel Dashboard — Moscow (Scaffold)",
        "",
        f"_Gerado em: {data.get('generated_at_utc', 'N/D')}_",
        "",
        "## KPIs principais",
        "",
        f"- Registros de funil analisados (QA): **{fmt(funnel.get('records'))}**",
        f"- LP success rate: **{fmt(funnel.get('lp_success_rate_pct'))}%**",
        f"- Checkout success rate: **{fmt(funnel.get('checkout_success_rate_pct'))}%**",
        f"- Pagamento (Asaas link reach) success rate: **{fmt(funnel.get('payment_link_success_rate_pct'))}%**",
        f"- Total leads CRM: **{fmt(crm.get('total_leads'))}**",
        f"- Leads ganhos (won): **{fmt(crm.get('won_leads'))}**",
        f"- Taxa de conversão CRM (won/total): **{fmt(crm.get('conversion_rate_pct'))}%**",
        "",
        "## Breakdown por ambiente",
        "",
        "| Ambiente | Amostras | LP % | Checkout % | Asaas % | LP mediana (ms) | Checkout mediana (ms) | Asaas mediana (ms) |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]

    for name, row in sorted(env.items()):
        md.append(
            "| {name} | {count} | {lp}% | {ck}% | {asaas}% | {lpms} | {ckms} | {ams} |".format(
                name=name,
                count=fmt(row.get("count")),
                lp=fmt(row.get("lp_success_rate_pct")),
                ck=fmt(row.get("checkout_success_rate_pct")),
                asaas=fmt(row.get("asaas_success_rate_pct")),
                lpms=fmt(row.get("lp_median_load_ms")),
                ckms=fmt(row.get("checkout_median_load_ms")),
                ams=fmt(row.get("asaas_median_load_ms")),
            )
        )

    md.extend([
        "",
        "## Gaps explícitos de dados",
        "",
    ])
    for g in data.get("gaps", []):
        md.append(f"- ⚠️ {g}")

    md.extend([
        "",
        "## Observações",
        "",
        "- Este painel está em modo **scaffold estático** com base nos arquivos hoje disponíveis no workspace.",
        "- Métricas de tráfego real (visitas, sessões, eventos de conversão por canal) dependem da ingestão de GA4/Meta/API de CRM.",
    ])

    MD_PATH.write_text("\n".join(md) + "\n", encoding="utf-8")

    html = f"""<!doctype html>
<html lang=\"pt-BR\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
  <title>Analytics Dashboard - Moscow</title>
  <style>
    body{{font-family:Inter,system-ui,Arial,sans-serif;margin:24px;background:#0b1020;color:#e8eefc}}
    h1,h2{{margin:.2rem 0 .8rem}}
    .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}}
    .card{{background:#151c33;padding:14px;border-radius:10px;border:1px solid #293252}}
    .k{{font-size:12px;opacity:.8}} .v{{font-size:24px;font-weight:700}}
    table{{width:100%;border-collapse:collapse;margin-top:12px}}
    th,td{{border:1px solid #2a355a;padding:8px;font-size:14px}}
    th{{background:#1a2340;text-align:left}}
    ul{{line-height:1.6}}
  </style>
</head>
<body>
  <h1>Analytics Dashboard — Moscow (Static Scaffold)</h1>
  <p>Gerado em: {data.get('generated_at_utc','N/D')}</p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Funnel records (QA)</div><div class=\"v\">{fmt(funnel.get('records'))}</div></div>
    <div class=\"card\"><div class=\"k\">LP success rate</div><div class=\"v\">{fmt(funnel.get('lp_success_rate_pct'))}%</div></div>
    <div class=\"card\"><div class=\"k\">Checkout success rate</div><div class=\"v\">{fmt(funnel.get('checkout_success_rate_pct'))}%</div></div>
    <div class=\"card\"><div class=\"k\">Asaas reach rate</div><div class=\"v\">{fmt(funnel.get('payment_link_success_rate_pct'))}%</div></div>
    <div class=\"card\"><div class=\"k\">CRM total leads</div><div class=\"v\">{fmt(crm.get('total_leads'))}</div></div>
    <div class=\"card\"><div class=\"k\">CRM won conversion</div><div class=\"v\">{fmt(crm.get('conversion_rate_pct'))}%</div></div>
  </div>

  <h2>Breakdown por ambiente</h2>
  <table>
    <thead><tr><th>Ambiente</th><th>Amostras</th><th>LP %</th><th>Checkout %</th><th>Asaas %</th><th>LP mediana (ms)</th><th>Checkout mediana (ms)</th><th>Asaas mediana (ms)</th></tr></thead>
    <tbody>
      {''.join([f"<tr><td>{n}</td><td>{fmt(r.get('count'))}</td><td>{fmt(r.get('lp_success_rate_pct'))}%</td><td>{fmt(r.get('checkout_success_rate_pct'))}%</td><td>{fmt(r.get('asaas_success_rate_pct'))}%</td><td>{fmt(r.get('lp_median_load_ms'))}</td><td>{fmt(r.get('checkout_median_load_ms'))}</td><td>{fmt(r.get('asaas_median_load_ms'))}</td></tr>" for n,r in sorted(env.items())])}
    </tbody>
  </table>

  <h2>Gaps explícitos</h2>
  <ul>
    {''.join([f'<li>{g}</li>' for g in data.get('gaps',[])])}
  </ul>
</body>
</html>
"""

    HTML_PATH.write_text(html, encoding="utf-8")
    print(f"OK: {MD_PATH}")
    print(f"OK: {HTML_PATH}")


if __name__ == "__main__":
    main()

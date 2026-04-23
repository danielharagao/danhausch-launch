#!/usr/bin/env python3
"""Builds a static funnel+CRM analytics scaffold for Moscow dashboard."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
OUT_DIR = ROOT / "docs" / "assets" / "analytics"

SOURCES = {
    "funnel_qa_results": ROOT / "tmp" / "qa-e2e-artifacts" / "results.json",
    "sim_events_pack": ROOT / "docs" / "ph-app" / "assets" / "sim" / "events.v4.json",
    "crm_interactions": WORKSPACE / "apps" / "openclaw-cockpit" / "data" / "crm_interactions.json",
    "crm_lead_events": WORKSPACE / "apps" / "openclaw-cockpit" / "data" / "crm_lead_events.json",
    "crm_lead_status": WORKSPACE / "apps" / "openclaw-cockpit" / "data" / "crm_lead_status.json",
}


def load_json(path: Path) -> Any:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def pct(ok: int, total: int) -> float | None:
    if not total:
        return None
    return round((ok / total) * 100, 2)


def aggregate_funnel(results: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(results)
    lp_ok = sum(1 for r in results if r.get("lpStatus") == 200)
    ck_ok = sum(1 for r in results if r.get("ckStatus") == 200)
    asaas_ok = sum(1 for r in results if r.get("asaasStatus") == 200)

    env_breakdown: dict[str, dict[str, Any]] = defaultdict(lambda: {
        "count": 0,
        "lp_ok": 0,
        "checkout_ok": 0,
        "asaas_ok": 0,
        "lp_load_ms": [],
        "checkout_load_ms": [],
        "asaas_load_ms": [],
    })

    for row in results:
        env = row.get("env", "unknown")
        b = env_breakdown[env]
        b["count"] += 1
        b["lp_ok"] += 1 if row.get("lpStatus") == 200 else 0
        b["checkout_ok"] += 1 if row.get("ckStatus") == 200 else 0
        b["asaas_ok"] += 1 if row.get("asaasStatus") == 200 else 0
        if isinstance(row.get("lpLoadMs"), (int, float)):
            b["lp_load_ms"].append(row["lpLoadMs"])
        if isinstance(row.get("ckLoadMs"), (int, float)):
            b["checkout_load_ms"].append(row["ckLoadMs"])
        if isinstance(row.get("asaasLoadMs"), (int, float)):
            b["asaas_load_ms"].append(row["asaasLoadMs"])

    env_summary = {}
    for env, b in env_breakdown.items():
        env_summary[env] = {
            "count": b["count"],
            "lp_success_rate_pct": pct(b["lp_ok"], b["count"]),
            "checkout_success_rate_pct": pct(b["checkout_ok"], b["count"]),
            "asaas_success_rate_pct": pct(b["asaas_ok"], b["count"]),
            "lp_median_load_ms": median(b["lp_load_ms"]) if b["lp_load_ms"] else None,
            "checkout_median_load_ms": median(b["checkout_load_ms"]) if b["checkout_load_ms"] else None,
            "asaas_median_load_ms": median(b["asaas_load_ms"]) if b["asaas_load_ms"] else None,
        }

    return {
        "records": total,
        "lp_success_rate_pct": pct(lp_ok, total),
        "checkout_success_rate_pct": pct(ck_ok, total),
        "payment_link_success_rate_pct": pct(asaas_ok, total),
        "env_breakdown": env_summary,
        "flows": dict(Counter(r.get("flow", "unknown") for r in results)),
    }


def aggregate_crm(interactions: Any, lead_events: Any, lead_status: Any) -> tuple[dict[str, Any], list[str]]:
    gaps = []
    out = {
        "total_leads": None,
        "new_leads": None,
        "qualified_leads": None,
        "won_leads": None,
        "conversion_rate_pct": None,
        "events_count": None,
        "interactions_count": None,
        "active_leads_from_interactions": None,
    }

    if isinstance(lead_status, list) and lead_status:
        out["total_leads"] = len(lead_status)
        statuses = Counter(str(i.get("status", "unknown")).lower() for i in lead_status if isinstance(i, dict))
    elif isinstance(lead_status, dict) and lead_status:
        out["total_leads"] = len(lead_status)
        statuses = Counter(
            str(v.get("status", "tagged")).lower()
            for v in lead_status.values()
            if isinstance(v, dict)
        )
        gaps.append("crm_lead_status.json sem campo 'status' padronizado em parte dos registros")
    else:
        statuses = Counter()
        gaps.append("crm_lead_status.json indisponível ou vazio")

    if out["total_leads"]:
        out["new_leads"] = statuses.get("new")
        out["qualified_leads"] = statuses.get("qualified")
        out["won_leads"] = statuses.get("won")
        if out["won_leads"] is not None and out["total_leads"]:
            out["conversion_rate_pct"] = round((out["won_leads"] / out["total_leads"]) * 100, 2)

    if isinstance(lead_events, list):
        out["events_count"] = len(lead_events)
    else:
        gaps.append("crm_lead_events.json indisponível")

    if isinstance(interactions, list):
        out["interactions_count"] = len(interactions)
        active_leads = {i.get("leadId") for i in interactions if isinstance(i, dict) and i.get("leadId") is not None}
        out["active_leads_from_interactions"] = len(active_leads)
        if out["total_leads"] is None:
            out["total_leads"] = len(active_leads)
            gaps.append("Total de leads estimado por interações (fallback)")
    else:
        gaps.append("crm_interactions.json indisponível")

    return out, gaps


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    qa_results = load_json(SOURCES["funnel_qa_results"]) or []
    sim_events = load_json(SOURCES["sim_events_pack"]) or {}
    crm_interactions = load_json(SOURCES["crm_interactions"])
    crm_lead_events = load_json(SOURCES["crm_lead_events"])
    crm_lead_status = load_json(SOURCES["crm_lead_status"])

    funnel = aggregate_funnel(qa_results) if isinstance(qa_results, list) else {}
    crm, crm_gaps = aggregate_crm(crm_interactions, crm_lead_events, crm_lead_status)

    source_health = {
        name: {
            "path": str(path),
            "exists": path.exists(),
            "size_bytes": path.stat().st_size if path.exists() else None,
        }
        for name, path in SOURCES.items()
    }

    kpis = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "funnel": funnel,
        "crm": crm,
        "simulation_events_count": len(sim_events.get("events", [])) if isinstance(sim_events, dict) else None,
        "gaps": crm_gaps + (["Sem dados comportamentais reais do pixel/GA4 no repositório"]),
        "source_health": source_health,
    }

    (OUT_DIR / "funnel-kpis.json").write_text(json.dumps(kpis, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {OUT_DIR / 'funnel-kpis.json'}")


if __name__ == "__main__":
    main()

# Tracking Test Report (RERUN)

Date (UTC): 2026-04-23
Scope: Funnel tracking in `docs/assets/tracking.js` and connected pages.

## Execution
Command run:

```bash
python3 analytics/check_tracking.py
```

Artifacts:
- `analytics/check_tracking.py`
- `tmp/tracking-check-results.json`

## Results Summary
- Total checks: **8**
- Passed: **8**
- Failed: **0**
- Status: ✅ **PASS**

## Checks Performed
1. `index` emits `view_lp`
2. `view_lp` payload includes required keys (`utm_*`, `gclid`, `fbclid`, `page_path`)
3. `index` workshop links carry attribution params
4. workshop page emits `view_workshop`
5. workshop checkout links carry attribution params
6. checkout page emits `checkout_open`
7. Asaas checkout link carries attribution params
8. attribution persisted in `localStorage` (`dh_tracking_attribution_v1`)

## Findings
- Attribution propagation is working through LP → Workshop → Checkout → Asaas.
- Event payloads include required attribution and `page_path` fields.
- Local persistence is functioning for tested params.

## Critical Bugs
No critical bug found in this rerun.

## Notes
- URL-encoded values (e.g., `utm_term=business%2Banalyst`) were validated through decoded query parsing in the script.

# Tracking Test Plan (RERUN)

Date (UTC): 2026-04-23
Owner: Subagent rerun (`moscow-tracking-test-rerun`)

## Scope
Validate the funnel tracking implementation in `docs/assets/tracking.js` and its usage across:

- `docs/index.html`
- `docs/workshops-checkout.html`
- `docs/workshop-*.html`
- `docs/checkout-*.html`
- `docs/thank-you.html`

## Objectives
1. Confirm expected event emission by page type:
   - `view_lp`
   - `view_workshop`
   - `checkout_open`
   - `purchase_confirmed_proxy` (path-inferred page type)
2. Confirm event payload includes required attribution keys.
3. Confirm attribution propagation across links:
   - LP → Workshop
   - Workshop → Checkout
   - Checkout → Asaas (`asaas.com/c/...`)
4. Confirm attribution persistence in browser storage (`localStorage`).

## Test Data
Injected URL params:

- `utm_source=google`
- `utm_medium=cpc`
- `utm_campaign=ba_launch_apr`
- `utm_content=ad_a1`
- `utm_term=business+analyst`
- `gclid=gclid-test-123`
- `fbclid=fbclid-test-456`

## Method
Automated scripted check using Playwright (Chromium, headless):

- Script: `analytics/check_tracking.py`
- Output: `tmp/tracking-check-results.json`

The script:
- starts local HTTP server for repo docs,
- captures `gtag` event pushes via `dataLayer.push` instrumentation,
- navigates through the core funnel,
- validates query propagation by parsing href query strings,
- validates localStorage attribution persistence.

## Pass/Fail Criteria
- **PASS** if all scripted checks return `ok: true`.
- **FAIL** if any event/payload/propagation assertion fails.

## Bug Handling Rule
If a critical tracking bug is detected (broken event emission or attribution loss in funnel transitions), fix it immediately in tracking implementation and rerun checks before reporting.

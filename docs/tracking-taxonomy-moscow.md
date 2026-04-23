# Tracking Taxonomy — Moscow Funnel

## Scope
Pages covered in this rerun:
- `docs/index.html` (LP hub)
- `docs/workshops-checkout.html` (LP hub mirror)
- `docs/workshop-*.html` (3 workshop pages)
- `docs/checkout-*.html` (3 checkout bridge pages)
- `docs/thank-you.html` (proxy confirmation)

Shared tracker: `docs/assets/tracking.js`

GA4 property kept as requested: `G-KQY9Y5HJGZ`.

## Event taxonomy (MUST)

### 1) `view_lp`
When: LP/hub page view (`data-page-type="lp"`, or inferred fallback).

### 2) `click_trilha`
When: click on links that navigate to workshop pages (`workshop-*.html`).

### 3) `view_workshop`
When: workshop page view (`data-page-type="workshop"`).

### 4) `click_checkout`
When: click on checkout links (`checkout-*.html`) or Asaas checkout links (`asaas.com/c/...`).

### 5) `checkout_open`
When: checkout bridge page view (`data-page-type="checkout"`).

### 6) `purchase_confirmed_proxy`
When: proxy confirmation page view (`data-page-type="purchase_proxy"`, plus path fallback `thank-you|obrigado`).

---

## Attribution persistence and propagation

### Captured params
- `utm_*` (any querystring key starting with `utm_`)
- `fbclid`
- `gclid`

### Persistence strategy
- LocalStorage key: `dh_tracking_attribution_v1`
- Cookie mirror per key: `dh_<param>`
- Cookie TTL: 90 days
- Merge priority on runtime usage:
  1. URL params (latest)
  2. localStorage
  3. cookies

### Propagation strategy
- All internal links receive missing attribution params.
- Asaas checkout links also receive missing attribution params.
- Existing query params are preserved; tracker only fills missing attribution params.
- Hidden inputs with attribution params are injected into forms (if forms exist).

## Implementation notes
- Removed duplicated inline trackers from funnel pages.
- Standardized on `assets/tracking.js` include.
- Added `data-page-type` attributes to guarantee deterministic event firing.
- Added GA4 base script to `thank-you.html` and wired it to shared tracker for proxy purchase confirmation event.

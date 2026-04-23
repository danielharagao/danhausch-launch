#!/usr/bin/env python3
"""Scripted tracking validation for docs funnel pages.

Checks:
- event payload shape emitted to gtag
- attribution propagation across internal and Asaas checkout links
- attribution persistence (URL -> localStorage/cookie -> next page)
"""
from __future__ import annotations

import json
import re
import threading
from dataclasses import dataclass
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PORT = 0

ATTRS = {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "ba_launch_apr",
    "utm_content": "ad_a1",
    "utm_term": "business+analyst",
    "gclid": "gclid-test-123",
    "fbclid": "fbclid-test-456",
}


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
        return


@dataclass
class CheckResult:
    name: str
    ok: bool
    details: str


class Server:
    def __init__(self) -> None:
        self._httpd = ThreadingHTTPServer(("127.0.0.1", PORT), QuietHandler)
        self.port = self._httpd.server_address[1]
        self.base = f"http://127.0.0.1:{self.port}"
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)

    def __enter__(self):
        cwd = Path.cwd()
        self._cwd = cwd
        # Serve repo root so /docs/* resolves.
        import os

        os.chdir(ROOT)
        self._thread.start()
        return self

    def __exit__(self, exc_type, exc, tb):
        self._httpd.shutdown()
        self._thread.join(timeout=3)
        import os

        os.chdir(self._cwd)


def q(attrs: dict[str, str]) -> str:
    from urllib.parse import urlencode

    return urlencode(attrs)


def run() -> dict[str, Any]:
    checks: list[CheckResult] = []
    with Server() as server, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        data = []

        def capture_event(route):
            pass

        # Track gtag calls by wrapping dataLayer.push (gtag uses it).
        page.add_init_script(
            """
            (() => {
              window.__events = [];
              window.dataLayer = window.dataLayer || [];
              const originalPush = window.dataLayer.push.bind(window.dataLayer);
              window.dataLayer.push = function(...args) {
                window.__events.push(args);
                return originalPush(...args);
              };
            })();
            """
        )

        entry_url = f"{server.base}/docs/index.html?{q(ATTRS)}"
        page.goto(entry_url, wait_until="domcontentloaded")

        events = page.evaluate("window.__events")

        def gtag_events(name: str):
            found = []
            for e in events:
                if not e:
                    continue
                first = e[0]
                if isinstance(first, dict) and first.get("0") == "event" and first.get("1") == name:
                    found.append(first)
            return found

        view_lp = gtag_events("view_lp")
        checks.append(CheckResult(
            "index emits view_lp",
            bool(view_lp),
            f"view_lp_count={len(view_lp)}",
        ))

        payload = view_lp[0].get("2", {}) if view_lp else {}
        required_keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "page_path"]
        missing = [k for k in required_keys if k not in payload]
        checks.append(CheckResult(
            "view_lp payload has required keys",
            not missing,
            "missing=" + ",".join(missing) if missing else "all required keys present",
        ))

        # Check propagation on workshop CTA.
        workshop_href = page.get_attribute('a[href*="workshop-ba-pro.html"]', 'href') or ""
        from urllib.parse import urlparse, parse_qs
        q1 = parse_qs(urlparse(workshop_href).query)
        ok_attrs = all((q1.get(k) or [None])[0] == v for k, v in ATTRS.items())
        checks.append(CheckResult(
            "index workshop link has attribution query",
            ok_attrs,
            workshop_href,
        ))

        # Navigate to workshop and validate event + checkout propagation.
        page.click('a[href*="workshop-ba-pro.html"]')
        page.wait_for_url(re.compile(r".*/docs/workshop-ba-pro\.html.*"))
        events = page.evaluate("window.__events")
        view_workshop = []
        for e in events:
            if not e:
                continue
            first = e[0]
            if isinstance(first, dict) and first.get("0") == "event" and first.get("1") == "view_workshop":
                view_workshop.append(first)
        checks.append(CheckResult(
            "workshop emits view_workshop",
            bool(view_workshop),
            f"view_workshop_count={len(view_workshop)}",
        ))

        checkout_href = page.get_attribute('a[href*="checkout-ba-pro.html"]', 'href') or ""
        q2 = parse_qs(urlparse(checkout_href).query)
        checkout_has_attrs = all((q2.get(k) or [None])[0] == v for k, v in ATTRS.items())
        checks.append(CheckResult(
            "workshop checkout link has attribution query",
            checkout_has_attrs,
            checkout_href,
        ))

        page.click('a[href*="checkout-ba-pro.html"]')
        page.wait_for_url(re.compile(r".*/docs/checkout-ba-pro\.html.*"))
        events = page.evaluate("window.__events")
        checkout_open = []
        for e in events:
            if not e:
                continue
            first = e[0]
            if isinstance(first, dict) and first.get("0") == "event" and first.get("1") == "checkout_open":
                checkout_open.append(first)
        checks.append(CheckResult(
            "checkout emits checkout_open",
            bool(checkout_open),
            f"checkout_open_count={len(checkout_open)}",
        ))

        asaas_href = page.get_attribute('a[href*="asaas.com/c/"]', 'href') or ""
        q3 = parse_qs(urlparse(asaas_href).query)
        asaas_has_attrs = all((q3.get(k) or [None])[0] == v for k, v in ATTRS.items())
        checks.append(CheckResult(
            "asaas checkout link has attribution query",
            asaas_has_attrs,
            asaas_href,
        ))

        # Validate localStorage persistence keys.
        stored = page.evaluate("localStorage.getItem('dh_tracking_attribution_v1')")
        stored_obj = json.loads(stored or "{}")
        storage_ok = all(stored_obj.get(k) == v for k, v in ATTRS.items())
        checks.append(CheckResult(
            "localStorage attribution persisted",
            storage_ok,
            json.dumps(stored_obj, ensure_ascii=False),
        ))

        browser.close()

    passed = sum(1 for c in checks if c.ok)
    failed = len(checks) - passed
    return {
        "summary": {
            "passed": passed,
            "failed": failed,
            "total": len(checks),
        },
        "checks": [c.__dict__ for c in checks],
    }


def main() -> None:
    out = run()
    out_path = ROOT / "tmp" / "tracking-check-results.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(out, ensure_ascii=False, indent=2))
    print(f"\nSaved: {out_path}")


if __name__ == "__main__":
    main()

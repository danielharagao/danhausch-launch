(function () {
  const STORAGE_KEY = 'dh_tracking_attribution_v1';
  const COOKIE_DAYS = 90;
  const CORE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

  function safeParse(json) {
    try { return JSON.parse(json || '{}'); } catch (_) { return {}; }
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function getUrlParams() {
    const p = new URLSearchParams(window.location.search);
    const out = {};
    p.forEach((value, key) => {
      if (!value) return;
      if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid') out[key] = value;
    });
    return out;
  }

  function getCookieParams() {
    const out = {};
    CORE_KEYS.forEach((k) => {
      const v = getCookie(`dh_${k}`);
      if (v) out[k] = v;
    });
    return out;
  }

  function persist(params) {
    if (!params || !Object.keys(params).length) return;
    try {
      const current = safeParse(localStorage.getItem(STORAGE_KEY));
      const merged = { ...current, ...params };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      Object.entries(merged).forEach(([k, v]) => {
        if (v) setCookie(`dh_${k}`, v, COOKIE_DAYS);
      });
    } catch (_) {}
  }

  function getAttribution() {
    const fromStorage = safeParse((function(){ try { return localStorage.getItem(STORAGE_KEY); } catch(_) { return '{}'; } })());
    const fromCookie = getCookieParams();
    const fromUrl = getUrlParams();
    return { ...fromCookie, ...fromStorage, ...fromUrl };
  }

  function appendAttributionToLinks(attrs) {
    if (!attrs || !Object.keys(attrs).length) return;
    const links = document.querySelectorAll('a[href]');
    links.forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      let u;
      try {
        u = new URL(href, window.location.href);
      } catch (_) {
        return;
      }
      const internal = u.origin === window.location.origin;
      const checkout = /asaas\.com$/i.test(u.hostname) || /asaas\.com\//i.test(u.href);
      if (!internal && !checkout) return;
      Object.entries(attrs).forEach(([k, v]) => {
        if (v && !u.searchParams.get(k)) u.searchParams.set(k, v);
      });
      const relative = href.startsWith('/') || !/^https?:/i.test(href);
      a.setAttribute('href', relative ? `${u.pathname}${u.search}${u.hash}` : u.toString());
    });
  }

  function injectHiddenInputs(attrs) {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      Object.entries(attrs).forEach(([k, v]) => {
        if (!v) return;
        let input = form.querySelector(`input[name="${k}"]`);
        if (!input) {
          input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          form.appendChild(input);
        }
        input.value = v;
      });
    });
  }

  function event(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, { ...params, page_path: window.location.pathname });
      }
    } catch (_) {}
  }

  function inferPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('workshop-')) return 'workshop';
    if (path.includes('checkout-')) return 'checkout';
    if (path.includes('thank-you') || path.includes('obrigado')) return 'purchase_proxy';
    return 'lp';
  }

  function init() {
    const urlParams = getUrlParams();
    persist(urlParams);
    const attrs = getAttribution();

    appendAttributionToLinks(attrs);
    injectHiddenInputs(attrs);

    const pageType = document.body.getAttribute('data-page-type') || inferPageType();
    if (pageType === 'lp') event('view_lp', attrs);
    if (pageType === 'workshop') event('view_workshop', attrs);
    if (pageType === 'checkout') event('checkout_open', attrs);
    if (pageType === 'purchase_proxy') event('purchase_confirmed_proxy', attrs);

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const linkText = (a.textContent || '').trim();
      if (href.includes('workshop-')) event('click_trilha', { ...attrs, link_url: href, link_text: linkText });
      if (href.includes('checkout-') || href.includes('asaas.com/c/')) event('click_checkout', { ...attrs, link_url: href, link_text: linkText });
    }, true);

    window.DHTracking = {
      getAttribution,
      event
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

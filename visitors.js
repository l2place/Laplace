(() => {
  'use strict';

  const panel = document.querySelector('.activity');
  const total = document.getElementById('visit-count');
  const online = document.getElementById('online-count');
  const status = document.getElementById('counter-status');
  const note = document.getElementById('counter-note');
  const announcement = document.getElementById('counter-announcement');
  if (!panel || !total || !online || !status || !note) return;

  const base = (window.LAPLACE_COUNTER_URL || '').replace(/\/$/, '');
  let timer;
  let pending = false;
  let paused = false;
  let visitorId;

  function unavailable() {
    panel.dataset.state = 'offline';
    status.textContent = 'Activity unavailable';
    total.textContent = '—';
    online.textContent = '—';
    note.textContent = 'Visit counts will return when the connection is available.';
  }

  // A browser ID is shared by tabs. No names, IP addresses, or account data.
  // Storage can be disabled; an in-memory ID keeps the page working in that case.
  try {
    const key = 'laplace-profile-visitor-v1';
    visitorId = localStorage.getItem(key);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId || '')) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }
  } catch {
    visitorId = crypto.randomUUID();
  }

  // Local file previews must never increase production traffic counts.
  if (!base || location.protocol === 'file:') {
    unavailable();
    return;
  }
  try {
    const url = new URL(base);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw new Error('Counter must use HTTPS');
    }
  } catch {
    unavailable();
    return;
  }

  async function refresh() {
    clearTimeout(timer);
    if (pending || paused || document.hidden) return;
    pending = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${base}/api/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
        cache: 'no-store',
        credentials: 'omit',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.visits) || data.visits < 0 ||
          !Number.isSafeInteger(data.online) || data.online < 0) {
        throw new Error('Invalid count');
      }
      const wasLive = panel.dataset.state === 'live';
      total.textContent = data.visits.toLocaleString();
      online.textContent = data.online.toLocaleString();
      panel.dataset.state = 'live';
      status.textContent = 'Live activity';
      if (!wasLive && announcement) announcement.textContent = 'Live visitor counts connected.';
    } catch {
      unavailable();
    } finally {
      clearTimeout(timeout);
      pending = false;
      if (!paused && !document.hidden) timer = setTimeout(refresh, 30000);
    }
  }

  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (!document.hidden) refresh();
  });
  window.addEventListener('online', refresh);
  window.addEventListener('pagehide', () => { paused = true; clearTimeout(timer); });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { paused = false; refresh(); }
  });
  refresh();
})();

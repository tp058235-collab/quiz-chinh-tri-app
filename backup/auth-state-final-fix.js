/* auth-state-final-fix.js
   Final guard for Quiz App visibility.
   Purpose: never show auth form and dashboard at the same time.
   Put this AFTER app.js and ui-final-fix.js. */
(function () {
  'use strict';

  const PRIVATE_SELECTORS = [
    '#sidebar',
    '#dashboardSection',
    '#quizSection',
    '#aboutCard',
    '#appInfoCard',
    '#historyCard',
    '#leaderboardCard',
    '#feedbackSection',
    '#versionFooter'
  ];

  function getStorageEntries(storage) {
    try {
      return Object.keys(storage).map((key) => [key, storage.getItem(key)]);
    } catch (_error) {
      return [];
    }
  }

  function unwrapSession(value) {
    if (!value) return null;

    try {
      const parsed = JSON.parse(value);
      return parsed.currentSession || parsed.session || parsed;
    } catch (_error) {
      return null;
    }
  }

  function isUsableSession(session) {
    if (!session || typeof session !== 'object') return false;

    const token = session.access_token || session.accessToken;
    if (!token || typeof token !== 'string' || token.length < 20) return false;

    const expiresAt = Number(session.expires_at || session.expiresAt || 0);
    if (!expiresAt) return true;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return expiresAt > nowSeconds;
  }

  function hasSupabaseSession() {
    const entries = [
      ...getStorageEntries(window.localStorage),
      ...getStorageEntries(window.sessionStorage)
    ];

    return entries.some(([key, value]) => {
      const k = String(key || '').toLowerCase();
      const likelySupabaseKey =
        k.startsWith('sb-') ||
        k.includes('supabase') ||
        k.includes('auth-token');

      if (!likelySupabaseKey) return false;
      return isUsableSession(unwrapSession(value));
    });
  }

  function setHidden(element, hidden) {
    if (!element) return;

    if (hidden) {
      element.setAttribute('hidden', '');
      element.style.setProperty('display', 'none', 'important');
    } else {
      element.removeAttribute('hidden');
      element.style.removeProperty('display');
    }
  }

  function applyAuthVisibility() {
    const loggedIn = hasSupabaseSession();
    const authSection = document.getElementById('authSection');

    document.body.classList.toggle('is-authenticated', loggedIn);
    document.body.classList.toggle('is-guest', !loggedIn);

    // Main rule: auth and dashboard must never appear together.
    setHidden(authSection, loggedIn);

    PRIVATE_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        setHidden(element, !loggedIn);
      });
    });

    // If logged out, also hide any dynamically-created private cards inside homeView.
    if (!loggedIn) {
      const homeView = document.getElementById('homeView');
      if (homeView) homeView.innerHTML = '';
    }
  }

  function runSeveralTimes() {
    applyAuthVisibility();
    [80, 250, 600, 1200, 2200].forEach((delay) => {
      window.setTimeout(applyAuthVisibility, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSeveralTimes);
  } else {
    runSeveralTimes();
  }

  window.addEventListener('load', runSeveralTimes);
  window.addEventListener('storage', runSeveralTimes);

  document.addEventListener('submit', (event) => {
    if (event.target && event.target.id === 'authForm') {
      [300, 900, 1800].forEach((delay) => window.setTimeout(applyAuthVisibility, delay));
    }
  }, true);

  document.addEventListener('click', (event) => {
    const target = event.target && event.target.closest && event.target.closest('#logoutBtn');
    if (target) {
      [100, 500, 1000].forEach((delay) => window.setTimeout(applyAuthVisibility, delay));
    }
  }, true);

  // Older code may remove hidden/display after this script. Guard it.
  const observer = new MutationObserver(() => {
    window.clearTimeout(window.__testAppAuthVisibilityTimer);
    window.__testAppAuthVisibilityTimer = window.setTimeout(applyAuthVisibility, 30);
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['hidden', 'style', 'class']
  });

  // Small safety interval while testing with Live Server.
  window.setInterval(applyAuthVisibility, 1500);
})();

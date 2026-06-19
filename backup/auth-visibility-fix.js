/* auth-visibility-fix.js
   UI safety guard: keeps private/dashboard views hidden until a Supabase session exists.
   It does not change Supabase config, login logic, quiz logic, history, or leaderboard. */
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
    '#versionFooter',
    '#userBadge',
    '#logoutBtn'
  ];

  function readStorage(storage) {
    try {
      return Object.keys(storage).map((key) => [key, storage.getItem(key)]);
    } catch (_error) {
      return [];
    }
  }

  function looksLikeValidSupabaseSession(rawValue) {
    if (!rawValue) return false;

    try {
      const parsed = JSON.parse(rawValue);
      const session = parsed.currentSession || parsed.session || parsed;
      const accessToken = session.access_token || session.accessToken;
      const expiresAt = session.expires_at || session.expiresAt;

      if (!accessToken) return false;
      if (!expiresAt) return true;

      const nowSeconds = Math.floor(Date.now() / 1000);
      return Number(expiresAt) > nowSeconds;
    } catch (_error) {
      return false;
    }
  }

  function hasSupabaseSession() {
    const entries = [
      ...readStorage(window.localStorage),
      ...readStorage(window.sessionStorage)
    ];

    return entries.some(([key, value]) => {
      const normalizedKey = String(key || '').toLowerCase();
      const isSupabaseAuthKey =
        normalizedKey.startsWith('sb-') ||
        normalizedKey.includes('supabase') ||
        normalizedKey.includes('auth-token');

      return isSupabaseAuthKey && looksLikeValidSupabaseSession(value);
    });
  }

  function setHidden(selector, shouldHide) {
    const element = document.querySelector(selector);
    if (!element) return;

    if (shouldHide) {
      element.setAttribute('hidden', '');
      element.style.display = 'none';
    } else {
      element.removeAttribute('hidden');
      element.style.removeProperty('display');
    }
  }

  function forceLoginOnlyWhenLoggedOut() {
    const loggedIn = hasSupabaseSession();
    const authSection = document.getElementById('authSection');

    if (!loggedIn) {
      if (authSection) {
        authSection.removeAttribute('hidden');
        authSection.style.removeProperty('display');
      }

      PRIVATE_SELECTORS.forEach((selector) => setHidden(selector, true));
      document.body.classList.add('is-logged-out');
      document.body.classList.remove('is-logged-in');
      return;
    }

    document.body.classList.add('is-logged-in');
    document.body.classList.remove('is-logged-out');
  }

  function scheduleFix() {
    forceLoginOnlyWhenLoggedOut();
    setTimeout(forceLoginOnlyWhenLoggedOut, 100);
    setTimeout(forceLoginOnlyWhenLoggedOut, 500);
    setTimeout(forceLoginOnlyWhenLoggedOut, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleFix);
  } else {
    scheduleFix();
  }

  window.addEventListener('storage', scheduleFix);
  window.addEventListener('load', scheduleFix);

  const observer = new MutationObserver(() => {
    if (!hasSupabaseSession()) forceLoginOnlyWhenLoggedOut();
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'style', 'class']
    });
  }
})();

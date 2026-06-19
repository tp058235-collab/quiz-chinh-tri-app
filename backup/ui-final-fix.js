
/* ui-final-fix.js
   UI-only patch. It does not touch Supabase/Auth/quiz data logic. */
(function () {
  'use strict';

  const SUBJECTS = [
    { name: 'Chính trị', slug: 'chinh-tri' },
    { name: 'Tiếng Anh 1', slug: 'tieng-anh-1' },
    { name: 'Tiếng Anh 2', slug: 'tieng-anh-2' },
    { name: 'Pháp luật', slug: 'phap-luat' },
    { name: 'Kỹ năng mềm', slug: 'ky-nang-mem' },
    { name: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu' }
  ];

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function findSubjectFromText(text) {
    const clean = normalizeText(text).toLowerCase();
    return SUBJECTS.find((subject) => {
      return clean.includes(subject.slug.toLowerCase()) || clean.includes(subject.name.toLowerCase());
    });
  }

  function decorateSubjectButtons() {
    const homeView = document.getElementById('homeView');
    if (!homeView) return;

    const buttons = Array.from(homeView.querySelectorAll('button'))
      .filter((button) => findSubjectFromText(button.textContent));

    if (!buttons.length) return;

    let grid = homeView.querySelector('.subject-grid-final');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'subject-grid-final';
      buttons[0].parentNode.insertBefore(grid, buttons[0]);
    }

    buttons.forEach((button) => {
      const subject = findSubjectFromText(button.textContent);
      if (!subject) return;

      button.classList.add('subject-card-final');
      button.setAttribute('type', 'button');
      button.setAttribute('data-subject-slug-ui', subject.slug);
      button.setAttribute('aria-label', `${subject.name} - ${subject.slug}`);

      // Keep existing click listeners by moving the original button node only.
      if (button.parentElement !== grid) grid.appendChild(button);

      const current = localStorage.getItem('selectedSubjectSlug') || localStorage.getItem('selected_subject_slug');
      if (current === subject.slug) button.classList.add('is-selected');

      if (!button.querySelector('.subject-name-final')) {
        button.innerHTML = `
          <span class="subject-name-final">${subject.name}</span>
          <span class="subject-slug-final">${subject.slug}</span>
        `;
      }
    });
  }

  function syncSelectedSubject(event) {
    const button = event.target.closest && event.target.closest('.subject-card-final');
    if (!button) return;

    const slug = button.getAttribute('data-subject-slug-ui');
    if (slug) {
      localStorage.setItem('selectedSubjectSlug', slug);
      localStorage.setItem('selected_subject_slug', slug);
    }

    document.querySelectorAll('.subject-card-final').forEach((item) => {
      item.classList.toggle('is-selected', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
  }

  function setupSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (!sidebar || !toggle || toggle.dataset.finalFixReady === '1') return;

    toggle.dataset.finalFixReady = '1';

    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      sidebar.classList.add('is-collapsed');
    }

    toggle.addEventListener('click', function (event) {
      // Prevent older broken toggle handlers from fighting this one.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      sidebar.classList.toggle('is-collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('is-collapsed') ? 'true' : 'false');
    }, true);
  }

  function hideDuplicatedHeader() {
    document.querySelectorAll('.app-header, .top-brand, .header-brand, .brand-header').forEach((el) => {
      el.setAttribute('hidden', '');
      el.style.display = 'none';
    });
  }

  function applyFixes() {
    hideDuplicatedHeader();
    setupSidebarCollapse();
    decorateSubjectButtons();
  }

  document.addEventListener('click', syncSelectedSubject, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  } else {
    applyFixes();
  }

  // Home view is rendered dynamically after auth, so keep decorating it when content changes.
  const observer = new MutationObserver(() => applyFixes());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL as DEFAULT_SUPABASE_URL, SUPABASE_ANON_KEY as DEFAULT_SUPABASE_ANON_KEY } from './config.js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const APP_NAME = "Test App"; // New: Global app name
const SUPABASE_URL = (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY || '').trim();

const configError = !SUPABASE_URL || !SUPABASE_ANON_KEY
  ? 'Thiếu biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. Vui lòng cập nhật file config.js hoặc biến môi trường trước khi đăng nhập.'
  : SUPABASE_ANON_KEY.includes('service_role')
    ? 'Khóa Supabase đang dùng là service_role key. Vui lòng dùng VITE_SUPABASE_ANON_KEY (khóa công khai) cho ứng dụng này.'
    : ''; // Updated message below

const supabase = configError
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
const LEGACY_QUIZ_DRAFT_KEY = 'politics_quiz_draft';
const QUIZ_DRAFT_PREFIX = 'quiz-progress';


const elements = {
    sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  sidebarItems: document.querySelectorAll('.sidebar-item[data-nav]'),

  authSection: document.getElementById('authSection'),
  dashboardSection: document.getElementById('dashboardSection'),
  quizSection: document.getElementById('quizSection'),


  homeView: document.getElementById('homeView'),
  lessonSelect: document.getElementById('lessonSelect'),

    accountView: document.getElementById('accountView'),
  accountName: document.getElementById('accountName'),
  accountEmail: document.getElementById('accountEmail'),
  accountMessage: document.getElementById('accountMessage'),

  editNameBtn: document.getElementById('editNameBtn'),
  editNameForm: document.getElementById('editNameForm'),
  newNameInput: document.getElementById('newNameInput'),
  saveNameBtn: document.getElementById('saveNameBtn'),
  cancelNameBtn: document.getElementById('cancelNameBtn'),

  authForm: document.getElementById('authForm'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  fullNameInput: document.getElementById('fullNameInput'),
  fullNameLabel: document.getElementById('fullNameLabel'),
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  confirmPasswordInput: document.getElementById('confirmPasswordInput'),
  confirmPasswordLabel: document.getElementById('confirmPasswordLabel'),
  authMessage: document.getElementById('authMessage'),
  forgotPasswordBtn: document.getElementById('forgotPasswordBtn'),
  forgotPasswordForm: document.getElementById('forgotPasswordForm'),
  forgotEmailInput: document.getElementById('forgotEmailInput'),
  sendResetBtn: document.getElementById('sendResetBtn'),
  cancelResetBtn: document.getElementById('cancelResetBtn'),


  userBadge: document.getElementById('userBadge'),
  userEmail: document.getElementById('userEmail'),
  logoutBtn: document.getElementById('logoutBtn'),

    modeChips: document.querySelectorAll('.mode-chip'),
    modeCards: document.querySelectorAll('.mode-card'),
    examStartBtn: document.getElementById('examStartBtn'),
    practiceContinueBtn: document.getElementById('practiceContinueBtn'),
    examContinueBtn: document.getElementById('examContinueBtn'),
    retryWrongBtn: document.getElementById('retryWrongBtn'),



  historyCard: document.getElementById('historyCard'),
  historyTableBody: document.getElementById('historyTableBody'),
  refreshHistoryBtn: document.getElementById('refreshHistoryBtn'),

  leaderboardCard: document.getElementById('leaderboardCard'),
  leaderboardTableBody: document.getElementById('leaderboardTableBody'),
  refreshLeaderboardBtn: document.getElementById('refreshLeaderboardBtn'),

  quizTitle: document.getElementById('quizTitle'),
  timerBadge: document.getElementById('timerBadge'),
  pauseBtn: document.getElementById('pauseBtn'),
  quizStatus: document.getElementById('quizStatus'),
    quizCard: document.getElementById('quizCard'),
  prevQuestionBtn: document.getElementById('prevQuestionBtn'),
  nextQuestionBtn: document.getElementById('nextQuestionBtn'),
  submitQuizBtn: document.getElementById('submitQuizBtn'),


  aboutCard: document.getElementById('aboutCard'),
  appInfoCard: document.getElementById('appInfoCard'),

  feedbackSection: document.getElementById('feedbackSection'),
    feedbackInput: document.getElementById('feedbackInput'),
  sendFeedbackBtn: document.getElementById('sendFeedbackBtn'),

  // New: Home view cards
  subjectSelectionCard: null,
  quizStartCard: null,
  selectedSubjectTitle: null,
  changeSubjectBtn: null,
  confirmSubjectBtn: null,
  announcementCard: null,
  reviewCard: null,

  // Mobile menu elements (created dynamically)
  mobileMenu: document.getElementById('mobileMenu'),
  mobileMenuToggle: document.getElementById('mobileMenuToggle'),
  mobileMenuPanel: document.getElementById('mobileMenuPanel'),
  mobileUserBadge: null,
  mobileUserEmail: null,
  mobileLogoutBtn: null,
};


let authMode = 'login';
let currentMode = null;
let currentView = 'auth';
let currentUserId = null; // Dùng để tách bài đang làm theo từng tài khoản
let selectedSubjectSlug = null; // Môn đang được click trên UI
let confirmedSubjectSlug = null; // Môn đã được xác nhận


// Lesson filter state
let selectedLesson = 'all';
let questionLessons = [];
let lessonsLoading = false;
let lessonsError = '';

// New: Subjects state
const FALLBACK_SUBJECTS = [
    { id: 'chinh-tri-id', name: 'Chính Trị', slug: 'chinh-tri' },
    { id: 'tieng-anh-1-id', name: 'Tiếng Anh 1', slug: 'tieng-anh-1' },
    { id: 'tieng-anh-2-id', name: 'Tiếng Anh 2', slug: 'tieng-anh-2' },
    { id: 'phap-luat-id', name: 'Pháp Luật', slug: 'phap-luat' },
    { id: 'co-so-du-lieu-id', name: 'Cơ Sở Dữ Liệu', slug: 'co-so-du-lieu' },
    { id: 'ky-nang-mem-id', name: 'Kỹ Năng Mềm', slug: 'ky-nang-mem' },
];
let availableSubjects = [];

const LAST_WRONG_KEY = 'politics_last_wrong'; // Keep existing key for compatibility
const SIDEBAR_COLLAPSED_KEY = 'politics_sidebar_collapsed'; // Keep existing key for compatibility



let questionCount = 0;
let durationMinutes = 0;
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let answeredState = [];
let quizStartTime = 0;
let timerId = null;
let totalDurationSeconds = 0;
let isLoading = false;
let loadError = '';
let isPaused = false;
let leaderboardData = [];

// quiz mode: practice | exam_30 | exam_70
let quizMode = null;

// chọn đề thi thử (chỉ set khi click ô 30/70, chưa bắt đầu làm bài)
let selectedExamType = null;

// draft/paused quiz (đọc từ localStorage qua loadDraft)
let pausedQuizDraft = null;



function isInteractionLocked() {
  // Chỉ khóa tương tác khi đang pause ở chế độ thi thử (practice không dùng pause/timer)
  return Boolean(isPaused) && quizMode !== 'practice';
}

function isValidUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}


function ensureVersionFooterPlacement() {
  const versionFooter = document.getElementById('versionFooter');
  const appShell = document.querySelector('.app-shell');
  const appFrame = document.querySelector('.app-frame');

  if (!versionFooter || !appShell || !appFrame) return;

  // Thêm class riêng để style căn giữa theo toàn bộ layout
  versionFooter.classList.add('app-footer-version');

  // Nếu đang nằm trong cột nội dung bên phải (.app-content), đưa ra ngoài để căn giữa toàn trang
  const isInsideAppContent = Boolean(versionFooter.closest('.app-content'));
  if (!isInsideAppContent) return;

  // Đặt xuống cuối app-shell (sau app-frame) để không bị căn theo cột phải
  appShell.appendChild(versionFooter);
}


function setStatus(message, variant = 'info') {
  elements.authMessage.textContent = message || '';
  elements.authMessage.className = `status-text ${variant}`;
  if (variant === 'error' && elements.authSection && elements.authSection.hidden) {
    alert(message);
  }
}

function setAccountStatus(message, variant = 'info') {
  if (!elements.accountMessage) return;
  elements.accountMessage.textContent = message || '';
  elements.accountMessage.className = `status-text ${variant}`;
}

function ensureForgotPasswordUI() {
  const authSection = elements.authSection;
  if (!authSection) return;

  if (document.getElementById('forgotPasswordBtn')) {
    elements.forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    elements.forgotPasswordForm = document.getElementById('forgotPasswordForm');
    elements.forgotEmailInput = document.getElementById('forgotEmailInput');
    elements.sendResetBtn = document.getElementById('sendResetBtn');
    elements.cancelResetBtn = document.getElementById('cancelResetBtn');
    return;
  }

  const row = document.createElement('div');
  row.className = 'forgot-password-row';

  const btn = document.createElement('button');
  btn.id = 'forgotPasswordBtn';
  btn.type = 'button';
  btn.className = 'ghost-btn';
  btn.textContent = 'Quên mật khẩu?';

  row.appendChild(btn);

  const form = document.createElement('div');
  form.id = 'forgotPasswordForm';
  form.className = 'auth-form';
  form.hidden = true;
  form.innerHTML = `
    <label for="forgotEmailInput">Email</label>
    <input id="forgotEmailInput" type="email" placeholder="you@example.com" />
    <div class="inline-actions">
      <button id="sendResetBtn" class="primary-btn" type="button">Gửi email đặt lại</button>
      <button id="cancelResetBtn" class="ghost-btn" type="button">Hủy</button>
    </div>
  `;

  // chèn dưới form đăng nhập
  const authForm = elements.authForm;
  if (authForm?.parentNode) {
    authForm.parentNode.insertBefore(row, elements.authMessage);
    authForm.parentNode.insertBefore(form, elements.authMessage);
  }

  elements.forgotPasswordBtn = btn;
  elements.forgotPasswordForm = form;
  elements.forgotEmailInput = form.querySelector('#forgotEmailInput');
  elements.sendResetBtn = form.querySelector('#sendResetBtn');
  elements.cancelResetBtn = form.querySelector('#cancelResetBtn');
}

function ensureAccountPasswordUI() {
  const accountView = elements.accountView;
  if (!accountView) return;

  if (document.getElementById('changePasswordCard')) {
    elements.accountMessage = document.getElementById('accountMessage');
    return;
  }

  // Nếu container chưa được cấu hình dạng lưới, ta nhóm nội dung tài khoản lại thành 1 card
  if (!accountView.dataset.cardified) {
    accountView.dataset.cardified = 'true';
    accountView.style.display = 'grid';
    accountView.style.gap = '22px';

    const profileCard = document.createElement('div');
    profileCard.className = 'panel dashboard-card';
    while (accountView.firstChild) {
      profileCard.appendChild(accountView.firstChild);
    }
    accountView.appendChild(profileCard);
  }

  const toggleContainer = document.createElement('div');
  toggleContainer.style.textAlign = 'center';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'ghost-btn';
  toggleBtn.type = 'button';
  toggleBtn.textContent = 'Đổi mật khẩu';
  toggleContainer.appendChild(toggleBtn);

  accountView.appendChild(toggleContainer);

  const passCard = document.createElement('div');
  passCard.id = 'changePasswordCard';
  passCard.className = 'panel dashboard-card';
  passCard.hidden = true;
  passCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h2 style="margin: 0;">Đổi mật khẩu</h2>
      <button id="cancelChangePasswordBtn" class="ghost-btn" type="button" style="min-height: 32px; padding: 4px 12px;">Đóng</button>
    </div>
    <p class="muted-text" style="margin-bottom: 16px;">Tạo mật khẩu mới cho tài khoản của bạn. Mật khẩu tối thiểu 6 ký tự.</p>
    <p id="accountMessage" class="status-text" aria-live="polite"></p>
    <div id="changePasswordForm" class="auth-form">
      <label for="oldPasswordAccount">Mật khẩu cũ</label>
      <input id="oldPasswordAccount" type="password" placeholder="••••••••" />

      <label for="newPasswordAccount">Mật khẩu mới</label>
      <input id="newPasswordAccount" type="password" placeholder="••••••••" />

      <label for="confirmPasswordAccount">Nhập lại mật khẩu mới</label>
      <input id="confirmPasswordAccount" type="password" placeholder="••••••••" />

      <button id="changePasswordBtn" class="primary-btn" type="button">Lưu thay đổi</button>
    </div>
  `;

  accountView.appendChild(passCard);
  elements.accountMessage = passCard.querySelector('#accountMessage');

  toggleBtn.addEventListener('click', () => {
    toggleContainer.hidden = true;
    passCard.hidden = false;
  });

  const cancelBtn = passCard.querySelector('#cancelChangePasswordBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      passCard.hidden = true;
      toggleContainer.hidden = false;
      const a = document.getElementById('newPasswordAccount');
      const b = document.getElementById('confirmPasswordAccount');
      const c = document.getElementById('oldPasswordAccount');
      if (a) a.value = '';
      if (b) b.value = '';
      if (c) c.value = '';
      if (elements.accountMessage) elements.accountMessage.textContent = '';
    });
  }
}



function toggleForgotPassword() {
  if (!elements.forgotPasswordForm) return;
  const willShow = elements.forgotPasswordForm.hidden;
  elements.forgotPasswordForm.hidden = !willShow;
  if (willShow && elements.forgotEmailInput) {
    elements.forgotEmailInput.value = elements.emailInput?.value?.trim() || '';
    elements.forgotEmailInput.focus();
  }
}

function cancelForgotPassword() {
  if (!elements.forgotPasswordForm) return;
  elements.forgotPasswordForm.hidden = true;
}

async function sendResetEmail() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  const email = (elements.forgotEmailInput?.value || elements.emailInput?.value || '').trim();
  if (!email) {
    setStatus('Vui lòng nhập email.', 'error');
    return;
  }

  try {
        const recoveryUrl = new URL(
      './reset-password.html',
      window.location.href
    ).href;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: recoveryUrl,
    });
    if (error) throw error;

    setStatus('Đã gửi email đặt lại mật khẩu. Hãy mở email mới nhất và nhấn liên kết để tạo mật khẩu mới.', 'success');
    cancelForgotPassword();
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Không thể gửi email đặt lại mật khẩu.', 'error');
  }
}

function showPasswordRecoveryModal() {
  if (document.getElementById('passwordRecoveryModal')) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'passwordRecoveryModal';
  backdrop.className = 'modal-backdrop';

  const card = document.createElement('div');
  card.className = 'modal-card';
  card.innerHTML = `
    <h3>Đặt lại mật khẩu</h3>
    <p class="muted-text">Nhập mật khẩu mới để hoàn tất.</p>

    <div class="auth-form">
      <label for="recoveryNewPassword">Mật khẩu mới</label>
      <input
        id="recoveryNewPassword"
        type="password"
        placeholder="••••••••"
        autocomplete="new-password"
      />

      <label for="recoveryConfirmPassword">Nhập lại mật khẩu mới</label>
      <input
        id="recoveryConfirmPassword"
        type="password"
        placeholder="••••••••"
        autocomplete="new-password"
      />

      <div class="inline-actions">
        <button id="recoverySaveBtn" class="primary-btn" type="button">
          Lưu mật khẩu
        </button>
        <button id="recoveryCancelBtn" class="ghost-btn" type="button">
          Để sau
        </button>
      </div>

      <p id="recoveryMessage" class="status-text" aria-live="polite"></p>
    </div>
  `;

  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const saveBtn = card.querySelector('#recoverySaveBtn');
  const cancelBtn = card.querySelector('#recoveryCancelBtn');
  const messageEl = card.querySelector('#recoveryMessage');
  const newPasswordInput = card.querySelector('#recoveryNewPassword');
  const confirmPasswordInput = card.querySelector('#recoveryConfirmPassword');

  const setRecoveryMessage = (message, variant = 'info') => {
    if (!messageEl) return;
    messageEl.textContent = message || '';
    messageEl.className = `status-text ${variant}`;
  };

  const cleanRecoveryUrl = () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  };

  const close = () => {
    backdrop.remove();
  };

  window.setTimeout(() => {
    newPasswordInput?.focus();
  }, 0);

  cancelBtn?.addEventListener('click', async () => {
    cancelBtn.disabled = true;

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.warn('[Password recovery] Không thể đăng xuất phiên khôi phục:', error);
    }

    cleanRecoveryUrl();
    close();
    updateUserUI(null);
    setView('auth');
    setStatus(
      'Bạn chưa đổi mật khẩu. Có thể yêu cầu gửi lại email khi cần.',
      'info'
    );
  });

  saveBtn?.addEventListener('click', async () => {
    if (configError) {
      setRecoveryMessage(configError, 'error');
      return;
    }

    const p1 = (newPasswordInput?.value || '').trim();
    const p2 = (confirmPasswordInput?.value || '').trim();

    if (p1.length < 6) {
      setRecoveryMessage('Mật khẩu tối thiểu 6 ký tự.', 'error');
      newPasswordInput?.focus();
      return;
    }

    if (p1 !== p2) {
      setRecoveryMessage('Mật khẩu nhập lại không khớp.', 'error');
      confirmPasswordInput?.focus();
      return;
    }

    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    setRecoveryMessage('Đang cập nhật mật khẩu...', 'info');

    try {
      const { error } = await supabase.auth.updateUser({
        password: p1,
      });

      if (error) throw error;

      cleanRecoveryUrl();

      // Chỉ đăng xuất phiên khôi phục trên thiết bị hiện tại.
      await supabase.auth.signOut({ scope: 'local' });

      close();
      updateUserUI(null);
      setView('auth');
      setStatus(
        'Đã đổi mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
        'success'
      );
    } catch (error) {
      console.error('[Password recovery] Không thể đổi mật khẩu:', error);
      setRecoveryMessage(
        error?.message || 'Không thể đổi mật khẩu. Vui lòng yêu cầu email mới.',
        'error'
      );
      saveBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  });
}

async function changePasswordFromAccount() {
  if (configError) {
    setAccountStatus(configError, 'error');
    return;
  }

  const old = (document.getElementById('oldPasswordAccount')?.value || '').trim();
  const p1 = (document.getElementById('newPasswordAccount')?.value || '').trim();
  const p2 = (document.getElementById('confirmPasswordAccount')?.value || '').trim();

  if (!old) {
    setAccountStatus('Vui lòng nhập mật khẩu cũ.', 'error');
    return;
  }
  if (p1.length < 6) {
    setAccountStatus('Mật khẩu tối thiểu 6 ký tự.', 'error');
    return;
  }
  if (p1 !== p2) {
    setAccountStatus('Mật khẩu nhập lại không khớp.', 'error');
    return;
  }

  setAccountStatus('Đang xác thực...', 'info');

  try {
    // Xác thực mật khẩu cũ bằng cách thử đăng nhập lại với chính email đang dùng
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Không tìm thấy thông tin phiên đăng nhập.');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: old });
    if (signInError) throw new Error('Mật khẩu cũ không chính xác.');

    // Nếu thành công, tiến hành lưu mật khẩu mới
    const { error } = await supabase.auth.updateUser({ password: p1 });
    if (error) throw error;

    setAccountStatus('Đã đổi mật khẩu.', 'success');
    const a = document.getElementById('newPasswordAccount');
    const b = document.getElementById('confirmPasswordAccount');
    const c = document.getElementById('oldPasswordAccount');
    if (a) a.value = '';
    if (b) b.value = '';
    if (c) c.value = '';
  } catch (error) {
    console.error(error);
    setAccountStatus(error.message || 'Không thể đổi mật khẩu.', 'error');
  }
}


function setTempButtonLabel(button, label, timeoutMs = 2000) {
  if (!button) return;
  const original = button.dataset.originalLabel || button.textContent || '';
  if (!button.dataset.originalLabel) button.dataset.originalLabel = original;
  button.textContent = label;
  window.setTimeout(() => {
    if (button.textContent === label) {
      button.textContent = button.dataset.originalLabel || original;
    }
  }, timeoutMs);
}



function showSection(sectionName) {
  const resolved = sectionName || 'none';
  elements.authSection.hidden = resolved !== 'auth';
  elements.dashboardSection.hidden = resolved !== 'dashboard';
  elements.quizSection.hidden = resolved !== 'quiz';

  if (elements.sidebar) {
    elements.sidebar.hidden = false; // Luôn hiện thanh menu
  }

  if (elements.mobileMenu) {
    elements.mobileMenu.hidden = false; // Luôn hiện thanh menu mobile
  }

  if (elements.pauseBtn) {
    elements.pauseBtn.hidden = resolved !== 'quiz';
  }

  if (elements.timerBadge) {
    elements.timerBadge.hidden = resolved !== 'quiz';
  }

  if (elements.mobileMenuToggle) {
    elements.mobileMenuToggle.hidden = false; // Luôn hiện nút menu
  }
}

function setDashboardContainerMode(mode) {
  if (!elements.dashboardSection) return;

  const isHome = mode === 'home';
  const isAccount = mode === 'account';

  if (isHome || isAccount) {
    // Home và Account cần tách thành các card riêng -> bỏ panel ở container cha
    elements.dashboardSection.classList.remove('panel');
    elements.dashboardSection.style.background = 'transparent';
    elements.dashboardSection.style.border = 'none';
    elements.dashboardSection.style.boxShadow = 'none';
    elements.dashboardSection.style.padding = '0';
  } else {
    // Các view khác (Lịch sử/BXH) vẫn dùng panel như cũ
    elements.dashboardSection.classList.add('panel');
    elements.dashboardSection.style.background = '';
    elements.dashboardSection.style.border = '';
    elements.dashboardSection.style.boxShadow = '';
    elements.dashboardSection.style.padding = '';
  }
}


function setView(viewKey) {
  const isAuthed = !elements.userBadge.hidden;
  const requiresAuth = ['home', 'account', 'history', 'leaderboard'].includes(viewKey);

  let targetView = viewKey;
  if (requiresAuth && !isAuthed) {
    targetView = 'auth'; // Chuyển hướng người dùng chưa đăng nhập về màn hình auth
  }

  currentView = targetView;

  // Update active state in sidebar
  document.querySelectorAll('.sidebar-item[data-nav]').forEach(item => {
    item.classList.toggle('active', item.dataset.nav === targetView);
  });
  // Also handle user badge for 'account' view
  if (elements.userBadge) {
    elements.userBadge.classList.toggle('active', targetView === 'account');
  }

  // reset: hide everything first
  if (elements.homeView) elements.homeView.hidden = true;
  if (elements.accountView) elements.accountView.hidden = true;
  if (elements.historyCard) elements.historyCard.hidden = true;
  if (elements.leaderboardCard) elements.leaderboardCard.hidden = true;
  if (elements.aboutCard) elements.aboutCard.hidden = true;
  if (elements.appInfoCard) elements.appInfoCard.hidden = true;
  if (elements.feedbackSection) elements.feedbackSection.hidden = true;

  if (elements.editNameForm) elements.editNameForm.hidden = true;

  switch (targetView) {
    case 'home':
      setDashboardContainerMode('home');
      showSection('dashboard');
      if (elements.homeView) elements.homeView.hidden = false;
      loadSubjects(); // New: Load subjects for home view
      if (confirmedSubjectSlug) {
        loadLessons();
      }
      syncPausedQuizButtons();
      break;


    case 'account':
      setDashboardContainerMode('account');
      showSection('dashboard');
      if (elements.accountView) elements.accountView.hidden = false;
      break;
    case 'history':
      setDashboardContainerMode('default');
      showSection('dashboard');
      if (elements.historyCard) elements.historyCard.hidden = false;
      loadHistory();
      updateRetryWrongButton();
      break;
    case 'leaderboard':
      setDashboardContainerMode('default');
      showSection('dashboard');
      if (elements.leaderboardCard) elements.leaderboardCard.hidden = false;
      loadLeaderboard();
      break;
    case 'author':
      setDashboardContainerMode('default');
      showSection('none');
      if (elements.aboutCard) elements.aboutCard.hidden = false;
      break;
    case 'feedback':
      setDashboardContainerMode('default');
      showSection('none');
      if (elements.feedbackSection) elements.feedbackSection.hidden = false;
      break;
    case 'aboutApp':
      setDashboardContainerMode('default');
      showSection('none');
      if (elements.appInfoCard) elements.appInfoCard.hidden = false;
      break;
    case 'auth':
    default:
      setDashboardContainerMode('default');
      showSection('auth');
      break;
  }
}



function setSidebarCollapsed(collapsed) {
  if (!elements.sidebar) return;
  elements.sidebar.classList.toggle('is-collapsed', Boolean(collapsed));
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0'); // For app.js's getSidebarCollapsed
  localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false'); // For ui-final-fix.js
  // cập nhật biểu tượng mũi tên
  updateHomeCaret();
}

function updateHomeCaret() {
  const caret = document.querySelector('#sidebarToggle .sidebar-caret');
  const label = document.querySelector('#sidebarToggle .sidebar-label');
  const toggle = document.getElementById('sidebarToggle');
  if (!elements.sidebar) return;

  const collapsed = elements.sidebar.classList.contains('is-collapsed');

  // Khi sidebar đang mở: caret hướng vào trong (‹) để gợi ý "thu gọn".
  // Khi sidebar đang thu gọn: caret hướng ra ngoài (›) để gợi ý "mở rộng".
  if (caret) caret.textContent = collapsed ? '›' : '‹';
  if (label) label.textContent = collapsed ? 'Mở rộng menu' : 'Thu gọn menu';
  if (toggle) toggle.title = collapsed ? 'Mở rộng menu' : 'Thu gọn menu';
}

function getSidebarCollapsed() {
  const raw = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (raw === null) return null;
  return raw === '1';
}

function isQuizVisible() {
  return !elements.quizSection.hidden;
}

function scrollToTarget(targetEl) {
  if (!targetEl) return;
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function navigateFromSidebar(navKey) {
  const isAuthed = !elements.userBadge.hidden;

    if (isQuizVisible() && questions.length) {
    // Không hiện hộp thoại trình duyệt: tự lưu bài và chuyển trang bình thường
    pauseQuiz();
  }


  setView(navKey);

  // scroll after view is visible
  if (navKey === 'home') {
    scrollToTarget(isAuthed ? elements.dashboardSection : elements.authSection);
  } else if (navKey === 'account') {
    scrollToTarget(isAuthed ? elements.accountView : elements.authSection);
  } else if (navKey === 'history') {
    scrollToTarget(isAuthed ? elements.historyCard : elements.authSection);
  } else if (navKey === 'leaderboard') {
    scrollToTarget(isAuthed ? elements.leaderboardCard : elements.authSection);
  } else if (navKey === 'author') {
    scrollToTarget(elements.aboutCard);
  } else if (navKey === 'feedback') {
    scrollToTarget(elements.feedbackSection);
  } else if (navKey === 'aboutApp') {
    scrollToTarget(elements.appInfoCard);
  }
}


function setAuthMode(mode) {

  authMode = mode;
  if (elements.forgotPasswordBtn) {
    elements.forgotPasswordBtn.hidden = mode !== 'login';
  }
  if (elements.forgotPasswordForm) {
    elements.forgotPasswordForm.hidden = true;
  }

  elements.modeChips.forEach((chip) => chip.classList.toggle('active', chip.dataset.authMode === mode));
  elements.authSubmitBtn.textContent = mode === 'register' ? 'Đăng ký' : 'Đăng nhập';

  const isRegister = mode === 'register';
  if (elements.fullNameInput && elements.fullNameLabel) {
    elements.fullNameInput.hidden = !isRegister;
    elements.fullNameLabel.hidden = !isRegister;
    elements.fullNameInput.required = isRegister;
    if (!isRegister) elements.fullNameInput.value = '';
  }

  elements.confirmPasswordInput.hidden = !isRegister;
  elements.confirmPasswordLabel.hidden = !isRegister;
  if (!isRegister) {
    elements.confirmPasswordInput.value = '';
  }
}


function updateUserUI(session) {
  const user = session?.user;
  currentUserId = user?.id || null;

  if (user) {
    elements.userBadge.hidden = false;
    if (elements.mobileUserBadge) elements.mobileUserBadge.hidden = false;
    elements.userEmail.textContent = 'Đang tải...';
    if (elements.mobileUserEmail) elements.mobileUserEmail.textContent = 'Đang tải...';
    elements.logoutBtn.hidden = false;
    if (elements.mobileLogoutBtn) elements.mobileLogoutBtn.hidden = false;

    document.querySelectorAll('.sidebar-item[data-nav="auth"]').forEach(btn => btn.hidden = true);
  } else {
    elements.userBadge.hidden = true;
    if (elements.mobileUserBadge) elements.mobileUserBadge.hidden = true;
    elements.logoutBtn.hidden = true;
    if (elements.mobileLogoutBtn) elements.mobileLogoutBtn.hidden = true;

    document.querySelectorAll('.sidebar-item[data-nav="auth"]').forEach(btn => btn.hidden = false);
  }
}


async function ensureProfileForSession(session) {
  if (configError) return;
  const user = session?.user;
  if (!user) return;

  try {
    const { data: existing, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    const existingName = (existing?.full_name || '').trim();
    const displayName = existingName || user.email || 'Người dùng';

    elements.userEmail.textContent = displayName;
    // New: Update mobile user email
    if (elements.mobileUserEmail) elements.mobileUserEmail.textContent = displayName;
    if (elements.accountName) elements.accountName.textContent = displayName;
    if (elements.accountEmail) elements.accountEmail.textContent = user.email || '';

    if (elements.newNameInput) {
      elements.newNameInput.value = existingName || '';
    }
  } catch (error) {
    console.warn('Không thể tải profiles:', error);
    const fallback = session?.user?.email || 'Người dùng';
    elements.userEmail.textContent = fallback;
    if (elements.accountName) elements.accountName.textContent = fallback;
    // New: Update mobile user email
    if (elements.mobileUserEmail) elements.mobileUserEmail.textContent = fallback;
    if (elements.accountEmail) elements.accountEmail.textContent = session?.user?.email || '';
    if (elements.newNameInput) elements.newNameInput.value = '';
  }
}



async function loadLessons() {
  if (!elements.lessonSelect) return;
  if (configError) return;

  lessonsLoading = true;
  lessonsError = '';

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      questionLessons = [];
      elements.lessonSelect.innerHTML = '';
      lessonsLoading = false;
      return;
    }

    const { data, error } = await supabase.rpc('get_lessons', { p_subject_slug: confirmedSubjectSlug }); // Updated RPC call
    if (error) {
      console.error('[loadLessons] rpc error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
            lessonsError = error.message || 'Không thể tải danh sách bài/phần.';
      questionLessons = [];
      elements.lessonSelect.innerHTML = '<option value="all">Tất cả bài/phần</option>';
      elements.lessonSelect.value = 'all';
      selectedLesson = 'all';
      setStatus('Không thể tải danh sách bài/phần: ' + lessonsError, 'error');
      return;

    }

    questionLessons = Array.isArray(data) ? data : [];

    const current = elements.lessonSelect.value || selectedLesson || 'all';

    const options = [
      { value: 'all', label: 'Tất cả bài/phần' },
      ...questionLessons.map((row) => ({
        value: row.lesson,
        label: `${row.lesson} (${row.question_count} câu)`,
      })),
    ];

    elements.lessonSelect.innerHTML = options
      .map((opt) => `<option value="${String(opt.value).replace(/"/g, '&quot;')}">${opt.label}</option>`)
      .join('');

    if (options.some((o) => o.value === current)) {
      elements.lessonSelect.value = current;
    } else {
      elements.lessonSelect.value = 'all';
    }

    selectedLesson = elements.lessonSelect.value || 'all';
  } catch (error) {
    console.error('[loadLessons] unexpected error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
        lessonsError = error?.message || 'Không thể tải danh sách bài/phần.';
    questionLessons = [];
    elements.lessonSelect.innerHTML = '<option value="all">Tất cả bài/phần</option>';
    elements.lessonSelect.value = 'all';
    selectedLesson = 'all';
    setStatus('Không thể tải danh sách bài/phần: ' + lessonsError, 'error');

  
  } finally {
    lessonsLoading = false;
  }
}

function ensureMobileMenuUI() {
  const frame = document.querySelector('.app-frame');
  const content = document.querySelector('.app-content');
  if (!frame || !content) return;

  

  // Create once
  if (elements.mobileMenu) { // Check elements.mobileMenu instead of document.getElementById
    elements.mobileMenu = document.getElementById('mobileMenu');
    elements.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    elements.mobileMenuPanel = document.getElementById('mobileMenuPanel');
    return;
  }

  const wrap = document.createElement('div');
  wrap.id = 'mobileMenu';
  wrap.className = 'mobile-menu';

  const toggle = document.createElement('button');
  toggle.id = 'mobileMenuToggle';
  toggle.className = 'mobile-menu-toggle sidebar-item';
  toggle.type = 'button'; // New: Ensure button type
  toggle.innerHTML = '<span class="sidebar-icon">☰</span><span class="sidebar-label">Menu</span><span class="sidebar-caret" aria-hidden="true">▼</span>';

  const panel = document.createElement('div');
  panel.id = 'mobileMenuPanel';
  panel.className = 'mobile-menu-panel';

 const items = Array.from(document.querySelectorAll('.sidebar-item[data-nav]'))
  .filter((btn) => {
    const nav = btn.dataset.nav || '';
    const label = btn.querySelector('.sidebar-label')?.textContent?.trim() || '';

    return (
      nav &&
      nav !== 'account' &&
      nav !== 'auth' &&
      btn.id !== 'sidebarToggle' &&
      btn.id !== 'mobileMenuToggle' &&
      !btn.classList.contains('sidebar-toggle') &&
      !label.includes('Mở rộng menu') &&
      !label.includes('Thu gọn menu')
    );
  });

  items.forEach((src) => {
    const btn = document.createElement('button');
    btn.className = 'sidebar-item';
    btn.type = 'button';
    btn.dataset.nav = src.dataset.nav || '';
    btn.title = src.title || '';

    const icon = src.querySelector('.sidebar-icon')?.textContent || '';
    const label = src.querySelector('.sidebar-label')?.textContent || '';
    btn.innerHTML = `<span class="sidebar-icon">${icon}</span><span class="sidebar-label">${label}</span>`;

    btn.addEventListener('click', () => {
      navigateFromSidebar(btn.dataset.nav);
      // close after navigate
      wrap.classList.remove('open');
      const caret = toggle.querySelector('.sidebar-caret');
      if (caret) caret.textContent = '▼';
    });

    panel.appendChild(btn);
  });

  // Add separator and footer items
  const footerContainer = document.createElement('div');
  footerContainer.className = 'sidebar-footer'; // Use same class for potential styling
  footerContainer.style.marginTop = '10px';
  footerContainer.style.paddingTop = '10px';
  footerContainer.style.borderTop = '1px solid var(--line)';

  // User badge for mobile
  const userBadgeMobile = document.createElement('button');
  userBadgeMobile.className = 'sidebar-item';
  userBadgeMobile.type = 'button';
  userBadgeMobile.title = 'Tài khoản';
  userBadgeMobile.innerHTML = `<span class="sidebar-icon">👤</span><span class="sidebar-label" id="mobileUserEmail"></span>`;
  userBadgeMobile.hidden = true;
  userBadgeMobile.addEventListener('click', () => {
    navigateFromSidebar('account');
    wrap.classList.remove('open'); // Close menu on nav
    const caret = toggle.querySelector('.sidebar-caret');
    if (caret) caret.textContent = '▼';
  });

  // Logout button for mobile
  const logoutBtnMobile = document.createElement('button');
  logoutBtnMobile.className = 'sidebar-item';
  logoutBtnMobile.type = 'button';
  logoutBtnMobile.title = 'Đăng xuất';
  logoutBtnMobile.innerHTML = `<span class="sidebar-icon">⎋</span><span class="sidebar-label">Đăng xuất</span>`;
  logoutBtnMobile.hidden = true;
  logoutBtnMobile.addEventListener('click', handleLogout);

  footerContainer.appendChild(userBadgeMobile);
  footerContainer.appendChild(logoutBtnMobile);
  panel.appendChild(footerContainer);
  // Xóa nút thu gọn/mở rộng sidebar desktop nếu bị copy nhầm vào mobile menu
Array.from(panel.querySelectorAll('.sidebar-item')).forEach((btn) => {
  const label = btn.querySelector('.sidebar-label')?.textContent?.trim() || '';

  if (
    btn.id === 'sidebarToggle' ||
    btn.classList.contains('sidebar-toggle') ||
    label.includes('Mở rộng menu') ||
    label.includes('Thu gọn menu')
  ) {
    btn.remove();
  }
});

  toggle.addEventListener('click', () => {
    wrap.classList.toggle('open');
    const caret = toggle.querySelector('.sidebar-caret');
    if (caret) caret.textContent = wrap.classList.contains('open') ? '▲' : '▼';
  });

  wrap.appendChild(toggle);
  wrap.appendChild(panel); // Panel is inside the wrap
const appShell = document.querySelector('.app-shell');
const appFrame = document.querySelector('.app-frame');

if (appShell && appFrame) {
  appShell.insertBefore(wrap, appFrame);
} else if (appShell) {
  appShell.prepend(wrap);
}
  elements.mobileMenu = wrap;
  elements.mobileMenuToggle = toggle;
  elements.mobileMenuPanel = panel;
  elements.mobileUserBadge = userBadgeMobile;
  elements.mobileUserEmail = userBadgeMobile.querySelector('#mobileUserEmail');
  elements.mobileLogoutBtn = logoutBtnMobile;
}

function setupHomeViewLayout() {
  if (!elements.homeView) return;

  elements.homeView.innerHTML = ''; // Clear existing content
  elements.homeView.className = 'home-content-grid'; // Apply grid for home view

  // Subject Selection Card (main content)
  const subjectSelectionCard = document.createElement('div');
  subjectSelectionCard.className = 'panel hero-card';
  subjectSelectionCard.innerHTML = `
      <h2 class="subject-page-title">Môn học</h2>
      <p class="muted-text">Chọn môn học bạn muốn ôn tập hoặc thi thử.</p>
      <div class="subject-grid-final"></div>
      <div class="action-button-row">
          <button id="confirmSubjectBtn" class="primary-btn" type="button" disabled>Xác nhận chọn môn</button>
      </div>
  `;
  elements.homeView.appendChild(subjectSelectionCard);
  elements.subjectSelectionCard = subjectSelectionCard;
  elements.subjectGrid = subjectSelectionCard.querySelector('.subject-grid-final');
  elements.confirmSubjectBtn = subjectSelectionCard.querySelector('#confirmSubjectBtn');

  // Quiz Start Card
  const quizStartCard = document.createElement('div');
  quizStartCard.className = 'panel hero-card';
  quizStartCard.hidden = true; // Ẩn mặc định khi chưa xác nhận môn học
  quizStartCard.innerHTML = `
      <div class="section-header" style="margin-bottom: 16px;">
        <div>
          <p class="eyebrow">LÀM BÀI</p>
          <h2 id="selectedSubjectTitle">Bắt đầu ôn tập</h2>
        </div>
        <button id="changeSubjectBtn" class="ghost-btn" type="button">Đổi môn</button>
      </div>
      <p class="muted-text">Chọn bài/phần và chế độ để bắt đầu.</p>
      <div class="lesson-filter">
          <label for="lessonSelect">Bài / Phần</label>
          <select id="lessonSelect"></select>
      </div>
      <div class="action-button-row">
          <button id="practiceStartBtn" class="primary-btn" type="button">Bắt đầu luyện tập</button>
          <button id="practiceContinueBtn" class="ghost-btn" type="button" hidden>Tiếp tục</button>
      </div>
      <div class="mode-grid-exam">
          <button class="mode-card" data-mode="30" data-time="20" type="button">
              <strong>30 câu</strong>
              <span>20 phút</span>
          </button>
          <button class="mode-card" data-mode="70" data-time="60" type="button">
              <strong>70 câu</strong>
              <span>60 phút</span>
          </button>
      </div>
      <div class="action-button-row">
          <button id="examStartBtn" class="primary-btn" type="button">Bắt đầu thi thử</button>
          <button id="examContinueBtn" class="ghost-btn" type="button" hidden>Tiếp tục</button>
      </div>
  `;
  elements.homeView.appendChild(quizStartCard);
  elements.quizStartCard = quizStartCard;
  elements.selectedSubjectTitle = quizStartCard.querySelector('#selectedSubjectTitle');
  elements.changeSubjectBtn = quizStartCard.querySelector('#changeSubjectBtn');
  elements.lessonSelect = quizStartCard.querySelector('#lessonSelect');
  elements.practiceStartBtn = quizStartCard.querySelector('#practiceStartBtn');
  elements.practiceContinueBtn = quizStartCard.querySelector('#practiceContinueBtn');
  elements.modeCards = quizStartCard.querySelectorAll('.mode-card'); // These are for exam modes
  elements.examStartBtn = quizStartCard.querySelector('#examStartBtn');
  elements.examContinueBtn = quizStartCard.querySelector('#examContinueBtn');


 
// Announcement Card
const announcementCard = document.createElement('div');
announcementCard.className = 'panel info-card announcement-card';

announcementCard.innerHTML = `
  <h2>Thông báo từ nhà phát triển</h2>

  <p
    class="muted-text"
    style="
      display: block;
      width: 100%;
      margin: 0;
      text-align: justify;
      text-align-last: left;
      line-height: 1.7;
      word-spacing: normal;
    "
  >
    ${APP_NAME} đang được nâng cấp giao diện và mở rộng nhiều môn học.
    Một số tính năng sẽ tiếp tục được tối ưu để quá trình học tập ổn định
    và thuận tiện hơn.
  </p>
`;

elements.homeView.appendChild(announcementCard);
elements.announcementCard = announcementCard;



  // Review Card
const reviewCard = document.createElement('div');
reviewCard.className = 'panel info-card review-section';

reviewCard.innerHTML = `
  <h2>Đánh giá từ người học</h2>

  <div class="review-grid">
    <article class="review-item">
      <p class="review-content">
        “Giao diện dễ nhìn, thao tác chọn môn nhanh và thuận tiện.”
      </p>
      <p class="review-student">
        Sinh viên đến từ Khoa Công nghệ Thông tin
      </p>
    </article>

    <article class="review-item">
      <p class="review-content">
        “Ứng dụng phù hợp để ôn tập và kiểm tra kiến thức trước kỳ thi.”
      </p>
      <p class="review-student">
        Sinh viên đến từ Khoa Điện – Điện tử
      </p>
    </article>

    <article class="review-item">
      <p class="review-content">
        “Mong ứng dụng tiếp tục bổ sung thêm nhiều môn học trong thời gian tới.”
      </p>
      <p class="review-student">
        Sinh viên đến từ Khoa Kinh tế
      </p>
    </article>
  </div>
`;

elements.homeView.appendChild(reviewCard);
elements.reviewCard = reviewCard;
  loadSubjects(); // Load and render subjects
  syncPausedQuizButtons(); // Update continue buttons
}

// New: Load subjects from Supabase
async function loadSubjects() {
    if (configError) {
        availableSubjects = FALLBACK_SUBJECTS;
        renderSubjectCards();
        updateHomeCardsVisibility();
        return;
    }
    try {
        const { data, error } = await supabase.rpc('get_subjects');
        if (error) {
            console.error('Error fetching subjects:', error);
            availableSubjects = FALLBACK_SUBJECTS;
        } else {
            availableSubjects = data.length > 0 ? data : FALLBACK_SUBJECTS;
        }
    } catch (e) {
        console.error('Unexpected error fetching subjects:', e);
        availableSubjects = FALLBACK_SUBJECTS;
    }
    renderSubjectCards();
    updateHomeCardsVisibility();
}

// New: Render subject cards
function renderSubjectCards() {
    if (!elements.subjectGrid) return;
    elements.subjectGrid.innerHTML = ''; // Clear existing cards

    availableSubjects.forEach(subject => {
        const card = document.createElement('button');
        card.className = `subject-card-final ${subject.slug === selectedSubjectSlug ? 'active is-selected' : ''}`;
        card.type = 'button';
        card.dataset.slug = subject.slug;
        card.innerHTML = `
            <span class="subject-name-final">${subject.name}</span>
        `;
        card.addEventListener('click', () => {
            selectedSubjectSlug = subject.slug;
            localStorage.setItem('selectedSubjectSlug', selectedSubjectSlug);
            renderSubjectCards(); // Re-render to update selection
            if (elements.confirmSubjectBtn) elements.confirmSubjectBtn.disabled = false;
            loadLessons(); // Reload lessons for the new subject
            setStatus(`Đã chọn môn: ${subject.name}`, 'info');
        });
        elements.subjectGrid.appendChild(card);
    });
}

function updateHomeCardsVisibility() {
  if (elements.subjectSelectionCard) {
    elements.subjectSelectionCard.hidden = Boolean(confirmedSubjectSlug);
  }
  if (elements.quizStartCard) {
    elements.quizStartCard.hidden = !confirmedSubjectSlug;
  }
  if (elements.announcementCard) {
    elements.announcementCard.hidden = Boolean(confirmedSubjectSlug);
  }
  if (elements.reviewCard) {
    elements.reviewCard.hidden = Boolean(confirmedSubjectSlug);
  }

  if (confirmedSubjectSlug && elements.selectedSubjectTitle) {
    const subject = availableSubjects.find(s => s.slug === confirmedSubjectSlug);
    if (subject) {
      elements.selectedSubjectTitle.textContent = `Ôn tập: ${subject.name}`;
    }
  }
}


  async function saveNewName() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  const fullName = (elements.newNameInput?.value || '').trim();
  console.log('[saveNewName] input fullName:', fullName);
  if (!fullName) {
    setStatus('Vui lòng nhập họ tên.', 'error');
    return;
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('[saveNewName] getUser error:', userError);
      setStatus('Bạn cần đăng nhập lại.', 'error');
      return;
    }
    const user = userData.user;
    console.log('[saveNewName] current user id:', user.id);

    const payload = { id: user.id, user_id: user.id, full_name: fullName };
    console.log('[saveNewName] payload:', payload);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('[saveNewName] upsert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        payloadDataSent: payload,
      });
      setStatus('Không thể lưu họ tên: ' + (error.message || 'Lỗi không xác định'), 'error');
      return;
    }

    console.log('[saveNewName] upsert success:', data);

    const newName = (data?.full_name || '').trim();
    // Cập nhật UI ngay, không cần reload
    if (elements.accountName) elements.accountName.textContent = newName || user.email || '';
    elements.userEmail.textContent = newName || user.email || '';
    // New: Update mobile user email
    if (elements.mobileUserEmail) elements.mobileUserEmail.textContent = newName || user.email || '';

    if (elements.editNameForm) elements.editNameForm.hidden = true;
    if (elements.editNameBtn) elements.editNameBtn.textContent = 'Đổi tên';
    if (elements.newNameInput) elements.newNameInput.value = newName;

    setStatus('Đã lưu họ tên.', 'success');

    await loadLeaderboard();
  } catch (error) {
    console.error('[saveNewName] error caught:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    setStatus(error?.message || 'Không thể đổi tên.', 'error');
  }
}


function openEditName() {
  if (elements.editNameForm?.hidden) {
    // mở form và đổi nút thành Lưu
    if (elements.newNameInput && elements.accountName) {
      elements.newNameInput.value = elements.accountName.textContent || '';
    }
    elements.editNameForm.hidden = false;
    if (elements.editNameBtn) elements.editNameBtn.textContent = 'Lưu';
    elements.newNameInput?.focus();
  } else {
    // form đang mở -> bấm lại nút Đổi tên sẽ thực hiện lưu luôn
    saveNewName();
  }
}


function cancelEditName() {
  if (elements.editNameForm) elements.editNameForm.hidden = true;
  if (elements.editNameBtn) elements.editNameBtn.textContent = 'Đổi tên';
}


function sendFeedbackEmail() {
  const content = elements.feedbackInput?.value?.trim() || '';

  if (!content) {
    alert('Vui lòng nhập nội dung góp ý.');
    elements.feedbackInput?.focus();
    return;
  }

  const to = 'tp058235@gmail.com';
  const subject = 'Góp ý về ứng dụng Test App';

  const userLine = !elements.userBadge.hidden
    ? `Tài khoản: ${elements.userEmail.textContent || ''}`
    : 'Tài khoản: (chưa đăng nhập)';

  const body = `${userLine}\n\nNội dung góp ý:\n${content}`;

  // Mở Gmail với email, tiêu đề, nội dung đã điền sẵn
  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(to)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  // Dự phòng nếu trình duyệt chặn mở tab mới
  const mailtoUrl =
    `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const newWindow = window.open(gmailUrl, '_blank');

  if (!newWindow) {
    window.location.href = mailtoUrl;
  }
}


async function checkSession() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    updateUserUI(session);

    if (!session?.user) {
      setView('auth');
      return;
    }

    // Liên kết đặt lại mật khẩu tạo một phiên đăng nhập tạm thời.
    // Không được đưa người dùng vào trang chủ trước khi họ đặt mật khẩu mới.
    if (isPasswordRecoveryUrl()) {
      openPasswordRecovery(session);
      return;
    }

    await ensureProfileForSession(session);
    updateRetryWrongButton();
    await Promise.all([
      loadHistory(),
      loadLeaderboard(),
      loadLessons(),
    ]);

    setView('home');
  } catch (error) {
    console.error('[checkSession] Không thể kiểm tra phiên:', error);
    setStatus(
      'Không thể kiểm tra phiên đăng nhập. Vui lòng thử lại.',
      'error'
    );
  }
}


async function handleAuthSubmit(event) {
  event.preventDefault();

  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();

  if (!email || !password) {
    setStatus('Vui lòng nhập email và mật khẩu.', 'error');
    return;
  }

  elements.authSubmitBtn.disabled = true;
  setStatus('Đang xử lý...', 'info');

  try {
    if (authMode === 'register') {
      const fullName = elements.fullNameInput?.value?.trim() || '';
      const confirmPassword = elements.confirmPasswordInput.value.trim();

      if (!fullName) {
        setStatus('Vui lòng nhập họ và tên.', 'error');
        return;
      }

      if (!password || !confirmPassword) {
        setStatus('Vui lòng nhập đầy đủ mật khẩu và xác nhận mật khẩu.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        setStatus('Mật khẩu nhập lại không khớp.', 'error');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;

      setStatus('Đăng ký thành công. Có thể kiểm tra email xác nhận trong mục thư rác của bạn nếu không thấy.', 'success');

            if (data?.session) {
        updateUserUI(data.session);
        await ensureProfileForSession(data.session);
        updateRetryWrongButton();
        await Promise.all([loadHistory(), loadLeaderboard()]);
        setView('home');
      }

    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
            updateUserUI(data.session);
      await ensureProfileForSession(data.session);
      updateRetryWrongButton();
      await Promise.all([loadHistory(), loadLeaderboard()]);
      setView('home');
      setStatus('Đăng nhập thành công.', 'success');

    }
  } catch (error) {
    console.error(error);
    let errorMsg = error.message || 'Đăng nhập hoặc đăng ký thất bại.';
    if (error.message === 'Invalid login credentials' || error.status === 400) {
      errorMsg = 'Email hoặc mật khẩu không chính xác.';
    }
    if (error.message === 'Email not confirmed') {
      errorMsg = 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư đến (hoặc thư rác) để xác nhận tài khoản.';
    }
    setStatus(errorMsg, 'error');
  } finally {
    elements.authSubmitBtn.disabled = false;
  }
}


async function handleLogout() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
        updateUserUI(null);
        clearQuizState();
        setView('auth');
        showSection('auth');
        if (elements.sidebar) elements.sidebar.hidden = true;
        setStatus('Đã đăng xuất.', 'success');


  } catch (error) {
    console.error(error);
    setStatus('Không thể đăng xuất. Vui lòng thử lại.', 'error');
  }
}

function clearQuizState() {
  questions = [];
  currentQuestionIndex = 0;
  selectedAnswers = [];
  answeredState = [];
  currentMode = null;
  quizMode = null;
  questionCount = 0;
  durationMinutes = 0;
  totalDurationSeconds = 0;
  isPaused = false;
  stopTimer();

  // Không xóa bài tạm ở đây. Bài tạm đã được tách theo tài khoản + môn,
  // nên đăng xuất hoặc đổi màn hình không làm mất bài của môn khác.
}

function getDraftStorageKey(
  subjectSlug = confirmedSubjectSlug,
  userId = currentUserId
) {
  const safeUserId = String(userId || '').trim();
  const safeSubjectSlug = String(subjectSlug || '').trim();

  if (!safeUserId || !safeSubjectSlug) return null;
  return `${QUIZ_DRAFT_PREFIX}:${safeUserId}:${safeSubjectSlug}`;
}

function saveDraft() {
  const subjectSlug = String(confirmedSubjectSlug || '').trim();
  const storageKey = getDraftStorageKey(subjectSlug, currentUserId);

  // Chỉ lưu khi đã đăng nhập và đã xác nhận đúng môn.
  if (!storageKey || !questions.length) return;

  const draft = {
    user_id: currentUserId,
    subject_slug: subjectSlug,
    questions,
    currentQuestionIndex,
    answers: selectedAnswers,
    startedAt: quizStartTime,
    remainingSeconds: totalDurationSeconds,
    totalQuestions: questionCount,
    durationMinutes,
    paused: Boolean(isPaused),
    quizMode,
    selectedLesson,
    quizStarted: true,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(storageKey, JSON.stringify(draft));
}

function loadDraft(
  subjectSlug = confirmedSubjectSlug,
  userId = currentUserId
) {
  const storageKey = getDraftStorageKey(subjectSlug, userId);
  if (!storageKey) return null;

  try {
    const draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!draft) return null;

    // Chặn tuyệt đối việc dùng bài của tài khoản hoặc môn khác.
    if (draft.user_id !== userId) return null;
    if (draft.subject_slug !== subjectSlug) return null;

    return draft;
  } catch (error) {
    console.warn('[loadDraft] Dữ liệu bài tạm không hợp lệ:', error);
    return null;
  }
}

function clearDraft(
  subjectSlug = confirmedSubjectSlug,
  userId = currentUserId
) {
  const storageKey = getDraftStorageKey(subjectSlug, userId);
  if (storageKey) localStorage.removeItem(storageKey);
}

function getPausedQuizDraft(
  subjectSlug = confirmedSubjectSlug,
  userId = currentUserId
) {
  const draft = loadDraft(subjectSlug, userId);
  if (!draft?.quizStarted) return null;
  if (!Array.isArray(draft.questions) || !draft.questions.length) return null;
  if (draft.user_id !== userId || draft.subject_slug !== subjectSlug) return null;
  return draft;
}

function resolveDraftMode(draft) {
  if (!draft) return null;
  if (draft.quizMode) return draft.quizMode;

  const minutes = Number(draft.durationMinutes || 0);
  if (!minutes) return 'practice';

  const total = Number(draft.totalQuestions || draft.questions?.length || 0);
  return total >= 70 ? 'exam_70' : 'exam_30';
}

function syncPausedQuizButtons() {
  pausedQuizDraft = getPausedQuizDraft(confirmedSubjectSlug, currentUserId);
  const mode = resolveDraftMode(pausedQuizDraft);

  if (elements.practiceContinueBtn) elements.practiceContinueBtn.hidden = true;
  if (elements.examContinueBtn) elements.examContinueBtn.hidden = true;

  // reset labels về mặc định
  if (elements.practiceStartBtn?.dataset?.originalLabel) {
    elements.practiceStartBtn.textContent = elements.practiceStartBtn.dataset.originalLabel;
  }
  if (elements.examStartBtn?.dataset?.originalLabel) {
    elements.examStartBtn.textContent = elements.examStartBtn.dataset.originalLabel;
  }

  if (mode === 'practice') {
    if (elements.practiceContinueBtn) elements.practiceContinueBtn.hidden = false;
    if (elements.practiceStartBtn) elements.practiceStartBtn.textContent = 'Bài luyện tập mới';
  } else if (mode === 'exam_30' || mode === 'exam_70') {
    if (elements.examContinueBtn) elements.examContinueBtn.hidden = false;
    if (elements.examStartBtn) elements.examStartBtn.textContent = 'Bài thi thử mới';
  }
}


function confirmDiscardPausedQuizIfAny() {
  const existing = getPausedQuizDraft(confirmedSubjectSlug, currentUserId);
  if (!existing) return true;

    // Không hiện hộp thoại trình duyệt: tự xóa bài cũ khi bắt đầu bài mới
  clearDraft();
  pausedQuizDraft = null;
  syncPausedQuizButtons();
  setStatus('Đã xóa bài làm cũ để bắt đầu bài mới.', 'info');
  return true;

}

function continuePausedQuiz() {
  const activeSubjectSlug = String(confirmedSubjectSlug || '').trim();
  const draft = getPausedQuizDraft(activeSubjectSlug, currentUserId);

  if (!draft) {
    syncPausedQuizButtons();
    setStatus('Không có bài làm tạm dừng của môn này để tiếp tục.', 'info');
    return;
  }

  if (
    draft.user_id !== currentUserId ||
    draft.subject_slug !== activeSubjectSlug
  ) {
    syncPausedQuizButtons();
    setStatus('Bài đang lưu không thuộc môn hiện tại.', 'error');
    return;
  }

  // Giữ nguyên đúng môn của bài đang tiếp tục, không tự chuyển sang môn khác.
  selectedSubjectSlug = draft.subject_slug;
  confirmedSubjectSlug = draft.subject_slug;

  const mode = resolveDraftMode(draft);
  quizMode = mode;
  selectedLesson = draft.selectedLesson || 'all';

  questions = draft.questions || [];
  currentQuestionIndex = Number(draft.currentQuestionIndex || 0);
  selectedAnswers = Array.isArray(draft.answers) ? draft.answers : [];
  answeredState = selectedAnswers.map((answer) => answer !== null && answer !== undefined);

  questionCount = Number(draft.totalQuestions || questions.length || 0);
  durationMinutes = Number(draft.durationMinutes || 0);
  totalDurationSeconds = Number(
    draft.remainingSeconds ?? (durationMinutes ? durationMinutes * 60 : 0)
  );

  quizStartTime = Number(draft.startedAt || Date.now());

  // Tiếp tục: mở khóa tương tác
  isPaused = false;

  showSection('quiz');
  if (elements.aboutCard) elements.aboutCard.hidden = true;

  if (mode === 'practice') {
    stopTimer();
    if (elements.timerBadge) elements.timerBadge.hidden = true;
    if (elements.pauseBtn) elements.pauseBtn.hidden = true;

    const lessonText = selectedLesson === 'all' ? 'Tất cả bài/phần' : selectedLesson;
    elements.quizTitle.textContent = `Luyện tập (${lessonText})`;
  } else {
    if (elements.timerBadge) elements.timerBadge.hidden = false;
    if (elements.pauseBtn) {
      elements.pauseBtn.hidden = false;
      elements.pauseBtn.textContent = 'Tạm dừng';
    }

    elements.quizTitle.textContent = `Thi thử ${questionCount} câu / ${durationMinutes} phút`;
    updateTimerDisplay();
    startTimer();
  }

  elements.quizStatus.textContent = 'Đã tiếp tục bài làm. Chọn đáp án để xem kết quả ngay lập tức.';

  renderQuestion();
  saveDraft();
}


function loadLastWrong() {
  try {
    return JSON.parse(localStorage.getItem(LAST_WRONG_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function saveLastWrong(payload) {
  localStorage.setItem(LAST_WRONG_KEY, JSON.stringify(payload));
  updateRetryWrongButton();
}

function updateRetryWrongButton() {
  if (!elements.retryWrongBtn) return;
  const data = loadLastWrong();
  const ids = data?.ids;
  elements.retryWrongBtn.hidden = !(Array.isArray(ids) && ids.length);
}

async function startRetryWrongQuiz() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  // reset mode để không ảnh hưởng mode lưu lịch sử
  quizMode = null;


  const saved = loadLastWrong();
  const ids = saved?.ids;
  if (!Array.isArray(ids) || !ids.length) {
    setStatus('Chưa có dữ liệu câu sai để làm lại.', 'error');
    return;
  }

  isLoading = true;
  loadError = '';
  clearDraft();

  elements.quizStatus.textContent = 'Đang tải câu sai...';
  elements.quizCard.innerHTML = '<p class="muted-text">Đang tải câu sai...</p>';
  elements.nextQuestionBtn.hidden = true;
  elements.submitQuizBtn.hidden = true;
  showSection('quiz');
  elements.aboutCard.hidden = true;

  try {
    const { data, error } = await supabase.from('questions').select('*').in('id', ids);
    if (error) throw error;

    const fetched = Array.isArray(data) ? data : [];
    if (!fetched.length) {
      throw new Error('Không tìm thấy danh sách câu sai.');
    }

    const idOrder = new Map(ids.map((id, index) => [id, index]));
    const ordered = fetched.slice().sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

    questions = ordered;
    currentQuestionIndex = 0;
    selectedAnswers = new Array(questions.length).fill(null);
    answeredState = new Array(questions.length).fill(false);
    quizStartTime = Date.now();

    questionCount = questions.length;
    const prevTotal = Number(saved?.totalQuestions || questionCount);
    const prevMinutes = Number(saved?.durationMinutes || 20);
    durationMinutes = Math.max(1, Math.ceil(prevMinutes * (questionCount / Math.max(1, prevTotal))));
    totalDurationSeconds = durationMinutes * 60;

    isPaused = false;
    if (elements.pauseBtn) {
      elements.pauseBtn.hidden = false;
      elements.pauseBtn.textContent = 'Tạm dừng';
    }

    elements.quizTitle.textContent = `Làm lại ${questionCount} câu sai`;
    elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';
    startTimer();
    renderQuestion();
    saveDraft();
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Không thể tải câu sai.', 'error');
    showSection('dashboard');
  } finally {
    isLoading = false;
  }
}


function resetQuizForNewStart() {
  // Reset runtime state
  questions = [];
  currentQuestionIndex = 0;
  selectedAnswers = [];
  answeredState = [];
  quizStartTime = 0;

  questionCount = 0;
  durationMinutes = 0;
  totalDurationSeconds = 0;

  isPaused = false;
  loadError = '';

  stopTimer();
  clearDraft();

  // Reset UI state
  if (elements.nextQuestionBtn) elements.nextQuestionBtn.hidden = true;
  if (elements.submitQuizBtn) elements.submitQuizBtn.hidden = true;
  if (elements.quizStatus) elements.quizStatus.textContent = '';
  if (elements.quizCard) elements.quizCard.innerHTML = '';
}

async function startPractice() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  if (!confirmedSubjectSlug) {
      setStatus('Vui lòng chọn môn học trước khi bắt đầu luyện tập.', 'error');
      isLoading = false;
      return;
  }



  if (!confirmDiscardPausedQuizIfAny()) {
    isLoading = false;
    return;
  }


  quizMode = 'practice';
  currentMode = 'quiz';
  isLoading = true;

  resetQuizForNewStart();

  selectedLesson = elements.lessonSelect?.value || selectedLesson || 'all';

  elements.quizStatus.textContent = 'Đang tải câu hỏi...';
  elements.quizCard.innerHTML = '<p class="muted-text">Đang tải câu hỏi...</p>';

  showSection('quiz');
  if (elements.aboutCard) elements.aboutCard.hidden = true;

  // practice: không hiện timer/pause
  if (elements.timerBadge) elements.timerBadge.hidden = true;
  if (elements.pauseBtn) elements.pauseBtn.hidden = true;


  try {
    const { data, error } = await supabase.rpc('get_random_questions_by_lesson', {
      p_limit: 999,
      p_lesson: selectedLesson || 'all', // Keep existing lesson filter
      p_subject_slug: confirmedSubjectSlug, // New: Filter by selected subject
    });

    if (error) {
      console.error('[startPractice] rpc error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      loadError = error.message || 'Không lấy được câu hỏi từ Supabase.';
      setStatus(loadError, 'error');
      showSection('dashboard');
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      loadError = 'Môn học này hiện chưa có câu hỏi. Vui lòng chọn môn khác (như Chính Trị, Cơ Sở Dữ Liệu) hoặc thêm dữ liệu vào Supabase.';
      setStatus(loadError, 'error');
      showSection('dashboard');
      return;
    }

    questions = data;
    questionCount = questions.length;
    durationMinutes = 0;
    totalDurationSeconds = 0;

    currentQuestionIndex = 0;
    selectedAnswers = new Array(questions.length).fill(null);
    answeredState = new Array(questions.length).fill(false);
    quizStartTime = Date.now();

    const lessonText = selectedLesson === 'all' ? 'Tất cả bài/phần' : selectedLesson;
    elements.quizTitle.textContent = `Luyện tập (${lessonText})`;
    elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';

    renderQuestion();
    saveDraft();
  } catch (error) {
    console.error('[startPractice] unexpected error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    setStatus(error?.message || 'Có lỗi xảy ra khi bắt đầu luyện tập.', 'error');
    showSection('dashboard');
  } finally {
    isLoading = false;
  }
}

async function startExam(totalQuestions) {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  if (!confirmedSubjectSlug) {
      setStatus('Vui lòng chọn môn học trước khi bắt đầu thi thử.', 'error');
      isLoading = false;
      return;
  }


  if (!confirmDiscardPausedQuizIfAny()) {
    isLoading = false;
    return;
  }


  const minutes = totalQuestions === 70 ? 60 : 20;
  quizMode = totalQuestions === 70 ? 'exam_70' : 'exam_30';

  currentMode = 'quiz';
  isLoading = true;

  resetQuizForNewStart();

  // set timer theo mode
  questionCount = totalQuestions;
  durationMinutes = minutes;
  totalDurationSeconds = durationMinutes * 60;

  elements.quizStatus.textContent = 'Đang tải câu hỏi...';
  elements.quizCard.innerHTML = '<p class="muted-text">Đang tải câu hỏi...</p>';

  showSection('quiz');
  if (elements.aboutCard) elements.aboutCard.hidden = true;

  // exam: hiện timer/pause
  if (elements.timerBadge) elements.timerBadge.hidden = false;


  try {
    const { data, error } = await supabase.rpc('get_random_questions_by_lesson', {
      p_limit: totalQuestions,
      p_lesson: 'all', // For exams, usually all lessons
      p_subject_slug: confirmedSubjectSlug, // New: Filter by selected subject
    });

    if (error) {
      console.error('[startExam] rpc error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      loadError = error.message || 'Không lấy được câu hỏi từ Supabase.';
      elements.quizStatus.textContent = loadError;
      elements.quizCard.innerHTML = `<p class="muted-text">${loadError}</p>`;
      setStatus(loadError, 'error');
      showSection('dashboard');
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      loadError = 'Môn học này hiện chưa có câu hỏi. Vui lòng chọn môn khác (như Chính Trị, Cơ Sở Dữ Liệu) hoặc thêm dữ liệu vào Supabase.';
      elements.quizStatus.textContent = loadError;
      elements.quizCard.innerHTML = `<p class="muted-text">${loadError}</p>`;
      setStatus(loadError, 'error');
      showSection('dashboard');
      return;
    }

    questions = data;

    if (questions.length < totalQuestions) {
      elements.quizStatus.textContent = `Hiện chỉ có ${questions.length} câu trong ngân hàng câu hỏi.`;
    } else {
      elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';
    }

    currentQuestionIndex = 0;
    selectedAnswers = new Array(questions.length).fill(null);
    answeredState = new Array(questions.length).fill(false);
    quizStartTime = Date.now();

    // cập nhật lại tổng câu theo dữ liệu thực tế
    questionCount = questions.length;

    elements.quizTitle.textContent = `Thi thử ${questionCount} câu / ${minutes} phút`;


    if (elements.pauseBtn) {
      elements.pauseBtn.hidden = false;
      elements.pauseBtn.textContent = 'Tạm dừng';
    }

    updateTimerDisplay();
    startTimer();
    renderQuestion();
    saveDraft();
  } catch (error) {
    console.error('[startExam] unexpected error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    loadError = error?.message || 'Có lỗi xảy ra khi bắt đầu bài làm.';
    setStatus(loadError, 'error');
    showSection('dashboard');
  } finally {
    isLoading = false;
  }
}

// Backward compatible: keep existing callers (if any)


function setupQuizNavigationButtons() {
  const actions = document.querySelector('#quizSection .quiz-actions');
  if (!actions) return;

  let prevBtn = document.getElementById('prevQuestionBtn');
  if (!prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.id = 'prevQuestionBtn';
    prevBtn.className = 'ghost-btn';
    prevBtn.type = 'button';
    prevBtn.textContent = 'Quay lại';
    actions.prepend(prevBtn);
  }

  elements.prevQuestionBtn = prevBtn;
}

function updateNavigationButtons() {
  if (!questions.length) return;

    const atFirst = currentQuestionIndex <= 0;
  const atLast = currentQuestionIndex >= questions.length - 1;
  const isAnswered = Boolean(answeredState[currentQuestionIndex]);
  const locked = isInteractionLocked();

    if (elements.prevQuestionBtn) {
    elements.prevQuestionBtn.disabled = locked || atFirst;
    elements.prevQuestionBtn.hidden = atFirst;
  }


  if (elements.nextQuestionBtn) {
    elements.nextQuestionBtn.hidden = false;
    elements.nextQuestionBtn.textContent = atLast ? 'Nộp bài' : 'Câu tiếp theo';
    // Chỉ cho đi tiếp khi đã trả lời câu hiện tại
    elements.nextQuestionBtn.disabled = locked || !isAnswered;
  }


  // Giữ nút submit cũ nhưng ẩn đi (dùng nút "Câu tiếp theo" đổi thành "Nộp bài" ở câu cuối)
  if (elements.submitQuizBtn) {
    elements.submitQuizBtn.hidden = true;
  }
}

function goToPrevQuestion() {
  if (isInteractionLocked()) return;
  if (currentQuestionIndex <= 0) return;


  currentQuestionIndex -= 1;
  saveDraft();
  renderQuestion();
}


function startTimer() {
  if (isPaused) return;
  stopTimer();
  updateTimerDisplay();
  timerId = window.setInterval(() => {
    totalDurationSeconds -= 1;
    if (totalDurationSeconds <= 0) {
      totalDurationSeconds = 0;
      updateTimerDisplay();
      saveDraft();
      stopTimer();
      submitQuiz();
      return;
    }
    updateTimerDisplay();
    saveDraft();
  }, 1000);
}


function updateTimerDisplay() {
  const minutes = String(Math.floor(totalDurationSeconds / 60)).padStart(2, '0');
  const seconds = String(totalDurationSeconds % 60).padStart(2, '0');
  elements.timerBadge.textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function renderQuestion() {
    const question = questions[currentQuestionIndex];
  if (!question) return;

  const locked = isInteractionLocked();


  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  elements.quizCard.innerHTML = `
    <p class="question-index">Câu ${currentQuestionIndex + 1}/${questions.length}</p>
    <p class="question-text">${question.question_text || 'Câu hỏi không có nội dung.'}</p>
    <div class="option-list">
      ${options.map((option) => {
        const selected = selectedAnswers[currentQuestionIndex] === option.key;
        const correct = option.key === question.correct_answer;
                const isAnswered = answeredState[currentQuestionIndex];
        const isDisabled = isAnswered || locked;

        const classes = ['option-btn'];
        if (isAnswered) {
          if (correct) classes.push('correct');
          if (selected && !correct) classes.push('wrong');
          if (selected) classes.push('selected');
        } else if (selected) {
          classes.push('selected');
        }
        return `
          <button class="${classes.join(' ')}" data-choice="${option.key}" ${isDisabled ? 'disabled' : ''}>
            <span class="option-label">${option.key}. ${option.text}</span>
            ${isAnswered && correct ? '<strong>Đáp án đúng</strong>' : ''}
          </button>`;
      }).join('')}
    </div>
    ${answeredState[currentQuestionIndex] ? `
      <div class="feedback ${selectedAnswers[currentQuestionIndex] === question.correct_answer ? 'correct' : 'wrong'}">
        ${selectedAnswers[currentQuestionIndex] === question.correct_answer
          ? 'Chính xác! Bạn đã chọn đáp án đúng.'
          : `Sai rồi. Đáp án đúng là ${question.correct_answer}: ${question['option_' + question.correct_answer.toLowerCase()]}.`}
      </div>` : ''}
  `;

  const optionButtons = elements.quizCard.querySelectorAll('.option-btn');
  optionButtons.forEach((button) => {
    button.addEventListener('click', () => handleAnswerChoice(button.dataset.choice));
  });

    updateNavigationButtons();
}



function handleAnswerChoice(choice) {
  if (isInteractionLocked()) return;
  if (answeredState[currentQuestionIndex]) return;



  selectedAnswers[currentQuestionIndex] = choice;
  answeredState[currentQuestionIndex] = true;

  const currentQuestion = questions[currentQuestionIndex];
  elements.quizStatus.textContent = choice === currentQuestion?.correct_answer ? 'Chính xác!' : 'Sai rồi!';
  saveDraft();
  renderQuestion();
  if (currentQuestionIndex === questions.length - 1) {
    elements.submitQuizBtn.hidden = false;
  } else {
    elements.nextQuestionBtn.hidden = false;
  }
}

function goToNextQuestion() {
  if (isInteractionLocked()) return;
  if (!questions.length) return;


  const atLast = currentQuestionIndex >= questions.length - 1;
  if (atLast) {
    submitQuiz();
    return;
  }

  currentQuestionIndex += 1;
  elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';
  saveDraft();
  renderQuestion();
}


async function submitQuiz() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  if (!questions.length) return;
  if (!confirmedSubjectSlug) {
    setStatus('Không xác định được môn học của bài làm.', 'error');
    return;
  }

  isPaused = false;
  stopTimer();

  const totalQuestions = questions.length;
  const correctCount = selectedAnswers.filter(
    (answer, index) => answer === questions[index]?.correct_answer
  ).length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const durationSeconds = Math.max(
    1,
    Math.floor((Date.now() - quizStartTime) / 1000)
  );

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
      throw new Error('Bạn cần đăng nhập để nộp bài.');
    }

    const subject = availableSubjects.find(
      (item) => item.slug === confirmedSubjectSlug
    );

    const payload = {
      user_id: user.id,
      mode: quizMode || `${totalQuestions} câu / ${durationMinutes} phút`,
      total_questions: totalQuestions,
      correct_count: correctCount,
      wrong_count: wrongCount,
      score_percent: scorePercent,
      score_points: correctCount,
      duration_seconds: durationSeconds,
      subject_slug: confirmedSubjectSlug,
    };

    // Chỉ gửi subject_id khi đây là UUID thật lấy từ Supabase.
    // ID dự phòng như "chinh-tri-id" sẽ làm INSERT thất bại.
    if (isValidUuid(subject?.id)) {
      payload.subject_id = subject.id;
    }

    const { error: insertError } = await supabase
      .from('quiz_attempts')
      .insert(payload);

    if (insertError) throw insertError;

    const wrongIds = questions
      .filter(
        (question, index) =>
          selectedAnswers[index] !== question?.correct_answer
      )
      .map((question) => question.id)
      .filter((id) => id !== null && id !== undefined);

    saveLastWrong({
      ids: wrongIds,
      totalQuestions,
      durationMinutes,
      subjectSlug: confirmedSubjectSlug,
      createdAt: new Date().toISOString(),
    });

    elements.quizStatus.textContent =
      `Hoàn thành! Bạn đúng ${correctCount}/${totalQuestions} câu (${scorePercent}%).`;

    setStatus('Nộp bài thành công. Kết quả đã được lưu.', 'success');

    clearDraft();
    pausedQuizDraft = null;
    syncPausedQuizButtons();
    quizMode = null;

    // Tải tuần tự để chắc chắn bảng xếp hạng nhận dữ liệu vừa lưu.
    await loadHistory();
    await loadLeaderboard();
    setView('history');
  } catch (error) {
    console.error('[submitQuiz] Không thể lưu kết quả:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });

    setStatus(
      error?.message || 'Không thể lưu kết quả làm bài.',
      'error'
    );
  }
}

async function loadHistory() {
  if (configError) {
    elements.historyTableBody.innerHTML = '<tr><td colspan="7">Cấu hình Supabase chưa hợp lệ. Vui lòng cập nhật VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.</td></tr>';
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      elements.historyTableBody.innerHTML = '<tr><td colspan="7">Bạn cần đăng nhập để xem lịch sử.</td></tr>';
      return;
    }

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data?.length) {
      elements.historyTableBody.innerHTML = '<tr><td colspan="7">Chưa có dữ liệu lịch sử nào.</td></tr>';
      return;
    }

    elements.historyTableBody.innerHTML = data
      .map((item) => {
        const createdAt = new Date(item.created_at).toLocaleString('vi-VN');
        const duration = `${Math.floor(item.duration_seconds / 60)} phút ${item.duration_seconds % 60}s`;
        return `
          <tr>
            <td>${createdAt}</td>
            <td>${item.mode}</td>
            <td>${item.total_questions}</td>
            <td>${item.correct_count ?? item.correct_answers ?? 0}</td>
            <td>${item.wrong_count ?? item.wrong_answers ?? 0}</td>
            <td>${item.score_percent}%</td>
            <td>${duration}</td>
          </tr>`;
      })
      .join('');
  } catch (error) {
    console.error(error);
    elements.historyTableBody.innerHTML = '<tr><td colspan="7">Không thể tải lịch sử. Vui lòng kiểm tra kết nối Supabase.</td></tr>';
  }
}

function pauseQuiz() {
  if (!questions.length) return;
  if (isPaused) return;
  isPaused = true;
  stopTimer();
  if (elements.pauseBtn) elements.pauseBtn.textContent = 'Tiếp tục';
  elements.quizStatus.textContent = 'Đã tạm dừng. Nhấn "Tiếp tục" để làm tiếp.';
  saveDraft();
  renderQuestion();
}

function resumeQuiz() {
  if (!questions.length) return;
  if (!isPaused) return;
  isPaused = false;
  if (elements.pauseBtn) elements.pauseBtn.textContent = 'Tạm dừng';
  elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';
  startTimer();
  saveDraft();
  renderQuestion();
}

function togglePause() {
  if (isPaused) {
    resumeQuiz();
  } else {
    pauseQuiz();
  }
}

async function loadLeaderboard() {
  if (!elements.leaderboardTableBody) return;

  if (configError) {
    elements.leaderboardTableBody.innerHTML =
      '<tr><td colspan="4">Cấu hình Supabase chưa hợp lệ.</td></tr>';
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session?.user) {
      elements.leaderboardTableBody.innerHTML =
        '<tr><td colspan="4">Bạn cần đăng nhập để xem bảng xếp hạng.</td></tr>';
      return;
    }

    const subjectSlug =
      confirmedSubjectSlug || selectedSubjectSlug || null;

    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_limit: 50,
      p_subject_slug: subjectSlug,
    });

    if (error) {
      console.error('[loadLeaderboard] RPC error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      elements.leaderboardTableBody.innerHTML =
        `<tr><td colspan="4">Không thể tải bảng xếp hạng: ${
          error.message || 'Lỗi không xác định'
        }</td></tr>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      leaderboardData = [];
      elements.leaderboardTableBody.innerHTML =
        '<tr><td colspan="4">Chưa có dữ liệu xếp hạng.</td></tr>';
      return;
    }

    leaderboardData = data;
    elements.leaderboardTableBody.innerHTML = data
      .map((item, index) => {
        const score = Number(item.best_score);
        const scoreText = Number.isFinite(score)
          ? `${Math.round(score)} điểm`
          : '-';

        return `
          <tr>
            <td>${item.rank ?? index + 1}</td>
            <td>${item.full_name ?? 'Không tên'}</td>
            <td>${scoreText}</td>
            <td>${item.attempts ?? 0}</td>
          </tr>`;
      })
      .join('');
  } catch (error) {
    console.error('[loadLeaderboard] Unexpected error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });

    elements.leaderboardTableBody.innerHTML =
      `<tr><td colspan="4">Không thể tải bảng xếp hạng: ${
        error?.message || 'Lỗi không xác định'
      }</td></tr>`;
  }
}



function wireEvents() {
  // Xóa nút "Tài khoản" khỏi menu chính (chỉ dùng ô user ở cuối sidebar để vào trang Tài khoản)
  const accountNavBtn = document.querySelector('.sidebar-item[data-nav="account"]');
  // New: If mobile menu toggle is in header, remove it from sidebar
  if (elements.mobileMenuToggle && elements.mobileMenuToggle.parentNode === elements.sidebar) {
    elements.mobileMenuToggle.remove();
  }

  if (accountNavBtn) accountNavBtn.remove();

  // toggle button to collapse/expand sidebar
  if (elements.sidebarToggle) {
    elements.sidebarToggle.addEventListener('click', () => {
      if (!elements.sidebar) return;
      const collapsed = elements.sidebar.classList.contains('is-collapsed');
      setSidebarCollapsed(!collapsed);
    });
  }


    if (elements.sidebarItems?.length) {
    elements.sidebarItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        const nav = item.dataset.nav;
        if (!nav) return;
        navigateFromSidebar(nav);
      });
    });
  }

  // Ô tên người dùng (cuối sidebar) -> mở trang Tài khoản
  if (elements.userBadge) {
    elements.userBadge.addEventListener('click', () => navigateFromSidebar('account'));
    elements.userBadge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateFromSidebar('account');
      }
    });
    elements.userBadge.tabIndex = 0;
    elements.userBadge.setAttribute('role', 'button');
  }


  elements.modeChips.forEach((chip) => {
    chip.addEventListener('click', () => setAuthMode(chip.dataset.authMode));
  });

  elements.authForm.addEventListener('submit', handleAuthSubmit);

  if (elements.forgotPasswordBtn) {
    elements.forgotPasswordBtn.addEventListener('click', toggleForgotPassword);
  }
  if (elements.cancelResetBtn) {
    elements.cancelResetBtn.addEventListener('click', cancelForgotPassword);
  }
  if (elements.sendResetBtn) {
    elements.sendResetBtn.addEventListener('click', sendResetEmail);
  }

  const changePasswordBtn = document.getElementById('changePasswordBtn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', changePasswordFromAccount);
  }


    if (elements.lessonSelect) {
      elements.lessonSelect.addEventListener('change', () => {
        selectedLesson = elements.lessonSelect.value || 'all';
      });
    }

    if (elements.practiceStartBtn) {
        elements.practiceStartBtn.addEventListener('click', async () => {
          if (isLoading) return;
          elements.practiceStartBtn.disabled = true;
          try {
            await startPractice();
          } finally {
            elements.practiceStartBtn.disabled = false;
          }
        });
      }

    if (elements.practiceContinueBtn) {
      elements.practiceContinueBtn.addEventListener('click', continuePausedQuiz);
    }


  if (elements.editNameBtn) {
    elements.editNameBtn.addEventListener('click', openEditName);
  }
  if (elements.cancelNameBtn) {
    elements.cancelNameBtn.addEventListener('click', cancelEditName);
  }
    if (elements.saveNameBtn) {
    elements.saveNameBtn.addEventListener('click', saveNewName);
  }
  if (elements.newNameInput) {
    elements.newNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveNewName();
      }
    });
  }


  if (elements.sendFeedbackBtn) {
    elements.sendFeedbackBtn.addEventListener('click', sendFeedbackEmail);
  }

  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.refreshHistoryBtn.addEventListener('click', loadHistory);
  if (elements.refreshLeaderboardBtn) {
    elements.refreshLeaderboardBtn.addEventListener('click', loadLeaderboard);
  }
  if (elements.retryWrongBtn) {
    elements.retryWrongBtn.addEventListener('click', startRetryWrongQuiz);
  }
    if (elements.pauseBtn) {
    elements.pauseBtn.addEventListener('click', togglePause);
  }

  if (elements.prevQuestionBtn) {
    elements.prevQuestionBtn.addEventListener('click', goToPrevQuestion);
  }

    elements.nextQuestionBtn.addEventListener('click', goToNextQuestion);
  elements.submitQuizBtn.addEventListener('click', submitQuiz);

  // THI THỬ: chọn 30/70 chỉ cập nhật state, không bắt đầu làm bài
  elements.modeCards.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = String(button.dataset.mode || '30');
      selectedExamType = mode === '70' ? 'exam_70' : 'exam_30';

      elements.modeCards.forEach((btn) => {
        btn.classList.toggle('selected', btn === button);
      });
    });
  });

    // THI THỬ: nút bắt đầu
  if (elements.examStartBtn) {
    elements.examStartBtn.addEventListener('click', async () => {
      if (isLoading) return;

            if (!selectedExamType) {
        setTempButtonLabel(elements.examStartBtn, 'Vui lòng chọn đề thi thử');
        return;
      }


      const total = selectedExamType === 'exam_70' ? 70 : 30;
      elements.examStartBtn.disabled = true;
      try {
        await startExam(total);
      } finally {
        elements.examStartBtn.disabled = false;
      }
    });
  }

  if (elements.changeSubjectBtn) {
    elements.changeSubjectBtn.addEventListener('click', () => {
      // Chỉ bỏ xác nhận môn trên giao diện; không xóa bài tạm của môn cũ.
      confirmedSubjectSlug = null;
      pausedQuizDraft = null;
      syncPausedQuizButtons();
      updateHomeCardsVisibility();

      if (elements.confirmSubjectBtn) {
        elements.confirmSubjectBtn.disabled = !selectedSubjectSlug;
      }
    });
  }

  if (elements.confirmSubjectBtn) {
    elements.confirmSubjectBtn.addEventListener('click', () => {
      if (selectedSubjectSlug) {
        confirmedSubjectSlug = selectedSubjectSlug;
        selectedLesson = 'all';

        updateHomeCardsVisibility();
        loadLessons();

        // Chỉ tìm bài tạm đúng tài khoản và đúng môn vừa xác nhận.
        syncPausedQuizButtons();

        const subject = availableSubjects.find(
          (item) => item.slug === confirmedSubjectSlug
        );
        if (subject) setStatus(`Đã chọn môn: ${subject.name}`, 'info');
      }
    });
  }

  if (elements.examContinueBtn) {
    elements.examContinueBtn.addEventListener('click', continuePausedQuiz);
  }



}


function handleAutoSaveAndPause() {
  if (!questions.length) return;
  isPaused = true;
  stopTimer();
  saveDraft();
}

window.addEventListener('pagehide', handleAutoSaveAndPause);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    handleAutoSaveAndPause();
  }
});


function isPasswordRecoveryUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, '')
  );

  return (
    searchParams.get('recovery') === '1' ||
    hashParams.get('type') === 'recovery'
  );
}

function openPasswordRecovery(session) {
  if (!session?.user) return;

  updateUserUI(session);

  // Không cho app chuyển thẳng vào trang chủ
  setView('auth');

  window.setTimeout(() => {
    showPasswordRecoveryModal();
  }, 0);
}

(async function init() {
  // Dòng phiên bản: căn giữa theo toàn bộ trang (không theo cột phải)
  ensureVersionFooterPlacement();

  if (configError) {
    setStatus(configError, 'error');
  }

  // Luôn xác định trạng thái thanh bên theo kích thước cửa sổ hiện tại khi tải, không phải giá trị đã lưu.
  // Điều này ngăn trạng thái "thu gọn" từ phiên di động làm hỏng bố cục trên máy tính để bàn.
  // Người dùng vẫn có thể chuyển đổi thanh bên theo cách thủ công trong phiên.
  setSidebarCollapsed(window.matchMedia('(max-width: 768px)').matches);

    // mặc định: Trang chủ bị ẩn, chỉ hiện sau khi bấm menu hoặc sau khi đăng nhập
  setView('auth');

    // Tách layout Luyện tập / Thi thử (chỉ DOM client-side, không đổi HTML gốc)
  setupHomeViewLayout();

    // Mobile menu on small screens
    ensureMobileMenuUI();

    ensureForgotPasswordUI();
    ensureAccountPasswordUI();



  // Thêm nút điều hướng câu hỏi trong màn hình làm bài
  setupQuizNavigationButtons();
 
  wireEvents();


  setAuthMode('login');
updateHomeCaret();

if (!configError) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Auth event]', event);

    const isRecoveryFlow =
      event === 'PASSWORD_RECOVERY' ||
      (isPasswordRecoveryUrl() && Boolean(session?.user));

    if (isRecoveryFlow) {
      openPasswordRecovery(session);
      return;
    }

    // Phiên ban đầu đã được checkSession xử lý
    if (event === 'INITIAL_SESSION') {
      return;
    }

    updateUserUI(session);

    if (session?.user) {
      ensureProfileForSession(session);
      updateRetryWrongButton();

      Promise.all([
        loadHistory(),
        loadLeaderboard(),
        loadLessons(),
      ]);

      setView('home');
    } else {
      clearQuizState();
      setView('auth');
    }
  });
}

await checkSession();

/*
 * Dự phòng trường hợp PASSWORD_RECOVERY xuất hiện
 * trước khi listener được đăng ký.
 */
if (!configError && isPasswordRecoveryUrl()) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  openPasswordRecovery(session);
}

  // Xóa khóa lưu kiểu cũ dùng chung cho mọi môn.
  // Từ phiên bản này, mỗi tài khoản + môn có một khóa riêng.
  localStorage.removeItem(LEGACY_QUIZ_DRAFT_KEY);

    // Nếu có bài làm đang lưu, chỉ hiển thị nút "Tiếp tục" ở màn hình Home.
  // Không tự động nhảy vào màn hình làm bài.
  pausedQuizDraft = getPausedQuizDraft(confirmedSubjectSlug, currentUserId);
  syncPausedQuizButtons();


  if (configError) {
    return;
  }

    


})();

// Service Worker chỉ chạy khi đưa web lên hosting.
// Khi chạy Live Server thì tự gỡ bản cũ để không báo lỗi.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const isLocalhost =
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === 'localhost';

    if (isLocalhost) {
      try {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        await Promise.all(
          registrations.map((registration) =>
            registration.unregister()
          )
        );

        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames.map((cacheName) =>
            caches.delete(cacheName)
          )
        );

        console.log('Service Worker đã được tắt trên Live Server.');
      } catch (error) {
        console.warn('Không thể dọn Service Worker cũ:', error);
      }

      return;
    }

    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker đã đăng ký thành công.');
    } catch (error) {
      console.error('Không thể đăng ký Service Worker:', error);
    }
  });
}
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL as DEFAULT_SUPABASE_URL, SUPABASE_ANON_KEY as DEFAULT_SUPABASE_ANON_KEY } from './config.js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const SUPABASE_URL = (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY || '').trim();

const configError = !SUPABASE_URL || !SUPABASE_ANON_KEY
  ? 'Thiếu biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. Vui lòng cập nhật file config.js hoặc biến môi trường trước khi đăng nhập.'
  : SUPABASE_ANON_KEY.includes('service_role')
    ? 'Khóa Supabase đang dùng là service_role key. Vui lòng dùng VITE_SUPABASE_ANON_KEY (khóa công khai) cho ứng dụng này.'
    : '';

const supabase = configError ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const QUIZ_DRAFT_KEY = 'politics_quiz_draft';
const LAST_WRONG_KEY = 'politics_last_wrong';
const SIDEBAR_COLLAPSED_KEY = 'politics_sidebar_collapsed';




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
};




let authMode = 'login';
let currentMode = null;
let currentView = 'auth';

// Lesson filter state
let selectedLesson = 'all';
let questionLessons = [];
let lessonsLoading = false;
let lessonsError = '';




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





function ensureRainbowCloudsBackground() {
  if (document.querySelector('.rainbow-clouds')) return;
  const layer = document.createElement('div');
  layer.className = 'rainbow-clouds';
  // đặt ngoài cùng, không nằm trong card/sidebar
  document.body.prepend(layer);
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

  if (document.getElementById('changePasswordForm')) {
    elements.accountMessage = document.getElementById('accountMessage');
    return;
  }

  const msg = document.createElement('p');
  msg.id = 'accountMessage';
  msg.className = 'status-text';
  msg.setAttribute('aria-live', 'polite');
  msg.textContent = '';

  const form = document.createElement('div');
  form.id = 'changePasswordForm';
  form.className = 'auth-form';
  form.innerHTML = `
    <label for="newPasswordAccount">Mật khẩu mới</label>
    <input id="newPasswordAccount" type="password" placeholder="••••••••" />

    <label for="confirmPasswordAccount">Nhập lại mật khẩu mới</label>
    <input id="confirmPasswordAccount" type="password" placeholder="••••••••" />

    <button id="changePasswordBtn" class="primary-btn" type="button">Đổi mật khẩu</button>
  `;

  const tailNote = accountView.querySelector('p.muted-text');
  if (tailNote?.parentNode) {
    tailNote.parentNode.insertBefore(msg, tailNote);
    tailNote.parentNode.insertBefore(form, tailNote);
  } else {
    accountView.appendChild(msg);
    accountView.appendChild(form);
  }

  elements.accountMessage = msg;
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;

    setStatus('Đã gửi email đặt lại mật khẩu. Có thể kiểm tra email đặt lại mật khẩu trong mục thư rác của bạn nếu không thấy.', 'success');
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
      <input id="recoveryNewPassword" type="password" placeholder="••••••••" />

      <label for="recoveryConfirmPassword">Nhập lại mật khẩu mới</label>
      <input id="recoveryConfirmPassword" type="password" placeholder="••••••••" />

      <div class="inline-actions">
        <button id="recoverySaveBtn" class="primary-btn" type="button">Lưu mật khẩu</button>
        <button id="recoveryCancelBtn" class="ghost-btn" type="button">Để sau</button>
      </div>
    </div>
  `;

  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const close = () => {
    backdrop.remove();
  };

  card.querySelector('#recoveryCancelBtn')?.addEventListener('click', close);

  card.querySelector('#recoverySaveBtn')?.addEventListener('click', async () => {
    if (configError) {
      setStatus(configError, 'error');
      return;
    }

    const p1 = (card.querySelector('#recoveryNewPassword')?.value || '').trim();
    const p2 = (card.querySelector('#recoveryConfirmPassword')?.value || '').trim();

    if (p1.length < 6) {
      setStatus('Mật khẩu tối thiểu 6 ký tự.', 'error');
      return;
    }
    if (p1 !== p2) {
      setStatus('Mật khẩu nhập lại không khớp.', 'error');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: p1 });
      if (error) throw error;

      close();
      setStatus('Đã đổi mật khẩu.', 'success');
      setView('auth');
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Không thể đổi mật khẩu.', 'error');
    }
  });
}

async function changePasswordFromAccount() {
  if (configError) {
    setAccountStatus(configError, 'error');
    return;
  }

  const p1 = (document.getElementById('newPasswordAccount')?.value || '').trim();
  const p2 = (document.getElementById('confirmPasswordAccount')?.value || '').trim();

  if (p1.length < 6) {
    setAccountStatus('Mật khẩu tối thiểu 6 ký tự.', 'error');
    return;
  }
  if (p1 !== p2) {
    setAccountStatus('Mật khẩu nhập lại không khớp.', 'error');
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: p1 });
    if (error) throw error;

    setAccountStatus('Đã đổi mật khẩu.', 'success');
    const a = document.getElementById('newPasswordAccount');
    const b = document.getElementById('confirmPasswordAccount');
    if (a) a.value = '';
    if (b) b.value = '';
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
    elements.sidebar.hidden = resolved === 'auth';
  }

  if (elements.pauseBtn) {
    elements.pauseBtn.hidden = resolved !== 'quiz';
  }

  if (elements.timerBadge) {
    elements.timerBadge.hidden = resolved !== 'quiz';
  }
}

function setDashboardContainerMode(mode) {
  if (!elements.dashboardSection) return;

  const isHome = mode === 'home';

  if (isHome) {
    // Home cần tách thành 2 card riêng -> bỏ panel ở container cha
    elements.dashboardSection.classList.remove('panel');
    elements.dashboardSection.style.background = 'transparent';
    elements.dashboardSection.style.border = 'none';
    elements.dashboardSection.style.boxShadow = 'none';
    elements.dashboardSection.style.padding = '0';
  } else {
    // Các view khác (Tài khoản/Lịch sử/BXH) vẫn dùng panel như cũ
    elements.dashboardSection.classList.add('panel');
    elements.dashboardSection.style.background = '';
    elements.dashboardSection.style.border = '';
    elements.dashboardSection.style.boxShadow = '';
    elements.dashboardSection.style.padding = '';
  }
}


function setView(viewKey) {
  currentView = viewKey;

  const isAuthed = !elements.userBadge.hidden;
  const requiresAuth = ['home', 'account', 'history', 'leaderboard'].includes(viewKey);

  // reset: hide everything first
  if (elements.homeView) elements.homeView.hidden = true;
  if (elements.accountView) elements.accountView.hidden = true;
  if (elements.historyCard) elements.historyCard.hidden = true;
  if (elements.leaderboardCard) elements.leaderboardCard.hidden = true;
  if (elements.aboutCard) elements.aboutCard.hidden = true;
  if (elements.appInfoCard) elements.appInfoCard.hidden = true;
  if (elements.feedbackSection) elements.feedbackSection.hidden = true;

  if (elements.editNameForm) elements.editNameForm.hidden = true;

  if (requiresAuth && !isAuthed) {
    showSection('auth');
    return;
  }

    switch (viewKey) {
    case 'home':
      setDashboardContainerMode('home');
      showSection('dashboard');
      if (elements.homeView) elements.homeView.hidden = false;
      // Khi vào màn hình chọn chế độ luyện tập, tải danh sách Bài/Phần
            loadLessons();
      syncPausedQuizButtons();
      break;


    case 'account':
      setDashboardContainerMode('default');
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
  document.body.classList.toggle('sidebar-collapsed', Boolean(collapsed));
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  // cập nhật biểu tượng mũi tên
  updateHomeCaret();
}

function updateHomeCaret() {
  const caret = document.querySelector('#sidebarToggle .sidebar-caret');
  if (!caret) return;
  const collapsed = document.body.classList.contains('sidebar-collapsed');
  // collapsed -> show '›' (points right), expanded -> '‹' (points left)
  caret.textContent = collapsed ? '›' : '‹';
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
  if (user) {
    elements.userBadge.hidden = false;
    elements.userEmail.textContent = 'Đang tải...';
    elements.logoutBtn.hidden = false;
  } else {
    elements.userBadge.hidden = true;
    elements.logoutBtn.hidden = true;
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
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    const existingName = (existing?.full_name || '').trim();
    const displayName = existingName || user.email || 'Người dùng';

    elements.userEmail.textContent = displayName;
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

    const { data, error } = await supabase.rpc('get_question_lessons');
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

function setupHomeViewLayout() {
  if (!elements.homeView) return;

  // Tách LUYỆN TẬP và THI THỬ thành 2 card riêng, có khoảng cách rõ ràng
  elements.homeView.style.display = 'grid';
  elements.homeView.style.gap = '18px';
  elements.homeView.style.alignItems = 'start';

  const existingLessonSelect = document.getElementById('lessonSelect');
  const lessonSelect = existingLessonSelect || document.createElement('select');
  lessonSelect.id = 'lessonSelect';

    const practiceCard = document.createElement('div');
  // panel để mỗi phần là 1 "khung" riêng
  practiceCard.className = 'panel hero-card';
  practiceCard.innerHTML = `
    <p class="eyebrow">LUYỆN TẬP</p>
    <h2>Luyện tập theo bài/phần</h2>
    <p class="muted-text">Chọn bài hoặc phần muốn ôn tập. Hệ thống sẽ lấy câu hỏi ngẫu nhiên theo nội dung đã chọn.</p>
  `;


    const lessonFilter = document.createElement('div');
    lessonFilter.className = 'lesson-filter';

    const lessonLabel = document.createElement('label');
    lessonLabel.htmlFor = 'lessonSelect';
    lessonLabel.textContent = 'Bài / Phần';

    lessonFilter.appendChild(lessonLabel);
    lessonFilter.appendChild(lessonSelect);
    practiceCard.appendChild(lessonFilter);

        const practiceStartBtn = document.createElement('button');
        practiceStartBtn.id = 'practiceStartBtn';
        practiceStartBtn.className = 'primary-btn';
        practiceStartBtn.type = 'button';
        practiceStartBtn.textContent = 'Bắt đầu luyện tập';
        practiceStartBtn.dataset.originalLabel = practiceStartBtn.textContent;


        const practiceContinueBtn = document.createElement('button');
        practiceContinueBtn.id = 'practiceContinueBtn';
        practiceContinueBtn.className = 'ghost-btn';
        practiceContinueBtn.type = 'button';
        practiceContinueBtn.textContent = 'Tiếp tục';
        practiceContinueBtn.hidden = true;

        const practiceActionRow = document.createElement('div');
        practiceActionRow.className = 'action-button-row';
        practiceActionRow.appendChild(practiceStartBtn);
        practiceActionRow.appendChild(practiceContinueBtn);
        practiceCard.appendChild(practiceActionRow);



        const examCard = document.createElement('div');
    examCard.id = 'examCardHome';
    // panel để mỗi phần là 1 "khung" riêng
    examCard.className = 'panel hero-card';
    examCard.innerHTML = `
      <p class="eyebrow">THI THỬ</p>
      <h2>Chọn đề thi thử</h2>
      <p class="muted-text">Làm bài theo thời gian giới hạn để kiểm tra mức độ sẵn sàng.</p>
      <div class="mode-grid">
        <button class="mode-card" data-mode="30" data-time="20" type="button">
          <strong>30 câu</strong>
          <span>20 phút</span>
        </button>
        <button class="mode-card" data-mode="70" data-time="60" type="button">
          <strong>70 câu</strong>
          <span>60 phút</span>
        </button>
      </div>
    `;

        const examStartWrap = document.createElement('div');
    examStartWrap.className = 'action-button-row';

        const examStartBtn = document.createElement('button');
    examStartBtn.id = 'examStartBtn';
    examStartBtn.className = 'primary-btn';
    examStartBtn.type = 'button';
    examStartBtn.textContent = 'Bắt đầu thi thử';
    examStartBtn.dataset.originalLabel = examStartBtn.textContent;


    const examContinueBtn = document.createElement('button');
    examContinueBtn.id = 'examContinueBtn';
    examContinueBtn.className = 'ghost-btn';
    examContinueBtn.type = 'button';
    examContinueBtn.textContent = 'Tiếp tục';
    examContinueBtn.hidden = true;

    examStartWrap.appendChild(examStartBtn);
    examStartWrap.appendChild(examContinueBtn);
    examCard.appendChild(examStartWrap);




    elements.homeView.innerHTML = '';
    elements.homeView.appendChild(practiceCard);
    elements.homeView.appendChild(examCard);

    // refresh references after rebuilding DOM
        elements.lessonSelect = lessonSelect;
        elements.modeCards = examCard.querySelectorAll('.mode-card');
        elements.examStartBtn = examStartBtn;
        elements.practiceStartBtn = practiceStartBtn;
        elements.practiceContinueBtn = practiceContinueBtn;
        elements.examContinueBtn = examContinueBtn;

        // cập nhật trạng thái hiển thị nút "Tiếp tục" theo draft hiện tại
        syncPausedQuizButtons();
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

    const payload = { id: user.id, full_name: fullName, updated_at: new Date().toISOString() };
    console.log('[saveNewName] payload:', payload);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[saveNewName] upsert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setStatus('Không thể lưu họ tên: ' + (error.message || 'Lỗi không xác định'), 'error');
      return;
    }

    console.log('[saveNewName] upsert success:', data);

    const newName = (data?.full_name || '').trim();
    // Cập nhật UI ngay, không cần reload
    if (elements.accountName) elements.accountName.textContent = newName || user.email || '';
    elements.userEmail.textContent = newName || user.email || '';

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
    setStatus('Vui lòng nhập nội dung góp ý.', 'error');
    elements.feedbackInput?.focus();
    return;
  }


  const subject = 'Góp ý về ứng dụng Chính Trị Cao Đẵng';
  const userLine = !elements.userBadge.hidden
    ? `Tài khoản: ${elements.userEmail.textContent || ''}`
    : 'Tài khoản: (chưa đăng nhập)';

  const body = `${userLine}\n\nNội dung góp ý:\n${content}`;

  const mailto = `mailto:tp058235@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}



async function checkSession() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
        updateUserUI(session);
        if (session?.user) {
      await ensureProfileForSession(session);
      updateRetryWrongButton();
      await Promise.all([loadHistory(), loadLeaderboard(), loadLessons()]);
      setView('home');
    } else {
      setView('auth');
    }


  } catch (error) {
    console.error(error);
    setStatus('Không thể kiểm tra phiên đăng nhập. Vui lòng thử lại.', 'error');
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
    setStatus(error.message || 'Đăng nhập hoặc đăng ký thất bại.', 'error');
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
  localStorage.removeItem(QUIZ_DRAFT_KEY);
}



function saveDraft() {
    const draft = {
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
      quizStarted: Boolean(questions.length),
    };
  localStorage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(draft));
}


function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_DRAFT_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(QUIZ_DRAFT_KEY);
}

function getPausedQuizDraft() {
  const draft = loadDraft();
  if (!draft?.quizStarted) return null;
  if (!Array.isArray(draft.questions) || !draft.questions.length) return null;
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
  pausedQuizDraft = getPausedQuizDraft();
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
  const existing = getPausedQuizDraft();
  if (!existing) return true;

    // Không hiện hộp thoại trình duyệt: tự xóa bài cũ khi bắt đầu bài mới
  clearDraft();
  pausedQuizDraft = null;
  syncPausedQuizButtons();
  setStatus('Đã xóa bài làm cũ để bắt đầu bài mới.', 'info');
  return true;

}

function continuePausedQuiz() {
    const draft = getPausedQuizDraft();
  if (!draft) {
    syncPausedQuizButtons();
    setStatus('Không có bài làm tạm dừng để tiếp tục.', 'info');
    return;
  }


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
      p_lesson: selectedLesson || 'all',
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
      loadError = 'Chưa có câu hỏi cho bài/phần này.';
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
      p_lesson: 'all',
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
      loadError = 'Chưa có câu hỏi cho bài/phần này.';
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
async function startQuiz(totalQuestions, _minutes) {
  return startExam(totalQuestions);
}

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


  isPaused = false;
  stopTimer();


  const correctCount = selectedAnswers.filter((answer, index) => answer === questions[index]?.correct_answer).length;
  const wrongCount = questions.length - correctCount;
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const durationSeconds = Math.max(1, Math.floor((Date.now() - quizStartTime) / 1000));

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user) throw new Error('Bạn cần đăng nhập để nộp bài.');

                const payload = {
      user_id: user.id,
      mode: quizMode || `${questionCount} câu / ${durationMinutes} phút`,
      total_questions: questionCount,
      correct_count: correctCount,
      wrong_count: wrongCount,
      score_percent: scorePercent,
      duration_seconds: durationSeconds,
    };

    const { error } = await supabase.from('quiz_attempts').insert(payload);

    if (error) throw error;

    const wrongIds = questions
      .filter((q, index) => selectedAnswers[index] !== q?.correct_answer)

      .map((q) => q.id)
      .filter((id) => id !== null && id !== undefined);

    saveLastWrong({
      ids: wrongIds,
      totalQuestions: questionCount,
      durationMinutes,
      createdAt: new Date().toISOString(),
    });

    elements.quizStatus.textContent = `Hoàn thành! Bạn đúng ${correctCount}/${questions.length} câu (${scorePercent}%).`;
        setStatus('Nộp bài thành công. Kết quả đã được lưu.', 'success');
        clearDraft();
        pausedQuizDraft = null;
        syncPausedQuizButtons();
        quizMode = null;
              await Promise.all([loadHistory(), loadLeaderboard()]);
          setView('history');



  } catch (error) {

    console.error(error);
    setStatus(error.message || 'Không thể lưu kết quả làm bài.', 'error');
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
    elements.leaderboardTableBody.innerHTML = '<tr><td colspan="4">Cấu hình Supabase chưa hợp lệ.</td></tr>';
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      elements.leaderboardTableBody.innerHTML = '<tr><td colspan="4">Bạn cần đăng nhập để xem bảng xếp hạng.</td></tr>';
      return;
    }

    const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: 10 });
    if (error) {
      console.error('[loadLeaderboard] rpc error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      elements.leaderboardTableBody.innerHTML = `<tr><td colspan="4">Không thể tải bảng xếp hạng: ${error.message || 'Lỗi không xác định'}</td></tr>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      leaderboardData = [];
      elements.leaderboardTableBody.innerHTML = '<tr><td colspan="4">Chưa có dữ liệu xếp hạng.</td></tr>';
      return;
    }

    leaderboardData = data;
    elements.leaderboardTableBody.innerHTML = data
      .map((item) => {
        const score = Number(item.best_score);
        const scoreText = Number.isFinite(score) ? score.toFixed(1) + '%' : '-';
        return `
          <tr>
            <td>${item.rank}</td>
            <td>${item.name ?? 'Không tên'}</td>
            <td>${scoreText}</td>
            <td>${item.attempt_count}</td>
          </tr>`;
      })
      .join('');
  } catch (error) {
    console.error('[loadLeaderboard] unexpected error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    elements.leaderboardTableBody.innerHTML = `<tr><td colspan="4">Không thể tải bảng xếp hạng: ${error?.message || 'Lỗi không xác định'}</td></tr>`;
  }
}



function wireEvents() {
  // Xóa nút "Tài khoản" khỏi menu chính (chỉ dùng ô user ở cuối sidebar để vào trang Tài khoản)
  const accountNavBtn = document.querySelector('.sidebar-item[data-nav="account"]');
  if (accountNavBtn) accountNavBtn.remove();

  // toggle button to collapse/expand sidebar
  if (elements.sidebarToggle) {
    elements.sidebarToggle.addEventListener('click', () => {
      const collapsed = document.body.classList.contains('sidebar-collapsed');
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


(async function init() {
    // Nền mây 7 màu (layer riêng)
  ensureRainbowCloudsBackground();

  // Dòng phiên bản: căn giữa theo toàn bộ trang (không theo cột phải)
  ensureVersionFooterPlacement();


  if (configError) {
    setStatus(configError, 'error');
  }


    const storedSidebar = getSidebarCollapsed();
  if (storedSidebar === null) {
    setSidebarCollapsed(window.matchMedia('(max-width: 768px)').matches);
  } else {
    setSidebarCollapsed(storedSidebar);
  }

    // mặc định: Trang chủ bị ẩn, chỉ hiện sau khi bấm menu hoặc sau khi đăng nhập
  setView('auth');

    // Tách layout Luyện tập / Thi thử (chỉ DOM client-side, không đổi HTML gốc)
    setupHomeViewLayout();

    ensureForgotPasswordUI();
    ensureAccountPasswordUI();


  // Thêm nút điều hướng câu hỏi trong màn hình làm bài
  setupQuizNavigationButtons();

  wireEvents();


  setAuthMode('login');
  updateHomeCaret();
  await checkSession();




    // Nếu có bài làm đang lưu, chỉ hiển thị nút "Tiếp tục" ở màn hình Home.
  // Không tự động nhảy vào màn hình làm bài.
  pausedQuizDraft = getPausedQuizDraft();
  syncPausedQuizButtons();


  if (configError) {
    return;
  }

    
      let isInitialAuthState = true;
    supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      updateUserUI(session);
      showPasswordRecoveryModal();
      return;
    }

    if (isInitialAuthState) {
      isInitialAuthState = false;
      return;
    }


    updateUserUI(session);

    if (session?.user) {
            ensureProfileForSession(session);
      updateRetryWrongButton();
      Promise.all([loadHistory(), loadLeaderboard(), loadLessons()]);
      setView('home');

    } else {
      clearQuizState();
      setView('auth');
    }
  });

})();



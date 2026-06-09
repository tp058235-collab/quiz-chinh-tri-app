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

const elements = {
  authSection: document.getElementById('authSection'),
  dashboardSection: document.getElementById('dashboardSection'),
  quizSection: document.getElementById('quizSection'),
  authForm: document.getElementById('authForm'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  confirmPasswordInput: document.getElementById('confirmPasswordInput'),
  confirmPasswordLabel: document.getElementById('confirmPasswordLabel'),
  authMessage: document.getElementById('authMessage'),
  userBadge: document.getElementById('userBadge'),
  userEmail: document.getElementById('userEmail'),
  logoutBtn: document.getElementById('logoutBtn'),
  modeChips: document.querySelectorAll('.mode-chip'),
  modeCards: document.querySelectorAll('.mode-card'),
  historyTableBody: document.getElementById('historyTableBody'),
  refreshHistoryBtn: document.getElementById('refreshHistoryBtn'),
  quizTitle: document.getElementById('quizTitle'),
  timerBadge: document.getElementById('timerBadge'),
  quizStatus: document.getElementById('quizStatus'),
  quizCard: document.getElementById('quizCard'),
  nextQuestionBtn: document.getElementById('nextQuestionBtn'),
  submitQuizBtn: document.getElementById('submitQuizBtn'),
  aboutCard: document.getElementById('aboutCard'),
};

let authMode = 'login';
let currentMode = null;
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

function setStatus(message, variant = 'info') {
  elements.authMessage.textContent = message || '';
  elements.authMessage.className = `status-text ${variant}`;
}

function showSection(sectionName) {
  elements.authSection.hidden = sectionName !== 'auth';
  elements.dashboardSection.hidden = sectionName !== 'dashboard';
  elements.quizSection.hidden = sectionName !== 'quiz';
  elements.aboutCard.hidden = sectionName === 'quiz';
}

function setAuthMode(mode) {
  authMode = mode;
  elements.modeChips.forEach((chip) => chip.classList.toggle('active', chip.dataset.authMode === mode));
  elements.authSubmitBtn.textContent = mode === 'register' ? 'Đăng ký' : 'Đăng nhập';
  const showConfirm = mode === 'register';
  elements.confirmPasswordInput.hidden = !showConfirm;
  elements.confirmPasswordLabel.hidden = !showConfirm;
  if (!showConfirm) {
    elements.confirmPasswordInput.value = '';
  }
}

function updateUserUI(session) {
  const user = session?.user;
  if (user) {
    elements.userBadge.hidden = false;
    elements.userEmail.textContent = user.email || 'Người dùng';
    elements.logoutBtn.hidden = false;
    showSection('dashboard');
  } else {
    elements.userBadge.hidden = true;
    elements.logoutBtn.hidden = true;
    showSection('auth');
  }
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
      await loadHistory();
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
      const confirmPassword = elements.confirmPasswordInput.value.trim();
      if (!password || !confirmPassword) {
        setStatus('Vui lòng nhập đầy đủ mật khẩu và xác nhận mật khẩu.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        setStatus('Mật khẩu nhập lại không khớp.', 'error');
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setStatus('Đăng ký thành công. Vui lòng kiểm tra email xác nhận nếu cần.', 'success');
      if (data?.session) {
        updateUserUI(data.session);
        await loadHistory();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      updateUserUI(data.session);
      await loadHistory();
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
    setStatus('Đã đăng xuất.', 'success');
    clearQuizState();
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
  questionCount = 0;
  durationMinutes = 0;
  totalDurationSeconds = 0;
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

async function startQuiz(totalQuestions, minutes) {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  currentMode = 'quiz';
  questionCount = totalQuestions;
  durationMinutes = minutes;
  isLoading = true;
  loadError = '';
  clearDraft();

  elements.quizStatus.textContent = 'Đang tải câu hỏi...';
  elements.quizCard.innerHTML = '<p class="muted-text">Đang tải câu hỏi...</p>';
  elements.nextQuestionBtn.hidden = true;
  elements.submitQuizBtn.hidden = true;
  showSection('quiz');
  elements.aboutCard.hidden = true;

  try {
    const { data, error } = await supabase.rpc('get_random_questions', { p_limit: totalQuestions });
    if (error) {
      console.error('Supabase RPC error:', error);
      loadError = 'Không lấy được câu hỏi từ Supabase.';
      elements.quizStatus.textContent = loadError;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      loadError = 'Chưa có câu hỏi đủ để bắt đầu bộ đề này.';
      elements.quizStatus.textContent = loadError;
      return;
    }

    questions = data;
    currentQuestionIndex = 0;
    selectedAnswers = new Array(questions.length).fill(null);
    answeredState = new Array(questions.length).fill(false);
    quizStartTime = Date.now();
    totalDurationSeconds = durationMinutes * 60;

    elements.quizTitle.textContent = `Bộ đề ${totalQuestions} câu / ${minutes} phút`;
    elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';
    startTimer();
    renderQuestion();
    saveDraft();
  } catch (error) {
    console.error('Supabase RPC error:', error);
    loadError = error.message || 'Có lỗi xảy ra khi bắt đầu bài làm.';
    elements.quizStatus.textContent = loadError;
    showSection('dashboard');
    setStatus(loadError, 'error');
  } finally {
    isLoading = false;
  }
}

function startTimer() {
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
        const classes = ['option-btn'];
        if (isAnswered) {
          if (correct) classes.push('correct');
          if (selected && !correct) classes.push('wrong');
          if (selected) classes.push('selected');
        } else if (selected) {
          classes.push('selected');
        }
        return `
          <button class="${classes.join(' ')}" data-choice="${option.key}" ${isAnswered ? 'disabled' : ''}>
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

  elements.nextQuestionBtn.hidden = !answeredState[currentQuestionIndex];
  elements.submitQuizBtn.hidden = !(answeredState[currentQuestionIndex] && currentQuestionIndex === questions.length - 1);
}

function handleAnswerChoice(choice) {
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
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
    elements.quizStatus.textContent = 'Chọn đáp án để xem kết quả ngay lập tức.';
    saveDraft();
    renderQuestion();
  }
}

async function submitQuiz() {
  if (configError) {
    setStatus(configError, 'error');
    return;
  }

  if (!questions.length) return;
  const confirmed = window.confirm('Bạn có chắc chắn muốn nộp bài không?');
  if (!confirmed) return;

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
      mode: `${questionCount} câu / ${durationMinutes} phút`,
      total_questions: questionCount,
      correct_count: correctCount,
      wrong_count: wrongCount,
      score_percent: scorePercent,
      duration_seconds: durationSeconds,
    };

    const { error } = await supabase.from('quiz_attempts').insert(payload);
    if (error) throw error;

    elements.quizStatus.textContent = `Hoàn thành! Bạn đúng ${correctCount}/${questions.length} câu (${scorePercent}%).`;
    setStatus('Nộp bài thành công. Kết quả đã được lưu.', 'success');
    clearDraft();
    await loadHistory();
    showSection('dashboard');
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

function wireEvents() {
  elements.modeChips.forEach((chip) => {
    chip.addEventListener('click', () => setAuthMode(chip.dataset.authMode));
  });

  elements.authForm.addEventListener('submit', handleAuthSubmit);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.refreshHistoryBtn.addEventListener('click', loadHistory);
  elements.nextQuestionBtn.addEventListener('click', goToNextQuestion);
  elements.submitQuizBtn.addEventListener('click', submitQuiz);

  elements.modeCards.forEach((button) => {
    button.addEventListener('click', async () => {
      if (isLoading) return;
      const totalQuestions = Number(button.dataset.mode || 30);
      const minutes = Number(button.dataset.time || 20);
      button.disabled = true;
      try {
        await startQuiz(totalQuestions, minutes);
      } finally {
        button.disabled = false;
      }
    });
  });
}

window.addEventListener('beforeunload', stopTimer);

(async function init() {
  if (configError) {
    setStatus(configError, 'error');
  }

  wireEvents();
  setAuthMode('login');
  await checkSession();

  const savedDraft = loadDraft();
  if (savedDraft?.quizStarted) {
    questions = savedDraft.questions || [];
    currentQuestionIndex = savedDraft.currentQuestionIndex || 0;
    selectedAnswers = savedDraft.answers || [];
    answeredState = (savedDraft.answers || []).map((answer) => answer !== null && answer !== undefined);
    questionCount = savedDraft.totalQuestions || questions.length;
    durationMinutes = savedDraft.durationMinutes || 20;
    totalDurationSeconds = savedDraft.remainingSeconds || durationMinutes * 60;
    quizStartTime = savedDraft.startedAt || Date.now();
    showSection('quiz');
    elements.aboutCard.hidden = true;
    elements.quizTitle.textContent = `Bộ đề ${questionCount} câu / ${durationMinutes} phút`;
    elements.quizStatus.textContent = 'Tiếp tục bài làm của bạn.';
    startTimer();
    renderQuestion();
  }
  if (configError) {
    return;
  }

  let isInitialAuthState = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    if (isInitialAuthState) {
      isInitialAuthState = false;
      return;
    }
    updateUserUI(session);
    if (session?.user) {
      loadHistory();
    } else {
      clearQuizState();
    }
  });
})();

/**
 * app.js — MedAssist Clinical AI Workspace Controller
 * 
 * Orchestrates:
 * - ChatGPT-style Multi-Session History & Persistence
 * - Minimal Medical AI Workspace & Dynamic Conversation Stream
 * - Real Light & Dark Theme Management (with System preference support)
 * - Subtle Natural Processing Indicator
 * - Web Speech API Voice Recognition & Audio Briefing Synthesizer
 * - Synthetic Tactile Acoustic Haptic Feedback
 * - Compact Settings Modal & Session Management
 */

import { executePipelineAsync } from './pipeline.js';
import { renderUserMessage, renderAssistantMessage } from './renderer.js';
import { GEMINI_CONFIG } from './config.js';

/* ─────────────────────────────────────────────────────────────────────────
 * STATE MANAGEMENT
 * ───────────────────────────────────────────────────────────────────────── */
let sessions = [];
let activeSessionId = null;
let isProcessing = false;
let currentTheme = 'light';
let isAudioHapticsEnabled = true;
let isVoiceListening = false;
let speechRecognitionInstance = null;
let activeSpeakingMsgId = null;

/* ─────────────────────────────────────────────────────────────────────────
 * DOM REFERENCES
 * ───────────────────────────────────────────────────────────────────────── */
const appSidebar = document.getElementById('app-sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const mobileSidebarTrigger = document.getElementById('mobile-sidebar-trigger');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const btnNewAssessment = document.getElementById('btn-new-assessment');
const historyItemsList = document.getElementById('history-items-list');

const sessionActiveTitle = document.getElementById('session-active-title');
const conversationScrollArea = document.getElementById('conversation-scroll-area');
const emptyStateCard = document.getElementById('empty-state-card');
const messagesStream = document.getElementById('messages-stream');

const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const charCount = document.getElementById('char-count');
const voiceInputBtn = document.getElementById('voice-input-btn');
const processingStatus = document.getElementById('processing-status-indicator');
const processingText = document.getElementById('processing-status-text');

// Settings & Utilities
const btnOpenSettings = document.getElementById('btn-open-settings');
const topSettingsBtn = document.getElementById('top-settings-btn');
const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const btnClearAllSessions = document.getElementById('btn-clear-all-sessions');
const settingsSessionCount = document.getElementById('settings-session-count');
const settingsHapticsToggle = document.getElementById('settings-haptics-toggle');

const btnQuickThemeToggle = document.getElementById('btn-quick-theme-toggle');
const themeIconIndicator = document.getElementById('theme-icon-indicator');
const themeTextIndicator = document.getElementById('theme-text-indicator');

const btnQuickHapticsToggle = document.getElementById('btn-quick-haptics-toggle');
const hapticsIconIndicator = document.getElementById('haptics-icon-indicator');
const hapticsTextIndicator = document.getElementById('haptics-text-indicator');

const emergencyOverlay = document.getElementById('emergency-overlay');
const emergencyDismiss = document.getElementById('emergency-dismiss');
const luxuryToast = document.getElementById('luxury-toast');
const cursorSpotlight = document.getElementById('cursor-spotlight');

/* ─────────────────────────────────────────────────────────────────────────
 * INITIALIZATION
 * ───────────────────────────────────────────────────────────────────────── */
function init() {
  loadStoredPreferences();
  initTheme();
  initVoiceRecognition();
  initCursorSpotlight();
  loadSessions();

  // Bind Event Listeners
  sendBtn.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keydown', handleKeyDown);
  userInput.addEventListener('input', handleInputChange);
  btnNewAssessment.addEventListener('click', createNewAssessment);

  // Mobile Sidebar
  if (mobileSidebarTrigger) mobileSidebarTrigger.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Settings
  if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettings);
  if (topSettingsBtn) topSettingsBtn.addEventListener('click', openSettings);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);
  if (settingsModalBackdrop) {
    settingsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === settingsModalBackdrop) closeSettings();
    });
  }

  // Theme Buttons in Settings
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-set-theme'));
    });
  });

  // Quick Sidebar Theme Toggle
  if (btnQuickThemeToggle) {
    btnQuickThemeToggle.addEventListener('click', () => {
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // Haptics Toggles
  if (btnQuickHapticsToggle) {
    btnQuickHapticsToggle.addEventListener('click', toggleAudioHaptics);
  }
  if (settingsHapticsToggle) {
    settingsHapticsToggle.addEventListener('change', (e) => {
      isAudioHapticsEnabled = e.target.checked;
      savePreferences();
      updateHapticsUI();
    });
  }

  if (btnClearAllSessions) {
    btnClearAllSessions.addEventListener('click', clearAllSessions);
  }

  // Starter Prompt Chips
  document.querySelectorAll('.starter-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt) {
        playAcousticHaptic('click');
        userInput.value = prompt;
        handleInputChange();
        handleSendMessage();
      }
    });
  });

  // Emergency Modal Dismiss
  if (emergencyDismiss) {
    emergencyDismiss.addEventListener('click', () => {
      emergencyOverlay.classList.remove('open');
      playAcousticHaptic('click');
    });
  }

  // Set Initial View
  if (sessions.length > 0) {
    switchSession(sessions[0].id);
  } else {
    createNewAssessment();
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * SESSION HISTORY & PERSISTENCE (CHATGPT-STYLE)
 * ───────────────────────────────────────────────────────────────────────── */
function loadSessions() {
  try {
    const saved = localStorage.getItem('medassist_sessions_v2');
    sessions = saved ? JSON.parse(saved) : [];
  } catch (e) {
    sessions = [];
  }
  renderHistorySidebar();
  updateSettingsSessionCount();
}

function saveSessions() {
  try {
    localStorage.setItem('medassist_sessions_v2', JSON.stringify(sessions));
  } catch (e) {}
  renderHistorySidebar();
  updateSettingsSessionCount();
}

function createNewAssessment() {
  playAcousticHaptic('click');
  const newSession = {
    id: 'session_' + Date.now(),
    title: 'New Consultation',
    createdAt: new Date().toISOString(),
    messages: []
  };

  sessions.unshift(newSession);
  activeSessionId = newSession.id;
  saveSessions();

  renderActiveSessionMessages();
  closeMobileSidebar();
  userInput.focus();
}

function switchSession(sessionId) {
  playAcousticHaptic('click');
  activeSessionId = sessionId;
  renderHistorySidebar();
  renderActiveSessionMessages();
  closeMobileSidebar();
}

function getActiveSession() {
  return sessions.find(s => s.id === activeSessionId);
}

function renderHistorySidebar() {
  if (!historyItemsList) return;
  historyItemsList.innerHTML = '';

  if (sessions.length === 0) {
    historyItemsList.innerHTML = '<div style="font-size: 0.74rem; color: var(--text-muted); padding: 6px 8px;">No recent assessments</div>';
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const groups = {
    today: [],
    yesterday: [],
    earlier: []
  };

  sessions.forEach(sess => {
    const createdTime = new Date(sess.createdAt || Date.now()).getTime();
    if (createdTime >= todayStart) {
      groups.today.push(sess);
    } else if (createdTime >= yesterdayStart) {
      groups.yesterday.push(sess);
    } else {
      groups.earlier.push(sess);
    }
  });

  const renderGroup = (title, items) => {
    if (items.length === 0) return;
    const groupHeading = document.createElement('div');
    groupHeading.style.cssText = 'font-size: 0.65rem; color: var(--text-muted); padding: 8px 8px 3px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em;';
    groupHeading.textContent = title;
    historyItemsList.appendChild(groupHeading);

    items.forEach(sess => {
      const item = document.createElement('div');
      item.className = `history-session-item ${sess.id === activeSessionId ? 'active' : ''}`;
      item.textContent = sess.title || 'Consultation';
      item.title = sess.title;
      item.addEventListener('click', () => switchSession(sess.id));
      historyItemsList.appendChild(item);
    });
  };

  renderGroup('Today', groups.today);
  renderGroup('Yesterday', groups.yesterday);
  renderGroup('Earlier', groups.earlier);
}

function renderActiveSessionMessages() {
  const session = getActiveSession();
  if (!session) return;

  sessionActiveTitle.textContent = session.title || 'New Consultation';
  messagesStream.innerHTML = '';

  if (session.messages.length === 0) {
    emptyStateCard.style.display = 'block';
    messagesStream.style.display = 'none';
  } else {
    emptyStateCard.style.display = 'none';
    messagesStream.style.display = 'flex';

    session.messages.forEach(msg => {
      if (msg.role === 'user') {
        messagesStream.insertAdjacentHTML('beforeend', renderUserMessage(msg.content));
      } else {
        const msgId = 'msg-' + (msg.timestamp || Date.now());
        const html = renderAssistantMessage({
          type: msg.type || 'normal',
          humanResponse: msg.content,
          triage: msg.triage
        }, msgId);
        messagesStream.insertAdjacentHTML('beforeend', html);
        bindMessageActions(msgId, msg.content);
      }
    });

    conversationScrollArea.scrollTop = conversationScrollArea.scrollHeight;
  }
}

function updateSessionTitleFromInput(session, text) {
  if (session.title === 'New Consultation' || !session.title) {
    let clean = text.replace(/^(i have|i've had|i am experiencing|experiencing|my)\s+/i, '');
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (clean.length > 28) clean = clean.substring(0, 26) + '...';
    session.title = clean;
  }
}

function clearAllSessions() {
  playAcousticHaptic('click');
  sessions = [];
  activeSessionId = null;
  localStorage.removeItem('medassist_sessions_v2');
  createNewAssessment();
  showToast('All consultation history cleared');
}

function updateSettingsSessionCount() {
  if (settingsSessionCount) {
    settingsSessionCount.textContent = `${sessions.length} recorded consultation(s)`;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * CONVERSATION & PIPELINE EXECUTION
 * ───────────────────────────────────────────────────────────────────────── */
async function handleSendMessage() {
  const text = userInput.value.trim();
  if (!text || isProcessing) return;

  const session = getActiveSession();
  if (!session) return;

  playAcousticHaptic('click');
  userInput.value = '';
  handleInputChange();

  // 1. Append User Message to UI & Session State
  updateSessionTitleFromInput(session, text);
  session.messages.push({
    role: 'user',
    content: text,
    timestamp: Date.now()
  });

  emptyStateCard.style.display = 'none';
  messagesStream.style.display = 'flex';
  messagesStream.insertAdjacentHTML('beforeend', renderUserMessage(text));
  conversationScrollArea.scrollTop = conversationScrollArea.scrollHeight;

  // 2. Animate Processing Indicator
  isProcessing = true;
  sendBtn.disabled = true;
  userInput.disabled = true;
  showProcessingIndicator(true, 'Reviewing your symptoms...');

  await delay(400);
  setProcessingText('Checking relevant information...');

  await delay(450);
  setProcessingText('Preparing guidance...');

  // 3. Execute Clinical Pipeline
  const historyTurns = session.messages.filter(m => m.role === 'user');
  const result = await executePipelineAsync(text, historyTurns, {
    apiKey: GEMINI_CONFIG.apiKey,
    model: GEMINI_CONFIG.model
  });

  showProcessingIndicator(false);

  // 4. Handle Emergency Interception if detected
  if (result.type === 'emergency') {
    if (emergencyOverlay) emergencyOverlay.classList.add('open');
  }

  // 5. Append Assistant Message
  const msgId = 'msg-' + Date.now();
  session.messages.push({
    role: 'assistant',
    content: result.humanResponse,
    type: result.type,
    triage: result.triage,
    timestamp: Date.now()
  });

  saveSessions();

  const assistantHtml = renderAssistantMessage(result, msgId);
  messagesStream.insertAdjacentHTML('beforeend', assistantHtml);
  bindMessageActions(msgId, result.humanResponse);

  playAcousticHaptic('complete');

  isProcessing = false;
  sendBtn.disabled = false;
  userInput.disabled = false;
  userInput.focus();

  conversationScrollArea.scrollTop = conversationScrollArea.scrollHeight;
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
}

function handleInputChange() {
  const len = userInput.value.length;
  if (charCount) charCount.textContent = `${len}/1000`;
  sendBtn.disabled = len === 0 || isProcessing;

  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + 'px';
}

function showProcessingIndicator(show, text = 'Reviewing your symptoms...') {
  if (!processingStatus) return;
  processingStatus.style.display = show ? 'flex' : 'none';
  if (processingText) processingText.textContent = text;
}

function setProcessingText(text) {
  if (processingText) processingText.textContent = text;
}

function bindMessageActions(msgId, content) {
  const container = document.getElementById(msgId);
  if (!container) return;

  const copyBtn = container.querySelector('.copy-msg-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      navigator.clipboard.writeText(content).then(() => showToast('Response copied to clipboard'));
    });
  }

  const speakBtn = container.querySelector('.speak-msg-btn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      toggleSpeechSynthesis(msgId, content, speakBtn);
    });
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * SPEECH SYNTHESIS & VOICE RECOGNITION
 * ───────────────────────────────────────────────────────────────────────── */
function toggleSpeechSynthesis(msgId, content, buttonEl) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.');
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (activeSpeakingMsgId === msgId) {
      activeSpeakingMsgId = null;
      buttonEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span>Listen</span>`;
      return;
    }
  }

  const cleanText = content.replace(/###/g, '').replace(/\*\*/g, '').replace(/•/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  activeSpeakingMsgId = msgId;
  buttonEl.innerHTML = `<span>⏹️ Stop</span>`;

  utterance.onend = () => {
    activeSpeakingMsgId = null;
    buttonEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span>Listen</span>`;
  };

  window.speechSynthesis.speak(utterance);
}

function initVoiceRecognition() {
  if (!voiceInputBtn) return;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    voiceInputBtn.style.display = 'none';
    return;
  }

  speechRecognitionInstance = new SpeechRec();
  speechRecognitionInstance.continuous = false;
  speechRecognitionInstance.interimResults = false;
  speechRecognitionInstance.lang = 'en-US';

  speechRecognitionInstance.onstart = () => {
    isVoiceListening = true;
    voiceInputBtn.classList.add('listening');
    showToast('🎙️ Listening...');
  };

  speechRecognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      userInput.value = userInput.value ? `${userInput.value} ${transcript}` : transcript;
      handleInputChange();
    }
  };

  speechRecognitionInstance.onerror = () => {
    isVoiceListening = false;
    voiceInputBtn.classList.remove('listening');
  };

  speechRecognitionInstance.onend = () => {
    isVoiceListening = false;
    voiceInputBtn.classList.remove('listening');
  };

  voiceInputBtn.addEventListener('click', () => {
    if (isVoiceListening) {
      speechRecognitionInstance.stop();
    } else {
      speechRecognitionInstance.start();
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * THEME MANAGEMENT (LIGHT / DARK / SYSTEM)
 * ───────────────────────────────────────────────────────────────────────── */
function initTheme() {
  setTheme(currentTheme);
}

function setTheme(theme) {
  let appliedTheme = theme;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    appliedTheme = prefersDark ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', appliedTheme);
  currentTheme = theme;
  savePreferences();

  // Update Settings Buttons
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-set-theme') === theme);
  });

  // Update Sidebar Quick Toggle
  if (themeIconIndicator && themeTextIndicator) {
    if (appliedTheme === 'dark') {
      themeIconIndicator.textContent = '☀️';
      themeTextIndicator.textContent = 'Light Theme';
    } else {
      themeIconIndicator.textContent = '🌙';
      themeTextIndicator.textContent = 'Dark Theme';
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * AUDIO HAPTICS & ACOUSTIC FEEDBACK
 * ───────────────────────────────────────────────────────────────────────── */
function playAcousticHaptic(type = 'click') {
  if (!isAudioHapticsEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'complete') {
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.12);
      });
    }
  } catch (e) {}
}

function toggleAudioHaptics() {
  isAudioHapticsEnabled = !isAudioHapticsEnabled;
  savePreferences();
  updateHapticsUI();
  playAcousticHaptic('click');
  showToast(isAudioHapticsEnabled ? 'Haptics Enabled' : 'Haptics Muted');
}

function updateHapticsUI() {
  if (settingsHapticsToggle) settingsHapticsToggle.checked = isAudioHapticsEnabled;
  if (hapticsIconIndicator && hapticsTextIndicator) {
    hapticsIconIndicator.textContent = isAudioHapticsEnabled ? '🔊' : '🔇';
    hapticsTextIndicator.textContent = isAudioHapticsEnabled ? 'Haptics On' : 'Haptics Off';
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * SETTINGS & SIDEBAR DRAWERS
 * ───────────────────────────────────────────────────────────────────────── */
function openSettings() {
  playAcousticHaptic('click');
  updateSettingsSessionCount();
  if (settingsModalBackdrop) settingsModalBackdrop.classList.add('open');
}

function closeSettings() {
  playAcousticHaptic('click');
  if (settingsModalBackdrop) settingsModalBackdrop.classList.remove('open');
}

function openMobileSidebar() {
  if (appSidebar) appSidebar.classList.add('mobile-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
}

function closeMobileSidebar() {
  if (appSidebar) appSidebar.classList.remove('mobile-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
}

function initCursorSpotlight() {
  if (!cursorSpotlight) return;
  window.addEventListener('pointermove', (e) => {
    cursorSpotlight.style.left = e.clientX + 'px';
    cursorSpotlight.style.top = e.clientY + 'px';
  });
}

function loadStoredPreferences() {
  try {
    const theme = localStorage.getItem('medassist_theme');
    if (theme) currentTheme = theme;

    const haptics = localStorage.getItem('medassist_haptics');
    if (haptics !== null) isAudioHapticsEnabled = haptics === 'true';
  } catch (e) {}
  updateHapticsUI();
}

function savePreferences() {
  try {
    localStorage.setItem('medassist_theme', currentTheme);
    localStorage.setItem('medassist_haptics', String(isAudioHapticsEnabled));
  } catch (e) {}
}

function showToast(text) {
  if (!luxuryToast) return;
  luxuryToast.textContent = text;
  luxuryToast.classList.add('show');
  setTimeout(() => luxuryToast.classList.remove('show'), 2400);
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', init);

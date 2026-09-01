/**
 * app.js — MedAssist Clinical Symptom Assessment Tool Controller
 * 
 * Orchestrates:
 * 1. Initial Complaint Input & Emergency Circuit Breaker Check
 * 2. Adaptive Multi-Step Clinical Assessment Question Stepper
 * 3. Deep Structured Clinical Result Generation & Presentation
 * 4. Assessment History Management & Sidebar Navigation
 * 5. Theme Switching (Obsidian Dark / Light / System) & Acoustic Haptics
 * 6. Voice Recognition & Speech Synthesis Briefing
 */

import { executeStructuredAssessmentAsync } from './pipeline.js?v=4';
import { renderStructuredAssessmentResult } from './renderer.js?v=4';
import { executeTool } from './tools.js?v=4';

/* ─────────────────────────────────────────────────────────────────────────
 * STATE MANAGEMENT
 * ───────────────────────────────────────────────────────────────────────── */
let storedAssessments = [];
let activeAssessmentId = null;
let currentTheme = 'dark';
let isAudioHapticsEnabled = true;
let isVoiceListening = false;
let activeSpeakingId = null;

// Active assessment in-progress state
let assessmentState = {
  primarySymptom: '',
  complaintType: 'general', // 'headache' | 'cough' | 'dizziness' | 'abdominal' | 'general'
  currentStepIndex: 0,
  steps: [],
  answers: {
    age: '25–40',
    duration: '1–3 Days',
    severity: 'Moderate',
    location: '',
    associatedSymptoms: [],
    medicalHistory: 'None',
    medications: 'None'
  }
};

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

// Views
const viewStart = document.getElementById('view-start');
const viewQuestions = document.getElementById('view-questions');
const viewLoading = document.getElementById('view-loading');
const viewResult = document.getElementById('view-result');
const viewEmergency = document.getElementById('view-emergency');

// Start view elements
const initialSymptomInput = document.getElementById('initial-symptom-input');
const btnStartAssessment = document.getElementById('btn-start-assessment');
const startCharCount = document.getElementById('start-char-count');
const startVoiceBtn = document.getElementById('start-voice-btn');

// Stepper elements
const stepCounterText = document.getElementById('step-counter-text');
const stepTitleText = document.getElementById('step-title-text');
const progressTrackFill = document.getElementById('progress-track-fill');
const questionStepContent = document.getElementById('question-step-content');
const btnStepBack = document.getElementById('btn-step-back');
const btnStepNext = document.getElementById('btn-step-next');

// Result elements
const resultContentContainer = document.getElementById('result-content-container');

// Emergency elements
const emergencyFlagDesc = document.getElementById('emergency-flag-desc');
const btnEmergencyRestart = document.getElementById('btn-emergency-restart');

// Settings & Preferences
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

const luxuryToast = document.getElementById('luxury-toast');
const cursorSpotlight = document.getElementById('cursor-spotlight');

/* ─────────────────────────────────────────────────────────────────────────
 * INITIALIZATION
 * ───────────────────────────────────────────────────────────────────────── */
function init() {
  loadPreferences();
  initTheme();
  initCursorSpotlight();
  initVoiceRecognition();
  loadStoredAssessments();

  // Event Listeners
  if (initialSymptomInput) {
    initialSymptomInput.addEventListener('input', handleInitialInputChange);
    initialSymptomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (initialSymptomInput.value.trim().length > 0) {
          startGuidedAssessment();
        }
      }
    });
  }

  if (btnStartAssessment) btnStartAssessment.addEventListener('click', startGuidedAssessment);
  if (btnNewAssessment) btnNewAssessment.addEventListener('click', resetToStartScreen);

  // Stepper buttons
  if (btnStepBack) btnStepBack.addEventListener('click', handleStepBack);
  if (btnStepNext) btnStepNext.addEventListener('click', handleStepNext);

  // Quick starter chips
  document.querySelectorAll('.quick-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.getAttribute('data-symptom');
      if (sym && initialSymptomInput) {
        playAcousticHaptic('click');
        initialSymptomInput.value = sym;
        handleInitialInputChange();
        startGuidedAssessment();
      }
    });
  });

  // Emergency restart
  if (btnEmergencyRestart) {
    btnEmergencyRestart.addEventListener('click', resetToStartScreen);
  }

  // Sidebar & Settings triggers
  if (mobileSidebarTrigger) mobileSidebarTrigger.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettings);
  if (topSettingsBtn) topSettingsBtn.addEventListener('click', openSettings);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);
  if (settingsModalBackdrop) {
    settingsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === settingsModalBackdrop) closeSettings();
    });
  }

  // Theme controls
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-set-theme'));
    });
  });

  if (btnQuickThemeToggle) {
    btnQuickThemeToggle.addEventListener('click', () => {
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

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
    btnClearAllSessions.addEventListener('click', clearAllStoredAssessments);
  }

  // Initial screen
  resetToStartScreen();
}

/* ─────────────────────────────────────────────────────────────────────────
 * ASSESSMENT FLOW ENGINE
 * ───────────────────────────────────────────────────────────────────────── */
function startGuidedAssessment() {
  const text = initialSymptomInput.value.trim();
  if (!text) return;

  playAcousticHaptic('click');

  // 1. Immediate Emergency Check
  const triage = executeTool('suggest_next_step', { symptom_text: text });
  if (triage && triage.isEmergency) {
    showEmergencyScreen(triage);
    return;
  }

  // 2. Setup Assessment State & Question Schema
  const complaintType = determineComplaintType(text);
  assessmentState = {
    primarySymptom: text,
    complaintType,
    currentStepIndex: 0,
    steps: buildQuestionSteps(complaintType, text),
    answers: {
      primarySymptom: text,
      age: '25–40',
      duration: '1–3 Days',
      severity: 'Moderate',
      location: getDefaultLocation(complaintType),
      associatedSymptoms: [],
      medicalHistory: 'None',
      medications: 'None'
    }
  };

  sessionActiveTitle.textContent = summarizeTitle(text);
  renderCurrentQuestionStep();
  switchView('questions');
}

function determineComplaintType(text) {
  const t = text.toLowerCase();
  if (t.includes('headache') || t.includes('migraine') || t.includes('head pain')) return 'headache';
  if (t.includes('cough') || t.includes('sore throat') || t.includes('congestion')) return 'cough';
  if (t.includes('dizzy') || t.includes('dizziness') || t.includes('vertigo') || t.includes('lightheaded')) return 'dizziness';
  if (t.includes('stomach') || t.includes('abdominal') || t.includes('belly') || t.includes('cramp') || t.includes('nausea')) return 'abdominal';
  return 'general';
}

function getDefaultLocation(type) {
  if (type === 'headache') return 'Forehead / Temples';
  if (type === 'cough') return 'Dry / Irritated Airways';
  if (type === 'dizziness') return 'Positional (Standing up)';
  if (type === 'abdominal') return 'Upper Abdomen / Stomach';
  return 'General';
}

function buildQuestionSteps(type, text) {
  return [
    {
      id: 'step_basic',
      title: 'Basic Information & Onset',
      render: (answers) => `
        <div class="question-item-block">
          <label class="question-item-title">How old are you?</label>
          <div class="choice-pill-grid">
            ${['Under 18', '18–35', '36–55', '56+'].map(a => `
              <button type="button" class="choice-pill-btn ${answers.age === a ? 'active' : ''}" onclick="window.medassistSetAnswer('age', '${a}')">${a}</button>
            `).join('')}
          </div>
        </div>

        <div class="question-item-block" style="margin-top: 18px;">
          <label class="question-item-title">How long have you been experiencing this?</label>
          <div class="choice-pill-grid">
            ${['< 24 Hours', '1–3 Days', '4–7 Days', '1+ Weeks'].map(d => `
              <button type="button" class="choice-pill-btn ${answers.duration === d ? 'active' : ''}" onclick="window.medassistSetAnswer('duration', '${d}')">${d}</button>
            `).join('')}
          </div>
        </div>
      `
    },
    {
      id: 'step_characteristics',
      title: 'Severity & Specific Pattern',
      render: (answers) => {
        let specificQuestionHtml = '';
        if (type === 'headache') {
          specificQuestionHtml = `
            <div class="question-item-block" style="margin-top: 18px;">
              <label class="question-item-title">Where is the headache localized?</label>
              <div class="choice-pill-grid">
                ${['Forehead / Temples', 'One Side / Temple', 'Back of Head / Neck', 'Band around Head'].map(loc => `
                  <button type="button" class="choice-pill-btn ${answers.location === loc ? 'active' : ''}" onclick="window.medassistSetAnswer('location', '${loc}')">${loc}</button>
                `).join('')}
              </div>
            </div>
          `;
        } else if (type === 'cough') {
          specificQuestionHtml = `
            <div class="question-item-block" style="margin-top: 18px;">
              <label class="question-item-title">What type of cough are you experiencing?</label>
              <div class="choice-pill-grid">
                ${['Dry & Hacking', 'Wet with Phlegm', 'Throat Tickle', 'Chest Tightness'].map(loc => `
                  <button type="button" class="choice-pill-btn ${answers.location === loc ? 'active' : ''}" onclick="window.medassistSetAnswer('location', '${loc}')">${loc}</button>
                `).join('')}
              </div>
            </div>
          `;
        } else if (type === 'dizziness') {
          specificQuestionHtml = `
            <div class="question-item-block" style="margin-top: 18px;">
              <label class="question-item-title">What best describes the sensation?</label>
              <div class="choice-pill-grid">
                ${['Lightheaded on standing', 'Room spinning (Vertigo)', 'Unsteadiness', 'Faint sensation'].map(loc => `
                  <button type="button" class="choice-pill-btn ${answers.location === loc ? 'active' : ''}" onclick="window.medassistSetAnswer('location', '${loc}')">${loc}</button>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          specificQuestionHtml = `
            <div class="question-item-block" style="margin-top: 18px;">
              <label class="question-item-title">How is this affecting your day?</label>
              <div class="choice-pill-grid">
                ${['Disrupting daily tasks', 'Mild discomfort', 'Restricting focus', 'Intermittent discomfort'].map(loc => `
                  <button type="button" class="choice-pill-btn ${answers.location === loc ? 'active' : ''}" onclick="window.medassistSetAnswer('location', '${loc}')">${loc}</button>
                `).join('')}
              </div>
            </div>
          `;
        }

        return `
          <div class="question-item-block">
            <label class="question-item-title">How severe are your symptoms?</label>
            <div class="choice-pill-grid">
              ${['Mild', 'Moderate', 'Severe'].map(s => `
                <button type="button" class="choice-pill-btn ${answers.severity === s ? 'active' : ''}" onclick="window.medassistSetAnswer('severity', '${s}')">${s}</button>
              `).join('')}
            </div>
          </div>
          ${specificQuestionHtml}
        `;
      }
    },
    {
      id: 'step_history',
      title: 'Associated Factors & Medical History',
      render: (answers) => {
        const associatedOptions = getAssociatedOptions(type);
        return `
          <div class="question-item-block">
            <label class="question-item-title">Are you experiencing any of these associated symptoms?</label>
            <span class="question-item-sub">Select all that apply</span>
            <div class="tags-chip-row">
              ${associatedOptions.map(opt => `
                <button type="button" class="tag-select-chip ${(answers.associatedSymptoms || []).includes(opt) ? 'active' : ''}" onclick="window.medassistToggleAssociated('${opt}')">${opt}</button>
              `).join('')}
            </div>
          </div>

          <div class="question-item-block" style="margin-top: 18px;">
            <label class="question-item-title">Do you have any existing medical conditions?</label>
            <div class="choice-pill-grid">
              ${['None', 'Hypertension / Heart', 'Asthma / Respiratory', 'Migraine History', 'Diabetes'].map(h => `
                <button type="button" class="choice-pill-btn ${answers.medicalHistory === h ? 'active' : ''}" onclick="window.medassistSetAnswer('medicalHistory', '${h}')">${h}</button>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
  ];
}

function getAssociatedOptions(type) {
  if (type === 'headache') return ['Fatigue', 'Sensitivity to Light', 'Mild Nausea', 'Neck Tension', 'Screen Strain', 'None'];
  if (type === 'cough') return ['Low-grade Fever', 'Sore Throat', 'Nasal Congestion', 'Body Aches', 'Fatigue', 'None'];
  if (type === 'dizziness') return ['Dehydration', 'Skipped Meal', 'Poor Sleep', 'Mild Nausea', 'Fatigue', 'None'];
  if (type === 'abdominal') return ['Mild Nausea', 'Bloating', 'Loss of Appetite', 'Fatigue', 'None'];
  return ['Fatigue', 'Mild Fever', 'Muscle Soreness', 'Poor Sleep', 'Stress', 'None'];
}

// Global hook for inline onclick handlers
window.medassistSetAnswer = function(field, value) {
  playAcousticHaptic('click');
  assessmentState.answers[field] = value;
  renderCurrentQuestionStep();
};

window.medassistToggleAssociated = function(value) {
  playAcousticHaptic('click');
  let current = assessmentState.answers.associatedSymptoms || [];
  if (value === 'None') {
    current = ['None'];
  } else {
    current = current.filter(item => item !== 'None');
    if (current.includes(value)) {
      current = current.filter(item => item !== value);
    } else {
      current.push(value);
    }
  }
  assessmentState.answers.associatedSymptoms = current;
  renderCurrentQuestionStep();
};

function renderCurrentQuestionStep() {
  const step = assessmentState.steps[assessmentState.currentStepIndex];
  if (!step) return;

  const totalSteps = assessmentState.steps.length;
  const currentNum = assessmentState.currentStepIndex + 1;

  stepCounterText.textContent = `STEP ${currentNum} OF ${totalSteps}`;
  stepTitleText.textContent = step.title;
  progressTrackFill.style.width = `${(currentNum / totalSteps) * 100}%`;

  questionStepContent.innerHTML = step.render(assessmentState.answers);

  // Stepper navigation buttons
  btnStepBack.style.visibility = assessmentState.currentStepIndex > 0 ? 'visible' : 'hidden';
  btnStepNext.querySelector('span').textContent = currentNum === totalSteps ? 'Generate Assessment' : 'Continue';
}

function handleStepBack() {
  if (assessmentState.currentStepIndex > 0) {
    playAcousticHaptic('click');
    assessmentState.currentStepIndex--;
    renderCurrentQuestionStep();
  }
}

async function handleStepNext() {
  playAcousticHaptic('click');
  const totalSteps = assessmentState.steps.length;

  if (assessmentState.currentStepIndex < totalSteps - 1) {
    assessmentState.currentStepIndex++;
    renderCurrentQuestionStep();
  } else {
    // Final Step -> Generate Structured Result
    await generateAssessmentResult();
  }
}

async function generateAssessmentResult() {
  switchView('loading');

  await delay(500);

  // Execute clinical assessment pipeline
  const result = await executeStructuredAssessmentAsync(assessmentState.answers);

  if (result.type === 'emergency') {
    showEmergencyScreen(result.triage);
    return;
  }

  // Render complete structured result
  const dossierId = 'assessment_' + Date.now();
  const html = renderStructuredAssessmentResult(result, dossierId);
  resultContentContainer.innerHTML = html;

  // Bind result actions (Copy, Print, Listen, Restart)
  bindResultActions(dossierId, result);

  // Save to stored assessments
  saveCompletedAssessment({
    id: dossierId,
    title: summarizeTitle(assessmentState.primarySymptom),
    createdAt: new Date().toISOString(),
    result
  });

  playAcousticHaptic('complete');
  switchView('result');
}

function bindResultActions(dossierId, result) {
  const container = document.getElementById(dossierId);
  if (!container) return;

  const copyBtn = container.querySelector('.btn-copy-assessment');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      const text = resultContentContainer.innerText;
      navigator.clipboard.writeText(text).then(() => showToast('Assessment copied to clipboard'));
    });
  }

  const printBtn = container.querySelector('.btn-print-assessment');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      window.print();
    });
  }

  const speakBtn = container.querySelector('.btn-speak-assessment');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      toggleSpeechBriefing(dossierId, result, speakBtn);
    });
  }

  const restartBtn = document.getElementById('btn-restart-assessment-bottom');
  if (restartBtn) {
    restartBtn.addEventListener('click', resetToStartScreen);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * SPEECH SYNTHESIS & VOICE INPUT
 * ───────────────────────────────────────────────────────────────────────── */
function toggleSpeechBriefing(dossierId, result, buttonEl) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.');
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (activeSpeakingId === dossierId) {
      activeSpeakingId = null;
      buttonEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span>Listen</span>`;
      return;
    }
  }

  const r = result.report || {};
  const explanations = (r.explanations || []).map(e => `${e.title}: ${e.explanation}`).join('. ');
  const care = (r.selfCare || []).join('. ');
  const script = `Clinical Assessment Summary. ${r.summary || ''}. Possible Explanations: ${explanations}. Recommended Protocol: ${care}.`;

  const utterance = new SpeechSynthesisUtterance(script);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  activeSpeakingId = dossierId;
  buttonEl.innerHTML = `<span>⏹️ Stop</span>`;

  utterance.onend = () => {
    activeSpeakingId = null;
    buttonEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span>Listen</span>`;
  };

  window.speechSynthesis.speak(utterance);
}

function initVoiceRecognition() {
  if (!startVoiceBtn) return;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    startVoiceBtn.style.display = 'none';
    return;
  }

  const rec = new SpeechRec();
  rec.continuous = false;
  rec.lang = 'en-US';

  rec.onstart = () => {
    isVoiceListening = true;
    startVoiceBtn.classList.add('listening');
    showToast('🎙️ Listening...');
  };

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript && initialSymptomInput) {
      initialSymptomInput.value = initialSymptomInput.value ? `${initialSymptomInput.value} ${transcript}` : transcript;
      handleInitialInputChange();
    }
  };

  rec.onerror = () => {
    isVoiceListening = false;
    startVoiceBtn.classList.remove('listening');
  };

  rec.onend = () => {
    isVoiceListening = false;
    startVoiceBtn.classList.remove('listening');
  };

  startVoiceBtn.addEventListener('click', () => {
    if (isVoiceListening) {
      rec.stop();
    } else {
      rec.start();
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * ASSESSMENT HISTORY & PERSISTENCE
 * ───────────────────────────────────────────────────────────────────────── */
function loadStoredAssessments() {
  try {
    const saved = localStorage.getItem('medassist_assessments_v3');
    storedAssessments = saved ? JSON.parse(saved) : [];
  } catch (e) {
    storedAssessments = [];
  }
  renderHistorySidebar();
  updateSettingsSessionCount();
}

function saveCompletedAssessment(assessmentObj) {
  storedAssessments.unshift(assessmentObj);
  if (storedAssessments.length > 25) storedAssessments.pop();
  try {
    localStorage.setItem('medassist_assessments_v3', JSON.stringify(storedAssessments));
  } catch (e) {}
  renderHistorySidebar();
  updateSettingsSessionCount();
}

function renderHistorySidebar() {
  if (!historyItemsList) return;
  historyItemsList.innerHTML = '';

  if (storedAssessments.length === 0) {
    historyItemsList.innerHTML = '<div style="font-size: 0.74rem; color: var(--text-muted); padding: 6px 8px;">No recent assessments</div>';
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const groups = { today: [], yesterday: [], earlier: [] };

  storedAssessments.forEach(item => {
    const t = new Date(item.createdAt || Date.now()).getTime();
    if (t >= todayStart) groups.today.push(item);
    else if (t >= yesterdayStart) groups.yesterday.push(item);
    else groups.earlier.push(item);
  });

  const renderGroup = (label, list) => {
    if (list.length === 0) return;
    const h = document.createElement('div');
    h.style.cssText = 'font-size: 0.64rem; color: var(--text-muted); padding: 8px 8px 2px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em;';
    h.textContent = label;
    historyItemsList.appendChild(h);

    list.forEach(item => {
      const el = document.createElement('div');
      el.className = `history-session-item ${item.id === activeAssessmentId ? 'active' : ''}`;
      el.textContent = item.title;
      el.title = item.title;
      el.addEventListener('click', () => loadPreviousAssessment(item));
      historyItemsList.appendChild(el);
    });
  };

  renderGroup('Today', groups.today);
  renderGroup('Yesterday', groups.yesterday);
  renderGroup('Earlier', groups.earlier);
}

function loadPreviousAssessment(item) {
  playAcousticHaptic('click');
  activeAssessmentId = item.id;
  sessionActiveTitle.textContent = item.title;

  const html = renderStructuredAssessmentResult(item.result, item.id);
  resultContentContainer.innerHTML = html;
  bindResultActions(item.id, item.result);

  renderHistorySidebar();
  closeMobileSidebar();
  switchView('result');
}

function clearAllStoredAssessments() {
  playAcousticHaptic('click');
  storedAssessments = [];
  activeAssessmentId = null;
  localStorage.removeItem('medassist_assessments_v3');
  renderHistorySidebar();
  updateSettingsSessionCount();
  resetToStartScreen();
  showToast('Assessment history cleared');
}

function updateSettingsSessionCount() {
  if (settingsSessionCount) {
    settingsSessionCount.textContent = `${storedAssessments.length} recorded assessment(s)`;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * VIEW SWITCHING & UI HELPERS
 * ───────────────────────────────────────────────────────────────────────── */
function switchView(viewName) {
  [viewStart, viewQuestions, viewLoading, viewResult, viewEmergency].forEach(v => {
    if (v) v.style.display = 'none';
  });

  if (viewName === 'start' && viewStart) viewStart.style.display = 'flex';
  if (viewName === 'questions' && viewQuestions) viewQuestions.style.display = 'flex';
  if (viewName === 'loading' && viewLoading) viewLoading.style.display = 'flex';
  if (viewName === 'result' && viewResult) viewResult.style.display = 'flex';
  if (viewName === 'emergency' && viewEmergency) viewEmergency.style.display = 'flex';
}

function resetToStartScreen() {
  playAcousticHaptic('click');
  activeAssessmentId = null;
  sessionActiveTitle.textContent = 'Clinical Symptom Assessment';
  if (initialSymptomInput) {
    initialSymptomInput.value = '';
    handleInitialInputChange();
  }
  renderHistorySidebar();
  closeMobileSidebar();
  switchView('start');
}

function showEmergencyScreen(triage) {
  const flags = triage.matchedFlags ? triage.matchedFlags.map(f => f.pattern.toUpperCase()).join(', ') : 'CRITICAL RED-FLAG INDICATORS';
  if (emergencyFlagDesc) {
    emergencyFlagDesc.textContent = `Your reported symptoms indicate potential emergency indicators (${flags}). Please seek prompt professional emergency evaluation.`;
  }
  switchView('emergency');
}

function handleInitialInputChange() {
  const len = initialSymptomInput.value.length;
  if (startCharCount) startCharCount.textContent = `${len}/500`;
  if (btnStartAssessment) btnStartAssessment.disabled = len === 0;
}

function summarizeTitle(text) {
  let clean = text.replace(/^(i have|i've had|i am experiencing|experiencing|my)\s+/i, '');
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (clean.length > 28) clean = clean.substring(0, 26) + '...';
  return clean || 'Clinical Assessment';
}

/* ─────────────────────────────────────────────────────────────────────────
 * THEME & HAPTICS PREFERENCES
 * ───────────────────────────────────────────────────────────────────────── */
function initTheme() {
  setTheme(currentTheme);
}

function setTheme(theme) {
  let applied = theme;
  if (theme === 'system') {
    applied = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', applied);
  currentTheme = theme;
  savePreferences();

  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-set-theme') === theme);
  });

  if (themeIconIndicator && themeTextIndicator) {
    if (applied === 'dark') {
      themeIconIndicator.textContent = '☀️';
      themeTextIndicator.textContent = 'Light Mode';
    } else {
      themeIconIndicator.textContent = '🌙';
      themeTextIndicator.textContent = 'Dark Mode';
    }
  }
}

function playAcousticHaptic(type = 'click') {
  if (!isAudioHapticsEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'complete' ? 650 : 500, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

function toggleAudioHaptics() {
  isAudioHapticsEnabled = !isAudioHapticsEnabled;
  savePreferences();
  updateHapticsUI();
  playAcousticHaptic('click');
  showToast(isAudioHapticsEnabled ? 'Audio Feedback On' : 'Audio Feedback Off');
}

function updateHapticsUI() {
  if (settingsHapticsToggle) settingsHapticsToggle.checked = isAudioHapticsEnabled;
  if (hapticsIconIndicator && hapticsTextIndicator) {
    hapticsIconIndicator.textContent = isAudioHapticsEnabled ? '🔊' : '🔇';
    hapticsTextIndicator.textContent = isAudioHapticsEnabled ? 'Haptics On' : 'Haptics Off';
  }
}

function loadPreferences() {
  try {
    const t = localStorage.getItem('medassist_theme');
    if (t) currentTheme = t;
    const h = localStorage.getItem('medassist_haptics');
    if (h !== null) isAudioHapticsEnabled = h === 'true';
  } catch (e) {}
  updateHapticsUI();
}

function savePreferences() {
  try {
    localStorage.setItem('medassist_theme', currentTheme);
    localStorage.setItem('medassist_haptics', String(isAudioHapticsEnabled));
  } catch (e) {}
}

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

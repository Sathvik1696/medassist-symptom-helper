/**
 * app.js — MedAssist Clinical Decision Support Controller
 * 
 * Orchestrates:
 * - Product Landing Page & Sticky Navbar Navigation
 * - Clinical Assessment Workspace (Intake Matrix & Dynamic Staging)
 * - 4-Stage ReAct Live Execution Progress Tracker
 * - Multi-Tab Clinical Dossier (Etiology, Protocol, Physician Guide, ReAct Trace)
 * - Web Speech API Voice Recognition & Audio Briefing Synthesizer
 * - Web Audio API Synthetic Acoustic Haptic Chimes
 * - Session Memory Buffer & Inspector Drawer
 * - Export Print & Clipboard Doctor Summary Generator
 */

import { executePipeline, executePipelineAsync } from './pipeline.js';
import { renderResult } from './renderer.js';
import { GEMINI_CONFIG } from './config.js';

/* ─────────────────────────────────────────────────────────────────────────
 * ANATOMICAL SYSTEM CLUSTERS & CAPSULE VAULT
 * ───────────────────────────────────────────────────────────────────────── */
const ANATOMICAL_SYSTEMS = [
  {
    id: 'neuro',
    name: 'Cranial & Neuro',
    icon: '🧠',
    symptoms: [
      { key: 'headache', label: 'Tension Headache', desc: 'Band-like pressure around head' },
      { key: 'migraine', label: 'Migraine with Aura', desc: 'Throbbing one-sided pain with light sensitivity' },
      { key: 'dizziness', label: 'Vertigo & Dizziness', desc: 'Spinning sensation or unsteadiness' },
      { key: 'brain fog', label: 'Cognitive Brain Fog', desc: 'Mental fatigue and focus difficulty' },
      { key: 'anxiety', label: 'Acute Stress & Anxiety', desc: 'Restlessness, racing thoughts' }
    ]
  },
  {
    id: 'cardio',
    name: 'Cardiopulmonary',
    icon: '🫀',
    symptoms: [
      { key: 'palpitations', label: 'Heart Palpitations', desc: 'Fluttering or racing heartbeat' },
      { key: 'chest tightness', label: 'Chest Tightness', desc: 'Mild constriction or pressure' },
      { key: 'rapid heartbeat', label: 'Rapid Heart Rate', desc: 'Tachycardia sensation during rest' }
    ]
  },
  {
    id: 'pulmonary',
    name: 'Respiratory',
    icon: '🫁',
    symptoms: [
      { key: 'cough', label: 'Persistent Cough', desc: 'Dry hacking or phlegm-producing' },
      { key: 'wheezing', label: 'Bronchial Wheezing', desc: 'Whistling sound during exhalation' },
      { key: 'congestion', label: 'Chest Congestion', desc: 'Mucus accumulation in airways' }
    ]
  },
  {
    id: 'gi',
    name: 'Gastrointestinal',
    icon: '🔬',
    symptoms: [
      { key: 'stomach pain', label: 'Abdominal Cramping', desc: 'Generalized stomach ache' },
      { key: 'nausea', label: 'Nausea & Queasiness', desc: 'Motion sickness or gastric upset' },
      { key: 'acid reflux', label: 'Heartburn / GERD', desc: 'Acid regurgitation into esophagus' }
    ]
  },
  {
    id: 'musculo',
    name: 'Musculoskeletal',
    icon: '🦴',
    symptoms: [
      { key: 'lower back pain', label: 'Lumbar Strain', desc: 'Ache across lower spine' },
      { key: 'neck stiffness', label: 'Cervical Tension', desc: 'Stiffness from postural strain' },
      { key: 'joint pain', label: 'Joint Stiffness', desc: 'Aching in knees, wrists, or shoulders' }
    ]
  },
  {
    id: 'derma',
    name: 'Dermatology',
    icon: '✨',
    symptoms: [
      { key: 'rash', label: 'Pruritic Rash', desc: 'Redness, hives, or itchy patches' },
      { key: 'dry skin', label: 'Eczema Flare', desc: 'Scaly patches with mild irritation' }
    ]
  },
  {
    id: 'ent',
    name: 'ENT & Sinus',
    icon: '👂',
    symptoms: [
      { key: 'sore throat', label: 'Pharyngeal Pain', desc: 'Scratchiness when swallowing' },
      { key: 'sinus pressure', label: 'Sinus Congestion', desc: 'Facial fullness and sinus ache' }
    ]
  },
  {
    id: 'systemic',
    name: 'Systemic / Viral',
    icon: '🌡️',
    symptoms: [
      { key: 'fatigue', label: 'Metabolic Fatigue', desc: 'Exhaustion unrelieved by rest' },
      { key: 'mild fever', label: 'Low-Grade Pyrexia', desc: 'Body warmth, chills, sweats' }
    ]
  }
];

/* ─────────────────────────────────────────────────────────────────────────
 * STATE MANAGEMENT
 * ───────────────────────────────────────────────────────────────────────── */
let conversationHistory = [];
let isProcessing = false;
let stagedSymptoms = new Set();
let activeSystemId = 'neuro';
let currentSeverity = 'Moderate';
let currentDuration = '1–3 Days';
let isAudioHapticsEnabled = true;
let isVoiceListening = false;
let speechRecognitionInstance = null;

/* ─────────────────────────────────────────────────────────────────────────
 * DOM REFERENCES
 * ───────────────────────────────────────────────────────────────────────── */
const siteHeader = document.getElementById('site-header');
const navLinks = document.getElementById('nav-links');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const emergencyOverlay = document.getElementById('emergency-overlay');
const emergencyDismiss = document.getElementById('emergency-dismiss');
const charCount = document.getElementById('char-count');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioStatusLabel = document.getElementById('audio-status-label');
const memoryDrawerBtn = document.getElementById('memory-drawer-btn');
const memoryDrawerBackdrop = document.getElementById('memory-drawer-backdrop');
const memoryDrawerClose = document.getElementById('memory-drawer-close');
const memoryItemsContainer = document.getElementById('memory-items-container');
const clearMemoryBtn = document.getElementById('clear-memory-btn');
const memoryCounter = document.getElementById('memory-counter');
const voiceInputBtn = document.getElementById('voice-input-btn');
const luxuryToast = document.getElementById('luxury-toast');
const cursorSpotlight = document.getElementById('cursor-spotlight');

// Staging UI elements
const sidebarSymptomsCount = document.getElementById('sidebar-symptoms-count');
const sidebarDurationVal = document.getElementById('sidebar-duration-val');
const sidebarSeverityVal = document.getElementById('sidebar-severity-val');
const sidebarRiskVal = document.getElementById('sidebar-risk-val');
const systemTabsContainer = document.getElementById('system-tabs-container');
const symptomCapsulesContainer = document.getElementById('symptom-capsules-container');
const durationSelect = document.getElementById('duration-select');
const severitySelect = document.getElementById('severity-select');

/* ─────────────────────────────────────────────────────────────────────────
 * INITIALIZATION
 * ───────────────────────────────────────────────────────────────────────── */
function init() {
  loadHistory();
  initCursorSpotlight();
  initVoiceRecognition();
  initHeaderNavigation();
  initAnatomicalSelector();

  // Event Listeners
  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keydown', handleKeyDown);
  userInput.addEventListener('input', handleInputChange);
  clearBtn.addEventListener('click', clearConversation);

  if (emergencyDismiss) {
    emergencyDismiss.addEventListener('click', dismissEmergencyOverlay);
  }

  // Audio Haptics Toggle
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleAudioHaptics);
  }

  // Memory Drawer
  if (memoryDrawerBtn) {
    memoryDrawerBtn.addEventListener('click', openMemoryDrawer);
  }
  if (memoryDrawerClose) {
    memoryDrawerClose.addEventListener('click', closeMemoryDrawer);
  }
  if (memoryDrawerBackdrop) {
    memoryDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === memoryDrawerBackdrop) closeMemoryDrawer();
    });
  }
  if (clearMemoryBtn) {
    clearMemoryBtn.addEventListener('click', clearMemoryBuffer);
  }

  // Duration & Severity select changes
  if (durationSelect) {
    durationSelect.addEventListener('change', (e) => {
      currentDuration = e.target.value;
      if (sidebarDurationVal) sidebarDurationVal.textContent = currentDuration;
      playAcousticHaptic('click');
    });
  }

  if (severitySelect) {
    severitySelect.addEventListener('change', (e) => {
      currentSeverity = e.target.value;
      if (sidebarSeverityVal) sidebarSeverityVal.textContent = currentSeverity;
      updateRiskGauge();
      playAcousticHaptic('click');
    });
  }

  // Initial Clinical Stream State
  if (conversationHistory.length === 0) {
    showWelcomeCard();
  } else {
    replayHistory();
  }

  updateMemoryCounter();
}

/* ─────────────────────────────────────────────────────────────────────────
 * STICKY NAVBAR & NAVIGATION
 * ───────────────────────────────────────────────────────────────────────── */
function initHeaderNavigation() {
  // Sticky Navbar Scroll Elevation
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  });

  // Mobile Menu Toggle
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const expanded = navLinks.classList.contains('mobile-open');
      mobileMenuToggle.setAttribute('aria-expanded', expanded);
    });

    // Close mobile menu on nav link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function highlightActiveNavLink() {
  const sections = ['hero', 'how-it-works', 'workspace', 'architecture', 'features', 'safety'];
  const scrollPos = window.scrollY + 120;

  for (const id of sections) {
    const el = document.getElementById(id);
    if (el) {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
        break;
      }
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * ANATOMICAL SELECTOR & SYMPTOM CAPSULE VAULT
 * ───────────────────────────────────────────────────────────────────────── */
function initAnatomicalSelector() {
  if (!systemTabsContainer) return;
  systemTabsContainer.innerHTML = '';

  ANATOMICAL_SYSTEMS.forEach(sys => {
    const chip = document.createElement('button');
    chip.className = `anatomical-sys-chip ${sys.id === activeSystemId ? 'active' : ''}`;
    chip.innerHTML = `<span>${sys.icon}</span> ${sys.name}`;
    chip.addEventListener('click', () => {
      playAcousticHaptic('click');
      activeSystemId = sys.id;
      document.querySelectorAll('.anatomical-sys-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderSymptomCapsules(sys.id);
    });
    systemTabsContainer.appendChild(chip);
  });

  renderSymptomCapsules(activeSystemId);
}

function renderSymptomCapsules(systemId) {
  if (!symptomCapsulesContainer) return;
  symptomCapsulesContainer.innerHTML = '';

  const sys = ANATOMICAL_SYSTEMS.find(s => s.id === systemId) || ANATOMICAL_SYSTEMS[0];
  sys.symptoms.forEach(sym => {
    const isSelected = stagedSymptoms.has(sym.label);
    const item = document.createElement('div');
    item.className = `symptom-capsule-item ${isSelected ? 'selected' : ''}`;
    item.innerHTML = `
      <div>
        <strong>${sym.label}</strong>
        <div style="font-size: 0.68rem; color: var(--text-muted);">${sym.desc}</div>
      </div>
      <span style="font-size: 0.75rem; color: var(--medical-teal); font-weight: bold;">+ Add</span>
    `;

    item.addEventListener('click', () => {
      playAcousticHaptic('stage');
      addSymptomToInput(sym.label);
    });

    symptomCapsulesContainer.appendChild(item);
  });
}

function addSymptomToInput(symptomLabel) {
  stagedSymptoms.add(symptomLabel);
  if (sidebarSymptomsCount) {
    sidebarSymptomsCount.textContent = `${stagedSymptoms.size} staged`;
  }

  const cur = userInput.value.trim();
  if (cur.length === 0) {
    userInput.value = `I am experiencing ${symptomLabel.toLowerCase()}`;
  } else if (!cur.toLowerCase().includes(symptomLabel.toLowerCase())) {
    userInput.value = `${cur}, along with ${symptomLabel.toLowerCase()}`;
  }

  handleInputChange();
  userInput.focus();
  showToast(`Added ${symptomLabel}`);
}

function updateRiskGauge() {
  if (!sidebarRiskVal) return;
  if (currentSeverity === 'Severe' || stagedSymptoms.size >= 3) {
    sidebarRiskVal.textContent = 'MODERATE (Clinical review)';
    sidebarRiskVal.className = 'stat-value severity-badge-mod';
  } else {
    sidebarRiskVal.textContent = 'LOW (Safe / Home care)';
    sidebarRiskVal.className = 'stat-value risk-badge-low';
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * CURSOR SPOTLIGHT TRACKER
 * ───────────────────────────────────────────────────────────────────────── */
function initCursorSpotlight() {
  if (!cursorSpotlight) return;
  window.addEventListener('pointermove', (e) => {
    cursorSpotlight.style.left = e.clientX + 'px';
    cursorSpotlight.style.top = e.clientY + 'px';
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * WEB AUDIO SYNTHETIC ACOUSTIC HAPTICS
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
    } else if (type === 'stage') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'complete') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.15);
      });
    }
  } catch (e) {}
}

function toggleAudioHaptics() {
  isAudioHapticsEnabled = !isAudioHapticsEnabled;
  if (audioStatusLabel) {
    audioStatusLabel.textContent = isAudioHapticsEnabled ? 'Haptics On' : 'Haptics Off';
  }
  playAcousticHaptic('click');
  showToast(isAudioHapticsEnabled ? 'Tactile Haptics Enabled' : 'Tactile Haptics Muted');
}

/* ─────────────────────────────────────────────────────────────────────────
 * WEB SPEECH VOICE INPUT
 * ───────────────────────────────────────────────────────────────────────── */
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
    showToast('🎙️ Listening to your symptoms...');
  };

  speechRecognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      userInput.value = userInput.value ? `${userInput.value} ${transcript}` : transcript;
      handleInputChange();
      showToast('Voice transcribed');
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
 * SPEECH SYNTHESIS BRIEFING (LISTEN / STOP)
 * ───────────────────────────────────────────────────────────────────────── */
let activeAudioDossierId = null;

function speakDossierBriefing(dossierId, buttonElement) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.');
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (activeAudioDossierId === dossierId) {
      activeAudioDossierId = null;
      if (buttonElement) {
        buttonElement.classList.remove('active-audio');
        buttonElement.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Listen`;
      }
      showToast('Audio Briefing Halted');
      return;
    }
  }

  const dossierCard = document.getElementById(dossierId);
  if (!dossierCard) return;

  const titleEl = dossierCard.querySelector('.dossier-title');
  const causes = Array.from(dossierCard.querySelectorAll('.causes-list li')).map(li => li.textContent);
  const care = Array.from(dossierCard.querySelectorAll('.protocol-list li')).map(li => li.textContent);

  const script = `Clinical Assessment Briefing. ${titleEl ? titleEl.textContent : ''}. Key Causes: ${causes.slice(0, 2).join('. ')}. Recommended Protocol: ${care.slice(0, 2).join('. ')}.`;

  const utterance = new SpeechSynthesisUtterance(script);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  activeAudioDossierId = dossierId;
  if (buttonElement) {
    buttonElement.classList.add('active-audio');
    buttonElement.innerHTML = `⏹️ Stop Audio`;
  }

  utterance.onend = () => {
    activeAudioDossierId = null;
    if (buttonElement) {
      buttonElement.classList.remove('active-audio');
      buttonElement.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Listen`;
    }
  };

  window.speechSynthesis.speak(utterance);
  showToast('Playing Clinical Briefing');
}

/* ─────────────────────────────────────────────────────────────────────────
 * CLINICAL STREAM & PIPELINE EXECUTION
 * ───────────────────────────────────────────────────────────────────────── */
function showWelcomeCard() {
  if (!chatMessages) return;
  chatMessages.innerHTML = `
    <div class="clinical-dossier-card" id="welcome-card" style="border-left: 4px solid var(--medical-teal);">
      <div class="dossier-header">
        <div class="dossier-title-area">
          <div class="dossier-seal">🩺</div>
          <div>
            <h3 class="dossier-title">Welcome to MedAssist Clinical Decision Support</h3>
            <div class="dossier-subtitle">Ready for symptom intake & agentic assessment</div>
          </div>
        </div>
      </div>
      <div class="dossier-tab-content">
        <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
          MedAssist provides grounded, multi-stage clinical decision intelligence for non-emergent health symptoms. Describe what you're experiencing or choose an anatomical quick-select option on the left.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button class="anatomical-sys-chip" onclick="document.getElementById('user-input').value='I have a throbbing headache on my left temple after working in the sun'; document.getElementById('user-input').focus();">
            💡 Sample: Left Temple Headache & Sun
          </button>
          <button class="anatomical-sys-chip" onclick="document.getElementById('user-input').value='I have had a dry cough with throat scratchiness for 3 days'; document.getElementById('user-input').focus();">
            💡 Sample: Dry Cough & Sore Throat
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text || isProcessing) return;

  playAcousticHaptic('stage');
  userInput.value = '';
  handleInputChange();

  processSymptoms(text);
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function handleInputChange() {
  const len = userInput.value.length;
  if (charCount) charCount.textContent = `${len}/1000`;
  sendBtn.disabled = len === 0 || isProcessing;

  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

async function processSymptoms(text) {
  isProcessing = true;
  sendBtn.disabled = true;
  userInput.disabled = true;

  // Animate 4-Stage Progress Tracker
  updateStageProgress(1);
  await delay(300);

  updateStageProgress(2);
  await delay(350);

  updateStageProgress(3);
  await delay(350);

  updateStageProgress(4);
  await delay(250);

  // Execute pipeline
  const chatHistory = conversationHistory.filter(m => m.role === 'user');
  const result = await executePipelineAsync(text, chatHistory, {
    apiKey: GEMINI_CONFIG.apiKey,
    model: GEMINI_CONFIG.model
  });

  // Handle emergency modal
  if (result.type === 'emergency') {
    showEmergencyOverlay(result);
  }

  // Render Clinical Dossier
  const dossierId = 'dossier-' + Date.now();
  const html = renderResult(result, dossierId);

  // Replace welcome card or append
  const welcomeCard = document.getElementById('welcome-card');
  if (welcomeCard) welcomeCard.remove();

  const msgWrapper = document.createElement('div');
  msgWrapper.innerHTML = html;
  chatMessages.appendChild(msgWrapper.firstElementChild);

  bindDossierEvents(dossierId);
  playAcousticHaptic('complete');

  // Update session history
  conversationHistory.push({ role: 'user', content: text, timestamp: new Date().toISOString() });
  conversationHistory.push({ role: 'assistant', content: text, type: result.type, timestamp: new Date().toISOString() });
  saveHistory();
  updateMemoryCounter();

  // Reset Stage Tracker to Ready
  setTimeout(() => updateStageProgress(0), 1000);

  isProcessing = false;
  sendBtn.disabled = false;
  userInput.disabled = false;
  userInput.focus();

  // Smooth scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateStageProgress(stageNumber) {
  const steps = [
    document.getElementById('stage-step-0'),
    document.getElementById('stage-step-1'),
    document.getElementById('stage-step-2'),
    document.getElementById('stage-step-3')
  ];

  steps.forEach((step, idx) => {
    if (!step) return;
    if (stageNumber === 0) {
      step.className = `stage-step-pill ${idx === 0 ? 'active' : ''}`;
    } else if (idx + 1 < stageNumber) {
      step.className = 'stage-step-pill done';
    } else if (idx + 1 === stageNumber) {
      step.className = 'stage-step-pill active';
    } else {
      step.className = 'stage-step-pill';
    }
  });
}

function bindDossierEvents(dossierId) {
  const dossierEl = document.getElementById(dossierId);
  if (!dossierEl) return;

  // Tab switching
  const tabs = dossierEl.querySelectorAll('.dossier-tab-btn');
  const contents = dossierEl.querySelectorAll('.dossier-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playAcousticHaptic('click');
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const activeContent = dossierEl.querySelector(`.tab-content-${target}`);
      if (activeContent) activeContent.style.display = 'block';
    });
  });

  // Action buttons
  const copyBtn = dossierEl.querySelector('.copy-report-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      const text = dossierEl.innerText;
      navigator.clipboard.writeText(text).then(() => showToast('Summary Copied to Clipboard'));
    });
  }

  const printBtn = dossierEl.querySelector('.print-dossier-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      window.print();
    });
  }

  const speakBtn = dossierEl.querySelector('.speak-dossier-btn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      speakDossierBriefing(dossierId, speakBtn);
    });
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * EMERGENCY OVERLAY & MEMORY DRAWER
 * ───────────────────────────────────────────────────────────────────────── */
function showEmergencyOverlay(result) {
  if (!emergencyOverlay) return;
  emergencyOverlay.classList.add('open');
}

function dismissEmergencyOverlay() {
  if (!emergencyOverlay) return;
  emergencyOverlay.classList.remove('open');
  playAcousticHaptic('click');
}

function openMemoryDrawer() {
  playAcousticHaptic('click');
  renderMemoryDrawer();
  if (memoryDrawerBackdrop) memoryDrawerBackdrop.classList.add('open');
}

function closeMemoryDrawer() {
  playAcousticHaptic('click');
  if (memoryDrawerBackdrop) memoryDrawerBackdrop.classList.remove('open');
}

function renderMemoryDrawer() {
  if (!memoryItemsContainer) return;
  memoryItemsContainer.innerHTML = '';

  const userMessages = conversationHistory.filter(m => m.role === 'user');
  if (userMessages.length === 0) {
    memoryItemsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">No context recorded in this session yet.</div>';
    return;
  }

  userMessages.forEach((msg, i) => {
    const item = document.createElement('div');
    item.className = 'memory-item-capsule';
    item.innerHTML = `
      <div>
        <strong style="color: var(--primary-navy); display: block; font-size: 0.8rem;">Turn ${i + 1}</strong>
        <span style="color: var(--text-secondary); font-size: 0.78rem;">${escapeHtml(msg.content)}</span>
      </div>
      <span style="font-size: 0.68rem; color: var(--text-muted);">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    memoryItemsContainer.appendChild(item);
  });
}

function clearMemoryBuffer() {
  conversationHistory = [];
  stagedSymptoms.clear();
  localStorage.removeItem('medassist_session_history');
  updateMemoryCounter();
  renderMemoryDrawer();
  showWelcomeCard();
  showToast('Session Memory Buffer Cleared');
}

function updateMemoryCounter() {
  const count = conversationHistory.filter(m => m.role === 'user').length;
  if (memoryCounter) memoryCounter.textContent = count;
  if (sidebarSymptomsCount) {
    sidebarSymptomsCount.textContent = count > 0 ? `${count} turn(s) recorded` : 'None staged';
  }
}

function clearConversation() {
  playAcousticHaptic('click');
  clearMemoryBuffer();
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('medassist_session_history');
    if (saved) conversationHistory = JSON.parse(saved);
  } catch (e) {
    conversationHistory = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem('medassist_session_history', JSON.stringify(conversationHistory));
  } catch (e) {}
}

function replayHistory() {
  if (!chatMessages) return;
  chatMessages.innerHTML = '';
  showWelcomeCard();
}

/* ─────────────────────────────────────────────────────────────────────────
 * UTILITY HELPERS
 * ───────────────────────────────────────────────────────────────────────── */
function showToast(text) {
  if (!luxuryToast) return;
  luxuryToast.textContent = text;
  luxuryToast.classList.add('show');
  setTimeout(() => luxuryToast.classList.remove('show'), 2600);
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', init);

/**
 * app.js — MedAssist Concierge Symptom Intelligence Controller
 * 
 * Orchestrates:
 * - Interactive Anatomical Body System Explorer & Symptom Capsule Vault
 * - Biometric Matrix, Live Risk Gauge & Context Staging
 * - Multi-Tab Luxury Clinical Dossier State & Tab Switching
 * - Web Speech API Voice Recognition & Audio Briefing Synthesizer
 * - Web Audio API Synthetic Acoustic Haptic Chimes
 * - Session Memory Buffer & Inspector Drawer
 * - Export & Clipboard Doctor Summary Generator
 */

import { executePipeline } from './pipeline.js';
import { renderResult, renderPipelineRunner } from './renderer.js';

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
      { key: 'brain fog', label: 'Cognitive Brain Fog', desc: 'Difficulty concentrating and mental fatigue' },
      { key: 'insomnia', label: 'Sleep Disruption', desc: 'Difficulty falling or staying asleep' },
      { key: 'anxiety', label: 'Acute Anxiety & Stress', desc: 'Restlessness, racing thoughts, muscle tension' }
    ]
  },
  {
    id: 'cardio',
    name: 'Cardiopulmonary',
    icon: '🫀',
    symptoms: [
      { key: 'palpitations', label: 'Heart Palpitations', desc: 'Fluttering or racing heartbeat' },
      { key: 'chest tightness', label: 'Chest Tightness', desc: 'Mild constriction or pressure sensation' },
      { key: 'shortness of breath', label: 'Shortness of Breath', desc: 'Dyspnea or labored breathing' },
      { key: 'rapid heartbeat', label: 'Rapid Heart Rate', desc: 'Tachycardia sensation during rest' }
    ]
  },
  {
    id: 'pulmonary',
    name: 'Respiratory',
    icon: '🫁',
    symptoms: [
      { key: 'cough', label: 'Persistent Cough', desc: 'Dry hacking or phlegm-producing cough' },
      { key: 'wheezing', label: 'Bronchial Wheezing', desc: 'Whistling sound during exhalation' },
      { key: 'congestion', label: 'Chest Congestion', desc: 'Heavy mucus accumulation in airways' }
    ]
  },
  {
    id: 'gi',
    name: 'Gastrointestinal',
    icon: '🔬',
    symptoms: [
      { key: 'stomach pain', label: 'Abdominal Cramping', desc: 'Generalized stomach ache or spasm' },
      { key: 'nausea', label: 'Nausea & Queasiness', desc: 'Persistent stomach upset or vomiting urge' },
      { key: 'acid reflux', label: 'Acid Reflux / Heartburn', desc: 'Burning sensation in chest or throat' },
      { key: 'bloating', label: 'Gas & Distension', desc: 'Fullness and abdominal swelling' },
      { key: 'diarrhea', label: 'Acute Diarrhea', desc: 'Frequent loose watery stools' }
    ]
  },
  {
    id: 'msk',
    name: 'Musculoskeletal',
    icon: '🦴',
    symptoms: [
      { key: 'back pain', label: 'Lumbar Back Pain', desc: 'Lower spine stiffness or muscular ache' },
      { key: 'neck pain', label: 'Cervical Tension', desc: 'Stiff neck and shoulder tightness' },
      { key: 'joint pain', label: 'Joint Arthralgia', desc: 'Knee, hip, or finger joint stiffness' },
      { key: 'muscle ache', label: 'Generalized Myalgia', desc: 'Widespread body aches from fatigue/exercise' }
    ]
  },
  {
    id: 'derm',
    name: 'Dermatology',
    icon: '🧬',
    symptoms: [
      { key: 'rash', label: 'Erythematous Rash', desc: 'Red irritated patches on skin' },
      { key: 'hives', label: 'Urticaria / Hives', desc: 'Raised itchy welts from allergic reaction' },
      { key: 'itching', label: 'Pruritus / Itch', desc: 'Intense localized or generalized itching' }
    ]
  },
  {
    id: 'ent',
    name: 'ENT & Sinus',
    icon: '👂',
    symptoms: [
      { key: 'sore throat', label: 'Pharyngitis / Sore Throat', desc: 'Pain or scratchiness when swallowing' },
      { key: 'runny nose', label: 'Sinus Congestion', desc: 'Blocked nasal passages with rhinorrhea' },
      { key: 'ear pain', label: 'Otalgia / Earache', desc: 'Pressure or throbbing inside ear canal' }
    ]
  },
  {
    id: 'systemic',
    name: 'Systemic & Vitals',
    icon: '⚡',
    symptoms: [
      { key: 'fever', label: 'Elevated Temperature', desc: 'Mild fever, chills, or sweating' },
      { key: 'fatigue', label: 'Chronic Exhaustion', desc: 'Profound lack of energy despite rest' },
      { key: 'dehydration', label: 'Dehydration Signs', desc: 'Dry mouth, dark urine, mild dizziness' }
    ]
  }
];

/* Curated Quick Clinical Scenarios */
const CURATED_SCENARIOS = [
  {
    title: 'Migraine with Light Sensitivity',
    desc: 'Unilateral throbbing headache for 2 days',
    icon: '🤕',
    prompt: "I have a severe throbbing headache on the right side of my head for 2 days, with intense light sensitivity and mild nausea."
  },
  {
    title: 'Acute Viral Gastroenteritis',
    desc: 'Stomach cramping & nausea for 24h',
    icon: '🤢',
    prompt: "I've had sharp stomach pain, persistent nausea, and mild diarrhea since yesterday morning after eating out."
  },
  {
    title: 'Bronchial Cough & Sore Throat',
    desc: 'Dry cough with fever for 4 days',
    icon: '😷',
    prompt: "I have a persistent dry cough, painful sore throat when swallowing, and low-grade fever around 99.8F for 4 days."
  },
  {
    title: 'Post-Exertional Lumbar Strain',
    desc: 'Lower back ache from heavy lifting',
    icon: '🦴',
    prompt: "My lower back has a deep dull ache and stiffness for 3 days after lifting heavy furniture, worse when bending over."
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
let activePatientFactors = new Set();
let isAudioHapticsEnabled = true;
let isVoiceListening = false;
let speechRecognitionInstance = null;

/* ─────────────────────────────────────────────────────────────────────────
 * DOM REFERENCES
 * ───────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────
 * INITIALIZATION
 * ───────────────────────────────────────────────────────────────────────── */
function init() {
  loadHistory();
  initCursorSpotlight();
  initVoiceRecognition();

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

  // Brand Home click to return to Studio
  const brandHomeBtn = document.getElementById('brand-home-btn');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => {
      showStudioHero();
      userInput.focus();
    });
  }

  // Initial View
  if (conversationHistory.length === 0) {
    showStudioHero();
  } else {
    replayHistory();
  }

  updateMemoryCounter();
  userInput.focus();
}

/* ─────────────────────────────────────────────────────────────────────────
 * CURSOR SPOTLIGHT TRACKER
 * ───────────────────────────────────────────────────────────────────────── */
function initCursorSpotlight() {
  if (!cursorSpotlight) return;
  window.addEventListener('pointermove', (e) => {
    cursorSpotlight.style.left = `${e.clientX}px`;
    cursorSpotlight.style.top = `${e.clientY}px`;
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * ACOUSTIC HAPTICS (SYNTHESIZER CHIMES VIA WEB AUDIO API)
 * ───────────────────────────────────────────────────────────────────────── */
let audioCtx = null;

function playAcousticHaptic(type = 'click') {
  if (!isAudioHapticsEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'stage') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'complete') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.08); // B5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Audio context not allowed or blocked
  }
}

function toggleAudioHaptics() {
  isAudioHapticsEnabled = !isAudioHapticsEnabled;
  if (audioStatusLabel) {
    audioStatusLabel.textContent = isAudioHapticsEnabled ? 'Haptics On' : 'Haptics Off';
  }
  audioToggleBtn.classList.toggle('active', isAudioHapticsEnabled);
  showToast(isAudioHapticsEnabled ? 'Tactile Acoustic Haptics Enabled' : 'Acoustic Haptics Muted');
  if (isAudioHapticsEnabled) playAcousticHaptic('click');
}

/* ─────────────────────────────────────────────────────────────────────────
 * SPEECH RECOGNITION (VOICE INPUT CONCIERGE)
 * ───────────────────────────────────────────────────────────────────────── */
function initVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec || !voiceInputBtn) return;

  speechRecognitionInstance = new SpeechRec();
  speechRecognitionInstance.continuous = false;
  speechRecognitionInstance.interimResults = false;
  speechRecognitionInstance.lang = 'en-US';

  speechRecognitionInstance.onstart = () => {
    isVoiceListening = true;
    voiceInputBtn.classList.add('listening');
    showToast('🎙️ Listening... Describe your symptoms');
    playAcousticHaptic('stage');
  };

  speechRecognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      userInput.value = (userInput.value ? userInput.value + ' ' : '') + transcript;
      handleInputChange();
      showToast('Voice transcribed');
      playAcousticHaptic('click');
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
    if (!isVoiceListening) {
      try { speechRecognitionInstance.start(); } catch (e) { /* ignore */ }
    } else {
      speechRecognitionInstance.stop();
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * STUDIO HERO & INTERACTIVE ANATOMICAL CONSOLE
 * ───────────────────────────────────────────────────────────────────────── */
function showStudioHero() {
  const activeSystem = ANATOMICAL_SYSTEMS.find(s => s.id === activeSystemId) || ANATOMICAL_SYSTEMS[0];

  const systemsTabsHtml = ANATOMICAL_SYSTEMS.map(sys => `
    <button class="system-tab-btn ${sys.id === activeSystemId ? 'active' : ''}" data-system="${sys.id}">
      <span>${sys.icon}</span>
      <span>${sys.name}</span>
    </button>
  `).join('');

  const capsulesHtml = activeSystem.symptoms.map(sym => `
    <div class="symptom-capsule ${stagedSymptoms.has(sym.key) ? 'staged' : ''}" data-symptom-key="${sym.key}">
      <span>${activeSystem.icon}</span>
      <span>${sym.label}</span>
    </div>
  `).join('');

  const scenariosHtml = CURATED_SCENARIOS.map((sc, idx) => `
    <div class="curated-scenario-card" data-scenario-idx="${idx}">
      <span class="scenario-icon">${sc.icon}</span>
      <div class="scenario-details">
        <span class="scenario-title">${sc.title}</span>
        <span class="scenario-desc">${sc.desc}</span>
      </div>
    </div>
  `).join('');

  const heroHtml = `
    <div class="studio-hero-container" id="studio-hero">
      
      <!-- Luxury Hero Title -->
      <div class="studio-hero-header">
        <div class="hero-luxury-badge">
          <span>✦</span> Concierge Clinical Intelligence <span>✦</span>
        </div>
        <h2 class="studio-main-heading">Precision Symptom Triage</h2>
        <p class="studio-sub-heading">
          Select anatomical regions or describe symptoms below. Our 4-stage ReAct engine analyzes clinical entities, enforces emergency triage, and compiles evidence-based dossiers.
        </p>
      </div>

      <!-- Interactive Anatomical Console Grid -->
      <div class="interactive-studio-grid">
        
        <!-- Left: Anatomical Region Selector & Capsule Vault -->
        <div class="studio-card">
          <div class="studio-card-header">
            <div class="studio-card-title">
              <span>🩺</span> Anatomical Body Systems
            </div>
            <span class="studio-card-tag" id="staged-count-badge">${stagedSymptoms.size} Staged</span>
          </div>

          <!-- Anatomical System Switcher -->
          <div class="anatomical-systems-nav" id="anatomical-systems-nav">
            ${systemsTabsHtml}
          </div>

          <!-- Clickable Symptom Capsules -->
          <div class="symptom-capsules-grid" id="symptom-capsules-grid">
            ${capsulesHtml}
          </div>
        </div>

        <!-- Right: Biometrics Context & Risk Gauge -->
        <div class="studio-card biometrics-console">
          
          <!-- Severity Segmenter -->
          <div class="biometric-group">
            <span class="biometric-label">Reported Severity</span>
            <div class="segmented-pill-selector" id="severity-selector">
              <button class="segment-btn ${currentSeverity === 'Mild' ? 'active' : ''}" data-val="Mild">Mild</button>
              <button class="segment-btn ${currentSeverity === 'Moderate' ? 'active' : ''}" data-val="Moderate">Moderate</button>
              <button class="segment-btn ${currentSeverity === 'Severe' ? 'active' : ''}" data-val="Severe">Severe</button>
            </div>
          </div>

          <!-- Duration Segmenter -->
          <div class="biometric-group">
            <span class="biometric-label">Onset / Duration</span>
            <div class="segmented-pill-selector" id="duration-selector">
              <button class="segment-btn ${currentDuration === '< 24 Hours' ? 'active' : ''}" data-val="< 24 Hours">&lt; 24h</button>
              <button class="segment-btn ${currentDuration === '1–3 Days' ? 'active' : ''}" data-val="1–3 Days">1–3d</button>
              <button class="segment-btn ${currentDuration === '1–2 Weeks' ? 'active' : ''}" data-val="1–2 Weeks">1–2w</button>
              <button class="segment-btn ${currentDuration === 'Chronic' ? 'active' : ''}" data-val="Chronic">&gt; 1mo</button>
            </div>
          </div>

          <!-- Patient Context Chips -->
          <div class="biometric-group">
            <span class="biometric-label">Patient Clinical Profile</span>
            <div class="patient-factors-wrap" id="patient-factors-wrap">
              <span class="factor-chip ${activePatientFactors.has('Asthma') ? 'active' : ''}" data-factor="Asthma">Asthma</span>
              <span class="factor-chip ${activePatientFactors.has('Hypertension') ? 'active' : ''}" data-factor="Hypertension">Hypertension</span>
              <span class="factor-chip ${activePatientFactors.has('Diabetes') ? 'active' : ''}" data-factor="Diabetes">Diabetes</span>
              <span class="factor-chip ${activePatientFactors.has('Senior') ? 'active' : ''}" data-factor="Senior">Senior (65+)</span>
              <span class="factor-chip ${activePatientFactors.has('Pregnancy') ? 'active' : ''}" data-factor="Pregnancy">Pregnancy</span>
            </div>
          </div>

          <!-- Real-Time Risk Gauge -->
          <div class="live-risk-gauge">
            <div class="gauge-info">
              <span class="gauge-label">Live Triage Risk</span>
              <span class="gauge-status" id="gauge-risk-label">${calculateLiveRisk()}</span>
            </div>
            <div class="gauge-bar-wrap">
              <div class="gauge-bar-fill" id="gauge-bar-fill" style="width: ${getGaugeFillWidth()};"></div>
            </div>
          </div>

          <!-- Analyze Staged Button -->
          <button class="analyze-portfolio-btn" id="analyze-staged-btn" ${stagedSymptoms.size === 0 ? 'disabled' : ''}>
            <span>✦</span> Analyze Staged Symptoms (${stagedSymptoms.size})
          </button>
        </div>

      </div>

      <!-- Curated Clinical Cases Section -->
      <div class="curated-scenarios-section">
        <div class="curated-scenarios-header">
          Curated Clinical Inquiries & Reference Cases
        </div>
        <div class="curated-scenarios-grid">
          ${scenariosHtml}
        </div>
      </div>

    </div>
  `;

  chatMessages.innerHTML = heroHtml;
  bindStudioHeroEvents();
}

function bindStudioHeroEvents() {
  // Anatomical System Tab Click
  document.querySelectorAll('.system-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSystemId = btn.dataset.system;
      playAcousticHaptic('click');
      updateSymptomCapsules();
      document.querySelectorAll('.system-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.system === activeSystemId));
    });
  });

  // Symptom Capsules Delegation
  bindCapsuleClicks();

  // Severity Selector
  document.querySelectorAll('#severity-selector .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSeverity = btn.dataset.val;
      playAcousticHaptic('click');
      document.querySelectorAll('#severity-selector .segment-btn').forEach(b => b.classList.toggle('active', b.dataset.val === currentSeverity));
      updateRiskGauge();
    });
  });

  // Duration Selector
  document.querySelectorAll('#duration-selector .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDuration = btn.dataset.val;
      playAcousticHaptic('click');
      document.querySelectorAll('#duration-selector .segment-btn').forEach(b => b.classList.toggle('active', b.dataset.val === currentDuration));
    });
  });

  // Patient Factors
  document.querySelectorAll('#patient-factors-wrap .factor-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const factor = chip.dataset.factor;
      playAcousticHaptic('click');
      if (activePatientFactors.has(factor)) {
        activePatientFactors.delete(factor);
        chip.classList.remove('active');
      } else {
        activePatientFactors.add(factor);
        chip.classList.add('active');
      }
      updateRiskGauge();
    });
  });

  // Analyze Staged Button
  const analyzeBtn = document.getElementById('analyze-staged-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      if (stagedSymptoms.size === 0) return;
      playAcousticHaptic('stage');

      const symptomsList = Array.from(stagedSymptoms).join(', ');
      let promptText = `I am experiencing ${symptomsList} with ${currentSeverity.toLowerCase()} severity for ${currentDuration}.`;
      if (activePatientFactors.size > 0) {
        promptText += ` Patient factors: ${Array.from(activePatientFactors).join(', ')}.`;
      }

      userInput.value = promptText;
      handleInputChange();
      handleSend();
    });
  }

  // Curated Scenario Cards
  document.querySelectorAll('.curated-scenario-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.scenarioIdx);
      const scenario = CURATED_SCENARIOS[idx];
      if (scenario) {
        playAcousticHaptic('stage');
        userInput.value = scenario.prompt;
        handleInputChange();
        handleSend();
      }
    });
  });
}

function updateSymptomCapsules() {
  const activeSystem = ANATOMICAL_SYSTEMS.find(s => s.id === activeSystemId) || ANATOMICAL_SYSTEMS[0];
  const container = document.getElementById('symptom-capsules-grid');
  if (!container) return;

  container.innerHTML = activeSystem.symptoms.map(sym => `
    <div class="symptom-capsule ${stagedSymptoms.has(sym.key) ? 'staged' : ''}" data-symptom-key="${sym.key}">
      <span>${activeSystem.icon}</span>
      <span>${sym.label}</span>
    </div>
  `).join('');

  bindCapsuleClicks();
}

function bindCapsuleClicks() {
  document.querySelectorAll('.symptom-capsule').forEach(capsule => {
    capsule.addEventListener('click', () => {
      const key = capsule.dataset.symptomKey;
      if (stagedSymptoms.has(key)) {
        stagedSymptoms.delete(key);
        capsule.classList.remove('staged');
        playAcousticHaptic('click');
      } else {
        stagedSymptoms.add(key);
        capsule.classList.add('staged');
        playAcousticHaptic('stage');
      }

      // Update badge & analyze button
      const countBadge = document.getElementById('staged-count-badge');
      if (countBadge) countBadge.textContent = `${stagedSymptoms.size} Staged`;

      const analyzeBtn = document.getElementById('analyze-staged-btn');
      if (analyzeBtn) {
        analyzeBtn.disabled = stagedSymptoms.size === 0;
        analyzeBtn.innerHTML = `<span>✦</span> Analyze Staged Symptoms (${stagedSymptoms.size})`;
      }

      updateRiskGauge();
    });
  });
}

function calculateLiveRisk() {
  if (currentSeverity === 'Severe' || activePatientFactors.size >= 2 || stagedSymptoms.size >= 3) {
    return 'ELEVATED RISK';
  }
  return 'NORMAL BASELINE';
}

function getGaugeFillWidth() {
  if (currentSeverity === 'Severe' || activePatientFactors.size >= 2 || stagedSymptoms.size >= 3) {
    return '75%';
  }
  return '25%';
}

function updateRiskGauge() {
  const label = document.getElementById('gauge-risk-label');
  const fill = document.getElementById('gauge-bar-fill');
  if (!label || !fill) return;

  const isElevated = currentSeverity === 'Severe' || activePatientFactors.size >= 2 || stagedSymptoms.size >= 3;
  label.textContent = isElevated ? 'ELEVATED RISK' : 'NORMAL BASELINE';
  label.style.color = isElevated ? 'var(--gold-400)' : 'var(--emerald-400)';
  fill.style.width = isElevated ? '75%' : '25%';
  fill.style.background = isElevated ? 'linear-gradient(90deg, var(--gold-400), #f59e0b)' : 'linear-gradient(90deg, var(--emerald-400), var(--gold-400))';
}

/* ─────────────────────────────────────────────────────────────────────────
 * MESSAGE HANDLING & PIPELINE EXECUTION
 * ───────────────────────────────────────────────────────────────────────── */
function handleSend() {
  const text = userInput.value.trim();
  if (!text || isProcessing) return;

  // Remove hero if present
  const hero = document.getElementById('studio-hero');
  if (hero) hero.remove();

  playAcousticHaptic('stage');

  addMessage('user', text);
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
  userInput.style.height = Math.min(userInput.scrollHeight, 130) + 'px';
}

async function processSymptoms(text) {
  isProcessing = true;
  sendBtn.disabled = true;
  userInput.disabled = true;

  // Show animated ReAct pipeline stage runner
  const runnerEl = addPipelineRunner();
  scrollToBottom();

  // Smooth stage progression animation
  updateRunnerStage(runnerEl, 0);
  await delay(350);

  updateRunnerStage(runnerEl, 1);
  await delay(350);

  updateRunnerStage(runnerEl, 2);
  await delay(400);

  updateRunnerStage(runnerEl, 3);
  await delay(300);

  // Execute pipeline with session memory (past user messages)
  const chatHistory = conversationHistory.filter(m => m.role === 'user');
  const result = executePipeline(text, chatHistory);

  runnerEl.remove();

  // Handle emergency modal
  if (result.type === 'emergency') {
    showEmergencyOverlay(result);
  }

  // Render Luxury Clinical Dossier
  const dossierId = 'dossier-' + Date.now();
  const html = renderResult(result, dossierId);
  addMessage('assistant', html, true, dossierId);

  playAcousticHaptic('complete');

  // Save to history
  conversationHistory.push({
    role: 'user',
    content: text,
    timestamp: new Date().toISOString()
  });
  conversationHistory.push({
    role: 'assistant',
    content: text,
    type: result.type,
    timestamp: new Date().toISOString()
  });
  saveHistory();
  updateMemoryCounter();

  isProcessing = false;
  sendBtn.disabled = false;
  userInput.disabled = false;
  userInput.focus();

  scrollToBottom();
}

/* ─────────────────────────────────────────────────────────────────────────
 * DOM MANIPULATION & DOSSIER INTERACTIONS
 * ───────────────────────────────────────────────────────────────────────── */
function addMessage(role, content, isHtml = false, dossierId = null) {
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper message-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? '👤' : '🩺';
  avatar.setAttribute('aria-hidden', 'true');

  const bubble = document.createElement('div');
  bubble.className = `message-bubble bubble-${role}`;

  if (isHtml) {
    bubble.innerHTML = content;
  } else {
    const p = document.createElement('p');
    p.textContent = content;
    bubble.appendChild(p);
  }

  const time = document.createElement('span');
  time.className = 'message-time';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  bubble.appendChild(time);

  if (role === 'user') {
    wrapper.appendChild(bubble);
    wrapper.appendChild(avatar);
  } else {
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
  }

  chatMessages.appendChild(wrapper);

  // Bind Tab & Action events for new Dossier Card
  if (isHtml && dossierId) {
    bindDossierEvents(dossierId);
  }

  scrollToBottom();
  return wrapper;
}

function bindDossierEvents(dossierId) {
  const card = document.getElementById(dossierId);
  if (!card) return;

  // 1. Tab Navigation
  card.querySelectorAll('.dossier-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      playAcousticHaptic('click');

      // Update active tab buttons
      card.querySelectorAll('.dossier-tab-btn').forEach(b => {
        const isActive = b.dataset.tab === targetTab;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive);
      });

      // Update active tab panes
      card.querySelectorAll('.dossier-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.dataset.pane === targetTab);
      });
    });
  });

  // 2. Copy Report Summary
  const copyBtn = card.querySelector('.copy-report-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      const textToCopy = extractDossierPlainText(card);
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('📋 Clinical Summary Copied to Clipboard');
      });
    });
  }

  // 3. Print / Export Dossier
  const printBtn = card.querySelector('.print-dossier-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      window.print();
    });
  }

  // 4. Speak / Listen Audio Briefing
  const speakBtn = card.querySelector('.speak-dossier-btn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      playAcousticHaptic('click');
      speakDossierBriefing(card, speakBtn);
    });
  }
}

function extractDossierPlainText(card) {
  const title = card.querySelector('.dossier-title')?.textContent || 'MedAssist Assessment';
  const subtitle = card.querySelector('.dossier-subtitle')?.textContent || '';
  const overview = card.querySelector('[data-pane="overview"]')?.innerText || '';
  const protocol = card.querySelector('[data-pane="protocol"]')?.innerText || '';
  const physician = card.querySelector('[data-pane="physician"]')?.innerText || '';

  return `========================================\n${title.toUpperCase()} — ${subtitle}\n========================================\n\n[CLINICAL OVERVIEW]\n${overview}\n\n[THERAPEUTIC AT-HOME PROTOCOL]\n${protocol}\n\n[PHYSICIAN CONSULTATION GUIDE]\n${physician}\n\n========================================\nGenerated by MedAssist Concierge Intelligence\n`;
}

let activeSpeakingBtn = null;

function speakDossierBriefing(card, speakBtn) {
  if (!('speechSynthesis' in window)) {
    showToast('Audio speech synthesis not supported in this browser');
    return;
  }

  // If currently speaking, STOP playback immediately
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetAllSpeakButtons();
    showToast('⏹️ Audio briefing stopped');
    return;
  }

  // Otherwise, start new speech playback
  window.speechSynthesis.cancel();
  resetAllSpeakButtons();

  const overviewText = card.querySelector('[data-pane="overview"]')?.innerText || '';
  const cleanSpeechText = overviewText.replace(/[•◆✓→]/g, '').substring(0, 450);

  if (!cleanSpeechText.trim()) {
    showToast('No clinical content available to read aloud');
    return;
  }

  const utterance = new SpeechSynthesisUtterance("Here is your clinical briefing. " + cleanSpeechText);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  activeSpeakingBtn = speakBtn;
  if (speakBtn) {
    speakBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
      Stop Audio
    `;
    speakBtn.classList.add('active');
  }

  utterance.onstart = () => {
    showToast('🔊 Playing clinical audio briefing (Click Stop to cancel)');
  };

  utterance.onend = () => {
    resetAllSpeakButtons();
    showToast('Audio briefing complete');
  };

  utterance.onerror = () => {
    resetAllSpeakButtons();
  };

  window.speechSynthesis.speak(utterance);
}

function resetAllSpeakButtons() {
  document.querySelectorAll('.speak-dossier-btn').forEach(btn => {
    btn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      Listen
    `;
    btn.classList.remove('active');
  });
  activeSpeakingBtn = null;
}

function addPipelineRunner() {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper message-assistant';
  wrapper.id = 'pipeline-runner-wrapper';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = '🩺';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble bubble-assistant';
  bubble.innerHTML = renderPipelineRunner(0);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);

  return wrapper;
}

function updateRunnerStage(wrapper, stageIdx) {
  const bubble = wrapper.querySelector('.bubble-assistant');
  if (bubble) bubble.innerHTML = renderPipelineRunner(stageIdx);
}

/* ─────────────────────────────────────────────────────────────────────────
 * EMERGENCY OVERLAY & TOASTS
 * ───────────────────────────────────────────────────────────────────────── */
function showEmergencyOverlay(result) {
  if (!emergencyOverlay) return;
  emergencyOverlay.classList.add('active');
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 600);
}

function dismissEmergencyOverlay() {
  if (!emergencyOverlay) return;
  emergencyOverlay.classList.remove('active');
}

function showToast(message) {
  if (!luxuryToast) return;
  luxuryToast.textContent = message;
  luxuryToast.classList.add('show');
  setTimeout(() => luxuryToast.classList.remove('show'), 2600);
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * SESSION MEMORY BUFFER INSPECTOR
 * ───────────────────────────────────────────────────────────────────────── */
function updateMemoryCounter() {
  const remembered = getRememberedSessionSymptoms();
  if (memoryCounter) memoryCounter.textContent = remembered.length;
}

function getRememberedSessionSymptoms() {
  const set = new Set();
  for (const msg of conversationHistory) {
    if (msg.role === 'user') {
      const lower = msg.content.toLowerCase();
      for (const sys of ANATOMICAL_SYSTEMS) {
        for (const sym of sys.symptoms) {
          if (lower.includes(sym.key)) set.add(sym.label);
        }
      }
    }
  }
  return Array.from(set);
}

function openMemoryDrawer() {
  if (!memoryDrawerBackdrop) return;
  playAcousticHaptic('click');

  const remembered = getRememberedSessionSymptoms();
  if (memoryItemsContainer) {
    if (remembered.length === 0) {
      memoryItemsContainer.innerHTML = `<div style="color: var(--platinum-500); font-size: 0.8rem; font-style: italic;">No entities stored in current session buffer. Describe symptoms to populate.</div>`;
    } else {
      memoryItemsContainer.innerHTML = remembered.map(item => `
        <div class="memory-item-capsule">
          <span>🩺 ${item}</span>
          <span style="font-size: 0.68rem; color: var(--gold-400); text-transform: uppercase;">Active</span>
        </div>
      `).join('');
    }
  }

  memoryDrawerBackdrop.classList.add('open');
}

function closeMemoryDrawer() {
  if (!memoryDrawerBackdrop) return;
  playAcousticHaptic('click');
  memoryDrawerBackdrop.classList.remove('open');
}

function clearMemoryBuffer() {
  conversationHistory = [];
  localStorage.removeItem('medassist_history_lux');
  stagedSymptoms.clear();
  activePatientFactors.clear();
  updateMemoryCounter();
  closeMemoryDrawer();
  showStudioHero();
  showToast('Session memory buffer reset');
}

/* ─────────────────────────────────────────────────────────────────────────
 * HISTORY STORAGE & REPLAY
 * ───────────────────────────────────────────────────────────────────────── */
function saveHistory() {
  try {
    localStorage.setItem('medassist_history_lux', JSON.stringify(conversationHistory.slice(-50)));
  } catch (e) { /* ignore */ }
}

function loadHistory() {
  try {
    const stored = localStorage.getItem('medassist_history_lux');
    if (stored) conversationHistory = JSON.parse(stored);
  } catch (e) {
    conversationHistory = [];
  }
}

function replayHistory() {
  chatMessages.innerHTML = '';
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    if (msg.role === 'user') {
      addMessage('user', msg.content);
    } else if (msg.role === 'assistant') {
      const pastHistory = conversationHistory.slice(0, i).filter(m => m.role === 'user');
      const result = executePipeline(msg.content, pastHistory);
      const dossierId = 'dossier-' + i;
      const html = renderResult(result, dossierId);
      addMessage('assistant', html, true, dossierId);
    }
  }
  scrollToBottom();
}

function clearConversation() {
  conversationHistory = [];
  localStorage.removeItem('medassist_history_lux');
  stagedSymptoms.clear();
  activePatientFactors.clear();
  updateMemoryCounter();
  showStudioHero();
  userInput.focus();
  showToast('New clinical session initialized');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Bootstrap on DOM ready */
document.addEventListener('DOMContentLoaded', init);

/**
 * pipeline.js — 4-Stage ReAct Pipeline with Tool Calls
 * 
 * Implements the Plan-Act (ReAct) execution format:
 *   Thought → Action (tool call) → Observation → ... → Final Answer
 * 
 * Stages:
 *   1. Intake & Entity Extraction (with session memory)
 *   2. Emergency Triage via suggest_next_step tool
 *   3. Knowledge Retrieval via lookup_info tool
 *   4. Output Assembly (Final Answer)
 */

import { lookup_info, suggest_next_step } from './tools.js';

/* ──────────────────────────────────────────────
 * ENTITY EXTRACTION DICTIONARIES
 * ────────────────────────────────────────────── */

const SEVERITY_KEYWORDS = {
  mild: ['mild', 'slight', 'little', 'minor', 'a bit', 'somewhat', 'light', 'tiny', 'small'],
  moderate: ['moderate', 'noticeable', 'bothersome', 'uncomfortable', 'annoying', 'fairly', 'quite'],
  severe: ['severe', 'intense', 'extreme', 'excruciating', 'unbearable', 'terrible', 'awful', 'horrible', 'worst', 'agonizing', 'really bad', 'very bad', 'so much']
};

const DURATION_PATTERNS = [
  { pattern: /(?:for\s+)?(\d+)\s*(?:min(?:ute)?s?)\b/i, unit: 'minutes' },
  { pattern: /(?:for\s+)?(\d+)\s*(?:hr|hour)s?\b/i, unit: 'hours' },
  { pattern: /(?:for\s+)?(\d+)\s*(?:day)s?\b/i, unit: 'days' },
  { pattern: /(?:for\s+)?(\d+)\s*(?:week)s?\b/i, unit: 'weeks' },
  { pattern: /(?:for\s+)?(\d+)\s*(?:month)s?\b/i, unit: 'months' },
  { pattern: /(?:for\s+)?(\d+)\s*(?:year)s?\b/i, unit: 'years' },
  { pattern: /since\s+(yesterday|last\s+night|this\s+morning|last\s+week|last\s+month)/i, unit: 'relative' },
  { pattern: /(?:started|began|onset)\s+(today|yesterday|recently|suddenly|gradually)/i, unit: 'onset' },
  { pattern: /(?:for\s+)?(?:a\s+)?(?:few|couple(?:\s+of)?)\s+(days|weeks|hours|months)/i, unit: 'vague' },
  { pattern: /(?:for\s+)?(?:a\s+)?(?:long\s+time|while\s+now)/i, unit: 'long' },
  { pattern: /(?:all\s+day|all\s+night|all\s+week)/i, unit: 'continuous' },
  { pattern: /(?:on\s+and\s+off|comes?\s+and\s+goes?|intermittent)/i, unit: 'intermittent' }
];

const SYMPTOM_TERMS = [
  'headache', 'head pain', 'migraine', 'dizziness', 'dizzy', 'lightheaded', 'vertigo',
  'confusion', 'memory problems', 'brain fog',
  'sore throat', 'throat pain', 'ear pain', 'earache', 'red eye', 'blurry vision',
  'runny nose', 'stuffy nose', 'congestion', 'sneezing', 'nosebleed', 'itchy eyes',
  'eye pain', 'dry eyes',
  'cough', 'shortness of breath', 'wheezing', 'chest tightness', 'phlegm', 'sputum',
  'chest pain', 'rapid heartbeat', 'palpitations', 'heart racing',
  'nausea', 'vomiting', 'stomach pain', 'abdominal pain', 'diarrhea', 'constipation',
  'bloating', 'gas', 'heartburn', 'acid reflux', 'indigestion', 'loss of appetite',
  'back pain', 'neck pain', 'joint pain', 'muscle pain', 'stiffness', 'swelling',
  'knee pain', 'shoulder pain', 'hip pain', 'muscle cramp', 'muscle ache',
  'rash', 'hives', 'itching', 'skin irritation', 'bumps', 'acne', 'dry skin',
  'bruising', 'wound',
  'fever', 'chills', 'fatigue', 'tiredness', 'weakness', 'night sweats',
  'weight loss', 'weight gain', 'dehydration', 'swollen lymph nodes',
  'painful urination', 'burning urination', 'frequent urination', 'blood in urine',
  'anxiety', 'panic', 'insomnia', 'trouble sleeping', 'depression', 'stress',
  'allergies', 'allergic reaction', 'hay fever',
  'numbness', 'tingling', 'tremor', 'body aches'
];

const AGE_PATTERNS = [
  { pattern: /\b(?:i(?:'m| am)\s+)?(\d{1,3})\s*(?:years?\s*old|y\/?o)\b/i, type: 'exact' },
  { pattern: /\b(?:my\s+)?(?:child|kid|son|daughter|baby|infant|toddler)\b/i, type: 'pediatric' },
  { pattern: /\b(?:elderly|senior|older\s+adult|grandparent)\b/i, type: 'geriatric' },
  { pattern: /\bpregnant\b/i, type: 'pregnant' }
];

const CONDITION_PATTERNS = [
  'diabetes', 'diabetic', 'asthma', 'asthmatic', 'hypertension', 'high blood pressure',
  'heart disease', 'copd', 'cancer', 'hiv', 'immunocompromised', 'pregnant', 'pregnancy',
  'thyroid', 'kidney disease', 'liver disease', 'arthritis'
];

/* ──────────────────────────────────────────────
 * STAGE 1: INTAKE & ENTITY EXTRACTION
 * ────────────────────────────────────────────── */

function extractEntities(rawInput, chatHistory = []) {
  const input = rawInput.toLowerCase();
  const result = {
    primarySymptoms: [],
    duration: null,
    severity: 'Unspecified',
    ageGroup: null,
    existingConditions: [],
    triggers: [],
    rawInput,
    rememberedSymptoms: []
  };

  // SESSION MEMORY: Recall symptoms from chat history
  if (chatHistory.length > 0) {
    for (const msg of chatHistory) {
      if (msg.role === 'user') {
        const prevInput = msg.content.toLowerCase();
        for (const term of SYMPTOM_TERMS) {
          if (prevInput.includes(term) && !result.rememberedSymptoms.includes(term)) {
            result.rememberedSymptoms.push(term);
          }
        }
      }
    }
  }

  // Extract current symptoms
  for (const term of SYMPTOM_TERMS) {
    if (input.includes(term)) {
      result.primarySymptoms.push(term);
    }
  }

  // Fallback: if no matches, try loose matching
  if (result.primarySymptoms.length === 0) {
    const words = input.replace(/[^\w\s'-]/g, '').split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const twoWord = i < words.length - 1 ? words[i] + ' ' + words[i + 1] : '';
      for (const term of SYMPTOM_TERMS) {
        if ((twoWord && (term.includes(twoWord) || twoWord.includes(term.split(' ')[0]))) ||
            (words[i].length > 3 && term.includes(words[i]))) {
          if (!result.primarySymptoms.includes(term)) {
            result.primarySymptoms.push(term);
          }
        }
      }
    }
  }

  // Merge remembered symptoms (add ones not already present)
  for (const sym of result.rememberedSymptoms) {
    if (!result.primarySymptoms.includes(sym)) {
      result.primarySymptoms.push(sym);
    }
  }

  // Extract duration
  for (const dp of DURATION_PATTERNS) {
    const match = input.match(dp.pattern);
    if (match) { result.duration = match[0].trim(); break; }
  }

  // Extract severity
  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (input.includes(kw)) {
        result.severity = level.charAt(0).toUpperCase() + level.slice(1);
        break;
      }
    }
  }

  // Extract age group
  for (const ap of AGE_PATTERNS) {
    const match = input.match(ap.pattern);
    if (match) {
      if (ap.type === 'exact') {
        const age = parseInt(match[1]);
        result.ageGroup = `${age} years old`;
        if (age < 2) result.ageGroup += ' (infant)';
        else if (age < 12) result.ageGroup += ' (child)';
        else if (age < 18) result.ageGroup += ' (adolescent)';
        else if (age >= 65) result.ageGroup += ' (senior)';
      } else {
        result.ageGroup = ap.type;
      }
      break;
    }
  }

  // Extract conditions
  for (const cond of CONDITION_PATTERNS) {
    if (input.includes(cond)) {
      result.existingConditions.push(cond);
    }
  }

  return result;
}

/**
 * Determine missing context questions
 */
function getMissingContextQuestions(intake) {
  const questions = [];
  if (!intake.duration) {
    questions.push('How long have you been experiencing these symptoms? (e.g., "since yesterday", "for 3 days")');
  }
  if (intake.severity === 'Unspecified') {
    questions.push('How would you rate the severity — mild, moderate, or severe?');
  }
  if (intake.primarySymptoms.length === 0) {
    questions.push('Could you describe your main symptoms in more detail?');
  }
  return questions;
}

/* ──────────────────────────────────────────────
 * REACT TRACE BUILDER
 * ────────────────────────────────────────────── */

function buildReActTrace(intake, triageResult, lookupResults) {
  const steps = [];

  // Step 1: Intake thought
  steps.push({
    type: 'thought',
    text: `Parsed user input. Extracted ${intake.primarySymptoms.length} symptom(s): [${intake.primarySymptoms.join(', ')}]. Duration: ${intake.duration || 'unspecified'}. Severity: ${intake.severity}.${intake.rememberedSymptoms.length > 0 ? ` Recalled ${intake.rememberedSymptoms.length} symptom(s) from session history.` : ''} Proceeding to emergency triage.`
  });

  // Step 2: Triage tool call
  steps.push({
    type: 'action',
    tool: 'suggest_next_step',
    input: intake.rawInput,
    output: triageResult.toolOutput
  });

  if (triageResult.isEmergency) {
    steps.push({
      type: 'thought',
      text: `CRITICAL: Emergency red flags detected. Halting pipeline. Must alert user immediately.`
    });
    return steps;
  }

  // Step 3: Lookup tool calls
  steps.push({
    type: 'thought',
    text: `No emergency red flags. Proceeding to knowledge retrieval for: ${intake.primarySymptoms.slice(0, 3).join(', ')}.`
  });

  for (const sym of intake.primarySymptoms.slice(0, 3)) {
    const result = lookupResults.find(r => r.symptom === sym);
    if (result) {
      steps.push({
        type: 'action',
        tool: 'lookup_info',
        input: sym,
        output: result.data.toolOutput
      });
    }
  }

  // Step 4: Final thought
  steps.push({
    type: 'thought',
    text: `Gathered sufficient information and safety guidance. Assembling structured response with intake summary, educational context, self-care guidelines, and mandatory disclaimer.`
  });

  return steps;
}

/* ──────────────────────────────────────────────
 * MAIN PIPELINE EXECUTOR
 * ────────────────────────────────────────────── */

/**
 * Execute the full 4-stage ReAct pipeline
 * 
 * @param {string} rawInput - The user's raw symptom description
 * @param {Object[]} chatHistory - Previous conversation messages for session memory
 * @returns {Object} Pipeline result with ReAct trace
 */
export function executePipeline(rawInput, chatHistory = []) {
  if (!rawInput || rawInput.trim().length === 0) {
    return {
      type: 'error',
      message: 'Please describe your symptoms so I can help you.'
    };
  }

  // ── STAGE 1: Intake & Entity Extraction (with memory) ──
  const intake = extractEntities(rawInput, chatHistory);

  // ── STAGE 2: Emergency Triage via suggest_next_step tool ──
  const triageResult = suggest_next_step(rawInput);

  if (triageResult.isEmergency) {
    const reactTrace = buildReActTrace(intake, triageResult, []);
    return {
      type: 'emergency',
      triage: {
        isEmergency: true,
        matchedFlags: triageResult.flags.map(f => ({ pattern: f, icon: '🚨' })),
        categories: triageResult.categories,
        actions: triageResult.actions
      },
      intake: {
        symptoms: intake.primarySymptoms,
        severity: 'CRITICAL',
        rawInput
      },
      reactTrace,
      timestamp: new Date().toISOString()
    };
  }

  // ── STAGE 3: Knowledge Retrieval via lookup_info tool ──
  const lookupResults = [];
  const allEntries = [];
  const seenKeys = new Set();

  for (const sym of intake.primarySymptoms.slice(0, 3)) {
    const result = lookup_info(sym);
    lookupResults.push({ symptom: sym, data: result });
    if (result.found) {
      for (const entry of result.entries) {
        const key = entry.condition;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allEntries.push(entry);
        }
      }
    }
  }

  // Build ReAct trace
  const reactTrace = buildReActTrace(intake, triageResult, lookupResults);

  // Check for missing context
  const missingQuestions = getMissingContextQuestions(intake);

  // ── STAGE 4: Output Assembly ──
  let riskLevel = 'LOW';
  if (intake.severity === 'Severe' || intake.existingConditions.length > 0) riskLevel = 'MODERATE';
  if (intake.primarySymptoms.length >= 4) riskLevel = 'MODERATE';

  return {
    type: 'normal',
    intake: {
      symptoms: intake.primarySymptoms,
      rememberedSymptoms: intake.rememberedSymptoms,
      duration: intake.duration || 'Not specified',
      severity: intake.severity,
      ageGroup: intake.ageGroup,
      existingConditions: intake.existingConditions,
      riskLevel
    },
    knowledge: allEntries.slice(0, 3).map(entry => ({
      displayName: entry.condition,
      emoji: entry.emoji,
      commonCauses: entry.causes,
      selfCare: entry.selfCare,
      doctorQuestions: entry.doctorQuestions,
      seekCareIf: entry.seekCareIf
    })),
    missingQuestions,
    reactTrace,
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract entities only (for debugging)
 */
export function extractOnly(rawInput) {
  return extractEntities(rawInput);
}

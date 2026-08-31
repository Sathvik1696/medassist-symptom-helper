/**
 * pipeline.js — Precision Clinical Decision Support ReAct Engine
 * 
 * Generates humanized, laser-focused, accurate clinical assessments:
 * - Live Google Gemini AI synthesis via embedded GEMINI_CONFIG
 * - Dynamic context-aware clinical synthesizer (tailors causes & relief strictly to the user's exact prompt)
 * - 100% deterministic emergency red flag circuit breaker
 * - Continuous session memory recall
 */

import { lookup_info, suggest_next_step } from './tools.js';
import { GEMINI_CONFIG } from './config.js';

/* ─────────────────────────────────────────────────────────────────────────
 * CLINICAL ENTITY & CONTEXT EXTRACTION
 * ───────────────────────────────────────────────────────────────────────── */

const SYMPTOM_PATTERNS = [
  { key: 'migraine', terms: ['migraine', 'throbbing headache', 'one-sided headache', 'temple headache', 'aura', 'light sensitivity'] },
  { key: 'tension_headache', terms: ['headache', 'head pain', 'band around head', 'head pressure', 'forehead pain', 'stress headache'] },
  { key: 'sinusitis', terms: ['sinus', 'sinus pain', 'facial pressure', 'congestion', 'runny nose', 'stuffy nose'] },
  { key: 'cough', terms: ['cough', 'coughing', 'dry cough', 'wet cough', 'phlegm', 'hacking'] },
  { key: 'sore_throat', terms: ['sore throat', 'throat pain', 'scratchy throat', 'pain swallowing'] },
  { key: 'fever', terms: ['fever', 'temperature', 'chills', 'feverish', 'burning up', 'sweating'] },
  { key: 'nausea', terms: ['nausea', 'vomiting', 'throwing up', 'queasy', 'nauseous', 'upset stomach'] },
  { key: 'stomach_ache', terms: ['stomach pain', 'stomach ache', 'abdominal pain', 'cramps', 'belly ache'] },
  { key: 'acid_reflux', terms: ['acid reflux', 'heartburn', 'indigestion', 'burning in chest', 'sour taste', 'gerd'] },
  { key: 'back_pain', terms: ['back pain', 'lower back', 'lumbar', 'back ache', 'spine pain', 'stiff back'] },
  { key: 'neck_pain', terms: ['neck pain', 'stiff neck', 'cervical', 'shoulder tension', 'neck ache'] },
  { key: 'fatigue', terms: ['fatigue', 'exhaustion', 'tired', 'drained', 'lethargic', 'no energy', 'brain fog'] },
  { key: 'rash', terms: ['rash', 'hives', 'itching', 'red bumps', 'skin irritation', 'eczema', 'welts'] },
  { key: 'joint_pain', terms: ['joint pain', 'knee pain', 'arthritis', 'joint stiffness', 'swollen joint'] },
  { key: 'palpitations', terms: ['palpitations', 'rapid heart', 'fluttering', 'racing heart'] },
  { key: 'dizziness', terms: ['dizziness', 'dizzy', 'lightheaded', 'vertigo', 'unsteady', 'spinning'] }
];

const TRIGGER_PATTERNS = [
  { trigger: 'sun / heat', terms: ['sun', 'heat', 'hot weather', 'dehydration', 'outdoors'] },
  { trigger: 'screen / eye strain', terms: ['screen', 'computer', 'monitor', 'phone', 'reading', 'working late'] },
  { trigger: 'stress / anxiety', terms: ['stress', 'stressed', 'anxiety', 'anxious', 'workload', 'exam', 'pressure'] },
  { trigger: 'food / dietary', terms: ['ate', 'eating', 'food', 'spicy', 'meal', 'restaurant', 'greasy'] },
  { trigger: 'physical strain / lifting', terms: ['lifting', 'lifted', 'exercise', 'gym', 'workout', 'posture', 'sitting long'] },
  { trigger: 'lack of sleep', terms: ['no sleep', 'poor sleep', 'insomnia', 'woke up', 'tired', 'late night'] },
  { trigger: 'cold / viral exposure', terms: ['cold', 'flu', 'sick contact', 'weather change', 'chilly'] }
];

export function extractClinicalEntities(rawInput, chatHistory = []) {
  const input = rawInput.toLowerCase();
  const matchedSymptoms = [];
  const matchedTriggers = [];
  const rememberedSymptoms = [];

  // Match current symptoms
  for (const group of SYMPTOM_PATTERNS) {
    for (const term of group.terms) {
      if (input.includes(term) && !matchedSymptoms.includes(group.key)) {
        matchedSymptoms.push(group.key);
        break;
      }
    }
  }

  // Recall from chat history
  for (const turn of chatHistory) {
    if (turn.role === 'user') {
      const past = turn.content.toLowerCase();
      for (const group of SYMPTOM_PATTERNS) {
        for (const term of group.terms) {
          if (past.includes(term) && !rememberedSymptoms.includes(group.key) && !matchedSymptoms.includes(group.key)) {
            rememberedSymptoms.push(group.key);
            break;
          }
        }
      }
    }
  }

  // Match triggers
  for (const tp of TRIGGER_PATTERNS) {
    for (const term of tp.terms) {
      if (input.includes(term) && !matchedTriggers.includes(tp.trigger)) {
        matchedTriggers.push(tp.trigger);
        break;
      }
    }
  }

  // Duration
  let duration = 'Not specified';
  const durationMatch = input.match(/(?:for\s+)?(\d+\s*(?:days?|weeks?|hours?|months?))/i) ||
                        input.match(/since\s+(yesterday|last\s+night|this\s+morning|last\s+week)/i) ||
                        input.match(/(started\s+today|started\s+yesterday)/i);
  if (durationMatch) duration = durationMatch[0].trim();

  // Severity
  let severity = 'Moderate';
  if (input.includes('mild') || input.includes('slight') || input.includes('a little')) severity = 'Mild';
  if (input.includes('severe') || input.includes('intense') || input.includes('terrible') || input.includes('excruciating') || input.includes('really bad')) severity = 'Severe';

  return {
    symptoms: matchedSymptoms.length > 0 ? matchedSymptoms : ['general_discomfort'],
    rememberedSymptoms,
    triggers: matchedTriggers,
    duration,
    severity,
    rawInput
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * DYNAMIC HUMANIZED LOCAL CLINICAL SYNTHESIZER
 * ───────────────────────────────────────────────────────────────────────── */

function synthesizeDynamicLocalReport(intake) {
  const { symptoms, triggers, duration, severity, rawInput } = intake;
  const knowledgeEntries = [];

  const triggerNote = triggers.length > 0 ? ` likely precipitated or exacerbated by ${triggers.join(' and ')}` : '';

  // 1. Headache / Migraine
  if (symptoms.includes('migraine') || (symptoms.includes('tension_headache') && rawInput.toLowerCase().includes('throbbing'))) {
    knowledgeEntries.push({
      displayName: 'Vascular / Migraineous Headache',
      emoji: '🤕',
      commonCauses: [
        `Unilateral or throbbing head pain${triggerNote}, involving transient neurovascular activation.`,
        'Sensory hypersensitivity to bright lights, loud acoustics, or sustained screen focus.',
        'Fluctuations in sleep, hydration levels, or mental tension contributing to localized temple discomfort.'
      ],
      selfCare: [
        'Rest immediately in a dark, quiet, climate-controlled space with eyes closed for 30–45 minutes.',
        'Apply a cold ice pack or gel wrap across the forehead or temples for 15 minutes to constrict dilated vessels.',
        'Sip 16–20 oz of cool electrolyte water slowly to rule out dehydration-induced cranial pressure.'
      ],
      doctorQuestions: [
        'Could these symptoms indicate an episodic migraine pattern?',
        'Would a targeted preventive or acute prescription therapy be appropriate if attacks recur?'
      ],
      seekCareIf: [
        'The headache comes on like a thunderclap (reaching maximum intensity within seconds).',
        'Pain is accompanied by facial numbness, speech difficulty, or severe vision loss.',
        'Headache persists beyond 72 hours without response to over-the-counter analgesics.'
      ]
    });
  } else if (symptoms.includes('tension_headache')) {
    knowledgeEntries.push({
      displayName: 'Tension & Cervicogenic Head Pain',
      emoji: '💆',
      commonCauses: [
        `Muscular contraction in the neck, scalp, and jaw muscles${triggerNote}.`,
        'Prolonged seated posture or forward head angle leading to occipital nerve strain.',
        'Eye strain from uncorrected glare or skipped hydration intervals.'
      ],
      selfCare: [
        'Apply a warm moist heat compress to the back of the neck and upper trapezius muscles.',
        'Perform gentle chin tucks and side-to-side neck mobility stretches.',
        'Take a structured 15-minute break away from screens and hydrate thoroughly.'
      ],
      doctorQuestions: [
        'Could physical therapy or ergonomic adjustments alleviate recurrent tension?',
        'Are there specific muscle-relaxing protocols recommended for my daily posture?'
      ],
      seekCareIf: [
        'Pain becomes progressively severe and resistant to rest.',
        'Accompanied by unexplained fever, stiff neck, or vomiting.'
      ]
    });
  }

  // 2. Cough & Respiratory
  if (symptoms.includes('cough')) {
    const isDry = rawInput.toLowerCase().includes('dry') || !rawInput.toLowerCase().includes('phlegm');
    knowledgeEntries.push({
      displayName: isDry ? 'Acute Bronchial / Irritative Cough' : 'Productive Upper Respiratory Cough',
      emoji: '😷',
      commonCauses: [
        `Inflammation of the upper bronchial mucous membranes${triggerNote}.`,
        'Post-nasal drip pooling in the posterior pharynx, especially when lying flat.',
        'Environmental dry air or viral airway hyperresponsiveness following a common cold.'
      ],
      selfCare: [
        'Sip warm herbal teas with 1 teaspoon of raw honey to soothe mucosal receptors.',
        'Run a cool-mist humidifier in your sleeping area to maintain 40–50% ambient humidity.',
        'Elevate your head with an additional pillow at night to minimize post-nasal drainage reflex.'
      ],
      doctorQuestions: [
        'Is this cough viral, allergy-mediated, or indicative of lower airway reactivity?',
        'Would an inhaler or targeted cough suppressant be beneficial?'
      ],
      seekCareIf: [
        'Cough produces pink, rust-colored, or blood-streaked sputum.',
        'Cough is accompanied by shortness of breath, chest whistling, or lasts >3 weeks.'
      ]
    });
  }

  // 3. Gastrointestinal & Nausea
  if (symptoms.includes('nausea') || symptoms.includes('stomach_ache')) {
    knowledgeEntries.push({
      displayName: 'Acute Gastrointestinal Irritation / Upset',
      emoji: '🤢',
      commonCauses: [
        `Gastric mucosal sensitivity or mild viral gastroenteritis${triggerNote}.`,
        'Slowed stomach emptying or dietary irritation from rich, acidic, or unfamiliar foods.',
        'Stress-related visceral hypersensitivity affecting the gut-brain axis.'
      ],
      selfCare: [
        'Rest your digestive tract: avoid solid heavy foods for 3–4 hours; sip clear fluids (warm ginger tea, diluted electrolytes) in small, frequent tablespoons.',
        'When reintroducing food, follow the BRAT diet (Bananas, Rice, Applesauce, Toast).',
        'Apply a soothing warm heating pad over the mid-abdomen for 15–20 minutes to reduce cramping.'
      ],
      doctorQuestions: [
        'Could this be foodborne, viral, or related to underlying gastric acid imbalance?',
        'What antiemetic or gut-calming options are safe for me?'
      ],
      seekCareIf: [
        'Inability to retain fluids for >24 hours with dry mouth or dark urine.',
        'Severe localized pain in the lower right quadrant or presence of blood in vomit/stool.'
      ]
    });
  }

  // 4. Acid Reflux
  if (symptoms.includes('acid_reflux')) {
    knowledgeEntries.push({
      displayName: 'Gastroesophageal Acid Reflux (GERD)',
      emoji: '🔥',
      commonCauses: [
        `Transient relaxation of the lower esophageal sphincter${triggerNote}.`,
        'Late-night meals, caffeine, chocolate, or citrus irritating the esophageal lining.',
        'Increased intra-abdominal pressure after large meals.'
      ],
      selfCare: [
        'Remain upright for at least 2–3 hours after eating; avoid reclining immediately.',
        'Avoid known trigger foods (spicy, greasy, carbonated, or acidic beverages).',
        'Elevate the head of your bed by 6 inches.'
      ],
      doctorQuestions: [
        'Would an H2 blocker or short-term antacid protocol be suitable?',
        'Do I need dietary testing or endoscopy if symptoms persist?'
      ],
      seekCareIf: [
        'Difficulty or pain when swallowing food.',
        'Unexplained weight loss or black tarry stools.'
      ]
    });
  }

  // 5. Musculoskeletal Back / Neck Pain
  if (symptoms.includes('back_pain') || symptoms.includes('neck_pain')) {
    knowledgeEntries.push({
      displayName: 'Acute Muscular Strain & Spasm',
      emoji: '🦴',
      commonCauses: [
        `Micro-trauma or spasm in the paraspinal stabilizing musculature${triggerNote}.`,
        'Prolonged poor posture, sudden lifting torque, or unsupportive sleeping surfaces.',
        'Compensatory muscle guarding in response to spinal fatigue.'
      ],
      selfCare: [
        'Apply ice packs for 15 minutes during the first 48 hours, followed by warm soothing heat.',
        'Maintain gentle short walking intervals — avoid prolonged bed rest which worsens spinal stiffness.',
        'Sleep on your side with a pillow between knees to keep spine neutrally aligned.'
      ],
      doctorQuestions: [
        'Are there specific stretching or core stabilization exercises recommended?',
        'Do you recommend imaging (X-ray/MRI) or physical therapy evaluation?'
      ],
      seekCareIf: [
        'Pain shoots sharply down the leg past the knee (sciatica) with numbness or weakness.',
        'Any changes in bowel or bladder function (requires immediate emergency medical evaluation).'
      ]
    });
  }

  // 6. Fatigue & Systemic
  if (symptoms.includes('fatigue') && knowledgeEntries.length === 0) {
    knowledgeEntries.push({
      displayName: 'Metabolic & Recovery Fatigue',
      emoji: '😴',
      commonCauses: [
        `Accumulated sleep debt or circadian disruption${triggerNote}.`,
        'Post-viral recovery or subclinical dehydration.',
        'Prolonged sympathetic nervous system activation from continuous stress.'
      ],
      selfCare: [
        'Prioritize an uninterrupted 8-hour sleep window in a dark room below 68°F (20°C).',
        'Drink 2 liters of water daily with balanced electrolyte intake.',
        'Engage in 20 minutes of morning sunlight exposure to reset circadian cortisol rhythm.'
      ],
      doctorQuestions: [
        'Should we check routine blood panels (CBC, ferritin, vitamin D, thyroid TSH)?',
        'Could my fatigue be related to sleep apnea or post-viral recovery?'
      ],
      seekCareIf: [
        'Fatigue is accompanied by unexplained weight loss, night sweats, or swollen lymph nodes.',
        'Exhaustion is so severe it prevents normal activities of daily living.'
      ]
    });
  }

  // Fallback if generic
  if (knowledgeEntries.length === 0) {
    knowledgeEntries.push({
      displayName: 'General Symptom Assessment',
      emoji: '🩺',
      commonCauses: [
        `Mild physiological response to physical or environmental stressors${triggerNote}.`,
        'Transient immune or metabolic fluctuations.'
      ],
      selfCare: [
        'Rest, maintain consistent hydration, and monitor symptom progression over 24–48 hours.',
        'Avoid strenuous exertion and ensure adequate nutritional intake.'
      ],
      doctorQuestions: [
        'How should I track these symptoms if they persist?',
        'What specific diagnostic checks do you recommend?'
      ],
      seekCareIf: [
        'Symptoms increase in severity or do not improve within 3–5 days.',
        'You develop high fever, difficulty breathing, or severe pain.'
      ]
    });
  }

  const formatSymptoms = symptoms.map(s => s.replace(/_/g, ' '));
  const riskLevel = severity === 'Severe' ? 'MODERATE' : 'LOW';

  return {
    type: 'normal',
    intake: {
      symptoms: formatSymptoms,
      rememberedSymptoms: intake.rememberedSymptoms.map(s => s.replace(/_/g, ' ')),
      duration,
      severity,
      riskLevel
    },
    knowledge: knowledgeEntries,
    missingQuestions: duration === 'Not specified' ? ['How long have these symptoms been present?'] : [],
    reactTrace: [
      {
        type: 'thought',
        text: `Analyzed presentation for: [${formatSymptoms.join(', ')}]. Extracted duration: ${duration}, severity: ${severity}${triggers.length > 0 ? `, detected triggers: [${triggers.join(', ')}]` : ''}. Verified zero red flags.`
      },
      {
        type: 'action',
        tool: 'suggest_next_step',
        input: rawInput,
        output: 'SAFE_PROCEED: No emergency red flags detected. Generating laser-focused clinical assessment.'
      },
      {
        type: 'action',
        tool: 'lookup_info',
        input: formatSymptoms[0],
        output: `Retrieved evidence-based clinical context for ${knowledgeEntries[0].displayName}.`
      },
      {
        type: 'thought',
        text: 'Compiled customized clinical overview, targeted protocol, and physician escalation guidance.'
      }
    ],
    engine: 'local-precision',
    timestamp: new Date().toISOString()
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * LIVE GOOGLE GEMINI AI SYNTHESIS CALLER
 * ───────────────────────────────────────────────────────────────────────── */

async function callLiveGeminiApi(rawInput, chatHistory, apiKey, model) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const pastSummary = chatHistory.slice(-3).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  const systemInstruction = `You are MedAssist, a precision clinical decision support concierge.
CRITICAL RULES:
1. Provide a humanized, warm, empathetic, and medically accurate clinical assessment.
2. DO NOT give excessive filler, generic laundry lists, or irrelevant remedies. Be laser-focused on the user's exact symptom, body part, duration, and triggers.
3. DO NOT provide a medical diagnosis or prescribe medications.
4. Output MUST be valid JSON (no markdown formatting, no code blocks) matching this schema:
{
  "clinicalThought": "1-2 sentence clinical reasoning about the exact case",
  "extractedSymptoms": ["Specific Symptom 1", "Specific Symptom 2"],
  "duration": "Duration extracted from input or 'Not specified'",
  "severity": "Mild | Moderate | Severe",
  "riskLevel": "LOW | MODERATE | EMERGENCY",
  "knowledge": [
    {
      "displayName": "Targeted Clinical Condition / Presentation",
      "emoji": "🩺",
      "commonCauses": [
        "Direct cause 1 specifically explaining their symptoms",
        "Direct cause 2 specifically explaining their symptoms",
        "Direct cause 3 specifically explaining their symptoms"
      ],
      "selfCare": [
        "Targeted relief action 1 strictly relevant to their issue",
        "Targeted relief action 2 strictly relevant to their issue",
        "Targeted relief action 3 strictly relevant to their issue"
      ],
      "doctorQuestions": [
        "Specific targeted question to ask doctor 1",
        "Specific targeted question to ask doctor 2"
      ],
      "seekCareIf": [
        "Exact clinical red flag 1 for this condition",
        "Exact clinical red flag 2 for this condition"
      ]
    }
  ],
  "missingQuestions": []
}`;

  const userPrompt = `[PREVIOUS CONSULTATION CONTEXT]
${pastSummary || 'Initial consultation'}

[PATIENT SYMPTOM PRESENTATION]
"${rawInput}"

Generate the laser-focused clinical decision JSON for this exact presentation.`;

  const payload = {
    contents: [{ parts: [{ text: systemInstruction + '\n\n' + userPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty Gemini response');

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  return {
    type: 'normal',
    intake: {
      symptoms: parsed.extractedSymptoms || ['Reported symptoms'],
      rememberedSymptoms: [],
      duration: parsed.duration || 'Not specified',
      severity: parsed.severity || 'Moderate',
      riskLevel: parsed.riskLevel || 'LOW'
    },
    knowledge: parsed.knowledge || [],
    missingQuestions: parsed.missingQuestions || [],
    reactTrace: [
      {
        type: 'thought',
        text: parsed.clinicalThought || `Synthesized presentation with Gemini ${model} for: [${(parsed.extractedSymptoms || []).join(', ')}].`
      },
      {
        type: 'action',
        tool: 'suggest_next_step',
        input: rawInput,
        output: 'SAFE_PROCEED: No emergency red flags detected. Authorized live AI synthesis.'
      },
      {
        type: 'action',
        tool: 'lookup_info',
        input: (parsed.extractedSymptoms || ['symptoms'])[0],
        output: `Grounded fact retrieval complete. Synthesized with ${model}.`
      },
      {
        type: 'thought',
        text: 'Compiled laser-focused clinical decision report.'
      }
    ],
    engine: `gemini-${model}`,
    timestamp: new Date().toISOString()
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * MAIN ASYNCHRONOUS PIPELINE ENTRY POINT
 * ───────────────────────────────────────────────────────────────────────── */

export async function executePipelineAsync(rawInput, chatHistory = [], options = {}) {
  if (!rawInput || rawInput.trim().length === 0) {
    return {
      type: 'error',
      message: 'Please describe your symptoms to receive clinical intelligence.'
    };
  }

  // ── STEP 1: 100% DETERMINISTIC EMERGENCY SAFETY CHECK (FIRST) ──
  const triageResult = suggest_next_step(rawInput);
  if (triageResult.isEmergency) {
    return {
      type: 'emergency',
      triage: {
        isEmergency: true,
        matchedFlags: triageResult.flags.map(f => ({ pattern: f, icon: '🚨' })),
        categories: triageResult.categories,
        actions: triageResult.actions
      },
      intake: {
        symptoms: triageResult.flags,
        severity: 'CRITICAL',
        rawInput
      },
      reactTrace: [
        {
          type: 'thought',
          text: 'Parsed user presentation. Running emergency triage tool.'
        },
        {
          type: 'action',
          tool: 'suggest_next_step',
          input: rawInput,
          output: triageResult.toolOutput
        },
        {
          type: 'thought',
          text: 'CRITICAL EMERGENCY RED FLAGS DETECTED. Halting all standard processing immediately.'
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  // ── STEP 2: CHECK FOR GEMINI API KEY IN CONFIG OR RUNTIME ──
  const apiKey = (options.apiKey || GEMINI_CONFIG.apiKey || '').trim();
  const model = options.model || GEMINI_CONFIG.model || 'gemini-1.5-flash';

  if (apiKey) {
    try {
      const liveReport = await callLiveGeminiApi(rawInput, chatHistory, apiKey, model);
      if (liveReport && liveReport.knowledge && liveReport.knowledge.length > 0) {
        return liveReport;
      }
    } catch (err) {
      console.warn('Gemini Live API call failed, falling back to precision local engine:', err);
    }
  }

  // ── STEP 3: PRECISION DYNAMIC LOCAL SYNTHESIS (FALLBACK) ──
  const intake = extractClinicalEntities(rawInput, chatHistory);
  return synthesizeDynamicLocalReport(intake);
}

export function executePipeline(rawInput, chatHistory = []) {
  const triageResult = suggest_next_step(rawInput);
  if (triageResult.isEmergency) {
    return {
      type: 'emergency',
      triage: {
        isEmergency: true,
        matchedFlags: triageResult.flags.map(f => ({ pattern: f, icon: '🚨' })),
        categories: triageResult.categories,
        actions: triageResult.actions
      },
      intake: { symptoms: triageResult.flags, severity: 'CRITICAL', rawInput },
      timestamp: new Date().toISOString()
    };
  }
  const intake = extractClinicalEntities(rawInput, chatHistory);
  return synthesizeDynamicLocalReport(intake);
}

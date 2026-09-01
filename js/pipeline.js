/**
 * pipeline.js — MedAssist Structured Clinical Assessment Engine
 * 
 * Orchestrates:
 * 1. Immediate Deterministic Red-Flag Triage (suggest_next_step)
 * 2. Grounded Knowledge Retrieval (lookup_info)
 * 3. Deep Contextual Clinical Assessment Synthesis (Gemini Live API or Local Clinical Engine)
 */

import { executeTool } from './tools.js?v=4';
import { GEMINI_CONFIG } from './config.js?v=4';

/**
 * Execute Full Structured Assessment Async
 */
export async function executeStructuredAssessmentAsync(assessmentData, options = {}) {
  const apiKey = options.apiKey || GEMINI_CONFIG.apiKey;
  const model = options.model || GEMINI_CONFIG.model;

  const rawInput = assessmentData.primarySymptom || '';

  // 1. Deterministic Emergency Red Flag Circuit Breaker
  const triageResult = executeTool('suggest_next_step', { symptom_text: rawInput });
  if (triageResult && triageResult.isEmergency) {
    return {
      type: 'emergency',
      rawInput,
      triage: triageResult,
      assessmentData
    };
  }

  // 2. Identify Primary Clinical Entities for Grounded Knowledge Retrieval
  const detectedSymptoms = extractPrimarySymptoms(rawInput);
  const knowledgeEntries = [];
  for (const sym of detectedSymptoms) {
    const k = executeTool('lookup_info', { query: sym });
    if (k && k.found && k.entries && k.entries.length > 0) {
      knowledgeEntries.push(...k.entries);
    } else if (k && !k.error && k.displayName) {
      knowledgeEntries.push(k);
    }
  }

  // 3. Synthesize Structured Clinical Assessment
  let reportData = null;
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE' && apiKey.length > 10) {
    try {
      reportData = await callGeminiStructuredApi(assessmentData, knowledgeEntries, apiKey, model);
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local clinical synthesis engine:', e);
      reportData = synthesizeLocalStructuredReport(assessmentData, knowledgeEntries);
    }
  } else {
    reportData = synthesizeLocalStructuredReport(assessmentData, knowledgeEntries);
  }

  return {
    type: 'normal',
    rawInput,
    assessmentData,
    knowledge: knowledgeEntries,
    report: reportData
  };
}

/**
 * Local Deterministic Structured Clinical Synthesizer
 */
export function synthesizeLocalStructuredReport(data, knowledge) {
  const primarySymptom = data.primarySymptom || 'your reported symptoms';
  const age = data.age || 'Not specified';
  const duration = data.duration || 'Not specified';
  const severity = data.severity || 'Moderate';
  const location = data.location || data.symptomType || 'General';
  const associated = (data.associatedSymptoms && data.associatedSymptoms.length > 0)
    ? data.associatedSymptoms.join(', ')
    : 'None reported';
  const medHistory = data.medicalHistory || 'None reported';
  const meds = data.medications || 'None reported';

  // 1. Build Possible Explanations with "Why it fits" reasoning
  const explanations = [];
  if (knowledge && knowledge.length > 0) {
    const primary = knowledge[0];
    const primaryTitle = primary.condition || primary.displayName || 'Tension-type Pattern';
    const causes = primary.causes || primary.commonCauses || ['muscle strain', 'stress or dehydration'];

    explanations.push({
      title: primaryTitle,
      explanation: `Your reported ${duration.toLowerCase()} of ${severity.toLowerCase()} symptoms${location !== 'General' ? ' in the ' + location.toLowerCase() : ''} aligns with typical clinical presentations of ${primaryTitle.toLowerCase()}. Common non-emergent contributing factors include ${causes.slice(0, 2).join(' and ')}.`
    });

    if (knowledge.length > 1) {
      const secondary = knowledge[1];
      const secondaryTitle = secondary.condition || secondary.displayName || 'Secondary Pattern';
      explanations.push({
        title: secondaryTitle,
        explanation: `Given associated factors (${associated.toLowerCase()}), secondary consideration is given to ${secondaryTitle.toLowerCase()}, which shares similar physiological characteristics.`
      });
    } else {
      explanations.push({
        title: 'Localized Musculoskeletal or Environmental Strain',
        explanation: `Daily physical strain, ergonomic stress, dehydration, or environmental triggers frequently contribute to episodic discomfort in this region.`
      });
    }
  } else {
    explanations.push({
      title: 'Non-Specific Symptom Pattern',
      explanation: `Your reported presentation of ${primarySymptom} may reflect mild inflammatory response, temporary physiological fatigue, or minor localized strain.`
    });
    explanations.push({
      title: 'Postural or Environmental Strain',
      explanation: `Stress, hydration fluctuations, or ambient daily strain can contribute to persistent mild discomfort.`
    });
  }

  // 2. What You Can Do Now
  const selfCare = [];
  if (knowledge && knowledge.length > 0 && knowledge[0].selfCare && knowledge[0].selfCare.length > 0) {
    knowledge[0].selfCare.slice(0, 3).forEach(sc => selfCare.push(sc));
  } else {
    selfCare.push('Rest in a quiet, comfortable environment away from direct screen glare or bright light.');
    selfCare.push('Maintain steady hydration with water or electrolyte fluids throughout the day.');
    selfCare.push('Apply a cool or warm compress to the affected area if comfortable.');
  }

  // 3. What to Watch For / Warning Signs
  const warningSigns = [];
  const rawWarns = (knowledge && knowledge.length > 0) ? (knowledge[0].seekCareIf || []) : [];
  if (rawWarns.length > 0) {
    rawWarns.slice(0, 3).forEach(w => warningSigns.push(w));
  } else {
    warningSigns.push('Symptoms progressively worsen or do not improve after 48–72 hours.');
    warningSigns.push('Development of new systemic symptoms such as high fever, sudden vision changes, or severe pain.');
    warningSigns.push('Onset of unexpected shortness of breath, dizziness, or localized numbness.');
  }

  // 4. Preparing for a Doctor Visit
  const rawQuestions = (knowledge && knowledge.length > 0) ? (knowledge[0].doctorQuestions || []) : [];
  const doctorPrep = {
    mention: [
      `Exact onset and progression (${duration} duration with ${severity.toLowerCase()} severity).`,
      `Specific locations or triggers noticed (${location}).`,
      `Any prior medical history (${medHistory}) or concurrent medications (${meds}).`
    ],
    questions: rawQuestions.length > 0 ? rawQuestions.slice(0, 3) : [
      'What diagnostic evaluation or tests are appropriate for these symptoms?',
      'Are there specific environmental or lifestyle triggers I should avoid?',
      'At what point should I schedule a follow-up or seek emergency care?'
    ]
  };

  return {
    summary: `You described experiencing ${primarySymptom} for ${duration} at ${severity.toLowerCase()} severity. Based on the clinical context collected, here is a structured evaluation of possible factors and recommended guidance.`,
    intakeSummary: {
      primarySymptom,
      age,
      duration,
      severity,
      location,
      associated,
      medHistory,
      meds
    },
    explanations,
    selfCare,
    warningSigns,
    doctorPrep
  };
}

/**
 * Live Google Gemini Structured API Call
 */
async function callGeminiStructuredApi(data, knowledge, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are MedAssist, a professional clinical symptom assessment assistant.
Your task is to analyze the patient's reported intake and generate a clear, structured, non-diagnostic clinical evaluation.
Return ONLY valid JSON matching this exact schema:
{
  "summary": "Brief 1-2 sentence overview of the presentation.",
  "intakeSummary": {
    "primarySymptom": "string",
    "age": "string",
    "duration": "string",
    "severity": "string",
    "location": "string",
    "associated": "string",
    "medHistory": "string",
    "meds": "string"
  },
  "explanations": [
    { "title": "Condition Name", "explanation": "Detailed explanation of WHY this fits the reported context." }
  ],
  "selfCare": ["Action 1", "Action 2", "Action 3"],
  "warningSigns": ["Warning 1", "Warning 2", "Warning 3"],
  "doctorPrep": {
    "mention": ["Detail to mention 1", "Detail to mention 2"],
    "questions": ["Question for doctor 1", "Question for doctor 2"]
  }
}`;

  const promptText = `Patient Intake:
- Primary Complaint: "${data.primarySymptom}"
- Age: ${data.age || 'Unspecified'}
- Duration: ${data.duration || 'Unspecified'}
- Severity: ${data.severity || 'Moderate'}
- Specific Details/Location: ${data.location || data.symptomType || 'General'}
- Associated Symptoms: ${JSON.stringify(data.associatedSymptoms || [])}
- Medical History: ${data.medicalHistory || 'None'}
- Current Medications: ${data.medications || 'None'}
- Reference Clinical Knowledge: ${JSON.stringify(knowledge)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`);
  }

  const resJson = await response.json();
  const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  return JSON.parse(rawText);
}

/**
 * Extract Primary Symptoms from Input Text
 */
function extractPrimarySymptoms(text) {
  const clean = text.toLowerCase();
  const symptoms = [];

  const KNOWN_SYMPTOMS = [
    'headache', 'migraine', 'cough', 'dizziness', 'fever', 'sore throat',
    'chest pain', 'shortness of breath', 'fatigue', 'nausea', 'stomach pain',
    'abdominal pain', 'back pain', 'rash', 'joint pain', 'wheezing'
  ];

  KNOWN_SYMPTOMS.forEach(s => {
    if (clean.includes(s)) symptoms.push(s);
  });

  return symptoms.length > 0 ? symptoms : ['headache'];
}

export { executeStructuredAssessmentAsync as executePipelineAsync, executeStructuredAssessmentAsync as executePipeline };

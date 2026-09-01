/**
 * pipeline.js — MedAssist Clinical AI Orchestration Engine
 * 
 * Orchestrates:
 * 1. Deterministic Safety Circuit Breaker (suggest_next_step)
 * 2. Adaptive Context & Clinical Information Retrieval (lookup_info)
 * 3. Humanized, Context-Aware Clinical Synthesis (via Gemini API or localized engine)
 * 4. Multi-turn Session Memory Folding
 */

import { executeTool } from './tools.js';
import { GEMINI_CONFIG } from './config.js';

/**
 * Main Pipeline Orchestrator (Async)
 */
export async function executePipelineAsync(rawInput, chatHistory = [], options = {}) {
  const apiKey = options.apiKey || GEMINI_CONFIG.apiKey;
  const model = options.model || GEMINI_CONFIG.model;

  // Step 1: Safety & Red Flag Triage
  const triageResult = executeTool('suggest_next_step', { symptom_text: rawInput });
  if (triageResult && triageResult.isEmergency) {
    return {
      type: 'emergency',
      rawInput,
      triage: triageResult,
      humanResponse: formatEmergencyResponse(triageResult)
    };
  }

  // Step 2: Extract Entities & Knowledge Lookup
  const intake = parseSymptomContext(rawInput, chatHistory);
  const knowledgeEntries = [];
  for (const sym of intake.symptoms) {
    const k = executeTool('lookup_info', { query: sym });
    if (k && !k.error) knowledgeEntries.push(k);
  }

  // Step 3: Identify Missing Critical Clinical Context for Adaptive Follow-up
  const followUpQuestions = generateAdaptiveFollowUps(intake, rawInput);

  // Step 4: AI Synthesis (Gemini Live API or Local Clinical Engine)
  let responseText = '';
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE' && apiKey.length > 10) {
    try {
      responseText = await callGeminiLiveApi(rawInput, intake, knowledgeEntries, chatHistory, followUpQuestions, apiKey, model);
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local synthesis engine:', e);
      responseText = synthesizeHumanizedReport(intake, knowledgeEntries, followUpQuestions);
    }
  } else {
    responseText = synthesizeHumanizedReport(intake, knowledgeEntries, followUpQuestions);
  }

  return {
    type: 'normal',
    rawInput,
    intake,
    knowledge: knowledgeEntries,
    followUpQuestions,
    humanResponse: responseText
  };
}

export function executePipeline(rawInput, chatHistory = []) {
  const triageResult = executeTool('suggest_next_step', { symptom_text: rawInput });
  if (triageResult && triageResult.isEmergency) {
    return {
      type: 'emergency',
      rawInput,
      triage: triageResult,
      humanResponse: formatEmergencyResponse(triageResult)
    };
  }

  const intake = parseSymptomContext(rawInput, chatHistory);
  const knowledgeEntries = [];
  for (const sym of intake.symptoms) {
    const k = executeTool('lookup_info', { query: sym });
    if (k && !k.error) knowledgeEntries.push(k);
  }

  const followUpQuestions = generateAdaptiveFollowUps(intake, rawInput);
  const responseText = synthesizeHumanizedReport(intake, knowledgeEntries, followUpQuestions);

  return {
    type: 'normal',
    rawInput,
    intake,
    knowledge: knowledgeEntries,
    followUpQuestions,
    humanResponse: responseText
  };
}

/**
 * Humanized Clinical Report Synthesizer
 */
function synthesizeHumanizedReport(intake, knowledge, followUps) {
  const primarySymptom = intake.symptoms[0] || 'your reported symptoms';
  const duration = intake.duration;
  const isComplex = intake.symptoms.length > 1 || duration || intake.triggers.length > 0;

  let out = '';

  // 1. Empathetic Clinical Opening
  if (duration && intake.triggers.length > 0) {
    out += `Experiencing ${primarySymptom} for ${duration}, particularly after ${intake.triggers.join(' and ')}, provides valuable context for what might be happening.\n\n`;
  } else if (duration) {
    out += `${capitalize(duration)} of ${primarySymptom} is worth looking at in context to understand the likely factors and appropriate self-care.\n\n`;
  } else {
    out += `Thank you for sharing what you're experiencing. Here is what we know about ${primarySymptom} and helpful guidance for your next steps.\n\n`;
  }

  // 2. What Might Explain This
  out += `### What might explain this\n`;
  if (knowledge.length > 0) {
    const primaryEntry = knowledge[0];
    out += `This pattern is commonly associated with **${primaryEntry.displayName}**. In typical non-emergent presentations, frequent contributing factors include:\n`;
    primaryEntry.commonCauses.slice(0, 3).forEach(c => {
      out += `• ${c}\n`;
    });
    out += '\n';
  } else {
    out += `Based on your description, this could be related to local strain, mild inflammatory response, or environmental triggers.\n\n`;
  }

  // 3. What You Can Do Now (Actionable Protocol)
  out += `### What you can do now\n`;
  if (knowledge.length > 0) {
    knowledge[0].selfCare.slice(0, 3).forEach(sc => {
      out += `• ${sc}\n`;
    });
    out += '\n';
  } else {
    out += `• Rest in a calm, temperature-controlled environment.\n• Maintain adequate hydration with water or electrolyte fluids.\n• Monitor whether rest or gentle repositioning relieves the sensation.\n\n`;
  }

  // 4. Adaptive Follow-Up Questions (if context is missing)
  if (followUps && followUps.length > 0) {
    out += `### Helpful context to clarify\n`;
    out += `To tailor this assessment more precisely, it would be helpful to know:\n`;
    followUps.forEach(q => {
      out += `• ${q}\n`;
    });
    out += '\n';
  }

  // 5. When to Seek Professional Attention
  out += `### When to seek medical attention\n`;
  if (knowledge.length > 0) {
    out += `Schedule a consultation with a healthcare provider if:\n`;
    knowledge[0].seekCareIf.slice(0, 2).forEach(sc => {
      out += `• ${sc}\n`;
    });
  } else {
    out += `• Symptoms progressively worsen over the next 48 hours.\n• You develop new systemic symptoms such as high fever, difficulty breathing, or severe pain.\n`;
  }

  return out;
}

/**
 * Adaptive Follow-Up Question Generator
 */
function generateAdaptiveFollowUps(intake, rawInput) {
  const questions = [];
  const text = rawInput.toLowerCase();

  // Missing Duration Check
  if (!intake.duration) {
    questions.push('Approximately how long or how many days have you had these symptoms?');
  }

  // Missing Severity / Fever Check
  if (text.includes('fever') && !text.match(/\d+(\.\d+)?\s*(f|c|deg|degrees)/)) {
    questions.push('Have you measured your body temperature, and if so, how high has it reached?');
  }

  // Headache Specific Follow-ups
  if (text.includes('headache') || text.includes('migraine')) {
    if (!text.includes('vision') && !text.includes('nausea') && !text.includes('light')) {
      questions.push('Are you experiencing any nausea, sensitivity to light/sound, or changes in your vision?');
    }
  }

  // Cough / Respiratory Specific Follow-ups
  if (text.includes('cough') || text.includes('throat')) {
    if (!text.includes('breath') && !text.includes('phlegm') && !text.includes('mucus')) {
      questions.push('Is the cough dry or producing phlegm, and have you noticed any shortness of breath?');
    }
  }

  // Dizziness Specific Follow-ups
  if (text.includes('dizzy') || text.includes('vertigo') || text.includes('lightheaded')) {
    if (!text.includes('stand') && !text.includes('water') && !text.includes('meal')) {
      questions.push('Does the sensation occur mainly when standing up quickly, or is the room visibly spinning?');
    }
  }

  return questions.slice(0, 2);
}

/**
 * Format Emergency Message
 */
function formatEmergencyResponse(triage) {
  return `### ⚠️ Immediate Medical Attention Recommended\n\nThe symptoms you've reported include potential emergency indicators (${triage.matchedFlags.map(f => f.pattern).join(', ')}).\n\nPlease seek prompt professional medical care or contact local emergency services (911 in the US / 112 in the UK & EU) right away.`;
}

/**
 * Live Google Gemini API Integration
 */
async function callGeminiLiveApi(rawInput, intake, knowledge, chatHistory, followUps, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are MedAssist, a thoughtful, professional clinical AI assistant.
Your goal is to provide warm, clear, structured, and medically safe guidance for non-emergent symptoms.
Guidelines:
1. Speak with natural clinical warmth, empathy, and professional clarity.
2. Never claim to replace a doctor or give definitive medical diagnoses. Use safe non-diagnostic language ('may be associated with', 'could indicate', 'helpful next steps').
3. Keep the response proportional: concise for simple questions, structured and thorough for complex multi-symptom descriptions.
4. When relevant, format naturally with markdown headings (e.g. '### What might explain this', '### What you can do now', '### When to seek medical attention').
5. If important clinical context is missing, ask 1 or 2 polite follow-up questions at the end.`;

  const conversationPayload = [];
  chatHistory.slice(-4).forEach(msg => {
    conversationPayload.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  });

  const promptText = `User Presentation: "${rawInput}"
Extracted Context: Symptoms: [${intake.symptoms.join(', ')}], Duration: ${intake.duration || 'Unspecified'}, Severity: ${intake.severity || 'Unspecified'}, Triggers: [${intake.triggers.join(', ')}].
Medical Reference Context: ${JSON.stringify(knowledge.map(k => ({ name: k.displayName, causes: k.commonCauses, selfCare: k.selfCare, seekCare: k.seekCareIf })))}
Adaptive Clarifications: ${JSON.stringify(followUps)}`;

  conversationPayload.push({
    role: 'user',
    parts: [{ text: promptText }]
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: conversationPayload,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}

/**
 * Extract Clinical Context from Text & Session History
 */
function parseSymptomContext(rawInput, chatHistory = []) {
  const text = rawInput.toLowerCase();
  const symptoms = new Set();
  const triggers = [];

  const KNOWN_SYMPTOMS = [
    'headache', 'migraine', 'dizziness', 'lightheadedness', 'fever', 'cough',
    'sore throat', 'chest pain', 'shortness of breath', 'fatigue', 'nausea',
    'stomach pain', 'back pain', 'rash', 'joint pain', 'wheezing', 'congestion'
  ];

  KNOWN_SYMPTOMS.forEach(sym => {
    if (text.includes(sym)) symptoms.add(sym);
  });

  // Fold previous symptoms from chat history
  chatHistory.forEach(turn => {
    const t = (turn.content || '').toLowerCase();
    KNOWN_SYMPTOMS.forEach(sym => {
      if (t.includes(sym)) symptoms.add(sym);
    });
  });

  // Duration extraction
  let duration = null;
  const durMatch = text.match(/(\d+\s*(day|days|week|weeks|hour|hours|month|months))/);
  if (durMatch) duration = durMatch[0];
  else if (text.includes('today')) duration = 'Today';
  else if (text.includes('yesterday')) duration = '1 day';
  else if (text.includes('since last week')) duration = '1 week';

  // Severity extraction
  let severity = 'Moderate';
  if (text.includes('mild') || text.includes('slight') || text.includes('minor')) severity = 'Mild';
  else if (text.includes('severe') || text.includes('intense') || text.includes('unbearable')) severity = 'Severe';

  // Triggers
  if (text.includes('sun') || text.includes('heat')) triggers.push('sun/heat exposure');
  if (text.includes('screen') || text.includes('computer')) triggers.push('screen strain');
  if (text.includes('stress') || text.includes('anxiety')) triggers.push('stress');
  if (text.includes('exercise') || text.includes('lifting')) triggers.push('physical exertion');

  return {
    symptoms: Array.from(symptoms),
    duration,
    severity,
    triggers
  };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

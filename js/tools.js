/**
 * tools.js — Custom Tool Implementations (ReAct Pattern)
 * 
 * Simulates the lookup_info and suggest_next_step tools
 * described in the agent system prompt. Each tool returns
 * structured data that grounds the pipeline's output.
 */

import { queryKnowledgeBase } from './knowledge.js?v=4';
import { triageSymptoms } from './triage.js?v=4';

/**
 * lookup_info(symptom)
 * 
 * Retrieves general, educational facts about a given symptom.
 * Returns common non-severe causes, typical characteristics.
 * 
 * @param {string} symptom - The symptom to look up
 * @returns {Object} { found, entries[], toolOutput }
 */
export function lookup_info(symptom) {
  const results = queryKnowledgeBase([symptom]);

  if (results.length === 0) {
    return {
      found: false,
      entries: [],
      toolOutput: `No specific educational information found for "${symptom}". The knowledge base may not cover this symptom. Recommend the user describe their symptoms using more common terms.`
    };
  }

  const summaries = results.map(r => ({
    condition: r.displayName,
    emoji: r.emoji,
    causes: r.commonCauses,
    selfCare: r.selfCare,
    doctorQuestions: r.doctorQuestions,
    seekCareIf: r.seekCareIf
  }));

  return {
    found: true,
    entries: summaries,
    toolOutput: `Found ${results.length} relevant condition(s): ${results.map(r => r.displayName).join(', ')}. Retrieved common causes, self-care guidelines, and escalation criteria.`
  };
}

/**
 * suggest_next_step(symptom)
 * 
 * Evaluates symptoms for emergency red flags and returns
 * non-diagnostic home care tips or urgent care recommendations.
 * 
 * @param {string} symptomDescription - Raw description to evaluate
 * @returns {Object} { isEmergency, riskLevel, flags[], guidance, toolOutput }
 */
export function suggest_next_step(symptomDescription) {
  const triageResult = triageSymptoms(symptomDescription);

  if (triageResult.isEmergency) {
    return {
      isEmergency: true,
      riskLevel: 'EMERGENCY',
      flags: triageResult.matchedFlags.map(f => f.pattern),
      categories: triageResult.categories,
      actions: triageResult.actions,
      guidance: 'STOP — Red flags detected. Immediate emergency action required.',
      toolOutput: `⚠️ EMERGENCY RED FLAGS DETECTED: ${triageResult.matchedFlags.map(f => f.pattern).join(', ')}. Categories: ${triageResult.categories.map(c => c.label).join(', ')}. User should call emergency services immediately.`
    };
  }

  return {
    isEmergency: false,
    riskLevel: 'LOW',
    flags: [],
    categories: [],
    actions: [],
    guidance: 'No emergency red flags detected. Safe to proceed with educational information and self-care guidance.',
    toolOutput: 'No emergency red flags detected. Symptoms appear non-emergent. Safe to provide educational information and home care suggestions.'
  };
}

/**
 * executeTool dispatcher
 */
export function executeTool(toolName, args = {}) {
  if (toolName === 'lookup_info') {
    return lookup_info(args.query || args.symptom || '');
  }
  if (toolName === 'suggest_next_step') {
    return suggest_next_step(args.symptom_text || args.symptom || '');
  }
  return { error: `Unknown tool: ${toolName}` };
}

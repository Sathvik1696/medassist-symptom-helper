/**
 * renderer.js — Quiet Luxury Clinical Dossier Renderer
 * 
 * Renders structured, interactive tabbed clinical dossiers with:
 * - Multi-Tab Navigation (Overview, Protocol, Physician Guide, ReAct Trace)
 * - Copy / Export Report Actions
 * - Speech Audio Synthesis Trigger
 * - Zero Cluttered Disclaimer Spam (Streamlined Quiet Luxury Layout)
 */

/**
 * Main Render Dispatcher
 */
export function renderResult(result, dossierId = 'dossier-' + Date.now()) {
  if (result.type === 'emergency') {
    return renderEmergencyDossier(result, dossierId);
  }
  if (result.type === 'error') {
    return renderErrorCard(result.message);
  }
  return renderNormalDossier(result, dossierId);
}

/**
 * Render Standard Tabbed Luxury Clinical Dossier
 */
function renderNormalDossier(result, dossierId) {
  const { intake, knowledge, missingQuestions, reactTrace } = result;

  const riskClass = `risk-${(intake.riskLevel || 'LOW').toLowerCase()}`;
  const severityClass = `severity-${(intake.severity || 'Unspecified').toLowerCase()}`;
  const caseNumber = Math.floor(100000 + Math.random() * 900000);

  // 1. Build Symptoms Tags
  const symptomTags = (intake.symptoms && intake.symptoms.length > 0)
    ? intake.symptoms.map(s => `<span class="symptom-tag-pill">${escapeHtml(capitalize(s))}</span>`).join('')
    : '<span style="color: var(--platinum-500);">Unspecified Symptoms</span>';

  // 2. Build Tab 1: Clinical Etiology & Overview
  let overviewTabContent = '';
  if (knowledge && knowledge.length > 0) {
    for (const entry of knowledge) {
      overviewTabContent += `
        <div class="clinical-section-block">
          <h4 class="clinical-section-title"><span>${entry.emoji}</span> ${escapeHtml(entry.displayName)}</h4>
          <p style="font-size: 0.8rem; color: var(--platinum-400); margin-bottom: 12px; font-style: italic;">
            Documented physiological context & common clinical associations:
          </p>
          <ul class="clinical-bullet-list causes-list">
            ${entry.commonCauses.map(cause => `<li>${escapeHtml(cause)}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  } else {
    overviewTabContent = `
      <div style="padding: 16px; color: var(--platinum-400); font-size: 0.88rem;">
        No exact diagnostic clusters matched your specific search query. Clinical triage continues to monitor general safety criteria.
      </div>
    `;
  }

  // 3. Build Tab 2: Therapeutic At-Home Protocol
  let protocolTabContent = '';
  if (knowledge && knowledge.length > 0) {
    for (const entry of knowledge) {
      protocolTabContent += `
        <div class="clinical-section-block">
          <h4 class="clinical-section-title"><span>🌿</span> ${escapeHtml(entry.displayName)} Protocol</h4>
          <ul class="clinical-bullet-list protocol-list">
            ${entry.selfCare.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  // 4. Build Tab 3: Physician Consultation Guide & Red Flags
  let physicianTabContent = '';
  if (knowledge && knowledge.length > 0) {
    for (const entry of knowledge) {
      physicianTabContent += `
        <div class="clinical-section-block">
          <h4 class="clinical-section-title"><span>🩺</span> Questions for Your Healthcare Provider</h4>
          <ul class="clinical-bullet-list questions-list">
            ${entry.doctorQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
          </ul>

          <div class="physician-alert-callout">
            <div class="physician-alert-title">
              <span>⚠️</span> Escalation Criteria (Schedule Consultation If):
            </div>
            <ul class="clinical-bullet-list" style="margin: 0;">
              ${entry.seekCareIf.map(item => `<li style="font-size: 0.82rem; color: #fde68a;">${escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }
  }

  // 5. Build Tab 4: ReAct Planner Execution Trace
  let traceTabContent = '';
  if (reactTrace && reactTrace.length > 0) {
    traceTabContent = `
      <div class="react-trace-terminal">
        ${reactTrace.map(step => {
          if (step.type === 'thought') {
            return `
              <div class="react-terminal-step thought-step">
                <span class="terminal-badge thought-badge">Planner Thought</span>
                <span class="terminal-text">${escapeHtml(step.text)}</span>
              </div>
            `;
          } else if (step.type === 'action') {
            return `
              <div class="react-terminal-step action-step">
                <span class="terminal-badge action-badge">Tool Invocation</span>
                <span class="terminal-text"><strong style="color: var(--emerald-400);">${escapeHtml(step.tool)}</strong>("${escapeHtml(step.input.substring(0, 75))}${step.input.length > 75 ? '...' : ''}")</span>
              </div>
              <div class="react-terminal-step obs-step">
                <span class="terminal-badge obs-badge">Tool Observation</span>
                <span class="terminal-text">${escapeHtml(step.output)}</span>
              </div>
            `;
          }
          return '';
        }).join('')}
      </div>
    `;
  } else {
    traceTabContent = `<div style="color: var(--platinum-500); font-size: 0.8rem; font-family: var(--font-mono);">No execution trace logged for this turn.</div>`;
  }

  // Missing Context Callout if any
  let missingQuestionsBlock = '';
  if (missingQuestions && missingQuestions.length > 0) {
    missingQuestionsBlock = `
      <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: var(--radius-sm); padding: 14px 18px; margin: 16px 24px;">
        <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--sapphire-400); margin-bottom: 6px;">
          ✦ Clinical Context Optimization:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${missingQuestions.map(q => `<li style="font-size: 0.84rem; color: var(--platinum-300); margin-bottom: 4px;">→ ${escapeHtml(q)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Assemble Complete Dossier Card
  return `
    <div class="clinical-dossier-card" id="${dossierId}" role="region" aria-label="Clinical Intelligence Dossier">
      
      <!-- Dossier Header -->
      <div class="dossier-header">
        <div class="dossier-title-area">
          <div class="dossier-seal">🩺</div>
          <div>
            <h3 class="dossier-title">Clinical Assessment Dossier</h3>
            <div class="dossier-subtitle">Case #${caseNumber} · Concierge Triage Intelligence</div>
          </div>
        </div>
        <div class="dossier-actions">
          <button class="dossier-action-btn copy-report-btn" data-dossier-id="${dossierId}" title="Copy formatted medical summary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy Summary
          </button>
          <button class="dossier-action-btn print-dossier-btn" data-dossier-id="${dossierId}" title="Export print-ready consultation PDF">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Export Dossier
          </button>
          <button class="dossier-action-btn speak-dossier-btn" data-dossier-id="${dossierId}" title="Listen to audio clinical briefing">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            Listen
          </button>
        </div>
      </div>

      <!-- Intake Matrix Bar -->
      <div class="intake-matrix-bar">
        <div class="matrix-cell">
          <span class="matrix-label">Reported Symptoms</span>
          <div class="matrix-value">${symptomTags}</div>
        </div>
        <div class="matrix-cell">
          <span class="matrix-label">Duration / Onset</span>
          <div class="matrix-value" style="font-weight: 500;">${escapeHtml(intake.duration || 'Not specified')}</div>
        </div>
        <div class="matrix-cell">
          <span class="matrix-label">Severity</span>
          <div class="matrix-value">
            <span class="severity-indicator-pill ${severityClass}">${escapeHtml(intake.severity || 'Unspecified')}</span>
          </div>
        </div>
        <div class="matrix-cell">
          <span class="matrix-label">Calculated Risk</span>
          <div class="matrix-value">
            <span class="risk-indicator-pill ${riskClass}">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: currentColor;"></span>
              ${escapeHtml(intake.riskLevel || 'LOW')}
            </span>
          </div>
        </div>
      </div>

      <!-- Interactive Tab Bar -->
      <div class="dossier-tabs-nav" role="tablist">
        <button class="dossier-tab-btn active" data-tab="overview" role="tab" aria-selected="true">
          <span>📋</span> Clinical Etiology
        </button>
        <button class="dossier-tab-btn" data-tab="protocol" role="tab" aria-selected="false">
          <span>🌿</span> At-Home Protocol
        </button>
        <button class="dossier-tab-btn" data-tab="physician" role="tab" aria-selected="false">
          <span>🩺</span> Physician Guide
        </button>
        <button class="dossier-tab-btn" data-tab="trace" role="tab" aria-selected="false">
          <span>⚡</span> ReAct Execution Trace
        </button>
      </div>

      <!-- Missing Questions if relevant -->
      ${missingQuestionsBlock}

      <!-- Tab Panes Content -->
      <div class="dossier-body">
        <div class="dossier-tab-pane active" data-pane="overview" role="tabpanel">
          ${overviewTabContent}
        </div>
        <div class="dossier-tab-pane" data-pane="protocol" role="tabpanel">
          ${protocolTabContent}
        </div>
        <div class="dossier-tab-pane" data-pane="physician" role="tabpanel">
          ${physicianTabContent}
        </div>
        <div class="dossier-tab-pane" data-pane="trace" role="tabpanel">
          ${traceTabContent}
        </div>
      </div>

    </div>
  `;
}

/**
 * Render Emergency Triage Response
 */
function renderEmergencyDossier(result, dossierId) {
  const { triage, reactTrace } = result;

  const categoriesHtml = (triage.categories || []).map(cat => `
    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 10px; display: flex; gap: 12px; align-items: flex-start;">
      <span style="font-size: 1.4rem;">${cat.icon}</span>
      <div>
        <strong style="color: var(--crimson-400); font-size: 0.92rem; display: block; margin-bottom: 2px;">${escapeHtml(cat.label)}</strong>
        <p style="color: var(--platinum-200); font-size: 0.84rem; margin: 0; line-height: 1.5;">${escapeHtml(cat.action)}</p>
      </div>
    </div>
  `).join('');

  const flagsHtml = (triage.matchedFlags || []).map(f =>
    `<span style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 3px 10px; border-radius: var(--radius-pill); font-size: 0.72rem; font-weight: 600;">🚨 ${escapeHtml(capitalize(f.pattern))}</span>`
  ).join(' ');

  return `
    <div class="clinical-dossier-card" id="${dossierId}" style="border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 0 40px rgba(239, 68, 68, 0.15);">
      <div style="background: linear-gradient(135deg, #1f0b0d, #140708); padding: 22px 24px; border-bottom: 1px solid rgba(239, 68, 68, 0.3); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.8rem; animation: pulseDot 1s infinite;">🚨</span>
          <div>
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--crimson-400); margin: 0;">Critical Emergency Triage Alert</h3>
            <span style="font-size: 0.72rem; color: #fca5a5; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Immediate Emergency Action Required</span>
          </div>
        </div>
        <span class="risk-indicator-pill risk-emergency">RED FLAG DETECTED</span>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 0.95rem; color: var(--platinum-100); line-height: 1.6; margin-bottom: 18px;">
          The reported clinical symptoms match high-risk acute emergency criteria. <strong>Standard information retrieval has been halted for your safety.</strong>
        </p>

        <div style="margin-bottom: 20px;">
          ${categoriesHtml}
        </div>

        <div style="background: rgba(239, 68, 68, 0.12); border: 2px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-md); padding: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <strong style="color: #fff; font-size: 1rem; display: block;">Call Emergency Medical Services Immediately</strong>
            <span style="color: var(--platinum-300); font-size: 0.8rem;">Do not operate a motor vehicle. Seek immediate transportation to nearest ER.</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="tel:911" class="emergency-dial-btn" style="text-decoration: none;">🇺🇸 911</a>
            <a href="tel:112" class="emergency-dial-btn" style="text-decoration: none;">🇪🇺 112</a>
            <a href="tel:999" class="emergency-dial-btn" style="text-decoration: none;">🇬🇧 999</a>
          </div>
        </div>

        <div>
          <span style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--platinum-500); font-weight: 600; display: block; margin-bottom: 8px;">Detected Risk Flags:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${flagsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Pipeline Stage Runner
 */
export function renderPipelineRunner(activeStageIndex = 0) {
  const steps = [
    { title: 'Extraction', desc: 'Entity NLP' },
    { title: 'Safety Triage', desc: 'suggest_next_step' },
    { title: 'Medical Facts', desc: 'lookup_info' },
    { title: 'Assembly', desc: 'Clinical Dossier' }
  ];

  const stepsHtml = steps.map((s, idx) => {
    let state = '';
    if (idx < activeStageIndex) state = 'done';
    else if (idx === activeStageIndex) state = 'active';

    return `
      <div class="runner-step-cell ${state}">
        <span class="step-cell-label">Stage 0${idx + 1}</span>
        <span class="step-cell-desc">${s.title}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="pipeline-runner-box">
      <div class="runner-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="pipeline-pulse-dot"></span>
          <span class="runner-title">ReAct Clinical Intelligence Pipeline</span>
        </div>
        <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--gold-400);">Executing...</span>
      </div>
      <div class="runner-steps-grid">
        ${stepsHtml}
      </div>
    </div>
  `;
}

/**
 * Render Error Card
 */
function renderErrorCard(message) {
  return `
    <div class="clinical-dossier-card" style="padding: 20px; border-color: rgba(245, 158, 11, 0.3);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.3rem;">ℹ️</span>
        <span style="color: var(--platinum-200); font-size: 0.9rem;">${escapeHtml(message)}</span>
      </div>
    </div>
  `;
}

/* ── Utility Functions ── */

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

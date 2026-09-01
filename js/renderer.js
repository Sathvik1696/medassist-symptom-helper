/**
 * renderer.js — Bright Modern Clinical Dossier Renderer
 * 
 * Renders structured, interactive tabbed clinical dossiers with:
 * - Multi-Tab Navigation (Etiology, Protocol, Physician Guide, ReAct Trace)
 * - Copy / Export Print PDF Actions
 * - Speech Audio Synthesis Trigger
 * - High-contrast, clean healthcare SaaS design
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
    : '<span style="color: var(--text-muted);">Unspecified Symptoms</span>';

  // 2. Build Tab 1: Clinical Etiology & Overview
  let overviewTabContent = '';
  if (knowledge && knowledge.length > 0) {
    for (const entry of knowledge) {
      overviewTabContent += `
        <div class="clinical-section-block">
          <h4 class="clinical-section-title"><span>${entry.emoji}</span> ${escapeHtml(entry.displayName)}</h4>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">
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
      <div style="padding: 16px; color: var(--text-muted); font-size: 0.88rem;">
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
              ${entry.seekCareIf.map(item => `<li style="font-size: 0.82rem; color: #92400e;">${escapeHtml(item)}</li>`).join('')}
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
                <span class="terminal-text"><strong style="color: #2dd4bf;">${escapeHtml(step.tool)}</strong>("${escapeHtml(step.input.substring(0, 75))}${step.input.length > 75 ? '...' : ''}")</span>
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
    traceTabContent = `<div style="color: var(--text-muted); font-size: 0.8rem; font-family: var(--font-mono);">No execution trace logged for this turn.</div>`;
  }

  // Missing Context Callout if any
  let missingQuestionsBlock = '';
  if (missingQuestions && missingQuestions.length > 0) {
    missingQuestionsBlock = `
      <div style="background: var(--sky-blue-subtle); border: 1px solid #bae6fd; border-radius: var(--radius-sm); padding: 12px 16px; margin: 12px 20px;">
        <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--sky-blue); margin-bottom: 4px;">
          ✦ Clinical Context Clarification:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${missingQuestions.map(q => `<li style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 2px;">→ ${escapeHtml(q)}</li>`).join('')}
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
              <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
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

      <!-- Tab Panes Content Body -->
      <div class="dossier-tab-content tab-content-overview" style="display: block;">
        ${overviewTabContent}
      </div>
      <div class="dossier-tab-content tab-content-protocol" style="display: none;">
        ${protocolTabContent}
      </div>
      <div class="dossier-tab-content tab-content-physician" style="display: none;">
        ${physicianTabContent}
      </div>
      <div class="dossier-tab-content tab-content-trace" style="display: none;">
        ${traceTabContent}
      </div>

    </div>
  `;
}

/**
 * Render Emergency Triage Response
 */
function renderEmergencyDossier(result, dossierId) {
  const { triage, reactTrace } = result;

  let flagsHtml = '';
  if (triage.matchedFlags && triage.matchedFlags.length > 0) {
    flagsHtml = triage.matchedFlags.map(f => `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 8px;">
        <strong style="color: var(--color-danger); font-size: 0.88rem;">🚨 Red Flag: ${escapeHtml(f.pattern.toUpperCase())}</strong>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Immediate emergency protocol triggered.</p>
      </div>
    `).join('');
  }

  return `
    <div class="clinical-dossier-card" id="${dossierId}" style="border: 2px solid var(--color-danger);">
      <div class="dossier-header" style="background: #fef2f2; border-bottom: 1px solid #fecaca;">
        <div class="dossier-title-area">
          <div class="dossier-seal" style="background: #fee2e2; border-color: #fca5a5; color: var(--color-danger);">🚨</div>
          <div>
            <h3 class="dossier-title" style="color: var(--color-danger);">Emergency Triage Warning</h3>
            <div class="dossier-subtitle">Critical Clinical Interception</div>
          </div>
        </div>
      </div>
      <div class="dossier-tab-content" style="display: block;">
        <p style="font-size: 0.95rem; color: var(--color-danger); font-weight: 700; margin-bottom: 14px;">
          Your symptoms indicate a potential high-risk medical emergency.
        </p>
        ${flagsHtml}
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <a href="tel:911" class="btn-primary" style="background: var(--color-danger); text-decoration: none;">🇺🇸 Call 911</a>
          <a href="tel:112" class="btn-primary" style="background: var(--color-danger); text-decoration: none;">🇪🇺 Call 112</a>
        </div>
      </div>
    </div>
  `;
}

function renderErrorCard(msg) {
  return `
    <div class="clinical-dossier-card" style="border-left: 4px solid var(--color-mod);">
      <div class="dossier-tab-content" style="display: block; color: var(--color-mod); font-weight: 600;">
        ⚠️ ${escapeHtml(msg || 'An error occurred during symptom intake.')}
      </div>
    </div>
  `;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

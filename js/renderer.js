/**
 * renderer.js — MedAssist Structured Clinical Result Renderer
 * 
 * Renders:
 * 1. Top Assessment Summary & Intake Breakdown
 * 2. Possible Explanations with "Why it fits" reasoning
 * 3. What You Can Do Now (Actionable Protocol)
 * 4. What to Watch For (Warning Signs)
 * 5. Preparing for a Doctor Visit (Observations & Questions)
 * 6. Export Actions (Copy, PDF Print, Audio Briefing with Stop toggle)
 */

/**
 * Render Complete Structured Assessment Result HTML
 */
export function renderStructuredAssessmentResult(result, dossierId = 'dossier-' + Date.now()) {
  const { report, assessmentData } = result;
  if (!report) {
    return `<div class="report-section-card" style="color: var(--color-warning);">⚠️ An error occurred while generating the assessment result. Please try again.</div>`;
  }

  const intake = report.intakeSummary || {};
  const explanations = report.explanations || [];
  const selfCare = report.selfCare || [];
  const warningSigns = report.warningSigns || [];
  const doctorPrep = report.doctorPrep || { mention: [], questions: [] };

  // 1. Build Explanations HTML
  let explanationsHtml = '';
  explanations.forEach((item, idx) => {
    explanationsHtml += `
      <div class="explanation-item-box">
        <h4 class="explanation-item-title">${idx + 1}. ${escapeHtml(item.title)}</h4>
        <p class="explanation-item-body">${escapeHtml(item.explanation)}</p>
      </div>
    `;
  });

  // 2. Build Self Care HTML
  let selfCareHtml = '';
  selfCare.forEach(tip => {
    selfCareHtml += `<li>${escapeHtml(tip)}</li>`;
  });

  // 3. Build Warning Signs HTML
  let warningSignsHtml = '';
  warningSigns.forEach(warn => {
    warningSignsHtml += `<li>${escapeHtml(warn)}</li>`;
  });

  // 4. Build Doctor Prep HTML
  let mentionHtml = '';
  (doctorPrep.mention || []).forEach(m => {
    mentionHtml += `<li>${escapeHtml(m)}</li>`;
  });

  let questionsHtml = '';
  (doctorPrep.questions || []).forEach(q => {
    questionsHtml += `<li>${escapeHtml(q)}</li>`;
  });

  return `
    <!-- Top Summary Banner -->
    <div class="result-summary-card" id="${dossierId}">
      <div class="result-summary-header">
        <span class="summary-badge-title">Clinical Assessment Summary</span>
        <div class="result-actions-top">
          <button class="result-util-btn btn-copy-assessment" data-dossier-id="${dossierId}" title="Copy summary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy Summary</span>
          </button>
          <button class="result-util-btn btn-print-assessment" data-dossier-id="${dossierId}" title="Print report">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print PDF</span>
          </button>
          <button class="result-util-btn btn-speak-assessment" data-dossier-id="${dossierId}" title="Listen to briefing">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Listen</span>
          </button>
        </div>
      </div>

      <h2 class="result-main-title">${escapeHtml(capitalize(intake.primarySymptom || 'Symptom Assessment'))}</h2>
      <p class="result-main-intro">${escapeHtml(report.summary || '')}</p>
    </div>

    <!-- Intake Breakdown Matrix -->
    <div class="intake-overview-card">
      <div class="intake-grid">
        <div class="intake-grid-item">
          <span class="intake-item-label">Age</span>
          <span class="intake-item-value">${escapeHtml(intake.age || 'Not specified')}</span>
        </div>
        <div class="intake-grid-item">
          <span class="intake-item-label">Duration</span>
          <span class="intake-item-value">${escapeHtml(intake.duration || 'Not specified')}</span>
        </div>
        <div class="intake-grid-item">
          <span class="intake-item-label">Severity</span>
          <span class="intake-item-value" style="color: var(--medical-teal);">${escapeHtml(intake.severity || 'Moderate')}</span>
        </div>
        <div class="intake-grid-item">
          <span class="intake-item-label">Location / Type</span>
          <span class="intake-item-value">${escapeHtml(intake.location || 'General')}</span>
        </div>
        <div class="intake-grid-item">
          <span class="intake-item-label">Associated Symptoms</span>
          <span class="intake-item-value">${escapeHtml(intake.associated || 'None')}</span>
        </div>
        <div class="intake-grid-item">
          <span class="intake-item-label">Medical History</span>
          <span class="intake-item-value">${escapeHtml(intake.medHistory || 'None')}</span>
        </div>
      </div>
    </div>

    <!-- Section 1: Possible Explanations -->
    <div class="report-section-card">
      <h3 class="report-section-heading">
        <span>📋</span> Possible Explanations
      </h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px; font-style: italic;">
        Based on clinical patterns that match your reported symptoms (not a definitive diagnosis):
      </p>
      ${explanationsHtml}
    </div>

    <!-- Section 2: What You Can Do Now -->
    <div class="report-section-card">
      <h3 class="report-section-heading">
        <span>🌿</span> What You Can Do Now
      </h3>
      <ul class="report-bullet-list">
        ${selfCareHtml}
      </ul>
    </div>

    <!-- Section 3: When to Seek Medical Care / Warning Signs -->
    <div class="report-section-card">
      <div class="warning-signs-box">
        <h4 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
          <span>⚠️</span> When to Seek Medical Care
        </h4>
        <p style="font-size: 0.82rem; margin-bottom: 10px;">
          Schedule an evaluation with a healthcare professional or urgent care if you notice:
        </p>
        <ul class="report-bullet-list">
          ${warningSignsHtml}
        </ul>
      </div>
    </div>

    <!-- Section 4: Preparing for a Doctor Visit -->
    <div class="report-section-card">
      <h3 class="report-section-heading">
        <span>🩺</span> Preparing for a Doctor Visit
      </h3>
      
      <div style="margin-bottom: 14px;">
        <strong style="font-size: 0.84rem; color: var(--text-primary); display: block; margin-bottom: 6px;">Information to mention:</strong>
        <ul class="report-bullet-list">
          ${mentionHtml}
        </ul>
      </div>

      <div>
        <strong style="font-size: 0.84rem; color: var(--text-primary); display: block; margin-bottom: 6px;">Questions you may want to ask:</strong>
        <ul class="report-bullet-list">
          ${questionsHtml}
        </ul>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="result-footer-actions">
      <button class="btn-restart-assessment" id="btn-restart-assessment-bottom">
        + Start Another Assessment
      </button>
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

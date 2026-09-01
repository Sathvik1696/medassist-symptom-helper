/**
 * renderer.js — MedAssist Conversation Message Renderer
 * 
 * Renders:
 * 1. User message bubble (compact, readable)
 * 2. Assistant message (natural markdown paragraphs, bullet points, contextual emergency cards, copy & listen triggers)
 */

/**
 * Render User Message HTML
 */
export function renderUserMessage(text) {
  return `
    <div class="message-row user-row">
      <div class="user-bubble">
        ${escapeHtml(text)}
      </div>
    </div>
  `;
}

/**
 * Render Assistant Message HTML
 */
export function renderAssistantMessage(result, msgId = 'msg-' + Date.now()) {
  if (result.type === 'emergency') {
    return renderEmergencyMessage(result, msgId);
  }

  const formattedHtml = parseMarkdownToHtml(result.humanResponse || '');

  return `
    <div class="message-row assistant-row" id="${msgId}">
      <div class="assistant-response-container">
        ${formattedHtml}
        
        <!-- Action Utilities Bar -->
        <div class="message-actions-bar">
          <button class="msg-util-btn copy-msg-btn" data-msg-id="${msgId}" title="Copy response">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          </button>
          <button class="msg-util-btn speak-msg-btn" data-msg-id="${msgId}" title="Listen to response">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Listen</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Emergency Warning Card
 */
function renderEmergencyMessage(result, msgId) {
  const flags = result.triage?.matchedFlags?.map(f => f.pattern.toUpperCase()).join(', ') || 'CRITICAL SYMPTOMS';

  return `
    <div class="message-row assistant-row" id="${msgId}">
      <div class="assistant-response-container">
        <div class="emergency-inline-card">
          <div class="emergency-inline-header">
            <span>⚠</span>
            <span>Seek Urgent Medical Attention</span>
          </div>
          <div class="emergency-inline-body">
            The symptoms you've described (${escapeHtml(flags)}) may require prompt professional medical evaluation. Please seek appropriate medical care right away.
          </div>
          <div class="emergency-inline-actions">
            <a href="tel:911" class="btn-emergency-dial">🇺🇸 Call 911 (US)</a>
            <a href="tel:112" class="btn-emergency-dial">🇪🇺 Call 112 (EU/UK)</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Lightweight Markdown Parser for Natural Responses
 */
function parseMarkdownToHtml(markdown) {
  if (!markdown) return '';

  let html = markdown
    // Headings
    .replace(/^### (.*$)/gim, '<h4 class="assistant-section-title">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="assistant-section-title">$1</h3>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Parse Bullet Lists
  const lines = html.split('\n');
  let inList = false;
  const processedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      if (!inList) {
        processedLines.push('<ul class="assistant-bullet-list">');
        inList = true;
      }
      const itemContent = trimmed.replace(/^[•\-]\s*/, '');
      processedLines.push(`<li>${itemContent}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmed.length > 0 && !trimmed.startsWith('<h')) {
        processedLines.push(`<p>${trimmed}</p>`);
      } else if (trimmed.length > 0) {
        processedLines.push(trimmed);
      }
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('\n');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

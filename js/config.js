/**
 * config.js — Embedded Configuration for MedAssist
 * 
 * Update your Google Gemini API key below to enable direct live Gemini AI synthesis.
 * Supported official Gemini models:
 *   - "gemini-1.5-flash" (Recommended: fast, high quality, generous free tier)
 *   - "gemini-2.0-flash" (Latest generation speed and clinical reasoning)
 *   - "gemini-1.5-pro"   (Deep clinical reasoning for complex cases)
 */

export const GEMINI_CONFIG = {
  // Enter your Google Gemini API Key here (or set via localStorage / environment)
  apiKey: localStorage.getItem('medassist_gemini_api_key') || "",
  
  // Active Gemini Model according to official Google AI documentation
  model: "gemini-1.5-flash",
  
  // When true, uses intelligent localized clinical NLP if key is unset or offline
  enableSmartLocalFallback: true
};

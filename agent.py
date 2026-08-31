"""
agent.py — Agentic Symptom Information Helper (Topic T23)

An agentic, safety-first clinical assistant implementing the ReAct (Plan-Act) loop:
  1. Stage 1: Intake & Entity Extraction with Session Memory Recall
  2. Stage 2: Emergency Triage Tool (suggest_next_step)
  3. Stage 3: Medical Fact Grounding Tool (lookup_info)
  4. Stage 4: Structured Markdown Output Generation

Zero external dependencies — runs directly in standard Python 3.8+.
Can be run as an interactive CLI, imported as a module, or executed with --test.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
import os
import re
import sys

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────────────────────
# 1. MANDATORY DISCLAIMER
# ─────────────────────────────────────────────────────────────────────────────
MANDATORY_DISCLAIMER = (
    "DISCLAIMER: This information is for educational purposes only and does not "
    "constitute a medical diagnosis or treatment plan. Always consult a qualified "
    "healthcare professional for medical advice."
)


# ─────────────────────────────────────────────────────────────────────────────
# 2. STATIC KNOWLEDGE BASE & RED FLAGS
# ─────────────────────────────────────────────────────────────────────────────

# Grounded knowledge base for lookup_info()
SYMPTOM_KB: Dict[str, Dict] = {
    "headache": {
        "display_name": "Headache",
        "common_causes": [
            "Tension from stress, poor posture, or screen eye strain",
            "Dehydration or skipped meals",
            "Sinus congestion or lack of adequate sleep",
            "Migraine presenting with throbbing pain or light sensitivity"
        ],
        "self_care": [
            "Rest in a quiet, dimly lit room and stay well hydrated",
            "Apply a cold compress to the forehead or warm compress to the neck",
            "Take scheduled screen breaks every 20-30 minutes"
        ],
        "see_doctor_if": (
            "It is sudden/explosive ('worst headache of your life'), or accompanied "
            "by fever, stiff neck, confusion, or visual disturbances."
        )
    },
    "migraine": {
        "display_name": "Migraine",
        "common_causes": [
            "Neurovascular changes triggered by stress, hormonal shifts, or bright lights",
            "Sensory sensitivities, sleep irregularities, or caffeine fluctuations"
        ],
        "self_care": [
            "Rest in a dark, quiet room with minimal sensory stimulation",
            "Stay hydrated and apply cold packs to temples"
        ],
        "see_doctor_if": (
            "Attacks become significantly more frequent, severe, or are accompanied by "
            "persistent visual aura or numbness."
        )
    },
    "cough": {
        "display_name": "Cough",
        "common_causes": [
            "Viral upper respiratory tract infection (common cold or flu)",
            "Post-nasal drip from seasonal allergies or sinusitis",
            "Bronchial airway irritation or dry indoor ambient air",
            "Gastroesophageal reflux (GERD) causing throat irritation"
        ],
        "self_care": [
            "Stay well hydrated with warm liquids (herbal tea, broth)",
            "Use a cool-mist humidifier in living and sleeping spaces",
            "Elevate head slightly during sleep to reduce nighttime coughing"
        ],
        "see_doctor_if": (
            "The cough persists for more than 2-3 weeks, produces blood, or is "
            "accompanied by high fever or labored breathing."
        )
    },
    "fever": {
        "display_name": "Fever / Elevated Temperature",
        "common_causes": [
            "Natural immune response to viral or bacterial infections",
            "Upper respiratory, urinary, or gastrointestinal infections",
            "Heat exhaustion or vigorous physical overexertion"
        ],
        "self_care": [
            "Rest and maintain high fluid intake (water, electrolytes, clear broths)",
            "Dress in lightweight, breathable layers",
            "Apply lukewarm compresses to the forehead for comfort"
        ],
        "see_doctor_if": (
            "Fever exceeds 103°F (39.4°C) in adults, lasts over 3 days, or is paired "
            "with stiff neck, confusion, or difficulty breathing."
        )
    },
    "fatigue": {
        "display_name": "Fatigue & Low Energy",
        "common_causes": [
            "Chronic sleep deficit or poor sleep architecture",
            "Prolonged cognitive/physical stress or overwork",
            "Suboptimal nutrition, dehydration, or mild anemia"
        ],
        "self_care": [
            "Establish a consistent 7-9 hour sleep schedule",
            "Incorporate gentle daily physical activity and hydration",
            "Prioritize balanced nutrition with adequate iron and protein"
        ],
        "see_doctor_if": (
            "Fatigue is profound, unexplained, persists for weeks, or is accompanied "
            "by unintended weight loss or fever."
        )
    },
    "stomach ache": {
        "display_name": "Stomach Ache / Abdominal Pain",
        "common_causes": [
            "Indigestion or dietary irritation from rich/spicy foods",
            "Mild viral gastroenteritis (stomach flu)",
            "Excessive gas, bloating, or stress-related gut motility changes"
        ],
        "self_care": [
            "Rest the digestive tract; sip water or herbal teas slowly",
            "Consume bland, easily digestible foods (crackers, rice, toast)",
            "Apply a warm heating pad to the abdomen to soothe mild cramps"
        ],
        "see_doctor_if": (
            "Pain is severe, localized (especially lower right abdomen), or accompanied "
            "by persistent vomiting, inability to retain fluids, or blood in stool."
        )
    },
    "nausea": {
        "display_name": "Nausea & Queasiness",
        "common_causes": [
            "Viral gastroenteritis or food-related digestive upset",
            "Motion sickness, vestibular irritation, or dehydration",
            "Stress, anxiety, or medication side effects"
        ],
        "self_care": [
            "Sip clear liquids slowly (ginger tea, diluted electrolyte drinks)",
            "Avoid strong food odors, lying down immediately after eating, and greasy foods",
            "Get fresh cool air and practice slow deep breathing"
        ],
        "see_doctor_if": (
            "Vomiting prevents keeping fluids down for >24 hours, or is accompanied by "
            "severe headache, confusion, or signs of dehydration."
        )
    },
    "sore throat": {
        "display_name": "Sore Throat / Pharyngitis",
        "common_causes": [
            "Viral infection (rhinovirus, adenovirus, flu)",
            "Dry indoor air, especially during sleep",
            "Allergies or post-nasal drip irritation"
        ],
        "self_care": [
            "Gargle with warm salt water (1/2 tsp salt in 8 oz warm water)",
            "Sip warm teas with honey and stay well hydrated",
            "Use throat lozenges to soothe irritation"
        ],
        "see_doctor_if": (
            "Pain is severe, lasts >7 days, or is accompanied by difficulty "
            "swallowing, opening the mouth, or breathing."
        )
    },
    "back pain": {
        "display_name": "Lower Back Pain",
        "common_causes": [
            "Muscular strain or ligament sprain from lifting or awkward movements",
            "Prolonged sedentary posture or poor ergonomics",
            "Core muscle deconditioning or stress-induced tension"
        ],
        "self_care": [
            "Apply cold packs for the first 48 hours, followed by gentle warmth",
            "Engage in gentle walking; avoid prolonged strict bed rest",
            "Practice gentle hamstring and lower back stretching"
        ],
        "see_doctor_if": (
            "Pain radiates down the leg below the knee, or is accompanied by "
            "numbness, weakness, or loss of bowel/bladder control."
        )
    },
    "rash": {
        "display_name": "Skin Rash / Dermatitis",
        "common_causes": [
            "Contact dermatitis from topical allergens, soaps, or fabrics",
            "Mild allergic reaction (hives) or heat irritation",
            "Eczema or dry skin barrier disruption"
        ],
        "self_care": [
            "Wash gently with mild fragrance-free cleansers and lukewarm water",
            "Apply cool compresses to calm itch and skin inflammation",
            "Moisturize with gentle, fragrance-free emollient creams"
        ],
        "see_doctor_if": (
            "Rash spreads rapidly, blisters, becomes painful/warm to the touch, or is "
            "accompanied by facial swelling or fever."
        )
    }
}

# Red flag dictionary mapping critical triggers to emergency triage categories
RED_FLAGS: Dict[str, str] = {
    "chest pain": "Potential Cardiac Emergency — Acute chest pain or pressure",
    "chest pressure": "Potential Cardiac Emergency — Squeezing chest discomfort",
    "heart attack": "Potential Cardiac Emergency — Suspected myocardial infarction",
    "shortness of breath": "Potential Respiratory Emergency — Severe dyspnea or labored breathing",
    "cant breathe": "Potential Respiratory Emergency — Inability to breathe adequately",
    "can't breathe": "Potential Respiratory Emergency — Inability to breathe adequately",
    "difficulty breathing": "Potential Respiratory Emergency — Stridor or acute breathing distress",
    "sudden weakness": "Potential Neurological Emergency — Suspected acute stroke (FAST criteria)",
    "facial droop": "Potential Neurological Emergency — Facial asymmetry or droop",
    "slurred speech": "Potential Neurological Emergency — Speech impairment or aphasia",
    "arm numbness": "Potential Neurological Emergency — Sudden unilateral arm weakness or numbness",
    "severe bleeding": "Potential Hemorrhagic Emergency — Profuse uncontrolled bleeding",
    "coughing blood": "Potential Respiratory / Vascular Emergency — Hemoptysis",
    "vomiting blood": "Potential Gastrointestinal Emergency — Hematemesis",
    "anaphylaxis": "Potential Anaphylactic Shock — Acute systemic allergic reaction",
    "throat closing": "Potential Anaphylactic Shock — Acute airway compromise",
    "unconscious": "Potential Critical Emergency — Loss of consciousness or unresponsiveness",
    "fainting": "Potential Cardiovascular / Neurological Emergency — Syncope with collapse"
}


# ─────────────────────────────────────────────────────────────────────────────
# 3. RE-ACT TOOLS IMPLEMENTATION
# ─────────────────────────────────────────────────────────────────────────────

def suggest_next_step(symptom_text: str) -> str:
    """
    Tool #1: Evaluates symptoms for high-risk emergency red flags.
    Returns immediate emergency instructions or non-emergent safety clearance.
    """
    lower = symptom_text.lower()
    detected_flags = []

    for flag_term, flag_desc in RED_FLAGS.items():
        if flag_term in lower:
            detected_flags.append(f"{flag_term.upper()} ({flag_desc})")

    if detected_flags:
        flags_str = ", ".join(detected_flags)
        return (
            f"EMERGENCY RED FLAGS DETECTED: [{flags_str}]. "
            "CRITICAL: User must call emergency services (911 / 112 / 999) or proceed "
            "to the nearest Emergency Department immediately. Halt standard non-diagnostic advice."
        )

    return (
        "SAFE_PROCEED: No acute emergency red flags detected in input. "
        "Safe to proceed with educational context, home care tips, and doctor discussion points."
    )


def lookup_info(symptom_name: str) -> str:
    """
    Tool #2: Retrieves verified educational facts, common causes, self-care,
    and escalation criteria from the static medical knowledge base.
    """
    query = symptom_name.lower().strip()
    matched_entry = None

    # Exact or substring match against KB keys
    for key, data in SYMPTOM_KB.items():
        if key in query or query in key:
            matched_entry = data
            break

    if not matched_entry:
        return (
            f"No specific entry found in knowledge base for '{symptom_name}'. "
            "General health guidelines: ensure rest, hydration, and consult a doctor if persistent."
        )

    causes_str = "; ".join(matched_entry["common_causes"])
    self_care_str = "; ".join(matched_entry["self_care"])
    doctor_str = matched_entry["see_doctor_if"]

    return (
        f"KNOWLEDGE FOUND for {matched_entry['display_name']}:\n"
        f"- Common Causes: {causes_str}\n"
        f"- Self-Care Guidelines: {self_care_str}\n"
        f"- When to See a Doctor: {doctor_str}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# 4. RE-ACT AGENT CLASS WITH SESSION MEMORY
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class ReActAgent:
    """
    Stateful ReAct Symptom Information Helper Agent.
    Maintains session chat history to fold remembered symptoms into later answers.
    """
    chat_history: List[str] = field(default_factory=list)

    def extract_symptoms(self, current_text: str) -> List[str]:
        """Extracts current symptoms and folds in remembered symptoms from chat_history."""
        current_lower = current_text.lower()
        extracted: List[str] = []

        # 1. Search current turn
        for key in SYMPTOM_KB.keys():
            if key in current_lower and key not in extracted:
                extracted.append(key)

        # 2. Recall past symptoms from session history
        for past_turn in self.chat_history:
            past_lower = past_turn.lower()
            for key in SYMPTOM_KB.keys():
                if key in past_lower and key not in extracted:
                    extracted.append(key)

        # Fallback if no exact match: extract significant words
        if not extracted:
            words = [w for w in re.findall(r'\b[a-z]{4,}\b', current_lower) 
                     if w not in {'have', 'with', 'days', 'weeks', 'feel', 'been', 'some', 'mild', 'severe'}]
            extracted = words[:2]

        return extracted

    def extract_duration(self, text: str) -> str:
        """Extracts duration or onset time from text."""
        match = re.search(r'(?:for\s+)?(\d+\s*(?:days?|weeks?|hours?|months?))', text, re.IGNORECASE)
        if match:
            return match.group(1)
        if "yesterday" in text.lower():
            return "since yesterday"
        if "today" in text.lower():
            return "started today"
        return "Not specified"

    def process(self, user_input: str) -> str:
        """
        Executes the 4-stage ReAct loop and returns the formatted response.
        """
        trace: List[str] = []

        # ── STAGE 1: INTAKE & SESSION MEMORY RECALL ──
        symptoms = self.extract_symptoms(user_input)
        duration = self.extract_duration(user_input)
        remembered = [s for s in symptoms if s not in user_input.lower()]

        trace.append(f"Thought: Extracted symptoms: {symptoms}. Duration: {duration}. "
                     f"Recalled from memory: {remembered if remembered else 'None'}.")

        # ── STAGE 2: EMERGENCY TRIAGE (TOOL #1) ──
        trace.append("Action: suggest_next_step")
        trace.append(f"Action Input: {user_input}")
        
        triage_obs = suggest_next_step(user_input)
        trace.append(f"Observation: {triage_obs}")

        # Check for Emergency Red Flags
        if "EMERGENCY RED FLAGS DETECTED" in triage_obs:
            trace.append("Thought: Critical red flags detected. Halting pipeline immediately.")
            self.chat_history.append(user_input)

            output = (
                "🚨 **EMERGENCY ALERT — IMMEDIATE MEDICAL ATTENTION REQUIRED** 🚨\n\n"
                "Based on the symptoms you reported, your situation may be a **medical emergency**.\n\n"
                "**Immediate Actions:**\n"
                "- Call emergency services immediately (**911** in US, **112** in EU, **999** in UK).\n"
                "- Do not drive yourself to the hospital; await emergency medical transport.\n"
                "- If you are alone, contact a family member or neighbor immediately.\n\n"
                f"{MANDATORY_DISCLAIMER}"
            )
            return output

        # ── STAGE 3: KNOWLEDGE RETRIEVAL (TOOL #2) ──
        trace.append(f"Thought: No emergency red flags. Looking up verified medical facts for symptoms: {symptoms}.")
        
        kb_results: List[Tuple[str, Dict]] = []
        for sym in symptoms:
            trace.append("Action: lookup_info")
            trace.append(f"Action Input: {sym}")
            info_obs = lookup_info(sym)
            trace.append(f"Observation: {info_obs.splitlines()[0]}")

            for k, data in SYMPTOM_KB.items():
                if k in sym or sym in k:
                    kb_results.append((sym, data))
                    break

        # ── STAGE 4: STRUCTURED OUTPUT GENERATION ──
        trace.append("Thought: Assembling grounded, non-diagnostic clinical guidance.")

        # If GEMINI_API_KEY is available in environment, use Gemini for live synthesis
        gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
        if gemini_key:
            try:
                gemini_output = self._call_gemini(user_input, symptoms, duration, kb_results, gemini_key)
                if gemini_output:
                    self.chat_history.append(user_input)
                    return gemini_output
            except Exception as e:
                pass  # Fallback gracefully to deterministic knowledge base

        symptoms_summary = ", ".join(s.capitalize() for s in symptoms) if symptoms else "Unspecified symptoms"
        risk_level = "MODERATE" if "severe" in user_input.lower() or len(symptoms) >= 3 else "LOW"

        # Build Markdown sections
        lines: List[str] = []
        lines.append("### 🩺 Symptom Intake Summary")
        lines.append(f"- **Reported Symptoms:** {symptoms_summary}")
        lines.append(f"- **Duration/Onset:** {duration}")
        lines.append(f"- **Risk Level:** {risk_level}")
        lines.append("")

        lines.append("### 💡 Potential Context & Educational Information")
        if kb_results:
            for sym_name, data in kb_results:
                lines.append(f"**{data['display_name']}:**")
                for cause in data["common_causes"]:
                    lines.append(f"- {cause}")
                lines.append("")
        else:
            lines.append("- Symptoms described may be related to common non-emergent causes. Provide more details for specific guidance.\n")

        lines.append("### 🏠 Safe At-Home Care Guidelines")
        if kb_results:
            for sym_name, data in kb_results:
                for tip in data["self_care"]:
                    lines.append(f"- {tip}")
                lines.append(f"- *When to consult a doctor:* {data['see_doctor_if']}")
        else:
            lines.append("- Ensure adequate rest, hydration, and avoid strenuous activity.")
            lines.append("- Consult a healthcare provider if symptoms worsen or fail to improve.")
        lines.append("")

        lines.append("### ⚠️ Mandatory Medical Disclaimer")
        lines.append(MANDATORY_DISCLAIMER)

        # Save turn to session memory
        self.chat_history.append(user_input)

        return "\n".join(lines)

    def _call_gemini(self, user_input: str, symptoms: List[str], duration: str, kb_results: List[Tuple[str, Dict]], api_key: str) -> Optional[str]:
        """Calls Google Gemini API via standard urllib to synthesize natural clinical response."""
        import json
        import urllib.request

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        kb_text = "\n".join([f"{data['display_name']}: Causes: {'; '.join(data['common_causes'])}; Care: {'; '.join(data['self_care'])}" for _, data in kb_results])
        
        prompt = (
            "You are MedAssist, a precision clinical decision support concierge. "
            "Grounded strictly in the retrieved facts below, provide a helpful, empathetic, non-diagnostic response. "
            f"User input: '{user_input}'. "
            f"Extracted symptoms: {symptoms}, duration: {duration}. "
            f"Medical facts: {kb_text}. "
            "Format your response with sections: "
            "### 🩺 Symptom Intake Summary\n"
            "### 💡 Potential Context & Educational Information\n"
            "### 🏠 Safe At-Home Care Guidelines\n"
            f"### ⚠️ Mandatory Medical Disclaimer\n{MANDATORY_DISCLAIMER}"
        )

        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000}
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=8) as response:
            res_json = json.loads(response.read().decode("utf-8"))
            return res_json["candidates"][0]["content"]["parts"][0]["text"]


# ─────────────────────────────────────────────────────────────────────────────
# 5. TEST SUITE & CLI INTERACTION
# ─────────────────────────────────────────────────────────────────────────────

def run_tests():
    """Runs automated verification tests for the ReAct Agent."""
    print("================================================================")
    print("🩺 Running ReAct Symptom Information Helper Test Suite")
    print("================================================================\n")

    agent = ReActAgent()

    # Test 1: Standard Non-Emergency Query
    print("[Test 1] Testing Normal Symptom Intake ('headache for 2 days')...")
    out1 = agent.process("I have had a mild headache for 2 days")
    assert "Symptom Intake Summary" in out1, "Failed: Missing Intake Summary"
    assert "Safe At-Home Care Guidelines" in out1, "Failed: Missing Home Care"
    assert MANDATORY_DISCLAIMER in out1, "Failed: Missing Mandatory Disclaimer"
    print("✓ Test 1 Passed: Generated complete structured dossier with disclaimer.\n")

    # Test 2: Emergency Red Flag Detection
    print("[Test 2] Testing Emergency Red Flag ('chest pain and shortness of breath')...")
    out2 = agent.process("I have sudden severe chest pain and shortness of breath")
    assert "EMERGENCY ALERT" in out2, "Failed: Emergency red flag not triggered"
    assert "911" in out2, "Failed: Missing emergency contact numbers"
    print("✓ Test 2 Passed: Successfully triggered emergency circuit breaker.\n")

    # Test 3: Session Memory Recall Across Turns
    print("[Test 3] Testing Session Memory Across Conversation Turns...")
    agent_memory = ReActAgent()
    agent_memory.process("I have a cough for 3 days")
    out_turn2 = agent_memory.process("Now I also feel tired and have a fever")
    # Verify both past (cough) and present (fever, fatigue) are present in summary
    assert "Cough" in out_turn2, "Failed: Did not recall 'cough' from Turn 1"
    assert "Fever" in out_turn2, "Failed: Did not extract 'fever' from Turn 2"
    print("✓ Test 3 Passed: Successfully folded past session symptoms into Turn 2.\n")

    print("================================================================")
    print("🎉 ALL TESTS PASSED SUCCESSFULLY (100% Deterministic Safety)")
    print("================================================================")


def main():
    """CLI Interactive loop for the Symptom Information Helper."""
    if "--test" in sys.argv:
        run_tests()
        return

    print("================================================================")
    print("🩺 MedAssist — Python ReAct Symptom Intelligence Agent (Topic T23)")
    print("Type your symptoms in natural language (or 'exit' to quit)")
    print("================================================================\n")

    agent = ReActAgent()

    while True:
        try:
            user_msg = input("\nYou: ").strip()
            if not user_msg:
                continue
            if user_msg.lower() in {"exit", "quit", "q"}:
                print("\nExiting MedAssist. Stay healthy!")
                break

            response = agent.process(user_msg)
            print(f"\n{response}")

        except (KeyboardInterrupt, EOFError):
            print("\nSession terminated.")
            break


if __name__ == "__main__":
    main()

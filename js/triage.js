/**
 * triage.js — Emergency Red Flag Detection Engine
 * 
 * Evaluates extracted symptoms against high-risk emergency patterns.
 * If any red flags match, the pipeline halts immediately.
 */

const RED_FLAG_CATEGORIES = {
  cardiac: {
    label: 'Cardiac Emergency',
    icon: '❤️‍🔥',
    action: 'Call emergency services (911/112) immediately. Do not drive yourself.',
    patterns: [
      // Chest pain / pressure
      'chest pain', 'chest pressure', 'chest tightness', 'chest squeezing',
      'crushing chest', 'pain in chest', 'heaviness in chest', 'chest hurts',
      'heart attack', 'heart pain',
      // Radiating pain
      'jaw pain with chest', 'arm pain with chest', 'left arm pain',
      'pain spreading to arm', 'pain spreading to jaw',
      // Cardiac arrest signs
      'heart stopped', 'no pulse', 'collapsed', 'unresponsive'
    ]
  },
  neurological: {
    label: 'Neurological Emergency',
    icon: '🧠',
    action: 'Call emergency services (911/112) immediately. Note the time symptoms started.',
    patterns: [
      // Stroke signs (FAST)
      'sudden weakness', 'sudden numbness', 'one side of body',
      'face drooping', 'face droop', 'arm weakness', 'arm drift',
      'slurred speech', 'difficulty speaking', 'can\'t speak', 'cannot speak',
      'speech problems', 'words come out wrong', 'trouble talking',
      // Severe headache
      'worst headache', 'thunderclap headache', 'worst headache of my life',
      'sudden severe headache', 'explosive headache',
      // Seizure
      'seizure', 'convulsion', 'fitting', 'fits',
      // Consciousness
      'loss of consciousness', 'passed out', 'fainted and won\'t wake',
      'unresponsive', 'unconscious'
    ]
  },
  respiratory: {
    label: 'Respiratory Emergency',
    icon: '🫁',
    action: 'Call emergency services (911/112) immediately. Sit upright and try to stay calm.',
    patterns: [
      'severe shortness of breath', 'can\'t breathe', 'cannot breathe',
      'struggling to breathe', 'gasping for air', 'suffocating',
      'choking', 'airway blocked', 'turning blue', 'blue lips',
      'cyanosis', 'lips turning blue', 'not breathing',
      'stopped breathing', 'difficulty breathing severe'
    ]
  },
  hemorrhagic: {
    label: 'Hemorrhagic Emergency',
    icon: '🩸',
    action: 'Call emergency services (911/112). Apply firm pressure to the wound with a clean cloth.',
    patterns: [
      'major bleeding', 'severe bleeding', 'uncontrolled bleeding',
      'won\'t stop bleeding', 'bleeding profusely', 'hemorrhage',
      'blood gushing', 'arterial bleeding', 'spurting blood',
      'coughing up blood', 'vomiting blood', 'blood in vomit'
    ]
  },
  psychiatric: {
    label: 'Mental Health Crisis',
    icon: '🆘',
    action: 'Please contact the Suicide & Crisis Lifeline: call or text 988 (US), or call 112/999. You are not alone.',
    patterns: [
      'suicidal', 'want to die', 'kill myself', 'end my life',
      'self harm', 'self-harm', 'hurting myself', 'want to hurt myself',
      'suicide', 'suicidal thoughts', 'suicidal ideation',
      'don\'t want to live', 'no reason to live', 'better off dead',
      'planning to end', 'overdose on purpose'
    ]
  },
  allergic: {
    label: 'Severe Allergic Reaction',
    icon: '⚠️',
    action: 'Call emergency services (911/112). Use an epinephrine auto-injector (EpiPen) if available.',
    patterns: [
      'anaphylaxis', 'anaphylactic', 'throat swelling',
      'tongue swelling', 'throat closing', 'can\'t swallow',
      'allergic reaction severe', 'face swelling rapidly',
      'hives all over', 'whole body rash with breathing'
    ]
  },
  trauma: {
    label: 'Severe Trauma',
    icon: '🚨',
    action: 'Call emergency services (911/112). Do not move the person if spinal injury is suspected.',
    patterns: [
      'severe head injury', 'skull fracture', 'spinal injury',
      'broken neck', 'impaled', 'puncture wound deep',
      'compound fracture', 'bone sticking out',
      'severe burn', 'electrocution', 'drowning'
    ]
  }
};

/**
 * Normalize input text for matching
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if input text matches any pattern using fuzzy substring matching
 */
function matchesPattern(normalizedInput, pattern) {
  // Direct substring match
  if (normalizedInput.includes(pattern)) {
    return true;
  }
  return false;
}

/**
 * Combined symptom phrase detection
 * Catches multi-symptom emergencies (e.g., "chest pain" + "can't breathe")
 */
const COMPOUND_EMERGENCIES = [
  {
    requires: [['chest pain', 'chest pressure', 'chest tightness', 'chest hurts'], ['shortness of breath', 'can\'t breathe', 'difficulty breathing', 'hard to breathe']],
    category: 'cardiac',
    flag: 'Chest pain combined with breathing difficulty'
  },
  {
    requires: [['headache', 'head pain'], ['vision loss', 'can\'t see', 'blurred vision sudden', 'vision blurry'], ['confusion', 'confused']],
    category: 'neurological',
    flag: 'Headache with vision changes and confusion'
  },
  {
    requires: [['fever', 'high temperature'], ['stiff neck', 'neck stiffness'], ['confusion', 'confused', 'light sensitivity']],
    category: 'neurological',
    flag: 'Possible meningitis — fever with neck stiffness'
  }
];

/**
 * Main triage function — evaluates symptoms for red flags
 * 
 * @param {string} rawInput - The user's raw symptom description
 * @param {Object} intakeResult - Structured intake from Stage 1 (optional enhancement)
 * @returns {Object} { isEmergency, matchedFlags[], categories[], severity, actions[] }
 */
export function triageSymptoms(rawInput, intakeResult = null) {
  const normalized = normalizeText(rawInput);
  const matchedFlags = [];
  const matchedCategories = new Set();
  const actions = new Set();

  // 1. Check each red flag category
  for (const [catKey, category] of Object.entries(RED_FLAG_CATEGORIES)) {
    for (const pattern of category.patterns) {
      if (matchesPattern(normalized, pattern)) {
        matchedFlags.push({
          pattern,
          category: catKey,
          label: category.label,
          icon: category.icon
        });
        matchedCategories.add(catKey);
        actions.add(category.action);
      }
    }
  }

  // 2. Check compound emergencies
  for (const compound of COMPOUND_EMERGENCIES) {
    const allGroupsMatch = compound.requires.every(group =>
      group.some(term => normalized.includes(term))
    );
    if (allGroupsMatch) {
      const cat = RED_FLAG_CATEGORIES[compound.category];
      matchedFlags.push({
        pattern: compound.flag,
        category: compound.category,
        label: cat.label,
        icon: cat.icon,
        isCompound: true
      });
      matchedCategories.add(compound.category);
      actions.add(cat.action);
    }
  }

  const isEmergency = matchedFlags.length > 0;

  // Deduplicate flags by pattern
  const uniqueFlags = [];
  const seenPatterns = new Set();
  for (const flag of matchedFlags) {
    if (!seenPatterns.has(flag.pattern)) {
      seenPatterns.add(flag.pattern);
      uniqueFlags.push(flag);
    }
  }

  return {
    isEmergency,
    matchedFlags: uniqueFlags,
    categories: [...matchedCategories].map(key => ({
      key,
      ...RED_FLAG_CATEGORIES[key]
    })),
    severity: isEmergency ? 'CRITICAL' : 'NONE',
    actions: [...actions]
  };
}

/**
 * Get emergency category details by key
 */
export function getEmergencyCategory(key) {
  return RED_FLAG_CATEGORIES[key] || null;
}

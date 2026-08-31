/**
 * knowledge.js — Curated Local Medical Knowledge Base
 * 
 * Contains evidence-based, non-diagnostic educational information
 * about common symptom clusters. Each entry provides:
 * - commonCauses: educational context about what may be associated
 * - selfCare: evidence-based home management tips
 * - doctorQuestions: what to ask a healthcare provider
 * - seekCareIf: non-emergency escalation criteria
 */

const SYMPTOM_DATABASE = {

  headache: {
    displayName: 'Headache',
    emoji: '🤕',
    keywords: ['headache', 'head pain', 'head ache', 'head hurts', 'head pounding', 'migraine', 'tension headache', 'head pressure'],
    commonCauses: [
      'Tension-type headaches are the most common form, often described as a band-like pressure around the head, frequently related to stress, poor posture, or muscle tension.',
      'Migraine headaches may present with throbbing pain (often one-sided), sensitivity to light and sound, and sometimes nausea or visual disturbances (aura).',
      'Dehydration, missed meals, poor sleep, excessive screen time, and caffeine withdrawal are common environmental triggers.',
      'Sinus congestion from colds or allergies can cause pressure and pain around the forehead, cheeks, and eyes.'
    ],
    selfCare: [
      'Rest in a quiet, dark room if light or noise worsens the pain.',
      'Stay well-hydrated — aim for at least 8 glasses of water throughout the day.',
      'Apply a cold compress to the forehead or a warm compress to the neck and shoulders for 15–20 minutes.',
      'Over-the-counter pain relief (acetaminophen or ibuprofen) may help — always follow package directions.',
      'Practice gentle neck stretches and relaxation techniques to relieve muscle tension.',
      'Maintain a consistent sleep schedule — both too little and too much sleep can trigger headaches.'
    ],
    doctorQuestions: [
      'How often do you experience headaches, and have they changed in frequency or character?',
      'Are there specific triggers (foods, stress, hormones, weather) that seem to precipitate them?',
      'Do you have any visual changes, numbness, or other neurological symptoms before or during the headache?',
      'What medications are you currently taking, including over-the-counter pain relievers?'
    ],
    seekCareIf: [
      'Headaches become progressively worse or more frequent over days/weeks.',
      'Pain is not relieved by over-the-counter medications.',
      'Headache is accompanied by fever, stiff neck, or rash.',
      'You experience confusion, vision changes, or weakness alongside the headache.',
      'This is a new type of headache that feels different from your usual pattern.'
    ]
  },

  fever: {
    displayName: 'Fever / Elevated Temperature',
    emoji: '🌡️',
    keywords: ['fever', 'high temperature', 'feverish', 'chills', 'feeling hot', 'temperature', 'burning up', 'sweating'],
    commonCauses: [
      'Fever is a natural immune response, commonly triggered by viral infections (cold, flu, COVID-19) or bacterial infections.',
      'Upper respiratory infections, urinary tract infections, and ear infections are frequent causes.',
      'Non-infectious causes can include heat exhaustion, certain medications, autoimmune conditions, or vaccination side effects.',
      'A low-grade fever (99–100.4°F / 37.2–38°C) is often the body\'s way of fighting minor infections.'
    ],
    selfCare: [
      'Stay well-hydrated with water, clear broths, or electrolyte solutions.',
      'Rest — your body needs energy to fight the underlying cause.',
      'Dress in lightweight clothing and use a light blanket if chills occur.',
      'A lukewarm (not cold) bath or cool compresses on the forehead can help reduce discomfort.',
      'Over-the-counter fever reducers (acetaminophen or ibuprofen) can help — follow dosing instructions.',
      'Monitor your temperature regularly and keep a log for your healthcare provider.'
    ],
    doctorQuestions: [
      'When did the fever start, and what is the highest temperature you\'ve recorded?',
      'Are there other symptoms such as cough, sore throat, urinary symptoms, or rash?',
      'Have you recently traveled, been exposed to sick contacts, or had a procedure/surgery?',
      'What medications and supplements are you currently taking?'
    ],
    seekCareIf: [
      'Fever exceeds 103°F (39.4°C) in adults or 100.4°F (38°C) in infants under 3 months.',
      'Fever persists for more than 3 days without improvement.',
      'You develop a rash, severe headache, stiff neck, or persistent vomiting.',
      'You have a weakened immune system or chronic medical conditions.',
      'You experience confusion, difficulty breathing, or chest pain alongside fever.'
    ]
  },

  cough: {
    displayName: 'Cough',
    emoji: '😷',
    keywords: ['cough', 'coughing', 'dry cough', 'wet cough', 'persistent cough', 'hacking cough', 'cough won\'t go away', 'phlegm'],
    commonCauses: [
      'Acute coughs (less than 3 weeks) are most commonly caused by upper respiratory infections, including the common cold and influenza.',
      'Post-nasal drip from allergies or sinusitis is a frequent cause of persistent cough.',
      'Asthma can present primarily as a chronic dry cough, especially at night or with exercise.',
      'Gastroesophageal reflux (GERD) can cause a chronic cough due to acid irritating the throat.',
      'Environmental irritants (smoke, dust, strong fragrances) can trigger or worsen coughing.'
    ],
    selfCare: [
      'Stay hydrated — warm liquids like herbal tea with honey can soothe the throat.',
      'Use a humidifier to add moisture to dry indoor air, especially at night.',
      'Honey (1–2 teaspoons) can help relieve cough — do NOT give to children under 1 year.',
      'Elevate your head with an extra pillow when sleeping to reduce nighttime cough.',
      'Avoid known irritants such as smoke, strong perfumes, and very cold air.',
      'Over-the-counter cough lozenges can provide temporary throat relief.'
    ],
    doctorQuestions: [
      'How long have you had the cough, and is it getting better or worse?',
      'Is the cough dry or productive (bringing up mucus)? If productive, what color is the mucus?',
      'Does the cough worsen at night, with exercise, or after eating?',
      'Do you have any history of asthma, allergies, or acid reflux?'
    ],
    seekCareIf: [
      'Cough persists for more than 3 weeks.',
      'You are coughing up discolored (green/yellow), thick, or blood-tinged mucus.',
      'Cough is accompanied by unexplained weight loss, night sweats, or prolonged fever.',
      'You experience significant shortness of breath or wheezing.',
      'Cough interferes with sleep or daily activities despite home remedies.'
    ]
  },

  soreThroat: {
    displayName: 'Sore Throat',
    emoji: '🗣️',
    keywords: ['sore throat', 'throat pain', 'throat hurts', 'painful swallowing', 'scratchy throat', 'strep', 'tonsils', 'swollen throat'],
    commonCauses: [
      'Viral pharyngitis (common cold viruses, influenza) is the most frequent cause, often accompanied by runny nose and cough.',
      'Streptococcal pharyngitis (strep throat) is a bacterial infection that typically causes severe throat pain, fever, and swollen lymph nodes without cough.',
      'Post-nasal drip, dry air (especially in winter/heated rooms), and mouth breathing during sleep can irritate the throat.',
      'Gastric acid reflux (GERD) can cause chronic sore throat, especially upon waking.',
      'Allergies, smoking, and excessive voice use (singing, shouting) are other common contributors.'
    ],
    selfCare: [
      'Gargle with warm salt water (1/2 teaspoon salt in 8 oz warm water) several times a day.',
      'Drink warm fluids — tea with honey, warm broth, or warm water with lemon.',
      'Use throat lozenges or hard candies to keep the throat moist.',
      'Use a humidifier to combat dry air, especially while sleeping.',
      'Over-the-counter pain relievers (ibuprofen or acetaminophen) can help reduce pain and inflammation.',
      'Rest your voice if overuse is a contributing factor.'
    ],
    doctorQuestions: [
      'Do you have a fever, and if so, how high?',
      'Are you experiencing any cough, runny nose, or other cold-like symptoms?',
      'Do you see white patches on your tonsils or the back of your throat?',
      'Have you been in contact with anyone diagnosed with strep throat?'
    ],
    seekCareIf: [
      'Sore throat is severe and persists for more than a week.',
      'You have difficulty swallowing liquids or opening your mouth fully.',
      'You develop a high fever (above 101°F / 38.3°C) with throat pain.',
      'You notice a lump in your neck or persistent hoarseness lasting more than 2 weeks.',
      'Recurrent sore throats (multiple times per year) are affecting your quality of life.'
    ]
  },

  nausea: {
    displayName: 'Nausea & Vomiting',
    emoji: '🤢',
    keywords: ['nausea', 'nauseous', 'feel sick', 'vomiting', 'throwing up', 'stomach upset', 'queasy', 'feel like vomiting', 'motion sick'],
    commonCauses: [
      'Viral gastroenteritis ("stomach flu") is a very common cause, often accompanied by diarrhea and abdominal cramping.',
      'Food poisoning from contaminated food or water typically causes acute onset of nausea/vomiting within hours.',
      'Motion sickness, pregnancy (morning sickness), and medication side effects are frequent non-infectious causes.',
      'Stress, anxiety, and strong emotional responses can trigger nausea through the gut-brain connection.',
      'Overeating, alcohol consumption, and indigestion are common dietary triggers.'
    ],
    selfCare: [
      'Sip clear fluids slowly — water, clear broth, or an oral rehydration solution (ORS).',
      'Follow the BRAT diet when able to eat: Bananas, Rice, Applesauce, Toast.',
      'Ginger (ginger tea, ginger ale, ginger chews) has evidence supporting its anti-nausea effects.',
      'Avoid strong odors, greasy/spicy foods, and large meals until symptoms improve.',
      'Rest in an upright or semi-reclined position — lying flat may worsen nausea.',
      'If medication-related, do not stop prescribed medication without consulting your doctor.'
    ],
    doctorQuestions: [
      'When did the nausea/vomiting start, and how frequently are you vomiting?',
      'Can you keep any fluids down?',
      'Did you eat anything unusual, or could you have been exposed to contaminated food/water?',
      'Are you taking any new medications or supplements?',
      'Is there any possibility of pregnancy?'
    ],
    seekCareIf: [
      'You are unable to keep any fluids down for more than 24 hours.',
      'You see blood in your vomit or notice it looks like coffee grounds.',
      'You show signs of dehydration: dark urine, dizziness, dry mouth, rapid heartbeat.',
      'Vomiting is accompanied by severe abdominal pain or high fever.',
      'Symptoms persist for more than 48 hours without improvement.'
    ]
  },

  fatigue: {
    displayName: 'Fatigue & Tiredness',
    emoji: '😴',
    keywords: ['fatigue', 'tired', 'exhausted', 'no energy', 'lethargic', 'sluggish', 'worn out', 'drained', 'always tired', 'low energy', 'sleepy'],
    commonCauses: [
      'Inadequate or poor-quality sleep is the most common cause — adults generally need 7–9 hours per night.',
      'Stress, anxiety, and depression are major contributors to persistent fatigue.',
      'Nutritional deficiencies (iron, vitamin D, B12) can cause significant fatigue.',
      'Sedentary lifestyle paradoxically increases fatigue — regular physical activity improves energy levels.',
      'Thyroid dysfunction (hypothyroidism), anemia, and diabetes are medical conditions commonly associated with fatigue.',
      'Medications (antihistamines, blood pressure meds, antidepressants) can cause fatigue as a side effect.'
    ],
    selfCare: [
      'Prioritize sleep hygiene: consistent schedule, dark/cool room, limit screens before bed.',
      'Engage in regular moderate exercise (30 min/day) — even brisk walking boosts energy.',
      'Eat balanced meals with complex carbohydrates, lean protein, and plenty of vegetables.',
      'Stay hydrated throughout the day — even mild dehydration can cause fatigue.',
      'Limit caffeine intake, especially after 2 PM, as it can disrupt sleep quality.',
      'Practice stress management: mindfulness, deep breathing, or journaling.'
    ],
    doctorQuestions: [
      'How long have you been feeling fatigued, and has it changed recently?',
      'Do you snore or has anyone observed you stopping breathing during sleep?',
      'Have you noticed changes in weight, appetite, or mood alongside the fatigue?',
      'What does your typical daily diet and exercise routine look like?',
      'Are you taking any medications or supplements?'
    ],
    seekCareIf: [
      'Fatigue is persistent (lasting more than 2 weeks) and not explained by lifestyle factors.',
      'You experience unintentional weight loss or gain alongside fatigue.',
      'Fatigue is accompanied by persistent low-grade fever, joint pain, or swollen lymph nodes.',
      'You have difficulty concentrating, memory problems, or mood changes.',
      'Fatigue significantly impacts your ability to work or perform daily activities.'
    ]
  },

  backPain: {
    displayName: 'Back Pain',
    emoji: '🦴',
    keywords: ['back pain', 'backache', 'lower back', 'upper back', 'back hurts', 'spine pain', 'back ache', 'lumbar pain', 'back stiffness'],
    commonCauses: [
      'Muscle strain or ligament sprain from lifting, sudden movements, or poor posture is the most frequent cause.',
      'Prolonged sitting (desk work) and sedentary lifestyle contribute to chronic back discomfort.',
      'Degenerative disc changes are a normal part of aging and may cause intermittent discomfort.',
      'Stress and tension can cause muscles in the back and shoulders to tighten and ache.',
      'Poor sleep position or an unsupportive mattress can contribute to morning back stiffness.'
    ],
    selfCare: [
      'Stay gently active — bed rest for more than a day or two can actually worsen back pain.',
      'Apply ice for the first 48–72 hours (20 min on/off), then switch to heat for muscle relaxation.',
      'Gentle stretching and exercises: knee-to-chest, cat-cow, and pelvic tilts can provide relief.',
      'Over-the-counter anti-inflammatories (ibuprofen) or acetaminophen as directed.',
      'Improve posture: ergonomic chair setup, feet flat, monitor at eye level.',
      'Avoid heavy lifting; when lifting, bend at the knees and keep the load close to your body.'
    ],
    doctorQuestions: [
      'Did the pain start after a specific injury or activity?',
      'Where exactly is the pain located, and does it radiate to the legs or feet?',
      'Do you experience numbness, tingling, or weakness in your legs?',
      'What makes the pain better or worse?'
    ],
    seekCareIf: [
      'Pain radiates down one or both legs, especially below the knee (sciatica).',
      'You develop numbness, tingling, or weakness in your legs or feet.',
      'Back pain is accompanied by unexplained weight loss or fever.',
      'Pain follows a significant fall, accident, or trauma.',
      'You have difficulty controlling your bladder or bowels (seek care urgently).'
    ]
  },

  stomachPain: {
    displayName: 'Stomach / Abdominal Pain',
    emoji: '🤧',
    keywords: ['stomach pain', 'stomach ache', 'abdominal pain', 'belly pain', 'tummy ache', 'stomach cramps', 'stomach hurts', 'abdomen hurts', 'belly ache', 'gut pain'],
    commonCauses: [
      'Indigestion (dyspepsia) from overeating, eating too quickly, or consuming irritating foods is very common.',
      'Gas and bloating from certain foods (beans, cruciferous vegetables, carbonated drinks) or swallowing air.',
      'Gastroenteritis (stomach bug) causes cramping along with nausea, vomiting, or diarrhea.',
      'Constipation can cause lower abdominal cramping and discomfort.',
      'Menstrual cramps (dysmenorrhea) are a frequent cause of lower abdominal pain in menstruating individuals.',
      'Stress and anxiety can manifest as stomach pain through the gut-brain axis.'
    ],
    selfCare: [
      'Eat smaller, more frequent meals and chew food thoroughly.',
      'Avoid foods that commonly trigger discomfort: spicy, fatty, or acidic foods.',
      'Peppermint or chamomile tea may help soothe mild stomach discomfort.',
      'Apply a warm heating pad to the abdomen for cramp relief.',
      'Stay hydrated and increase fiber intake gradually if constipation is suspected.',
      'Over-the-counter antacids may help if the pain is related to acid/indigestion.'
    ],
    doctorQuestions: [
      'Where exactly is the pain located (upper, lower, left, right, or all over)?',
      'Is the pain constant or does it come and go? Is it sharp, dull, or cramping?',
      'Are you experiencing any changes in bowel habits, nausea, or vomiting?',
      'Is the pain related to eating — does it get better or worse after meals?'
    ],
    seekCareIf: [
      'Pain is severe and sudden in onset.',
      'Abdominal pain is accompanied by fever, vomiting, or inability to eat.',
      'You notice blood in your stool, black/tarry stools, or blood in vomit.',
      'The pain is localized to the lower right abdomen (possible appendicitis).',
      'Abdominal pain persists for more than a few days or progressively worsens.'
    ]
  },

  dizziness: {
    displayName: 'Dizziness & Lightheadedness',
    emoji: '💫',
    keywords: ['dizzy', 'dizziness', 'lightheaded', 'light headed', 'room spinning', 'vertigo', 'unsteady', 'off balance', 'woozy', 'faint'],
    commonCauses: [
      'Orthostatic hypotension — a sudden drop in blood pressure when standing up quickly, causing brief lightheadedness.',
      'Dehydration and low blood sugar (skipping meals) are very common and easily correctable causes.',
      'Benign Paroxysmal Positional Vertigo (BPPV) causes brief episodes of spinning triggered by head position changes.',
      'Inner ear infections (labyrinthitis) can cause vertigo, nausea, and balance problems.',
      'Anxiety and hyperventilation can produce dizziness, tingling, and a feeling of unreality.',
      'Medication side effects (blood pressure drugs, sedatives, anti-seizure medications) are a frequent cause.'
    ],
    selfCare: [
      'Sit or lie down immediately when feeling dizzy to prevent falls.',
      'Rise slowly from sitting or lying positions — sit on the edge of the bed before standing.',
      'Stay well-hydrated and eat regular meals to maintain blood sugar and blood pressure.',
      'Avoid sudden head movements if vertigo is positional.',
      'Reduce caffeine, alcohol, and salt intake, as these can affect inner ear fluid balance.',
      'Practice balance exercises when symptom-free to improve overall stability.'
    ],
    doctorQuestions: [
      'Can you describe the dizziness — is it a spinning sensation, lightheadedness, or unsteadiness?',
      'What triggers the dizziness? Does it occur with position changes, standing, or randomly?',
      'How long do episodes last — seconds, minutes, or continuous?',
      'Do you experience hearing changes, ringing in the ears, or ear fullness?'
    ],
    seekCareIf: [
      'Dizziness is accompanied by fainting or loss of consciousness.',
      'You experience sudden severe vertigo with hearing loss or ear ringing.',
      'Dizziness occurs alongside chest pain, shortness of breath, or rapid heartbeat.',
      'You have persistent imbalance that increases your risk of falling.',
      'Symptoms started after a head injury or are progressively worsening.'
    ]
  },

  skinRash: {
    displayName: 'Skin Rash & Irritation',
    emoji: '🔴',
    keywords: ['rash', 'skin rash', 'itchy skin', 'hives', 'bumps', 'skin irritation', 'red spots', 'skin breakout', 'eczema', 'dermatitis', 'itching'],
    commonCauses: [
      'Contact dermatitis from irritants (soaps, detergents, plants like poison ivy) or allergens (nickel, latex).',
      'Eczema (atopic dermatitis) causes dry, itchy, inflamed patches and is often related to allergies or genetics.',
      'Hives (urticaria) are raised, itchy welts triggered by allergic reactions, stress, or infections.',
      'Fungal infections (ringworm, athlete\'s foot) cause characteristic ring-shaped or scaly rashes.',
      'Heat rash occurs in hot, humid conditions when sweat ducts become blocked.',
      'Viral infections (measles, chickenpox) can produce distinctive rashes, especially in children.'
    ],
    selfCare: [
      'Avoid scratching — keep nails short and consider wearing cotton gloves at night if needed.',
      'Apply a fragrance-free moisturizing cream or calamine lotion to soothe irritation.',
      'Take lukewarm (not hot) baths and use gentle, fragrance-free soaps.',
      'Over-the-counter hydrocortisone cream (1%) can reduce mild inflammation and itch.',
      'An oral antihistamine (like cetirizine or diphenhydramine) can help with itching and hives.',
      'Identify and avoid potential triggers — keep a diary to track patterns.'
    ],
    doctorQuestions: [
      'When did the rash first appear, and has it changed or spread?',
      'Have you started any new products (soaps, detergents, medications, foods)?',
      'Is the rash itchy, painful, or burning? Does it blister or weep?',
      'Do you have a history of eczema, allergies, or asthma?'
    ],
    seekCareIf: [
      'The rash is spreading rapidly or covers a large area of the body.',
      'Rash is accompanied by fever, joint pain, or feeling unwell.',
      'You notice signs of infection: increasing redness, warmth, swelling, pus, or red streaks.',
      'Rash does not improve after 1–2 weeks of home care.',
      'You develop blisters or the rash is painful rather than just itchy.'
    ]
  },

  jointPain: {
    displayName: 'Joint Pain & Stiffness',
    emoji: '🦵',
    keywords: ['joint pain', 'knee pain', 'elbow pain', 'wrist pain', 'ankle pain', 'joint stiffness', 'swollen joint', 'joint ache', 'arthritis', 'stiff joints'],
    commonCauses: [
      'Osteoarthritis — age-related wear-and-tear causing pain, stiffness, and reduced range of motion, especially in knees, hips, and hands.',
      'Overuse injuries from repetitive motions (typing, running, lifting) are very common.',
      'Sprains and strains from physical activity or minor injuries.',
      'Inflammatory conditions (rheumatoid arthritis, gout) can cause joint swelling, redness, and warmth.',
      'Viral infections (flu) can cause temporary diffuse joint achiness.'
    ],
    selfCare: [
      'Rest the affected joint and avoid activities that worsen the pain.',
      'Apply ice (20 min on/off) for acute pain/swelling, or heat for chronic stiffness.',
      'Gentle range-of-motion exercises and stretching to maintain flexibility.',
      'Over-the-counter anti-inflammatories (ibuprofen, naproxen) as directed for pain and swelling.',
      'Maintain a healthy weight — excess weight increases stress on weight-bearing joints.',
      'Consider low-impact exercise (swimming, cycling, yoga) to strengthen supporting muscles.'
    ],
    doctorQuestions: [
      'Which joints are affected, and is the pain in one joint or multiple?',
      'Is there visible swelling, redness, or warmth in the affected joints?',
      'Is the stiffness worse in the morning? If so, how long does it take to loosen up?',
      'Have you had any recent injuries, infections, or changes in physical activity?'
    ],
    seekCareIf: [
      'A joint is suddenly very swollen, red, and warm — especially if accompanied by fever.',
      'Joint pain follows an injury and you cannot bear weight or move the joint.',
      'Morning stiffness lasts more than 30 minutes daily.',
      'Joint pain persists for more than a few weeks or progressively worsens.',
      'You develop joint symptoms alongside a rash, fever, or eye inflammation.'
    ]
  },

  anxiety: {
    displayName: 'Anxiety & Stress Symptoms',
    emoji: '😰',
    keywords: ['anxiety', 'anxious', 'panic', 'panic attack', 'worry', 'worried', 'nervous', 'stress', 'stressed', 'racing heart anxiety', 'can\'t relax', 'on edge'],
    commonCauses: [
      'Generalized anxiety may present with persistent worry, restlessness, muscle tension, and difficulty concentrating.',
      'Panic attacks can cause sudden intense fear with rapid heartbeat, sweating, trembling, chest tightness, and shortness of breath.',
      'Situational stress from work, relationships, finances, or health concerns is extremely common.',
      'Excessive caffeine, poor sleep, and lack of exercise can exacerbate anxiety symptoms.',
      'Some medical conditions (hyperthyroidism, vitamin deficiencies) and medications can cause anxiety-like symptoms.'
    ],
    selfCare: [
      'Practice deep breathing: inhale for 4 counts, hold for 4, exhale for 6. Repeat 5–10 times.',
      'The 5-4-3-2-1 grounding technique: identify 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.',
      'Regular physical exercise is one of the most effective natural anxiety reducers.',
      'Limit caffeine and alcohol, both of which can trigger or worsen anxiety.',
      'Maintain a consistent sleep schedule and practice sleep hygiene.',
      'Consider mindfulness meditation apps or guided relaxation exercises.',
      'Talk to someone you trust about what you\'re feeling — social support is protective.'
    ],
    doctorQuestions: [
      'How long have you been experiencing anxiety, and how does it affect your daily life?',
      'Do you have specific triggers or does the anxiety feel constant?',
      'Have you experienced panic attacks? If so, how often?',
      'Are you using any substances (caffeine, alcohol, recreational drugs) that might contribute?',
      'Do you have a family history of anxiety or other mental health conditions?'
    ],
    seekCareIf: [
      'Anxiety significantly interferes with work, relationships, or daily functioning.',
      'You experience frequent panic attacks.',
      'You are using alcohol or other substances to cope with anxiety.',
      'You have persistent physical symptoms (chest pain, GI issues) driven by anxiety.',
      'You feel hopeless or have thoughts of self-harm (if urgent, contact 988 Lifeline).'
    ]
  },

  insomnia: {
    displayName: 'Sleep Problems & Insomnia',
    emoji: '🌙',
    keywords: ['insomnia', 'can\'t sleep', 'trouble sleeping', 'not sleeping', 'sleep problems', 'waking up at night', 'poor sleep', 'sleep difficulty'],
    commonCauses: [
      'Stress and anxiety are the most common causes of acute insomnia.',
      'Poor sleep hygiene: irregular schedule, screens before bed, caffeine late in the day, or an uncomfortable sleep environment.',
      'Medical conditions (chronic pain, asthma, GERD, restless legs) can disrupt sleep.',
      'Medications (stimulants, certain antidepressants, steroids) may cause insomnia as a side effect.',
      'Shift work, jet lag, and circadian rhythm disruptions affect sleep timing.'
    ],
    selfCare: [
      'Maintain a consistent wake-up time — even on weekends — to regulate your body clock.',
      'Create a relaxing bedtime routine: dim lights, warm bath, reading, or gentle stretching.',
      'Keep the bedroom cool (65–68°F / 18–20°C), dark, and quiet.',
      'Avoid screens (phone, TV, computer) for at least 30–60 minutes before bed.',
      'Limit caffeine after noon and avoid alcohol close to bedtime (it disrupts sleep quality).',
      'If you can\'t fall asleep within 20 minutes, get up and do something calm until you feel sleepy.'
    ],
    doctorQuestions: [
      'How long have you had trouble sleeping, and how many nights per week?',
      'Is the problem falling asleep, staying asleep, or waking too early?',
      'Do you snore, gasp, or have leg movements during sleep?',
      'What is your typical bedtime routine and sleep environment like?'
    ],
    seekCareIf: [
      'Insomnia persists for more than 3–4 weeks despite improving sleep habits.',
      'Daytime sleepiness is severe enough to affect safety (driving, operating machinery).',
      'You suspect sleep apnea (loud snoring, gasping, observed breathing pauses).',
      'You are relying on alcohol or over-the-counter sleep aids regularly.',
      'Insomnia is accompanied by significant mood changes (depression, irritability).'
    ]
  },

  allergies: {
    displayName: 'Allergies & Hay Fever',
    emoji: '🤧',
    keywords: ['allergies', 'allergy', 'hay fever', 'sneezing', 'runny nose', 'stuffy nose', 'itchy eyes', 'watery eyes', 'congestion', 'allergic'],
    commonCauses: [
      'Seasonal allergic rhinitis (hay fever) is triggered by tree, grass, or weed pollen and tends to be worst in spring and fall.',
      'Perennial allergies are caused by year-round allergens: dust mites, pet dander, mold, and cockroach droppings.',
      'Food allergies can cause oral itching, hives, GI symptoms, or in severe cases, anaphylaxis.',
      'Drug allergies can range from mild rash to severe reactions.',
      'The immune system overreacts to normally harmless substances, releasing histamine and other chemicals.'
    ],
    selfCare: [
      'Monitor local pollen counts and limit outdoor time on high-pollen days.',
      'Keep windows closed during peak pollen seasons; use air conditioning with HEPA filters.',
      'Shower and change clothes after being outdoors to remove pollen.',
      'Over-the-counter antihistamines (cetirizine, loratadine, fexofenadine) can reduce symptoms.',
      'Nasal saline rinse (neti pot or squeeze bottle) helps clear allergens from nasal passages.',
      'Reduce dust mite exposure: wash bedding in hot water weekly, use allergen-proof covers.'
    ],
    doctorQuestions: [
      'What symptoms do you experience, and when are they worst (season, location, time of day)?',
      'Have you identified specific triggers?',
      'Have you tried any over-the-counter allergy medications? Did they help?',
      'Do you have a family history of allergies, asthma, or eczema?'
    ],
    seekCareIf: [
      'Symptoms are not controlled by over-the-counter medications.',
      'You develop sinus infections (sinusitis) frequently.',
      'Allergies trigger asthma symptoms (wheezing, chest tightness, shortness of breath).',
      'You suspect a food or drug allergy — especially if you\'ve had a reaction involving swelling or breathing difficulty.',
      'Symptoms significantly impact your quality of life or productivity.'
    ]
  },

  diarrhea: {
    displayName: 'Diarrhea',
    emoji: '💧',
    keywords: ['diarrhea', 'loose stools', 'watery stool', 'frequent bowel', 'runs', 'runny stomach', 'upset stomach diarrhea'],
    commonCauses: [
      'Viral gastroenteritis is the most common cause — usually self-limiting within a few days.',
      'Food poisoning (bacterial contamination) causes acute-onset diarrhea, often with nausea and cramping.',
      'Food intolerances (lactose, gluten, fructose) can cause chronic or recurrent diarrhea.',
      'Medications, especially antibiotics, can disrupt gut bacteria and cause diarrhea.',
      'Stress and anxiety can cause diarrhea through the gut-brain connection (irritable bowel syndrome).'
    ],
    selfCare: [
      'Stay hydrated — oral rehydration solutions (ORS) are ideal; also clear broths and diluted juices.',
      'Follow the BRAT diet initially: Bananas, Rice, Applesauce, Toast.',
      'Avoid dairy, fatty foods, spicy foods, and caffeine until symptoms resolve.',
      'Wash hands thoroughly to prevent spreading if infectious.',
      'Over-the-counter loperamide (Imodium) can slow diarrhea — avoid if you have fever or bloody stools.',
      'Probiotics may help restore healthy gut bacteria, especially after antibiotics.'
    ],
    doctorQuestions: [
      'How long has the diarrhea lasted, and how many times per day?',
      'Is there blood or mucus in the stool?',
      'Have you recently traveled, eaten out, or taken antibiotics?',
      'Do you have any food intolerances or a history of bowel conditions?'
    ],
    seekCareIf: [
      'Diarrhea lasts more than 2 days (adults) or 24 hours (young children/elderly).',
      'You show signs of dehydration: dry mouth, dark urine, dizziness, rapid pulse.',
      'Stool contains blood or is black and tarry.',
      'You have a high fever (above 102°F / 38.9°C) alongside diarrhea.',
      'Severe abdominal or rectal pain accompanies the diarrhea.'
    ]
  },

  earPain: {
    displayName: 'Ear Pain',
    emoji: '👂',
    keywords: ['ear pain', 'earache', 'ear hurts', 'ear infection', 'ear pressure', 'ear ringing', 'tinnitus', 'blocked ear'],
    commonCauses: [
      'Middle ear infection (otitis media) — common in children, causes pain, pressure, and sometimes fluid drainage.',
      'Outer ear infection (swimmer\'s ear) — from water exposure or ear canal irritation.',
      'Earwax buildup can cause pressure, muffled hearing, and discomfort.',
      'Eustachian tube dysfunction from colds or allergies causes pressure and "popping" sensations.',
      'Referred pain from jaw (TMJ disorder), teeth, or throat conditions can be felt in the ear.'
    ],
    selfCare: [
      'Apply a warm compress to the affected ear for 15–20 minutes.',
      'Over-the-counter pain relievers (acetaminophen or ibuprofen) can help manage discomfort.',
      'Over-the-counter ear drops for wax softening (if earwax is suspected — not if eardrum may be perforated).',
      'Chewing gum or swallowing frequently can help equalize ear pressure.',
      'Keep the ear dry — use earplugs or a cotton ball coated with petroleum jelly when showering.',
      'Do NOT insert cotton swabs or other objects into the ear canal.'
    ],
    doctorQuestions: [
      'Which ear is affected, and when did the pain start?',
      'Do you have drainage from the ear? If so, what does it look like?',
      'Have you noticed hearing changes or ringing in the ear?',
      'Have you recently been swimming, flying, or had a cold?'
    ],
    seekCareIf: [
      'Pain is severe or worsening despite over-the-counter pain relief.',
      'You notice fluid or bloody drainage from the ear.',
      'Hearing loss accompanies the ear pain.',
      'A child under 6 months has ear pain symptoms.',
      'Ear pain is accompanied by high fever, severe headache, or facial swelling.'
    ]
  },

  eyeIrritation: {
    displayName: 'Eye Irritation & Redness',
    emoji: '👁️',
    keywords: ['eye pain', 'red eye', 'eyes hurt', 'itchy eyes', 'eye irritation', 'pink eye', 'conjunctivitis', 'blurry vision', 'dry eyes', 'watery eyes eye'],
    commonCauses: [
      'Conjunctivitis (pink eye) can be viral, bacterial, or allergic — causing redness, discharge, and itching.',
      'Dry eye syndrome from prolonged screen use, dry environments, or aging.',
      'Allergic eye reactions cause itching, tearing, and puffiness — often seasonal.',
      'Eye strain from prolonged screen use, reading, or bright lights.',
      'Foreign body sensation from dust, eyelash, or contact lens irritation.'
    ],
    selfCare: [
      'Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
      'Use preservative-free artificial tears to lubricate dry or irritated eyes.',
      'Apply a cool, damp washcloth over closed eyes for allergic symptoms.',
      'If pink eye is suspected, wash hands frequently and avoid touching/rubbing the eyes.',
      'Remove contact lenses and switch to glasses until irritation resolves.',
      'Keep screens at arm\'s length and slightly below eye level to reduce strain.'
    ],
    doctorQuestions: [
      'Is one or both eyes affected? When did the symptoms start?',
      'What type of discharge, if any — watery, thick, or crusty?',
      'Do you wear contact lenses? When were they last replaced?',
      'Have you had any recent exposure to chemicals, bright lights, or someone with pink eye?'
    ],
    seekCareIf: [
      'You experience sudden vision changes or loss of vision in one or both eyes.',
      'Eye pain is severe and not related to surface irritation.',
      'You see flashing lights, floaters, or a "curtain" across your vision.',
      'Redness is accompanied by sensitivity to light and blurred vision.',
      'Something may have scratched or penetrated the eye surface.'
    ]
  },

  urinarySymptoms: {
    displayName: 'Urinary Symptoms',
    emoji: '🚿',
    keywords: ['painful urination', 'burning urination', 'frequent urination', 'uti', 'urinary tract', 'burning pee', 'blood in urine', 'urgency', 'peeing a lot'],
    commonCauses: [
      'Urinary tract infection (UTI) — most commonly causes burning with urination, urgency, and frequency. Much more common in women.',
      'Dehydration can cause concentrated, darker urine that may burn or feel uncomfortable.',
      'Overactive bladder causes urgency and frequency without infection.',
      'Caffeine and alcohol are bladder irritants that increase urinary frequency.',
      'In men, prostate enlargement (BPH) can cause difficulty starting, weak stream, and frequency.'
    ],
    selfCare: [
      'Increase water intake significantly — aim to keep urine pale yellow.',
      'Avoid caffeine, alcohol, and spicy foods, which can irritate the bladder.',
      'Cranberry products (unsweetened juice or supplements) may help prevent UTIs — evidence is mixed but generally safe.',
      'Urinate when you feel the urge — don\'t hold it for extended periods.',
      'Wipe front to back to prevent bacterial transfer (important for women).',
      'After intercourse, urinate to help flush bacteria from the urinary tract.'
    ],
    doctorQuestions: [
      'What specific symptoms are you experiencing (burning, frequency, urgency, blood)?',
      'When did symptoms start, and have you had UTIs before?',
      'Are you experiencing fever, back/flank pain, or nausea?',
      'For women: could you be pregnant?'
    ],
    seekCareIf: [
      'Burning or pain with urination persists for more than 1–2 days.',
      'You see blood in your urine.',
      'Urinary symptoms are accompanied by fever, chills, or back/flank pain (possible kidney infection).',
      'You are pregnant and have urinary symptoms.',
      'You have recurrent UTIs (3+ per year).'
    ]
  },

  musclePain: {
    displayName: 'Muscle Pain & Soreness',
    emoji: '💪',
    keywords: ['muscle pain', 'sore muscles', 'muscle ache', 'body aches', 'muscle cramp', 'cramp', 'muscle strain', 'muscle stiffness', 'pulled muscle'],
    commonCauses: [
      'Delayed onset muscle soreness (DOMS) after unaccustomed exercise typically peaks 24–72 hours after activity.',
      'Muscle strain or "pulled muscle" from overexertion, sudden movements, or improper lifting technique.',
      'Viral infections (flu, COVID-19) commonly cause diffuse body aches and muscle pain.',
      'Dehydration and electrolyte imbalances (low potassium, magnesium) can cause cramps.',
      'Chronic stress and tension lead to persistent muscle tightness, especially in the neck, shoulders, and back.',
      'Medication side effects — statins (cholesterol drugs) are a well-known cause of muscle pain.'
    ],
    selfCare: [
      'Rest the affected muscle group and avoid activities that cause pain.',
      'Apply ice for acute injuries (first 48 hours), then transition to heat for relaxation.',
      'Gentle stretching and light movement can help relieve stiffness.',
      'Stay hydrated and ensure adequate electrolyte intake (bananas, leafy greens, nuts).',
      'Over-the-counter pain relief (ibuprofen, acetaminophen) as directed.',
      'Massage or foam rolling can help release muscle tension and improve blood flow.'
    ],
    doctorQuestions: [
      'When did the muscle pain start, and is it in a specific area or widespread?',
      'Did it follow exercise, injury, or come on without a clear cause?',
      'Are you taking any medications, especially statins or new prescriptions?',
      'Do you have weakness in the affected muscles, or just pain/soreness?'
    ],
    seekCareIf: [
      'Muscle pain is severe and came on suddenly without an obvious cause.',
      'The affected area is significantly swollen, warm, or red.',
      'You notice muscle weakness (not just soreness) that is progressing.',
      'Muscle pain is accompanied by dark or tea-colored urine (possible rhabdomyolysis — seek care urgently).',
      'Pain persists for more than a week despite rest and home treatment.'
    ]
  },

  shortnessOfBreath: {
    displayName: 'Mild Shortness of Breath',
    emoji: '🌬️',
    keywords: ['short of breath', 'breathless', 'hard to breathe', 'winded', 'out of breath', 'breathing heavy', 'panting', 'mild shortness of breath'],
    commonCauses: [
      'Physical deconditioning — being out of shape is one of the most common causes of exertional breathlessness.',
      'Anxiety and panic attacks frequently cause a sensation of not getting enough air, often with hyperventilation.',
      'Mild asthma may cause breathlessness with exertion, cold air exposure, or allergen contact.',
      'Nasal congestion from colds or allergies can create a subjective sensation of breathing difficulty.',
      'Obesity increases the work of breathing and can cause breathlessness with mild activity.',
      'Anemia (low red blood cells) reduces oxygen delivery and can cause breathlessness on exertion.'
    ],
    selfCare: [
      'Practice pursed-lip breathing: inhale through nose for 2 counts, exhale through pursed lips for 4 counts.',
      'If anxiety-related, use grounding techniques and slow, controlled breathing.',
      'Gradually increase physical activity to improve cardiovascular fitness.',
      'Maintain a healthy weight to reduce the work of breathing.',
      'Avoid known triggers (allergens, smoke, cold air) if asthma is suspected.',
      'Sleep with your head slightly elevated if breathlessness is worse lying down.'
    ],
    doctorQuestions: [
      'When does the breathlessness occur — at rest, with exertion, or lying down?',
      'How long have you noticed this, and is it getting worse?',
      'Do you have wheezing, chest tightness, or cough along with it?',
      'Do you smoke or have a history of lung or heart conditions?'
    ],
    seekCareIf: [
      'Breathlessness is new, worsening, or occurs at rest.',
      'You cannot complete sentences due to breathlessness.',
      'It is accompanied by chest pain, rapid heartbeat, or swelling in your legs.',
      'You have a history of heart or lung disease and symptoms are changing.',
      'Breathlessness is associated with fever and productive cough.'
    ]
  },

  constipation: {
    displayName: 'Constipation',
    emoji: '🧱',
    keywords: ['constipation', 'constipated', 'can\'t poop', 'hard stool', 'difficult bowel', 'bloated', 'straining', 'haven\'t gone', 'irregular bowel'],
    commonCauses: [
      'Inadequate fiber intake — most adults don\'t eat enough fruits, vegetables, and whole grains.',
      'Dehydration — insufficient water intake makes stool harder and more difficult to pass.',
      'Sedentary lifestyle — physical inactivity slows gut motility.',
      'Ignoring the urge to go can lead to harder stools and a disrupted bowel schedule.',
      'Medications (opioids, iron supplements, antacids with calcium/aluminum, some antidepressants) commonly cause constipation.',
      'Stress, travel, and changes in routine can temporarily disrupt bowel habits.'
    ],
    selfCare: [
      'Increase fiber intake gradually: aim for 25–30g/day from fruits, vegetables, legumes, and whole grains.',
      'Drink plenty of water — at least 8 glasses per day.',
      'Stay physically active — a daily walk can significantly help gut motility.',
      'Establish a routine: try sitting on the toilet at the same time each day, especially after meals.',
      'Over-the-counter options: fiber supplements (psyllium), stool softeners (docusate), or osmotic laxatives (MiraLAX) as directed.',
      'Prunes, prune juice, and kiwifruit have natural laxative properties.'
    ],
    doctorQuestions: [
      'How often are you having bowel movements, and what is your normal pattern?',
      'What does your typical daily diet look like, especially fiber and fluid intake?',
      'Are you taking any medications or supplements?',
      'Have you noticed blood in your stool, unintentional weight loss, or severe pain?'
    ],
    seekCareIf: [
      'Constipation is a significant change from your normal pattern and persists more than 2–3 weeks.',
      'You have severe abdominal pain or vomiting alongside constipation.',
      'You notice blood in or on your stool.',
      'You experience unintentional weight loss.',
      'Constipation alternates with diarrhea (may suggest irritable bowel syndrome).'
    ]
  },

  coldFlu: {
    displayName: 'Common Cold & Flu',
    emoji: '🤒',
    keywords: ['cold', 'flu', 'influenza', 'runny nose', 'stuffy nose', 'sneezing', 'body aches cold', 'chills cold', 'common cold'],
    commonCauses: [
      'The common cold is caused by over 200 different viruses (most commonly rhinoviruses) and typically runs its course in 7–10 days.',
      'Influenza (flu) is caused by influenza viruses and tends to come on suddenly with higher fever, body aches, and fatigue.',
      'Both spread through respiratory droplets and contact with contaminated surfaces.',
      'Risk increases in cold/flu season (fall–winter), crowded settings, and with weakened immunity.'
    ],
    selfCare: [
      'Rest — your body needs energy to fight the virus. Avoid strenuous activity.',
      'Stay hydrated: water, warm broths, herbal tea with honey, and electrolyte drinks.',
      'Over-the-counter multi-symptom cold/flu medications can manage symptoms — read labels carefully to avoid doubling up on ingredients.',
      'Use saline nasal spray or a neti pot to relieve congestion.',
      'Gargle with warm salt water for sore throat relief.',
      'Honey (for adults and children over 1) can soothe coughs and sore throats.',
      'Wash hands frequently and cover coughs/sneezes to avoid spreading the virus.'
    ],
    doctorQuestions: [
      'When did symptoms start, and are they getting better or worse?',
      'Do you have a fever, and if so, how high?',
      'Are you in a high-risk group (over 65, pregnant, immunocompromised, chronic conditions)?',
      'Have you had your annual flu vaccination?'
    ],
    seekCareIf: [
      'Symptoms persist beyond 10 days without improvement.',
      'Fever exceeds 103°F (39.4°C) or returns after initial improvement.',
      'You develop difficulty breathing, persistent chest pain, or severe sinus pain.',
      'You are in a high-risk group and suspect the flu — antiviral medications are most effective within 48 hours.',
      'Symptoms improve but then worsen again (may indicate secondary infection).'
    ]
  }
};

/**
 * Search the knowledge base for matching symptom entries
 * 
 * @param {string[]} symptoms - Array of extracted symptom keywords
 * @returns {Object[]} Matched knowledge entries
 */
export function queryKnowledgeBase(symptoms) {
  const matches = [];
  const matchedKeys = new Set();
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

  for (const [key, entry] of Object.entries(SYMPTOM_DATABASE)) {
    let relevanceScore = 0;

    for (const symptom of normalizedSymptoms) {
      for (const keyword of entry.keywords) {
        // Exact keyword match
        if (symptom === keyword) {
          relevanceScore += 10;
        }
        // Partial match (keyword contains symptom or vice versa)
        else if (keyword.includes(symptom) || symptom.includes(keyword)) {
          relevanceScore += 5;
        }
        // Word overlap
        else {
          const symWords = symptom.split(/\s+/);
          const kwWords = keyword.split(/\s+/);
          const overlap = symWords.filter(w => kwWords.includes(w) && w.length > 2);
          relevanceScore += overlap.length * 2;
        }
      }
    }

    if (relevanceScore > 0 && !matchedKeys.has(key)) {
      matchedKeys.add(key);
      matches.push({
        key,
        relevanceScore,
        ...entry
      });
    }
  }

  // Sort by relevance
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Return top 3 most relevant
  return matches.slice(0, 3);
}

/**
 * Get all available symptom categories (for suggestions/autocomplete)
 */
export function getAvailableCategories() {
  return Object.entries(SYMPTOM_DATABASE).map(([key, entry]) => ({
    key,
    displayName: entry.displayName,
    emoji: entry.emoji,
    keywords: entry.keywords.slice(0, 3) // preview keywords
  }));
}

/**
 * Get a specific entry by key
 */
export function getEntryByKey(key) {
  return SYMPTOM_DATABASE[key] || null;
}

// ─── App Identity ───────────────────────────────────────────────
// Change APP_NAME here to rename the app everywhere instantly
export const APP_NAME = 'Respire'
export const APP_VERSION = '0.1.0'

// ─── Days ────────────────────────────────────────────────────────
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ─── G2F Exercise Library ────────────────────────────────────────
export const G2F_EXERCISES = [
  {
    id: 'pullover_yates_row',
    name: 'Pullover + Yates Row',
    muscle: 'Back / Lats',
    isSuperset: true,
    supersetPartner: null, // First of pair
    instructions: 'Superset with no rest between. Pullover: lie on bench, arms extended, lower weight behind head and return. Yates Row: bent-over row with underhand barbell grip, elbows to sides, back slightly arched.',
    formCues: ['Keep back flat', 'Full range of motion', 'No momentum — 5 sec up, 5 sec down'],
    videoUrl: 'https://www.youtube.com/results?search_query=yates+row+4+hour+body+tim+ferriss',
    startWeightMale: 95,
    startWeightFemale: 45,
    incrementLbs: 10,
    minReps: 7,
    order: 1,
    useMachine: true,
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscle: 'Quads / Glutes',
    isSuperset: false,
    instructions: 'Shoulder-width foot placement on platform. Full range of motion. Do not lock knees at top. Slow and controlled.',
    formCues: ['Feet shoulder-width', 'Full ROM — do not lock knees', 'Drive through heels'],
    videoUrl: 'https://www.youtube.com/results?search_query=leg+press+form+full+range',
    startWeightMale: 150,
    startWeightFemale: 90,
    incrementLbs: 10,
    minReps: 7,
    order: 2,
    useMachine: true,
  },
  {
    id: 'pec_deck_dips',
    name: 'Pec Deck + Weighted Dips',
    muscle: 'Chest',
    isSuperset: true,
    instructions: 'Superset with no rest between. Pec Deck: elbows at 90°, squeeze chest at peak contraction. Weighted Dips: use dip belt with added weight, lean slightly forward for chest emphasis.',
    formCues: ['Squeeze chest at peak', 'Control the negative', 'Lean forward on dips for chest'],
    videoUrl: 'https://www.youtube.com/results?search_query=pec+deck+machine+form',
    startWeightMale: 45,
    startWeightFemale: 25,
    incrementLbs: 5,
    minReps: 7,
    order: 3,
    useMachine: true,
  },
  {
    id: 'leg_curl',
    name: 'Leg Curl',
    muscle: 'Hamstrings',
    isSuperset: false,
    instructions: 'Lying leg curl machine. Curl weight toward glutes. Slow and controlled both directions. Do not let hips rise off pad.',
    formCues: ['Hips stay on pad', 'Full curl — touch glutes if possible', 'Slow negative'],
    videoUrl: 'https://www.youtube.com/results?search_query=lying+leg+curl+machine+form',
    startWeightMale: 70,
    startWeightFemale: 40,
    incrementLbs: 5,
    minReps: 7,
    order: 4,
    useMachine: true,
  },
  {
    id: 'reverse_curl',
    name: 'Reverse Thick-Bar Curl',
    muscle: 'Biceps / Forearms',
    isSuperset: false,
    instructions: 'Use a thick bar or wrap a standard bar with a towel. Overhand grip. Curl weight up, squeeze at top, slow controlled negative.',
    formCues: ['Overhand grip', 'Elbows stay at sides', 'Full extension at bottom'],
    videoUrl: 'https://www.youtube.com/results?search_query=reverse+curl+thick+bar+forearms',
    startWeightMale: 50,
    startWeightFemale: 25,
    incrementLbs: 5,
    minReps: 7,
    order: 5,
    useMachine: false,
  },
  {
    id: 'calf_raise',
    name: 'Seated Calf Raise',
    muscle: 'Calves',
    isSuperset: false,
    instructions: 'Seated calf raise machine. Full range — all the way down (stretch), all the way up (contract). Slow and deliberate.',
    formCues: ['Maximum stretch at bottom', 'Full contraction at top', 'No bouncing'],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+calf+raise+machine+form',
    startWeightMale: 90,
    startWeightFemale: 50,
    incrementLbs: 10,
    minReps: 7,
    order: 6,
    useMachine: true,
  },
  {
    id: 'neck_resistance',
    name: 'Manual Neck Resistance',
    muscle: 'Neck',
    isSuperset: false,
    instructions: 'Use manual resistance from a partner or self-resistance with your hand. Work all four directions: forward, back, left, right. Controlled movement against resistance.',
    formCues: ['Gentle resistance', 'Full range each direction', 'No jerking'],
    videoUrl: 'https://www.youtube.com/results?search_query=manual+neck+resistance+exercise',
    startWeightMale: 0,
    startWeightFemale: 0,
    incrementLbs: 0,
    minReps: 7,
    order: 7,
    useMachine: false,
    isBodyweight: true,
  },
  {
    id: 'machine_crunch',
    name: 'Machine Crunch',
    muscle: 'Abs',
    isSuperset: false,
    instructions: 'Ab crunch machine. Full contraction — hold 1 second at peak. Slow and controlled.',
    formCues: ['Exhale on contraction', 'Hold 1 sec at peak', 'Control the return'],
    videoUrl: 'https://www.youtube.com/results?search_query=ab+crunch+machine+form',
    startWeightMale: 50,
    startWeightFemale: 30,
    incrementLbs: 5,
    minReps: 7,
    order: 8,
    useMachine: true,
    excludeFromProgression: true, // Per book: progression rules exclude abs
  },
]

// ─── Occam's Protocol Exercise Library ──────────────────────────
export const OCCAMS_WORKOUTS = {
  A: {
    machine: [
      {
        id: 'occams_pulldown',
        name: 'Close-Grip Supinated Lat Pull-Down',
        muscle: 'Back / Lats',
        instructions: 'Use close-grip attachment with underhand (supinated) grip. Pull to upper chest. Squeeze lats. Slow 5/5 cadence.',
        formCues: ['Underhand grip', 'Pull to upper chest', 'Squeeze lats at bottom', 'Lean back slightly'],
        videoUrl: 'https://www.youtube.com/results?search_query=close+grip+supinated+lat+pulldown',
        startWeightMale: 100,
        startWeightFemale: 50,
        incrementLbs: 10,
        minReps: 7,
        order: 1,
      },
      {
        id: 'occams_shoulder_press_machine',
        name: 'Machine Shoulder Press',
        muscle: 'Shoulders',
        instructions: 'Seated machine shoulder press. Full extension overhead. Slow 5/5 cadence.',
        formCues: ['Full extension at top', 'Do not lock out', 'Control the descent'],
        videoUrl: 'https://www.youtube.com/results?search_query=machine+shoulder+press+form',
        startWeightMale: 60,
        startWeightFemale: 30,
        incrementLbs: 5,
        minReps: 7,
        order: 2,
        useShoulderPressRule: true, // 60% starting weight (not 70%)
      },
    ],
    freeweight: [
      {
        id: 'occams_yates_row',
        name: 'Yates Row (EZ Bar or Barbell)',
        muscle: 'Back',
        instructions: 'Bent-over row with underhand grip. Elbows to sides. Back slightly arched. Full ROM.',
        formCues: ['Underhand grip', 'Elbows to sides', 'Back arched, not rounded'],
        videoUrl: 'https://www.youtube.com/results?search_query=yates+row+underhand+form',
        startWeightMale: 95,
        startWeightFemale: 45,
        incrementLbs: 10,
        minReps: 7,
        order: 1,
      },
      {
        id: 'occams_ohp',
        name: 'Barbell Overhead Press (Shoulder-Width Grip)',
        muscle: 'Shoulders',
        instructions: 'Standing or seated barbell press. Shoulder-width grip. Full extension overhead. 5/5 cadence.',
        formCues: ['Shoulder-width grip', 'Brace core', 'Full lockout at top'],
        videoUrl: 'https://www.youtube.com/results?search_query=barbell+overhead+press+form',
        startWeightMale: 65,
        startWeightFemale: 35,
        incrementLbs: 5,
        minReps: 7,
        order: 2,
        useShoulderPressRule: true,
      },
    ],
    optionalCore: true,
  },
  B: {
    machine: [
      {
        id: 'occams_incline_press',
        name: 'Slight Incline/Decline Bench Press',
        muscle: 'Chest',
        instructions: 'Slight incline (15–30°) or decline. 5/5 cadence. 1-second pause at bottom without touching stack. No lockout at top.',
        formCues: ['1-sec pause at bottom — do NOT touch stack', 'No lockout', '5/5 cadence'],
        videoUrl: 'https://www.youtube.com/results?search_query=incline+bench+press+machine+form',
        startWeightMale: 100,
        startWeightFemale: 50,
        incrementLbs: 10,
        minReps: 7,
        order: 1,
        hasBenchPauseRule: true,
      },
      {
        id: 'occams_leg_press',
        name: 'Leg Press',
        muscle: 'Quads / Glutes',
        instructions: 'Same as G2F leg press. Note: target is 10 reps (not 7). Full ROM, slow cadence.',
        formCues: ['10 rep target', 'Full ROM', 'Drive through heels'],
        videoUrl: 'https://www.youtube.com/results?search_query=leg+press+form+full+range',
        startWeightMale: 150,
        startWeightFemale: 90,
        incrementLbs: 10,
        minReps: 10, // Different from upper body
        order: 2,
      },
    ],
    freeweight: [
      {
        id: 'occams_incline_bench_fw',
        name: 'Slight Incline Bench Press (Shoulder-Width Grip)',
        muscle: 'Chest',
        instructions: 'Slight incline (15–30°). Shoulder-width grip. 5/5 cadence. 1-second pause at bottom without touching chest.',
        formCues: ['1-sec pause at bottom', 'No lockout', 'Shoulder-width grip'],
        videoUrl: 'https://www.youtube.com/results?search_query=incline+bench+press+form',
        startWeightMale: 95,
        startWeightFemale: 45,
        incrementLbs: 10,
        minReps: 7,
        order: 1,
        hasBenchPauseRule: true,
      },
      {
        id: 'occams_squat',
        name: 'Squat',
        muscle: 'Quads / Glutes / Hamstrings',
        instructions: 'Barbell back squat. 10 rep target. Full depth. 5/5 cadence. Brace core.',
        formCues: ['10 rep target', 'Full depth', 'Knees track toes', 'Brace core'],
        videoUrl: 'https://www.youtube.com/results?search_query=barbell+squat+form+beginners',
        startWeightMale: 95,
        startWeightFemale: 45,
        incrementLbs: 10,
        minReps: 10,
        order: 2,
      },
    ],
    optionalKettlebell: true,
    finisherBike: true, // 3 min at 85+ rpm
  },
}

// ─── Core Protocol ────────────────────────────────────────────────
export const CORE_EXERCISES = {
  myotaticCrunch: {
    name: 'Myotatic Crunch',
    sets: 1,
    targetReps: 10,
    equipment: 'Exercise ball',
    instructions: [
      'Lie back on the ball with hips BELOW shoulders',
      'Arms extended overhead, even with or behind ears',
      'Lower for 4 seconds until fingers touch the floor — reach further as you go down',
      'Pause at the bottom for 2 seconds',
      'Rise to fully contracted position',
      'Pause at the top for 2 seconds',
      'That is 1 rep — complete 10 total',
    ],
    progressionNote: 'When you can complete all 10 reps with control, add weight to hands next session.',
    videoUrl: 'https://www.youtube.com/results?search_query=myotatic+crunch+exercise+ball+tim+ferriss',
  },
  catVomit: {
    name: 'Cat Vomit (Ab Vacuum)',
    sets: 1,
    targetReps: 10,
    holdSeconds: 10, // 8–12 range, default 10
    equipment: 'None',
    instructions: [
      'Start on hands and knees, back flat, neutral spine',
      'Forcefully exhale ALL air — completely empty the lungs',
      'Hold your breath and pull your belly button UP toward your spine as hard as you can',
      'Hold for 8–12 seconds (target: 10)',
      'Inhale to complete the rep',
      'Take one full breath cycle rest (one in, one out)',
      'That is 1 rep — complete 10 total',
    ],
    targetMuscle: 'Transverse abdominis (deep "corset" muscle)',
    videoUrl: 'https://www.youtube.com/results?search_query=cat+vomit+ab+vacuum+tim+ferriss',
  },
  sidePlank: {
    name: 'Side Plank',
    sets: 2,
    targetSeconds: 45, // 30–60 range
    equipment: 'None (mat optional)',
    instructions: [
      'Lie on your side, forearm on the ground, elbow under shoulder',
      'Stack feet or stagger them for stability',
      'Lift hips to form a straight line from head to feet',
      'Hold for 30–60 seconds',
      'Switch sides',
    ],
    optional: true, // User can toggle this
    videoUrl: 'https://www.youtube.com/results?search_query=side+plank+proper+form',
  },
}

// ─── Posterior Chain Protocol ─────────────────────────────────────
export const POSTERIOR_EXERCISES = [
  {
    id: 'glute_bridge',
    name: 'Glute Bridge',
    targetReps: 20,
    sets: 1,
    instructions: 'Lie on back, knees bent, feet flat on floor hip-width apart. Drive hips up by squeezing glutes. Hold 1 second at top. Lower controlled.',
    formCues: ['Squeeze glutes at top', 'Drive through heels', 'Keep core braced'],
    videoUrl: 'https://www.youtube.com/results?search_query=glute+bridge+proper+form',
  },
  {
    id: 'alt_raises',
    name: 'Alternating Arm/Leg Raises',
    targetReps: 15,
    sets: 1,
    instructions: 'On hands and knees. Extend right arm and left leg simultaneously. Hold 2 seconds. Return and switch sides. Keep back flat throughout.',
    formCues: ['Back stays flat — do not rotate', 'Hold at extension', 'Slow and controlled'],
    videoUrl: 'https://www.youtube.com/results?search_query=bird+dog+exercise+form',
  },
  {
    id: 'kb_swings',
    name: 'Kettlebell Swings',
    targetReps: 75,
    minimumReps: 75,
    sets: 1,
    instructions: 'Russian swing — this is a hip hinge, NOT a squat. Hinge at hips, let bell swing back between legs, then drive hips forward explosively. Bell floats to chest height. Keep back flat throughout.',
    formCues: [
      'Hip hinge — push hips back, not knees forward',
      'Power comes from hip snap, not arms',
      'Back flat — slight arch at lockout',
      'Bell floats to chest height naturally',
      'Keep core braced the entire time',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=kettlebell+swing+russian+proper+form',
    startWeightMale: 35,
    startWeightFemale: 18,
  },
]

// ─── Mobility Library ─────────────────────────────────────────────
export const MOBILITY_EXERCISES = {
  shoulders: {
    label: 'Shoulders',
    exercises: [
      { name: 'Shoulder Circles', duration: '30 sec each direction', instructions: 'Arms at sides. Large, controlled circles forward then backward. Gradually increase range.' },
      { name: 'Doorway Pec Stretch', duration: '30 sec each arm', instructions: 'Arm at 90°, forearm on doorframe. Gently lean forward to open chest and stretch pec/anterior shoulder.' },
      { name: 'Band / Towel Pull-Apart', duration: '2 × 15 reps', instructions: 'Hands shoulder-width on band or towel. Pull apart to chest level. Squeeze shoulder blades together. Controlled return.' },
      { name: 'Chest Opener', duration: '60 sec', instructions: 'Clasp hands behind back. Lift arms, open chest, look up slightly. Breathe into the stretch.' },
    ],
  },
  hips: {
    label: 'Hips',
    exercises: [
      { name: 'Hip Circles', duration: '30 sec each direction', instructions: 'Standing, hands on hips. Draw large circles with your hips. Clockwise then counterclockwise.' },
      { name: '90/90 Hip Stretch', duration: '60 sec each side', instructions: 'Sit with both legs at 90°. Lean over front shin. Then try internal rotation knee drops and rear knee/heel lifts within the position.' },
      { name: 'Deep Squat Hold', duration: '60–120 sec', instructions: 'Feet slightly wider than shoulder-width, toes out slightly. Hold the bottom of a squat. Use a doorframe for balance if needed. Breathe and relax into it.' },
      { name: 'Pigeon Pose', duration: '60 sec each side', instructions: 'From all-fours: bring one knee forward behind same-side hand, extend other leg back. Keep hips square. Lean forward over front hip to deepen. Breathe.' },
      { name: 'Gorilla Stretch', duration: '10 reps / 60 sec', instructions: 'Wide stance, toes out. Drop into deepest squat — hands flat on floor (use a book if needed). Chest up, hips down. Then lift hips and straighten legs into a forward fold. Move between these two positions dynamically. Targets hips, groin, and hamstrings.' },
      { name: 'Frog Rocks', duration: '30–60 sec', instructions: 'On all fours, widen knees, keep feet flat. Rock hips gently back toward heels and forward. Feel the inner hip stretch. Breathe and relax.' },
      { name: 'Cossack Squat', duration: '10 reps each side', instructions: 'Wide stance. Shift weight to one side into a deep lateral squat. Opposite leg stays straight, toes up. Return to center and switch. Keep torso upright.' },
      { name: 'World\'s Greatest Stretch', duration: '5 reps each side', instructions: 'From a lunge: place same-side hand on floor inside front foot. Rotate opposite arm toward the ceiling. Return hand, step back, switch sides. Targets hip flexors, thoracic spine, and hip rotators.' },
      { name: '90/90 Active Switches', duration: '10 total transitions', instructions: 'Sitting in 90/90 position. Lift both knees and rotate hips to switch to opposite 90/90. Control the motion — don\'t just fall. 5 each direction.' },
      { name: 'Kneeling on Tops of Feet', duration: '30–90 sec', instructions: 'Kneel with the tops (dorsal surface) of feet flat against the ground. Sit back onto your heels. Hold and breathe. Stretches ankles, tops of feet, and shins. Progress duration over time.' },
      { name: 'Cross-Legged Sitting', duration: '1–3 min', instructions: 'Sit cross-legged on the floor with an upright spine. Alternate which leg is in front each session. Stretches outer hips and hip flexors passively.' },
    ],
  },
  wrists: {
    label: 'Wrists',
    exercises: [
      { name: 'Wrist Circles', duration: '30 sec each direction', instructions: 'Interlace fingers. Draw large circles with both wrists together. Both directions.' },
      { name: 'Prayer Stretch', duration: '30 sec', instructions: 'Press palms together in front of chest at shoulder height. Elbows out. Gently press down to stretch wrist flexors.' },
      { name: 'Reverse Prayer Stretch', duration: '30 sec', instructions: 'Press backs of hands together, elbows out. Stretch wrist extensors. Breathe.' },
      { name: 'Weight-Bearing Wrist Rocking', duration: '30 sec', instructions: 'On all fours. Rock gently forward and back, loading the wrists. Keep fingers spread and palms flat. Progress to circles.' },
    ],
  },
  ankles: {
    label: 'Ankles',
    exercises: [
      { name: 'Ankle Circles', duration: '30 sec each direction, each foot', instructions: 'Seated or standing. Draw large circles with each foot. Both directions per foot.' },
      { name: 'Calf Stretch (wall)', duration: '45 sec each side', instructions: 'Hands on wall. One foot back, heel pressed flat. Keep back leg straight. Lean toward wall.' },
      { name: 'Dorsiflexion Stretch', duration: '30 sec each side', instructions: 'Kneel, one foot flat on floor in front. Gently push knee forward over toes without heel lifting. Stretches ankle joint.' },
    ],
  },
  thoracic: {
    label: 'Thoracic Spine',
    exercises: [
      { name: 'Thoracic Extension over Foam Roller', duration: '60 sec, 3 positions', instructions: 'Place foam roller horizontally under mid-back. Arms crossed on chest or behind head. Extend over the roller gently. Move to upper, middle, and lower thoracic positions.' },
      { name: 'Cat-Cow', duration: '10 slow reps', instructions: 'On all fours. Inhale: drop belly, lift head and tailbone (cow). Exhale: round spine toward ceiling, tuck chin and tailbone (cat). Slow and controlled.' },
      { name: 'Seated Thoracic Rotation', duration: '10 each side', instructions: 'Seated cross-legged. Place one hand behind head, elbow out. Rotate toward that elbow, leading with your gaze. Return. Switch sides.' },
    ],
  },
  neck: {
    label: 'Neck',
    exercises: [
      { name: 'Neck Tilts', duration: '30 sec each side', instructions: 'Slowly tilt ear toward shoulder. Hold. Do not raise shoulder. Breathe. Switch sides.' },
      { name: 'Neck Rotation', duration: '30 sec each direction', instructions: 'Slowly rotate head side to side, looking over each shoulder. Stop at end range and breathe. Do not force.' },
      { name: 'Chin Tuck', duration: '10 reps', instructions: 'Gently draw chin straight back (making a "double chin"). Hold 3 seconds. Release. Strengthens deep neck flexors, counters forward head posture.' },
    ],
  },
}

// ─── Slow-Carb Allowed Foods ──────────────────────────────────────
export const SLOW_CARB_ALLOWED = {
  proteins: ['Eggs', 'Chicken breast', 'Chicken thigh', 'Beef', 'Pork', 'Fish', 'Seafood', 'Turkey'],
  legumes: ['Lentils', 'Black beans', 'Pinto beans', 'Red beans', 'Soybeans', 'Chickpeas (moderate)'],
  vegetables: ['Spinach', 'Mixed vegetables', 'Sauerkraut', 'Kimchi', 'Asparagus', 'Peas', 'Broccoli', 'Green beans', 'Cauliflower', 'Kale', 'Swiss chard'],
  condiments: ['Hot sauce', 'Mustard', 'Salsa', 'Garlic', 'Herbs and spices', 'Lemon juice', 'Cinnamon'],
  exceptions: ['Tomatoes (moderate)', 'Avocados (max ~1 cup/day)'],
}

export const SLOW_CARB_AVOID = [
  'Bread (all types)', 'Rice (including brown)', 'Pasta', 'Potatoes', 'Cereal', 'Oats',
  'Tortillas', 'Fried food with breading', 'Fruit (all types)', 'Juice', 'Milk', 'Yogurt',
  'Cheese (mostly)', 'Alcohol (except dry wine, max 2 glasses)', 'Diet soda (limit)',
]

// ─── PAGG Stack ───────────────────────────────────────────────────
export const PAGG_SCHEDULE = [
  { timing: 'Before breakfast', supplements: ['ALA (100–300mg)', 'Green Tea EGCG (325mg)', 'Garlic Extract (200mg)'] },
  { timing: 'Before lunch', supplements: ['ALA (100–300mg)', 'Green Tea EGCG (325mg)', 'Garlic Extract (200mg)'] },
  { timing: 'Before dinner', supplements: ['ALA (100–300mg)', 'Green Tea EGCG (325mg)', 'Garlic Extract (200mg)'] },
  { timing: 'Before bed', supplements: ['Policosanol (20–25mg)', 'ALA (100–300mg)', 'Green Tea EGCG (325mg)', 'Garlic Extract (200mg)'] },
]

// ─── Running ──────────────────────────────────────────────────────
export const RUN_TYPES = {
  easy: { label: 'Easy Aerobic Run', color: 'green', description: 'Stay at or below your MAF heart rate the entire run. Slow to a walk if HR rises.' },
  easy2: { label: 'Easy Aerobic Run #2', color: 'green', description: 'Same as Run 1. Two easy aerobic sessions per week builds your base.' },
  intervals: { label: 'Interval Run', color: 'orange', description: '6 × 400m hard / 400m easy recovery. Warm up and cool down at MAF HR.' },
}

export const RUN_ROTATION = ['easy', 'easy2', 'intervals']

// ─── Supplement descriptions ──────────────────────────────────────
export const SUPPLEMENT_INFO = {
  sup_pagg: {
    label: 'PAGG Stack',
    shortLabel: 'PAGG',
    description: 'Policosanol, Alpha-Lipoic Acid, Green Tea Flavanols, Garlic Extract. Ferriss\' fat loss supplement stack — take before each meal and before bed.',
    timing: '15–30 min before each meal; policosanol at bedtime',
    cyclingNote: '6 days on / 1 day off. 1 week off every 8 weeks.',
  },
  sup_creatine: {
    label: 'Creatine Monohydrate',
    shortLabel: 'Creatine',
    description: '~3.5g upon waking and ~3.5g before bed. Increases strength and lean mass. Most researched sports supplement.',
    timing: 'On waking + before bed',
  },
  sup_glutamine: {
    label: 'L-Glutamine',
    shortLabel: 'Glutamine',
    description: 'First 5 days: 10g every 2 hours (80g total). After: 10–30g post-workout. Supports muscle recovery.',
    timing: 'Post-workout (after first 5 days)',
  },
  sup_cq: {
    label: 'Cissus Quadrangularis',
    shortLabel: 'Cissus QR',
    description: '2,400mg 3× per day. Joint support and injury prevention during heavy training.',
    timing: '3× per day with meals',
  },
  sup_ala: {
    label: 'Alpha-Lipoic Acid (ALA)',
    shortLabel: 'ALA',
    description: '100–300mg before meals. Improves glucose partitioning — sends carbs to muscle rather than fat cells.',
    timing: 'Before each meal',
  },
  sup_policosanol: {
    label: 'Policosanol',
    shortLabel: 'Policosanol',
    description: '20–25mg before bed. Cholesterol management and lipid optimization.',
    timing: 'Before bed',
  },
  sup_cold_exposure: {
    label: 'Ice Pack / Cold Exposure',
    shortLabel: 'Cold',
    description: 'Ice pack on back of neck and upper traps for 30 min in the evening. Activates brown adipose tissue for fat loss. Cold shower before breakfast also recommended.',
    timing: 'Evening (ice pack) and/or morning (cold shower)',
  },
}

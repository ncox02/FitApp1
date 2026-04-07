import { G2F_EXERCISES, OCCAMS_WORKOUTS } from './constants'

// ─── Strength Progression ─────────────────────────────────────────

/**
 * Given all logged sets for a user, return the recommended next weight
 * for a given exercise, and any relevant instructions.
 */
export function getNextWeight(exerciseName, allSets = []) {
  const setsForExercise = allSets
    .filter(s => s.exercise_name === exerciseName)
    .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))

  const lastSet = setsForExercise[0]

  if (!lastSet) {
    return { weight: null, isFirstSession: true, instruction: 'Test session — find starting weight.' }
  }

  const { weight_lbs, reps_completed } = lastSet
  const MIN_REPS = 7

  if (reps_completed >= MIN_REPS) {
    const newWeight = weight_lbs + 10
    return {
      weight: newWeight,
      lastWeight: weight_lbs,
      lastReps: reps_completed,
      shouldIncrease: true,
      instruction: `Increase to ${newWeight} lbs. If it feels light after 2–3 reps, stop — wait 5 min, add 5–10 more lbs, then go to failure.`,
    }
  }

  // Stalled
  return {
    weight: weight_lbs,
    lastWeight: weight_lbs,
    lastReps: reps_completed,
    shouldIncrease: false,
    instruction: `Hold at ${weight_lbs} lbs. Focus on true failure and strict 5/5 cadence.`,
  }
}

/**
 * Calculate starting weight for test session.
 * 70% of last successful 5-rep set weight.
 * Shoulder press uses 60%.
 */
export function calcStartingWeight(lastFiveRepWeight, isShoulderPress = false) {
  const pct = isShoulderPress ? 0.60 : 0.70
  const raw = lastFiveRepWeight * pct
  // Round to nearest 5 lbs for practicality
  return Math.round(raw / 5) * 5
}

/**
 * Detect if the current session has stalled (>1 exercise failed to hit min reps).
 * Used to decide whether to advance the rest phase.
 */
export function detectStall(loggedSets = []) {
  const EXCLUDED_KEYWORDS = ['crunch', 'ab', 'neck', 'kettlebell', 'swing']
  const MIN_REPS = 7

  const workingSets = loggedSets.filter(s => {
    const nameLower = s.exercise_name?.toLowerCase() || ''
    return !EXCLUDED_KEYWORDS.some(kw => nameLower.includes(kw))
  })

  const stalls = workingSets.filter(s => s.reps_completed < MIN_REPS).length
  return stalls > 1
}

// ─── Running Progression ──────────────────────────────────────────

export function calcNextRunDistance(runLogs = [], settings) {
  const { running_start_miles = 3, running_progression_pct = 10 } = settings

  const easyRuns = runLogs
    .filter(r => r.run_type === 'easy' || r.run_type === 'easy2')
    .sort((a, b) => b.session_date.localeCompare(a.session_date))
    .slice(0, 2)

  if (easyRuns.length === 0) return Number(running_start_miles)

  const avg = easyRuns.reduce((sum, r) => sum + (r.distance_miles || 0), 0) / easyRuns.length
  const factor = 1 + running_progression_pct / 100
  return Math.round(avg * factor * 10) / 10
}

export function calcNextRunTime(runLogs = [], settings) {
  const { running_start_miles = 3, running_progression_pct = 10 } = settings
  // Estimate 12 min/mile for new runners as base
  const BASE_PACE = 12

  const easyRuns = runLogs
    .filter(r => r.run_type === 'easy' || r.run_type === 'easy2')
    .sort((a, b) => b.session_date.localeCompare(a.session_date))
    .slice(0, 2)

  if (easyRuns.length === 0) return Math.round(running_start_miles * BASE_PACE)

  const avgTime = easyRuns.reduce((sum, r) => sum + (r.duration_min || 0), 0) / easyRuns.length
  if (avgTime === 0) return Math.round(running_start_miles * BASE_PACE)

  const factor = 1 + running_progression_pct / 100
  return Math.round(avgTime * factor)
}

// ─── Nutrition Calculations ───────────────────────────────────────

export function calcAutoNutrition(settings) {
  const {
    bodyweight_lbs = 180,
    body_fat_pct = 20,
    nutrition_plan = 'slowcarb',
    calorie_goal,
    protein_goal_g,
  } = settings

  const leanMass = bodyweight_lbs * (1 - (body_fat_pct / 100))

  if (nutrition_plan === 'g2f') {
    const targetLean = leanMass + 10
    return {
      calories: Math.round(targetLean * 20),
      protein: Math.round(leanMass * 1.25),
      note: `G2F: 20 cal × ${Math.round(targetLean)} lbs (lean +10). Protein: ${Math.round(leanMass)} lbs lean × 1.25.`,
      isStrict: true, // Must hit minimum
    }
  }

  if (nutrition_plan === 'slowcarb') {
    return {
      calories: null, // Slow-carb doesn't count calories — eat until full
      protein: Math.round(bodyweight_lbs * 1.0),
      note: 'Slow-Carb: eat until full. At least 20g protein per meal. No calorie counting needed.',
      isStrict: false,
    }
  }

  // Custom
  return {
    calories: calorie_goal || null,
    protein: protein_goal_g || null,
    note: 'Custom goals.',
    isStrict: false,
  }
}

export function calcMealMacros(mealIngredients = [], ingredientMap = {}) {
  return mealIngredients.reduce((totals, mi) => {
    const ing = ingredientMap[mi.ingredient_id]
    if (!ing) return totals
    const mult = mi.servings || 1
    return {
      calories: (totals.calories || 0) + ((ing.calories || 0) * mult),
      protein_g: (totals.protein_g || 0) + ((ing.protein_g || 0) * mult),
      carbs_g: (totals.carbs_g || 0) + ((ing.carbs_g || 0) * mult),
      fat_g: (totals.fat_g || 0) + ((ing.fat_g || 0) * mult),
      sodium_mg: (totals.sodium_mg || 0) + ((ing.sodium_mg || 0) * mult),
      fiber_g: (totals.fiber_g || 0) + ((ing.fiber_g || 0) * mult),
      added_sugars_g: (totals.added_sugars_g || 0) + ((ing.added_sugars_g || 0) * mult),
      cost: (totals.cost || 0) + ((ing.cost_per_serving || 0) * mult),
    }
  }, {})
}

export function checkDailyNutrition(log, settings) {
  const auto = calcAutoNutrition(settings)
  const warnings = []
  const MAX_SODIUM = 2300

  if (auto.protein && log.total_protein_g < auto.protein * 0.85) {
    warnings.push({
      type: 'protein_low',
      message: `Protein low: ${Math.round(log.total_protein_g)}g of ${auto.protein}g goal`,
      severity: 'warning',
    })
  }

  if (log.total_sodium_mg > MAX_SODIUM) {
    warnings.push({
      type: 'sodium_high',
      message: `Sodium over limit: ${Math.round(log.total_sodium_mg)}mg (max 2,300mg)`,
      severity: 'caution',
    })
  }

  if (auto.isStrict && auto.calories && log.total_calories < auto.calories * 0.9) {
    warnings.push({
      type: 'calories_low',
      message: `Calories below G2F minimum: ${Math.round(log.total_calories)} of ${auto.calories} required`,
      severity: 'warning',
    })
  }

  return warnings
}

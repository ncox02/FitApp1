import { addDays, format, parseISO, differenceInDays, getDay, startOfWeek } from 'date-fns'
import { RUN_ROTATION } from './constants'

// ─── Date helpers ────────────────────────────────────────────────
export const today = () => format(new Date(), 'yyyy-MM-dd')
export const toDate = (str) => parseISO(str + 'T00:00:00')
export const formatDate = (str) => format(toDate(str), 'MMM d')
export const formatDateFull = (str) => format(toDate(str), 'EEEE, MMM d')
export const getDayOfWeek = (str) => getDay(toDate(str)) // 0=Sun
export const addDaysStr = (str, n) => format(addDays(toDate(str), n), 'yyyy-MM-dd')
export const weekStart = (str) => format(startOfWeek(toDate(str)), 'yyyy-MM-dd')
export const daysBetween = (a, b) => differenceInDays(toDate(b), toDate(a))

// ─── Sunday bypass ────────────────────────────────────────────────
export function bypassSunday(dateStr, allowSunday) {
  if (allowSunday) return dateStr
  if (getDayOfWeek(dateStr) === 0) {
    return addDaysStr(dateStr, 1) // Push to Monday
  }
  return dateStr
}

// ─── Strength scheduling ──────────────────────────────────────────
export function getRestDays(phase) {
  return [2, 3, 4][phase - 1] ?? 2 // Phase 1=2days, 2=3days, 3=4days
}

export function getNextStrengthDate(settings) {
  const { last_strength_date, strength_rest_phase = 1, allow_sunday = false } = settings

  if (!last_strength_date) return today()

  const restDays = getRestDays(strength_rest_phase)
  // +1 because rest_days means "rest days between", so we add restDays+1 to get next training day
  let next = addDaysStr(last_strength_date, restDays + 1)
  return bypassSunday(next, allow_sunday)
}

export function evaluateRestPhaseChange(currentPhase, loggedSets) {
  // Called after logging a strength session
  // If more than 1 exercise stalled (didn't reach min reps), advance phase
  const EXCLUDED = ['Machine Crunch', 'Kettlebell Swings', 'Manual Neck Resistance']
  const stalls = loggedSets.filter(s =>
    !EXCLUDED.some(ex => s.exercise_name?.includes(ex.split(' ')[0])) &&
    s.reps_completed < 7
  ).length

  if (stalls > 1) {
    return Math.min(3, currentPhase + 1)
  }
  return currentPhase
}

// ─── Running scheduling ───────────────────────────────────────────
export function getNextRunType(lastRunType) {
  if (!lastRunType) return 'easy'
  const idx = RUN_ROTATION.indexOf(lastRunType)
  if (idx === -1) return 'easy'
  return RUN_ROTATION[(idx + 1) % RUN_ROTATION.length]
}

export function getNextRunTarget(runLogs = [], settings) {
  const { running_start_miles = 3, running_progression_pct = 10 } = settings

  const easyRuns = runLogs
    .filter(r => r.run_type === 'easy' || r.run_type === 'easy2')
    .sort((a, b) => b.session_date.localeCompare(a.session_date))
    .slice(0, 2)

  if (easyRuns.length === 0) return running_start_miles

  const avg = easyRuns.reduce((sum, r) => sum + (r.distance_miles || 0), 0) / easyRuns.length

  // Only progress if we've completed at least 2 easy runs
  if (easyRuns.length >= 2) {
    const factor = 1 + running_progression_pct / 100
    return Math.round(avg * factor * 10) / 10
  }

  return Math.round(avg * 10) / 10
}

export function calcMAFHR(age) {
  return 180 - (age || 35)
}

// ─── Posterior scheduling ─────────────────────────────────────────
export function getNextPosteriorDate(settings, posteriorLogs = []) {
  const { allow_sunday = false } = settings
  const lastLog = posteriorLogs.sort((a, b) => b.session_date.localeCompare(a.session_date))[0]

  if (!lastLog) return today()

  // Posterior is every 2–3 days; default every 3 days
  let next = addDaysStr(lastLog.session_date, 3)
  return bypassSunday(next, allow_sunday)
}

// ─── Weekly schedule generation ──────────────────────────────────
export function generateWeekSchedule(weekStartDate, settings, recentLogs = {}) {
  const {
    strength_program = 'none',
    running_plan = 'none',
    core_enabled = true,
    posterior_enabled = true,
    mobility_enabled = true,
    allow_sunday = false,
    strength_rest_phase = 1,
    last_strength_date = null,
    occams_next_workout = 'A',
    occams_variant = 'machine',
  } = settings

  const { runLogs = [], strengthLogs = [], posteriorLogs = [] } = recentLogs

  const nextStrengthDate = strength_program !== 'none'
    ? getNextStrengthDate(settings)
    : null

  const lastRunType = runLogs[0]?.run_type || null

  const days = []

  for (let i = 0; i < 7; i++) {
    const dateStr = addDaysStr(weekStartDate, i)
    const dow = getDayOfWeek(dateStr) // 0=Sun

    // Sunday: always rest unless allowed
    if (dow === 0 && !allow_sunday) {
      days.push({ date: dateStr, type: 'rest', components: [], label: 'Rest', estimatedMinutes: 0 })
      continue
    }

    const components = []
    let isStrengthDay = false
    let runType = null

    // Strength day?
    if (strength_program !== 'none' && nextStrengthDate === dateStr) {
      isStrengthDay = true
      const programKey = strength_program === 'occams'
        ? `occams_${occams_next_workout.toLowerCase()}`
        : 'strength_g2f'
      components.push(programKey)
    }

    // Run day? Assign runs to non-strength days, up to 3/week
    if (running_plan !== 'none' && !isStrengthDay) {
      const runsThisWeek = days.filter(d => d.components.some(c => c.startsWith('run_'))).length
      if (runsThisWeek < 3 && (i === 1 || i === 3 || i === 5)) { // Mon, Wed, Fri pattern
        const weekRunIdx = runsThisWeek
        runType = RUN_ROTATION[weekRunIdx % 3]
        components.push(`run_${runType}`)
      }
    }

    // Posterior: on non-strength days
    if (posterior_enabled && !isStrengthDay) {
      const posteriorThisWeek = days.filter(d => d.components.includes('posterior')).length
      if (posteriorThisWeek < 2) {
        components.push('posterior')
      }
    }

    // Core: paired with posterior or run days (NOT strength days)
    if (core_enabled && !isStrengthDay && (components.includes('posterior') || components.some(c => c.startsWith('run_')))) {
      components.push('core')
    }

    // Mobility: always add, but short on busy days
    if (mobility_enabled) {
      components.push('mobility')
    }

    const label = buildLabel(components, occams_next_workout)
    const estimatedMinutes = calcEstimatedDuration(components)

    days.push({
      date: dateStr,
      type: components.length > (mobility_enabled ? 1 : 0) ? 'training' : 'rest',
      components,
      label,
      estimatedMinutes,
      runType,
      occamsWorkout: isStrengthDay && strength_program === 'occams' ? occams_next_workout : null,
    })
  }

  return days
}

function buildLabel(components, occamsWorkout) {
  const parts = []
  if (components.some(c => c === 'strength_g2f')) parts.push('Strength (G2F)')
  if (components.some(c => c === 'occams_a')) parts.push(`Occam's — Workout A`)
  if (components.some(c => c === 'occams_b')) parts.push(`Occam's — Workout B`)
  if (components.some(c => c === 'run_easy')) parts.push('Easy Run')
  if (components.some(c => c === 'run_easy2')) parts.push('Easy Run #2')
  if (components.some(c => c === 'run_intervals')) parts.push('Intervals')
  if (components.includes('posterior')) parts.push('KB Swings')
  if (components.includes('core')) parts.push('Core')
  if (parts.length === 0) return 'Mobility + Recovery'
  return parts.join(' · ')
}

function calcEstimatedDuration(components) {
  let total = 0
  if (components.some(c => c.startsWith('strength') || c.startsWith('occams'))) total += 45
  if (components.some(c => c === 'run_easy' || c === 'run_easy2')) total += 50
  if (components.some(c => c === 'run_intervals')) total += 35
  if (components.includes('posterior')) total += 12
  if (components.includes('core')) total += 10
  if (components.includes('mobility')) total += 10
  return total
}

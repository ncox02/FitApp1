import { useState, useEffect } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  today, formatDateFull, getDayOfWeek, generateWeekSchedule, weekStart,
  getNextRunTarget, calcMAFHR, addDaysStr
} from '../lib/scheduling'
import { getNextWeight, calcAutoNutrition } from '../lib/progression'
import {
  G2F_EXERCISES, OCCAMS_WORKOUTS, CORE_EXERCISES, POSTERIOR_EXERCISES,
  MOBILITY_EXERCISES, RUN_TYPES, DAY_NAMES, SUPPLEMENT_INFO
} from '../lib/constants'
import Modal from '../components/ui/Modal'
import Timer from '../components/ui/Timer'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import LogStrengthModal from '../components/logging/LogStrengthModal'
import {
  LogRunModal, LogPosteriorModal, LogCoreModal,
  LogWeightModal, LogMealModal, LogSleepModal
} from '../components/logging/LogRunModal'

export default function Today() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { toast, showToast } = useToast()
  const [todaySchedule, setTodaySchedule] = useState(null)
  const [strengthSets, setStrengthSets] = useState([])
  const [runLogs, setRunLogs] = useState([])
  const [nutritionLog, setNutritionLog] = useState(null)
  const [dailyLog, setDailyLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const todayStr = today()
  const isCheatDay = getDayOfWeek(todayStr) === (settings.cheat_day ?? 6)

  useEffect(() => { loadData() }, [settings])

  async function loadData() {
    if (!user) return
    setLoading(true)
    const ws = weekStart(todayStr)
    const [setsRes, runsRes, nutRes, dailyRes] = await Promise.all([
      supabase.from('strength_log_sets').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(50),
      supabase.from('running_logs').select('*').eq('user_id', user.id).order('session_date', { ascending: false }).limit(10),
      supabase.from('nutrition_logs').select('*, nutrition_log_entries(*)').eq('user_id', user.id).eq('log_date', todayStr).single(),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', todayStr).single(),
    ])
    const sets = setsRes.data || []
    const runs = runsRes.data || []
    setStrengthSets(sets)
    setRunLogs(runs)
    setNutritionLog(nutRes.data)
    setDailyLog(dailyRes.data)

    const schedule = generateWeekSchedule(ws, settings, { strengthSets: sets, runLogs: runs })
    setTodaySchedule(schedule.find(d => d.date === todayStr) || { type: 'rest', components: [], label: 'Rest Day', estimatedMinutes: 0 })
    setLoading(false)
  }

  const autoNutrition = calcAutoNutrition(settings)
  const mafHR = settings.running_hr_target || calcMAFHR(settings.age)
  const nextRunMiles = getNextRunTarget(runLogs, settings)

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-sm font-mono" style={{ color: 'var(--text2)' }}>Loading today…</div>
      </div>
    )
  }

  const components = todaySchedule?.components || []
  const isStrengthDay = components.some(c => c.startsWith('strength') || c.startsWith('occams'))
  const isRunDay = components.some(c => c.startsWith('run_'))
  const isPosteriorDay = components.includes('posterior')
  const isCoreDay = components.includes('core')
  const isMobilityDay = components.includes('mobility')
  const runType = components.find(c => c.startsWith('run_'))?.replace('run_', '')

  return (
    <div className="page-content">
      <Toast message={toast} />

      {/* Header */}
      <div className="mb-5">
        <div className="text-xs font-mono mb-1" style={{ color: 'var(--text2)' }}>
          {formatDateFull(todayStr).toUpperCase()}
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--text)' }}>
              {todaySchedule?.label || 'Rest Day'}
            </h1>
            {todaySchedule?.estimatedMinutes > 0 && (
              <div className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                ~{todaySchedule.estimatedMinutes} min
              </div>
            )}
          </div>
          {isCheatDay && <span className="badge badge-orange mt-1">CHEAT DAY</span>}
        </div>
      </div>

      {/* Measurement reminder on cheat day */}
      {isCheatDay && (
        <div className="card card-accent-blue mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>📏 Measurement Morning</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Take all measurements before eating or drinking.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('measurements')}>Measure Now</button>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="flex gap-3 mb-5">
        <div className="stat-box">
          <div className="stat-value">{settings.bodyweight_lbs || '—'}</div>
          <div className="stat-label">Weight lbs</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>
            {nutritionLog ? Math.round(nutritionLog.total_protein_g) : '—'}g
          </div>
          <div className="stat-label">Protein</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>
            {nutritionLog ? Math.round(nutritionLog.water_oz) : 0}oz
          </div>
          <div className="stat-label">Water</div>
        </div>
      </div>

      {/* Rest day */}
      {todaySchedule?.type === 'rest' && !isMobilityDay && (
        <div className="card mb-4 text-center py-6">
          <div className="text-4xl mb-3">🌿</div>
          <div className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>Rest & Recover</div>
          <div className="text-sm" style={{ color: 'var(--text2)' }}>Light walking, stretching, and hydration. Your body grows during rest.</div>
        </div>
      )}

      {/* Strength */}
      {isStrengthDay && (
        <StrengthCard settings={settings} strengthSets={strengthSets}
          onLog={() => setModal('strength')} onTimer={() => setModal('timer')} />
      )}

      {/* Run */}
      {isRunDay && runType && (
        <RunCard runType={runType} mafHR={mafHR} targetMiles={nextRunMiles}
          settings={settings} onLog={() => setModal('run')} />
      )}

      {/* Posterior */}
      {isPosteriorDay && (
        <PosteriorCard onLog={() => setModal('posterior')} />
      )}

      {/* Core */}
      {isCoreDay && (
        <CoreCard settings={settings} onLog={() => setModal('core')} />
      )}

      {/* Mobility */}
      {isMobilityDay && <MobilityCard settings={settings} />}

      {/* Nutrition */}
      <div className="section-header">NUTRITION</div>
      <NutritionCard log={nutritionLog} autoNutrition={autoNutrition} isCheatDay={isCheatDay}
        onLogMeal={() => setModal('meal')} onLogWater={() => setModal('water')} onWeight={() => setModal('weight')} />

      {/* Cheat day protocol */}
      {isCheatDay && <CheatDayCard dailyLog={dailyLog} onUpdate={loadData} userId={user.id} showToast={showToast} todayStr={todayStr} />}

      {/* Supplements */}
      <SupplementsCard settings={settings} dailyLog={dailyLog} onUpdate={loadData} userId={user.id} todayStr={todayStr} />

      {/* Sleep */}
      <div className="section-header">RECOVERY</div>
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Sleep</div>
            <div className="text-xs" style={{ color: 'var(--text2)' }}>Log last night</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal('sleep')}>Log Sleep</button>
        </div>
      </div>

      {/* Week preview */}
      <WeekPreview settings={settings} todayStr={todayStr} runLogs={runLogs} strengthSets={strengthSets} />

      {/* Modals */}
      <Modal open={modal === 'timer'} onClose={() => setModal(null)} title="Rest Timer">
        <Timer seconds={180} label="3-Minute Rest" onComplete={() => showToast('Rest complete — next exercise!')} />
      </Modal>

      {modal === 'strength' && (
        <LogStrengthModal open onClose={() => { setModal(null); loadData() }}
          settings={settings} strengthSets={strengthSets} showToast={showToast} userId={user.id} />
      )}
      {modal === 'run' && (
        <LogRunModal open onClose={() => { setModal(null); loadData() }}
          runType={runType} mafHR={mafHR} targetMiles={nextRunMiles}
          settings={settings} showToast={showToast} userId={user.id} />
      )}
      {modal === 'posterior' && (
        <LogPosteriorModal open onClose={() => { setModal(null); loadData() }}
          showToast={showToast} userId={user.id} />
      )}
      {modal === 'core' && (
        <LogCoreModal open onClose={() => { setModal(null); loadData() }}
          settings={settings} showToast={showToast} userId={user.id} />
      )}
      {modal === 'weight' && (
        <LogWeightModal open onClose={() => { setModal(null); loadData() }}
          current={settings.bodyweight_lbs} showToast={showToast} userId={user.id} />
      )}
      {modal === 'meal' && (
        <LogMealModal open onClose={() => { setModal(null); loadData() }}
          showToast={showToast} userId={user.id} todayStr={todayStr} />
      )}
      {modal === 'sleep' && (
        <LogSleepModal open onClose={() => { setModal(null); loadData() }}
          showToast={showToast} userId={user.id} todayStr={todayStr} />
      )}
      {modal === 'water' && (
        <WaterModal open onClose={() => { setModal(null); loadData() }}
          current={nutritionLog?.water_oz || 0} showToast={showToast} userId={user.id} todayStr={todayStr} />
      )}
      {modal === 'measurements' && (
        <MeasurementQuickModal open onClose={() => { setModal(null); loadData() }}
          showToast={showToast} userId={user.id} />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function StrengthCard({ settings, strengthSets, onLog, onTimer }) {
  const isOccams = settings.strength_program === 'occams'
  const nextWorkout = settings.occams_next_workout || 'A'
  const variant = settings.occams_variant || 'machine'
  const isTestSession = !settings.strength_test_done
  const exercises = isOccams
    ? (OCCAMS_WORKOUTS[nextWorkout]?.[variant] || [])
    : G2F_EXERCISES.filter(e => !(settings.disabled_exercises || []).includes(e.id))

  return (
    <div className="card card-accent-blue mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>
            {isOccams ? `Occam's — Workout ${nextWorkout}` : 'Geek to Freak'}
          </div>
          <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text2)' }}>
            {isTestSession ? 'TEST SESSION — find starting weights' : `Rest phase ${settings.strength_rest_phase || 1} · 1 set to failure · 5/5`}
          </div>
        </div>
        <span className="badge badge-blue">~45 min</span>
      </div>

      {isTestSession && (
        <div className="text-xs p-3 rounded-lg mb-3" style={{ background: 'rgba(91,124,246,0.1)', color: 'var(--primary)' }}>
          <strong>Test Day:</strong> Ramp up in sets of 5. Take 70% of last successful set (60% for shoulder press) and do 1 set to failure at 5/5 cadence. That weight is your starting point.
        </div>
      )}

      <div className="text-xs p-3 rounded-lg mb-4" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
        Prep set: 60% of work weight × 3 reps at 1/2 cadence. Then 3 min rest between exercises — use the timer.
      </div>

      {exercises.map((ex, i) => {
        const next = isTestSession ? null : getNextWeight(ex.name, strengthSets)
        return (
          <div key={ex.id || i} className="list-row">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              {ex.order || i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</div>
                {next?.weight && <span className="badge badge-blue font-mono">{next.weight} lbs{next.shouldIncrease ? ' ↑' : ''}</span>}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{ex.muscle}</div>
              {isTestSession && ex.useShoulderPressRule && (
                <div className="text-xs" style={{ color: 'var(--text3)' }}>Use 60% of last 5-rep set (shoulder press rule)</div>
              )}
              {ex.videoUrl && (
                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs" style={{ color: 'var(--primary)' }}>▶ Form video →</a>
              )}
            </div>
          </div>
        )
      })}

      <div className="flex gap-2 mt-4">
        <button className="btn btn-secondary btn-sm flex-1" onClick={onTimer}>⏱ 3-Min Timer</button>
        <button className="btn btn-primary btn-sm flex-1" onClick={onLog}>Log Session</button>
      </div>
    </div>
  )
}

function RunCard({ runType, mafHR, targetMiles, settings, onLog }) {
  const info = RUN_TYPES[runType] || RUN_TYPES.easy
  const isIntervals = runType === 'intervals'
  const progType = settings.running_progression_type || 'time'

  return (
    <div className="card card-accent-green mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>{info.label}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text2)' }}>MAF HR ≤ {mafHR} bpm</div>
        </div>
        <span className="badge badge-green">{isIntervals ? '~35 min' : '~50 min'}</span>
      </div>
      <div className="text-sm mb-3" style={{ color: 'var(--text2)' }}>{info.description}</div>

      {!isIntervals && (
        <div className="p-3 rounded-lg mb-3" style={{ background: 'var(--surface2)' }}>
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text2)' }}>TODAY'S TARGET</div>
          <div className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>
            {progType === 'distance' ? `${targetMiles} mi` : `${targetMiles} min`}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Stay ≤ {mafHR} bpm. Walk if HR rises above.</div>
        </div>
      )}

      {isIntervals && (
        <div className="mb-3">
          {[['1','Warm-Up',`10 min easy at or below ${mafHR} bpm`],['2','Intervals','6 × 400m hard / 400m easy recovery'],['3','Cool-Down','5–10 min easy walk or jog']].map(([step,label,desc]) => (
            <div key={step} className="flex gap-3 items-start mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}>{step}</div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
                <div className="text-xs" style={{ color: 'var(--text2)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary btn-sm btn-full" onClick={onLog}>Log Run</button>
    </div>
  )
}

function PosteriorCard({ onLog }) {
  return (
    <div className="card card-accent-orange mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>Posterior Chain</div>
        <span className="badge badge-orange">~12 min</span>
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--text2)' }}>Morning, empty stomach. Hip hinge on KB swings — not a squat.</div>
      {POSTERIOR_EXERCISES.map((ex, i) => (
        <div key={ex.id} className="list-row">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>{i + 1}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</div>
            <div className="text-xs" style={{ color: 'var(--text2)' }}>
              {ex.targetReps} reps{ex.minimumReps ? ' minimum' : ''}
            </div>
            {ex.videoUrl && (
              <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs" style={{ color: 'var(--primary)' }}>▶ Form video →</a>
            )}
          </div>
        </div>
      ))}
      <button className="btn btn-primary btn-sm btn-full mt-3" onClick={onLog}>Log Posterior Session</button>
    </div>
  )
}

function CoreCard({ settings, onLog }) {
  const showSidePlank = settings.side_plank_enabled
  const exercises = [CORE_EXERCISES.myotaticCrunch, CORE_EXERCISES.catVomit, ...(showSidePlank ? [CORE_EXERCISES.sidePlank] : [])]

  return (
    <div className="card card-accent-blue mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>6-Minute Abs</div>
        <span className="badge badge-blue">~10 min</span>
      </div>
      {exercises.map((ex, i) => (
        <div key={i} className="list-row">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>{i + 1}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</div>
              {ex.optional && <span className="badge badge-muted text-xs">optional</span>}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
              {ex.targetReps ? `${ex.targetReps} reps` : ex.targetSeconds ? `${ex.targetSeconds}s each side` : ''}
            </div>
            {ex.instructions?.slice(0, 2).map((inst, j) => (
              <div key={j} className="text-xs" style={{ color: 'var(--text3)' }}>· {inst}</div>
            ))}
            {ex.videoUrl && (
              <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs mt-0.5 inline-block" style={{ color: 'var(--primary)' }}>▶ Form video →</a>
            )}
          </div>
        </div>
      ))}
      <button className="btn btn-primary btn-sm btn-full mt-3" onClick={onLog}>Log Core</button>
    </div>
  )
}

function MobilityCard({ settings }) {
  const areas = settings.mobility_areas || ['shoulders', 'hips', 'wrists']
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="card mb-4">
      <div className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
        Mobility · ~10 min
      </div>
      {areas.map(area => {
        const areaData = MOBILITY_EXERCISES[area]
        if (!areaData) return null
        const isOpen = expanded === area
        return (
          <div key={area}>
            <div className="accordion-header" onClick={() => setExpanded(isOpen ? null : area)}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{areaData.label}</span>
              <span style={{ color: 'var(--text2)', fontSize: 20, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && (
              <div className="accordion-body">
                {areaData.exercises.map((ex, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</div>
                    <div className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{ex.duration}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{ex.instructions}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function NutritionCard({ log, autoNutrition, isCheatDay, onLogMeal, onLogWater, onWeight }) {
  const protPct = autoNutrition.protein && log ? Math.min(100, (log.total_protein_g / autoNutrition.protein) * 100) : 0
  const calPct = autoNutrition.calories && log ? Math.min(100, (log.total_calories / autoNutrition.calories) * 100) : 0

  return (
    <div className="card mb-4">
      {isCheatDay && <div className="badge badge-orange mb-3">CHEAT DAY — enjoy it</div>}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Today's Nutrition</div>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', fontSize: 12 }} onClick={onWeight}>
          Log Weight
        </button>
      </div>
      {autoNutrition.protein && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text2)' }}>Protein</span>
            <span className="font-mono" style={{ color: 'var(--text)' }}>
              {log ? Math.round(log.total_protein_g) : 0}g / {autoNutrition.protein}g
            </span>
          </div>
          <div className="progress-bar"><div className="progress-fill orange" style={{ width: `${protPct}%` }} /></div>
        </div>
      )}
      {autoNutrition.calories && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text2)' }}>Calories</span>
            <span className="font-mono" style={{ color: 'var(--text)' }}>
              {log ? Math.round(log.total_calories) : 0} / {autoNutrition.calories}
            </span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${calPct}%` }} /></div>
        </div>
      )}
      {!autoNutrition.calories && (
        <div className="text-xs mb-3" style={{ color: 'var(--text2)' }}>Slow-Carb: eat until full. Track protein.</div>
      )}
      {log?.nutrition_log_entries?.length > 0 && (
        <div className="mb-3">
          {log.nutrition_log_entries.map((e, i) => (
            <div key={i} className="flex justify-between text-xs py-1" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text)' }}>{e.meal_name}</span>
              <span className="font-mono" style={{ color: 'var(--text2)' }}>{Math.round(e.protein_g)}g P</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm flex-1" onClick={onLogMeal}>+ Meal</button>
        <button className="btn btn-secondary btn-sm flex-1" onClick={onLogWater}>💧 Water</button>
      </div>
    </div>
  )
}

function CheatDayCard({ dailyLog, onUpdate, userId, showToast, todayStr }) {
  const items = [
    { key: 'cheat_day_first_meal_done', label: 'First meal: high protein + fiber (before anything else)' },
    { key: 'cheat_day_air_squats_done', label: '60–90 sec air squats + wall pushups before & after each meal' },
    { key: 'cold_exposure_done', label: 'Evening: ice pack on neck/upper trap for 30 min, or cold shower' },
  ]
  const toggle = async (key, val) => {
    await supabase.from('daily_logs').upsert({ user_id: userId, log_date: todayStr, [key]: val })
    onUpdate()
    showToast(val ? '✓ Done' : 'Unchecked')
  }
  return (
    <div className="card mb-4">
      <div className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>Cheat Day Protocol</div>
      {items.map(item => (
        <div key={item.key} className="list-row">
          <div className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{item.label}</div>
          <input type="checkbox" checked={dailyLog?.[item.key] || false}
            onChange={e => toggle(item.key, e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
        </div>
      ))}
      <div className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
        Also: cinnamon + lemon juice with meals to blunt insulin spikes.
      </div>
    </div>
  )
}

function SupplementsCard({ settings, dailyLog, onUpdate, userId, todayStr }) {
  const activeSupps = Object.entries(SUPPLEMENT_INFO).filter(([key]) => settings[key])
  if (!activeSupps.length) return null

  const DB_KEY_MAP = { sup_pagg: 'took_pagg', sup_creatine: 'took_creatine', sup_glutamine: 'took_glutamine', sup_cq: 'took_cq' }

  const toggle = async (key, val) => {
    const dbKey = DB_KEY_MAP[key]
    if (!dbKey) return
    await supabase.from('daily_logs').upsert({ user_id: userId, log_date: todayStr, [dbKey]: val })
    onUpdate()
  }

  return (
    <div className="card mb-4">
      <div className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Today's Protocol</div>
      {activeSupps.map(([key, info]) => {
        const dbKey = DB_KEY_MAP[key]
        return (
          <div key={key} className="list-row">
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{info.label}</div>
              <div className="text-xs" style={{ color: 'var(--text2)' }}>{info.timing}</div>
            </div>
            <input type="checkbox"
              checked={dbKey ? (dailyLog?.[dbKey] || false) : false}
              onChange={e => toggle(key, e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
          </div>
        )
      })}
    </div>
  )
}

function WeekPreview({ settings, todayStr, runLogs, strengthSets }) {
  const ws = weekStart(todayStr)
  const schedule = generateWeekSchedule(ws, settings, { runLogs, strengthSets })

  return (
    <div>
      <div className="section-header">THIS WEEK</div>
      <div className="card">
        {schedule.map((day, i) => {
          const isToday = day.date === todayStr
          return (
            <div key={i} className="list-row"
              style={isToday ? { background: 'rgba(91,124,246,0.06)', margin: '0 -16px', padding: '11px 16px' } : {}}>
              <div className="w-10 flex-shrink-0 text-center">
                <div className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
                  {DAY_NAMES[getDayOfWeek(day.date)]}
                </div>
                <div className="text-sm font-semibold"
                  style={{ color: isToday ? 'var(--primary)' : 'var(--text)' }}>
                  {day.date.split('-')[2]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate"
                  style={{ color: isToday ? 'var(--primary)' : 'var(--text)' }}>
                  {day.label}
                </div>
              </div>
              {day.estimatedMinutes > 0 && (
                <div className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text2)' }}>
                  {day.estimatedMinutes}m
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WaterModal({ open, onClose, current, showToast, userId, todayStr }) {
  const [oz, setOz] = useState(current || 0)

  const save = async () => {
    await supabase.from('nutrition_logs').upsert({
      user_id: userId, log_date: todayStr, water_oz: oz
    }, { onConflict: 'user_id,log_date' })
    showToast('Water logged ✓')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Water Intake">
      <div className="mb-4">
        <label className="label">Ounces today</label>
        <input className="input text-center text-3xl font-mono" type="number"
          value={oz} onChange={e => setOz(parseFloat(e.target.value) || 0)} />
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text3)' }}>
          Goal: 64–80 oz / day. Plus 500ml cold water first thing on waking.
        </p>
      </div>
      <div className="pill-row mb-4 justify-center">
        {[16, 32, 48, 64, 80].map(v => (
          <button key={v} className={`pill ${oz === v ? 'active' : ''}`} onClick={() => setOz(v)}>{v}oz</button>
        ))}
      </div>
      <button className="btn btn-primary btn-full" onClick={save}>Save</button>
    </Modal>
  )
}

function MeasurementQuickModal({ open, onClose, showToast, userId }) {
  const [w, setW] = useState('')
  const [bf, setBf] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const weight = parseFloat(w)
    const bodyFat = parseFloat(bf)
    const lean = weight && bodyFat ? weight * (1 - bodyFat / 100) : null
    await supabase.from('measurements').insert({
      user_id: userId,
      measured_date: new Date().toISOString().split('T')[0],
      bodyweight_lbs: weight || null,
      body_fat_pct: bodyFat || null,
      lean_mass_lbs: lean ? Math.round(lean * 10) / 10 : null,
    })
    if (weight) await supabase.from('user_settings').update({ bodyweight_lbs: weight, body_fat_pct: bodyFat || undefined }).eq('user_id', userId)
    showToast('Recorded ✓ — full measurements in Log tab')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Quick Measurement">
      <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
        Before eating or drinking anything. Full measurement entry is in the Log tab.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="label">Weight (lbs)</label>
          <input className="input text-center text-xl font-mono" type="number" step="0.1" value={w} onChange={e => setW(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label">Body Fat %</label>
          <input className="input text-center text-xl font-mono" type="number" step="0.5" value={bf} onChange={e => setBf(e.target.value)} />
        </div>
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving || !w}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}

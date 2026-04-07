import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { APP_NAME, DAY_NAMES, SUPPLEMENT_INFO, MOBILITY_EXERCISES } from '../lib/constants'
import { calcAutoNutrition } from '../lib/progression'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import Toggle from '../components/ui/Toggle'

export default function Settings() {
  const { settings, updateSetting, updateSettings } = useSettings()
  const { signOut, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast, showToast } = useToast()
  const [section, setSection] = useState(null)

  const s = settings
  const autoN = calcAutoNutrition(s)

  const set = async (key, val) => {
    await updateSetting(key, val)
    showToast('Saved')
  }

  const toggleDay = async (d) => {
    const days = s.training_days || []
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort((a, b) => a - b)
    await set('training_days', next)
  }

  const toggleMobilityArea = async (area) => {
    const areas = s.mobility_areas || []
    const next = areas.includes(area) ? areas.filter(x => x !== area) : [...areas, area]
    await set('mobility_areas', next)
  }

  const SECTIONS = [
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'schedule', label: 'Training Schedule', icon: '📅' },
    { key: 'strength', label: 'Strength Program', icon: '💪' },
    { key: 'running', label: 'Running', icon: '🏃' },
    { key: 'core', label: 'Core & Posterior', icon: '⚡' },
    { key: 'mobility', label: 'Mobility', icon: '🔄' },
    { key: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { key: 'supplements', label: 'Supplements & Protocol', icon: '💊' },
    { key: 'notifications', label: 'Reminders', icon: '🔔' },
    { key: 'account', label: 'Account & Data', icon: '⚙️' },
  ]

  if (section) {
    return (
      <div className="page-content">
        <Toast message={toast} />
        <div className="flex items-center gap-3 mb-6">
          <button className="btn-icon" onClick={() => setSection(null)} style={{ color: 'var(--primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {SECTIONS.find(x => x.key === section)?.label}
          </h1>
        </div>

        {/* ── PROFILE ── */}
        {section === 'profile' && (
          <div>
            <div className="card mb-4">
              <div className="form-group mb-3">
                <label className="label">Name</label>
                <input className="input" defaultValue={s.name || ''} onBlur={e => set('name', e.target.value)} placeholder="Your name" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label">Age</label>
                  <input className="input" type="number" defaultValue={s.age || 35} onBlur={e => set('age', parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="label">Bodyweight (lbs)</label>
                  <input className="input" type="number" step="0.1" defaultValue={s.bodyweight_lbs || ''} onBlur={e => set('bodyweight_lbs', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="label">Height (inches)</label>
                  <input className="input" type="number" defaultValue={s.height_in || 70} onBlur={e => set('height_in', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="label">Body Fat %</label>
                  <input className="input" type="number" step="0.5" defaultValue={s.body_fat_pct || 20} onBlur={e => {
                    const bf = parseFloat(e.target.value)
                    const lean = (s.bodyweight_lbs || 180) * (1 - bf / 100)
                    updateSettings({ body_fat_pct: bf, lean_mass_lbs: Math.round(lean * 10) / 10 })
                    showToast('Saved')
                  }} />
                </div>
              </div>
              <div className="divider" />
              <div className="flex gap-2">
                <div className="stat-box flex-1">
                  <div className="stat-value">{s.lean_mass_lbs ? Math.round(s.lean_mass_lbs) : '—'}</div>
                  <div className="stat-label">Lean Mass (lbs)</div>
                </div>
                <div className="stat-box flex-1">
                  <div className="stat-value" style={{ color: 'var(--secondary)' }}>{autoN.protein || '—'}g</div>
                  <div className="stat-label">Protein Goal</div>
                </div>
                <div className="stat-box flex-1">
                  <div className="stat-value" style={{ color: 'var(--accent)' }}>{autoN.calories || '—'}</div>
                  <div className="stat-label">Cal Goal</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Theme</div>
              <div className="flex gap-3 items-center">
                <span className="text-sm" style={{ color: 'var(--text2)' }}>
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </span>
                <Toggle checked={theme === 'dark'} onChange={toggleTheme} id="theme-toggle" />
              </div>
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {section === 'schedule' && (
          <div className="card">
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Available Training Days</div>
            <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
              The app uses these as available days. Actual sessions are scheduled by rest requirements — not locked to specific days.
            </p>
            <div className="pill-row mb-6">
              {DAY_NAMES.map((d, i) => (
                <button key={i} className={`pill ${(s.training_days || []).includes(i) ? 'active' : ''}`}
                  onClick={() => toggleDay(i)}>{d}</button>
              ))}
            </div>
            <div className="divider" />
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Allow Sunday workouts</div>
                <div className="text-xs" style={{ color: 'var(--text2)' }}>Off by default. Sessions never land on Sunday unless enabled.</div>
              </div>
              <Toggle checked={s.allow_sunday || false} onChange={v => set('allow_sunday', v)} id="sunday-toggle" />
            </div>
            <div className="divider" />
            <div className="mt-3">
              <label className="label">Cheat Day</label>
              <select className="input" value={s.cheat_day ?? 6} onChange={e => set('cheat_day', parseInt(e.target.value))}>
                {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Measurements are taken on cheat day morning before eating.</p>
            </div>
          </div>
        )}

        {/* ── STRENGTH ── */}
        {section === 'strength' && (
          <div>
            <div className="card mb-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Program</div>
              <div className="form-group mb-3">
                <label className="label">Strength Program</label>
                <select className="input" value={s.strength_program || 'g2f'} onChange={e => set('strength_program', e.target.value)}>
                  <option value="g2f">Geek to Freak (full-body, same exercises each session)</option>
                  <option value="occams">Occam's Protocol (A/B alternating split)</option>
                  <option value="none">None</option>
                </select>
              </div>
              {s.strength_program === 'occams' && (
                <div className="form-group mb-3">
                  <label className="label">Equipment Variant</label>
                  <select className="input" value={s.occams_variant || 'machine'} onChange={e => set('occams_variant', e.target.value)}>
                    <option value="machine">Machine (recommended)</option>
                    <option value="freeweight">Free Weights</option>
                  </select>
                </div>
              )}
            </div>

            <div className="card mb-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Current State</div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>Test Session Completed</div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>Starting weights established via 5-rep ramp-up</div>
                </div>
                <Toggle checked={s.strength_test_done || false} onChange={v => set('strength_test_done', v)} id="testdone-toggle" />
              </div>
              <div className="mt-3">
                <label className="label">Current Rest Phase ({[2, 3, 4][((s.strength_rest_phase || 1) - 1)]} days between sessions)</label>
                <select className="input" value={s.strength_rest_phase || 1} onChange={e => set('strength_rest_phase', parseInt(e.target.value))}>
                  <option value={1}>Phase 1 — 2 days rest</option>
                  <option value={2}>Phase 2 — 3 days rest</option>
                  <option value={3}>Phase 3 — 4 days rest (maximum)</option>
                </select>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Phase advances automatically when more than 1 exercise stalls. Manual override here.
                </p>
              </div>
              {s.last_strength_date && (
                <div className="mt-3 text-sm" style={{ color: 'var(--text2)' }}>
                  Last session: {s.last_strength_date}
                </div>
              )}
            </div>

            <div className="card">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>The Four Rules (quick reference)</div>
              {[
                'If you hit minimum reps on all exercises → increase weight by 10 lbs next session.',
                'At failure: hold position for 5 sec, then lower over 5–10 sec. True failure = cannot move the weight at all.',
                'No pause at top or bottom (except bench: 1-sec pause at bottom). Exactly 3 min rest between exercises.',
                'Control all variables: same rep speed, form, and rest intervals every session.',
              ].map((rule, i) => (
                <div key={i} className="flex gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--primary)', color: '#fff' }}>{i + 1}</div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>{rule}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RUNNING ── */}
        {section === 'running' && (
          <div>
            <div className="card mb-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Plan</div>
              <div className="form-group mb-3">
                <label className="label">Running Plan</label>
                <select className="input" value={s.running_plan || 'maf'} onChange={e => set('running_plan', e.target.value)}>
                  <option value="maf">MAF Hybrid (low-HR base + intervals) — recommended</option>
                  <option value="cfe">4HB CrossFit Endurance (interval-focused)</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label className="label">Progression Type</label>
                <select className="input" value={s.running_progression_type || 'time'} onChange={e => set('running_progression_type', e.target.value)}>
                  <option value="time">Time-based (minutes)</option>
                  <option value="distance">Distance-based (miles)</option>
                </select>
              </div>
            </div>

            <div className="card mb-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>MAF Heart Rate</div>
              <div className="form-group mb-2">
                <label className="label">Target HR (bpm)</label>
                <input className="input" type="number" defaultValue={s.running_hr_target || (180 - (s.age || 35))}
                  onBlur={e => set('running_hr_target', parseInt(e.target.value))} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                MAF Formula: 180 − age ({s.age || 35}) = {180 - (s.age || 35)} bpm. Adjust manually if needed.
              </p>
            </div>

            <div className="card">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Progression</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Starting Distance (mi)</label>
                  <input className="input" type="number" step="0.5" defaultValue={s.running_start_miles || 3}
                    onBlur={e => set('running_start_miles', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="label">Weekly Increase %</label>
                  <input className="input" type="number" min={5} max={20} defaultValue={s.running_progression_pct || 10}
                    onBlur={e => set('running_progression_pct', parseInt(e.target.value))} />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                After each pair of easy runs, next week's target increases by this percentage. 10% is Ferriss/Maffetone standard.
              </p>
            </div>
          </div>
        )}

        {/* ── CORE & POSTERIOR ── */}
        {section === 'core' && (
          <div>
            <div className="card mb-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Core — 6-Minute Abs</div>
              <div className="flex items-center justify-between py-2 border-b mb-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>Core Enabled</div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>Myotatic Crunch + Cat Vomit, 2–3×/week</div>
                </div>
                <Toggle checked={s.core_enabled || false} onChange={v => set('core_enabled', v)} id="core-enabled" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>Include Side Plank</div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>Optional addition to the two core exercises</div>
                </div>
                <Toggle checked={s.side_plank_enabled || false} onChange={v => set('side_plank_enabled', v)} id="sideplank-toggle" />
              </div>
            </div>

            <div className="card">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Posterior Chain</div>
              <div className="flex items-center justify-between py-2 border-b mb-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>Posterior Chain Enabled</div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>Glute bridge + raises + KB swings, morning</div>
                </div>
                <Toggle checked={s.posterior_enabled || false} onChange={v => set('posterior_enabled', v)} id="posterior-enabled" />
              </div>
              <div>
                <label className="label">Sessions per week</label>
                <select className="input" value={s.posterior_days_per_week || 2} onChange={e => set('posterior_days_per_week', parseInt(e.target.value))}>
                  <option value={2}>2× per week</option>
                  <option value={3}>3× per week</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILITY ── */}
        {section === 'mobility' && (
          <div>
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Mobility Enabled</div>
                <Toggle checked={s.mobility_enabled || false} onChange={v => set('mobility_enabled', v)} id="mob-enabled" />
              </div>
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Active Areas</div>
              <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>Minimum: shoulders, hips, wrists. Add more as desired.</p>
              <div className="pill-row">
                {Object.entries(MOBILITY_EXERCISES).map(([key, val]) => (
                  <button key={key} className={`pill ${(s.mobility_areas || []).includes(key) ? 'active' : ''}`}
                    onClick={() => toggleMobilityArea(key)}>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NUTRITION ── */}
        {section === 'nutrition' && (
          <div>
            <div className="card mb-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Plan</div>
              <div className="form-group mb-3">
                <label className="label">Nutrition Plan</label>
                <select className="input" value={s.nutrition_plan || 'slowcarb'} onChange={e => set('nutrition_plan', e.target.value)}>
                  <option value="slowcarb">Slow-Carb Diet (Ferriss) — eat until full, track protein</option>
                  <option value="g2f">Geek to Freak (high-calorie bulk) — strict calorie minimum</option>
                  <option value="custom">Custom — set your own goals</option>
                </select>
              </div>
              <div className="card mb-0" style={{ background: 'var(--surface2)' }}>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--text2)' }}>AUTO-CALCULATED FROM YOUR STATS</div>
                <div className="flex gap-2">
                  <div className="stat-box flex-1">
                    <div className="stat-value">{autoN.calories || '—'}</div>
                    <div className="stat-label">Calories</div>
                  </div>
                  <div className="stat-box flex-1">
                    <div className="stat-value" style={{ color: 'var(--secondary)' }}>{autoN.protein || '—'}g</div>
                    <div className="stat-label">Protein</div>
                  </div>
                </div>
                {autoN.note && <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>{autoN.note}</p>}
              </div>
            </div>

            {s.nutrition_plan === 'custom' && (
              <div className="card mb-4">
                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Custom Goals</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Calorie Goal</label>
                    <input className="input" type="number" defaultValue={s.calorie_goal || ''} onBlur={e => set('calorie_goal', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="label">Protein Goal (g)</label>
                    <input className="input" type="number" defaultValue={s.protein_goal_g || ''} onBlur={e => set('protein_goal_g', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUPPLEMENTS ── */}
        {section === 'supplements' && (
          <div>
            <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
              Toggle what you want tracked in your daily protocol checklist. Toggle on to show in Today screen.
            </p>
            {Object.entries(SUPPLEMENT_INFO).map(([key, info]) => (
              <div key={key} className="card mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{info.label}</div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text2)' }}>{info.description}</div>
                    <div className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{info.timing}</div>
                    {info.cyclingNote && (
                      <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{info.cyclingNote}</div>
                    )}
                  </div>
                  <Toggle checked={s[key] || false} onChange={v => set(key, v)} id={`supp-${key}`} />
                </div>
              </div>
            ))}

            <div className="card mt-4">
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Cold Exposure</div>
              <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>
                Ferriss recommends an ice pack on the back of the neck and upper trapezius for 30 minutes in the evening. This targets brown adipose tissue (BAT) for thermogenic fat loss. Cold shower before breakfast is also recommended.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: 'var(--text)' }}>Track cold exposure</div>
                <Toggle checked={s.sup_cold_exposure || false} onChange={v => set('sup_cold_exposure', v)} id="cold-toggle" />
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {section === 'notifications' && (
          <div className="card">
            <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
              To receive push notifications, install the app to your home screen (iOS: Share → Add to Home Screen; Android: tap Install prompt).
            </p>
            <div className="form-group mb-3">
              <label className="label">Morning reminder time</label>
              <input className="input" type="time" defaultValue={s.morning_reminder_time || '07:00'}
                onBlur={e => set('morning_reminder_time', e.target.value)} />
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Shows today's workout and any reminders.</p>
            </div>
            <div className="form-group">
              <label className="label">Evening reminder time</label>
              <input className="input" type="time" defaultValue={s.evening_reminder_time || '20:00'}
                onBlur={e => set('evening_reminder_time', e.target.value)} />
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Alerts you if anything is unlogged for the day.</p>
            </div>
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {section === 'account' && (
          <div>
            <div className="card mb-4">
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Account</div>
              <div className="text-xs mb-4" style={{ color: 'var(--text2)' }}>{user?.email}</div>
              <button className="btn btn-secondary btn-sm btn-full" onClick={signOut}>Sign Out</button>
            </div>
            <div className="card mb-4">
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Data Export</div>
              <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>Download all your data as JSON. Back up regularly.</p>
              <button className="btn btn-secondary btn-sm btn-full" onClick={async () => {
                const { data } = await import('../lib/supabase').then(m => m.supabase.from('strength_logs').select('*').eq('user_id', user.id))
                const blob = new Blob([JSON.stringify({ user: user.email, exportDate: new Date().toISOString(), note: 'Full export available from Progress tab' }, null, 2)], { type: 'application/json' })
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                a.download = `respire-${new Date().toISOString().split('T')[0]}.json`; a.click()
                showToast('Use Progress → Export for full data')
              }}>Export Data (use Progress tab for full export)</button>
            </div>
            <div className="card">
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>About</div>
              <div className="text-xs" style={{ color: 'var(--text2)' }}>{APP_NAME} · Based on Tim Ferriss' 4-Hour Body protocols.</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                To change the app name: edit APP_NAME in src/lib/constants.js and redeploy.
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main settings menu
  return (
    <div className="page-content">
      <Toast message={toast} />
      <h1 className="font-display text-4xl font-bold mb-6" style={{ color: 'var(--text)' }}>Settings</h1>

      <div className="card">
        {SECTIONS.map((sec, i) => (
          <button key={sec.key} onClick={() => setSection(sec.key)}
            className="list-row w-full text-left" style={{ cursor: 'pointer' }}>
            <span className="text-lg w-8 flex-shrink-0">{sec.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{sec.label}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { calcAutoNutrition } from '../lib/progression'
import { APP_NAME, DAY_NAMES } from '../lib/constants'

const STEPS = ['profile', 'program', 'schedule', 'nutrition', 'done']

export default function Onboarding() {
  const { saveAllSettings } = useSettings()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    age: '',
    bodyweight_lbs: '',
    body_fat_pct: '',
    strength_program: 'g2f',
    occams_variant: 'machine',
    running_plan: 'maf',
    core_enabled: true,
    posterior_enabled: true,
    mobility_enabled: true,
    nutrition_enabled: true,
    nutrition_plan: 'slowcarb',
    cheat_day: 6,
    training_days: [1, 2, 4, 5, 6],
    running_start_miles: 3,
    running_progression_type: 'time',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleDay = (d) => {
    const days = form.training_days.includes(d)
      ? form.training_days.filter(x => x !== d)
      : [...form.training_days, d].sort((a, b) => a - b)
    set('training_days', days)
  }

  const finish = async () => {
    setSaving(true)
    const bw = parseFloat(form.bodyweight_lbs) || 180
    const bf = parseFloat(form.body_fat_pct) || 20
    const lean = bw * (1 - bf / 100)

    const auto = calcAutoNutrition({
      bodyweight_lbs: bw,
      body_fat_pct: bf,
      nutrition_plan: form.nutrition_plan,
      lean_mass_lbs: lean,
    })

    await saveAllSettings({
      ...form,
      age: parseInt(form.age) || 35,
      bodyweight_lbs: bw,
      body_fat_pct: bf,
      lean_mass_lbs: Math.round(lean * 10) / 10,
      calorie_goal: auto.calories,
      protein_goal_g: auto.protein,
      onboarded: true,
    })
    setSaving(false)
  }

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="font-display text-3xl font-semibold mb-1" style={{ color: 'var(--primary)' }}>{APP_NAME}</div>
        <div className="text-sm" style={{ color: 'var(--text2)' }}>Let's build your program</div>
        {/* Step dots */}
        <div className="flex gap-2 mt-4">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-1 rounded-full flex-1 transition-all duration-300"
              style={{ background: i <= step ? 'var(--primary)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">

        {currentStep === 'profile' && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--text)' }}>About you</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>Used to calculate your training targets.</p>

            <div className="mb-4">
              <label className="label">Your name</label>
              <input className="input" placeholder="First name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">Age</label>
                <input className="input" type="number" placeholder="35" value={form.age} onChange={e => set('age', e.target.value)} />
              </div>
              <div>
                <label className="label">Weight (lbs)</label>
                <input className="input" type="number" placeholder="180" value={form.bodyweight_lbs} onChange={e => set('bodyweight_lbs', e.target.value)} />
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Body fat % (estimate)</label>
              <input className="input" type="number" placeholder="20" value={form.body_fat_pct} onChange={e => set('body_fat_pct', e.target.value)} />
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Used to calculate lean mass and calorie targets. Estimate is fine.</p>
            </div>
          </div>
        )}

        {currentStep === 'program' && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--text)' }}>Your program</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>Choose what to include. Everything can be changed later.</p>

            {/* Strength */}
            <div className="card mb-3">
              <div className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Strength Training</div>
              <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>1 set to failure, 5/5 cadence, progressive rest intervals.</p>
              <div className="tab-row">
                {[['g2f', "Geek to Freak (full body)"], ['occams', "Occam's Protocol (A/B)"], ['none', 'Skip']].map(([val, label]) => (
                  <button key={val} className={`tab-btn ${form.strength_program === val ? 'active' : ''}`} onClick={() => set('strength_program', val)}>{label}</button>
                ))}
              </div>
              {form.strength_program === 'occams' && (
                <div className="mt-3">
                  <label className="label">Equipment</label>
                  <div className="tab-row">
                    {[['machine', 'Machine'], ['freeweight', 'Free Weight']].map(([val, label]) => (
                      <button key={val} className={`tab-btn ${form.occams_variant === val ? 'active' : ''}`} onClick={() => set('occams_variant', val)}>{label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Running */}
            <div className="card mb-3">
              <div className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Running</div>
              <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>3× per week: 2 easy aerobic runs + 1 interval session.</p>
              <div className="tab-row">
                {[['maf', 'MAF (low HR)'], ['cfe', '4HB CrossFit Endurance'], ['none', 'Skip']].map(([val, label]) => (
                  <button key={val} className={`tab-btn ${form.running_plan === val ? 'active' : ''}`} onClick={() => set('running_plan', val)}>{label}</button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            {[
              { key: 'core_enabled', label: 'Core', desc: '6-Minute Abs: Myotatic Crunch + Cat Vomit' },
              { key: 'posterior_enabled', label: 'Posterior Chain', desc: 'Glute Bridge + Raises + KB Swings (75 reps)' },
              { key: 'mobility_enabled', label: 'Mobility', desc: 'Shoulders, hips, wrists (configurable)' },
              { key: 'nutrition_enabled', label: 'Nutrition Tracking', desc: 'Meal planning, macro logging, slow-carb compliance' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="card mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{desc}</div>
                  </div>
                  <label className="toggle-wrapper" htmlFor={key}>
                    <input type="checkbox" id={key} checked={form[key]} onChange={e => set(key, e.target.checked)} />
                    <div className="toggle-track" /><div className="toggle-thumb" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 'schedule' && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--text)' }}>Your schedule</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>Which days are you available to train? The app handles the rest.</p>

            <label className="label">Training days</label>
            <div className="pill-row mb-5">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  className={`pill ${form.training_days.includes(i) ? 'active' : ''}`}
                  onClick={() => toggleDay(i)}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="text-xs mb-5" style={{ color: 'var(--text3)' }}>Sundays are excluded by default. Strength sessions are scheduled by rest interval, not fixed days — so the app will always tell you when the next session is.</p>

            <label className="label">Cheat day</label>
            <div className="pill-row mb-5">
              {DAY_NAMES.map((name, i) => (
                <button key={i} className={`pill ${form.cheat_day === i ? 'active' : ''}`} onClick={() => set('cheat_day', i)}>{name}</button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'nutrition' && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--text)' }}>Nutrition plan</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>How you'll eat. Can always be changed in Settings.</p>

            <div className="tab-row mb-4">
              {[['slowcarb', 'Slow-Carb'], ['g2f', 'Geek to Freak'], ['custom', 'Custom']].map(([val, label]) => (
                <button key={val} className={`tab-btn ${form.nutrition_plan === val ? 'active' : ''}`} onClick={() => set('nutrition_plan', val)}>{label}</button>
              ))}
            </div>

            {form.nutrition_plan === 'slowcarb' && (
              <div className="card card-accent-blue">
                <div className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Slow-Carb Diet</div>
                <div className="text-sm space-y-1" style={{ color: 'var(--text2)' }}>
                  <p>✓ No white carbs (bread, rice, pasta, potatoes)</p>
                  <p>✓ Same meals repeated daily</p>
                  <p>✓ No fruit, no liquid calories</p>
                  <p>✓ One cheat day per week</p>
                  <p>✓ ≥20g protein per meal</p>
                </div>
              </div>
            )}

            {form.nutrition_plan === 'g2f' && (
              <div className="card card-accent-orange">
                <div className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Geek to Freak Nutrition</div>
                <div className="text-sm" style={{ color: 'var(--text2)' }}>
                  <p className="mb-1">Calculated from your lean body mass:</p>
                  {form.bodyweight_lbs && form.body_fat_pct && (() => {
                    const lean = parseFloat(form.bodyweight_lbs) * (1 - parseFloat(form.body_fat_pct) / 100)
                    const cal = Math.round((lean + 10) * 20)
                    const prot = Math.round(lean * 1.25)
                    return <p className="font-semibold font-mono text-sm" style={{ color: 'var(--secondary)' }}>{cal} cal/day · {prot}g protein/day</p>
                  })()}
                  <p className="mt-1 text-xs" style={{ color: 'var(--text3)' }}>20 cal × (lean mass + 10 lbs). Rock-bottom minimum.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'done' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="font-display text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              You're set, {form.name || 'Operator'}.
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>
              Your program is configured. The app will tell you exactly what to do each day.
            </p>
            <div className="card text-left mb-4">
              <div className="section-header mb-3">Your program</div>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text2)' }}>
                {form.strength_program !== 'none' && <p>💪 {form.strength_program === 'g2f' ? 'Geek to Freak' : "Occam's Protocol"}</p>}
                {form.running_plan !== 'none' && <p>🏃 {form.running_plan === 'maf' ? 'MAF running (low HR aerobic base)' : '4HB CrossFit Endurance'}</p>}
                {form.core_enabled && <p>🎯 Core — 6-Minute Abs</p>}
                {form.posterior_enabled && <p>🔔 Posterior chain — KB Swings</p>}
                {form.mobility_enabled && <p>🧘 Mobility work</p>}
                {form.nutrition_enabled && <p>🥗 {form.nutrition_plan === 'slowcarb' ? 'Slow-Carb Diet' : form.nutrition_plan === 'g2f' ? 'G2F Nutrition' : 'Custom nutrition'}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="px-5 pb-6 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
        {step > 0 && (
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
            Back
          </button>
        )}
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          disabled={saving}
          onClick={() => {
            if (isLast) finish()
            else setStep(s => s + 1)
          }}
        >
          {saving ? 'Saving…' : isLast ? `Start ${APP_NAME} →` : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

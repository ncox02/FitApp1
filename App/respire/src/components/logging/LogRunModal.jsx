// LogRunModal
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { today } from '../../lib/scheduling'
import Modal from '../ui/Modal'

export function LogRunModal({ open, onClose, runType, mafHR, targetMiles, settings, showToast, userId }) {
  const [distance, setDistance] = useState(targetMiles || '')
  const [duration, setDuration] = useState('')
  const [avgHR, setAvgHR] = useState('')
  const [maxHR, setMaxHR] = useState('')
  const [intervals, setIntervals] = useState(6)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const progressType = settings.running_progression_type || 'time'

  const save = async () => {
    setSaving(true)
    const hrCompliant = avgHR ? parseInt(avgHR) <= mafHR : null
    const pace = distance && duration ? (parseFloat(duration) / parseFloat(distance)).toFixed(2) : null

    await supabase.from('running_logs').insert({
      user_id: userId,
      session_date: today(),
      run_type: runType,
      distance_miles: parseFloat(distance) || null,
      duration_min: parseFloat(duration) || null,
      avg_hr_bpm: parseInt(avgHR) || null,
      max_hr_bpm: parseInt(maxHR) || null,
      maf_hr_target: mafHR,
      hr_compliance: hrCompliant,
      avg_pace_per_mile: pace ? parseFloat(pace) : null,
      intervals_completed: runType === 'intervals' ? parseInt(intervals) : null,
      notes,
    })

    await supabase.from('user_settings').update({ last_run_date: today(), last_run_type: runType }).eq('user_id', userId)

    showToast('Run logged ✓')
    setSaving(false)
    onClose()
  }

  const runLabels = { easy: 'Easy Aerobic Run', easy2: 'Easy Aerobic Run #2', intervals: 'Interval Run' }

  return (
    <Modal open={open} onClose={onClose} title={`Log: ${runLabels[runType] || 'Run'}`}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="label">Distance (miles)</label>
          <input className="input" type="number" step="0.1" placeholder={targetMiles}
            value={distance} onChange={e => setDistance(e.target.value)} />
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input className="input" type="number" placeholder="45"
            value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div>
          <label className="label">Avg HR (bpm)</label>
          <input className="input" type="number" placeholder={mafHR}
            value={avgHR} onChange={e => setAvgHR(e.target.value)} />
          {avgHR && parseInt(avgHR) > mafHR && (
            <div className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
              ↑ Above MAF target ({mafHR})
            </div>
          )}
        </div>
        <div>
          <label className="label">Max HR (bpm)</label>
          <input className="input" type="number"
            value={maxHR} onChange={e => setMaxHR(e.target.value)} />
        </div>
      </div>

      {runType === 'intervals' && (
        <div className="mb-3">
          <label className="label">Intervals completed (of 6)</label>
          <input className="input" type="number" min={0} max={6} value={intervals}
            onChange={e => setIntervals(e.target.value)} />
        </div>
      )}

      <div className="mb-4">
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Conditions, how it felt…" />
      </div>

      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Run'}
      </button>
    </Modal>
  )
}

// LogPosteriorModal
export function LogPosteriorModal({ open, onClose, showToast, userId }) {
  const [kbWeight, setKbWeight] = useState(35)
  const [kbReps, setKbReps] = useState(75)
  const [bridgeReps, setBridgeReps] = useState(20)
  const [raisesReps, setRaisesReps] = useState(15)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('posterior_logs').insert({
      user_id: userId,
      session_date: today(),
      glute_bridge_reps: parseInt(bridgeReps),
      raises_reps_per_side: parseInt(raisesReps),
      kb_weight_lbs: parseFloat(kbWeight),
      kb_total_reps: parseInt(kbReps),
      notes,
    })
    await supabase.from('user_settings').update({ last_posterior_date: today() }).eq('user_id', userId)
    showToast('Posterior chain logged ✓')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Posterior Chain">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="label">Glute Bridge Reps</label>
          <input className="input" type="number" value={bridgeReps}
            onChange={e => setBridgeReps(e.target.value)} />
        </div>
        <div>
          <label className="label">Raises (per side)</label>
          <input className="input" type="number" value={raisesReps}
            onChange={e => setRaisesReps(e.target.value)} />
        </div>
        <div>
          <label className="label">KB Weight (lbs)</label>
          <input className="input" type="number" step="4" value={kbWeight}
            onChange={e => setKbWeight(e.target.value)} />
        </div>
        <div>
          <label className="label">KB Total Reps</label>
          <input className="input" type="number" value={kbReps}
            onChange={e => setKbReps(e.target.value)} />
          <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Min: 75</div>
        </div>
      </div>
      <div className="mb-4">
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}

// LogCoreModal
export function LogCoreModal({ open, onClose, settings, showToast, userId }) {
  const [crunchReps, setCrunchReps] = useState(10)
  const [crunchWeight, setCrunchWeight] = useState(0)
  const [cvReps, setCvReps] = useState(10)
  const [cvHold, setCvHold] = useState(10)
  const [sidePlank, setSidePlank] = useState(false)
  const [sidePlankSec, setSidePlankSec] = useState(45)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('core_logs').insert({
      user_id: userId,
      session_date: today(),
      crunch_reps: parseInt(crunchReps),
      crunch_weight_lbs: parseFloat(crunchWeight),
      cat_vomit_reps: parseInt(cvReps),
      cat_vomit_hold_sec: parseInt(cvHold),
      side_plank_done: sidePlank,
      side_plank_sec_each: sidePlank ? parseInt(sidePlankSec) : null,
      notes,
    })
    showToast('Core logged ✓')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Core — 6-Minute Abs">
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Myotatic Crunch</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Reps</label>
            <input className="input" type="number" value={crunchReps} onChange={e => setCrunchReps(e.target.value)} />
          </div>
          <div>
            <label className="label">Added weight (lbs)</label>
            <input className="input" type="number" step="2.5" value={crunchWeight} onChange={e => setCrunchWeight(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Cat Vomit (Ab Vacuum)</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Reps</label>
            <input className="input" type="number" value={cvReps} onChange={e => setCvReps(e.target.value)} />
          </div>
          <div>
            <label className="label">Hold (sec)</label>
            <input className="input" type="number" value={cvHold} onChange={e => setCvHold(e.target.value)} />
          </div>
        </div>
      </div>

      {settings.side_plank_enabled && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Side Plank</div>
            <label className="toggle-wrapper">
              <input type="checkbox" checked={sidePlank} onChange={e => setSidePlank(e.target.checked)} />
              <div className="toggle-track" /><div className="toggle-thumb" />
            </label>
          </div>
          {sidePlank && (
            <div>
              <label className="label">Seconds each side</label>
              <input className="input" type="number" value={sidePlankSec} onChange={e => setSidePlankSec(e.target.value)} />
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Core Session'}
      </button>
    </Modal>
  )
}

// LogWeightModal
export function LogWeightModal({ open, onClose, current, showToast, userId }) {
  const [weight, setWeight] = useState(current || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const w = parseFloat(weight)
    await Promise.all([
      supabase.from('daily_logs').upsert({ user_id: userId, log_date: today(), bodyweight_lbs: w }),
      supabase.from('user_settings').update({ bodyweight_lbs: w }).eq('user_id', userId),
    ])
    showToast('Weight logged ✓')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Bodyweight">
      <div className="mb-6">
        <label className="label">Weight (lbs)</label>
        <input className="input text-center text-4xl font-mono" type="number" step="0.1"
          value={weight} onChange={e => setWeight(e.target.value)} autoFocus />
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text3)' }}>
          Weigh yourself first thing in the morning, before eating or drinking.
        </p>
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving || !weight}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}

// LogMealModal
export function LogMealModal({ open, onClose, showToast, userId, todayStr }) {
  const [tab, setTab] = useState('quick') // 'meals' | 'quick'
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [slot, setSlot] = useState('lunch')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const logRes = await supabase.from('nutrition_logs').upsert({
      user_id: userId,
      log_date: todayStr,
    }, { onConflict: 'user_id,log_date' }).select().single()

    const logId = logRes.data?.id
    if (!logId) { setSaving(false); showToast('Error — try again'); return }

    const cal = parseFloat(calories) || ((parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fat) || 0) * 9)

    await supabase.from('nutrition_log_entries').insert({
      nutrition_log_id: logId,
      user_id: userId,
      meal_name: name || 'Meal',
      meal_slot: slot,
      calories: cal,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
      is_quick_entry: true,
    })

    // Update totals on nutrition_log
    await supabase.rpc('update_nutrition_totals', { p_log_id: logId }).catch(() => {})
    // Fallback: manual update
    await supabase.from('nutrition_logs').update({
      total_calories: supabase.raw('total_calories + ' + cal),
      total_protein_g: supabase.raw('total_protein_g + ' + (parseFloat(protein) || 0)),
    }).eq('id', logId)

    showToast('Meal logged ✓')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Meal">
      <div className="mb-3">
        <label className="label">Meal slot</label>
        <select className="input" value={slot} onChange={e => setSlot(e.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="label">Name / Description</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Chicken + black beans" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="label">Calories</label>
          <input className="input" type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="500" />
        </div>
        <div>
          <label className="label">Protein (g)</label>
          <input className="input" type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="40" />
        </div>
        <div>
          <label className="label">Carbs (g)</label>
          <input className="input" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="30" />
        </div>
        <div>
          <label className="label">Fat (g)</label>
          <input className="input" type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="15" />
        </div>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
        Calories auto-calculated from macros if left blank.
      </p>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving || (!name && !protein)}>
        {saving ? 'Saving…' : 'Add to Today'}
      </button>
    </Modal>
  )
}

// LogSleepModal
export function LogSleepModal({ open, onClose, showToast, userId, todayStr }) {
  const [hours, setHours] = useState('')
  const [quality, setQuality] = useState(3)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('sleep_logs').upsert({
      user_id: userId,
      log_date: todayStr,
      hours_slept: parseFloat(hours) || null,
      quality: parseInt(quality),
      notes,
    })
    showToast('Sleep logged ✓')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Sleep">
      <div className="mb-4">
        <label className="label">Hours slept</label>
        <input className="input text-center text-3xl font-mono" type="number" step="0.5" min="0" max="16"
          value={hours} onChange={e => setHours(e.target.value)} placeholder="8" />
      </div>
      <div className="mb-4">
        <label className="label">Quality — {['', 'Poor', 'Fair', 'OK', 'Good', 'Great'][quality]}</label>
        <input type="range" min={1} max={5} value={quality}
          onChange={e => setQuality(e.target.value)}
          style={{ width: '100%', accentColor: 'var(--primary)' }} />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text3)' }}>
          <span>Poor</span><span>Great</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving || !hours}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  )
}

export default LogRunModal

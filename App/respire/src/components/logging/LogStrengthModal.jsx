// src/components/logging/LogStrengthModal.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { G2F_EXERCISES, OCCAMS_WORKOUTS } from '../../lib/constants'
import { getNextWeight, calcStartingWeight } from '../../lib/progression'
import { evaluateRestPhaseChange } from '../../lib/scheduling'
import { today } from '../../lib/scheduling'
import Modal from '../ui/Modal'

export function LogStrengthModal({ open, onClose, settings, strengthSets, showToast, userId }) {
  const isOccams = settings.strength_program === 'occams'
  const nextWorkout = settings.occams_next_workout || 'A'
  const variant = settings.occams_variant || 'machine'
  const isTestSession = !settings.strength_test_done

  const exercises = isOccams
    ? (OCCAMS_WORKOUTS[nextWorkout]?.[variant] || [])
    : G2F_EXERCISES.filter(e => !settings.disabled_exercises?.includes(e.id))

  const [sets, setSets] = useState(
    exercises.map(ex => ({ exercise_name: ex.name, weight_lbs: '', reps_completed: '', reached_true_failure: false }))
  )
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [testDone, setTestDone] = useState(true)

  const updateSet = (i, field, value) => {
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const save = async () => {
    setSaving(true)
    const program = isOccams ? `occams_${nextWorkout.toLowerCase()}` : 'g2f'

    const { data: log, error } = await supabase.from('strength_logs').insert({
      user_id: userId,
      session_date: today(),
      program,
      is_test_session: isTestSession,
      rest_phase: settings.strength_rest_phase,
      occams_workout: isOccams ? nextWorkout : null,
      session_notes: notes,
    }).select().single()

    if (error || !log) { showToast('Error saving — check connection'); setSaving(false); return }

    const setRows = sets
      .filter(s => s.reps_completed !== '' && s.reps_completed !== undefined)
      .map((s, i) => ({
        strength_log_id: log.id,
        user_id: userId,
        exercise_name: s.exercise_name,
        exercise_order: i + 1,
        weight_lbs: parseFloat(s.weight_lbs) || 0,
        reps_completed: parseInt(s.reps_completed) || 0,
        reached_true_failure: s.reached_true_failure,
        is_test_set: isTestSession,
      }))

    await supabase.from('strength_log_sets').insert(setRows)

    // Update settings: next workout, rest phase, last date
    const newPhase = evaluateRestPhaseChange(settings.strength_rest_phase, setRows)
    const updates = {
      last_strength_date: today(),
      strength_rest_phase: newPhase,
    }
    if (isTestSession && testDone) updates.strength_test_done = true
    if (isOccams) updates.occams_next_workout = nextWorkout === 'A' ? 'B' : 'A'

    await supabase.from('user_settings').update(updates).eq('user_id', userId)

    showToast('Session logged ✓')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isTestSession ? 'Test Session' : 'Log Strength'}>
      {isTestSession && (
        <div className="text-xs p-3 rounded-lg mb-4" style={{ background: 'rgba(91,124,246,0.1)', color: 'var(--primary)' }}>
          Record starting weight found via 5-rep ramp-up. This becomes your Session 2 baseline.
        </div>
      )}

      {exercises.map((ex, i) => {
        const next = isTestSession ? null : getNextWeight(ex.name, strengthSets)
        return (
          <div key={ex.id || i} className="mb-4 p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
              {ex.name}
              {next?.weight && <span className="text-xs font-mono ml-2" style={{ color: 'var(--primary)' }}>
                Target: {next.weight} lbs
              </span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Weight (lbs)</label>
                <input className="input" type="number" step="2.5"
                  placeholder={next?.weight || ex.startWeightMale}
                  value={sets[i]?.weight_lbs}
                  onChange={e => updateSet(i, 'weight_lbs', e.target.value)} />
              </div>
              <div>
                <label className="label">Reps to failure</label>
                <input className="input" type="number" min="1" max="30"
                  value={sets[i]?.reps_completed}
                  onChange={e => updateSet(i, 'reps_completed', e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={sets[i]?.reached_true_failure}
                onChange={e => updateSet(i, 'reached_true_failure', e.target.checked)} />
              Reached true failure (held 5 sec at limit, slow lower)
            </label>
          </div>
        )
      })}

      <div className="mb-4">
        <label className="label">Session notes (optional)</label>
        <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How did it feel?" />
      </div>

      {isTestSession && (
        <label className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--text)' }}>
          <input type="checkbox" checked={testDone} onChange={e => setTestDone(e.target.checked)} />
          Mark test session complete (unlock normal progression)
        </label>
      )}

      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Session'}
      </button>
    </Modal>
  )
}

export default LogStrengthModal

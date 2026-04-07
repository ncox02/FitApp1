import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../lib/scheduling'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function Log() {
  const { user } = useAuth()
  const { toast, showToast } = useToast()
  const [tab, setTab] = useState('workouts')
  const [workouts, setWorkouts] = useState([])
  const [runs, setRuns] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [measureModal, setMeasureModal] = useState(false)

  useEffect(() => { loadAll() }, [user])

  async function loadAll() {
    if (!user) return
    setLoading(true)
    const [wRes, rRes, mRes] = await Promise.all([
      supabase.from('strength_logs').select('*, strength_log_sets(*)').eq('user_id', user.id).order('session_date', { ascending: false }).limit(20),
      supabase.from('running_logs').select('*').eq('user_id', user.id).order('session_date', { ascending: false }).limit(20),
      supabase.from('measurements').select('*').eq('user_id', user.id).order('measured_date', { ascending: false }).limit(20),
    ])
    setWorkouts(wRes.data || [])
    setRuns(rRes.data || [])
    setMeasurements(mRes.data || [])
    setLoading(false)
  }

  return (
    <div className="page-content">
      <Toast message={toast} />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--text)' }}>Log</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setMeasureModal(true)}>+ Measure</button>
      </div>

      <div className="tab-row">
        {['workouts','runs','measurements'].map(t => (
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-center mt-8" style={{ color:'var(--text2)' }}>Loading…</div>}

      {!loading && tab === 'workouts' && (
        <div className="card">
          {workouts.length === 0 && <div className="text-sm text-center py-6" style={{ color:'var(--text2)' }}>No strength sessions yet.</div>}
          {workouts.map(w => (
            <div key={w.id} className="list-row">
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color:'var(--text)' }}>
                  {w.program?.toUpperCase()} {w.occams_workout ? `— ${w.occams_workout}`:''}{w.is_test_session && <span className="badge badge-blue ml-2 text-xs">Test</span>}
                </div>
                <div className="text-xs" style={{ color:'var(--text2)' }}>{formatDate(w.session_date)}</div>
                {w.strength_log_sets?.slice(0,3).map(s => (
                  <div key={s.id} className="text-xs mt-0.5" style={{ color:'var(--text3)' }}>
                    {s.exercise_name}: {s.weight_lbs}lbs × {s.reps_completed}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'runs' && (
        <div className="card">
          {runs.length === 0 && <div className="text-sm text-center py-6" style={{ color:'var(--text2)' }}>No runs yet.</div>}
          {runs.map(r => (
            <div key={r.id} className="list-row">
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color:'var(--text)' }}>
                  {r.run_type==='intervals'?'Intervals':r.run_type==='easy2'?'Easy Run #2':'Easy Run'}
                </div>
                <div className="text-xs" style={{ color:'var(--text2)' }}>
                  {formatDate(r.session_date)} · {r.distance_miles}mi · {r.duration_min}min {r.avg_hr_bpm?`· ${r.avg_hr_bpm}bpm`:''}
                </div>
                {r.avg_hr_bpm && r.maf_hr_target && (
                  <div className="text-xs" style={{ color: r.hr_compliance?'var(--accent)':'var(--danger)' }}>
                    {r.hr_compliance?'✓ HR on target':'↑ HR above MAF'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'measurements' && (
        <div>
          {measurements.length === 0 && <div className="card text-sm text-center py-6" style={{ color:'var(--text2)' }}>No measurements yet.</div>}
          {measurements.map(m => (
            <div key={m.id} className="card mb-3">
              <div className="flex justify-between mb-2">
                <div className="text-sm font-semibold" style={{ color:'var(--text)' }}>{formatDate(m.measured_date)}</div>
                {m.total_inches && <span className="badge badge-muted">{m.total_inches.toFixed(1)}" TI</span>}
              </div>
              <div className="flex gap-2">
                {[['lbs',m.bodyweight_lbs,'var(--primary)'],['BF%',m.body_fat_pct?m.body_fat_pct+'%':null,'var(--secondary)'],['TI",m.total_inches?m.total_inches.toFixed(1)+'"':null','var(--accent)']].filter(([,v])=>v).map(([l,v,c])=>(
                  <div key={l} className="stat-box flex-1">
                    <div className="stat-value" style={{ color:c }}>{v}</div>
                    <div className="stat-label">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MeasurementModal open={measureModal} onClose={()=>{setMeasureModal(false);loadAll()}} showToast={showToast} userId={user?.id} />
    </div>
  )
}

function MeasurementModal({ open, onClose, showToast, userId }) {
  const [vals, setVals] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setVals(p=>({...p,[k]:v}))

  const FIELDS = [
    ['bodyweight_lbs','Bodyweight (lbs)','0.1'],['body_fat_pct','Body Fat %','0.1'],['rmr_kcal','RMR (kcal)','1'],
    ['waist_in','Waist (in)','0.25'],['hips_in','Hips (in)','0.25'],
    ['right_arm_in','Right Arm (in)','0.25'],['left_arm_in','Left Arm (in)','0.25'],
    ['right_thigh_in','Right Thigh (in)','0.25'],['left_thigh_in','Left Thigh (in)','0.25'],
    ['neck_in','Neck (in)','0.25'],['chest_in','Chest (in)','0.25'],
    ['right_calf_in','Right Calf (in)','0.25'],['left_calf_in','Left Calf (in)','0.25'],
  ]

  const save = async () => {
    setSaving(true)
    const n = Object.fromEntries(Object.entries(vals).map(([k,v])=>[k,parseFloat(v)||null]))
    const TI = ['waist_in','hips_in','right_arm_in','left_arm_in','right_thigh_in','left_thigh_in']
    const ti = TI.reduce((s,k)=>s+(n[k]||0),0)
    const lean = n.bodyweight_lbs && n.body_fat_pct ? n.bodyweight_lbs*(1-n.body_fat_pct/100) : null
    await supabase.from('measurements').insert({
      user_id:userId, measured_date:new Date().toISOString().split('T')[0],
      ...n, total_inches:ti||null, lean_mass_lbs:lean?Math.round(lean*10)/10:null
    })
    if (n.bodyweight_lbs) await supabase.from('user_settings').update({ bodyweight_lbs:n.bodyweight_lbs, body_fat_pct:n.body_fat_pct, lean_mass_lbs:lean?Math.round(lean*10)/10:null }).eq('user_id',userId)
    showToast('Measurements saved ✓')
    setSaving(false); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Measurements">
      <p className="text-xs mb-4" style={{ color:'var(--text2)' }}>Cheat day morning, before eating or drinking.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {FIELDS.map(([k,l,s])=>(
          <div key={k}>
            <label className="label">{l}</label>
            <input className="input" type="number" step={s} value={vals[k]||''} onChange={e=>set(k,e.target.value)} />
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
    </Modal>
  )
}

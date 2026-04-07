import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../lib/scheduling'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Progress() {
  const { user } = useAuth()
  const [measurements, setMeasurements] = useState([])
  const [strengthLogs, setStrengthLogs] = useState([])
  const [runLogs, setRunLogs] = useState([])
  const [sleepLogs, setSleepLogs] = useState([])
  const [nutLogs, setNutLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('body')

  useEffect(() => { loadAll() }, [user])

  async function loadAll() {
    if (!user) return
    setLoading(true)
    const [mRes, sRes, rRes, slRes, nRes] = await Promise.all([
      supabase.from('measurements').select('*').eq('user_id', user.id).order('measured_date').limit(52),
      supabase.from('strength_log_sets').select('*').eq('user_id', user.id).order('logged_at').limit(200),
      supabase.from('running_logs').select('*').eq('user_id', user.id).order('session_date').limit(50),
      supabase.from('sleep_logs').select('*').eq('user_id', user.id).order('log_date').limit(30),
      supabase.from('nutrition_logs').select('*').eq('user_id', user.id).order('log_date').limit(30),
    ])
    setMeasurements(mRes.data || [])
    setStrengthLogs(sRes.data || [])
    setRunLogs(rRes.data || [])
    setSleepLogs(slRes.data || [])
    setNutLogs(nRes.data || [])
    setLoading(false)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ measurements, strengthLogs, runLogs, sleepLogs, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `respire-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const latest = measurements[measurements.length - 1]
  const first = measurements[0]

  return (
    <div className="page-content">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--text)' }}>Progress</h1>
        <button className="btn btn-secondary btn-sm" onClick={exportData}>Export</button>
      </div>

      {loading ? <div className="text-sm text-center mt-8" style={{ color: 'var(--text2)' }}>Loading…</div> : (
        <>
          <div className="tab-row">
            {['body', 'strength', 'running', 'habits'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'body' && (
            <div>
              {measurements.length < 2 && (
                <div className="card text-center py-6 mb-4 text-sm" style={{ color: 'var(--text2)' }}>
                  Log measurements on cheat day morning to see trends.
                </div>
              )}
              {latest && first && measurements.length > 1 && (
                <div className="card mb-4">
                  <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Overall Change</div>
                  <div className="flex gap-2">
                    {[
                      ['Weight', (latest.bodyweight_lbs - first.bodyweight_lbs).toFixed(1), 'lbs'],
                      latest.total_inches && first.total_inches && ['TI', (latest.total_inches - first.total_inches).toFixed(1), '"'],
                      latest.body_fat_pct && first.body_fat_pct && ['BF%', (latest.body_fat_pct - first.body_fat_pct).toFixed(1), '%'],
                    ].filter(Boolean).map(([label, val, unit]) => {
                      const num = parseFloat(val)
                      const color = num < 0 ? 'var(--accent)' : num > 0 ? 'var(--danger)' : 'var(--text2)'
                      return (
                        <div key={label} className="stat-box flex-1">
                          <div className="stat-value" style={{ color }}>{num > 0 ? '+' : ''}{val}{unit}</div>
                          <div className="stat-label">{label}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                    {formatDate(first.measured_date)} → {formatDate(latest.measured_date)}
                  </div>
                </div>
              )}
              {measurements.length >= 2 && (
                <div className="card mb-4">
                  <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Body Weight</div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={measurements.map(m => ({ date: m.measured_date.slice(5), val: m.bodyweight_lbs }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="val" stroke="var(--primary)" strokeWidth={2} dot={false} name="lbs" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'strength' && (
            <div>
              {strengthLogs.length === 0 && <div className="card text-center py-6 text-sm" style={{ color: 'var(--text2)' }}>No strength data yet.</div>}
              {['Leg Press', 'Pullover + Yates Row', 'Pec Deck + Weighted Dips', 'Leg Curl'].map(exName => {
                const exSets = strengthLogs.filter(s => s.exercise_name === exName).slice(-12)
                if (!exSets.length) return null
                return (
                  <div key={exName} className="card mb-4">
                    <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>{exName}</div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exSets.map(s => ({ date: s.logged_at?.slice(5, 10), weight: s.weight_lbs }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                          <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name="lbs" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text2)' }}>
                      <span>Start: {exSets[0]?.weight_lbs} lbs</span>
                      <span>Latest: {exSets[exSets.length-1]?.weight_lbs} lbs × {exSets[exSets.length-1]?.reps_completed} reps</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'running' && (
            <div>
              {runLogs.length === 0 && <div className="card text-center py-6 text-sm" style={{ color: 'var(--text2)' }}>No run data yet.</div>}
              {runLogs.length > 0 && (
                <>
                  <div className="flex gap-2 mb-4">
                    {[['Runs', runLogs.length, 'var(--primary)'],['Miles', runLogs.reduce((s,r)=>s+(r.distance_miles||0),0).toFixed(1),'var(--accent)']].map(([l,v,c])=>(
                      <div key={l} className="stat-box flex-1"><div className="stat-value" style={{ color:c }}>{v}</div><div className="stat-label">{l}</div></div>
                    ))}
                  </div>
                  <div className="card mb-4">
                    <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Easy Run Distance</div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={runLogs.filter(r=>r.run_type!=='intervals').map(r=>({ date:r.session_date.slice(5), dist:r.distance_miles }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                          <Line type="monotone" dataKey="dist" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} name="miles" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'habits' && (
            <div>
              {sleepLogs.length > 0 && (
                <div className="card mb-4">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Sleep (last {sleepLogs.length} nights)</div>
                  <div className="flex gap-2">
                    <div className="stat-box flex-1">
                      <div className="stat-value">{(sleepLogs.reduce((s,l)=>s+(l.hours_slept||0),0)/sleepLogs.length).toFixed(1)}h</div>
                      <div className="stat-label">Avg Sleep</div>
                    </div>
                    <div className="stat-box flex-1">
                      <div className="stat-value" style={{ color:'var(--accent)' }}>{(sleepLogs.reduce((s,l)=>s+(l.quality||0),0)/sleepLogs.length).toFixed(1)}/5</div>
                      <div className="stat-label">Avg Quality</div>
                    </div>
                  </div>
                </div>
              )}
              {nutLogs.length > 0 && (
                <div className="card mb-4">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Nutrition Compliance</div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className="font-display text-4xl font-bold" style={{ color: 'var(--primary)' }}>
                      {nutLogs.filter(n=>n.on_plan!==false).length}
                    </div>
                    <div className="text-sm mb-1" style={{ color: 'var(--text2)' }}>/ {nutLogs.length} days</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${nutLogs.filter(n=>n.on_plan!==false).length/nutLogs.length*100}%` }} />
                  </div>
                </div>
              )}
              {sleepLogs.length === 0 && nutLogs.length === 0 && (
                <div className="card text-center py-6 text-sm" style={{ color: 'var(--text2)' }}>Log sleep and meals consistently to see trends.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

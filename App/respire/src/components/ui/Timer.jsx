import { useState, useEffect, useRef } from 'react'

export default function Timer({ seconds = 180, onComplete, label = 'Rest Timer' }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            onComplete?.()
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${mins}:${secs.toString().padStart(2, '0')}`
  const pct = ((seconds - remaining) / seconds) * 100

  const reset = () => {
    clearInterval(intervalRef.current)
    setRemaining(seconds)
    setRunning(false)
  }

  return (
    <div className="text-center py-4">
      <div className="text-xs font-mono mb-2" style={{ color: 'var(--text2)' }}>{label}</div>
      <div className="timer-display">{display}</div>
      <div className="progress-bar mx-auto mt-3" style={{ maxWidth: 200 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-3 justify-center mt-4">
        <button className="btn btn-primary btn-sm" onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Pause' : remaining === seconds ? '▶ Start' : '▶ Resume'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}

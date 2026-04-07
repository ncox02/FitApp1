import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { APP_NAME } from '../lib/constants'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }

    setLoading(false)
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ height: '100dvh', background: 'var(--bg)' }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="font-display text-6xl font-semibold mb-1" style={{ color: 'var(--primary)' }}>
          {APP_NAME}
        </div>
        <div className="text-sm font-mono" style={{ color: 'var(--text2)' }}>
          4-Hour Body · Training OS
        </div>
      </div>

      {/* Card */}
      <div className="card w-full" style={{ maxWidth: 400 }}>
        <h2 className="font-display text-2xl font-semibold mb-5" style={{ color: 'var(--text)' }}>
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {mode !== 'reset' && (
            <div className="mb-5">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg px-3 py-2 mb-4 text-sm" style={{ background: 'rgba(224,69,69,0.1)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg px-3 py-2 mb-4 text-sm" style={{ background: 'rgba(62,201,124,0.1)', color: 'var(--accent)' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full mb-4"
            disabled={loading}
          >
            {loading ? 'Working…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>
        </form>

        <div className="divider" />

        <div className="flex flex-col gap-2 text-center">
          {mode === 'signin' && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => { setMode('signup'); setError('') }}>
                No account? Sign up →
              </button>
              <button className="btn btn-ghost btn-sm text-xs" style={{ color: 'var(--text3)' }} onClick={() => { setMode('reset'); setError('') }}>
                Forgot password?
              </button>
            </>
          )}
          {mode !== 'signin' && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setMode('signin'); setError(''); setSuccess('') }}>
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

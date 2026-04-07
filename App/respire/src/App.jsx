import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import MainLayout from './pages/MainLayout'
import Today from './pages/Today'
import Log from './pages/Log'
import Nutrition from './pages/Nutrition'
import Progress from './pages/Progress'
import Settings from './pages/Settings'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="font-display text-5xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            Respire
          </div>
          <div className="text-sm font-mono" style={{ color: 'var(--text2)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <SettingsProvider>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Today />} />
          <Route path="/log" element={<Log />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SettingsProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

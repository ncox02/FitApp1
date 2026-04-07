import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  name: '',
  bodyweight_lbs: 180,
  height_in: 70,
  age: 35,
  body_fat_pct: 20,
  lean_mass_lbs: 144,
  training_days: [1, 2, 4, 5, 6],
  allow_sunday: false,
  strength_program: 'g2f',       // 'g2f' | 'occams' | 'none'
  occams_variant: 'machine',      // 'machine' | 'freeweight'
  occams_next_workout: 'A',
  running_plan: 'maf',            // 'maf' | 'cfe' | 'none'
  core_enabled: true,
  posterior_enabled: true,
  mobility_enabled: true,
  nutrition_enabled: true,
  strength_rest_phase: 1,
  strength_test_done: false,
  last_strength_date: null,
  running_hr_target: null,        // null = auto (180 - age)
  running_start_miles: 3,
  running_progression_pct: 10,
  running_progression_type: 'time', // 'time' | 'distance'
  last_run_date: null,
  current_run_miles: 3,
  posterior_days_per_week: 2,
  last_posterior_date: null,
  nutrition_plan: 'slowcarb',     // 'slowcarb' | 'g2f' | 'custom'
  calorie_goal: null,
  protein_goal_g: null,
  cheat_day: 6,                   // 0=Sun ... 6=Sat
  mobility_areas: ['shoulders', 'hips', 'wrists'],
  side_plank_enabled: false,
  sup_pagg: false,
  sup_creatine: false,
  sup_glutamine: false,
  sup_cq: false,
  sup_ala: false,
  sup_policosanol: false,
  sup_cold_exposure: false,
  morning_reminder_time: '07:00',
  evening_reminder_time: '20:00',
  disabled_exercises: [],
  onboarded: false,
}

export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // Load settings from Supabase
  const loadSettings = useCallback(async () => {
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setSettings({ ...DEFAULT_SETTINGS, ...data })
    } else if (error?.code === 'PGRST116') {
      // No row yet — first login, use defaults
      setSettings({ ...DEFAULT_SETTINGS })
    }
    setLoading(false)
  }, [user])

  useEffect(() => { loadSettings() }, [loadSettings])

  // Update a single setting key
  const updateSetting = useCallback(async (key, value) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)

    if (!user) return

    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, [key]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }, [settings, user])

  // Update multiple settings at once
  const updateSettings = useCallback(async (updates) => {
    const updated = { ...settings, ...updates }
    setSettings(updated)

    if (!user) return

    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }, [settings, user])

  // Save entire settings object (used after onboarding)
  const saveAllSettings = useCallback(async (newSettings) => {
    const merged = { ...DEFAULT_SETTINGS, ...newSettings }
    setSettings(merged)

    if (!user) return

    const { error } = await supabase
      .from('user_settings')
      .upsert({ ...merged, user_id: user.id, updated_at: new Date().toISOString() })

    return { error }
  }, [user])

  const refresh = loadSettings

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSetting,
      updateSettings,
      saveAllSettings,
      refresh,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

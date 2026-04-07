import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { today } from '../lib/scheduling'
import { calcMealMacros, calcAutoNutrition } from '../lib/progression'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function Nutrition() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { toast, showToast } = useToast()
  const [tab, setTab] = useState('today')
  const [ingredients, setIngredients] = useState([])
  const [meals, setMeals] = useState([])
  const [todayLog, setTodayLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingModal, setIngModal] = useState(false)
  const [mealModal, setMealModal] = useState(false)
  const [csvModal, setCsvModal] = useState(false)

  useEffect(() => { loadAll() }, [user])

  async function loadAll() {
    if (!user) return
    setLoading(true)
    const [iRes, mRes, lRes] = await Promise.all([
      supabase.from('ingredients').select('*').eq('user_id', user.id).eq('is_archived', false).order('name'),
      supabase.from('meals').select('*, meal_ingredients(*, ingredients(*))').eq('user_id', user.id).eq('is_archived', false),
      supabase.from('nutrition_logs').select('*, nutrition_log_entries(*)').eq('user_id', user.id).eq('log_date', today()).single(),
    ])
    setIngredients(iRes.data || [])
    setMeals(mRes.data || [])
    setTodayLog(lRes.data)
    setLoading(false)
  }

  const autoN = calcAutoNutrition(settings)

  return (
    <div className="page-content">
      <Toast message={toast} />
      <h1 className="font-display text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Nutrition</h1>

      <div className="tab-row">
        {['today', 'meals', 'ingredients'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div>
          <div className="card mb-4">
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Daily Goals</div>
            {autoN.protein && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text2)' }}>Protein</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>
                    {todayLog ? Math.round(todayLog.total_protein_g) : 0}g / {autoN.protein}g
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill orange" style={{ width: `${Math.min(100, (todayLog?.total_protein_g || 0) / autoN.protein * 100)}%` }} />
                </div>
              </div>
            )}
            {autoN.calories && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text2)' }}>Calories</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>
                    {todayLog ? Math.round(todayLog.total_calories) : 0} / {autoN.calories}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (todayLog?.total_calories || 0) / autoN.calories * 100)}%` }} />
                </div>
              </div>
            )}
            {!autoN.calories && (
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Slow-Carb: eat until full. Track protein only.
              </p>
            )}
            {autoN.note && <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>{autoN.note}</p>}
          </div>

          <div className="card mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Today's Meals</div>
            </div>
            {!todayLog?.nutrition_log_entries?.length && (
              <div className="text-sm" style={{ color: 'var(--text2)' }}>Nothing logged yet. Use the Today screen to add meals.</div>
            )}
            {todayLog?.nutrition_log_entries?.map((e, i) => (
              <div key={i} className="list-row">
                <div className="flex-1">
                  <div className="text-sm" style={{ color: 'var(--text)' }}>{e.meal_name}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
                    {Math.round(e.protein_g)}g P · {Math.round(e.calories)} cal · {e.meal_slot}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Slow-Carb Quick Reference</div>
            <div className="text-xs space-y-1" style={{ color: 'var(--text2)' }}>
              <div>✓ Protein + legumes + vegetables at every meal</div>
              <div>✗ No white carbs (bread, rice, pasta, potatoes)</div>
              <div>✗ No fruit, dairy, or liquid calories</div>
              <div>✓ First meal within 30 min of waking</div>
              <div>✓ At least 20g protein per meal</div>
              <div>✓ One cheat day per week</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'meals' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm" style={{ color: 'var(--text2)' }}>{meals.length} meals</div>
            <button className="btn btn-primary btn-sm" onClick={() => setMealModal(true)}>+ New Meal</button>
          </div>
          {meals.length === 0 && (
            <div className="card text-sm text-center py-8" style={{ color: 'var(--text2)' }}>
              No meals yet.<br />Add ingredients first, then build meals.
            </div>
          )}
          {meals.map(meal => {
            const ingMap = Object.fromEntries((meal.meal_ingredients || []).map(mi => [mi.ingredient_id, mi.ingredients]))
            const macros = calcMealMacros(meal.meal_ingredients || [], ingMap)
            return (
              <div key={meal.id} className="card mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{meal.name}</div>
                  <span className="badge badge-muted">{meal.meal_type}</span>
                </div>
                <div className="flex gap-3 mb-2">
                  {[['Cal', Math.round(macros.calories || 0)], ['Prot', Math.round(macros.protein_g || 0) + 'g'], ['Carbs', Math.round(macros.carbs_g || 0) + 'g'], ['Fat', Math.round(macros.fat_g || 0) + 'g']].map(([l, v]) => (
                    <div key={l} className="text-xs font-mono" style={{ color: 'var(--text2)' }}><span style={{ color: 'var(--text)' }}>{v}</span> {l}</div>
                  ))}
                </div>
                {meal.meal_ingredients?.slice(0, 3).map(mi => (
                  <div key={mi.id} className="text-xs" style={{ color: 'var(--text3)' }}>· {mi.ingredients?.name} × {mi.servings}</div>
                ))}
                <button className="btn btn-primary btn-sm mt-3" onClick={async () => {
                  const logRes = await supabase.from('nutrition_logs').upsert({ user_id: user.id, log_date: today() }, { onConflict: 'user_id,log_date' }).select().single()
                  if (logRes.data) {
                    await supabase.from('nutrition_log_entries').insert({ nutrition_log_id: logRes.data.id, user_id: user.id, meal_id: meal.id, meal_name: meal.name, calories: macros.calories || 0, protein_g: macros.protein_g || 0, carbs_g: macros.carbs_g || 0, fat_g: macros.fat_g || 0 })
                    showToast(`${meal.name} added ✓`)
                    loadAll()
                  }
                }}>Add to Today</button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'ingredients' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm" style={{ color: 'var(--text2)' }}>{ingredients.length} ingredients</div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setCsvModal(true)}>Import CSV</button>
              <button className="btn btn-primary btn-sm" onClick={() => setIngModal(true)}>+ Add</button>
            </div>
          </div>
          {ingredients.length === 0 && (
            <div className="card text-sm text-center py-8" style={{ color: 'var(--text2)' }}>
              No ingredients yet.<br />Add manually or import your spreadsheet as CSV.
            </div>
          )}
          <div className="card">
            {ingredients.map(ing => (
              <div key={ing.id} className="list-row">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{ing.name}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
                    {ing.protein_g}g P · {ing.carbs_g}g C · {ing.total_fat_g}g F · {ing.calories} cal per {ing.serving_size}{ing.serving_unit}
                  </div>
                  {ing.store && <div className="text-xs" style={{ color: 'var(--text3)' }}>{ing.store}</div>}
                </div>
                <button className="btn-icon" onClick={async () => {
                  await supabase.from('ingredients').update({ is_archived: true }).eq('id', ing.id)
                  loadAll()
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {ingModal && <IngredientModal open onClose={() => { setIngModal(false); loadAll() }} showToast={showToast} userId={user.id} />}
      {csvModal && <CSVImportModal open onClose={() => { setCsvModal(false); loadAll() }} showToast={showToast} userId={user.id} />}
      {mealModal && <MealBuilderModal open onClose={() => { setMealModal(false); loadAll() }} showToast={showToast} userId={user.id} ingredients={ingredients} />}
    </div>
  )
}

function IngredientModal({ open, onClose, showToast, userId }) {
  const [f, setF] = useState({ name: '', store: '', serving_size: 1, serving_unit: 'oz', protein_g: 0, carbs_g: 0, total_fat_g: 0, saturated_fat_g: 0, fiber_g: 0, added_sugars_g: 0, sodium_mg: 0, unit_price: '', servings_per_package: 1 })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const cal = (parseFloat(f.protein_g) || 0) * 4 + (parseFloat(f.carbs_g) || 0) * 4 + (parseFloat(f.total_fat_g) || 0) * 9
    const cpp = f.unit_price && f.servings_per_package ? parseFloat(f.unit_price) / parseFloat(f.servings_per_package) : null
    await supabase.from('ingredients').insert({
      user_id: userId, name: f.name, store: f.store || null,
      serving_size: parseFloat(f.serving_size) || 1, serving_unit: f.serving_unit || 'serving',
      protein_g: parseFloat(f.protein_g) || 0, carbs_g: parseFloat(f.carbs_g) || 0,
      total_fat_g: parseFloat(f.total_fat_g) || 0, saturated_fat_g: parseFloat(f.saturated_fat_g) || 0,
      fiber_g: parseFloat(f.fiber_g) || 0, added_sugars_g: parseFloat(f.added_sugars_g) || 0,
      sodium_mg: parseFloat(f.sodium_mg) || 0, calories: Math.round(cal),
      unit_price: parseFloat(f.unit_price) || null, servings_per_package: parseFloat(f.servings_per_package) || null,
      cost_per_serving: cpp, protein_per_dollar: cpp && f.protein_g ? parseFloat(f.protein_g) / cpp : null,
      calories_per_dollar: cpp ? Math.round(cal) / cpp : null,
    })
    showToast('Ingredient added ✓'); setSaving(false); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Ingredient">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="col-span-2"><label className="label">Name</label><input className="input" value={f.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="col-span-2"><label className="label">Store (optional)</label><input className="input" value={f.store} onChange={e => set('store', e.target.value)} /></div>
        <div><label className="label">Serving Size</label><input className="input" type="number" step="0.5" value={f.serving_size} onChange={e => set('serving_size', e.target.value)} /></div>
        <div><label className="label">Unit</label><input className="input" value={f.serving_unit} onChange={e => set('serving_unit', e.target.value)} /></div>
        {[['protein_g','Protein (g)'],['carbs_g','Carbs (g)'],['total_fat_g','Fat (g)'],['saturated_fat_g','Sat Fat (g)'],['fiber_g','Fiber (g)'],['added_sugars_g','Added Sugars (g)'],['sodium_mg','Sodium (mg)'],['unit_price','Price ($)'],['servings_per_package','Servings/Pkg']].map(([k,l])=>(
          <div key={k}><label className="label">{l}</label><input className="input" type="number" step="0.1" value={f[k]} onChange={e=>set(k,e.target.value)} /></div>
        ))}
      </div>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving || !f.name}>{saving ? 'Saving…' : 'Add Ingredient'}</button>
    </Modal>
  )
}

function CSVImportModal({ open, onClose, showToast, userId }) {
  const [csv, setCsv] = useState('')
  const [saving, setSaving] = useState(false)

  const doImport = async () => {
    setSaving(true)
    const lines = csv.trim().split('\n').filter(l => l.trim())
    const firstLine = lines[0]?.toLowerCase() || ''
    const start = firstLine.includes('food') || firstLine.includes('protein') || firstLine.includes('name') ? 1 : 0
    const rows = []
    for (let i = start; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      const [name, protein_g, carbs_g, total_fat_g, saturated_fat_g, calories_raw, sodium_mg, fiber_g, added_sugars_g, unit_price, servings_per_package] = cols
      if (!name) continue
      const cpp = unit_price && servings_per_package ? parseFloat(unit_price) / parseFloat(servings_per_package) : null
      const cal = parseFloat(calories_raw) || ((parseFloat(protein_g) || 0) * 4 + (parseFloat(carbs_g) || 0) * 4 + (parseFloat(total_fat_g) || 0) * 9)
      rows.push({
        user_id: userId, name,
        protein_g: parseFloat(protein_g) || 0, carbs_g: parseFloat(carbs_g) || 0,
        total_fat_g: parseFloat(total_fat_g) || 0, saturated_fat_g: parseFloat(saturated_fat_g) || 0,
        calories: Math.round(cal), sodium_mg: parseFloat(sodium_mg) || 0,
        fiber_g: parseFloat(fiber_g) || 0, added_sugars_g: parseFloat(added_sugars_g) || 0,
        unit_price: parseFloat(unit_price) || null, servings_per_package: parseFloat(servings_per_package) || null,
        cost_per_serving: cpp, serving_size: 1, serving_unit: 'serving',
        protein_per_dollar: cpp && protein_g ? parseFloat(protein_g) / cpp : null,
        calories_per_dollar: cpp ? Math.round(cal) / cpp : null,
      })
    }
    if (rows.length) await supabase.from('ingredients').insert(rows)
    showToast(`Imported ${rows.length} ingredients ✓`)
    setSaving(false); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Ingredients CSV">
      <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>
        Export your first ingredients sheet as CSV. Expected column order:<br />
        <span className="font-mono">food, protein, carb, total fat, sat fat, calories, sodium, fiber, added sugars, price, servings/package</span>
      </p>
      <div className="mb-4">
        <label className="label">Paste CSV rows here</label>
        <textarea className="input font-mono text-xs" rows={8} value={csv} onChange={e => setCsv(e.target.value)} placeholder="Chicken Breast,25,0,3,1,127,74,0,0,8.99,40" />
      </div>
      <button className="btn btn-primary btn-full" onClick={doImport} disabled={saving || !csv.trim()}>
        {saving ? 'Importing…' : 'Import'}
      </button>
    </Modal>
  )
}

function MealBuilderModal({ open, onClose, showToast, userId, ingredients }) {
  const [name, setName] = useState('')
  const [mealType, setMealType] = useState('any')
  const [items, setItems] = useState([{ ingredientId: '', servings: 1 }])
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const { data: meal } = await supabase.from('meals').insert({ user_id: userId, name, meal_type: mealType }).select().single()
    if (meal) {
      const miRows = items.filter(i => i.ingredientId).map(i => ({
        meal_id: meal.id, ingredient_id: i.ingredientId, user_id: userId,
        servings: parseFloat(i.servings) || 1,
        ingredient_name: ingredients.find(x => x.id === i.ingredientId)?.name,
      }))
      if (miRows.length) await supabase.from('meal_ingredients').insert(miRows)
    }
    showToast('Meal saved ✓'); setSaving(false); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Build Meal">
      <div className="mb-3">
        <label className="label">Meal Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken + Black Beans" />
      </div>
      <div className="mb-4">
        <label className="label">Type</label>
        <select className="input" value={mealType} onChange={e => setMealType(e.target.value)}>
          {['any', 'breakfast', 'lunch', 'dinner', 'snack'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <label className="label">Ingredients</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <select className="input flex-1" value={item.ingredientId}
            onChange={e => setItems(p => p.map((x, idx) => idx === i ? { ...x, ingredientId: e.target.value } : x))}>
            <option value="">Select…</option>
            {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
          </select>
          <input className="input w-16 text-center" type="number" step="0.5" min="0.25" value={item.servings}
            onChange={e => setItems(p => p.map((x, idx) => idx === i ? { ...x, servings: e.target.value } : x))} />
          <button className="btn-icon" onClick={() => setItems(p => p.filter((_, idx) => idx !== i))}>✕</button>
        </div>
      ))}
      <button className="btn btn-secondary btn-sm mb-4" onClick={() => setItems(p => [...p, { ingredientId: '', servings: 1 }])}>
        + Add Ingredient
      </button>
      <button className="btn btn-primary btn-full" onClick={save} disabled={saving || !name}>
        {saving ? 'Saving…' : 'Save Meal'}
      </button>
    </Modal>
  )
}

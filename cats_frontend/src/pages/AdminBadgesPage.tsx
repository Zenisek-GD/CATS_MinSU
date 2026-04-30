import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getApiErrorMessage } from '../api/error'
import {
  adminGetBadges, adminCreateBadge, adminUpdateBadge, adminDeleteBadge,
  adminGetAchievements, adminCreateAchievement, adminUpdateAchievement, adminDeleteAchievement,
  type AdminBadge, type AdminAchievement,
} from '../api/dashboard'
import { AdminLayout } from './AdminDashboardPage'
import './AdminDashboardPage.css'
import './AdminUsersPage.css'

type Tab = 'badges' | 'achievements'

export default function AdminBadgesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('badges')

  if (!user || user.role !== 'admin') return null

  return (
    <AdminLayout activeTab="badges" pageTitle="Badges & Achievements" pageSubtitle="Manage gamification rewards">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`adminFormBtn ${tab === 'badges' ? 'primary' : ''}`} onClick={() => setTab('badges')}>🏅 Badges</button>
        <button className={`adminFormBtn ${tab === 'achievements' ? 'primary' : ''}`} onClick={() => setTab('achievements')}>⭐ Achievements</button>
      </div>
      {tab === 'badges' && <BadgesTab />}
      {tab === 'achievements' && <AchievementsTab />}
    </AdminLayout>
  )
}

function BadgesTab() {
  const [items, setItems] = useState<AdminBadge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<AdminBadge | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'emoji_events', condition_type: '', condition_value: 0 })

  async function load() {
    try { const r = await adminGetBadges(); setItems(r.badges) } catch (e) { setError(getApiErrorMessage(e, 'Load failed')) }
  }
  useEffect(() => { load() }, [])

  function openAdd() { setForm({ name: '', slug: '', description: '', icon: 'emoji_events', condition_type: '', condition_value: 0 }); setEditing(null); setModal(true) }
  function openEdit(b: AdminBadge) { setForm({ name: b.name, slug: b.slug, description: b.description || '', icon: b.icon, condition_type: b.condition_type || '', condition_value: b.condition_value || 0 }); setEditing(b); setModal(true) }

  async function onSave() {
    setError(null)
    try {
      const payload = { ...form, description: form.description || null, condition_type: form.condition_type || null, condition_value: form.condition_value || null }
      if (editing) { await adminUpdateBadge(editing.id, payload) } else { await adminCreateBadge(payload) }
      setModal(false); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save failed')) }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this badge?')) return
    try { await adminDeleteBadge(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete failed')) }
  }

  return (
    <>
      {error && <div style={{ color: '#ba1a1a', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="adminAddBtn" onClick={openAdd}>
          <span className="material-symbols-outlined">add</span> Add Badge
        </button>
      </div>
      <div className="adminUsersWrap">
        <table className="adminUsersFullTable">
          <thead><tr><th>Icon</th><th>Name</th><th>Slug</th><th>Condition</th><th>Awarded</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(b => (
              <tr key={b.id}>
                <td><span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>{b.icon}</span></td>
                <td><strong>{b.name}</strong><div style={{ fontSize: 11, color: 'rgba(11,28,48,0.5)' }}>{b.description || '—'}</div></td>
                <td style={{ fontSize: 12 }}>{b.slug}</td>
                <td style={{ fontSize: 12 }}>{b.condition_type || '—'} {b.condition_value ? `(${b.condition_value})` : ''}</td>
                <td>{b.user_badges_count ?? 0} users</td>
                <td>
                  <div className="adminActionBtns">
                    <button className="adminActionBtn" onClick={() => openEdit(b)}>Edit</button>
                    <button className="adminActionBtn danger" onClick={() => onDelete(b.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'rgba(11,28,48,0.4)' }}>No badges yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="adminOverlay">
          <div className="adminOverlayBg" onClick={() => setModal(false)} />
          <div className="adminModalBox">
            <h3 className="adminModalTitle">{editing ? 'Edit Badge' : 'Add Badge'}</h3>
            <div className="adminFormField"><label className="adminFormLabel">Name</label><input className="adminFormInput" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Slug</label><input className="adminFormInput" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Description</label><input className="adminFormInput" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Icon (Material Symbol)</label><input className="adminFormInput" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Condition Type</label>
              <select className="adminFormSelect" value={form.condition_type} onChange={e => setForm({ ...form, condition_type: e.target.value })}>
                <option value="">None</option>
                <option value="quiz_complete">Quiz Complete</option>
                <option value="quiz_perfect">Perfect Quiz Score</option>
                <option value="sim_complete">Simulation Complete</option>
                <option value="total_quizzes">Total Quizzes Taken</option>
                <option value="total_sims">Total Simulations</option>
              </select>
            </div>
            <div className="adminFormField"><label className="adminFormLabel">Condition Value</label><input className="adminFormInput" type="number" value={form.condition_value} onChange={e => setForm({ ...form, condition_value: +e.target.value })} /></div>
            <div className="adminFormActions">
              <button className="adminFormBtn" onClick={() => setModal(false)}>Cancel</button>
              <button className="adminFormBtn primary" onClick={onSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AchievementsTab() {
  const [items, setItems] = useState<AdminAchievement[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<AdminAchievement | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'star', xp_reward: 0, condition_type: '', condition_value: 0 })

  async function load() {
    try { const r = await adminGetAchievements(); setItems(r.achievements) } catch (e) { setError(getApiErrorMessage(e, 'Load failed')) }
  }
  useEffect(() => { load() }, [])

  function openAdd() { setForm({ name: '', slug: '', description: '', icon: 'star', xp_reward: 0, condition_type: '', condition_value: 0 }); setEditing(null); setModal(true) }
  function openEdit(a: AdminAchievement) { setForm({ name: a.name, slug: a.slug, description: a.description || '', icon: a.icon, xp_reward: a.xp_reward, condition_type: a.condition_type || '', condition_value: a.condition_value || 0 }); setEditing(a); setModal(true) }

  async function onSave() {
    setError(null)
    try {
      const payload = { ...form, description: form.description || null, condition_type: form.condition_type || null, condition_value: form.condition_value || null }
      if (editing) { await adminUpdateAchievement(editing.id, payload) } else { await adminCreateAchievement(payload) }
      setModal(false); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save failed')) }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this achievement?')) return
    try { await adminDeleteAchievement(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete failed')) }
  }

  return (
    <>
      {error && <div style={{ color: '#ba1a1a', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="adminAddBtn" onClick={openAdd}>
          <span className="material-symbols-outlined">add</span> Add Achievement
        </button>
      </div>
      <div className="adminUsersWrap">
        <table className="adminUsersFullTable">
          <thead><tr><th>Icon</th><th>Name</th><th>XP</th><th>Condition</th><th>Unlocked</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id}>
                <td><span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>{a.icon}</span></td>
                <td><strong>{a.name}</strong><div style={{ fontSize: 11, color: 'rgba(11,28,48,0.5)' }}>{a.description || '—'}</div></td>
                <td>{a.xp_reward} XP</td>
                <td style={{ fontSize: 12 }}>{a.condition_type || '—'} {a.condition_value ? `(${a.condition_value})` : ''}</td>
                <td>{a.user_achievements_count ?? 0} users</td>
                <td>
                  <div className="adminActionBtns">
                    <button className="adminActionBtn" onClick={() => openEdit(a)}>Edit</button>
                    <button className="adminActionBtn danger" onClick={() => onDelete(a.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'rgba(11,28,48,0.4)' }}>No achievements yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="adminOverlay">
          <div className="adminOverlayBg" onClick={() => setModal(false)} />
          <div className="adminModalBox">
            <h3 className="adminModalTitle">{editing ? 'Edit Achievement' : 'Add Achievement'}</h3>
            <div className="adminFormField"><label className="adminFormLabel">Name</label><input className="adminFormInput" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Slug</label><input className="adminFormInput" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Description</label><input className="adminFormInput" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Icon (Material Symbol)</label><input className="adminFormInput" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">XP Reward</label><input className="adminFormInput" type="number" value={form.xp_reward} onChange={e => setForm({ ...form, xp_reward: +e.target.value })} /></div>
            <div className="adminFormField"><label className="adminFormLabel">Condition Type</label>
              <select className="adminFormSelect" value={form.condition_type} onChange={e => setForm({ ...form, condition_type: e.target.value })}>
                <option value="">None</option>
                <option value="first_quiz">First Quiz Completed</option>
                <option value="perfect_score">Perfect Score</option>
                <option value="sim_survivor">Simulation Survivor</option>
                <option value="streak_days">Training Streak (days)</option>
                <option value="top_score">Top Awareness Score</option>
                <option value="total_quizzes">Total Quizzes</option>
              </select>
            </div>
            <div className="adminFormField"><label className="adminFormLabel">Condition Value</label><input className="adminFormInput" type="number" value={form.condition_value} onChange={e => setForm({ ...form, condition_value: +e.target.value })} /></div>
            <div className="adminFormActions">
              <button className="adminFormBtn" onClick={() => setModal(false)}>Cancel</button>
              <button className="adminFormBtn primary" onClick={onSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

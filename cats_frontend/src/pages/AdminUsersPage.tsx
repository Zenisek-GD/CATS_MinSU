import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getApiErrorMessage } from '../api/error'
import { Icon } from '../components/IconMap'
import {
  getAdminUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
  adminUpdateUserStatus, adminResetPassword, adminGetUserPerformance,
  type AdminUser, type UserPerformance,
} from '../api/dashboard'
import { AdminLayout } from './AdminDashboardPage'
import './AdminDashboardPage.css'
import './AdminUsersPage.css'

type ModalMode = null | 'add' | 'edit' | 'performance' | 'resetPwd'

export default function AdminUsersPage() {
  const { user } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [modal, setModal] = useState<ModalMode>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [perf, setPerf] = useState<UserPerformance | null>(null)
  const [tempPwd, setTempPwd] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter
      const res = await getAdminUsers(params)
      setUsers(res.users)
    } catch (e) { setError(getApiErrorMessage(e, 'Failed to load users.')) }
  }, [search, roleFilter, statusFilter])

  useEffect(() => { if (user?.role === 'admin') load() }, [user, load])

  if (!user || user.role !== 'admin') return null

  function openAdd() {
    setForm({ name: '', email: '', password: '', role: 'user' })
    setEditingUser(null); setModal('add')
  }

  function openEdit(u: AdminUser) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditingUser(u); setModal('edit')
  }

  async function onSave() {
    setSaving(true); setError(null)
    try {
      if (modal === 'add') {
        await adminCreateUser(form)
      } else if (modal === 'edit' && editingUser) {
        const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        await adminUpdateUser(editingUser.id, payload)
      }
      setModal(null); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save failed.')) }
    finally { setSaving(false) }
  }

  async function onDelete(u: AdminUser) {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return
    try { await adminDeleteUser(u.id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete failed.')) }
  }

  async function onToggleStatus(u: AdminUser) {
    const next = u.status === 'active' ? 'suspended' : 'active'
    if (!confirm(`${next === 'suspended' ? 'Suspend' : 'Activate'} user "${u.name}"?`)) return
    try { await adminUpdateUserStatus(u.id, next); load() } catch (e) { setError(getApiErrorMessage(e, 'Status update failed.')) }
  }

  async function onResetPassword(u: AdminUser) {
    if (!confirm(`Reset password for "${u.name}"?`)) return
    try {
      const res = await adminResetPassword(u.id)
      setTempPwd(res.temporary_password)
      setEditingUser(u); setModal('resetPwd')
    } catch (e) { setError(getApiErrorMessage(e, 'Password reset failed.')) }
  }

  async function onViewPerformance(u: AdminUser) {
    try {
      const res = await adminGetUserPerformance(u.id)
      setPerf(res); setEditingUser(u); setModal('performance')
    } catch (e) { setError(getApiErrorMessage(e, 'Failed to load performance.')) }
  }

  return (
    <>
      <AdminLayout activeTab="users" pageTitle="User Management" pageSubtitle={`${users.length} users total`}>
        {error && <div style={{ color: '#ba1a1a', marginBottom: 12 }}>{error}</div>}

        <div className="adminUsersToolbar">
          <input className="adminSearchInput" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adminFilterSelect" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select className="adminFilterSelect" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="adminAddBtn" onClick={openAdd}>
            <Icon name="person_add" size={18} /> Add User
          </button>
        </div>

        <div className="adminUsersWrap">
          <table className="adminUsersFullTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>XP</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="adminUserName">{u.name}</div>
                    <div className="adminUserEmail">{u.email}</div>
                  </td>
                  <td><span className={`adminRoleBadge ${u.role}`}>{u.role}</span></td>
                  <td><span className={`adminStatusBadge ${u.status || 'active'}`}>{u.status || 'active'}</span></td>
                  <td>{u.xp ?? 0}</td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="adminActionBtns">
                      <button className="adminActionBtn" onClick={() => openEdit(u)}>Edit</button>
                      <button className="adminActionBtn success" onClick={() => onViewPerformance(u)}>Stats</button>
                      <button className="adminActionBtn warn" onClick={() => onToggleStatus(u)}>
                        {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                      <button className="adminActionBtn" onClick={() => onResetPassword(u)}>Reset Pwd</button>
                      <button className="adminActionBtn danger" onClick={() => onDelete(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'rgba(11,28,48,0.4)' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>

      {/* ─── Add / Edit Modal ─── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="adminOverlay">
          <div className="adminOverlayBg" onClick={() => setModal(null)} />
          <div className="adminModalBox">
            <h3 className="adminModalTitle">{modal === 'add' ? 'Add User' : 'Edit User'}</h3>
            <div className="adminFormField">
              <label className="adminFormLabel">Full Name</label>
              <input className="adminFormInput" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="adminFormField">
              <label className="adminFormLabel">Email</label>
              <input className="adminFormInput" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="adminFormField">
              <label className="adminFormLabel">{modal === 'edit' ? 'New Password (leave blank to keep)' : 'Password'}</label>
              <input className="adminFormInput" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="adminFormField">
              <label className="adminFormLabel">Role</label>
              <select className="adminFormSelect" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="adminFormActions">
              <button className="adminFormBtn" onClick={() => setModal(null)}>Cancel</button>
              <button className="adminFormBtn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reset Password Modal ─── */}
      {modal === 'resetPwd' && (
        <div className="adminOverlay">
          <div className="adminOverlayBg" onClick={() => setModal(null)} />
          <div className="adminModalBox">
            <h3 className="adminModalTitle">Password Reset</h3>
            <p>New temporary password for <strong>{editingUser?.name}</strong>:</p>
            <div className="adminTempPwd">{tempPwd}</div>
            <p style={{ fontSize: 12, color: 'rgba(11,28,48,0.5)' }}>Copy this password and share it securely.</p>
            <div className="adminFormActions">
              <button className="adminFormBtn primary" onClick={() => setModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Performance Modal ─── */}
      {modal === 'performance' && perf && (
        <div className="adminOverlay">
          <div className="adminOverlayBg" onClick={() => setModal(null)} />
          <div className="adminModalBox" style={{ maxWidth: 600 }}>
            <h3 className="adminModalTitle">{perf.user.name} — Performance</h3>

            <div className="adminPerfGrid">
              <div className="adminPerfStat">
                <div className="adminPerfStatValue">{perf.average_quiz_score}%</div>
                <div className="adminPerfStatLabel">Avg Quiz Score</div>
              </div>
              <div className="adminPerfStat">
                <div className="adminPerfStatValue">{perf.awareness_level}</div>
                <div className="adminPerfStatLabel">Awareness Level</div>
              </div>
              <div className="adminPerfStat">
                <div className="adminPerfStatValue">{perf.user.xp}</div>
                <div className="adminPerfStatLabel">XP Points</div>
              </div>
            </div>

            <div className="adminPerfSection">
              <div className="adminPerfSectionTitle">Recent Quiz Attempts ({perf.quiz_attempts.length})</div>
              <ul className="adminPerfList">
                {perf.quiz_attempts.slice(0, 10).map(a => (
                  <li key={a.id}>
                    <span>{a.quiz?.title || `Quiz #${a.quiz_id}`}</span>
                    <span>{a.score}/{a.max_score} ({a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0}%)</span>
                  </li>
                ))}
                {perf.quiz_attempts.length === 0 && <li style={{ color: 'rgba(11,28,48,0.4)' }}>No quiz attempts.</li>}
              </ul>
            </div>

            <div className="adminPerfSection">
              <div className="adminPerfSectionTitle">Recent Simulation Runs ({perf.simulation_runs.length})</div>
              <ul className="adminPerfList">
                {perf.simulation_runs.slice(0, 10).map(r => (
                  <li key={r.id}>
                    <span>{r.simulation?.title || `Sim #${r.simulation_id}`}</span>
                    <span>{r.status} — {r.score}/{r.max_score}</span>
                  </li>
                ))}
                {perf.simulation_runs.length === 0 && <li style={{ color: 'rgba(11,28,48,0.4)' }}>No simulation runs.</li>}
              </ul>
            </div>

            <div className="adminPerfSection">
              <div className="adminPerfSectionTitle">Badges ({perf.badges.length})</div>
              {perf.badges.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {perf.badges.map((b, i) => (
                    <span key={i} className="adminStatusBadge active" style={{ gap: 4 }}>
                      <Icon name={b.badge.icon} size={14} />
                      {b.badge.name}
                    </span>
                  ))}
                </div>
              ) : <p style={{ fontSize: 12, color: 'rgba(11,28,48,0.4)' }}>No badges earned yet.</p>}
            </div>

            <div className="adminFormActions">
              <button className="adminFormBtn primary" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

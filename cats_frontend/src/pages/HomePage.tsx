import { useEffect, useMemo, useState } from 'react'
import { getAdminDashboard, getAdminModules, getAdminUsers, getUserDashboard, type AdminDashboard, type AdminModuleList, type AdminUserList, type UserDashboard } from '../api/dashboard'
import { useAuth } from '../auth/AuthProvider'

export default function HomePage() {
  const { user, refreshMe, clearSession } = useAuth()
  const [busy, setBusy] = useState(false)

  const [userDashboard, setUserDashboard] = useState<UserDashboard | null>(null)
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboard | null>(null)
  const [adminUsers, setAdminUsers] = useState<AdminUserList | null>(null)
  const [adminModules, setAdminModules] = useState<AdminModuleList | null>(null)

  const [error, setError] = useState<string | null>(null)

  async function onRefresh() {
    setBusy(true)
    try {
      await refreshMe()
    } finally {
      setBusy(false)
    }
  }

  async function onLogout() {
    setBusy(true)
    try {
      await clearSession()
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!user) return

    ;(async () => {
      setError(null)
      try {
        if (user.role === 'admin') {
          const [dash, users, modules] = await Promise.all([
            getAdminDashboard(),
            getAdminUsers(),
            getAdminModules(),
          ])
          setAdminDashboard(dash)
          setAdminUsers(users)
          setAdminModules(modules)
        } else {
          const dash = await getUserDashboard()
          setUserDashboard(dash)
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load dashboard.'
        setError(msg)
      }
    })()
  }, [user])

  if (!user) {
    return null
  }

  const heading = user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'

  return (
    <div>
      <div className="topbar">
        <div>
          <strong>{heading}</strong>
          <div className="muted">
            {user.name} · {user.email} · {user.role}
          </div>
        </div>
        <button className="btn secondary" type="button" onClick={onLogout} disabled={busy}>
          Logout
        </button>
      </div>

      <div className="content">
        <div className="dashboardActions">
          <button className="btn" type="button" onClick={onRefresh} disabled={busy}>
            Refresh profile
          </button>
        </div>

        {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}

        {user.role === 'admin' ? (
          <AdminDashboardView dash={adminDashboard} users={adminUsers} modules={adminModules} />
        ) : (
          <UserDashboardView dash={userDashboard} />
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="dashCard">
      <div className="dashTitle">{title}</div>
      <div className="dashValue">{value}</div>
      {subtitle ? <div className="muted">{subtitle}</div> : null}
    </div>
  )
}

function ProgressBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent))
  return (
    <div className="progress">
      <div className="progressInner" style={{ width: `${p}%` }} />
    </div>
  )
}

function BarChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <svg className="chart" viewBox="0 0 300 120" role="img" aria-label="Chart">
      {items.map((it, idx) => {
        const barW = 300 / items.length
        const h = Math.round((it.value / max) * 90)
        const x = idx * barW + 10
        const y = 100 - h
        return (
          <g key={it.label}>
            <rect x={x} y={y} width={barW - 20} height={h} className="chartBar" />
            <text x={x + (barW - 20) / 2} y={114} textAnchor="middle" className="chartLabel">
              {idx + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function UserDashboardView({ dash }: { dash: UserDashboard | null }) {
  const quizItems = useMemo(() => {
    const scores = dash?.quiz_scores ?? []
    return scores.map((s) => ({ label: s.label, value: s.score }))
  }, [dash])

  return (
    <div style={{ marginTop: 16 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>{dash?.welcome ?? 'Welcome'}</h1>

      <div className="dashGrid" style={{ marginTop: 16 }}>
        <StatCard
          title="Current training progress"
          value={`${dash?.training_progress?.percent ?? 0}%`}
          subtitle={`${dash?.training_progress?.completed_modules ?? 0} / ${dash?.training_progress?.total_modules ?? 0} modules`}
        />

        <div className="dashCard">
          <div className="dashTitle">Training completion</div>
          <div className="dashValue">{dash?.training_progress?.percent ?? 0}%</div>
          <ProgressBar percent={dash?.training_progress?.percent ?? 0} />
        </div>

        <StatCard
          title="Simulation completion percentage"
          value={`${dash?.simulation_completion_percent ?? 0}%`}
        />

        <StatCard
          title="Cyber awareness level"
          value={dash?.cyber_awareness_level ?? '—'}
        />
      </div>

      <div className="dashGrid" style={{ marginTop: 16 }}>
        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">Quiz scores</div>
          <div className="muted">Last attempts (placeholder until quiz tracking is added)</div>
          <BarChart items={quizItems.length ? quizItems : [{ label: 'Quiz 1', value: 0 }, { label: 'Quiz 2', value: 0 }, { label: 'Quiz 3', value: 0 }]} />
        </div>

        <div className="dashCard">
          <div className="dashTitle">Earned badges/certificates</div>
          <div className="muted">
            Badges: {dash?.badges?.length ?? 0} · Certificates: {dash?.certificates?.length ?? 0}
          </div>
        </div>

        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">Recent activities</div>
          <ul className="list">
            {(dash?.recent_activities ?? []).slice(0, 5).map((a, idx) => (
              <li key={idx}>
                <span>{a.text}</span>
                <span className="muted">{new Date(a.at).toLocaleString()}</span>
              </li>
            ))}
            {(dash?.recent_activities ?? []).length === 0 ? <li className="muted">No activity yet.</li> : null}
          </ul>
        </div>

        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">Notifications</div>
          <ul className="list">
            {(dash?.notifications ?? []).slice(0, 5).map((n, idx) => (
              <li key={idx}>
                <span>{n.text}</span>
                <span className="muted">{n.at ? new Date(n.at).toLocaleString() : ''}</span>
              </li>
            ))}
            {(dash?.notifications ?? []).length === 0 ? <li className="muted">No notifications.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  )
}

function AdminDashboardView({
  dash,
  users,
  modules,
}: {
  dash: AdminDashboard | null
  users: AdminUserList | null
  modules: AdminModuleList | null
}) {
  const roleItems = useMemo(() => {
    const admin = dash?.user_analytics?.roles?.admin ?? 0
    const user = dash?.user_analytics?.roles?.user ?? 0
    return [
      { label: 'Admins', value: admin },
      { label: 'Users', value: user },
    ]
  }, [dash])

  return (
    <div style={{ marginTop: 16 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Welcome</h1>

      <div className="dashGrid" style={{ marginTop: 16 }}>
        <StatCard title="Total users" value={`${dash?.totals?.total_users ?? 0}`} />
        <StatCard title="Active participants" value={`${dash?.totals?.active_participants ?? 0}`} subtitle="Last 24 hours" />
        <StatCard title="Average quiz scores" value={dash?.totals?.average_quiz_score == null ? '—' : `${dash?.totals?.average_quiz_score}`} />
        <StatCard title="Training module management" value={`${dash?.training_modules?.active ?? 0} active`} subtitle={`${dash?.training_modules?.total ?? 0} total`} />
      </div>

      <div className="dashGrid" style={{ marginTop: 16 }}>
        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">User analytics</div>
          <div className="muted">Role distribution</div>
          <BarChart items={roleItems} />
        </div>

        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">Most failed cyber threats</div>
          <ul className="list">
            {(dash?.most_failed_cyber_threats ?? []).slice(0, 5).map((t, idx) => (
              <li key={idx}>
                <span>{t.title}</span>
                <span className="muted">{t.count}</span>
              </li>
            ))}
            {(dash?.most_failed_cyber_threats ?? []).length === 0 ? <li className="muted">No threat analytics yet.</li> : null}
          </ul>
        </div>

        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">System reports</div>
          <ul className="list">
            {(dash?.system_reports ?? []).slice(0, 5).map((r, idx) => (
              <li key={idx}>
                <span>{r.title}: {r.value}</span>
                <span className="muted">{new Date(r.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">User management</div>
          <div className="muted">Showing first 10 users</div>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {(users?.users ?? []).slice(0, 10).map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
                {(users?.users ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">No users found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashCard" style={{ gridColumn: 'span 2' }}>
          <div className="dashTitle">Training module management</div>
          <div className="muted">Showing first 10 modules</div>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(modules?.modules ?? []).slice(0, 10).map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.title}</td>
                    <td>{m.is_active ? 'active' : 'inactive'}</td>
                  </tr>
                ))}
                {(modules?.modules ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted">No modules found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

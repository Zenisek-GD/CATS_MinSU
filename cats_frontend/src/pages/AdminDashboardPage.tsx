import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getAdminDashboard, type AdminDashboard } from '../api/dashboard'
import { getApiErrorMessage } from '../api/error'
import { Icon } from '../components/IconMap'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TopbarActions } from '../components/TopbarActions'
import './AdminDashboardPage.css'

const COLORS = ['#006a61', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1']

export type AdminTab = 'dashboard' | 'users' | 'content' | 'badges' | 'feedback'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [dash, setDash] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    ;(async () => {
      try {
        const d = await getAdminDashboard()
        setDash(d)
      } catch (e) { setError(getApiErrorMessage(e, 'Failed to load dashboard.')) }
    })()
  }, [user])

  if (!user || user.role !== 'admin') return <div className="adminDashPage"><p style={{ padding: 40 }}>Admin access required.</p></div>

  return (
    <AdminLayout activeTab="dashboard" pageTitle="Admin Dashboard" pageSubtitle="Platform analytics & overview">
      {error && <div style={{ color: '#ba1a1a', marginBottom: 16 }}>{error}</div>}

      {/* ─── Stat Cards ─── */}
      <div className="adminStatsGrid">
        <StatCard icon="group" color="blue" label="Total Users" value={`${dash?.totals?.total_users ?? 0}`} />
        <StatCard icon="person_check" color="green" label="Active Users" value={`${dash?.totals?.active_participants ?? 0}`} meta="Last 24h" />
        <StatCard icon="percent" color="purple" label="Quiz Completion" value={`${dash?.totals?.quiz_completion_rate ?? 0}%`} />
        <StatCard icon="security" color="teal" label="Sim Completion" value={`${dash?.totals?.simulation_completion_rate ?? 0}%`} />
        <StatCard icon="insights" color="amber" label="Avg Awareness" value={dash?.totals?.average_quiz_score != null ? `${dash.totals.average_quiz_score}%` : '—'} />
        <StatCard icon="warning" color="red" label="Most Failed" value={dash?.totals?.most_failed_category ?? 'N/A'} />
        <StatCard icon="workspace_premium" color="indigo" label="Certificates" value={`${dash?.totals?.certificates_issued ?? 0}`} />
      </div>

      {/* ─── Charts ─── */}
      <div className="adminChartsGrid">
        <div className="adminChartCard">
          <div className="adminChartTitle">User Growth</div>
          <div className="adminChartSubtitle">Monthly registrations (last 12 months)</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dash?.charts?.user_growth ?? []}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006a61" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#006a61" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,28,48,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#006a61" fill="url(#colorUsers)" strokeWidth={2} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="adminChartCard">
          <div className="adminChartTitle">Quiz Score Trends</div>
          <div className="adminChartSubtitle">Monthly average scores</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dash?.charts?.quiz_trends ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,28,48,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="avg_score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Avg Score %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="adminChartCard">
          <div className="adminChartTitle">Threat Category Performance</div>
          <div className="adminChartSubtitle">Correct answer rate per category</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dash?.charts?.category_performance ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,28,48,0.06)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="percent" name="Correct %" radius={[0, 6, 6, 0]}>
                {(dash?.charts?.category_performance ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="adminChartCard">
          <div className="adminChartTitle">Simulation Analytics</div>
          <div className="adminChartSubtitle">Run status distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Completed', value: dash?.charts?.simulation_analytics?.completed ?? 0 },
                  { name: 'In Progress', value: dash?.charts?.simulation_analytics?.in_progress ?? 0 },
                  { name: 'Expired', value: dash?.charts?.simulation_analytics?.expired ?? 0 },
                ]}
                cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                paddingAngle={3} dataKey="value" label
              >
                <Cell fill="#006a61" />
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="adminChartCard adminChartCardFull">
          <div className="adminChartTitle">Daily Activity</div>
          <div className="adminChartSubtitle">Quiz attempts & simulation runs (last 30 days)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dash?.charts?.daily_activity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,28,48,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quiz_attempts" name="Quiz Attempts" fill="#006a61" radius={[4, 4, 0, 0]} />
              <Bar dataKey="simulation_runs" name="Sim Runs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Most Active Users ─── */}
      <div className="adminUsersCard">
        <div className="adminChartTitle">Most Active Users</div>
        <table className="adminUsersTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Quiz Attempts</th>
              <th>Sim Runs</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(dash?.most_active_users ?? []).map((u) => {
              const level = u.activity_count >= 10 ? 'high' : u.activity_count >= 3 ? 'med' : 'low'
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.quiz_attempts}</td>
                  <td>{u.simulation_runs}</td>
                  <td>
                    <span className={`adminActivityBadge ${level}`}>{u.activity_count}</span>
                  </td>
                </tr>
              )
            })}
            {(dash?.most_active_users ?? []).length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(11,28,48,0.4)' }}>No activity data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

/* ─── Stat Card ─── */
function StatCard({ icon, color, label, value, meta }: { icon: string; color: string; label: string; value: string; meta?: string }) {
  return (
    <div className="adminStatCard">
      <div className={`adminStatIcon ${color}`}>
        <Icon name={icon} size={20} />
      </div>
      <div className="adminStatLabel">{label}</div>
      <div className="adminStatValue">{value}</div>
      {meta && <div className="adminStatMeta">{meta}</div>}
    </div>
  )
}

/* ─── Shared Admin Layout with responsive sidebar + mobile nav ─── */
export function AdminLayout({ activeTab, pageTitle, pageSubtitle, children }: {
  activeTab: AdminTab
  pageTitle: string
  pageSubtitle?: string
  children: React.ReactNode
}) {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null
  const initial = user.name?.trim()?.slice(0, 1)?.toUpperCase() || 'A'
  const onLogout = async () => { await clearSession(); navigate('/auth', { replace: true }) }

  return (
    <div className="adminDashPage">
      {/* Mobile header */}
      <div className="adminMobileHeader">
        <div className="adminMobileHeaderLeft">
          <div className="adminSidebarAvatar" style={{ width: 30, height: 30, fontSize: 12 }}>{initial}</div>
          <span className="adminMobileHeaderTitle">{pageTitle}</span>
        </div>
        <button className="adminHamburger" onClick={() => setSidebarOpen(true)}>
          <Icon name="menu" size={22} />
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      <div className={`adminSidebarOverlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="adminDashShell">
        <aside className={`adminSidebar ${sidebarOpen ? 'mobileOpen' : ''}`}>
          <button className="adminSidebarClose" onClick={() => setSidebarOpen(false)}>
            <Icon name="close" size={22} />
          </button>
          <div className="adminSidebarBrand">
            <div className="adminSidebarAvatar">{initial}</div>
            <div className="adminSidebarBrandText">
              <div className="adminSidebarBrandTitle">Admin Panel</div>
              <div className="adminSidebarBrandMeta">{user.email}</div>
            </div>
          </div>
          <nav className="adminSidebarNav">
            <Link className={`adminSidebarNavItem ${activeTab === 'dashboard' ? 'active' : ''}`} to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
              <Icon name="dashboard" size={20} /> Dashboard
            </Link>
            <Link className={`adminSidebarNavItem ${activeTab === 'users' ? 'active' : ''}`} to="/admin/users" onClick={() => setSidebarOpen(false)}>
              <Icon name="group" size={20} /> Users
            </Link>
            <Link className={`adminSidebarNavItem ${activeTab === 'content' ? 'active' : ''}`} to="/admin/manage" onClick={() => setSidebarOpen(false)}>
              <Icon name="edit_note" size={20} /> Content
            </Link>
            <Link className={`adminSidebarNavItem ${activeTab === 'badges' ? 'active' : ''}`} to="/admin/badges" onClick={() => setSidebarOpen(false)}>
              <Icon name="emoji_events" size={20} /> Badges
            </Link>
            <Link className={`adminSidebarNavItem ${activeTab === 'feedback' ? 'active' : ''}`} to="/admin/feedback" onClick={() => setSidebarOpen(false)}>
              <Icon name="feedback" size={20} /> Feedback
            </Link>
            <Link className="adminSidebarNavItem" to="/modules" onClick={() => setSidebarOpen(false)}>
              <Icon name="arrow_back" size={20} /> Back to App
            </Link>
          </nav>
          <div className="adminSidebarBottom">
            <button type="button" className="adminSidebarNavItem" onClick={onLogout} style={{ width: '100%' }}>
              <Icon name="logout" size={20} /> Logout
            </button>
          </div>
        </aside>

        <div className="adminDashMain">
          <header className="adminDashTopbar">
            <div className="adminDashTopbarInner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="adminDashTitle">{pageTitle}</div>
                {pageSubtitle && <div className="adminDashSubtitle">{pageSubtitle}</div>}
              </div>
              <TopbarActions hideLogout hideTheme />
            </div>
          </header>
          <main className="adminDashContent">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="adminBottomNav">
        <div className="adminBottomNavInner">
          <Link className={`adminBottomNavItem ${activeTab === 'dashboard' ? 'active' : ''}`} to="/admin/dashboard">
            <Icon name="dashboard" size={22} />
            Dashboard
          </Link>
          <Link className={`adminBottomNavItem ${activeTab === 'users' ? 'active' : ''}`} to="/admin/users">
            <Icon name="group" size={22} />
            Users
          </Link>
          <Link className={`adminBottomNavItem ${activeTab === 'content' ? 'active' : ''}`} to="/admin/manage">
            <Icon name="edit_note" size={22} />
            Content
          </Link>
          <Link className={`adminBottomNavItem ${activeTab === 'badges' ? 'active' : ''}`} to="/admin/badges">
            <Icon name="emoji_events" size={22} />
            Badges
          </Link>
          <Link className={`adminBottomNavItem ${activeTab === 'feedback' ? 'active' : ''}`} to="/admin/feedback">
            <Icon name="feedback" size={22} />
            Feedback
          </Link>
          <button className="adminBottomNavItem" onClick={onLogout}>
            <Icon name="logout" size={22} />
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

/* ─── Legacy export for backward compat ─── */
export { AdminLayout as AdminSidebar_DEPRECATED }


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import { TcModulesTab } from './TeacherContent/TcModulesTab'
import { TcQuizzesTab } from './TeacherContent/TcQuizzesTab'
import { TcSimulationsTab } from './TeacherContent/TcSimulationsTab'
import './TeacherDashboardPage.css'

type Tab = 'modules' | 'quizzes' | 'simulations'

export default function TeacherManagePage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [tab, setTab] = useState<Tab>('modules')

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession(); navigate('/auth', { replace: true }) }
    catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  if (!user) return null

  return (
    <div className="modulesPage">
      <div className="modulesShell">

        {/* Sidebar */}
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img src="/cats logo.png" alt="CATS Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12 }} />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>
          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/teacher/classrooms"><Icon name="school" size={20} /><span>Classrooms</span></Link>
            <Link className="modulesNavItem" to="/teacher/reports"><Icon name="assessment" size={20} /><span>Reports</span></Link>
            <Link className="modulesNavItem active" to="/teacher/manage" aria-current="page"><Icon name="edit_note" size={20} /><span>Content</span></Link>
            <Link className="modulesNavItem" to="/teacher/feedback"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="modulesNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
            {user.role === 'admin' && (
              <Link className="modulesNavItem" to="/admin/dashboard"><Icon name="admin_panel_settings" size={20} /><span>Admin</span></Link>
            )}
          </nav>
          <div className="modulesSidebarBottom">
            <button className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} /><span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img src="/cats logo.png" alt="CATS Logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12 }} />
                <div>
                  <div className="modulesTitle">My Content</div>
                  <div className="modulesSubtitle">Create and manage your own modules, quizzes & simulations</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid var(--border-color)', paddingBottom: 2 }}>
              {(['modules', 'quizzes', 'simulations'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: '0.88rem',
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s'
                }}>
                  {t === 'modules' ? '📚 Modules' : t === 'quizzes' ? '❓ Quizzes' : '🛡️ Simulations'}
                </button>
              ))}
            </div>

            {tab === 'modules'     && <TcModulesTab />}
            {tab === 'quizzes'     && <TcQuizzesTab />}
            {tab === 'simulations' && <TcSimulationsTab />}
          </main>

          {/* Bottom nav */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/teacher/classrooms"><Icon name="school" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/teacher/reports"><Icon name="assessment" size={20} /><span>Reports</span></Link>
            <Link className="bottomNavItem active" to="/teacher/manage" aria-current="page"><Icon name="edit_note" size={20} /><span>Content</span></Link>
            <Link className="bottomNavItem" to="/teacher/feedback"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import './ModulesPage.css'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user) return null

  async function onLogout() {
    setLoggingOut(true)
    try {
      await clearSession()
      navigate('/auth', { replace: true })
    } catch {
      // ignore
    } finally {
      setLoggingOut(false)
    }
  }

  const initial = user.name?.trim()?.slice(0, 1)?.toUpperCase() || 'U'

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <div className="modulesAvatar" aria-hidden="true">
              {initial}
            </div>
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem" to="/simulations">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <Link className="modulesNavItem active" to="/profile" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span>Profile</span>
            </Link>
          </nav>

          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <div className="modulesAvatar lg" aria-hidden="true">
                  {initial}
                </div>
                <div>
                  <div className="modulesTitle">My Profile</div>
                  <div className="modulesSubtitle">Account details</div>
                </div>
              </div>

              <button type="button" className="modulesIconBtn" aria-label="Notifications">
                <span className="material-symbols-outlined" aria-hidden="true">
                  notifications
                </span>
              </button>
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero" aria-label="Profile hero">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Your Account</h1>
                  <p className="modulesHeroText">
                    View your profile information and manage your session.
                  </p>
                </div>
              </div>
            </section>

            <div style={{ marginTop: 24 }}>
              <div className="profileCard">
                <div className="profileCardHeader">
                  <div className="profileAvatarLg">{initial}</div>
                  <h2 className="profileName">{user.name || 'User'}</h2>
                  <span className={`profileRoleBadge ${user.role}`}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>
                      {user.role === 'admin' ? 'admin_panel_settings' : 'school'}
                    </span>
                    {user.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>

                <div className="profileCardBody">
                  <div className="profileInfoList">
                    <div className="profileInfoRow">
                      <div className="profileInfoIcon">
                        <span className="material-symbols-outlined" aria-hidden="true">badge</span>
                      </div>
                      <div className="profileInfoContent">
                        <div className="profileInfoLabel">Full Name</div>
                        <div className="profileInfoValue">{user.name || '—'}</div>
                      </div>
                    </div>

                    <div className="profileInfoRow">
                      <div className="profileInfoIcon">
                        <span className="material-symbols-outlined" aria-hidden="true">email</span>
                      </div>
                      <div className="profileInfoContent">
                        <div className="profileInfoLabel">Email Address</div>
                        <div className="profileInfoValue">{user.email}</div>
                      </div>
                    </div>

                    <div className="profileInfoRow">
                      <div className="profileInfoIcon">
                        <span className="material-symbols-outlined" aria-hidden="true">shield_person</span>
                      </div>
                      <div className="profileInfoContent">
                        <div className="profileInfoLabel">Role</div>
                        <div className="profileInfoValue" style={{ textTransform: 'capitalize' }}>{user.role}</div>
                      </div>
                    </div>

                    {user.participant_code ? (
                      <div className="profileInfoRow">
                        <div className="profileInfoIcon">
                          <span className="material-symbols-outlined" aria-hidden="true">tag</span>
                        </div>
                        <div className="profileInfoContent">
                          <div className="profileInfoLabel">Participant Code</div>
                          <div className="profileInfoValue">{user.participant_code}</div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="profileLogoutSection">
                    <button
                      type="button"
                      className="profileLogoutBtn"
                      onClick={onLogout}
                      disabled={loggingOut}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                      {loggingOut ? 'Logging out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem" to="/simulations">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <Link className="bottomNavItem active" to="/profile" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

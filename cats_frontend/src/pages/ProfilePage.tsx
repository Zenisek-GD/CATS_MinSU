import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getVapidPublicKey, subscribeToPush, unsubscribeFromPush, urlBase64ToUint8Array, uint8arrayToBase64 } from '../api/push'
import { getProfileStats, type ProfileData } from '../api/profile'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load profile stats on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const data = await getProfileStats()
        setProfileData(data)
      } catch (err: any) {
        console.error('Failed to load profile stats:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Check initial push subscription status
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setPushEnabled(!!sub)
        })
      })
    }
  }, [])

  async function togglePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported by your browser.')
      return
    }

    setPushBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready

      if (pushEnabled) {
        // Unsubscribe
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await unsubscribeFromPush(sub.endpoint)
        }
        setPushEnabled(false)
      } else {
        // Subscribe
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          alert('Notification permission denied.')
          setPushBusy(false)
          return
        }

        const { publicKey } = await getVapidPublicKey()
        const convertedVapidKey = urlBase64ToUint8Array(publicKey)

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })

        // Send to backend
        const p256dhKey = sub.getKey('p256dh')
        const authKey = sub.getKey('auth')
        
        if (!p256dhKey || !authKey) {
          throw new Error('Failed to retrieve encryption keys from subscription')
        }

        const p256dh = uint8arrayToBase64(new Uint8Array(p256dhKey))
        const auth = uint8arrayToBase64(new Uint8Array(authKey))

        await subscribeToPush(sub.endpoint, { p256dh, auth })
        setPushEnabled(true)
      }
    } catch (e: any) {
      console.error(e)
      alert('Failed to toggle notifications: ' + e.message)
    } finally {
      setPushBusy(false)
    }
  }

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
            <img 
              src="/cats logo.png" 
              alt="CATS Logo" 
              className="modulesLogo"
              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '12px' }}
            />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem" to="/simulations">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
              <Icon name="quiz" size={20} />
              <span>Assess</span>
            </Link>
            <Link className="modulesNavItem active" to="/profile" aria-current="page">
              <Icon name="person" size={20} />
              <span>Profile</span>
            </Link>
          </nav>

          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img 
                  src="/cats logo.png" 
                  alt="CATS Logo" 
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px' }}
                />
                <div>
                  <div className="modulesTitle">My Profile</div>
                  <div className="modulesSubtitle">Account details</div>
                </div>
              </div>

              <TopbarActions hideLogout={true} />
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero" aria-label="Profile hero">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Your Account</h1>
                  <p className="modulesHeroText">
                    View your profile information, achievements, and learning progress.
                  </p>
                </div>
              </div>
            </section>

            {error && (
              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                backgroundColor: '#fef2f2', 
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
              <Icon name="error" size={20} />
                <div>{error}</div>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              {/* Stats Section - Learning Progress First */}
              {!loading && profileData && (
                <>
                  {/* Overall Progress Card */}
                  <div className="profileCard" style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ padding: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                        <Icon name="trending_up" size={32} />
                        <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Learning Progress</h3>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 18, marginBottom: 32 }}>
                        {/* Modules Stat */}
                        <div style={{ 
                          padding: 24, 
                          backgroundColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
                          border: '1.5px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: 16, 
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          cursor: 'default',
                          boxShadow: '0 2px 12px rgba(16, 185, 129, 0.08)'
                        }}>
                          <div style={{ fontSize: 12, color: '#10b981', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Modules</div>
                          <div style={{ fontSize: 40, fontWeight: 900, color: '#10b981', marginBottom: 6, lineHeight: 1 }}>{profileData.stats.completed_modules}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>of {profileData.stats.total_modules} completed</div>
                        </div>
                        
                        {/* Progress Stat */}
                        <div style={{ 
                          padding: 24, 
                          backgroundColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
                          border: '1.5px solid rgba(59, 130, 246, 0.25)',
                          borderRadius: 16, 
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          cursor: 'default',
                          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.08)'
                        }}>
                          <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Progress</div>
                          <div style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6', marginBottom: 6, lineHeight: 1 }}>{profileData.stats.completion_percentage}%</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Course completion</div>
                        </div>
                        
                        {/* XP Stat */}
                        <div style={{ 
                          padding: 24, 
                          backgroundColor: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
                          border: '1.5px solid rgba(245, 158, 11, 0.25)',
                          borderRadius: 16, 
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          cursor: 'default',
                          boxShadow: '0 2px 12px rgba(245, 158, 11, 0.08)'
                        }}>
                          <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Experience</div>
                          <div style={{ fontSize: 40, fontWeight: 900, color: '#f59e0b', marginBottom: 6, lineHeight: 1 }}>{profileData.stats.total_xp}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total XP earned</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>Course Progress</span>
                          <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>{profileData.stats.completion_percentage}%</span>
                        </div>
                        <div style={{ 
                          height: 14, 
                          backgroundColor: '#e5e7eb', 
                          borderRadius: 12, 
                          overflow: 'hidden',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${profileData.stats.completion_percentage}%`, 
                            backgroundColor: 'var(--accent)',
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: 12,
                            boxShadow: '0 0 16px rgba(var(--accent-rgb), 0.5)'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Stats Section */}
              {!loading && profileData && (
                <>
                  {/* Achievements, Badges & Module Progress Card - Combined */}
                  <div className="profileCard" style={{ marginTop: 24 }}>
                    <div style={{ padding: 28 }}>
                      {/* Achievements Section */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                          <Icon name="star" size={28} />
                          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Achievements ({profileData.achievements.length})</h3>
                        </div>
                        {profileData.achievements.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 14, marginBottom: 32 }}>
                            {profileData.achievements.map(achievement => (
                              <div 
                                key={achievement.id} 
                                style={{ 
                                  padding: 16, 
                                  backgroundColor: 'var(--background-secondary)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 12, 
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                                title={achievement.description || ''}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-4px)'
                                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
                                  e.currentTarget.style.borderColor = 'var(--accent)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = 'none'
                                  e.currentTarget.style.borderColor = 'var(--border-color)'
                                }}
                              >
                                <div style={{ fontSize: 40, marginBottom: 8, lineHeight: 1 }}>
                                  <Icon name={achievement.icon} size={40} />
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{achievement.name}</div>
                                {achievement.xp_reward > 0 && (
                                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>+{achievement.xp_reward} XP</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: 24, backgroundColor: 'var(--background-secondary)', borderRadius: 12, textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ marginBottom: 12 }}>
                              <Icon name="star_outline" size={40} />
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                              Complete modules and quizzes to earn achievements and unlock rewards.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '24px 0' }} />

                      {/* Badges Section */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                          <Icon name="military_tech" size={28} />
                          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Badges ({profileData.badges.length})</h3>
                        </div>
                        {profileData.badges.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 14, marginBottom: 32 }}>
                            {profileData.badges.map(badge => (
                              <div 
                                key={badge.id} 
                                style={{ 
                                  padding: 16, 
                                  backgroundColor: 'var(--background-secondary)',
                                  border: '2px solid #8b5cf6',
                                  borderRadius: 12, 
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                                title={badge.description || ''}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.05) rotate(2deg)'
                                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.25)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              >
                                <div style={{ fontSize: 40, marginBottom: 8, lineHeight: 1 }}>
                                  <Icon name={badge.icon} size={40} />
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{badge.name}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: 24, backgroundColor: 'var(--background-secondary)', borderRadius: 12, textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ marginBottom: 12 }}>
                              <Icon name="badge_outline" size={40} />
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                              Master challenges and complete special tasks to earn exclusive badges.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '24px 0' }} />

                      {/* Module Progress Section */}
                      {profileData.module_progress.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <Icon name="menu_book" size={28} />
                            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Module Progress</h3>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {profileData.module_progress.map(module => (
                              <div 
                                key={module.module_id}
                                style={{ 
                                  padding: 16, 
                                  backgroundColor: 'var(--background-secondary)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 10,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{module.module_name}</div>
                                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {module.is_completed ? (
                                      <>
                                        <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
                                        <span style={{ color: '#10b981', fontWeight: 500 }}>Completed</span>
                                      </>
                                    ) : module.last_topic_id ? (
                                      <>
                                        <span style={{ color: '#f59e0b', fontSize: 14 }}>⟳</span>
                                        <span style={{ color: '#f59e0b', fontWeight: 500 }}>In Progress</span>
                                      </>
                                    ) : (
                                      <>
                                        <span style={{ color: '#9ca3af', fontSize: 14 }}>○</span>
                                        <span style={{ color: '#9ca3af', fontWeight: 500 }}>Not Started</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {module.is_completed && (
                                  <div style={{ fontSize: 24, marginLeft: 16 }}>✨</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Profile Card */}
              <div className="profileCard" style={{ marginTop: 28, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <div className="profileCardHeader">
                  <div className="profileAvatarLg">{initial}</div>
                  <h2 className="profileName" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{user.name || 'User'}</h2>
                  <span className={`profileRoleBadge ${user.role}`} style={{ fontSize: 13, fontWeight: 700, paddingTop: 6, paddingBottom: 6 }}>
                    <Icon name={user.role === 'admin' ? 'admin_panel_settings' : 'school'} size={16} />
                    {user.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>

                <div className="profileCardBody">
                  <div className="profileInfoList">
                    <div className="profileInfoRow">
                      <div className="profileInfoIcon">
                        <Icon name="badge" size={20} />
                      </div>
                      <div className="profileInfoContent">
                        <div className="profileInfoLabel">Full Name</div>
                        <div className="profileInfoValue" style={{ fontWeight: 600 }}>{user.name || '—'}</div>
                      </div>
                    </div>

                    <div className="profileInfoRow">
                      <div className="profileInfoIcon">
                        <Icon name="email" size={20} />
                      </div>
                      <div className="profileInfoContent">
                        <div className="profileInfoLabel">Email Address</div>
                        <div className="profileInfoValue" style={{ fontWeight: 500 }}>{user.email}</div>
                      </div>
                    </div>

                    <div className="profileInfoRow">
                      <div className="profileInfoIcon">
                        <Icon name="shield_person" size={20} />
                      </div>
                      <div className="profileInfoContent">
                        <div className="profileInfoLabel">Role</div>
                        <div className="profileInfoValue" style={{ textTransform: 'capitalize', fontWeight: 600 }}>{user.role}</div>
                      </div>
                    </div>

                    {user.participant_code ? (
                      <div className="profileInfoRow">
                        <div className="profileInfoIcon">
                          <Icon name="tag" size={20} />
                        </div>
                        <div className="profileInfoContent">
                          <div className="profileInfoLabel">Participant Code</div>
                          <div className="profileInfoValue" style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 13 }}>{user.participant_code}</div>
                        </div>
                      </div>
                    ) : null}

                    <div className="profileInfoRow" style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border-color)' }}>
                      <div className="profileInfoIcon">
                        <Icon name="notifications_active" size={20} />
                      </div>
                      <div className="profileInfoContent" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="profileInfoLabel">Push Notifications</div>
                          <div className="profileInfoValue" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Get notified about updates</div>
                        </div>
                        <button 
                          className={`modulesFilterBtn ${pushEnabled ? 'active' : ''}`} 
                          onClick={togglePush} 
                          disabled={pushBusy}
                          style={{ minWidth: 110, justifyContent: 'center', fontWeight: 600, fontSize: 13 }}
                        >
                          {pushBusy ? 'Wait...' : pushEnabled ? 'Enabled' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profileLogoutSection">
                    <button
                      type="button"
                      className="profileLogoutBtn"
                      onClick={onLogout}
                      disabled={loggingOut}
                      style={{ fontWeight: 700, fontSize: 15 }}
                    >
                      <Icon name="logout" size={20} />
                      {loggingOut ? 'Logging out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="profileCard" style={{ marginTop: 24 }}>
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '3px solid var(--border-color)',
                        borderTopColor: 'var(--accent)',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                      }} />
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading your profile...</div>
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </div>
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem" to="/simulations">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
              <Icon name="quiz" size={20} />
              <span>Assess</span>
            </Link>
            <Link className="bottomNavItem active" to="/profile" aria-current="page">
              <Icon name="person" size={20} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

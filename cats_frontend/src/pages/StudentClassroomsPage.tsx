import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { studentClassroomAPI, type Classroom } from '../api/classrooms'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'
import './StudentClassroomsPage.css'

export default function StudentClassroomsPage() {
  const { user, clearSession } = useAuth()

  const [searchParams] = useSearchParams()
  const [loggingOut, setLoggingOut] = useState(false)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [allModules, setAllModules] = useState<ApiTrainingModule[]>([])
  const [loading, setLoading] = useState(true)

  // Leave confirmation
  const [leaveTarget, setLeaveTarget] = useState<{ id: number; name: string } | null>(null)

  // Join modal state
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinStep, setJoinStep] = useState<'idle' | 'verifying' | 'verified' | 'joining' | 'error'>('idle')
  const [joinPreview, setJoinPreview] = useState<Classroom | null>(null)
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')

  // QR scanner
  const [qrMode, setQrMode] = useState(false)
  const [qrError, setQrError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    if (!user) return
    loadClassrooms()
    // Auto-open join modal if ?code= in URL (from QR link)
    const code = searchParams.get('code')
    if (code) {
      setJoinCode(code.toUpperCase())
      setJoinOpen(true)
    }
  }, [user])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  async function loadClassrooms() {
    setLoading(true)
    try {
      const [classData, moduleData] = await Promise.all([
        studentClassroomAPI.getClassrooms(),
        getModules(),
      ])
      setClassrooms(classData.classrooms)
      setAllModules(moduleData.modules)
    } catch {
      setClassrooms([])
    } finally {
      setLoading(false)
    }
  }

  function getClassroomProgress(c: Classroom) {
    const assigned = c.modules ?? []
    if (assigned.length === 0) return null
    const completed = assigned.filter(m => allModules.find(am => am.id === m.id)?.user_progress?.is_completed).length
    return { completed, total: assigned.length, percent: Math.round((completed / assigned.length) * 100) }
  }

  // ── Code verify + join ────────────────────────────────────────────────────

  async function verifyCode() {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setJoinStep('verifying')
    setJoinError('')
    setJoinPreview(null)
    try {
      const res = await studentClassroomAPI.verifyCode(code)
      if (res.valid && res.classroom) {
        setJoinPreview(res.classroom)
        setJoinStep('verified')
      } else {
        setJoinError('Invalid classroom code. Please check and try again.')
        setJoinStep('error')
      }
    } catch {
      setJoinError('Could not verify code. Please try again.')
      setJoinStep('error')
    }
  }

  async function confirmJoin() {
    if (!joinPreview) return
    setJoinStep('joining')
    try {
      await studentClassroomAPI.joinClassroom(joinCode.trim().toUpperCase())
      setJoinSuccess(`You've joined "${joinPreview.name}"!`)
      await loadClassrooms()
      setTimeout(() => closeJoinModal(), 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to join classroom.'
      setJoinError(msg)
      setJoinStep('error')
    }
  }

  function closeJoinModal() {
    setJoinOpen(false)
    setJoinCode('')
    setJoinStep('idle')
    setJoinPreview(null)
    setJoinError('')
    setJoinSuccess('')
    setQrMode(false)
    stopCamera()
  }

  // ── QR camera scanner ──────────────────────────────────────────────────────

  async function startCamera() {
    setQrError('')
    setQrMode(true)
    scanningRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        requestAnimationFrame(scanFrame)
      }
    } catch {
      setQrError('Camera access denied. Please allow camera permissions and try again.')
      setQrMode(false)
    }
  }

  function stopCamera() {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  async function scanFrame() {
    if (!scanningRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      requestAnimationFrame(scanFrame)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    // Use BarcodeDetector if available (Chrome/Edge), else jsQR fallback
    if ('BarcodeDetector' in window) {
      try {
        // @ts-expect-error BarcodeDetector is not in TS lib yet
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        const codes = await detector.detect(canvas)
        if (codes.length > 0) {
          const raw: string = codes[0].rawValue
          handleQrResult(raw)
          return
        }
      } catch {
        // fallback below
      }
    }
    if (scanningRef.current) requestAnimationFrame(scanFrame)
  }

  function handleQrResult(raw: string) {
    stopCamera()
    setQrMode(false)
    // Raw value may be a URL like https://...?code=ABCD or just the code
    let code = raw.trim()
    const urlMatch = code.match(/[?&]code=([A-Z0-9]+)/i)
    if (urlMatch) code = urlMatch[1].toUpperCase()
    else code = code.toUpperCase()
    setJoinCode(code)
    // Auto-verify
    setJoinStep('verifying')
    setJoinError('')
    studentClassroomAPI.verifyCode(code).then(res => {
      if (res.valid && res.classroom) {
        setJoinPreview(res.classroom)
        setJoinStep('verified')
      } else {
        setJoinError('QR code did not match any active classroom.')
        setJoinStep('error')
      }
    }).catch(() => {
      setJoinError('Could not verify QR code. Please try again.')
      setJoinStep('error')
    })
  }

  // ── Leave classroom ────────────────────────────────────────────────────────

  async function leaveClassroom(id: number) {
    try {
      await studentClassroomAPI.leaveClassroom(id)
      setClassrooms(prev => prev.filter(c => c.id !== id))
      setLeaveTarget(null)
    } catch {
      alert('Failed to leave classroom.')
    }
  }

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession() } catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  if (!user) return null

  return (
    <div className="modulesPage">
      <div className="modulesShell">

        {/* ── Sidebar ── */}
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img src="/cats logo.png" alt="CATS Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12 }} />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>
          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="modulesNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="modulesNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="modulesNavItem active" to="/classrooms" aria-current="page"><Icon name="groups" size={20} /><span>Classrooms</span></Link>
            <Link className="modulesNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <Link className="modulesNavItem" to="/teacher/classrooms"><Icon name="manage_accounts" size={20} /><span>Teacher</span></Link>
            )}
          </nav>
          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} /><span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img src="/cats logo.png" alt="CATS Logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12 }} />
                <div>
                  <div className="modulesTitle">My Classrooms</div>
                  <div className="modulesSubtitle">{user.name || 'Student'}</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* Hero */}
            <section className="scHero">
              <div className="scHeroInner">
                <div>
                  <h1 className="scHeroTitle">Your Classrooms</h1>
                  <p className="scHeroText">Join a classroom using your teacher's code or QR code to access assigned modules, quizzes, and simulations.</p>
                </div>
                <div className="scHeroActions">
                  <button className="scJoinBtn" id="btn-join-code" onClick={() => { setJoinOpen(true); setQrMode(false) }}>
                    <Icon name="keyboard" size={20} /> Enter Code
                  </button>
                  <button className="scJoinBtn qr" id="btn-join-qr" onClick={() => { setJoinOpen(true); startCamera() }}>
                    <Icon name="qr_code_scanner" size={20} /> Scan QR
                  </button>
                </div>
              </div>
            </section>

            {/* Classroom list */}
            {loading ? (
              <div className="scSkeleton">
                {[1,2,3].map(i => <div key={i} className="scSkeletonCard" />)}
              </div>
            ) : classrooms.length === 0 ? (
              <div className="scEmpty">
                <Icon name="groups" size={48} />
                <p>You haven't joined any classrooms yet.</p>
                <p className="scEmptyHint">Ask your teacher for a class code or QR code.</p>
                <button className="scJoinBtn" style={{ marginTop: 16 }} onClick={() => setJoinOpen(true)}>
                  <Icon name="add" size={18} /> Join a Classroom
                </button>
              </div>
            ) : (
              <div className="scGrid">
                  {classrooms.map(c => {
                    const prog = getClassroomProgress(c)
                    return (
                    <article key={c.id} className="scCard" id={`classroom-${c.id}`}>
                      <div className="scCardHeader">
                        <div className="scCardAvatar">{c.name.charAt(0).toUpperCase()}</div>
                        <div className="scCardMeta">
                          <h2 className="scCardName">{c.name}</h2>
                          <p className="scCardDesc">{c.description || 'No description'}</p>
                          <span className="scCardCode">{c.code}</span>
                        </div>
                        <span className={`scCardStatus ${c.status}`}>{c.status}</span>
                      </div>

                      {prog && (
                        <div className="scCardProgress">
                          <div className="scCardProgressHeader">
                            <span>{prog.completed}/{prog.total} modules done</span>
                            <span className="scCardProgressPct">{prog.percent}%</span>
                          </div>
                          <div className="scCardProgressBar">
                            <div className="scCardProgressFill" style={{ width: `${prog.percent}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="scCardStats">
                        <div className="scCardStat"><Icon name="menu_book" size={14} /><span>{c.modules?.length ?? 0} modules</span></div>
                        <div className="scCardStat"><Icon name="quiz" size={14} /><span>{c.quizzes?.length ?? 0} quizzes</span></div>
                        <div className="scCardStat"><Icon name="security" size={14} /><span>{c.simulations?.length ?? 0} simulations</span></div>
                        {c.teacher && <div className="scCardStat"><Icon name="person" size={14} /><span>{c.teacher.name}</span></div>}
                      </div>

                      <div className="scCardFooter">
                        <button className="scLeaveBtn" onClick={() => setLeaveTarget({ id: c.id, name: c.name })} aria-label={`Leave ${c.name}`}>
                          <Icon name="exit_to_app" size={16} /> Leave
                        </button>
                        <Link to={`/classrooms/${c.id}`} className="scOpenBtn">
                          <Icon name="arrow_forward" size={16} /> Open
                        </Link>
                      </div>
                    </article>
                    )
                  })}
              </div>
            )}

            {/* Motivational prompt */}
            {!loading && (
              <div className="scMotivation">
                <div className="scMotivationIcon"><Icon name="bolt" size={26} /></div>
                <div className="scMotivationText">
                  <p className="scMotivationTitle">Ready to level up?</p>
                  <p className="scMotivationDesc">
                    {classrooms.length === 0
                      ? 'Join a classroom to access modules, quizzes, and simulations assigned by your teacher.'
                      : 'Open a classroom and continue where you left off — consistent practice builds real skills.'}
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Bottom nav (mobile) */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="bottomNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="bottomNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="bottomNavItem active" to="/classrooms" aria-current="page"><Icon name="groups" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>

      {/* ── Leave confirmation modal ── */}
      {leaveTarget && (
        <div className="scModalBackdrop" role="dialog" aria-modal="true" aria-label="Leave classroom" onClick={e => { if (e.target === e.currentTarget) setLeaveTarget(null) }}>
          <div className="scLeaveModal">
            <Icon name="exit_to_app" size={40} />
            <p className="scLeaveModalTitle">Leave "{leaveTarget.name}"?</p>
            <p className="scLeaveModalText">You'll lose access to this classroom's modules, quizzes, and simulations. You can only rejoin if your teacher shares the code again.</p>
            <div className="scLeaveModalActions">
              <button className="scLeaveCancelBtn" onClick={() => setLeaveTarget(null)}>Cancel</button>
              <button className="scLeaveConfirmBtn" id="btn-confirm-leave" onClick={() => leaveClassroom(leaveTarget.id)}>Yes, Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Join Modal ── */}
      {joinOpen && (
        <div className="scModalBackdrop" role="dialog" aria-modal="true" aria-label="Join a classroom" onClick={e => { if (e.target === e.currentTarget) closeJoinModal() }}>
          <div className="scModal">
            <div className="scModalHeader">
              <h2 className="scModalTitle">
                {qrMode ? 'Scan QR Code' : 'Join a Classroom'}
              </h2>
              <button className="scModalClose" onClick={closeJoinModal} aria-label="Close"><Icon name="close" size={20} /></button>
            </div>

            {/* Success */}
            {joinSuccess ? (
              <div className="scJoinSuccess">
                <Icon name="check_circle" size={40} />
                <p>{joinSuccess}</p>
              </div>
            ) : qrMode ? (
              /* QR Camera view */
              <div className="scQrView">
                <div className="scQrFrame">
                  <video ref={videoRef} className="scQrVideo" playsInline muted autoPlay />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="scQrCorners" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                </div>
                {qrError && <p className="scJoinError">{qrError}</p>}
                <p className="scQrHint">Point your camera at the classroom QR code</p>
                <button className="scSwitchBtn" onClick={() => { stopCamera(); setQrMode(false) }}>
                  <Icon name="keyboard" size={16} /> Switch to Code Entry
                </button>
              </div>
            ) : (
              /* Code entry view */
              <div className="scCodeView">
                {joinStep !== 'verified' && joinStep !== 'joining' && (
                  <>
                    <label className="scCodeLabel" htmlFor="joinCodeInput">Enter Classroom Code</label>
                    <div className="scCodeInputRow">
                      <input
                        id="joinCodeInput"
                        className="scCodeInput"
                        type="text"
                        value={joinCode}
                        onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinStep('idle'); setJoinError('') }}
                        onKeyDown={e => e.key === 'Enter' && verifyCode()}
                        placeholder="e.g. ABC123"
                        maxLength={12}
                        autoFocus
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <button
                        className="scVerifyBtn"
                        onClick={verifyCode}
                        disabled={!joinCode.trim() || joinStep === 'verifying'}
                        id="btn-verify-code"
                      >
                        {joinStep === 'verifying' ? 'Checking…' : 'Verify'}
                      </button>
                    </div>

                    <div className="scOrRow">
                      <span>or</span>
                    </div>

                    <button className="scSwitchBtn qr" onClick={() => { startCamera() }} id="btn-switch-qr">
                      <Icon name="qr_code_scanner" size={18} /> Scan QR Code Instead
                    </button>

                    {joinError && <p className="scJoinError" role="alert">{joinError}</p>}
                  </>
                )}

                {/* Verified preview */}
                {joinStep === 'verified' && joinPreview && (
                  <div className="scVerifiedPanel">
                    <div className="scVerifiedIcon"><Icon name="check_circle" size={28} /></div>
                    <div className="scVerifiedInfo">
                      <p className="scVerifiedName">{joinPreview.name}</p>
                      {joinPreview.description && <p className="scVerifiedDesc">{joinPreview.description}</p>}
                      {joinPreview.teacher && <p className="scVerifiedTeacher"><Icon name="person" size={14} /> {joinPreview.teacher.name}</p>}
                    </div>
                    <div className="scVerifiedActions">
                      <button className="scConfirmBtn" onClick={confirmJoin} id="btn-confirm-join">
                        <Icon name="login" size={18} /> Join Classroom
                      </button>
                      <button className="scSwitchBtn" onClick={() => { setJoinStep('idle'); setJoinPreview(null); setJoinCode('') }}>
                        Try a different code
                      </button>
                    </div>
                  </div>
                )}

                {joinStep === 'joining' && (
                  <div className="scJoinSuccess" style={{ marginTop: 24 }}>
                    <Icon name="hourglass_empty" size={40} />
                    <p>Joining classroom…</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

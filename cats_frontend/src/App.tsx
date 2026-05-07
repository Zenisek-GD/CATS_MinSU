import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import type { Role } from './api/auth'
import LandingPage from './pages/LandingPage'
import ModulesPage from './pages/ModulesPage'
import ModuleViewerPage from './pages/ModuleViewerPage'
import ProfilePage from './pages/ProfilePage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizzesPage from './pages/QuizzesPage'
import SimulationRunPage from './pages/SimulationRunPage'
import SimulationsPage from './pages/SimulationsPage'
import AdminManagePage from './pages/AdminManagePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminBadgesPage from './pages/AdminBadgesPage'
import { AdminFeedbackPage } from './pages/AdminFeedbackPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import TeacherClassroomDetailPage from './pages/TeacherClassroomDetailPage'
import TeacherReportsPage from './pages/TeacherReportsPage'
import TeacherResourcesPage from './pages/TeacherResourcesPage'
import TeacherFeedbackPage from './pages/TeacherFeedbackPage'
import StudentClassroomsPage from './pages/StudentClassroomsPage'
import StudentClassroomDetailPage from './pages/StudentClassroomDetailPage'
import { PwaInstallBanner } from './components/PwaInstallBanner'
import './App.css'

// ── Role helpers ─────────────────────────────────────────────────────────────

/** Returns true when the user's role is in the allowed list */
function hasRole(role: Role | undefined, ...allowed: Role[]): boolean {
  if (!role) return false
  return allowed.includes(role)
}

/** Where to send a logged-in user by default */
function defaultRoute(role: Role | undefined): string {
  if (hasRole(role, 'admin')) return '/admin/dashboard'
  if (hasRole(role, 'teacher')) return '/teacher/classrooms'
  return '/modules' // student | user
}

// ── Route guard ───────────────────────────────────────────────────────────────

function Guard({
  allowed,
  children,
}: {
  allowed: Role[]
  children: React.ReactNode
}) {
  const { token, user, isReady } = useAuth()

  // Wait until the auth state is resolved before making a decision
  if (!isReady) return null

  if (!token || !user) return <Navigate to="/" replace />

  if (!hasRole(user.role, ...allowed)) {
    // Redirect to the correct home for this role instead of a blank 403
    return <Navigate to={defaultRoute(user.role)} replace />
  }

  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { token, user, isReady } = useAuth()

  // Don't render routes until auth is resolved (avoids flash-redirects)
  if (!isReady) return null

  const home = defaultRoute(user?.role)

  return (
    <>
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Student / User routes — accessible by all authenticated roles */}
      <Route
        path="/modules"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <ModulesPage />
          </Guard>
        }
      />
      <Route
        path="/modules/:id"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <ModuleViewerPage />
          </Guard>
        }
      />
      <Route
        path="/profile"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <ProfilePage />
          </Guard>
        }
      />
      <Route
        path="/quizzes"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <QuizzesPage />
          </Guard>
        }
      />
      <Route
        path="/quiz-attempts/:attemptId"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <QuizAttemptPage />
          </Guard>
        }
      />
      <Route
        path="/simulations"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <SimulationsPage />
          </Guard>
        }
      />
      <Route
        path="/simulation-runs/:runId"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <SimulationRunPage />
          </Guard>
        }
      />

      <Route
        path="/classrooms"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <StudentClassroomsPage />
          </Guard>
        }
      />
      <Route
        path="/classrooms/:id"
        element={
          <Guard allowed={['student', 'user', 'teacher', 'admin']}>
            <StudentClassroomDetailPage />
          </Guard>
        }
      />

      {/* Teacher routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <Guard allowed={['teacher', 'admin']}>
            <Navigate to="/teacher/classrooms" replace />
          </Guard>
        }
      />
      <Route
        path="/teacher/classrooms"
        element={
          <Guard allowed={['teacher', 'admin']}>
            <TeacherDashboardPage />
          </Guard>
        }
      />
      <Route
        path="/teacher/classrooms/:id"
        element={
          <Guard allowed={['teacher', 'admin']}>
            <TeacherClassroomDetailPage />
          </Guard>
        }
      />
      <Route
        path="/teacher/reports"
        element={
          <Guard allowed={['teacher', 'admin']}>
            <TeacherReportsPage />
          </Guard>
        }
      />
      <Route
        path="/teacher/resources"
        element={
          <Guard allowed={['teacher', 'admin']}>
            <TeacherResourcesPage />
          </Guard>
        }
      />
      <Route
        path="/teacher/feedback"
        element={
          <Guard allowed={['teacher', 'admin']}>
            <TeacherFeedbackPage />
          </Guard>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <Guard allowed={['admin']}>
            <AdminDashboardPage />
          </Guard>
        }
      />
      <Route
        path="/admin/users"
        element={
          <Guard allowed={['admin']}>
            <AdminUsersPage />
          </Guard>
        }
      />
      <Route
        path="/admin/manage"
        element={
          <Guard allowed={['admin']}>
            <AdminManagePage />
          </Guard>
        }
      />
      <Route
        path="/admin/badges"
        element={
          <Guard allowed={['admin']}>
            <AdminBadgesPage />
          </Guard>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <Guard allowed={['admin']}>
            <AdminFeedbackPage />
          </Guard>
        }
      />

      {/* Catch-all: send logged-in users to their home, others to landing */}
      <Route
        path="*"
        element={<Navigate to={token ? home : '/'} replace />}
      />
    </Routes>
    <PwaInstallBanner />
    </>
  )
}

export default App

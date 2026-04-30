import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import AuthPage from './pages/AuthPage'

import ModulesPage from './pages/ModulesPage'
import ProfilePage from './pages/ProfilePage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizzesPage from './pages/QuizzesPage'
import SimulationRunPage from './pages/SimulationRunPage'
import SimulationsPage from './pages/SimulationsPage'
import AdminManagePage from './pages/AdminManagePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminBadgesPage from './pages/AdminBadgesPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { token, user } = useAuth()
  const isAdmin = token && user?.role === 'admin'
  const defaultPath = isAdmin ? '/admin/dashboard' : '/modules'

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Navigate to={token ? defaultPath : '/auth'} replace />} />
      <Route path="/modules" element={token ? <ModulesPage /> : <Navigate to="/auth" replace />} />

      <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/auth" replace />} />
      <Route path="/quizzes" element={token ? <QuizzesPage /> : <Navigate to="/auth" replace />} />
      <Route path="/quiz-attempts/:attemptId" element={token ? <QuizAttemptPage /> : <Navigate to="/auth" replace />} />
      <Route path="/simulations" element={token ? <SimulationsPage /> : <Navigate to="/auth" replace />} />
      <Route path="/simulation-runs/:runId" element={token ? <SimulationRunPage /> : <Navigate to="/auth" replace />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboardPage /> : <Navigate to="/auth" replace />} />
      <Route path="/admin/users" element={isAdmin ? <AdminUsersPage /> : <Navigate to="/auth" replace />} />
      <Route path="/admin/manage" element={isAdmin ? <AdminManagePage /> : <Navigate to="/auth" replace />} />
      <Route path="/admin/badges" element={isAdmin ? <AdminBadgesPage /> : <Navigate to="/auth" replace />} />

      <Route path="*" element={<Navigate to={token ? defaultPath : '/auth'} replace />} />
    </Routes>
  )
}

export default App

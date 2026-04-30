import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ModulesPage from './pages/ModulesPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizzesPage from './pages/QuizzesPage'
import SimulationRunPage from './pages/SimulationRunPage'
import SimulationsPage from './pages/SimulationsPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Navigate to={token ? '/modules' : '/auth'} replace />} />
      <Route path="/modules" element={token ? <ModulesPage /> : <Navigate to="/auth" replace />} />
      <Route path="/dashboard" element={token ? <HomePage /> : <Navigate to="/auth" replace />} />
      <Route path="/quizzes" element={token ? <QuizzesPage /> : <Navigate to="/auth" replace />} />
      <Route path="/quiz-attempts/:attemptId" element={token ? <QuizAttemptPage /> : <Navigate to="/auth" replace />} />
      <Route path="/simulations" element={token ? <SimulationsPage /> : <Navigate to="/auth" replace />} />
      <Route path="/simulation-runs/:runId" element={token ? <SimulationRunPage /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to={token ? '/modules' : '/auth'} replace />} />
    </Routes>
  )
}

export default App

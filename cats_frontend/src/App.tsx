import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
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
      <Route
        path="/"
        element={token ? <HomePage /> : <Navigate to="/auth" replace />}
      />
      <Route path="*" element={<Navigate to={token ? '/' : '/auth'} replace />} />
    </Routes>
  )
}

export default App

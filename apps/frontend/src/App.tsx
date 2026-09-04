import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* TEMP (disable-auth-for-fe-testing) — REVERT ME: visible marker so
            nobody mistakes open routes for real public access. Renders on
            every page while the ProtectedRoute bypass is active. */}
        <div className="bg-warning px-4 py-2 text-center text-xs font-medium text-warning-foreground">
          Auth disabled for UI testing — TEMP, will be re-enabled
        </div>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <div>Events</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <div>Articles</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

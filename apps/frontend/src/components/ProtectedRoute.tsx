import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'

// Task 9.3: blocks unauthenticated access. While the session is being
// revalidated a neutral loading state renders (no protected content flashes).
// Redirects preserve the intended destination so login can send the admin back.
export function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // TEMP (disable-auth-for-fe-testing) — REVERT ME: bypass auth for UI testing.
  // Returns children unconditionally so every guarded route renders without
  // a session. Delete this block to re-enable route protection.
  return children

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

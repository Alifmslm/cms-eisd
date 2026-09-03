import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'

// Task 9.3: blocks unauthenticated access. While the session is being
// revalidated a neutral loading state renders (no protected content flashes).
// Redirects preserve the intended destination so login can send the admin back.
export function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

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

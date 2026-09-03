import type { ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'
import type { User, UserRole } from '@/types/auth'
import { AuthContext } from './auth-state'

// Task 9.2: app-wide auth state backed by the Better Auth session cookie.
// useSession revalidates GET /api/auth/get-session on mount, so login
// survives page reloads within the session lifetime.
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession()

  const raw = data?.user as unknown as
    | { id: string; username?: string; name?: string; role?: string }
    | undefined

  const user: User | null = raw
    ? {
        id: raw.id,
        username: raw.username ?? raw.name ?? '',
        role: (raw.role === 'admin' ? 'admin' : 'user') as UserRole,
      }
    : null

  async function signOut() {
    await authClient.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, loading: isPending, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

import { createContext } from 'react'
import type { AuthState } from '@/types/auth'

export interface AuthContextValue extends AuthState {
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Backend mounts Better Auth at /api/auth (see apps/backend/src/main.ts).
export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [usernameClient()],
})

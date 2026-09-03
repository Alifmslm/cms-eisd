import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FlaskConical, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from '@/components/reui/frame'
import { IconTile } from '@/components/reui/icon-tile'
import { authClient } from '@/lib/auth-client'

// Username/password login. Submits to Better Auth
// (POST /api/auth/sign-in/username) and returns to the originally requested
// page (or /dashboard) on success. Error copy stays generic per the auth spec
// (never reveal whether a username exists).
export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    const { error: signInError } = await authClient.signIn.username({
      username: username.trim(),
      password,
      rememberMe: remember,
    })
    setSubmitting(false)
    if (signInError) {
      setError('Invalid username or password.')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Frame>
          <FramePanel>
            <FrameHeader>
              <div className="flex items-center gap-2.5">
                <IconTile variant="solid">
                  <FlaskConical />
                </IconTile>
                <div>
                  <FrameTitle>EISD Laboratory</FrameTitle>
                  <FrameDescription>Content management</FrameDescription>
                </div>
              </div>
              <h1 className="mt-4 text-[32px] leading-10 font-semibold text-foreground">Sign in</h1>
              <p className="text-sm text-muted-foreground">Use your admin username and password.</p>
            </FrameHeader>

            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 accent-secondary"
                />
                Remember me
              </label>

              {error && (
                <Alert variant="destructive">
                  <TriangleAlert />
                  <AlertTitle>Sign-in failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </FramePanel>
        </Frame>
      </div>
    </div>
  )
}

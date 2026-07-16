"use client"
import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Check, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One capital letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (? _ ! @ #)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function PasswordChecklist({ password }: { password: string }) {
  return (
    <div style={{ marginTop: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password)
        return (
          <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {passed ? <Check style={{ width: '13px', height: '13px', color: '#059669' }} /> : <X style={{ width: '13px', height: '13px', color: '#cbd5e1' }} />}
            <span style={{ fontSize: '12px', color: passed ? '#059669' : '#94a3b8' }}>{rule.label}</span>
          </div>
        )
      })}
    </div>
  )
}

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#rg1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#rg2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!token) { setError("This reset link is missing its token. Request a new one."); return }
    const failedRule = PASSWORD_RULES.find(rule => !rule.test(newPassword))
    if (failedRule) { setError(`Password needs: ${failedRule.label.toLowerCase()}.`); return }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || data.message || "Something went wrong")
      setDone(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="mb-8">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Logo />
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>StockFlow Pro</span>
          </Link>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Set a new password</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Choose a new password for your account.</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle2 style={{ width: '40px', height: '40px', color: '#059669', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: 600, marginBottom: '8px' }}>Password reset</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Taking you to sign in...</p>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '16px' }}>This reset link is invalid or missing its token.</p>
              <Link href="/forgot-password" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>New password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '48px',
                      borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
                      fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0
                  }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                <PasswordChecklist password={newPassword} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Confirm new password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '16px',
                      borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
                      fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                  <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', height: '50px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #1a56db, #4f46e5)',
                color: '#ffffff', fontWeight: 700, fontSize: '15px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(26,86,219,0.35)',
              }}>
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <><span>Reset password</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

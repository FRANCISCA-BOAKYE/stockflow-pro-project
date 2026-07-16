"use client"
import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#fg1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#fg2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="fg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.message || "Something went wrong")
      }
      setSent(true)
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
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Forgot your password?</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Enter your account email and we&apos;ll send you a reset link.</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle2 style={{ width: '40px', height: '40px', color: '#059669', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: 600, marginBottom: '8px' }}>Check your inbox</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                If an account exists for <strong>{email}</strong>, a reset link is on its way. It expires in 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <input
                    type="email"
                    placeholder="you@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <><span>Send reset link</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>
                )}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
          <Link href="/login" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to sign in
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

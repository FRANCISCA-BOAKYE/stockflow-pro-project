"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/api"
import { setAuthSession } from "@/lib/auth"

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#lg1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#lg2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || "Invalid email or password")
      setAuthSession(data.token, data)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — animated dark panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f1f4a 50%, #1a0533 100%)' }}>

        {/* Floating bubbles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { w: 300, h: 300, top: '-80px', left: '-80px', color: 'rgba(59,130,246,0.15)' },
            { w: 200, h: 200, top: '30%', right: '-60px', color: 'rgba(99,102,241,0.12)' },
            { w: 150, h: 150, bottom: '20%', left: '10%', color: 'rgba(139,92,246,0.1)' },
            { w: 100, h: 100, bottom: '-30px', right: '20%', color: 'rgba(59,130,246,0.08)' },
            { w: 80, h: 80, top: '60%', left: '60%', color: 'rgba(99,102,241,0.15)' },
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute', width: b.w, height: b.h,
              borderRadius: '50%', backgroundColor: b.color,
              top: b.top, left: b.left, right: b.right, bottom: b.bottom,
              filter: 'blur(40px)',
              animation: `float${i} ${6 + i * 2}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <Logo />
          <span style={{ fontWeight: 700, fontSize: '20px', color: '#ffffff' }}>StockFlow Pro</span>
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
            <span style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 500 }}>Live platform</span>
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '20px' }}>
            Your supply chain,<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              always connected.
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: "Real-time inventory across all tiers", color: '#60a5fa' },
              { label: "Credit tracking with automatic due dates", color: '#a78bfa' },
              { label: "14-day free trial — data always safe", color: '#34d399' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowRight style={{ width: '12px', height: '12px', color: f.color }} />
                </div>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>{f.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#334155', position: 'relative', zIndex: 1 }}>© 2026 StockFlow Pro · Group 3</p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <Logo />
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>StockFlow Pro</span>
            </Link>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Welcome back</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Sign in to your StockFlow Pro account</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
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
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1a56db'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '48px',
                      borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
                      fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1a56db'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0
                  }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
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
                transition: 'all 0.2s',
              }}>
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <><span>Sign in</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none' }}>Start free trial</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
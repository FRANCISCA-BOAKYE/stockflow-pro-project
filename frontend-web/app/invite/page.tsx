"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, User, Shield, Send } from "lucide-react"

const ROLES: Record<string, string[]> = {
  MANUFACTURER: ["Production Supervisor", "Store Keeper", "POS Operator"],
  WHOLESALER: ["Receiving Staff", "Sales Staff"],
  RETAILER: ["Shop Staff"],
}

export default function InvitePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    setRole(ROLES[u.tierType]?.[0] || "Staff")
  }, [])

  const handleSend = () => {
    if (!name || !email || !role) return
    setSent(true)
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px', gap: '14px' }}>
          <button onClick={() => router.push("/accounts")} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
          </button>
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Invite team member</p>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
        {sent ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '48px 32px', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}>
              <Send style={{ width: '28px', height: '28px', color: '#ffffff' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Invitation sent!</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>{name} will receive an email at {email} with instructions to set up their account as {role}.</p>
            <button onClick={() => router.push("/accounts")} style={{ padding: '12px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a56db, #4f46e5)', color: '#ffffff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
              Back to accounts
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>New team member</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Full name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="James Mensah"
                    style={{ width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1a56db'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="james@business.com"
                    style={{ width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1a56db'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Role</label>
                <div style={{ position: 'relative' }}>
                  <Shield style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                    {ROLES[user.tierType]?.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSend} disabled={!name || !email || !role}
                style={{ height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #1a56db, #4f46e5)', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: name && email && role ? 'pointer' : 'not-allowed', opacity: name && email && role ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(26,86,219,0.3)' }}>
                <Send style={{ width: '16px', height: '16px' }} />Send invitation
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
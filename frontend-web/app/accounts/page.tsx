"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Mail, Shield, UserPlus, Crown } from "lucide-react"

const ACCOUNT_LIMITS: Record<string, Record<string, number>> = {
  MANUFACTURER: { STANDARD: 5, PREMIUM: 10 },
  WHOLESALER: { STANDARD: 6, PREMIUM: 8 },
  RETAILER: { STANDARD: 2, PREMIUM: 5 },
}

const ROLES: Record<string, { admin: string; staff: string[] }> = {
  MANUFACTURER: { admin: "Company Admin", staff: ["Production Supervisor", "Store Keeper", "POS Operator"] },
  WHOLESALER: { admin: "Warehouse Admin", staff: ["Receiving Staff", "Sales Staff"] },
  RETAILER: { admin: "Shop Owner", staff: ["Shop Staff"] },
}

const TIER_COLORS: Record<string, { gradient: string; light: string; text: string }> = {
  MANUFACTURER: { gradient: 'linear-gradient(135deg, #1a56db, #4f46e5)', light: '#eff6ff', text: '#1a56db' },
  WHOLESALER: { gradient: 'linear-gradient(135deg, #d97706, #ea580c)', light: '#fffbeb', text: '#d97706' },
  RETAILER: { gradient: 'linear-gradient(135deg, #059669, #10b981)', light: '#ecfdf5', text: '#059669' },
}

export default function AccountsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  const tier = user.tierType || "RETAILER"
  const plan = user.subscriptionPlan || "STANDARD"
  const limit = ACCOUNT_LIMITS[tier]?.[plan] ?? 1
  const roleConfig = ROLES[tier] ?? { admin: "Admin", staff: ["Staff"] }
  const domain = user.email?.includes("@") ? user.email.split("@")[1] : "business.com"
  const tc = TIER_COLORS[tier] || TIER_COLORS.RETAILER

  const accounts: { name: string; role: string; email: string; isAdmin: boolean }[] = [
    { name: user.name || "You", role: roleConfig.admin, email: user.email, isAdmin: true }
  ]
  let roleIndex = 0
  while (accounts.length < limit) {
    const role = roleConfig.staff[roleIndex % roleConfig.staff.length]
    accounts.push({ name: role, role, email: `${role.toLowerCase().replace(/ /g, ".")}${accounts.length}@${domain}`, isAdmin: false })
    roleIndex++
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => router.push("/dashboard")} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
            </button>
            <div>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Sub-accounts</p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>{accounts.length} of {limit} accounts used</p>
            </div>
          </div>
         <button onClick={() => {
  if (accounts.length >= limit) {
    alert(`You have reached the maximum ${limit} accounts for your ${plan} plan. Upgrade to Premium to add more team members.`)
    return
  }
  router.push("/invite")
}} style={{
  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
  borderRadius: '12px', background: tc.gradient, color: '#ffffff',
  fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
}}>
  <UserPlus style={{ width: '14px', height: '14px' }} />Invite member
</button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Plan summary card */}
        <div style={{ background: tc.gradient, borderRadius: '20px', padding: '24px 28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tier} · {plan}</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>{accounts.length} / {limit} accounts</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{limit - accounts.length} slots remaining</p>
            </div>
            <div style={{ display: 'flex', gap: '-8px' }}>
              {accounts.slice(0, 4).map((_, i) => (
                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? '-8px' : 0, fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {accounts[i].name.charAt(0).toUpperCase()}
                </div>
              ))}
              {accounts.length > 4 && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-8px', fontSize: '10px', fontWeight: 700, color: '#ffffff' }}>
                  +{accounts.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accounts list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {accounts.map((acc, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
              border: acc.isAdmin ? `1px solid ${tc.text}30` : '1px solid #f1f5f9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', gap: '16px',
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: acc.isAdmin ? tc.gradient : '#f8fafc',
                border: acc.isAdmin ? 'none' : '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontWeight: 700, fontSize: '15px',
                color: acc.isAdmin ? '#ffffff' : '#64748b'
              }}>
                {acc.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{acc.isAdmin ? `${acc.name} (You)` : acc.name}</p>
                  {acc.isAdmin && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: tc.light, color: tc.text }}>
                      <Crown style={{ width: '10px', height: '10px' }} />Admin
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail style={{ width: '11px', height: '11px' }} />{acc.email}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  {acc.role}
                </span>
                {!acc.isAdmin && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Shield style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: limit - accounts.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
              border: '1.5px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = tc.text}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1.5px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus style={{ width: '18px', height: '18px', color: '#cbd5e1' }} />
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Empty slot — invite a team member</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
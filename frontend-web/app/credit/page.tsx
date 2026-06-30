"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, Calendar, Lock, CheckCircle, TrendingDown } from "lucide-react"

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  OVERDUE: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  DUE_SOON: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  OUTSTANDING: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  SETTLED: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
}

const getCreditForTier = (tier?: string) => {
  if (tier === "MANUFACTURER") return [
    { name: "Apex Distributors", due: "Jun 30, 2026", amount: 42000, status: "DUE_SOON", held: false },
    { name: "Sunrise Wholesale", due: "Jun 15, 2026", amount: 68000, status: "OVERDUE", held: false },
    { name: "Delta Trading Co", due: "Jul 10, 2026", amount: 14800, status: "OUTSTANDING", held: false },
    { name: "Metro Distributors", due: "May 30, 2026", amount: 22000, status: "SETTLED", held: false },
  ]
  if (tier === "WHOLESALER") return [
    { name: "Bright Mart Retail", due: "Jun 30, 2026", amount: 4200, status: "DUE_SOON", held: false },
    { name: "Sunrise Shop", due: "Jun 15, 2026", amount: 6800, status: "OVERDUE", held: false },
    { name: "Delta Stores", due: "Jul 10, 2026", amount: 1480, status: "OUTSTANDING", held: false },
  ]
  return [
    { name: "John Mensah", due: "Jun 30, 2026", amount: 120, status: "DUE_SOON", held: false },
    { name: "Abena Asante", due: "Jun 15, 2026", amount: 85.5, status: "OVERDUE", held: false },
    { name: "Kofi Boateng", due: "Jul 10, 2026", amount: 200, status: "OUTSTANDING", held: false },
  ]
}

export default function CreditPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [tab, setTab] = useState<"owe_me" | "i_owe">("owe_me")

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    setAccounts(getCreditForTier(u.tierType))
  }, [])

  if (!user) return null

  const displayed = accounts
  const total = displayed.reduce((sum, a) => sum + a.amount, 0)
  const overdue = displayed.filter(a => a.status === "OVERDUE").reduce((sum, a) => sum + a.amount, 0)

  const toggleHold = (index: number) => {
    setAccounts(prev => prev.map((a, i) => i === index ? { ...a, held: !a.held } : a))
  }

  const recordPayment = (index: number) => {
    if (window.confirm(`Mark ${accounts[index].name}'s balance as settled?`)) {
      setAccounts(prev => prev.map((a, i) => i === index ? { ...a, status: 'SETTLED', held: false } : a))
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px', gap: '14px' }}>
          <button onClick={() => router.push("/dashboard")} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
          </button>
          <div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Credit accounts</p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>{displayed.length} accounts · ${total.toLocaleString()} total</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: "Total outstanding", value: `$${total.toLocaleString()}`, color: '#1a56db', bg: '#eff6ff', icon: Wallet },
            { label: "Overdue", value: `$${overdue.toLocaleString()}`, color: '#dc2626', bg: '#fef2f2', icon: TrendingDown },
            { label: "Accounts", value: String(displayed.length), color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon style={{ width: '14px', height: '14px', color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
          {[{ key: 'owe_me', label: 'They owe me' }, { key: 'i_owe', label: 'I owe them' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: '8px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              backgroundColor: tab === t.key ? '#ffffff' : 'transparent',
              color: tab === t.key ? '#0f172a' : '#64748b',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map((acc, i) => {
            const sc = STATUS_CONFIG[acc.status]
            const showActions = acc.status !== 'SETTLED'
            return (
              <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: `1px solid ${acc.held ? '#fecaca' : '#f1f5f9'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wallet style={{ width: '18px', height: '18px', color: sc.text }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{acc.name}</p>
                      {acc.held && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>On hold</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar style={{ width: '11px', height: '11px' }} />Due {acc.due}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>${acc.amount.toLocaleString()}</p>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                      {acc.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {showActions && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={() => recordPayment(i)} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle style={{ width: '13px', height: '13px' }} />Record payment
                    </button>
                    <button onClick={() => toggleHold(i)} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: acc.held ? '#dc2626' : '#fef2f2', border: `1px solid ${acc.held ? '#dc2626' : '#fecaca'}`, color: acc.held ? '#ffffff' : '#dc2626', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Lock style={{ width: '13px', height: '13px' }} />{acc.held ? 'Remove hold' : 'Place hold'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Calendar, TrendingUp, Download } from "lucide-react"




const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PAID: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', dot: '#059669' },
  UNPAID: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', dot: '#94a3b8' },
  OVERDUE: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', dot: '#dc2626' },
}

const getInvoicesForTier = (tier?: string) => {
  if (tier === "MANUFACTURER") return [
    { id: "INV-001", party: "Apex Distributors", date: "Jun 26, 2026", amount: 42000, status: "PAID" },
    { id: "INV-002", party: "Sunrise Wholesale", date: "Jun 20, 2026", amount: 28500, status: "UNPAID" },
    { id: "INV-003", party: "Delta Trading Co", date: "Jun 15, 2026", amount: 14800, status: "OVERDUE" },
    { id: "INV-004", party: "Metro Distributors", date: "Jun 10, 2026", amount: 22000, status: "PAID" },
  ]
  if (tier === "WHOLESALER") return [
    { id: "INV-101", party: "Bright Mart Retail", date: "Jun 26, 2026", amount: 2800, status: "PAID" },
    { id: "INV-102", party: "Delta Stores", date: "Jun 22, 2026", amount: 1400, status: "UNPAID" },
    { id: "INV-103", party: "City Mart", date: "Jun 18, 2026", amount: 3200, status: "OVERDUE" },
  ]
  return [
    { id: "INV-201", party: "John Mensah", date: "Jun 26, 2026", amount: 45, status: "PAID" },
    { id: "INV-202", party: "Abena Asante", date: "Jun 24, 2026", amount: 85.5, status: "UNPAID" },
    { id: "INV-203", party: "Kofi Boateng", date: "Jun 20, 2026", amount: 120, status: "OVERDUE" },
  ]
}

export default function InvoicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  const allInvoices = getInvoicesForTier(user.tierType)
  const filtered = filter === "ALL" ? allInvoices : allInvoices.filter(i => i.status === filter)
  const total = allInvoices.reduce((sum, i) => sum + i.amount, 0)
  const paid = allInvoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0)
  const outstanding = allInvoices.filter(i => i.status !== "PAID").reduce((sum, i) => sum + i.amount, 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => router.push("/dashboard")} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
            </button>
            <div>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Invoices</p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>{allInvoices.length} invoices total</p>
            </div>
          </div>
          <button onClick={() => router.push("/invoices/print")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a56db, #4f46e5)', color: '#ffffff', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,86,219,0.3)' }}>
  <Download style={{ width: '14px', height: '14px' }} />Export
</button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: "Total invoiced", value: `$${total.toLocaleString()}`, icon: FileText, color: '#1a56db', bg: '#eff6ff' },
            { label: "Paid", value: `$${paid.toLocaleString()}`, icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
            { label: "Outstanding", value: `$${outstanding.toLocaleString()}`, icon: Calendar, color: '#dc2626', bg: '#fef2f2' },
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

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {["ALL", "PAID", "UNPAID", "OVERDUE"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              backgroundColor: filter === f ? '#0f172a' : '#ffffff',
              color: filter === f ? '#ffffff' : '#64748b',
              boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(inv => {
            const sc = STATUS_CONFIG[inv.status]
            return (
              <div key={inv.id} style={{
                backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
                border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', gap: '16px',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText style={{ width: '18px', height: '18px', color: '#64748b' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{inv.party}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '11px', height: '11px' }} />{inv.date} · <span style={{ fontFamily: 'monospace' }}>{inv.id}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>${inv.amount.toLocaleString()}</p>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                    {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, AlertTriangle, CreditCard, ShoppingCart, LogOut, DollarSign, Factory, Users, FileText, Smartphone, Store, TrendingUp, ArrowRight, Bell } from "lucide-react"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#d1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#d2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="d1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="d2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    const token = localStorage.getItem("sf_token")
    if (!stored || !token) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetch(`${API_BASE_URL}/reports/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("sf_token")
    localStorage.removeItem("sf_user")
    router.replace("/login")
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const tier = user?.tierType || "RETAILER"
  const initials = user?.name ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "U"

  const tierColors: Record<string, { gradient: string; light: string; text: string }> = {
    MANUFACTURER: { gradient: 'linear-gradient(135deg, #1a56db, #4f46e5)', light: '#eff6ff', text: '#1a56db' },
    WHOLESALER: { gradient: 'linear-gradient(135deg, #d97706, #ea580c)', light: '#fffbeb', text: '#d97706' },
    RETAILER: { gradient: 'linear-gradient(135deg, #059669, #10b981)', light: '#ecfdf5', text: '#059669' },
  }
  const tc = tierColors[tier] || tierColors.RETAILER

  const statsByTier: Record<string, { title: string; value: string; icon: any; color: string; bg: string }[]> = {
    MANUFACTURER: [
      { title: "Raw Materials", value: data?.totalMaterials != null ? String(data.totalMaterials) : "—", icon: Package, color: '#1a56db', bg: '#eff6ff' },
      { title: "Low Stock", value: data?.lowStockCount != null ? String(data.lowStockCount) : "—", icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
      { title: "Production Runs", value: data?.productionRunsThisMonth != null ? String(data.productionRunsThisMonth) : "—", icon: Factory, color: '#059669', bg: '#ecfdf5' },
      { title: "Credit Owed", value: data?.totalCreditOwedByWholesalers != null ? `$${Number(data.totalCreditOwedByWholesalers).toFixed(2)}` : "$0.00", icon: CreditCard, color: '#dc2626', bg: '#fef2f2' },
    ],
    WHOLESALER: [
      { title: "Warehouse Stock", value: data?.totalStockItems != null ? String(data.totalStockItems) : "—", icon: Package, color: '#1a56db', bg: '#eff6ff' },
      { title: "Credit Owed", value: data?.totalCreditOwedByRetailers != null ? `$${Number(data.totalCreditOwedByRetailers).toFixed(2)}` : "$0.00", icon: CreditCard, color: '#dc2626', bg: '#fef2f2' },
      { title: "Today's Sales", value: data?.todaySalesUsd != null ? `$${Number(data.todaySalesUsd).toFixed(2)}` : "$0.00", icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
      { title: "Active Retailers", value: data?.activeRetailers != null ? String(data.activeRetailers) : "—", icon: Users, color: '#d97706', bg: '#fffbeb' },
    ],
    RETAILER: [
      { title: "Today's Sales", value: data?.todaySalesUsd != null ? `$${Number(data.todaySalesUsd).toFixed(2)}` : "$0.00", icon: ShoppingCart, color: '#059669', bg: '#ecfdf5' },
      { title: "Low Stock", value: data?.lowStockCount != null ? String(data.lowStockCount) : "—", icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
      { title: "Credit Owed", value: data?.totalCreditOwedByCustomers != null ? `$${Number(data.totalCreditOwedByCustomers).toFixed(2)}` : "$0.00", icon: CreditCard, color: '#dc2626', bg: '#fef2f2' },
      { title: "Total Products", value: data?.totalProducts != null ? String(data.totalProducts) : "—", icon: Package, color: '#1a56db', bg: '#eff6ff' },
    ],
  }

  const stats = statsByTier[tier] || statsByTier.RETAILER

  const quickLinks = [
    { label: "Sub-accounts", icon: Users, desc: "Manage your team", href: "/accounts", color: '#1a56db', bg: '#eff6ff' },
    { label: "Invoices", icon: FileText, desc: "View & generate", href: "/invoices", color: '#d97706', bg: '#fffbeb' },
    { label: "Credit accounts", icon: CreditCard, desc: "Track balances", href: "/credit", color: '#dc2626', bg: '#fef2f2' },
    { label: "Marketplace", icon: Store, desc: "Find partners", href: "/marketplace", color: '#059669', bg: '#ecfdf5' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Logo />
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{user?.businessName || "Dashboard"}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>{tier.toLowerCase()} · {user?.subscriptionPlan} · {user?.subscriptionStatus}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/notifications" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none' }}>
              <Bell style={{ width: '16px', height: '16px', color: '#64748b' }} />
            </Link>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: tc.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>{initials}</div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
              <LogOut style={{ width: '14px', height: '14px' }} />Log out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Trial banner */}
        {user?.subscriptionStatus === "TRIAL" && (
          <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#92400e', fontWeight: 500 }}>Your 14-day free trial is active. Your data is always safe, even after the trial ends.</p>
            </div>
            <Link href="/pricing" style={{ fontSize: '13px', color: '#d97706', fontWeight: 700, textDecoration: 'none' }}>View plans →</Link>
          </div>
        )}

        {/* Hero card */}
        <div style={{ background: tc.gradient, borderRadius: '24px', padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '40%', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Good to have you back</p>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>{user?.name || "Welcome"}</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{user?.businessName} · {tier.toLowerCase()} account</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {stats.map(s => (
            <div key={s.title} style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.title}</p>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Mobile app banner */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Smartphone style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '15px', marginBottom: '4px' }}>Day-to-day operations happen on the mobile app</p>
            <p style={{ fontSize: '13px', color: '#475569' }}>POS, inventory, production, and credit accounts are managed from your phone. This web dashboard is your business overview.</p>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Manage your business</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {quickLinks.map(link => (
              <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = link.color; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.06)` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <link.icon style={{ width: '18px', height: '18px', color: link.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>{link.label}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{link.desc}</p>
                  </div>
                  <ArrowRight style={{ width: '14px', height: '14px', color: '#cbd5e1' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
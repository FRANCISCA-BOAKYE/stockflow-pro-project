"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell } from "lucide-react"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

const TYPE_CONFIG: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', color: '#d97706' },
  success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '✓', color: '#059669' },
  info: { bg: '#eff6ff', border: '#bfdbfe', icon: 'i', color: '#1a56db' },
  error: { bg: '#fef2f2', border: '#fecaca', icon: '!', color: '#dc2626' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    buildNotifications(u)
  }, [])

  const buildNotifications = async (u: any) => {
    const items: any[] = []
    try {
      const token = localStorage.getItem("sf_token")
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`

      if (u.tierType === "RETAILER") {
        const res = await fetch(`${API_BASE_URL}/retailer/products/low-stock`, { headers })
        const lowStock = await res.json()
        ;(Array.isArray(lowStock) ? lowStock : []).forEach((p: any) => {
          items.push({ id: `low-${p.id}`, title: "Low stock alert", body: `${p.name} is below reorder level (${p.quantity} ${p.unit} remaining)`, time: "Now", type: "warning", read: false })
        })
      }

      if (u.tierType === "MANUFACTURER") {
        const res = await fetch(`${API_BASE_URL}/manufacturer/materials`, { headers })
        const mats = await res.json()
        ;(Array.isArray(mats) ? mats : []).filter((m: any) => m.quantity < m.minThreshold).forEach((m: any) => {
          items.push({ id: `mat-${m.id}`, title: "Low material alert", body: `${m.name} is below threshold (${m.quantity} ${m.unit} remaining)`, time: "Now", type: "warning", read: false })
        })
      }

      const creditRes = await fetch(`${API_BASE_URL}/credit/overdue`, { headers })
      const overdue = await creditRes.json()
      ;(Array.isArray(overdue) ? overdue : []).forEach((c: any) => {
        items.push({ id: `credit-${c.id}`, title: "Credit overdue", body: `${c.debtorBusinessName} owes $${Number(c.amountUsd).toFixed(2)} — overdue since ${new Date(c.dueDate).toLocaleDateString()}`, time: "Now", type: "error", read: false })
      })

      const linksRes = await fetch(`${API_BASE_URL}/links/partners`, { headers })
      const links = await linksRes.json()
      ;(Array.isArray(links) ? links : []).filter((l: any) => l.status === "PENDING").forEach((l: any) => {
        items.push({ id: `link-${l.id}`, title: "New link request", body: `${l.requesterBusiness?.name || "A business"} wants to link with your business`, time: "Now", type: "info", read: false })
      })

    } catch (e) {
      console.log("Error building notifications:", e)
    } finally {
      setLoading(false)
    }
    setNotifications(items)
  }

  if (!user) return null

  const unread = notifications.filter(n => !n.read).length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', height: '64px' }}>
          <button onClick={() => router.push("/dashboard")} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <Bell style={{ width: '18px', height: '18px', color: '#0f172a' }} />
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Notifications</p>
            {unread > 0 && <span style={{ backgroundColor: '#1a56db', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{unread}</span>}
          </div>
          {unread > 0 && (
            <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              style={{ fontSize: '13px', color: '#1a56db', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <Bell style={{ width: '40px', height: '40px', margin: '0 auto 12px', color: '#d1d5db' }} />
            <p style={{ fontWeight: 600, color: '#374151' }}>All caught up!</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>No alerts right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => {
              const tc = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
              return (
                <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  style={{
                    backgroundColor: n.read ? '#ffffff' : tc.bg,
                    border: `1px solid ${n.read ? '#f1f5f9' : tc.border}`,
                    borderRadius: '16px', padding: '20px', cursor: 'pointer',
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '14px', color: tc.color }}>
                    {tc.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{n.title}</p>
                      {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a56db', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>{n.body}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{n.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

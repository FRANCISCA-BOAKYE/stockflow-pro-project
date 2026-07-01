"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

const getNotificationsForTier = (tier?: string) => {
  if (tier === "MANUFACTURER") return [
    { id: "1", title: "Low stock alert", body: "Steel Rods 6mm is below reorder level", time: "2 min ago", type: "warning", read: false },
    { id: "2", title: "Payment received", body: "Apex Distributors paid $42,000 for INV-001", time: "1 hour ago", type: "success", read: false },
    { id: "3", title: "Production complete", body: "Production run #24 completed — 500 units", time: "Yesterday", type: "success", read: true },
  ]
  if (tier === "WHOLESALER") return [
    { id: "1", title: "New bulk order", body: "Bright Mart placed an order of $2,800", time: "5 min ago", type: "info", read: false },
    { id: "2", title: "Stock received", body: "500 cases received from BevCo Ltd", time: "2 hours ago", type: "success", read: false },
    { id: "3", title: "Credit overdue", body: "Sunrise Shop credit of $6,800 is overdue", time: "Yesterday", type: "error", read: true },
  ]
  return [
    { id: "1", title: "Low stock alert", body: "Mineral Water 1L is below reorder level", time: "10 min ago", type: "warning", read: false },
    { id: "2", title: "Sale completed", body: "New sale of $45.00 recorded", time: "1 hour ago", type: "success", read: false },
    { id: "3", title: "Credit payment received", body: "John Mensah paid $50.00", time: "Yesterday", type: "success", read: true },
  ]
}

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

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    setNotifications(getNotificationsForTier(u.tierType))
  }, [])

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => {
            const tc = TYPE_CONFIG[n.type]
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
      </main>
    </div>
  )
}
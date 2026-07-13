"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

const TYPE_CONFIG: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', color: '#d97706' },
  success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '✓', color: '#059669' },
  info: { bg: '#eff6ff', border: '#bfdbfe', icon: 'i', color: '#1a56db' },
  error: { bg: '#fef2f2', border: '#fecaca', icon: '!', color: '#dc2626' },
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    setUser(JSON.parse(stored))
    fetchNotifications()
  }, [])

  const authHeaders = () => {
    const token = localStorage.getItem("sf_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, { headers: authHeaders() })
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      console.log("Error fetching notifications:", e)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "POST", headers: authHeaders() })
    } catch (e) {
      console.log("Error marking notification read:", e)
    }
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, { method: "POST", headers: authHeaders() })
    } catch (e) {
      console.log("Error marking all notifications read:", e)
    }
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
            <button onClick={markAllRead}
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
                <div key={n.id} onClick={() => !n.read && markRead(n.id)}
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
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{timeAgo(n.createdAt)}</p>
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

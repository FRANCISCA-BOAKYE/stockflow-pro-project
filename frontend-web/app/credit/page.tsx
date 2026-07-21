"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, Calendar, Lock, CheckCircle, TrendingDown, Phone, MapPin, Trash2, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { toast } from "sonner"

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  OVERDUE: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  DUE_SOON: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  OUTSTANDING: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  SETTLED: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
}

export default function CreditPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"owe_me" | "i_owe">("owe_me")
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetchCreditAccounts(u)
  }, [])

  const fetchCreditAccounts = async (u: any) => {
    try {
      const token = localStorage.getItem("sf_token")
      const res = await fetch(`${API_BASE_URL}/credit/accounts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setAccounts(Array.isArray(data) ? data : [])
    } catch (e) {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !deletePassword.trim()) return
    setDeleting(true)
    try {
      const token = localStorage.getItem("sf_token")
      const res = await fetch(`${API_BASE_URL}/credit/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: deletePassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.message || "Failed to delete record")
      }
      toast.success("Credit record deleted")
      setDeleteTarget(null)
      setDeletePassword("")
      fetchCreditAccounts(user)
    } catch (e: any) {
      toast.error(e.message || "Failed to delete record")
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  const displayed = accounts.filter(a => a.direction === (tab === "owe_me" ? "OWED_TO_ME" : "I_OWE"))
  const total = displayed.reduce((sum, a) => sum + Number(a.amountUsd || 0), 0)
  const overdue = displayed.filter(a => (a.status === "OVERDUE")).reduce((sum, a) => sum + Number(a.amountUsd || 0), 0)

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Loading...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <Wallet style={{ width: '40px', height: '40px', margin: '0 auto 12px', color: '#d1d5db' }} />
            <p style={{ fontWeight: 600, color: '#374151' }}>No credit accounts yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Credit accounts appear when you transact on credit</p>
          </div>
        ) : (
          <>
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
                const name = acc.partnerBusinessName || 'Account'
                const due = acc.dueDate ? new Date(acc.dueDate).toLocaleDateString() : 'N/A'
                const amount = Number(acc.amountUsd || 0)
                const status = acc.status || 'OUTSTANDING'
                const sc = STATUS_CONFIG[status] || STATUS_CONFIG.OUTSTANDING
                return (
                  <div key={acc.id || i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Wallet style={{ width: '18px', height: '18px', color: sc.text }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{name}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '11px', height: '11px' }} />Due {due}
                        </p>
                        {acc.debtorContact && (
                          <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Phone style={{ width: '11px', height: '11px' }} />{acc.debtorContact}
                          </p>
                        )}
                        {acc.debtorAddress && (
                          <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <MapPin style={{ width: '11px', height: '11px' }} />{acc.debtorAddress}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>${amount.toLocaleString()}</p>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      {tab === 'owe_me' && (
                        <button onClick={() => { setDeleteTarget(acc); setDeletePassword("") }}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #f1f5f9', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                          title="Delete record">
                          <Trash2 style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Delete Credit Record</p>
              <button onClick={() => setDeleteTarget(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                <X style={{ width: '18px', height: '18px', color: '#64748b' }} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#dc2626', marginBottom: '16px', lineHeight: '1.5' }}>
              This permanently removes the credit record for {deleteTarget.partnerBusinessName}
              (${Number(deleteTarget.amountUsd || 0).toLocaleString()}). This cannot be undone.
            </p>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Enter your password to confirm</label>
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              placeholder="Your account password"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleDelete}
              disabled={deleting || !deletePassword.trim()}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: deleting || !deletePassword.trim() ? 'not-allowed' : 'pointer', opacity: deleting || !deletePassword.trim() ? 0.6 : 1 }}
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

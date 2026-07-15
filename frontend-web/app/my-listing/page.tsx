"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Megaphone, Lock } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api"

export default function MyListingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPremium, setIsPremium] = useState(true)
  const [form, setForm] = useState({
    headline: "", description: "", deliveryTerms: "", creditTerms: "",
    location: "", contactEmail: "", contactPhone: "",
  })

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    setIsPremium(u.subscriptionPlan === "PREMIUM")
    setForm(f => ({ ...f, contactEmail: u.email || "" }))

    const token = localStorage.getItem("sf_token")
    fetch(`${API_BASE_URL}/marketplace/my-listing`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(data => {
        if (data && data.exists !== false) {
          setForm({
            headline: data.headline || "",
            description: data.description || "",
            deliveryTerms: data.deliveryTerms || "",
            creditTerms: data.creditTerms || "",
            location: data.location || "",
            contactEmail: data.contactEmail || u.email || "",
            contactPhone: data.contactPhone || "",
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.headline.trim() || !form.location.trim() || !form.contactEmail.trim()) {
      toast.error("Headline, location and contact email are required.")
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem("sf_token")
      const res = await fetch(`${API_BASE_URL}/marketplace/listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || data.message || ""
        if (msg.toLowerCase().includes("premium")) { setIsPremium(false); return }
        throw new Error(msg)
      }
      toast.success("Your business is now listed on the marketplace.")
      router.push("/dashboard")
    } catch (e: any) {
      toast.error(e.message || "Could not save your listing.")
    } finally {
      setSaving(false)
    }
  }

  if (!user || loading) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px', gap: '14px' }}>
          <button onClick={() => router.push("/dashboard")} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
          </button>
          <div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Marketplace Listing</p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Let other businesses find and link with you</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
        {!isPremium ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
            <Lock style={{ width: '32px', height: '32px', color: '#c27803', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>Premium feature</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Listing your business on the marketplace requires a Premium subscription.</p>
            <button onClick={() => router.push("/pricing")} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1a56db, #4f46e5)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              View plans
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9' }}>
            {[
              { label: "Headline *", key: "headline", placeholder: "e.g. Quality baked goods, wholesale supply" },
              { label: "Description", key: "description", placeholder: "What you offer, capacity, specialties...", textarea: true },
              { label: "Delivery terms", key: "deliveryTerms", placeholder: "e.g. Nationwide delivery, 3-5 business days" },
              { label: "Credit terms", key: "creditTerms", placeholder: "e.g. 14-day credit for verified partners" },
              { label: "Location *", key: "location", placeholder: "e.g. Spintex, Accra" },
              { label: "Contact email *", key: "contactEmail", placeholder: "you@business.com" },
              { label: "Contact phone", key: "contactPhone", placeholder: "+233..." },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{field.label}</label>
                {field.textarea ? (
                  <textarea
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={4}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                ) : (
                  <input
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #1a56db, #4f46e5)', color: '#fff',
              fontWeight: 700, fontSize: '15px', cursor: 'pointer', opacity: saving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Megaphone style={{ width: '16px', height: '16px' }} />
              {saving ? "Saving..." : "Save & Publish"}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

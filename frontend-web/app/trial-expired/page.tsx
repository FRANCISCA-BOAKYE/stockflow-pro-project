"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, Clock, Check } from "lucide-react"
import { PaystackButton } from "@/components/paystack-button"

const PAYSTACK_KEY = "pk_test_6620d84161debea0ad30c0617bde2eea7de28051"

const PLANS_BY_TIER: Record<string, { name: string; price: number; features: string[] }[]> = {
  MANUFACTURER: [
    { name: "Standard", price: 80, features: ["5 sub-accounts", "Materials & recipes", "Production planning", "Credit tracking"] },
    { name: "Premium", price: 110, features: ["10 sub-accounts", "Everything in Standard", "Advanced reports", "Invoice generation"] },
  ],
  WHOLESALER: [
    { name: "Standard", price: 45, features: ["6 sub-accounts", "Warehouse management", "Credit tracking both ways", "Marketplace listing"] },
    { name: "Premium", price: 75, features: ["8 sub-accounts", "Everything in Standard", "Advanced reports", "Invoice generation"] },
  ],
  RETAILER: [
    { name: "Standard", price: 17, features: ["2 sub-accounts", "POS & inventory", "Credit tracking", "Low-stock alerts"] },
    { name: "Premium", price: 30, features: ["5 sub-accounts", "Everything in Standard", "Customer history", "Advanced reports"] },
  ],
}

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#te1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#te2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="te1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="te2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

export default function TrialExpiredPage() {
  const router = useRouter()
  const [tier, setTier] = useState("RETAILER")
  const [businessName, setBusinessName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (stored) {
      const u = JSON.parse(stored)
      setTier(u.tierType || "RETAILER")
      setBusinessName(u.businessName || "")
      setUserEmail(u.email || "")
    }
  }, [])

  const plans = PLANS_BY_TIER[tier] || PLANS_BY_TIER.RETAILER

  const handleLogout = () => {
    localStorage.removeItem("sf_token")
    localStorage.removeItem("sf_user")
    router.replace("/login")
  }

  const handlePaymentSuccess = (reference: string) => {
    alert(`Payment successful! Reference: ${reference}. Your account will be activated shortly.`)
    router.push("/dashboard")
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #0f1f4a 50%, #1a0533 100%)', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { w: 300, h: 300, top: '-80px', left: '-80px', color: 'rgba(59,130,246,0.1)' },
          { w: 200, h: 200, bottom: '10%', right: '-60px', color: 'rgba(99,102,241,0.1)' },
          { w: 150, h: 150, top: '40%', left: '5%', color: 'rgba(139,92,246,0.08)' },
        ].map((b, i) => (
          <div key={i} style={{ position: 'absolute', width: b.w, height: b.h, borderRadius: '50%', backgroundColor: b.color, top: b.top, left: b.left, right: (b as any).right, bottom: (b as any).bottom, filter: 'blur(40px)', animation: `float ${5 + i * 2}s ease-in-out infinite` }} />
        ))}
      </div>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <header style={{ position: 'relative', zIndex: 10, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>StockFlow Pro</span>
        </Link>
        <button onClick={handleLogout} style={{ fontSize: '13px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          Log out
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Clock style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
              {businessName ? `${businessName}'s` : "Your"} trial has ended
            </h1>
            <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '480px', margin: '0 auto 24px' }}>
              Your 14-day free trial is over. Choose a plan to restore full access instantly.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 24px', borderRadius: '16px', backgroundColor: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)', maxWidth: '500px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield style={{ width: '18px', height: '18px', color: '#34d399' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginBottom: '2px' }}>Your data is completely safe</p>
                <p style={{ fontSize: '12px', color: '#064e3b' }}>Nothing deleted. Full access returns the moment you subscribe.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {plans.map((plan, i) => (
              <div key={plan.name} style={{
                borderRadius: '20px', padding: '28px',
                background: i === 1 ? 'linear-gradient(135deg, #1a56db, #4f46e5)' : 'rgba(255,255,255,0.05)',
                border: i === 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {i === 1 && <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />}
                {i === 1 && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>Most popular</span>
                  </div>
                )}
                <p style={{ fontSize: '12px', fontWeight: 700, color: i === 1 ? 'rgba(255,255,255,0.6)' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{plan.name}</p>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff' }}>${plan.price}</span>
                  <span style={{ fontSize: '14px', color: i === 1 ? 'rgba(255,255,255,0.5)' : '#475569' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: i === 1 ? 'rgba(255,255,255,0.85)' : '#94a3b8' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '6px', backgroundColor: i === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(26,86,219,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check style={{ width: '10px', height: '10px', color: i === 1 ? '#ffffff' : '#1a56db' }} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <PaystackButton
                  email={userEmail || "user@business.com"}
                  amount={plan.price}
                  publicKey={PAYSTACK_KEY}
                  onSuccess={handlePaymentSuccess}
                  onClose={() => {}}
                  label={`Subscribe — $${plan.price}/month`}
                  style={{
                    backgroundColor: i === 1 ? '#ffffff' : 'rgba(255,255,255,0.08)',
                    color: i === 1 ? '#1a56db' : '#ffffff',
                    border: i === 1 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    background: i === 1 ? '#ffffff' : undefined,
                  }}
                />
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#334155' }}>
            Questions? Contact support · Your data is safe and waiting for you
          </p>
        </div>
      </main>
    </div>
  )
}
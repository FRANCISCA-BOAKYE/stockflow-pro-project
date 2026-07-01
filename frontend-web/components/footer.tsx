"use client"
import Link from "next/link"

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#f1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#f2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="f1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="f2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

export function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f1f4a 100%)', padding: '64px 24px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Logo />
              <span style={{ fontWeight: 700, fontSize: '17px', color: '#ffffff' }}>StockFlow Pro</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, maxWidth: '220px' }}>
              Integrated supply chain management for manufacturers, wholesalers, and retailers across Ghana.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              {['M', 'W', 'R'].map((t, i) => (
                <div key={t} style={{
                  width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#ffffff',
                  background: i === 0 ? 'linear-gradient(135deg,#1a56db,#4f46e5)' : i === 1 ? 'linear-gradient(135deg,#d97706,#ea580c)' : 'linear-gradient(135deg,#059669,#10b981)'
                }}>{t}</div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Platform</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Features', href: '/#features' },
                { label: 'How it works', href: '/#how-it-works' },
                { label: 'Marketplace', href: '/marketplace' },
                { label: 'Pricing', href: '/pricing' },
              ].map(link => (
                <Link key={link.label} href={link.href} style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e: any) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e: any) => e.target.style.color = '#94a3b8'}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Account</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Sign in', href: '/login' },
                { label: 'Start free trial', href: '/signup' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map(link => (
                <Link key={link.label} href={link.href} style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none' }}
                  onMouseEnter={(e: any) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e: any) => e.target.style.color = '#94a3b8'}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Business tiers</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Manufacturer', 'Wholesaler', 'Retailer'].map(t => (
                <span key={t} style={{ fontSize: '13px', color: '#94a3b8' }}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(26,86,219,0.1)', border: '1px solid rgba(26,86,219,0.2)' }}>
              <p style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 600, marginBottom: '6px' }}>14-day free trial</p>
              <p style={{ fontSize: '11px', color: '#475569' }}>No card required. Data always safe.</p>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: '24px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#334155' }}>© 2026 StockFlow Pro · Group 3 · All rights reserved.</p>
          <p style={{ fontSize: '12px', color: '#334155' }}>Built with care for Ghana's supply chain.</p>
        </div>
      </div>
    </footer>
  )
}
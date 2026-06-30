"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Pricing", href: "/pricing" },
]

const Logo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#nv1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#nv2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <path d="M71 16 L72 19 L75 20 L72 21 L71 24 L70 21 L67 20 L70 19 Z" fill="#60A5FA" opacity="0.8"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="nv1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1A56DB"/></linearGradient>
      <linearGradient id="nv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
    </defs>
  </svg>
)

function MobileMenu({ open, onClose, isLoggedIn, onLogout }: {
  open: boolean; onClose: () => void; isLoggedIn: boolean; onLogout: () => void
}) {
  if (!open) return null
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '380px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        padding: '28px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <Link href="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Logo />
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>StockFlow Pro</span>
          </Link>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
          </button>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Navigation</p>
          {navigation.map(item => (
            <Link key={item.name} href={item.href} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '14px',
              fontSize: '16px', fontWeight: 500, color: '#e2e8f0',
              textDecoration: 'none', marginBottom: '4px',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: '32px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={onClose} style={{
                display: 'block', textAlign: 'center', padding: '14px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #1a56db, #4f46e5)',
                color: '#ffffff', fontWeight: 600, textDecoration: 'none', fontSize: '15px',
                boxShadow: '0 4px 15px rgba(26,86,219,0.4)'
              }}>Dashboard</Link>
              <button onClick={onLogout} style={{
                padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                fontWeight: 500, cursor: 'pointer', fontSize: '15px', width: '100%'
              }}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={onClose} style={{
                display: 'block', textAlign: 'center', padding: '14px', borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0',
                fontWeight: 500, textDecoration: 'none', fontSize: '15px',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}>Sign in</Link>
              <Link href="/signup" onClick={onClose} style={{
                display: 'block', textAlign: 'center', padding: '14px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #1a56db, #4f46e5)',
                color: '#ffffff', fontWeight: 600, textDecoration: 'none', fontSize: '15px',
                boxShadow: '0 4px 15px rgba(26,86,219,0.4)'
              }}>Start Free Trial</Link>
            </>
          )}
        </div>

        <div style={{ marginTop: '40px', padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center' }}>14-day free trial · No card required · Data always safe</p>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(!!localStorage.getItem("sf_token"))
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("sf_token")
    localStorage.removeItem("sf_user")
    setIsLoggedIn(false)
    setMobileMenuOpen(false)
    router.push("/login")
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border" style={{ zIndex: 9000 }}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-lg text-foreground">StockFlow Pro</span>
          </Link>
          <div className="flex lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2.5 text-muted-foreground">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:gap-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" asChild><Link href="/dashboard">Dashboard</Link></Button>
                <Button variant="ghost" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
                <Button asChild><Link href="/signup">Start Free Trial</Link></Button>
              </>
            )}
          </div>
        </nav>
      </header>
      {mounted && (
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}
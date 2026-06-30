"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
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

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { setIsLoggedIn(!!localStorage.getItem("sf_token")) }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("sf_token")
    localStorage.removeItem("sf_user")
    setIsLoggedIn(false)
    router.push("/login")
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border" style={{ zIndex: 9999 }}>
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

      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            style={{ zIndex: 10000 }}
          />
          <div
            className="lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-sm overflow-y-auto"
            style={{ backgroundColor: '#ffffff', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', zIndex: 10001 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Logo />
                  <span className="font-semibold text-lg">StockFlow Pro</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
              </div>
              <div className="space-y-2 mb-6">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} className="block px-3 py-2 text-base font-medium rounded-lg hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="space-y-3">
                {isLoggedIn ? (
                  <>
                    <Button className="w-full" asChild><Link href="/dashboard">Dashboard</Link></Button>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild><Link href="/login">Sign in</Link></Button>
                    <Button className="w-full" asChild><Link href="/signup">Start Free Trial</Link></Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
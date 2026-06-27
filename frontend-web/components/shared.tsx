"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
      <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
      <polygon points="45,22 66,33 45,44 24,33" fill="url(#nb1)" opacity="0.8"/>
      <polygon points="24,33 45,44 45,66 24,55" fill="url(#nb2)" opacity="0.6"/>
      <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
      <line x1="45" y1="22" x2="45" y2="14" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <line x1="24" y1="33" x2="16" y2="29" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <line x1="66" y1="33" x2="74" y2="29" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <path d="M71 16 L72 19 L75 20 L72 21 L71 24 L70 21 L67 20 L70 19 Z" fill="#60A5FA" opacity="0.8"/>
      <path d="M18 62 L19 64 L21 65 L19 66 L18 68 L17 66 L15 65 L17 64 Z" fill="#60A5FA" opacity="0.6"/>
      <path d="M76 54 L77 56 L79 57 L77 58 L76 60 L75 58 L73 57 L75 56 Z" fill="#60A5FA" opacity="0.5"/>
      <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
      <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
      <defs>
        <linearGradient id="nb1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60A5FA"/>
          <stop offset="100%" stopColor="#1A56DB"/>
        </linearGradient>
        <linearGradient id="nb2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#1E3A8A"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Pricing", href: "/pricing" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("sf_token"))
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-bold text-lg text-gray-900">StockFlow Pro</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(l => (
            <Link key={l.name} href={l.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
              {l.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.name} href={l.href} className="block text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>
              {l.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Link href="/login" className="block w-full text-center border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link href="/signup" className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium" onClick={() => setOpen(false)}>
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo size={32} />
              <span className="font-bold text-white">StockFlow Pro</span>
            </div>
            <p className="text-sm">Smarter supply chains, end to end.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-sm text-center">
          © {new Date().getFullYear()} StockFlow Pro. All rights reserved. · Group 3
        </div>
      </div>
    </footer>
  )
}

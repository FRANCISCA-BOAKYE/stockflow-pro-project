"use client"
import Link from "next/link"
import { ArrowRight, Compass, CircleUserRound, Layers } from "lucide-react"
import { GradientBlobs } from "@/components/gradient-blobs"

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

const COLUMNS = [
  {
    heading: "Platform",
    icon: Compass,
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Pricing", href: "/pricing" },
      { label: "Help", href: "/help" },
    ],
  },
  {
    heading: "Account",
    icon: CircleUserRound,
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Start free trial", href: "/signup" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0f1f4a 100%)" }}>
      <GradientBlobs variant="dark" className="opacity-40" />

      {/* Mini CTA strip — every page gets a chance to convert, not just the homepage */}
      <div className="relative border-b border-white/[0.06] px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ready to connect your supply chain?</h3>
            <p className="mt-1.5 text-sm text-slate-400">14-day free trial · No card required · Data always safe</p>
          </div>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 shrink-0 bg-white text-slate-950 text-sm font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
          >
            Start free trial
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:gap-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Logo />
                <span className="font-bold text-[17px] text-white">StockFlow Pro</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[220px]">
                Integrated supply chain management for manufacturers, wholesalers, and retailers across Ghana.
              </p>
              <div className="flex gap-2 mt-5">
                {["M", "W", "R"].map((t, i) => (
                  <div
                    key={t}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white transition-transform duration-300 hover:scale-110 hover:-translate-y-0.5"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg,#1a56db,#4f46e5)" : i === 1 ? "linear-gradient(135deg,#d97706,#ea580c)" : "linear-gradient(135deg,#059669,#10b981)",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {COLUMNS.map(col => (
              <div key={col.heading}>
                <div className="flex items-center gap-1.5 mb-4">
                  <col.icon className="h-3.5 w-3.5 text-slate-600" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{col.heading}</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <Link key={link.label} href={link.href} className="text-[13px] text-slate-400 hover:text-white transition-colors duration-200 w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <Layers className="h-3.5 w-3.5 text-slate-600" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business tiers</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {["Manufacturer", "Wholesaler", "Retailer"].map(t => (
                  <span key={t} className="text-[13px] text-slate-400">{t}</span>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-[11px] text-blue-400 font-semibold mb-1.5">14-day free trial</p>
                <p className="text-[11px] text-slate-500">No card required. Data always safe.</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.06] my-8" />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-slate-600">© 2026 StockFlow Pro · Group 3 · All rights reserved.</p>
            <p className="text-xs text-slate-600">Built with care for Ghana&apos;s supply chain.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

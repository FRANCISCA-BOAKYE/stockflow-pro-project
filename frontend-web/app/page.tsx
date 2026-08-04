import Link from "next/link"
import {
  ArrowRight, ArrowUpRight, Factory, Warehouse, Store,
  CreditCard, PackageSearch, ShoppingCart, Building2, ShieldCheck, BarChart3, Users, Link2,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { AnimatedCounter } from "@/components/animated-counter"
import { GradientBlobs } from "@/components/gradient-blobs"

const TIERS = [
  {
    num: "01",
    title: "Manufacturer",
    icon: Factory,
    gradient: "linear-gradient(135deg,#1a56db,#4f46e5)",
    desc: "Materials, recipes, and production planning with automatic calculation, finished goods tracking, and dispatch management.",
    features: ["Raw material tracking", "Recipe & production planning", "Finished goods inventory", "Dispatch management"],
  },
  {
    num: "02",
    title: "Wholesaler",
    icon: Warehouse,
    gradient: "linear-gradient(135deg,#d97706,#ea580c)",
    desc: "Warehouse stock management, receiving from manufacturers, selling to retailers, credit tracking in both directions.",
    features: ["Warehouse management", "Bulk receiving & dispatch", "Retailer credit tracking", "Linked partner network"],
  },
  {
    num: "03",
    title: "Retailer",
    icon: Store,
    gradient: "linear-gradient(135deg,#059669,#10b981)",
    desc: "Products, POS, stock tracking, and credit owed to wholesalers — everything a retail business needs daily.",
    features: ["Product inventory", "Point of sale (POS)", "Low stock alerts", "Customer credit accounts"],
  },
]

const FEATURES = [
  { title: "Credit tracking", icon: CreditCard, desc: "Every credit transaction reflects on both accounts automatically with due dates and overdue alerts." },
  { title: "Stock reservation", icon: PackageSearch, desc: "Prevents two accounts from selling the same unavailable stock simultaneously." },
  { title: "POS integration", icon: ShoppingCart, desc: "Point of sale connects directly to inventory in real time across all three tiers." },
  { title: "Marketplace", icon: Building2, desc: "Manufacturers and wholesalers list themselves so the right trading partners find each other." },
  { title: "Data safety", icon: ShieldCheck, desc: "Your data is never deleted, even after a trial expires. Full access returns instantly on subscription." },
  { title: "Dashboard reports", icon: BarChart3, desc: "Real-time KPIs per tier — inventory, sales, credit outstanding, and production runs." },
  { title: "Sub-accounts", icon: Users, desc: "Add team members with role-specific access. Retailers get 2–5, Manufacturers up to 10." },
  { title: "Tier linking", icon: Link2, desc: "Manufacturers link to wholesalers, wholesalers to retailers. Everyone sees their supply chain." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />
      <main>
        {/* Hero — mobile-first type scale so it never overflows a phone screen */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-8 pt-24 pb-16 overflow-hidden">
          <GradientBlobs variant="light" />
          <div className="relative mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 mb-5 sm:mb-8 px-3.5 py-1.5 rounded-full border border-blue-100 bg-blue-50/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <p className="text-xs sm:text-sm font-medium text-blue-700 tracking-wide">
                Built for Ghana&apos;s supply chain
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-slate-950 leading-[1.05] sm:leading-[0.95]">
              The supply chain,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                connected.
              </span>
            </h1>
            <p className="mt-5 sm:mt-10 text-base sm:text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
              One platform for manufacturers, wholesalers, and retailers — production, credit, POS, and a marketplace to find trading partners.
            </p>
            <div className="mt-7 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/signup"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-slate-950 text-white text-sm sm:text-base font-medium px-7 py-3.5 sm:px-9 sm:py-4 rounded-full shadow-lg shadow-slate-950/10 hover:bg-blue-600 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Start 14-day free trial
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-base font-medium text-slate-500 px-7 py-3.5 sm:px-9 sm:py-4 rounded-full border border-slate-200 hover:border-slate-950 hover:text-slate-950 hover:-translate-y-0.5 transition-all duration-300"
              >
                Browse marketplace
              </Link>
            </div>
            <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-slate-400">No credit card required · Data always safe · Cancel anytime</p>
          </div>

          <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-slate-300">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-slate-300 to-transparent" />
          </div>
        </section>

        {/* Stats — elevated cards with hover lift instead of flat dividers */}
        <section className="relative border-y border-slate-100 py-12 sm:py-20 px-6 lg:px-8 overflow-hidden">
          <GradientBlobs variant="light" className="opacity-60" />
          <div className="relative mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: 3, label: "Business tiers" },
              { value: 14, suffix: "-day", label: "Free trial" },
              { value: 0, prefix: "$", label: "Due today" },
              { value: 100, suffix: "%", label: "Data safe" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delayMs={i * 100}>
                <div className="text-center py-5 px-3 sm:py-8 sm:px-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-400 uppercase tracking-wide">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Tiers — real cards with a gradient icon badge, hover lift */}
        <section id="features" className="py-16 sm:py-24 lg:py-32 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tight max-w-2xl">
                One platform, three connected tiers
              </h2>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-400 max-w-xl font-light">
                Every tier sees exactly what it needs. Nothing more, nothing less.
              </p>
            </ScrollReveal>

            <div className="mt-10 sm:mt-16 lg:mt-20 grid md:grid-cols-3 gap-5 sm:gap-6">
              {TIERS.map((tier, i) => (
                <ScrollReveal key={tier.title} delayMs={i * 80}>
                  <div className="group h-full rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                      <div
                        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ background: tier.gradient }}
                      >
                        <tier.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <span className="text-sm font-mono text-slate-300">{tier.num}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">{tier.title}</h3>
                    <p className="mt-3 text-slate-500 leading-relaxed text-sm">{tier.desc}</p>
                    <ul className="mt-5 sm:mt-6 space-y-2.5 border-t border-slate-100 pt-5 sm:pt-6">
                      {tier.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: tier.gradient }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features — dark, floating gradient blobs, real cards with icons */}
        <section className="relative py-16 sm:py-24 lg:py-32 px-6 lg:px-8 bg-slate-950 overflow-hidden">
          <GradientBlobs variant="dark" />
          <div className="relative mx-auto max-w-5xl">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-2xl">
                Built for how supply chains actually work
              </h2>
            </ScrollReveal>

            <div className="mt-10 sm:mt-16 lg:mt-20 grid md:grid-cols-2 gap-4 sm:gap-5">
              {FEATURES.map((f, i) => (
                <ScrollReveal key={f.title} delayMs={(i % 4) * 80}>
                  <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-sm hover:bg-white/[0.06] hover:border-blue-400/40 transition-all duration-300">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — gradient number badges instead of outlined numerals */}
        <section id="how-it-works" className="relative py-16 sm:py-24 lg:py-32 px-6 lg:px-8 overflow-hidden">
          <GradientBlobs variant="light" className="opacity-50" />
          <div className="relative mx-auto max-w-5xl">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tight text-center mb-10 sm:mb-16 lg:mb-24">
                Up and running in minutes
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-3 gap-5 sm:gap-8">
              {[
                { step: "01", title: "Choose your tier", desc: "Select Manufacturer, Wholesaler, or Retailer and pick Standard or Premium plan." },
                { step: "02", title: "Start free trial", desc: "14-day free trial from first login. No card required. Your data stays safe forever." },
                { step: "03", title: "Connect & operate", desc: "Link with trading partners and start tracking inventory, credit, and sales instantly." },
              ].map((s, i) => (
                <ScrollReveal key={s.step} delayMs={i * 120}>
                  <div className="group h-full rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110">
                      {s.step}
                    </div>
                    <h3 className="mt-4 sm:mt-5 font-bold text-slate-950 text-lg sm:text-xl">{s.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview — cards with hover lift, middle tier highlighted */}
        <section className="border-t border-slate-100 py-16 sm:py-24 lg:py-32 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tight mb-3 sm:mb-4">Simple, transparent pricing</h2>
              <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-16 font-light">Plans for every tier. All starting with a 14-day free trial.</p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-14">
              {[
                { tier: "Retailer", from: 17, featured: false },
                { tier: "Wholesaler", from: 45, featured: true },
                { tier: "Manufacturer", from: 80, featured: false },
              ].map((p, i) => (
                <ScrollReveal key={p.tier} delayMs={i * 100}>
                  <div
                    className={`relative h-full rounded-3xl p-6 sm:p-8 border transition-all duration-300 hover:-translate-y-1 ${
                      p.featured
                        ? "bg-slate-950 border-slate-950 shadow-xl hover:shadow-2xl"
                        : "bg-white border-slate-100 shadow-sm hover:shadow-lg"
                    }`}
                  >
                    {p.featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-blue-600 px-3 py-1 rounded-full">
                        Most popular
                      </span>
                    )}
                    <p className="text-xs sm:text-sm font-medium uppercase tracking-wide mb-2 sm:mb-3 text-slate-400">{p.tier}</p>
                    <p className={`text-4xl sm:text-5xl font-bold tracking-tight ${p.featured ? "text-white" : "text-slate-950"}`}>
                      ${p.from}<span className={`text-base sm:text-lg font-normal ${p.featured ? "text-slate-500" : "text-slate-400"}`}>/mo</span>
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-slate-950 border-b-2 border-slate-950 pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors">
              See full pricing <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* CTA — full bleed, floating gradient blobs for movement */}
        <section className="relative py-20 sm:py-28 lg:py-40 px-6 lg:px-8 bg-slate-950 overflow-hidden">
          <GradientBlobs variant="dark" />
          <ScrollReveal className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] sm:leading-[1.05]">
                Ready to connect your supply chain?
              </h2>
              <p className="mt-5 sm:mt-8 text-base sm:text-lg text-slate-400 font-light">14-day free trial, no card required.</p>
              <Link
                href="/signup"
                className="mt-8 sm:mt-12 inline-flex items-center gap-2 bg-white text-slate-950 text-sm sm:text-base font-medium px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-lg hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-blue-600/30 transition-all duration-300"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  )
}

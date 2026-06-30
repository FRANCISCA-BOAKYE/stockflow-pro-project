import Link from "next/link"
import { Factory, Truck, Store, CreditCard, Lock, ShoppingCart, Search, ArrowRight, Check, Star, Zap, BarChart3, Shield } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          </div>
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              Built for Ghana's supply chain
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              The supply chain,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                finally connected
              </span>
            </h1>
            <p className="mt-8 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              StockFlow Pro connects manufacturers, wholesalers, and retailers in one platform — production planning, credit tracking, POS, and a marketplace to find trading partners.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow" asChild>
                <Link href="/signup">Start 14-day free trial <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl" asChild>
                <Link href="/marketplace">Browse marketplace</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card required · Data always safe · Cancel anytime</p>
          </div>

          {/* Stats */}
          <div className="mx-auto max-w-4xl mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "3", label: "Business tiers" },
                { value: "14", label: "Day free trial" },
                { value: "$0", label: "Due today" },
                { value: "100%", label: "Data safe" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/80 backdrop-blur rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section id="features" className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900">One platform, three connected tiers</h2>
              <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Every tier sees exactly what it needs. Nothing more, nothing less.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Factory, title: "Manufacturer", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-blue-100", desc: "Materials, recipes, production planning with automatic calculation, finished goods tracking, and dispatch management.", features: ["Raw material tracking", "Recipe & production planning", "Finished goods inventory", "Dispatch management"] },
                { icon: Truck, title: "Wholesaler", color: "from-amber-500 to-orange-500", bg: "bg-amber-50", iconColor: "text-amber-600", border: "border-amber-100", desc: "Warehouse stock management, receiving from manufacturers, selling to retailers, credit tracking in both directions.", features: ["Warehouse management", "Bulk receiving & dispatch", "Retailer credit tracking", "Linked partner network"] },
                { icon: Store, title: "Retailer", color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100", desc: "Products, POS, stock tracking, and credit owed to wholesalers — everything a retail business needs daily.", features: ["Product inventory", "Point of sale (POS)", "Low stock alerts", "Customer credit accounts"] },
              ].map((tier) => (
                <div key={tier.title} className={`relative rounded-3xl border ${tier.border} bg-white p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`h-14 w-14 rounded-2xl ${tier.bg} flex items-center justify-center mb-6`}>
                    <tier.icon className={`h-7 w-7 ${tier.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{tier.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{tier.desc}</p>
                  <ul className="space-y-2">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className={`h-4 w-4 ${tier.iconColor} flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6 lg:px-8 bg-slate-900">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white">Built for how supply chains actually work</h2>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">Every feature solves a real problem businesses face daily.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: CreditCard, title: "Credit tracking", desc: "Every credit transaction reflects on both accounts automatically with due dates and overdue alerts.", color: "text-blue-400", bg: "bg-blue-400/10" },
                { icon: Lock, title: "Stock reservation", desc: "Prevents two accounts from selling the same unavailable stock simultaneously.", color: "text-purple-400", bg: "bg-purple-400/10" },
                { icon: ShoppingCart, title: "POS integration", desc: "Point of sale connects directly to inventory in real time across all three tiers.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                { icon: Search, title: "Marketplace", desc: "Manufacturers and wholesalers list themselves so the right trading partners find each other.", color: "text-amber-400", bg: "bg-amber-400/10" },
                { icon: Shield, title: "Data safety", desc: "Your data is never deleted, even after a trial expires. Full access returns instantly on subscription.", color: "text-rose-400", bg: "bg-rose-400/10" },
                { icon: BarChart3, title: "Dashboard reports", desc: "Real-time KPIs per tier — inventory, sales, credit outstanding, and production runs.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
                { icon: Zap, title: "Sub-accounts", desc: "Add team members with role-specific access. Retailers get 2–5, Manufacturers up to 10.", color: "text-orange-400", bg: "bg-orange-400/10" },
                { icon: Star, title: "Tier linking", desc: "Manufacturers link to wholesalers. Wholesalers link to retailers. Everyone sees their supply chain.", color: "text-pink-400", bg: "bg-pink-400/10" },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
                  <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900">Up and running in minutes</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 relative">
              <div className="hidden sm:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />
              {[
                { step: "01", title: "Choose your tier", desc: "Select Manufacturer, Wholesaler, or Retailer and pick Standard or Premium plan." },
                { step: "02", title: "Start free trial", desc: "14-day free trial from first login. No card required. Your data stays safe forever." },
                { step: "03", title: "Connect & operate", desc: "Link with trading partners and start tracking inventory, credit, and sales instantly." },
              ].map((s) => (
                <div key={s.step} className="text-center relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-lg shadow-blue-500/30">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-500 mb-12">Plans for every tier. All starting with a 14-day free trial.</p>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                { tier: "Retailer", from: 17, color: "emerald" },
                { tier: "Wholesaler", from: 45, color: "amber" },
                { tier: "Manufacturer", from: 80, color: "blue" },
              ].map((p) => (
                <div key={p.tier} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-semibold text-slate-700 mb-2">{p.tier}</p>
                  <p className="text-3xl font-bold text-slate-900">from ${p.from}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                </div>
              ))}
            </div>
            <Button size="lg" className="text-base px-8 py-6 rounded-xl" asChild>
              <Link href="/pricing">See full pricing <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 sm:p-16 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">Ready to connect your supply chain?</h2>
                <p className="text-blue-100 text-lg mb-8">Join businesses already using StockFlow Pro. 14-day free trial, no card required.</p>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-base px-8 py-6 rounded-xl font-semibold" asChild>
                  <Link href="/signup">Start free trial <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
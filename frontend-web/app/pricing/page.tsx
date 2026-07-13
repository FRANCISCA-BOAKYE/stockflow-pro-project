"use client"
import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, Zap, Store, Truck, Factory } from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PaystackButton } from "@/components/paystack-button"
import { priceGhs } from "@/lib/subscription-plans"

const PAYSTACK_KEY = "pk_test_6620d84161debea0ad30c0617bde2eea7de28051"

const PLANS = [
  {
    tier: "Retailer",
    icon: Store,
    gradient: "from-emerald-500 to-green-600",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    desc: "Perfect for shops and retail stores",
    plans: [
      { name: "Standard", price: 17, accounts: "2 sub-accounts", features: ["Full inventory management", "POS system", "Search & filtering", "Low-stock alerts", "Transaction history", "Credit tracking", "Dashboard"] },
      { name: "Premium", price: 30, accounts: "5 sub-accounts", features: ["Everything in Standard", "Stock reservation", "Priority support"] },
    ],
  },
  {
    tier: "Wholesaler",
    icon: Truck,
    gradient: "from-amber-500 to-orange-500",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    desc: "For distributors managing bulk inventory",
    plans: [
      { name: "Standard", price: 45, accounts: "6 sub-accounts", features: ["Full warehouse management", "POS system", "Credit tracking both ways", "Overdue alerts & credit holds", "Tier linking", "Marketplace listing"] },
      { name: "Premium", price: 75, accounts: "8 sub-accounts", features: ["Everything in Standard", "Email invoices", "Priority support"] },
    ],
  },
  {
    tier: "Manufacturer",
    icon: Factory,
    gradient: "from-blue-500 to-indigo-600",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    desc: "For production businesses managing materials",
    plans: [
      { name: "Standard", price: 80, accounts: "5 sub-accounts", features: ["Raw material management", "Recipe setup", "Production planning", "Finished goods tracking", "POS dispatch", "Credit tracking", "Marketplace listing"] },
      { name: "Premium", price: 110, accounts: "10 sub-accounts", features: ["Everything in Standard", "Email invoices", "Priority support"] },
    ],
  },
]

export default function PricingPage() {
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              Simple, transparent pricing
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">Pricing for<br />every tier</h1>
            <p className="text-xl text-blue-200 max-w-xl mx-auto mb-10">All prices in USD. Every business starts with a 14-day free trial — no card required.</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-300">
              {["No credit card required", "Data always safe", "Cancel anytime", "Full access on trial"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />{f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email input for payment */}
        <div className="bg-slate-100 py-6 px-6 text-center border-b border-slate-200">
          <p className="text-sm text-slate-600 mb-3 font-medium">Already have an account? Enter your email to pay directly:</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500"
            />
            {email && <span className="flex items-center px-4 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">Ready to pay</span>}
          </div>
        </div>

        {/* Plans */}
        <section className="py-24 px-6 lg:px-8 bg-slate-50">
          <div className="mx-auto max-w-7xl space-y-24">
            {PLANS.map((tierGroup) => (
              <div key={tierGroup.tier}>
                <div className="flex items-center gap-4 mb-10">
                  <div className={`h-14 w-14 rounded-2xl ${tierGroup.light} flex items-center justify-center shadow-sm`}>
                    <tierGroup.icon className={`h-7 w-7 ${tierGroup.text}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{tierGroup.tier}</h2>
                    <p className="text-slate-500 text-sm">{tierGroup.desc}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
                  {tierGroup.plans.map((plan, i) => (
                    <div key={plan.name} className={`relative rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${i === 1 ? `bg-gradient-to-br ${tierGroup.gradient}` : `bg-white border ${tierGroup.border}`}`}>
                      {i === 1 && (
                        <div className="absolute -top-4 left-8">
                          <span className="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">Most popular</span>
                        </div>
                      )}
                      <div className="mb-8">
                        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${i === 1 ? 'text-white/60' : 'text-slate-400'}`}>{plan.name}</p>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className={`text-6xl font-black ${i === 1 ? 'text-white' : 'text-slate-900'}`}>${plan.price}</span>
                          <span className={`text-base mb-2 ${i === 1 ? 'text-white/60' : 'text-slate-400'}`}>/month</span>
                        </div>
                        <p className={`text-sm ${i === 1 ? 'text-white/70' : 'text-slate-500'}`}>{plan.accounts} included</p>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${i === 1 ? 'bg-white/20' : tierGroup.light}`}>
                              <Check className={`h-3 w-3 ${i === 1 ? 'text-white' : tierGroup.text}`} />
                            </div>
                            <span className={i === 1 ? 'text-white/90' : 'text-slate-600'}>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Free trial button */}
                      <Link
                        href={`/signup?tier=${tierGroup.tier.toUpperCase()}&plan=${plan.name.toUpperCase()}`}
                        className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm transition-all mb-3 ${i === 1 ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-lg' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        Start free trial <ArrowRight className="h-4 w-4" />
                      </Link>

                      {/* Paystack pay now */}
                      <PaystackButton
                        email={email || "user@business.com"}
                        amount={priceGhs(tierGroup.tier.toUpperCase(), plan.name.toUpperCase())}
                        publicKey={PAYSTACK_KEY}
                        onSuccess={(ref) => toast.success(`Payment successful! Reference: ${ref}. Sign in to access your account.`)}
                        onClose={() => {}}
                        label={`Pay now — $${plan.price}/month`}
                        style={{
                          background: i === 1 ? 'rgba(255,255,255,0.15)' : 'rgba(26,86,219,0.08)',
                          color: i === 1 ? '#ffffff' : '#1a56db',
                          border: `1px solid ${i === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(26,86,219,0.2)'}`,
                          boxShadow: 'none',
                          fontSize: '13px',
                          padding: '11px',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900">Common questions</h2>
              <p className="text-slate-500 mt-3">Everything you need to know before getting started.</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "What happens when my trial ends?", a: "Your data is completely safe and nothing is deleted. Full access returns the moment you subscribe." },
                { q: "Can I add team members?", a: "Yes. Every plan includes sub-accounts with role-specific access. Standard Retailer gets 2, Premium gets 5. Manufacturer Premium gets up to 10 accounts." },
                { q: "Do I need a credit card to start?", a: "No. The 14-day free trial starts from your first login and requires no payment information whatsoever." },
                { q: "Can I change my plan later?", a: "Yes. You can upgrade from Standard to Premium at any time from your subscription page inside the app." },
                { q: "Is my data safe if I stop paying?", a: "Absolutely. Your data is never deleted. Full access simply pauses until you resubscribe — everything picks up exactly where you left off." },
              ].map((faq, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:border-slate-200 transition-colors">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 sm:p-16 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
                <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">14-day free trial, no card required.</p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-colors shadow-xl text-base">
                  Start free trial <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
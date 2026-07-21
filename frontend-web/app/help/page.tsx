"use client"
import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Factory, Truck, Store, Link2, CreditCard, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

function Accordion({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-semibold text-slate-900 text-sm">{q}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{a}</div>}
    </div>
  )
}

function SectionNav() {
  const links = [
    { href: "#production", label: "Recipes & Production" },
    { href: "#manufacturer", label: "Manufacturer" },
    { href: "#wholesaler", label: "Wholesaler" },
    { href: "#retailer", label: "Retailer" },
    { href: "#linking", label: "Marketplace & Linking" },
    { href: "#billing", label: "Subscription & Billing" },
    { href: "#troubleshooting", label: "Troubleshooting" },
  ]
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {links.map(l => (
        <a key={l.href} href={l.href} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors">
          {l.label}
        </a>
      ))}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-6">
              <HelpCircle className="h-3.5 w-3.5" />
              Help Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">How StockFlow Pro works</h1>
            <p className="text-lg text-blue-200 max-w-xl mx-auto mb-8">
              Recipes, production, stock, credit, and how the three business tiers connect — explained in plain terms.
            </p>
            <div className="mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
                <rect width="400" height="220" fill="#ffffff" />
                <rect x="0" y="0" width="400" height="34" fill="#ffffff" />
                <rect x="16" y="9" width="16" height="16" rx="5" fill="#0F172A" />
                <text x="40" y="21" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#0f172a">Adjei&apos;s Corner Shop</text>
                <text x="40" y="30" fontFamily="sans-serif" fontSize="6" fill="#94a3b8">Retailer · PREMIUM · ACTIVE</text>
                <rect x="330" y="8" width="54" height="18" rx="9" fill="#f8fafc" stroke="#e2e8f0" />
                <text x="357" y="20" fontFamily="sans-serif" fontSize="7" fill="#64748b" textAnchor="middle">Log out</text>
                <rect x="16" y="46" width="368" height="60" rx="14" fill="#059669" />
                <circle cx="360" cy="76" r="34" fill="#ffffff" opacity="0.08" />
                <text x="32" y="66" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="#bbf7d0" letterSpacing="1">GOOD TO HAVE YOU BACK</text>
                <text x="32" y="85" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="#ffffff">Yaw Adjei</text>
                <text x="32" y="98" fontFamily="sans-serif" fontSize="7" fill="#d1fae5">Adjei&apos;s Corner Shop · retailer account</text>
                <g>
                  <rect x="16" y="118" width="114" height="66" rx="12" fill="#ffffff" stroke="#f1f5f9" />
                  <text x="26" y="136" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="#94a3b8" letterSpacing="0.5">TODAY&apos;S SALES</text>
                  <text x="26" y="162" fontFamily="sans-serif" fontSize="17" fontWeight="800" fill="#0f172a">$1.60</text>
                </g>
                <g>
                  <rect x="143" y="118" width="114" height="66" rx="12" fill="#ffffff" stroke="#f1f5f9" />
                  <text x="153" y="136" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="#94a3b8" letterSpacing="0.5">LOW STOCK</text>
                  <text x="153" y="162" fontFamily="sans-serif" fontSize="17" fontWeight="800" fill="#0f172a">0</text>
                </g>
                <g>
                  <rect x="270" y="118" width="114" height="66" rx="12" fill="#ffffff" stroke="#f1f5f9" />
                  <text x="280" y="136" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="#94a3b8" letterSpacing="0.5">CREDIT OWED</text>
                  <text x="280" y="162" fontFamily="sans-serif" fontSize="17" fontWeight="800" fill="#0f172a">$250.00</text>
                </g>
                <rect x="16" y="196" width="368" height="16" rx="8" fill="#f8fafc" />
              </svg>
            </div>
            <p className="text-xs text-blue-300 mt-3">A real business dashboard on the web app — sales, stock, and credit at a glance.</p>
          </div>
        </section>

        {/* Section nav */}
        <section className="py-8 px-6 lg:px-8 bg-slate-50 border-b border-slate-100">
          <SectionNav />
        </section>

        {/* Recipes & Production */}
        <section id="production" className="py-20 px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Factory className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Recipes & Production — how the math works</h2>
            </div>

            <p className="text-slate-600 leading-relaxed mb-6">
              A <strong>recipe</strong> describes one finished product and what it costs to make it. Four fields define it:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { label: "Product name", desc: "What you're making, e.g. \"Golden Butter Biscuits\"." },
                { label: "Unit label", desc: "The smallest sellable item, e.g. \"pack\"." },
                { label: "Group label", desc: "The batch you plan production in, e.g. \"carton\"." },
                { label: "Units per group", desc: "How many units make one group, e.g. 24 packs per carton." },
              ].map(f => (
                <div key={f.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{f.label}</p>
                  <p className="text-sm text-slate-700">{f.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-600 leading-relaxed mb-4">
              Each material you attach to a recipe has a <strong>quantity per unit</strong> — how much of that raw material
              goes into making <em>one unit</em> (not one group). When you plan a production run, you choose how many
              <strong> groups</strong> you want to make, and the app works out the rest:
            </p>

            <div className="rounded-2xl bg-slate-900 text-white p-6 mb-6 font-mono text-sm leading-relaxed">
              <p className="text-blue-300">Total units = Target groups × Units per group</p>
              <p className="text-blue-300">Material required = Quantity per unit × Total units</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 mb-8">
              <p className="text-sm font-bold text-blue-900 mb-3">Worked example</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Recipe: <strong>Golden Butter Biscuits</strong> — unit label "pack", group label "carton", 24 packs per carton.
                One pack needs 0.5kg of flour.
              </p>
              <p className="text-sm text-blue-800 leading-relaxed mt-2">
                You plan <strong>10 cartons</strong>. Total units = 10 × 24 = <strong>240 packs</strong>.
                Flour required = 0.5kg × 240 = <strong>120kg</strong>.
              </p>
              <p className="text-sm text-blue-800 leading-relaxed mt-2">
                If every material has enough stock, the run shows as <strong>Feasible</strong> and you can confirm it.
                If any material falls short, it's marked <strong>Not feasible</strong> until you restock or lower the target.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed mb-2"><strong>When you tap "Confirm production run":</strong></p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mb-8 ml-2">
              <li>Every material's required amount is deducted from your raw material stock.</li>
              <li>A production run record is saved (visible under "Recent runs" with date, units, and cost).</li>
              <li>Finished goods stock for that recipe increases by the total units produced.</li>
            </ul>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm text-amber-800"><strong>Good to know:</strong> if two production runs for the same
              material are confirmed at almost exactly the same moment, stock is checked and deducted independently for
              each — extremely unlikely in normal use, but worth knowing if you're running rapid back-to-back tests.</p>
            </div>
          </div>
        </section>

        {/* Manufacturer */}
        <section id="manufacturer" className="py-20 px-6 lg:px-8 bg-slate-50 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Factory className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Manufacturer tier</h2>
            </div>
            <div className="space-y-4">
              <Accordion q="What order should I set things up in?" a={
                <p>Materials first (raw ingredients with a starting quantity), then Recipes (which reference those
                materials), then Production (which turns materials into Finished Goods), then Dispatch (which sends
                finished goods to a wholesaler).</p>
              } />
              <Accordion q="Why can't I delete a recipe?" a={
                <p>Deleting a recipe hides it from your list instead of permanently removing it, because past production
                runs still reference it for your history and cost records. If a recipe you deleted still shows up
                somewhere, that's expected — it's just no longer offered for new production runs.</p>
              } />
              <Accordion q="Why is my production run blocked?" a={
                <p>One or more materials don't have enough stock for the quantity you're planning. The preview screen
                shows exactly which material is short and by how much — restock it under Materials, or lower your
                target groups.</p>
              } />
              <Accordion q="Do I need to be linked with a wholesaler to dispatch to them?" a={
                <p>No — dispatch accepts any valid wholesaler business, linked or not. Linking (via the marketplace) is
                a directory feature for finding and keeping track of partners; it doesn't currently block or require a
                connection before you can dispatch or record a sale to them.</p>
              } />
              <Accordion q="Does every sale email an invoice to the buyer?" a={
                <p>Only on a Premium plan. Standard-tier manufacturers and wholesalers still get the invoice recorded
                in-app; Premium additionally emails a copy to the buyer's business automatically.</p>
              } />
            </div>
          </div>
        </section>

        {/* Wholesaler */}
        <section id="wholesaler" className="py-20 px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Truck className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Wholesaler tier</h2>
            </div>
            <div className="space-y-4">
              <Accordion q="How does receiving stock from a manufacturer work?" a={
                <p>Under Warehouse, receive stock against an existing warehouse product and record which manufacturer
                supplied it. If payment mode is Credit, a credit record and invoice are created automatically, owed to
                that manufacturer.</p>
              } />
              <Accordion q="How do I sell to a retailer?" a={
                <p>From POS, pick a warehouse product, quantity, and payment mode. Credit sales require a due date and
                create a credit record the retailer owes you, plus an invoice.</p>
              } />
              <Accordion q="Does every sale get an invoice, no matter the payment mode?" a={
                <p>Yes — cash, card, mobile money, bank transfer, and credit all generate an invoice and email it to
                the buyer's registered email if they have one. Premium accounts can ask per-sale whether the buyer
                wants an invoice at all; Standard accounts always get one.</p>
              } />
              <Accordion q="What if the buyer is collecting the order later instead of taking it now?" a={
                <p>Mark the sale as pickup and enter the buyer's email. They'll get a short pickup code by email —
                ask them for it when they arrive to collect, so you know it's really them.</p>
              } />
              <Accordion q="What does 'Credit hold' do?" a={
                <p>It flags an outstanding credit record for follow-up on your side. It's a visibility marker for your
                own tracking rather than something that blocks the other business from placing further orders.</p>
              } />
            </div>
          </div>
        </section>

        {/* Retailer */}
        <section id="retailer" className="py-20 px-6 lg:px-8 bg-slate-50 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Store className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Retailer tier</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center mb-8 rounded-2xl bg-white border border-slate-100 p-6">
              <svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" className="w-40 h-auto flex-shrink-0">
                <rect x="4" y="4" width="212" height="252" rx="24" fill="#0F172A" />
                <rect x="14" y="18" width="192" height="228" rx="14" fill="#F0F4F8" />
                <rect x="14" y="18" width="192" height="30" rx="14" fill="#ffffff" />
                <text x="26" y="37" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="#0f172a">POS</text>
                <text x="180" y="37" fontFamily="sans-serif" fontSize="7" fill="#6b7280" textAnchor="end">New sale</text>
                <rect x="26" y="58" width="168" height="26" rx="8" fill="#ffffff" stroke="#e5e7eb" />
                <text x="34" y="75" fontFamily="sans-serif" fontSize="7" fill="#0f172a">Coca-Cola 350ml x2</text>
                <text x="180" y="75" fontFamily="sans-serif" fontSize="7" fill="#0f172a" textAnchor="end">$1.60</text>
                <rect x="26" y="92" width="168" height="30" rx="10" fill="#ffffff" stroke="#1A56DB" strokeWidth="1.5" />
                <rect x="34" y="100" width="12" height="12" rx="3" fill="#1A56DB" />
                <text x="52" y="110" fontFamily="sans-serif" fontSize="6.5" fontWeight="600" fill="#374151">Customer is collecting later</text>
                <rect x="26" y="130" width="168" height="24" rx="8" fill="#ffffff" stroke="#e5e7eb" />
                <text x="34" y="145" fontFamily="sans-serif" fontSize="6.5" fill="#9CA3AF">customer@email.com</text>
                <rect x="26" y="168" width="168" height="34" rx="12" fill="#ECFDF5" stroke="#a7f3d0" />
                <text x="110" y="182" fontFamily="sans-serif" fontSize="6.5" fontWeight="700" fill="#065f46" textAnchor="middle">PICKUP CODE</text>
                <text x="110" y="196" fontFamily="sans-serif" fontSize="12" fontWeight="800" fill="#059669" textAnchor="middle" letterSpacing="2">33HPG2</text>
                <rect x="26" y="216" width="168" height="26" rx="10" fill="#059669" />
                <text x="110" y="233" fontFamily="sans-serif" fontSize="8" fontWeight="700" fill="#ffffff" textAnchor="middle">Confirm Sale · $1.60</text>
              </svg>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-2">Selling to a walk-in or collect-later customer</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  At POS, ring up the sale as normal. If the customer isn&apos;t taking it with them right now, check
                  <strong> &quot;Customer is collecting later&quot;</strong> and enter their email. They get a short code by
                  email (like <strong>33HPG2</strong>) — ask for it when they come back, so you know it&apos;s really them
                  before you hand the order over. Works the same way for wholesalers selling to retailers and
                  manufacturers dispatching to wholesalers.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Accordion q="When does a product count as low stock?" a={
                <p>When its quantity drops to or below the "min threshold" you set when adding the product. Low-stock
                items show up on your dashboard and in Notifications.</p>
              } />
              <Accordion q="What is stock reservation and who can use it?" a={
                <p>A Premium-only feature. It holds a quantity of a product for a customer for 10 minutes so it can't be
                sold to someone else in the meantime — useful when a customer says "hold this, I'll pay shortly."
                Find it under More → Reservations. It releases automatically once the 10 minutes pass, or you can
                release it early yourself.</p>
              } />
              <Accordion q="How do I sell on credit to a customer with a business account?" a={
                <p>At POS, choose Credit as the payment mode and provide the buyer's business and a due date. If the
                buyer is a walk-in customer with no business account, just enter their name — no credit record is
                created since there's no business to bill.</p>
              } />
            </div>
          </div>
        </section>

        {/* Marketplace & Linking */}
        <section id="linking" className="py-20 px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Marketplace & Linking</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              The marketplace is how businesses find each other. Browse listings, filter by tier, and tap
              <strong> Request Link</strong> on a business you want to work with. Linking follows the natural supply
              chain — <strong>Manufacturer ↔ Wholesaler</strong> and <strong>Wholesaler ↔ Retailer</strong> — a
              manufacturer and a retailer can't link to each other directly; a wholesaler sits in between.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Example: a wholesaler needs biscuits. They open the Marketplace, filter to Manufacturers, find a biscuit
              maker, and tap Request Link. Once the manufacturer accepts, they're linked partners. The same pattern
              works for a retailer finding a wholesaler.
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm text-amber-800"><strong>Good to know:</strong> being linked is currently a
              relationship/directory feature — it helps you keep track of your regular partners and shows up under
              "Linked Partners." It is not yet a requirement to actually record a sale or dispatch with a business; you
              can transact with any valid business ID today.</p>
            </div>
          </div>
        </section>

        {/* Billing */}
        <section id="billing" className="py-20 px-6 lg:px-8 bg-slate-50 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-rose-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Subscription & Billing</h2>
            </div>
            <div className="space-y-4">
              <Accordion q="How does the free trial work?" a={
                <p>Every business gets a 14-day free trial starting from first login, with full access to every
                feature on their chosen plan. No card is required to start.</p>
              } />
              <Accordion q="What happens when the trial ends?" a={
                <p>Nothing is deleted. You'll be prompted to subscribe to continue — your data is exactly as you left
                it and full access returns the moment you subscribe.</p>
              } />
              <Accordion q="What's the actual difference between Standard and Premium?" a={
                <p>More sub-accounts on every tier, plus: Retailer Premium adds stock reservation; Wholesaler and
                Manufacturer Premium add automatic email delivery of invoices to buyers.</p>
              } />
              <Accordion q="How many sub-accounts do I get?" a={
                <p>Retailer: 2 (Standard) / 5 (Premium). Wholesaler: 6 / 8. Manufacturer: 5 / 10. This includes the
                admin account itself.</p>
              } />
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="py-20 px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Troubleshooting</h2>
            <div className="space-y-4">
              <Accordion q="I can't log in on mobile" a={
                <p>Mobile is login-only — accounts are created on the web at <Link href="/signup" className="text-blue-600 font-semibold">phenomenal-blini-7b80dd.netlify.app/signup</Link>.
                Double-check your email/password, and confirm your business admin hasn't deactivated your sub-account.</p>
              } />
              <Accordion q="My sub-account invite isn't showing a password" a={
                <p>Sub-account passwords are generated automatically and shown once when the invite is created — copy
                it immediately and share it securely. If it wasn't captured, ask your business admin to remove and
                re-invite the account.</p>
              } />
              <Accordion q="I hit my sub-account limit" a={
                <p>Each plan has a fixed number of accounts (see Subscription & Billing above). Upgrade to Premium for
                more, or remove an inactive sub-account first.</p>
              } />
              <Accordion q="A screen shows blank names or 'undefined'" a={
                <p>This shouldn't happen — if you see it, please note which screen and screenshot it; it usually means
                a data field wasn't loaded correctly and is worth reporting.</p>
              } />
              <Accordion q="I can't reach a linked business or complete a sale" a={
                <p>Confirm the other business's subscription is active — an expired trial on either side can affect
                shared actions. Otherwise, check your own internet connection and pull-to-refresh the screen.</p>
              } />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

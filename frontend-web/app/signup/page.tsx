"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Factory, Truck, Store, Check, ArrowRight, ArrowLeft, Mail, Building2, User, Lock, Users, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { sendEmail, welcomeEmailHtml } from "@/lib/email"
import { API_BASE_URL } from "@/lib/api"
import { MONTHLY_PRICE_USD as planPrices, SUB_ACCOUNT_LIMITS as ACCOUNT_LIMITS } from "@/lib/subscription-plans"

const tiers = [
  { id: "MANUFACTURER", name: "Manufacturer", icon: Factory, description: "Materials, recipes, production planning, finished goods, dispatch", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", gradient: "from-blue-500 to-indigo-600" },
  { id: "WHOLESALER", name: "Wholesaler", icon: Truck, description: "Warehouse management, receiving, selling to retailers, credit", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", gradient: "from-amber-500 to-orange-500" },
  { id: "RETAILER", name: "Retailer", icon: Store, description: "Products, POS, stock tracking, credit owed to wholesalers", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", gradient: "from-emerald-500 to-green-600" },
]

function SignupContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState(searchParams.get("tier")?.toUpperCase() || "")
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan")?.toUpperCase() || "")
  const [formData, setFormData] = useState({ businessName: "", adminName: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [registered, setRegistered] = useState<any>(null)

  const canProceed = () => {
    if (step === 1) return !!selectedTier
    if (step === 2) return !!selectedPlan
    if (step === 3) return !!(formData.businessName && formData.adminName && formData.email && formData.password)
    return false
  }

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: formData.businessName, tierType: selectedTier, subscriptionPlan: selectedPlan, adminName: formData.adminName, adminEmail: formData.email, adminPassword: formData.password }),
      })
      const json = await res.json()
if (!res.ok) throw new Error(json.error || json.message || "Registration failed")

setRegistered({
  email: formData.email,
  password: formData.password,
  businessName: json.businessName || formData.businessName,
  tier: json.tierType || selectedTier,
  plan: json.subscriptionPlan || selectedPlan,
})
setStep(4)

// Send welcome email
sendEmail(
  formData.email,
  `Welcome to StockFlow Pro — ${formData.businessName}`,
  welcomeEmailHtml(formData.businessName, selectedTier, selectedPlan, formData.email, formData.password)
).catch(() => toast.warning("Account created, but the welcome email failed to send. Your credentials are shown below."))

    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally { setLoading(false) }
  }

  const selectedTierData = tiers.find(t => t.id === selectedTier)

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col justify-between p-12 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-white">StockFlow Pro</span>
        </Link>
        <div>
          <div className="mb-8">
            {step < 4 && (
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-400' : 'bg-white/10'}`} />
                ))}
              </div>
            )}
            <h2 className="text-3xl font-bold text-white mb-4">
              {step === 1 && "Choose your tier"}
              {step === 2 && "Choose your plan"}
              {step === 3 && "Create your account"}
              {step === 4 && "You're all set!"}
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              {step === 1 && "Select the tier that best matches your business type."}
              {step === 2 && "Both plans start with a 14-day free trial. No card required."}
              {step === 3 && "Create your admin account now — invite your team afterwards."}
              {step === 4 && "Check your email for your credentials. Download the mobile app to get started."}
            </p>
          </div>
          <div className="space-y-3">
            {["14-day free trial included", "No credit card required", "Data always safe", "Cancel anytime"].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <p className="text-slate-300 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm">© 2026 StockFlow Pro</p>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 px-6 py-12 lg:px-12 max-w-xl mx-auto w-full">
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">StockFlow Pro</span>
            </Link>
            <span className="text-sm text-slate-500">Step {step} of 3</span>
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Choose your business type</h1>
              <p className="text-slate-500 mb-8 text-sm">Select the tier that matches your business</p>
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${selectedTier === tier.id ? `border-2 ${tier.border} ${tier.bg}` : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className={`h-12 w-12 rounded-xl ${tier.bg} ${tier.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <tier.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                        {selectedTier === tier.id && <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}><Check className="h-3 w-3 text-white" /></div>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tier.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedTier && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Choose your plan</h1>
              <p className="text-slate-500 mb-8 text-sm">Both plans include a 14-day free trial</p>
              <div className="grid grid-cols-2 gap-4">
                {["STANDARD", "PREMIUM"].map((plan) => (
                  <button key={plan} onClick={() => setSelectedPlan(plan)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${selectedPlan === plan ? `border-blue-500 bg-blue-50` : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${plan === 'PREMIUM' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{plan}</span>
                      {selectedPlan === plan && <Check className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-black text-slate-900">${planPrices[selectedTier]?.[plan]}</span>
                      <span className="text-xs text-slate-400">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="h-3 w-3" />{ACCOUNT_LIMITS[selectedTier]?.[plan]} accounts
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
              <p className="text-slate-500 mb-8 text-sm">Your plan includes up to {ACCOUNT_LIMITS[selectedTier]?.[selectedPlan]} accounts. You'll invite your team from Settings after signing up.</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-sm font-medium">Business name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" placeholder="Acme Ltd" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-sm font-medium">Your full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" placeholder="Francisca Boakye" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-sm font-medium">Business email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="email" className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" placeholder="you@business.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="password" className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" placeholder="Create a strong password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 border border-red-100">{error}</div>}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">{selectedTier} · {selectedPlan} · ${planPrices[selectedTier]?.[selectedPlan]}/month</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">14-day free trial — $0.00 due today</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && registered && (
            <div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to StockFlow Pro!</h1>
              <p className="text-slate-500 mb-2 text-sm">Your credentials have been sent to <strong>{registered.email}</strong></p>
              <p className="text-slate-500 mb-8 text-sm">They're also shown below for your reference.</p>

              <div className="bg-slate-900 rounded-2xl p-6 mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Business</p>
                <p className="font-bold text-white text-lg">{registered.businessName}</p>
                <p className="text-slate-400 text-sm capitalize">{registered.tier.toLowerCase()} · {registered.plan.toLowerCase()} plan</p>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your login</p>
                <div className="flex items-center justify-between rounded-xl border p-4 bg-blue-50 border-blue-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">Admin (You)</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Admin</Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{registered.email}</p>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{registered.password}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Your plan includes up to {ACCOUNT_LIMITS[registered.tier]?.[registered.plan] ?? 1} accounts. Invite your team from Settings → Accounts once you're signed in.
                </p>
              </div>

              <Separator className="mb-6" />
              <p className="text-xs text-emerald-600 font-semibold mb-6">Trial starts on first login. Your data is always safe.</p>

              <Link href="/login" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow">
                Sign in to your account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleRegister} disabled={!canProceed() || loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow">
                  {loading ? "Creating..." : <><span>Create account</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <SignupContent />
    </Suspense>
  )
}
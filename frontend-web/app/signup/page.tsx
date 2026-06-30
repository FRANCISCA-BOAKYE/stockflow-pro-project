"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Factory, Truck, Store, Check, ArrowRight, ArrowLeft, Mail, Building2, User, Lock, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

const tiers = [
  { id: "MANUFACTURER", name: "Manufacturer", icon: Factory, description: "Materials, recipes, production planning, finished goods, dispatch", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "WHOLESALER", name: "Wholesaler", icon: Truck, description: "Warehouse management, receiving, selling to retailers, credit", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "RETAILER", name: "Retailer", icon: Store, description: "Products, POS, stock tracking, credit owed to wholesalers", color: "text-green-600", bg: "bg-green-50" },
]

const planPrices: Record<string, Record<string, number>> = {
  RETAILER: { STANDARD: 17, PREMIUM: 30 },
  WHOLESALER: { STANDARD: 45, PREMIUM: 75 },
  MANUFACTURER: { STANDARD: 80, PREMIUM: 110 },
}

const SUB_ACCOUNT_ROLES: Record<string, { name: string; roles: string[] }> = {
  MANUFACTURER: { name: "Company Admin", roles: ["Production Supervisor", "Store Keeper", "POS Operator"] },
  WHOLESALER: { name: "Warehouse Admin", roles: ["Receiving Staff", "Sales Staff"] },
  RETAILER: { name: "Shop Owner", roles: ["Shop Staff"] },
}

const ACCOUNT_LIMITS: Record<string, Record<string, number>> = {
  MANUFACTURER: { STANDARD: 5, PREMIUM: 10 },
  WHOLESALER: { STANDARD: 6, PREMIUM: 8 },
  RETAILER: { STANDARD: 2, PREMIUM: 5 },
}

function slugifyEmail(name: string, domain: string, index: number) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, ".")
  return `${base}${index > 0 ? index + 1 : ""}@${domain}`
}

function generateSubAccounts(tier: string, plan: string, adminEmail: string) {
  const limit = ACCOUNT_LIMITS[tier]?.[plan] ?? 1
  const roleConfig = SUB_ACCOUNT_ROLES[tier] ?? { name: "Admin", roles: ["Staff"] }
  const domain = adminEmail.includes("@") ? adminEmail.split("@")[1] : "business.com"

  const accounts: { name: string; role: string; email: string; isAdmin: boolean }[] = [
    { name: "You", role: roleConfig.name, email: adminEmail, isAdmin: true },
  ]

  let roleIndex = 0
  while (accounts.length < limit) {
    const role = roleConfig.roles[roleIndex % roleConfig.roles.length]
    const seatNumber = Math.floor(roleIndex / roleConfig.roles.length)
    accounts.push({ name: `${role} ${accounts.length}`, role, email: slugifyEmail(role, domain, seatNumber), isAdmin: false })
    roleIndex++
  }
  return accounts
}

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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || d.message || "Registration failed") }

      const subAccounts = generateSubAccounts(selectedTier, selectedPlan, formData.email)
      setRegistered({ email: formData.email, password: formData.password, businessName: formData.businessName, tier: selectedTier, plan: selectedPlan, subAccounts })
      setStep(4)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-6">
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {step} of 3</span>
                <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
              </div>
            </div>
          )}

          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose your business type</CardTitle>
                <CardDescription>Select the tier that matches your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiers.map((tier) => (
                  <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${selectedTier === tier.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className={`h-12 w-12 rounded-xl ${tier.bg} ${tier.color} flex items-center justify-center flex-shrink-0`}>
                      <tier.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{tier.name}</h3>
                        {selectedTier === tier.id && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {step === 2 && selectedTier && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose your plan</CardTitle>
                <CardDescription>Both plans include a 14-day free trial — no card required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {["STANDARD", "PREMIUM"].map((plan) => (
                    <button key={plan} onClick={() => setSelectedPlan(plan)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${selectedPlan === plan ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant={plan === "PREMIUM" ? "default" : "secondary"} className="capitalize">{plan.toLowerCase()}</Badge>
                        {selectedPlan === plan && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="mb-2">
                        <span className="text-3xl font-bold">${planPrices[selectedTier]?.[plan]}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />{ACCOUNT_LIMITS[selectedTier]?.[plan]} sub-accounts included
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>Enter business and admin details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Your full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Business email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" className="pl-10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" className="pl-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-100">{error}</div>}
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  {selectedTier} · {selectedPlan} · ${planPrices[selectedTier]?.[selectedPlan]}/month · {ACCOUNT_LIMITS[selectedTier]?.[selectedPlan]} sub-accounts
                  <p className="text-green-600 font-medium mt-1">14-day free trial — $0.00 due today</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && registered && (
            <Card>
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Welcome to StockFlow Pro!</CardTitle>
                <CardDescription>All sub-account credentials are below. Save them — download the mobile app to log in.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/50 rounded-xl p-5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Business</p>
                  <p className="font-semibold">{registered.businessName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{registered.tier} · {registered.plan} plan · {registered.subAccounts.length} accounts</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Account credentials</p>
                  <div className="space-y-2">
                    {registered.subAccounts.map((acc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{acc.isAdmin ? "Admin (You)" : acc.role}</span>
                            {acc.isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{acc.email}</p>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">
                          {acc.isAdmin ? registered.password : "Set on first login"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                <p className="text-sm text-green-600 font-medium">14-day free trial starts the moment the admin logs in for the first time.</p>

                <Button size="lg" className="w-full" asChild>
                  <Link href="/login">Sign in to your account<ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                  Continue<ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleRegister} disabled={!canProceed() || loading}>
                  {loading ? "Creating account..." : "Create account"}<ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  )
}
"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Factory, Truck, Store, Check, ArrowRight, ArrowLeft,
  CreditCard, Download, Mail, Building2, User, Phone, Shield, Lock
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

const tiers = [
  {
    id: "MANUFACTURER",
    name: "Manufacturer",
    icon: Factory,
    description: "Production, raw materials, recipes, finished goods and wholesale distribution",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "WHOLESALER", 
    name: "Wholesaler",
    icon: Truck,
    description: "Bulk ordering, warehouse management, and retailer connections",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "RETAILER",
    name: "Retailer",
    icon: Store,
    description: "POS sales, inventory management, credit tracking and invoicing",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
]

const planPrices: Record<string, Record<string, number>> = {
  RETAILER: { STANDARD: 17, PREMIUM: 30 },
  WHOLESALER: { STANDARD: 45, PREMIUM: 75 },
  MANUFACTURER: { STANDARD: 80, PREMIUM: 110 },
}

const planSubAccounts: Record<string, Record<string, number>> = {
  RETAILER: { STANDARD: 2, PREMIUM: 5 },
  WHOLESALER: { STANDARD: 6, PREMIUM: 8 },
  MANUFACTURER: { STANDARD: 5, PREMIUM: 10 },
}

function SignupContent() {
  const searchParams = useSearchParams()
  const initialTier = searchParams.get("tier")?.toUpperCase() || ""
  const initialPlan = searchParams.get("plan")?.toUpperCase() || ""

  const [step, setStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState(initialTier)
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [formData, setFormData] = useState({
    businessName: "",
    adminName: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [registered, setRegistered] = useState<any>(null)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

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
        body: JSON.stringify({
          businessName: formData.businessName,
          tierType: selectedTier,
          subscriptionPlan: selectedPlan,
          adminName: formData.adminName,
          adminEmail: formData.email,
          adminPassword: formData.password,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Registration failed")
      }
      const data = await res.json()
      setRegistered({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        tier: selectedTier,
        plan: selectedPlan,
      })
      setStep(4)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Step {step} of {totalSteps - 1}</span>
                <span className="text-sm text-muted-foreground">{Math.round((step / (totalSteps - 1)) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step 1 — Choose tier */}
          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose your business type</CardTitle>
                <CardDescription>Select the tier that best describes your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                      selectedTier === tier.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl ${tier.bgColor} ${tier.color} flex items-center justify-center flex-shrink-0`}>
                      <tier.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{tier.name}</h3>
                        {selectedTier === tier.id && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 2 — Choose plan */}
          {step === 2 && selectedTier && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose your plan</CardTitle>
                <CardDescription>Both plans include a 14-day free trial — no card required</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {["STANDARD", "PREMIUM"].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === plan
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant={plan === "PREMIUM" ? "default" : "secondary"} className="capitalize">
                          {plan.toLowerCase()}
                        </Badge>
                        {selectedPlan === plan && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-foreground">
                          ${planPrices[selectedTier][plan]}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {plan === "PREMIUM" ? "Full features, priority support" : "Essential features to get started"}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        {planSubAccounts[selectedTier][plan]} sub-accounts included
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  You can upgrade or downgrade at any time
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 3 — Business details */}
          {step === 3 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>Enter your business and admin details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      placeholder="Acme Manufacturing Ltd"
                      className="pl-10"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Your Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminName"
                      placeholder="Francisca Boakye"
                      className="pl-10"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@business.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min 8 characters"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-100">
                    {error}
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1">Order summary</p>
                  <p>{selectedTier} · {selectedPlan} plan · ${planPrices[selectedTier]?.[selectedPlan]}/month</p>
                  <p className="text-green-600 font-medium mt-1">14-day free trial — $0.00 due today</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your data is securely encrypted and protected</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4 — Success */}
          {step === 4 && registered && (
            <Card>
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Welcome to StockFlow Pro!</CardTitle>
                <CardDescription>Your account has been created. Save your login details below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/50 rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Business</p>
                    <p className="font-semibold text-foreground">{registered.businessName}</p>
                    <p className="text-sm text-muted-foreground capitalize">{registered.tier} · {registered.plan} plan</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Login Credentials</p>
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Email: </span>
                        <span className="font-mono">{registered.email}</span>
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Password: </span>
                        <span className="font-mono">{registered.password}</span>
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trial Info</p>
                    <p className="text-sm text-green-600 font-medium">14-day free trial active</p>
                    <p className="text-xs text-muted-foreground mt-1">No payment required until trial ends</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download credentials
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email credentials
                  </Button>
                </div>

                <Button size="lg" className="w-full" asChild>
                  <Link href="/login">
                    Sign in to your account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Download the StockFlow Pro mobile app to manage your business on the go
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleRegister} disabled={!canProceed() || loading}>
                  {loading ? "Creating account..." : "Create account"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
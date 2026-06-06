"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Factory, 
  Truck, 
  Store, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  Download,
  Mail,
  Building2,
  User,
  Phone,
  MapPin,
  Shield
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const tiers = [
  {
    id: "manufacturer",
    name: "Manufacturer",
    icon: Factory,
    description: "Production, inventory listing, and wholesale distribution",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    id: "wholesaler",
    name: "Wholesaler",
    icon: Truck,
    description: "Bulk ordering, distribution, and retailer connections",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    id: "retailer",
    name: "Retailer",
    icon: Store,
    description: "POS, inventory management, and sales tracking",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
]

const planPrices: Record<string, Record<string, number>> = {
  retailer: { standard: 17, premium: 30 },
  wholesaler: { standard: 45, premium: 75 },
  manufacturer: { standard: 80, premium: 110 },
}

function SignupContent() {
  const searchParams = useSearchParams()
  const initialTier = searchParams.get("tier") || ""
  const initialPlan = searchParams.get("plan") || ""
  
  const [step, setStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState(initialTier)
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    location: "",
    contactPerson: "",
  })
  const [isComplete, setIsComplete] = useState(false)

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    setIsComplete(true)
    setStep(5)
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedTier
      case 2: return !!selectedPlan
      case 3: return formData.businessName && formData.email && formData.phone && formData.location && formData.contactPerson
      case 4: return true // Payment UI only
      default: return false
    }
  }

  // Generate mock credentials
  const credentials = {
    adminEmail: formData.email || "admin@yourbusiness.com",
    adminPassword: "SF-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    subAccounts: [
      { role: "Manager", email: `manager@${formData.businessName?.toLowerCase().replace(/\s/g, "") || "business"}.com`, password: "MGR-" + Math.random().toString(36).substring(2, 8).toUpperCase() },
      { role: "Staff", email: `staff@${formData.businessName?.toLowerCase().replace(/\s/g, "") || "business"}.com`, password: "STF-" + Math.random().toString(36).substring(2, 8).toUpperCase() },
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Choose Tier */}
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
                        {selectedTier === tier.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Choose Plan */}
          {step === 2 && selectedTier && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose your plan</CardTitle>
                <CardDescription>Both plans include a 14-day free trial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {["standard", "premium"].map((plan) => (
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
                        <Badge variant={plan === "premium" ? "default" : "secondary"} className="capitalize">
                          {plan}
                        </Badge>
                        {selectedPlan === plan && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-foreground">${planPrices[selectedTier][plan]}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan === "premium" ? "Full features, unlimited access" : "Essential features for getting started"}
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

          {/* Step 3: Business Details */}
          {step === 3 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Business details</CardTitle>
                <CardDescription>Tell us about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="businessName"
                      placeholder="Your Business Name"
                      className="pl-10"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
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
                      placeholder="contact@yourbusiness.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Business Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="location"
                      placeholder="City, Country"
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="contactPerson"
                      placeholder="Full Name"
                      className="pl-10"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment */}
          {step === 4 && !isComplete && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Payment details</CardTitle>
                <CardDescription>Your card will not be charged during the trial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order summary */}
                <div className="bg-secondary/50 rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{selectedTier} {selectedPlan}</span>
                      <span className="text-foreground">${planPrices[selectedTier]?.[selectedPlan]}/mo</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>14-day free trial</span>
                      <span>-${planPrices[selectedTier]?.[selectedPlan]}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Due today</span>
                      <span className="text-foreground">$0.00</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="pl-10" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment info is securely encrypted</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Success */}
          {step === 5 && isComplete && (
            <Card>
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Welcome to StockFlow Pro!</CardTitle>
                <CardDescription>Your account has been created successfully</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-3">Your Credentials</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Admin Login</p>
                      <p className="text-sm font-mono text-foreground">{credentials.adminEmail}</p>
                      <p className="text-sm font-mono text-foreground">{credentials.adminPassword}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Sub-Accounts</p>
                      {credentials.subAccounts.map((account, index) => (
                        <div key={index} className="mb-2">
                          <p className="text-xs text-muted-foreground">{account.role}</p>
                          <p className="text-sm font-mono text-foreground">{account.email}</p>
                          <p className="text-sm font-mono text-foreground">{account.password}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Credentials
                  </Button>
                </div>

                <Separator />

                <div className="text-center">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          {!isComplete && (
            <div className="flex items-center justify-between mt-8">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}

          {/* Login link */}
          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
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

import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PLANS = [
  {
    tier: "Retailer",
    color: "text-green-600",
    plans: [
      { name: "Standard", price: 17, accounts: "2 sub-accounts including admin", features: ["Full inventory management", "POS, search, filtering", "Low-stock alerts", "Transaction history", "Dashboard", "Credit tracking"] },
      { name: "Premium", price: 30, accounts: "5 sub-accounts including admin", features: ["Everything in Standard", "Customer purchase history", "Auto-reorder suggestions", "Advanced sales reports"] },
    ],
  },
  {
    tier: "Wholesaler",
    color: "text-amber-600",
    plans: [
      { name: "Standard", price: 45, accounts: "6 sub-accounts including admin", features: ["Full warehouse management", "POS, credit tracking both ways", "Overdue alerts, credit holds", "Tier linking", "Marketplace listing"] },
      { name: "Premium", price: 75, accounts: "8 sub-accounts including admin", features: ["Everything in Standard", "Advanced reports", "Delivery scheduling", "Invoice generation (WhatsApp/email)"] },
    ],
  },
  {
    tier: "Manufacturer",
    color: "text-blue-600",
    plans: [
      { name: "Standard", price: 80, accounts: "5 sub-accounts including admin", features: ["Material management", "Recipe setup", "Production planning", "Finished goods tracking", "POS dispatch", "Credit tracking", "Marketplace listing"] },
      { name: "Premium", price: 110, accounts: "10 sub-accounts including admin", features: ["Everything in Standard", "Advanced reports", "Delivery scheduling for dispatches", "Invoice generation (WhatsApp/email)"] },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground">Pricing for every tier</h1>
            <p className="mt-4 text-lg text-muted-foreground">All prices in USD. Every business gets a 14-day free trial — no card required.</p>
          </div>

          {PLANS.map((tierGroup) => (
            <div key={tierGroup.tier} className="mb-16">
              <h2 className={`text-2xl font-bold mb-6 ${tierGroup.color}`}>{tierGroup.tier}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {tierGroup.plans.map((plan, i) => (
                  <Card key={plan.name} className={i === 1 ? "border-primary border-2" : ""}>
                    {i === 1 && <Badge className="absolute -mt-3 ml-6">Most popular</Badge>}
                    <CardHeader>
                      <CardTitle className="flex items-baseline justify-between">
                        <span>{plan.name}</span>
                        <span className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.accounts}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={i === 1 ? "default" : "outline"} asChild>
                        <Link href={`/signup?tier=${tierGroup.tier.toUpperCase()}&plan=${plan.name.toUpperCase()}`}>
                          Start free trial<ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
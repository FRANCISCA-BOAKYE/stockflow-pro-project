"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PlanFeature {
  name: string
  included: boolean
  tooltip?: string
}

interface Plan {
  name: string
  description: string
  price: number
  period: string
  popular?: boolean
  features: PlanFeature[]
}

interface TierPlans {
  standard: Plan
  premium: Plan
}

const pricingData: Record<string, TierPlans> = {
  retailer: {
    standard: {
      name: "Retailer Standard",
      description: "Perfect for small retail stores getting started",
      price: 17,
      period: "month",
      features: [
        { name: "Up to 1,000 SKUs", included: true },
        { name: "1 POS terminal", included: true },
        { name: "Basic inventory management", included: true },
        { name: "Invoice generation", included: true },
        { name: "Email support", included: true },
        { name: "Basic analytics", included: true },
        { name: "Multi-location support", included: false },
        { name: "Credit tracking", included: false },
        { name: "API access", included: false },
        { name: "Priority support", included: false },
      ],
    },
    premium: {
      name: "Retailer Premium",
      description: "For growing retail businesses with multiple needs",
      price: 30,
      period: "month",
      popular: true,
      features: [
        { name: "Unlimited SKUs", included: true },
        { name: "Up to 5 POS terminals", included: true },
        { name: "Advanced inventory management", included: true },
        { name: "Invoice generation & tracking", included: true },
        { name: "Priority email & chat support", included: true },
        { name: "Advanced analytics & reports", included: true },
        { name: "Multi-location support", included: true },
        { name: "Credit tracking", included: true },
        { name: "API access", included: true },
        { name: "Dedicated account manager", included: true },
      ],
    },
  },
  wholesaler: {
    standard: {
      name: "Wholesaler Standard",
      description: "Essential tools for wholesale distribution",
      price: 45,
      period: "month",
      features: [
        { name: "Up to 5,000 SKUs", included: true },
        { name: "Up to 100 retail connections", included: true },
        { name: "Inventory management", included: true },
        { name: "Invoice generation", included: true },
        { name: "Basic credit tracking", included: true },
        { name: "Standard analytics", included: true },
        { name: "Marketplace listing", included: true },
        { name: "Multi-warehouse support", included: false },
        { name: "Advanced credit management", included: false },
        { name: "Custom integrations", included: false },
      ],
    },
    premium: {
      name: "Wholesaler Premium",
      description: "Full-featured solution for established wholesalers",
      price: 75,
      period: "month",
      popular: true,
      features: [
        { name: "Unlimited SKUs", included: true },
        { name: "Unlimited retail connections", included: true },
        { name: "Advanced inventory management", included: true },
        { name: "Invoice automation", included: true },
        { name: "Advanced credit management", included: true },
        { name: "Business intelligence suite", included: true },
        { name: "Featured marketplace listing", included: true },
        { name: "Multi-warehouse support", included: true },
        { name: "Custom integrations", included: true },
        { name: "24/7 priority support", included: true },
      ],
    },
  },
  manufacturer: {
    standard: {
      name: "Manufacturer Standard",
      description: "Core manufacturing and distribution tools",
      price: 80,
      period: "month",
      features: [
        { name: "Up to 10,000 SKUs", included: true },
        { name: "Production planning", included: true },
        { name: "Up to 50 wholesaler connections", included: true },
        { name: "Inventory management", included: true },
        { name: "Invoice generation", included: true },
        { name: "Basic analytics", included: true },
        { name: "Marketplace listing", included: true },
        { name: "BOM management", included: false },
        { name: "Quality control module", included: false },
        { name: "Advanced forecasting", included: false },
      ],
    },
    premium: {
      name: "Manufacturer Premium",
      description: "Enterprise-grade manufacturing platform",
      price: 110,
      period: "month",
      popular: true,
      features: [
        { name: "Unlimited SKUs", included: true },
        { name: "Advanced production planning", included: true },
        { name: "Unlimited wholesaler connections", included: true },
        { name: "Advanced inventory & stock reservation", included: true },
        { name: "Invoice automation & tracking", included: true },
        { name: "Business intelligence suite", included: true },
        { name: "Featured marketplace listing", included: true },
        { name: "BOM & recipe management", included: true },
        { name: "Quality control module", included: true },
        { name: "AI-powered demand forecasting", included: true },
      ],
    },
  },
}

function PlanCard({ plan, tier }: { plan: Plan; tier: string }) {
  return (
    <Card className={`relative h-full flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : "border-border"}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">${plan.price}</span>
          <span className="text-muted-foreground">/{plan.period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 ${feature.included ? "text-green-600" : "text-muted-foreground/40"}`}>
                <Check className="h-4 w-4" />
              </div>
              <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground line-through"}`}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={plan.popular ? "default" : "outline"}
          asChild
        >
          <Link href={`/signup?tier=${tier}&plan=${plan.popular ? "premium" : "standard"}`}>
            Start Free Trial
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState("retailer")

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Pricing</Badge>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your business. All plans include a 14-day free trial.
                No credit card required.
              </p>
            </div>

            {/* Tier selector */}
            <div className="flex justify-center mb-12">
              <Tabs value={selectedTier} onValueChange={setSelectedTier} className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="retailer">Retailer</TabsTrigger>
                  <TabsTrigger value="wholesaler">Wholesaler</TabsTrigger>
                  <TabsTrigger value="manufacturer">Manufacturer</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Pricing cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              <PlanCard plan={pricingData[selectedTier].standard} tier={selectedTier} />
              <PlanCard plan={pricingData[selectedTier].premium} tier={selectedTier} />
            </div>

            {/* Feature comparison */}
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-center text-foreground mb-8">
                Compare all features
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full max-w-4xl mx-auto">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-medium text-foreground">Feature</th>
                      <th className="text-center py-4 px-4 font-medium text-foreground">Standard</th>
                      <th className="text-center py-4 px-4 font-medium text-foreground">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingData[selectedTier].premium.features.map((feature, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-4 px-4 text-sm text-foreground">{feature.name}</td>
                        <td className="py-4 px-4 text-center">
                          {pricingData[selectedTier].standard.features[index]?.included ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ / Trust */}
            <div className="mt-20 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Questions about pricing?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our team is here to help you find the right plan for your business.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="#">Contact Sales</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#">View FAQ</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  )
}

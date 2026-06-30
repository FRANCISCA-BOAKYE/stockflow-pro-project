"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ShieldCheck, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PLANS_BY_TIER: Record<string, { name: string; price: number }[]> = {
  MANUFACTURER: [{ name: "Standard", price: 80 }, { name: "Premium", price: 110 }],
  WHOLESALER: [{ name: "Standard", price: 45 }, { name: "Premium", price: 75 }],
  RETAILER: [{ name: "Standard", price: 17 }, { name: "Premium", price: 30 }],
}

export default function TrialExpiredPage() {
  const [tier, setTier] = useState("RETAILER")

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (stored) setTier(JSON.parse(stored).tierType || "RETAILER")
  }, [])

  const plans = PLANS_BY_TIER[tier] || PLANS_BY_TIER.RETAILER

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16 px-6">
        <div className="mx-auto max-w-lg text-center">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Your trial has ended</h1>
          <p className="text-muted-foreground mb-8">Your 14-day free trial is over. Subscribe to continue using StockFlow Pro.</p>

          <Card className="mb-8 text-left bg-green-50 border-green-200">
            <CardContent className="pt-6 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Your data is completely safe</p>
                <p className="text-sm text-green-700 mt-1">Nothing has been deleted. Full access returns instantly the moment you subscribe.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 mb-8 text-left">
            {plans.map(plan => (
              <Card key={plan.name}>
                <CardContent className="pt-5 pb-5 flex items-center justify-between">
                  <span className="font-semibold">{plan.name}</span>
                  <span className="text-xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button size="lg" className="w-full" asChild>
            <Link href="/pricing">View plans & subscribe</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
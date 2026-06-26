import Link from "next/link"
import { Clock, Shield, Database, ArrowRight, Headphones } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const plans = [
  { tier: "Retailer", standard: 17, premium: 30 },
  { tier: "Wholesaler", standard: 45, premium: 75 },
  { tier: "Manufacturer", standard: 80, premium: 110 },
]

const reassurances = [
  {
    icon: Database,
    title: "Your data is safe",
    description: "All your business data, invoices, and records remain securely stored. Nothing has been deleted.",
  },
  {
    icon: Shield,
    title: "Instant reactivation",
    description: "Subscribe to any plan and regain full access to your account immediately. No waiting period.",
  },
  {
    icon: Clock,
    title: "Pick up where you left off",
    description: "All your settings, configurations, and business connections are preserved and ready to use.",
  },
]

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <Badge variant="secondary" className="mb-4">Trial Period Ended</Badge>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              Your Free Trial Has Ended
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Thank you for trying StockFlow Pro. To continue managing your supply chain 
              and accessing all features, please choose a subscription plan.
            </p>
          </div>

          {/* Reassurance cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {reassurances.map((item) => (
              <Card key={item.title} className="text-center border-border/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing summary */}
          <Card className="mb-12 border-border/50">
            <CardHeader className="text-center">
              <CardTitle>Choose a Plan to Continue</CardTitle>
              <CardDescription>All plans include full access to your existing data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">Business Tier</th>
                      <th className="text-center py-3 px-4 font-medium text-foreground">Standard</th>
                      <th className="text-center py-3 px-4 font-medium text-foreground">
                        Premium
                        <Badge variant="default" className="ml-2 text-xs">Popular</Badge>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.tier} className="border-b border-border/50">
                        <td className="py-4 px-4 font-medium text-foreground">{plan.tier}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-2xl font-bold text-foreground">${plan.standard}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-2xl font-bold text-foreground">${plan.premium}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    View Full Pricing Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="default" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/signup">
                    Renew Subscription
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support section */}
          <div className="text-center bg-secondary/30 rounded-2xl p-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Our support team is here to assist you with any questions about your account or subscription options.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="#">Contact Support</Link>
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
  )
}

import Link from "next/link"
import { Factory, Truck, Store, CreditCard, Lock, ShoppingCart, Search, ArrowRight, Check } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
              The supply chain, <span className="text-primary">finally connected</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              StockFlow Pro connects manufacturers, wholesalers, and retailers in one platform — production planning, credit tracking, POS, and a marketplace to find trading partners.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild><Link href="/signup">Start 14-day free trial<ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/marketplace">Browse marketplace</Link></Button>
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section id="features" className="py-20 px-6 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-foreground">One platform, three connected tiers</h2>
              <p className="mt-3 text-muted-foreground">Manufacturers, wholesalers, and retailers see exactly what they need from each other.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><Factory className="h-6 w-6 text-blue-600" /></div>
                  <CardTitle>Manufacturer</CardTitle>
                  <CardDescription>Materials, recipes, production planning with automatic calculation, finished goods, and dispatch.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3"><Truck className="h-6 w-6 text-amber-600" /></div>
                  <CardTitle>Wholesaler</CardTitle>
                  <CardDescription>Warehouse stock, receiving from manufacturers, selling to retailers, credit in both directions.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center mb-3"><Store className="h-6 w-6 text-green-600" /></div>
                  <CardTitle>Retailer</CardTitle>
                  <CardDescription>Products, POS, stock tracking, and credit owed to wholesalers in one dashboard.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Key features */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-foreground">Built for how supply chains actually work</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: CreditCard, title: "Credit tracking", desc: "Every credit transaction reflects on both accounts automatically with due dates and overdue alerts." },
                { icon: Lock, title: "Stock reservation", desc: "Prevents two accounts from selling the same unavailable stock at the same time." },
                { icon: ShoppingCart, title: "POS integration", desc: "Point of sale connects directly to inventory in real time across all three tiers." },
                { icon: Search, title: "Marketplace", desc: "Manufacturers and wholesalers list themselves so the right trading partners find each other." },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-6 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-14">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-8 text-left">
              {[
                { step: "1", title: "Sign up & choose your tier", desc: "Select Manufacturer, Wholesaler, or Retailer and pick Standard or Premium." },
                { step: "2", title: "14-day free trial", desc: "Trial starts from first login. No card required." },
                { step: "3", title: "Connect & operate", desc: "Link with trading partners and start tracking inventory, credit, and sales." },
              ].map((s) => (
                <div key={s.step}>
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mb-4">{s.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center bg-primary rounded-3xl p-12 sm:p-16">
            <h2 className="text-3xl font-bold text-white">Ready to connect your supply chain?</h2>
            <p className="mt-4 text-blue-100">14-day free trial. No credit card required.</p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/signup">Start free trial<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-chart-1/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground ring-1 ring-border">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Now serving 2,500+ businesses worldwide</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            Unified Supply Chain
            <span className="block text-primary">Management Platform</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
            Connect manufacturers, wholesalers, and retailers on one powerful platform. 
            Manage inventory, track credits, generate invoices, and grow your business with real-time insights.
          </p>
          
          {/* Business types */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Manufacturer</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span className="font-medium text-foreground">Wholesaler</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span className="font-medium text-foreground">Retailer</span>
          </div>
          
          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/marketplace">
                Explore Marketplace
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-6 text-base" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">
              Trusted by leading businesses
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {["Acme Corp", "GlobalTrade", "SupplyNet", "FastTrack", "MegaStore"].map((company) => (
                <span key={company} className="text-lg font-semibold text-muted-foreground/50">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

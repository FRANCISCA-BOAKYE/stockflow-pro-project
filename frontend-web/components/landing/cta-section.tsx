import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-primary rounded-3xl px-6 py-16 sm:px-16 lg:px-24 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
              Ready to streamline your supply chain?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
              Join thousands of businesses already using StockFlow Pro to manage inventory, 
              track credits, and grow their operations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="h-12 px-8 text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                asChild
              >
                <Link href="/signup">
                  Start 14-Day Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-12 px-8 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/60">
              No credit card required. Cancel anytime.
            </p>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  )
}

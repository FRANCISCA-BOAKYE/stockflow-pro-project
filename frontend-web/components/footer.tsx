import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-semibold text-lg text-foreground">StockFlow Pro</span>
            <p className="mt-3 text-sm text-muted-foreground">
              Integrated supply chain management for manufacturers, wholesalers, and retailers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Start free trial</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Tiers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Manufacturer</li>
              <li>Wholesaler</li>
              <li>Retailer</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
          © 2026 StockFlow Pro. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
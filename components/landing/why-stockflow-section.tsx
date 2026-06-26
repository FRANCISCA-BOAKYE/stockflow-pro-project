import { 
  TrendingUp, 
  Clock, 
  Shield, 
  Zap,
  Eye,
  Search
} from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    title: "Prevent Overselling",
    description: "Real-time inventory sync across all channels ensures you never sell what you don't have.",
  },
  {
    icon: Clock,
    title: "Real-time Stock Updates",
    description: "Instant visibility into stock levels, movements, and availability across your entire network.",
  },
  {
    icon: Shield,
    title: "Credit Risk Management",
    description: "Automated credit tracking and alerts help you manage risk and maintain healthy cash flow.",
  },
  {
    icon: Zap,
    title: "Invoice Automation",
    description: "Generate, send, and track invoices automatically. Reduce manual work and get paid faster.",
  },
  {
    icon: Eye,
    title: "Supply Chain Visibility",
    description: "End-to-end visibility from manufacturer to retailer. Track every order at every stage.",
  },
  {
    icon: Search,
    title: "Marketplace Discovery",
    description: "Find verified suppliers, compare prices, and expand your business network effortlessly.",
  },
]

export function WhyStockFlowSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-semibold text-chart-1 uppercase tracking-wider">Why StockFlow Pro</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Built for modern supply chains
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              StockFlow Pro eliminates the chaos of managing inventory, credits, and invoices across multiple systems. 
              Get one unified platform that grows with your business.
            </p>
            
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary">99.9%</div>
                <p className="text-sm text-muted-foreground mt-1">Uptime guarantee</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">2,500+</div>
                <p className="text-sm text-muted-foreground mt-1">Active businesses</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">$50M+</div>
                <p className="text-sm text-muted-foreground mt-1">Transactions processed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground mt-1">Customer support</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title}
                className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                  <benefit.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

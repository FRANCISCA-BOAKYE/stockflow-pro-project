import { 
  Package, 
  CreditCard, 
  FileText, 
  Factory, 
  ShoppingCart,
  BarChart3,
  Store,
  Users
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Real-time stock tracking across multiple locations. Prevent overselling and stockouts with intelligent alerts.",
  },
  {
    icon: CreditCard,
    title: "Credit Tracking",
    description: "Monitor credit balances, payment terms, and overdue accounts. Automate credit limit management.",
  },
  {
    icon: ShoppingCart,
    title: "POS Integration",
    description: "Seamless point-of-sale integration for retailers. Sync sales data in real-time with your inventory.",
  },
  {
    icon: FileText,
    title: "Invoice Generation",
    description: "Create professional invoices automatically. Track payments and send reminders for overdue invoices.",
  },
  {
    icon: Factory,
    title: "Production Planning",
    description: "Manufacturers can plan production based on demand forecasts and current stock levels.",
  },
  {
    icon: Store,
    title: "Stock Reservation",
    description: "Reserve stock for specific orders or customers. Ensure fulfillment for priority orders.",
  },
  {
    icon: Users,
    title: "Marketplace Discovery",
    description: "Connect with verified manufacturers and wholesalers. Discover new suppliers and expand your network.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive dashboards with actionable insights. Track performance and identify growth opportunities.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-sm font-semibold text-chart-1 uppercase tracking-wider">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything you need to run your supply chain
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools for manufacturers, wholesalers, and retailers to streamline operations and boost profitability.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card"
            >
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

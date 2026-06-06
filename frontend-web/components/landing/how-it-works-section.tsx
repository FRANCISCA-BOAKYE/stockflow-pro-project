import { Factory, Truck, Store, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Factory,
    title: "Manufacturer",
    description: "Create products, manage production schedules, and list inventory for wholesalers to discover and order.",
    features: ["Production planning", "Inventory listing", "Wholesale pricing"],
  },
  {
    icon: Truck,
    title: "Wholesaler",
    description: "Source from manufacturers, manage bulk inventory, and supply retailers with competitive pricing.",
    features: ["Bulk ordering", "Credit management", "Distribution network"],
  },
  {
    icon: Store,
    title: "Retailer",
    description: "Connect with wholesalers, manage store inventory, process sales, and track customer orders.",
    features: ["POS integration", "Stock alerts", "Sales analytics"],
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-sm font-semibold text-chart-1 uppercase tracking-wider">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Seamless supply chain flow
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            StockFlow Pro connects every link in your supply chain, from production to point of sale.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-border">
            <div className="absolute left-1/4 -translate-x-1/2 -top-2 text-muted-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="absolute left-3/4 -translate-x-1/2 -top-2 text-muted-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Step {index + 1}</span>
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-chart-1" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Mobile arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

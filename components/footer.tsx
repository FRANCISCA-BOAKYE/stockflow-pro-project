import Link from "next/link"
import { 
  Package, 
  CreditCard, 
  FileText, 
  Factory, 
  Store, 
  Truck,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

const footerNavigation = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Pricing", href: "/pricing" },
    { name: "Integrations", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Status", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Licenses", href: "#" },
  ],
}

const businessTypes = [
  { icon: Factory, label: "Manufacturer" },
  { icon: Truck, label: "Wholesaler" },
  { icon: Store, label: "Retailer" },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground flex items-center justify-center">
                <span className="text-primary font-bold text-lg">SF</span>
              </div>
              <div>
                <span className="font-bold text-xl">StockFlow Pro</span>
                <p className="text-xs text-primary-foreground/70">Integrated Supply Chain Management</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 max-w-xs leading-relaxed">
              Connecting Manufacturers, Wholesalers, and Retailers with powerful inventory management and supply chain solutions.
            </p>
            <div className="flex gap-4">
              {businessTypes.map((type) => (
                <div key={type.label} className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
                  <type.icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Product</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.product.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Company</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Resources</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Legal</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@stockflowpro.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/60">
              &copy; {new Date().getFullYear()} StockFlow Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

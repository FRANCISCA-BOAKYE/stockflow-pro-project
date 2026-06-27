import { Factory, Truck, MapPin, Package, CreditCard, Truck as Delivery, DollarSign, Phone, Mail } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface Business {
  id: string
  name: string
  type: "manufacturer" | "wholesaler"
  tier: "standard" | "premium"
  products: string[]
  priceRange: string
  deliveryTerms: string
  creditTerms: string
  minOrderQuantity: string
  location: string
  phone: string
  email: string
  rating: number
  reviewCount: number
  verified: boolean
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const TypeIcon = business.type === "manufacturer" ? Factory : Truck
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              business.type === "manufacturer" 
                ? "bg-chart-1/10 text-chart-1" 
                : "bg-chart-2/10 text-chart-2"
            }`}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{business.name}</h3>
                {business.verified && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {business.type}
                </Badge>
                <Badge 
                  variant={business.tier === "premium" ? "default" : "secondary"} 
                  className="text-xs capitalize"
                >
                  {business.tier}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Products */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Products</p>
          <div className="flex flex-wrap gap-1.5">
            {business.products.slice(0, 3).map((product) => (
              <Badge key={product} variant="secondary" className="text-xs font-normal">
                {product}
              </Badge>
            ))}
            {business.products.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{business.products.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* Business details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Price Range</p>
              <p className="font-medium text-foreground">{business.priceRange}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Min. Order</p>
              <p className="font-medium text-foreground">{business.minOrderQuantity}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Delivery className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="font-medium text-foreground">{business.deliveryTerms}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Credit</p>
              <p className="font-medium text-foreground">{business.creditTerms}</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Contact info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{business.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{business.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{business.email}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button className="w-full group-hover:bg-primary/90 transition-colors">
          Connect
        </Button>
      </CardFooter>
    </Card>
  )
}

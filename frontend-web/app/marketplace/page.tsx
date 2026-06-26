"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters"
import { BusinessCard, Business } from "@/components/marketplace/business-card"
import { Button } from "@/components/ui/button"

// Mock data for businesses
const mockBusinesses: Business[] = [
  {
    id: "1",
    name: "Pacific Electronics Manufacturing",
    type: "manufacturer",
    tier: "premium",
    products: ["Smartphones", "Tablets", "Accessories", "Chargers"],
    priceRange: "$10 - $500",
    deliveryTerms: "7-14 days",
    creditTerms: "Net 30",
    minOrderQuantity: "500 units",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    email: "sales@pacificelec.com",
    rating: 4.8,
    reviewCount: 156,
    verified: true,
  },
  {
    id: "2",
    name: "Global Food Distributors",
    type: "wholesaler",
    tier: "premium",
    products: ["Canned Goods", "Beverages", "Snacks", "Dairy"],
    priceRange: "$2 - $50",
    deliveryTerms: "3-5 days",
    creditTerms: "Net 15",
    minOrderQuantity: "100 cases",
    location: "Chicago, IL",
    phone: "+1 (555) 234-5678",
    email: "orders@globalfood.com",
    rating: 4.6,
    reviewCount: 89,
    verified: true,
  },
  {
    id: "3",
    name: "Textile Masters Inc",
    type: "manufacturer",
    tier: "standard",
    products: ["Cotton Fabric", "Polyester", "Silk", "Linen"],
    priceRange: "$5 - $100/yard",
    deliveryTerms: "14-21 days",
    creditTerms: "Net 45",
    minOrderQuantity: "1000 yards",
    location: "Mumbai, India",
    phone: "+91 22 1234 5678",
    email: "export@textilemasters.in",
    rating: 4.5,
    reviewCount: 67,
    verified: true,
  },
  {
    id: "4",
    name: "BuildRight Materials",
    type: "wholesaler",
    tier: "standard",
    products: ["Cement", "Steel", "Lumber", "Hardware"],
    priceRange: "$20 - $2000",
    deliveryTerms: "5-7 days",
    creditTerms: "Net 30",
    minOrderQuantity: "1 ton",
    location: "Houston, TX",
    phone: "+1 (555) 345-6789",
    email: "supply@buildright.com",
    rating: 4.3,
    reviewCount: 45,
    verified: false,
  },
  {
    id: "5",
    name: "AutoParts Global",
    type: "manufacturer",
    tier: "premium",
    products: ["Brake Pads", "Filters", "Batteries", "Spark Plugs"],
    priceRange: "$5 - $300",
    deliveryTerms: "10-15 days",
    creditTerms: "Net 60",
    minOrderQuantity: "200 units",
    location: "Los Angeles, CA",
    phone: "+1 (555) 456-7890",
    email: "wholesale@autopartsglobal.com",
    rating: 4.7,
    reviewCount: 112,
    verified: true,
  },
  {
    id: "6",
    name: "PharmaCare Distributors",
    type: "wholesaler",
    tier: "premium",
    products: ["OTC Medicines", "Supplements", "Medical Supplies"],
    priceRange: "$3 - $150",
    deliveryTerms: "2-4 days",
    creditTerms: "Net 30",
    minOrderQuantity: "50 units",
    location: "New York, NY",
    phone: "+1 (555) 567-8901",
    email: "orders@pharmacare.com",
    rating: 4.9,
    reviewCount: 203,
    verified: true,
  },
  {
    id: "7",
    name: "Consumer Goods Factory",
    type: "manufacturer",
    tier: "standard",
    products: ["Kitchenware", "Home Decor", "Storage", "Cleaning"],
    priceRange: "$1 - $80",
    deliveryTerms: "21-30 days",
    creditTerms: "Net 30",
    minOrderQuantity: "1000 units",
    location: "Lagos, Nigeria",
    phone: "+234 1 234 5678",
    email: "export@cgfactory.ng",
    rating: 4.2,
    reviewCount: 34,
    verified: false,
  },
  {
    id: "8",
    name: "TechWholesale UK",
    type: "wholesaler",
    tier: "premium",
    products: ["Laptops", "Monitors", "Peripherals", "Networking"],
    priceRange: "$50 - $2000",
    deliveryTerms: "5-10 days",
    creditTerms: "Net 45",
    minOrderQuantity: "25 units",
    location: "London, UK",
    phone: "+44 20 1234 5678",
    email: "sales@techwholesale.co.uk",
    rating: 4.6,
    reviewCount: 78,
    verified: true,
  },
  {
    id: "9",
    name: "Industrial Machines Co",
    type: "manufacturer",
    tier: "premium",
    products: ["CNC Machines", "Conveyors", "Packaging Equipment"],
    priceRange: "$5000 - $500000",
    deliveryTerms: "45-90 days",
    creditTerms: "Custom",
    minOrderQuantity: "1 unit",
    location: "Chicago, IL",
    phone: "+1 (555) 678-9012",
    email: "inquiries@indmachines.com",
    rating: 4.8,
    reviewCount: 56,
    verified: true,
  },
  {
    id: "10",
    name: "Fresh Produce Wholesale",
    type: "wholesaler",
    tier: "standard",
    products: ["Fruits", "Vegetables", "Organic Produce"],
    priceRange: "$1 - $20/lb",
    deliveryTerms: "1-2 days",
    creditTerms: "COD",
    minOrderQuantity: "100 lbs",
    location: "Miami, FL",
    phone: "+1 (555) 789-0123",
    email: "orders@freshwholesale.com",
    rating: 4.4,
    reviewCount: 92,
    verified: true,
  },
  {
    id: "11",
    name: "Apparel Manufacturing Ltd",
    type: "manufacturer",
    tier: "standard",
    products: ["T-Shirts", "Jeans", "Jackets", "Sportswear"],
    priceRange: "$5 - $100",
    deliveryTerms: "30-45 days",
    creditTerms: "Net 30",
    minOrderQuantity: "500 pieces",
    location: "Mumbai, India",
    phone: "+91 22 9876 5432",
    email: "export@apparelmfg.in",
    rating: 4.3,
    reviewCount: 41,
    verified: false,
  },
  {
    id: "12",
    name: "Office Supplies Central",
    type: "wholesaler",
    tier: "standard",
    products: ["Stationery", "Furniture", "Tech Accessories"],
    priceRange: "$1 - $500",
    deliveryTerms: "3-7 days",
    creditTerms: "Net 15",
    minOrderQuantity: "20 items",
    location: "New York, NY",
    phone: "+1 (555) 890-1234",
    email: "bulk@officesupplies.com",
    rating: 4.5,
    reviewCount: 67,
    verified: true,
  },
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [businessType, setBusinessType] = useState("all")
  const [location, setLocation] = useState("All Locations")
  const [productCategory, setProductCategory] = useState("All Categories")
  const [visibleCount, setVisibleCount] = useState(6)

  const clearFilters = () => {
    setSearchQuery("")
    setBusinessType("all")
    setLocation("All Locations")
    setProductCategory("All Categories")
  }

  const filteredBusinesses = useMemo(() => {
    return mockBusinesses.filter((business) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = business.name.toLowerCase().includes(query)
        const matchesProducts = business.products.some(p => p.toLowerCase().includes(query))
        if (!matchesName && !matchesProducts) return false
      }

      // Business type filter
      if (businessType !== "all" && business.type !== businessType) {
        return false
      }

      // Location filter
      if (location !== "All Locations" && !business.location.includes(location.split(",")[0])) {
        return false
      }

      return true
    })
  }, [searchQuery, businessType, location, productCategory])

  const visibleBusinesses = filteredBusinesses.slice(0, visibleCount)
  const hasMore = visibleCount < filteredBusinesses.length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Marketplace</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover verified manufacturers and wholesalers. Connect and grow your business.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <MarketplaceFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              businessType={businessType}
              setBusinessType={setBusinessType}
              location={location}
              setLocation={setLocation}
              productCategory={productCategory}
              setProductCategory={setProductCategory}
              clearFilters={clearFilters}
            />
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {visibleBusinesses.length} of {filteredBusinesses.length} businesses
            </p>
          </div>

          {/* Business cards grid */}
          {filteredBusinesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>

              {/* Load more button */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                  >
                    Load More Businesses
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No businesses found matching your criteria.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

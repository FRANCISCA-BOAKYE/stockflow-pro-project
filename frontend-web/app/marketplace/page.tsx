"use client"
import { useState, useMemo, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Star, ShieldCheck } from "lucide-react"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

interface Listing {
  id: string
  name: string
  type: string
  location: string
  products: string[]
  priceRange: string
  moq: string
  deliveryTerms: string
  creditTerms: string
  rating: number
  verified: boolean
}

const FALLBACK_LISTINGS: Listing[] = [
  { id: "1", name: "Acme Manufacturing", type: "MANUFACTURER", location: "Kumasi, Ghana", products: ["Steel Parts", "Aluminium Sheets"], priceRange: "$10 – $500", moq: "100 units", deliveryTerms: "7–14 days", creditTerms: "Net 30", rating: 4.8, verified: true },
  { id: "2", name: "Apex Distributors", type: "WHOLESALER", location: "Accra, Ghana", products: ["Beverages", "Dry Goods"], priceRange: "$5 – $200", moq: "50 units", deliveryTerms: "3–5 days", creditTerms: "Net 15", rating: 4.6, verified: true },
  { id: "3", name: "Metro Wholesale", type: "WHOLESALER", location: "Tema, Ghana", products: ["Cement", "Steel"], priceRange: "$20 – $2,000", moq: "1 ton", deliveryTerms: "5–7 days", creditTerms: "Net 30", rating: 4.3, verified: false },
  { id: "4", name: "GoldCoast Manufacturers", type: "MANUFACTURER", location: "Cape Coast, Ghana", products: ["Textiles", "Garments"], priceRange: "$5 – $300", moq: "200 units", deliveryTerms: "10–15 days", creditTerms: "Net 60", rating: 4.7, verified: true },
  { id: "5", name: "Volta Distributors", type: "WHOLESALER", location: "Ho, Ghana", products: ["Electronics", "Appliances"], priceRange: "$50 – $5,000", moq: "5 units", deliveryTerms: "2–4 days", creditTerms: "Net 30", rating: 4.9, verified: true },
]

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")

  useEffect(() => {
    fetch(`${API_BASE_URL}/marketplace/listings`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setListings(data.map((item: any) => ({
            id: String(item.id),
            name: item.businessName || item.headline || "Business",
            type: item.tierType || "MANUFACTURER",
            location: item.location || "Ghana",
            products: item.productsOffered ? item.productsOffered.split(",") : [],
            priceRange: item.priceRange || "Contact for pricing",
            moq: item.minOrderQuantity || "Contact seller",
            deliveryTerms: item.deliveryTerms || "TBD",
            creditTerms: item.creditTerms || "TBD",
            rating: 4.5,
            verified: true,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    return listings.filter(l => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.products.some(p => p.toLowerCase().includes(search.toLowerCase()))
      const matchType = typeFilter === "ALL" || l.type === typeFilter
      return matchSearch && matchType
    })
  }, [listings, search, typeFilter])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold sm:text-4xl">Marketplace</h1>
            <p className="mt-2 text-lg text-muted-foreground">Discover manufacturers and wholesalers. No account required to browse.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or product..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {["ALL", "MANUFACTURER", "WHOLESALER"].map(t => (
                <Button key={t} variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)}>
                  {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} businesses found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(listing => (
              <Card key={listing.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{listing.type.charAt(0) + listing.type.slice(1).toLowerCase()}</Badge>
                    {listing.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-200"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />{listing.rating}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{listing.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.location}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.products.map(p => <Badge key={p} variant="secondary" className="font-normal">{p}</Badge>)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/50 rounded-lg p-3">
                    <div><p className="text-muted-foreground">Price range</p><p className="font-medium">{listing.priceRange}</p></div>
                    <div><p className="text-muted-foreground">Min. order</p><p className="font-medium">{listing.moq}</p></div>
                    <div><p className="text-muted-foreground">Delivery</p><p className="font-medium">{listing.deliveryTerms}</p></div>
                    <div><p className="text-muted-foreground">Credit terms</p><p className="font-medium">{listing.creditTerms}</p></div>
                  </div>
                  <Button className="w-full">Contact</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
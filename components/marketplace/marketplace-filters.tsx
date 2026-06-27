"use client"

import { useState } from "react"
import { Search, MapPin, Filter, Factory, Truck, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface MarketplaceFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  businessType: string
  setBusinessType: (type: string) => void
  location: string
  setLocation: (location: string) => void
  productCategory: string
  setProductCategory: (category: string) => void
  clearFilters: () => void
}

const locations = [
  "All Locations",
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Miami, FL",
  "San Francisco, CA",
  "Lagos, Nigeria",
  "London, UK",
  "Mumbai, India",
]

const productCategories = [
  "All Categories",
  "Electronics",
  "Food & Beverages",
  "Textiles & Apparel",
  "Building Materials",
  "Automotive Parts",
  "Pharmaceuticals",
  "Consumer Goods",
  "Industrial Equipment",
]

export function MarketplaceFilters({
  searchQuery,
  setSearchQuery,
  businessType,
  setBusinessType,
  location,
  setLocation,
  productCategory,
  setProductCategory,
  clearFilters,
}: MarketplaceFiltersProps) {
  const hasActiveFilters = searchQuery || businessType !== "all" || location !== "All Locations" || productCategory !== "All Categories"

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses, products, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={businessType} onValueChange={setBusinessType}>
            <SelectTrigger className="w-[160px] h-11">
              <SelectValue placeholder="Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="wholesaler">Wholesaler</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[180px] h-11">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={productCategory} onValueChange={setProductCategory}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden h-11 w-11">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <Label>Business Type</Label>
                  <div className="space-y-2">
                    {["all", "manufacturer", "wholesaler"].map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-${type}`}
                          checked={businessType === type}
                          onCheckedChange={() => setBusinessType(type)}
                        />
                        <Label htmlFor={`mobile-${type}`} className="capitalize">
                          {type === "all" ? "All Types" : type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {businessType !== "all" && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {businessType}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setBusinessType("all")} />
            </Badge>
          )}
          {location !== "All Locations" && (
            <Badge variant="secondary" className="gap-1">
              {location}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation("All Locations")} />
            </Badge>
          )}
          {productCategory !== "All Categories" && (
            <Badge variant="secondary" className="gap-1">
              {productCategory}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setProductCategory("All Categories")} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

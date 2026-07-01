"use client"
import { useState, useMemo, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, MapPin, Star, ShieldCheck, ArrowRight, Zap } from "lucide-react"

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
  { id: "6", name: "Ashanti Steel Works", type: "MANUFACTURER", location: "Kumasi, Ghana", products: ["Steel Rods", "Iron Sheets"], priceRange: "$15 – $800", moq: "500 kg", deliveryTerms: "5–10 days", creditTerms: "Net 45", rating: 4.5, verified: true },
]

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  MANUFACTURER: { label: "Manufacturer", bg: "rgba(239,246,255,1)", text: "#1a56db", border: "rgba(219,234,254,1)" },
  WHOLESALER: { label: "Wholesaler", bg: "rgba(255,251,235,1)", text: "#c27803", border: "rgba(253,230,138,1)" },
  RETAILER: { label: "Retailer", bg: "rgba(236,253,245,1)", text: "#059669", border: "rgba(167,243,208,1)" },
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")

  useEffect(() => {
    fetch(`${API_BASE_URL}/marketplace/listings`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setListings(data.map((item: any) => {
            const b = item.business || item
            return {
              id: String(b.id || item.id),
              name: b.name || b.businessName || "Business",
              type: b.tierType || "MANUFACTURER",
              location: item.location || b.location || "Ghana",
              products: item.productsOffered ? item.productsOffered.split(",") : item.products || [],
              priceRange: item.priceRange || "Contact for pricing",
              moq: item.minOrderQuantity || "Contact seller",
              deliveryTerms: item.deliveryTerms || "TBD",
              creditTerms: item.creditTerms || "TBD",
              rating: 4.5,
              verified: b.subscriptionStatus === "ACTIVE" || b.subscriptionStatus === "TRIAL",
            }
          }))
        }
      }).catch(() => {})
  }, [])

  const filtered = useMemo(() => listings.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.products.some(p => p.toLowerCase().includes(search.toLowerCase()))
    const matchType = typeFilter === "ALL" || l.type === typeFilter
    return matchSearch && matchType
  }), [listings, search, typeFilter])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="pt-32 pb-16 px-6 lg:px-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f1f4a 50%, #1a0533 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.1)', filter: 'blur(60px)' }} />
          <div className="mx-auto max-w-4xl text-center relative">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '24px' }}>
              <Zap style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
              <span style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 500 }}>Open marketplace</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2 }}>
              Find your next<br />
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                trading partner
              </span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '32px' }}>
              Discover verified manufacturers and wholesalers. No account required to browse.
            </p>
            <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
              <Search style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by name or product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', height: '56px', paddingLeft: '50px', paddingRight: '20px',
                  borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                  fontSize: '15px', color: '#ffffff', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12 px-6 lg:px-8 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {["ALL", "MANUFACTURER", "WHOLESALER"].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)} style={{
                    padding: '8px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    backgroundColor: typeFilter === t ? '#0f172a' : '#ffffff',
                    color: typeFilter === t ? '#ffffff' : '#64748b',
                    boxShadow: typeFilter === t ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    {t === "ALL" ? "All businesses" : t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{filtered.length} businesses found</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(listing => {
                const tc = TYPE_CONFIG[listing.type] || TYPE_CONFIG.MANUFACTURER
                return (
                  <div key={listing.id} style={{
                    backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px',
                    border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', backgroundColor: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                          {tc.label}
                        </span>
                        {listing.verified && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '8px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
                            <ShieldCheck style={{ width: '11px', height: '11px' }} />Verified
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star style={{ width: '13px', height: '13px', color: '#f59e0b', fill: '#f59e0b' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{listing.rating}</span>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{listing.name}</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                      <MapPin style={{ width: '12px', height: '12px' }} />{listing.location}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {listing.products.length > 0 ? listing.products.map(p => (
                        <span key={p} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 500 }}>{p}</span>
                      )) : (
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8' }}>Contact for product list</span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                      {[
                        { label: "Price range", value: listing.priceRange },
                        { label: "Min. order", value: listing.moq },
                        { label: "Delivery", value: listing.deliveryTerms },
                        { label: "Credit terms", value: listing.creditTerms },
                      ].map(d => (
                        <div key={d.label}>
                          <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px', fontWeight: 500 }}>{d.label}</p>
                          <p style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                    <button style={{
                      width: '100%', padding: '12px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1a56db, #4f46e5)',
                      color: '#ffffff', fontWeight: 600, fontSize: '13px',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      Contact <ArrowRight style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
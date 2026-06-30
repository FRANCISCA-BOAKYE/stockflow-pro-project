"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, AlertTriangle, CreditCard, Calendar, ShoppingCart, LogOut, DollarSign, Factory, Users, FileText, Smartphone, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    const token = localStorage.getItem("sf_token")
    if (!stored || !token) { router.replace("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetch(`${API_BASE_URL}/reports/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("sf_token")
    localStorage.removeItem("sf_user")
    router.replace("/login")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )

  const tier = user?.tierType || "RETAILER"
  const initials = user?.name ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "U"

  const statsByTier: Record<string, { title: string; value: string; icon: any }[]> = {
    MANUFACTURER: [
      { title: "Raw Materials", value: data?.totalMaterials != null ? String(data.totalMaterials) : "—", icon: Package },
      { title: "Low Stock", value: data?.lowStockCount != null ? String(data.lowStockCount) : "—", icon: AlertTriangle },
      { title: "Production Runs", value: data?.productionRunsThisMonth != null ? String(data.productionRunsThisMonth) : "—", icon: Factory },
      { title: "Credit Owed", value: data?.totalCreditOwedByWholesalers != null ? `$${Number(data.totalCreditOwedByWholesalers).toFixed(2)}` : "$0.00", icon: CreditCard },
    ],
    WHOLESALER: [
      { title: "Warehouse Stock", value: data?.totalStockItems != null ? String(data.totalStockItems) : "—", icon: Package },
      { title: "Credit Owed", value: data?.totalCreditOwedByRetailers != null ? `$${Number(data.totalCreditOwedByRetailers).toFixed(2)}` : "$0.00", icon: CreditCard },
      { title: "Today's Sales", value: data?.todaySalesUsd != null ? `$${Number(data.todaySalesUsd).toFixed(2)}` : "$0.00", icon: DollarSign },
      { title: "Active Retailers", value: data?.activeRetailers != null ? String(data.activeRetailers) : "—", icon: Users },
    ],
    RETAILER: [
      { title: "Today's Sales", value: data?.todaySalesUsd != null ? `$${Number(data.todaySalesUsd).toFixed(2)}` : "$0.00", icon: ShoppingCart },
      { title: "Low Stock", value: data?.lowStockCount != null ? String(data.lowStockCount) : "—", icon: AlertTriangle },
      { title: "Credit Owed", value: data?.totalCreditOwedByCustomers != null ? `$${Number(data.totalCreditOwedByCustomers).toFixed(2)}` : "$0.00", icon: CreditCard },
      { title: "Total Products", value: data?.totalProducts != null ? String(data.totalProducts) : "—", icon: Package },
    ],
  }

  const stats = statsByTier[tier] || statsByTier.RETAILER

 const quickLinks = [
  { label: "Manage sub-accounts", icon: Users, desc: "View team members and their roles", href: "/accounts" },
  { label: "Invoices", icon: FileText, desc: "View and generate invoices", href: "/invoices" },
  { label: "Credit accounts", icon: CreditCard, desc: "Track money owed and owing", href: "/credit" },
  { label: "Marketplace listing", icon: Store, desc: "Edit your public business profile", href: "/marketplace" },
]

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{user?.businessName || "Dashboard"}</h1>
            <p className="text-xs text-muted-foreground capitalize">{tier.toLowerCase()} · {user?.subscriptionPlan} · {user?.subscriptionStatus}</p>
          </div>
          <div className="flex items-center gap-4">
            <Avatar><AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback></Avatar>
            <Button variant="ghost" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Log out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {user?.subscriptionStatus === "TRIAL" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">Your 14-day free trial is active. Your data is always safe, even after the trial ends.</p>
          </div>
        )}

        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Day-to-day operations happen on the mobile app</p>
                <p className="text-sm text-blue-100">POS, inventory, production, and credit accounts are managed from your phone. This web dashboard is your business overview.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Manage your business</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(link => (
  <Link key={link.label} href={link.href}>
    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
      <CardContent className="pt-6">
        <link.icon className="h-6 w-6 text-primary mb-3" />
        <p className="font-medium text-sm">{link.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
      </CardContent>
    </Card>
  </Link>
))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Need help getting started?</CardTitle>
            <CardDescription>Browse the marketplace to find trading partners, or check your plan details.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Button variant="outline" asChild><Link href="/marketplace">Browse marketplace</Link></Button>
            <Button variant="outline" asChild><Link href="/pricing">View plans</Link></Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
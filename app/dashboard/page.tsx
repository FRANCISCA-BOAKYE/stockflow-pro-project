"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Package, DollarSign, AlertTriangle, TrendingUp, Clock,
  Truck, FileText, Users, Factory, Store, Bell, Settings,
  Menu, ChevronRight, ArrowUpRight, ArrowDownRight, BarChart3,
  CreditCard, Calendar, ShoppingCart, LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

const FloatingBoxLogo = () => (
  <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A"/>
    <polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="45,22 66,33 45,44 24,33" fill="url(#d1)" opacity="0.8"/>
    <polygon points="24,33 45,44 45,66 24,55" fill="url(#d2)" opacity="0.6"/>
    <polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4"/>
    <line x1="45" y1="22" x2="45" y2="14" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
    <line x1="24" y1="33" x2="16" y2="29" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
    <line x1="66" y1="33" x2="74" y2="29" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
    <path d="M71 16 L72 19 L75 20 L72 21 L71 24 L70 21 L67 20 L70 19 Z" fill="#60A5FA" opacity="0.8"/>
    <path d="M18 62 L19 64 L21 65 L19 66 L18 68 L17 66 L15 65 L17 64 Z" fill="#60A5FA" opacity="0.6"/>
    <path d="M76 54 L77 56 L79 57 L77 58 L76 60 L75 58 L73 57 L75 56 Z" fill="#60A5FA" opacity="0.5"/>
    <circle cx="45" cy="44" r="4" fill="white" opacity="0.9"/>
    <circle cx="45" cy="44" r="2" fill="#1A56DB"/>
    <defs>
      <linearGradient id="d1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#60A5FA"/>
        <stop offset="100%" stopColor="#1A56DB"/>
      </linearGradient>
      <linearGradient id="d2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#1E3A8A"/>
      </linearGradient>
    </defs>
  </svg>
)

function DashboardSidebar({ tier, onLogout }: { tier: string, onLogout: () => void }) {
  const navItems: Record<string, { icon: React.ElementType, label: string, active?: boolean }[]> = {
    MANUFACTURER: [
      { icon: BarChart3, label: "Dashboard", active: true },
      { icon: Package, label: "Materials" },
      { icon: Factory, label: "Production" },
      { icon: Users, label: "Wholesalers" },
      { icon: FileText, label: "Invoices" },
      { icon: CreditCard, label: "Credit" },
      { icon: TrendingUp, label: "Analytics" },
    ],
    WHOLESALER: [
      { icon: BarChart3, label: "Dashboard", active: true },
      { icon: Package, label: "Warehouse" },
      { icon: ShoppingCart, label: "Sell" },
      { icon: Users, label: "Partners" },
      { icon: FileText, label: "Invoices" },
      { icon: CreditCard, label: "Credit" },
      { icon: Truck, label: "Deliveries" },
    ],
    RETAILER: [
      { icon: BarChart3, label: "Dashboard", active: true },
      { icon: Package, label: "Products" },
      { icon: ShoppingCart, label: "POS" },
      { icon: Users, label: "Suppliers" },
      { icon: FileText, label: "Invoices" },
      { icon: TrendingUp, label: "Sales" },
      { icon: Calendar, label: "Reports" },
    ],
  }

  const items = navItems[tier] || navItems.RETAILER

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <FloatingBoxLogo />
          <div>
            <p className="font-semibold text-foreground">StockFlow Pro</p>
            <Badge variant="secondary" className="text-xs capitalize">
              {tier.charAt(0) + tier.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              item.active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}

function DashboardHeader({ user, onLogout }: { user: any, onLogout: () => void }) {
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{user?.businessName || "Dashboard"}</h1>
            <p className="text-xs text-muted-foreground">{user?.tierType} · {user?.subscriptionStatus}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user?.name || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function StatCard({ title, value, change, trend, icon: Icon }: {
  title: string, value: string, change?: string,
  trend?: "up" | "down", icon: React.ElementType
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {change}
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ManufacturerDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Raw Materials" value={data?.totalMaterials ?? "—"} icon={Package} />
        <StatCard title="Credit Outstanding" value={data?.totalCreditOwedByWholesalers != null ? `$${data.totalCreditOwedByWholesalers.toFixed(2)}` : "$0.00"} icon={CreditCard} />
        <StatCard title="Low Stock Items" value={data?.lowStockCount ?? "—"} icon={AlertTriangle} />
        <StatCard title="Production Runs" value={data?.productionRunsThisMonth ?? "—"} change="+18%" trend="up" icon={Factory} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <CardDescription>Materials below reorder level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Steel Rods 6mm", stock: 240, reorder: 300, progress: 80 },
                { name: "Industrial Adhesive", stock: 48, reorder: 100, progress: 48 },
                { name: "Cotton Fabric 1m", stock: 80, reorder: 200, progress: 40 },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{item.stock} / {item.reorder}</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { msg: "Production run #24 completed — 500 units", type: "success" },
                { msg: "Low stock: Steel Rods 6mm", type: "warning" },
                { msg: "Dispatch to Apex Distributors — $12,400", type: "info" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${a.type === "warning" ? "text-amber-500" : a.type === "success" ? "text-green-500" : "text-blue-500"}`} />
                  <p className="text-sm text-muted-foreground">{a.msg}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WholesalerDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Warehouse Stock" value={data?.totalStockItems ?? "—"} change="+5.2%" trend="up" icon={Package} />
        <StatCard title="Credit Outstanding" value={data?.totalCreditOwedByRetailers != null ? `$${data.totalCreditOwedByRetailers.toFixed(2)}` : "$0.00"} icon={CreditCard} />
        <StatCard title="Active Retailers" value="156" change="+8" trend="up" icon={Users} />
        <StatCard title="Today's Revenue" value={data?.todaySalesUsd != null ? `$${data.todaySalesUsd.toFixed(2)}` : "$0.00"} change="+22%" trend="up" icon={DollarSign} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest bulk orders from retailers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { retailer: "Bright Mart Retail", amount: "$2,800", status: "completed" },
                { retailer: "Delta Stores", amount: "$1,400", status: "pending" },
                { retailer: "City Mart", amount: "$3,200", status: "completed" },
              ].map((order, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{order.retailer}</p>
                    <p className="text-sm text-muted-foreground">{order.amount}</p>
                  </div>
                  <Badge variant="secondary" className={order.status === "completed" ? "text-green-600" : "text-amber-600"}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Credit Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Bright Mart Retail", balance: 4200, limit: 10000 },
                { name: "Sunrise Shop", balance: 6800, limit: 10000 },
                { name: "Delta Stores", balance: 1480, limit: 5000 },
              ].map((credit) => (
                <div key={credit.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{credit.name}</span>
                    <span className="text-muted-foreground">${credit.balance.toLocaleString()} / ${credit.limit.toLocaleString()}</span>
                  </div>
                  <Progress value={(credit.balance / credit.limit) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RetailerDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={data?.todaySalesUsd != null ? `$${data.todaySalesUsd.toFixed(2)}` : "$0.00"} change="+15%" trend="up" icon={ShoppingCart} />
        <StatCard title="Low Stock Items" value={data?.lowStockCount ?? "—"} icon={AlertTriangle} />
        <StatCard title="Credit Outstanding" value={data?.totalCreditOwedByCustomers != null ? `$${data.totalCreditOwedByCustomers.toFixed(2)}` : "$0.00"} icon={CreditCard} />
        <StatCard title="Total Products" value={data?.totalProducts ?? "—"} change="+8.5%" trend="up" icon={Package} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <CardDescription>Products below reorder level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Mineral Water 1L", stock: 4, reorder: 20 },
                { name: "Rice 1kg", stock: 6, reorder: 30 },
                { name: "Bread Loaf", stock: 8, reorder: 25 },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Reorder at: {item.reorder} units</p>
                  </div>
                  <Badge variant="destructive">{item.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-between" variant="outline">
              New Sale <ChevronRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              Place Order <ChevronRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              View Invoices <ChevronRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              Inventory Count <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
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
    if (!stored || !token) {
      router.replace("/login")
      return
    }
    const u = JSON.parse(stored)
    setUser(u)
    fetch(`${API_BASE_URL}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("sf_token")
    localStorage.removeItem("sf_user")
    router.replace("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const tier = user?.tierType || "RETAILER"

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar tier={tier} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 p-6 overflow-auto">
          {tier === "MANUFACTURER" && <ManufacturerDashboard data={data} />}
          {tier === "WHOLESALER" && <WholesalerDashboard data={data} />}
          {tier === "RETAILER" && <RetailerDashboard data={data} />}
        </main>
        <div className="p-4 border-t border-border bg-card text-center">
          <p className="text-sm text-muted-foreground">
            StockFlow Pro · {user?.businessName} · {user?.subscriptionStatus} plan
          </p>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  Truck,
  FileText,
  Users,
  Factory,
  Store,
  Bell,
  Settings,
  Menu,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CreditCard,
  Calendar,
  ShoppingCart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Shared dashboard sidebar component
function DashboardSidebar({ tier }: { tier: "manufacturer" | "wholesaler" | "retailer" }) {
  const TierIcon = tier === "manufacturer" ? Factory : tier === "wholesaler" ? Truck : Store
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)
  
  const navItems = {
    manufacturer: [
      { icon: BarChart3, label: "Dashboard", active: true },
      { icon: Package, label: "Inventory" },
      { icon: Factory, label: "Production" },
      { icon: Users, label: "Wholesalers" },
      { icon: FileText, label: "Invoices" },
      { icon: CreditCard, label: "Credit" },
      { icon: TrendingUp, label: "Analytics" },
    ],
    wholesaler: [
      { icon: BarChart3, label: "Dashboard", active: true },
      { icon: Package, label: "Inventory" },
      { icon: ShoppingCart, label: "Orders" },
      { icon: Users, label: "Partners" },
      { icon: FileText, label: "Invoices" },
      { icon: CreditCard, label: "Credit" },
      { icon: Truck, label: "Deliveries" },
    ],
    retailer: [
      { icon: BarChart3, label: "Dashboard", active: true },
      { icon: Package, label: "Inventory" },
      { icon: ShoppingCart, label: "POS" },
      { icon: Users, label: "Suppliers" },
      { icon: FileText, label: "Invoices" },
      { icon: TrendingUp, label: "Sales" },
      { icon: Calendar, label: "Reports" },
    ],
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">SF</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">StockFlow Pro</p>
            <Badge variant="secondary" className="text-xs capitalize">{tierName}</Badge>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems[tier].map((item) => (
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
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  )
}

// Dashboard header
function DashboardHeader({ businessName }: { businessName: string }) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{businessName}</h1>
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
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">John Doe</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

// Stat card component
function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon 
}: { 
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: React.ElementType
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
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

// Manufacturer Dashboard
function ManufacturerDashboard() {
  const alerts = [
    { message: "Low stock: Raw Material A (50 units remaining)", type: "warning" },
    { message: "Production batch #234 completed", type: "success" },
    { message: "New order from Global Distributors", type: "info" },
  ]

  const recentTransactions = [
    { id: "TXN-001", partner: "Pacific Distributors", amount: 45000, status: "completed" },
    { id: "TXN-002", partner: "Metro Wholesale", amount: 28500, status: "pending" },
    { id: "TXN-003", partner: "Quick Supply Co", amount: 12000, status: "completed" },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stock Value" value="$847,500" change="+12.5%" trend="up" icon={Package} />
        <StatCard title="Credit Balance" value="$125,000" change="-8.2%" trend="down" icon={CreditCard} />
        <StatCard title="Pending Orders" value="23" change="+5" trend="up" icon={Clock} />
        <StatCard title="Production Output" value="1,250 units" change="+18%" trend="up" icon={Factory} />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <CardDescription>Items that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Raw Material A", stock: 50, reorder: 100, progress: 50 },
                { name: "Component B", stock: 25, reorder: 75, progress: 33 },
                { name: "Packaging Unit", stock: 200, reorder: 500, progress: 40 },
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

        {/* Recent activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.type === "warning" ? "text-amber-500" : 
                    alert.type === "success" ? "text-green-500" : "text-blue-500"
                  }`} />
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="border-border/50">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Latest orders and payments</CardDescription>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-foreground">{txn.partner}</p>
                  <p className="text-sm text-muted-foreground">{txn.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">${txn.amount.toLocaleString()}</p>
                  <Badge variant="secondary" className={txn.status === "completed" ? "text-green-600" : "text-amber-600"}>
                    {txn.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wholesaler Dashboard
function WholesalerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Inventory" value="12,450 units" change="+5.2%" trend="up" icon={Package} />
        <StatCard title="Overdue Payments" value="$42,300" change="+12%" trend="up" icon={AlertTriangle} />
        <StatCard title="Active Retailers" value="156" change="+8" trend="up" icon={Users} />
        <StatCard title="Monthly Revenue" value="$284,000" change="+22%" trend="up" icon={DollarSign} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Delivery Schedule</CardTitle>
            <CardDescription>Upcoming deliveries this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { retailer: "QuickMart Stores", date: "Today, 2:00 PM", items: 45 },
                { retailer: "Metro Supermarket", date: "Tomorrow, 10:00 AM", items: 120 },
                { retailer: "Corner Shop Plus", date: "Wed, 3:00 PM", items: 30 },
              ].map((delivery, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{delivery.retailer}</p>
                    <p className="text-sm text-muted-foreground">{delivery.date}</p>
                  </div>
                  <Badge variant="secondary">{delivery.items} items</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Credit Summary</CardTitle>
            <CardDescription>Outstanding balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Metro Supermarket", balance: 15000, limit: 25000 },
                { name: "QuickMart Stores", balance: 8500, limit: 15000 },
                { name: "Corner Shop Plus", balance: 3200, limit: 5000 },
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

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">4</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Retailer Dashboard
function RetailerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value="$3,240" change="+15%" trend="up" icon={ShoppingCart} />
        <StatCard title="Low Stock Items" value="8" change="-3" trend="down" icon={AlertTriangle} />
        <StatCard title="Active Orders" value="12" icon={Clock} />
        <StatCard title="Monthly Revenue" value="$48,500" change="+8.5%" trend="up" icon={TrendingUp} />
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
                { name: "Product A - SKU001", stock: 5, reorder: 20 },
                { name: "Product B - SKU045", stock: 12, reorder: 30 },
                { name: "Product C - SKU089", stock: 3, reorder: 15 },
                { name: "Product D - SKU102", stock: 8, reorder: 25 },
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
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
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

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "SALE-001", time: "2 mins ago", items: 3, total: 45.50 },
              { id: "SALE-002", time: "15 mins ago", items: 1, total: 120.00 },
              { id: "SALE-003", time: "32 mins ago", items: 5, total: 89.99 },
              { id: "SALE-004", time: "1 hour ago", items: 2, total: 34.00 },
            ].map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-foreground">{sale.id}</p>
                  <p className="text-sm text-muted-foreground">{sale.time} - {sale.items} items</p>
                </div>
                <p className="font-medium text-foreground">${sale.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const [selectedTier, setSelectedTier] = useState<"manufacturer" | "wholesaler" | "retailer">("retailer")

  const businessNames = {
    manufacturer: "Pacific Electronics Manufacturing",
    wholesaler: "Global Food Distributors",
    retailer: "QuickMart Retail Store",
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar tier={selectedTier} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader businessName={businessNames[selectedTier]} />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Tier selector for demo */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Dashboard Preview:</p>
            <Tabs value={selectedTier} onValueChange={(v) => setSelectedTier(v as typeof selectedTier)}>
              <TabsList>
                <TabsTrigger value="retailer">Retailer</TabsTrigger>
                <TabsTrigger value="wholesaler">Wholesaler</TabsTrigger>
                <TabsTrigger value="manufacturer">Manufacturer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {selectedTier === "manufacturer" && <ManufacturerDashboard />}
          {selectedTier === "wholesaler" && <WholesalerDashboard />}
          {selectedTier === "retailer" && <RetailerDashboard />}
        </main>

        {/* Footer notice */}
        <div className="p-4 border-t border-border bg-card text-center">
          <p className="text-sm text-muted-foreground">
            This is a preview. <Link href="/signup" className="text-primary hover:underline">Start your free trial</Link> to access the full dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

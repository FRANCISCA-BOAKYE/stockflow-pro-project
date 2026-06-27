"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Search, 
  Download, 
  Filter,
  ChevronDown,
  FileText,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Send,
  Printer
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Invoice {
  id: string
  invoiceNumber: string
  buyer: string
  seller: string
  amount: number
  paymentMode: string
  dueDate: string
  status: "paid" | "pending" | "overdue" | "cancelled"
  createdAt: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    buyer: "Metro Supermarkets",
    seller: "Pacific Electronics",
    amount: 12500.00,
    paymentMode: "Bank Transfer",
    dueDate: "2024-02-15",
    status: "paid",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    buyer: "QuickMart Stores",
    seller: "Global Food Distributors",
    amount: 8750.50,
    paymentMode: "Credit",
    dueDate: "2024-02-20",
    status: "pending",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    buyer: "Thompson Retail Group",
    seller: "Textile Masters Inc",
    amount: 25000.00,
    paymentMode: "Net 30",
    dueDate: "2024-01-25",
    status: "overdue",
    createdAt: "2023-12-25",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    buyer: "BuildRight Materials",
    seller: "Industrial Machines Co",
    amount: 45000.00,
    paymentMode: "Bank Transfer",
    dueDate: "2024-03-01",
    status: "pending",
    createdAt: "2024-02-01",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    buyer: "PharmaCare Distributors",
    seller: "Consumer Goods Factory",
    amount: 6200.00,
    paymentMode: "Cash",
    dueDate: "2024-02-10",
    status: "paid",
    createdAt: "2024-01-10",
  },
  {
    id: "6",
    invoiceNumber: "INV-2024-006",
    buyer: "TechWholesale UK",
    seller: "AutoParts Global",
    amount: 18900.00,
    paymentMode: "Credit",
    dueDate: "2024-02-28",
    status: "pending",
    createdAt: "2024-01-28",
  },
  {
    id: "7",
    invoiceNumber: "INV-2024-007",
    buyer: "Office Supplies Central",
    seller: "Apparel Manufacturing Ltd",
    amount: 3400.00,
    paymentMode: "Net 15",
    dueDate: "2024-01-30",
    status: "cancelled",
    createdAt: "2024-01-15",
  },
  {
    id: "8",
    invoiceNumber: "INV-2024-008",
    buyer: "Fresh Produce Wholesale",
    seller: "Pacific Electronics",
    amount: 9800.00,
    paymentMode: "Bank Transfer",
    dueDate: "2024-02-25",
    status: "paid",
    createdAt: "2024-01-25",
  },
]

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
}

export default function InvoiceHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined)

  const filteredInvoices = mockInvoices.filter((invoice) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesInvoice = invoice.invoiceNumber.toLowerCase().includes(query)
      const matchesBuyer = invoice.buyer.toLowerCase().includes(query)
      const matchesSeller = invoice.seller.toLowerCase().includes(query)
      if (!matchesInvoice && !matchesBuyer && !matchesSeller) return false
    }

    // Status filter
    if (statusFilter !== "all" && invoice.status !== statusFilter) {
      return false
    }

    return true
  })

  const stats = {
    total: mockInvoices.length,
    paid: mockInvoices.filter(i => i.status === "paid").length,
    pending: mockInvoices.filter(i => i.status === "pending").length,
    overdue: mockInvoices.filter(i => i.status === "overdue").length,
    totalAmount: mockInvoices.reduce((sum, i) => sum + i.amount, 0),
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Invoice History</h1>
              <p className="text-muted-foreground mt-1">View and manage all your invoices</p>
            </div>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, buyers, or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Invoice table */}
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Invoice #</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.buyer}</TableCell>
                          <TableCell>{invoice.seller}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{invoice.paymentMode}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`capitalize ${statusColors[invoice.status]}`}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination info */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInvoices.length} of {mockInvoices.length} invoices
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  PAID: { bg: "bg-green-100", text: "text-green-700" },
  UNPAID: { bg: "bg-secondary", text: "text-foreground" },
  OVERDUE: { bg: "bg-red-100", text: "text-red-700" },
}

const getInvoicesForTier = (tier?: string) => {
  if (tier === "MANUFACTURER") return [
    { id: "INV-001", party: "Apex Distributors", date: "Jun 26, 2026", amount: 42000, status: "PAID" },
    { id: "INV-002", party: "Sunrise Wholesale", date: "Jun 20, 2026", amount: 28500, status: "UNPAID" },
    { id: "INV-003", party: "Delta Trading Co", date: "Jun 15, 2026", amount: 14800, status: "OVERDUE" },
  ]
  if (tier === "WHOLESALER") return [
    { id: "INV-101", party: "Bright Mart Retail", date: "Jun 26, 2026", amount: 2800, status: "PAID" },
    { id: "INV-102", party: "Delta Stores", date: "Jun 22, 2026", amount: 1400, status: "UNPAID" },
  ]
  return [
    { id: "INV-201", party: "John Mensah", date: "Jun 26, 2026", amount: 45, status: "PAID" },
    { id: "INV-202", party: "Abena Asante", date: "Jun 24, 2026", amount: 85.5, status: "UNPAID" },
  ]
}

export default function InvoicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    setUser(JSON.parse(stored))
  }, [])

  if (!user) return null
  const invoices = getInvoicesForTier(user.tierType)

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-lg font-semibold">Invoices</h1>
            <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-3">
        {invoices.map(inv => {
          const st = STATUS_MAP[inv.status]
          return (
            <Card key={inv.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium">{inv.party}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{inv.date} · {inv.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${inv.amount.toLocaleString()}</p>
                  <Badge className={`${st.bg} ${st.text} hover:${st.bg}`}>{inv.status}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </main>
    </div>
  )
}
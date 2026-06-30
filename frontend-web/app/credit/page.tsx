"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  OVERDUE: { bg: "bg-red-100", text: "text-red-700" },
  DUE_SOON: { bg: "bg-amber-100", text: "text-amber-700" },
  OUTSTANDING: { bg: "bg-secondary", text: "text-foreground" },
  SETTLED: { bg: "bg-green-100", text: "text-green-700" },
}

const getCreditForTier = (tier?: string) => {
  if (tier === "MANUFACTURER") return [
    { name: "Apex Distributors", due: "Jun 30, 2026", amount: 42000, status: "DUE_SOON" },
    { name: "Sunrise Wholesale", due: "Jun 15, 2026", amount: 68000, status: "OVERDUE" },
    { name: "Delta Trading Co", due: "Jul 10, 2026", amount: 14800, status: "OUTSTANDING" },
  ]
  if (tier === "WHOLESALER") return [
    { name: "Bright Mart Retail", due: "Jun 30, 2026", amount: 4200, status: "DUE_SOON" },
    { name: "Sunrise Shop", due: "Jun 15, 2026", amount: 6800, status: "OVERDUE" },
  ]
  return [
    { name: "John Mensah", due: "Jun 30, 2026", amount: 120, status: "DUE_SOON" },
    { name: "Abena Asante", due: "Jun 15, 2026", amount: 85.5, status: "OVERDUE" },
  ]
}

export default function CreditPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    setUser(JSON.parse(stored))
  }, [])

  if (!user) return null
  const accounts = getCreditForTier(user.tierType)
  const total = accounts.reduce((sum, a) => sum + a.amount, 0)

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-lg font-semibold">Credit accounts</h1>
            <p className="text-xs text-muted-foreground">{accounts.length} accounts · ${total.toLocaleString()} outstanding</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-3">
        {accounts.map((acc, i) => {
          const st = STATUS_MAP[acc.status]
          return (
            <Card key={i}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><Wallet className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium">{acc.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Due {acc.due}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${acc.amount.toLocaleString()}</p>
                  <Badge className={`${st.bg} ${st.text} hover:${st.bg}`}>{acc.status.replace("_", " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </main>
    </div>
  )
}
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Mail, ShieldCheck, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ACCOUNT_LIMITS: Record<string, Record<string, number>> = {
  MANUFACTURER: { STANDARD: 5, PREMIUM: 10 },
  WHOLESALER: { STANDARD: 6, PREMIUM: 8 },
  RETAILER: { STANDARD: 2, PREMIUM: 5 },
}

const ROLES: Record<string, { admin: string; staff: string[] }> = {
  MANUFACTURER: { admin: "Company Admin", staff: ["Production Supervisor", "Store Keeper", "POS Operator"] },
  WHOLESALER: { admin: "Warehouse Admin", staff: ["Receiving Staff", "Sales Staff"] },
  RETAILER: { admin: "Shop Owner", staff: ["Shop Staff"] },
}

export default function AccountsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("sf_user")
    if (!stored) { router.replace("/login"); return }
    setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  const tier = user.tierType || "RETAILER"
  const plan = user.subscriptionPlan || "STANDARD"
  const limit = ACCOUNT_LIMITS[tier]?.[plan] ?? 1
  const roleConfig = ROLES[tier] ?? { admin: "Admin", staff: ["Staff"] }
  const domain = user.email?.includes("@") ? user.email.split("@")[1] : "business.com"

  const accounts = [{ name: user.name, role: roleConfig.admin, email: user.email, isAdmin: true }]
  let roleIndex = 0
  while (accounts.length < limit) {
    const role = roleConfig.staff[roleIndex % roleConfig.staff.length]
    accounts.push({ name: role, role, email: `${role.toLowerCase().replace(/ /g, ".")}${accounts.length}@${domain}`, isAdmin: false })
    roleIndex++
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-lg font-semibold">Sub-accounts</h1>
              <p className="text-xs text-muted-foreground">{accounts.length} of {limit} accounts used</p>
            </div>
          </div>
          <Button size="sm"><UserPlus className="h-4 w-4 mr-2" />Invite</Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-3">
        {accounts.map((acc, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{acc.isAdmin ? `${acc.name} (You)` : acc.name}</p>
                    {acc.isAdmin && <Badge variant="secondary" className="text-xs"><ShieldCheck className="h-3 w-3 mr-1" />Admin</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{acc.email}</p>
                </div>
              </div>
              <Badge variant="outline">{acc.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  )
}
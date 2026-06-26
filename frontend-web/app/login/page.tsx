"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API_BASE_URL = "https://stockflow-backend-qwpt.onrender.com"

const TEST_ACCOUNTS = [
  { tier: "MANUFACTURER", email: "francisca@acme.com", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { tier: "RETAILER", email: "amara@brightmart.com", color: "text-green-600 bg-green-50 border-green-100" },
  { tier: "WHOLESALER", email: "kwame@apex.com", color: "text-amber-600 bg-amber-50 border-amber-100" },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Invalid email or password")
      }
      const data = await res.json()
      localStorage.setItem("sf_token", data.token)
      localStorage.setItem("sf_user", JSON.stringify(data))
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="mx-auto max-w-md w-full px-6">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your StockFlow Pro account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@business.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-100">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : <><span>Sign in</span><ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
              </form>
              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Dev access — tap to fill</p>
                {TEST_ACCOUNTS.map(acc => (
                  <button key={acc.tier} type="button" onClick={() => { setEmail(acc.email); setPassword("Password123!") }}
                    className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-100 transition-colors text-left mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${acc.color}`}>{acc.tier}</span>
                    <span className="text-xs text-slate-600 font-mono">{acc.email}</span>
                  </button>
                ))}
                <p className="text-xs text-slate-400 mt-2 text-center">All passwords: Password123!</p>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">Start free trial</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
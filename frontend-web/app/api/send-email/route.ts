import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend("re_74s9b244_3RhrRcnHef8vgJUdDRok1Vgt")

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json()
    console.log("📧 Sending email to:", to)

    const { data, error } = await resend.emails.send({
      from: "StockFlow Pro <onboarding@resend.dev>",
      to: "francescaboakye51@gmail.com",
      subject,
      html,
    })

    console.log("📧 Resend result:", JSON.stringify({ data, error }))

    if (error) return NextResponse.json({ error }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.log("📧 Email error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
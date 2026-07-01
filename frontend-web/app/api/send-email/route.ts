import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "stockflowp@gmail.com",
    pass: "fcezpuyxrnaeflbr",
  },
})

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json()
    console.log("📧 Sending email to:", to)

    await transporter.sendMail({
      from: '"StockFlow Pro" <stockflowp@gmail.com>',
      to,
      subject,
      html,
    })

    console.log("📧 Email sent successfully")
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.log("📧 Email error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
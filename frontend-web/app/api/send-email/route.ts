import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const relaySecret = req.headers.get("x-relay-secret")
    if (!relaySecret || relaySecret !== process.env.EMAIL_RELAY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, subject, html } = await req.json()

    if (
      typeof to !== "string" || !to.trim() ||
      typeof subject !== "string" || !subject.trim() ||
      typeof html !== "string" || !html.trim() ||
      to.length > 320 || subject.length > 300 || html.length > 100_000
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    await transporter.sendMail({
      from: `"StockFlow Pro" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
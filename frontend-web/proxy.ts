import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const token = request.cookies.get("sf_token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/invite/:path*",
    "/credit/:path*",
    "/invoices/:path*",
    "/notifications/:path*",
    "/trial-expired/:path*",
  ],
}

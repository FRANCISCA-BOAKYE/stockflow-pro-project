export async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html }),
  })
  return res.json()
}

export function welcomeEmailHtml(businessName: string, tier: string, plan: string, email: string, password: string) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); border-radius: 20px; padding: 40px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 8px;">Welcome to StockFlow Pro</h1>
        <p style="color: #94a3b8; margin: 0;">${businessName} · ${tier} · ${plan}</p>
      </div>
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 16px; border: 1px solid #f1f5f9;">
        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px;">Your login credentials</h2>
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Email</p>
          <p style="margin: 0; font-size: 15px; color: #0f172a; font-family: monospace;">${email}</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Password</p>
          <p style="margin: 0; font-size: 15px; color: #0f172a; font-family: monospace;">${password}</p>
        </div>
        <div style="background: #ecfdf5; border-radius: 12px; padding: 16px; border: 1px solid #a7f3d0;">
          <p style="margin: 0; font-size: 13px; color: '#065f46'; font-weight: 600;">Your 14-day free trial starts on first login. Your data is always safe.</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #94a3b8;">StockFlow Pro · Group 3 · 2026</p>
    </div>
  `
}

export function inviteEmailHtml(businessName: string, role: string, inviterName: string) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); border-radius: 20px; padding: 40px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 8px;">You've been invited</h1>
        <p style="color: #94a3b8; margin: 0;">${businessName} · ${role}</p>
      </div>
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #f1f5f9;">
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">${inviterName} has invited you to join <strong>${businessName}</strong> on StockFlow Pro as <strong>${role}</strong>.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Download the StockFlow Pro mobile app and log in with the credentials provided by your admin.</p>
        <div style="background: #eff6ff; border-radius: 12px; padding: 16px; border: 1px solid #bfdbfe; margin-top: 20px;">
          <p style="margin: 0; font-size: 13px; color: #1e40af;">Contact your admin for your login email and password.</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px;">StockFlow Pro · Group 3 · 2026</p>
    </div>
  `
}
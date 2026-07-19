"use client"
import { useEffect } from "react"
import { toast } from "sonner"

interface PaystackButtonProps {
  email: string
  amount: number
  publicKey: string
  onSuccess: (reference: string) => void
  onClose: () => void
  label: string
  style?: React.CSSProperties
}

export function PaystackButton({ email, amount, publicKey, onSuccess, onClose, label, style }: PaystackButtonProps) {
  const handlePayment = () => {
    if (!(window as any).PaystackPop) {
      toast.error("Payment is still loading. Please wait a moment and try again.")
      return
    }
    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100, // Paystack uses kobo/pesewas
      currency: "GHS",
      callback: (response: any) => {
        onSuccess(response.reference)
      },
      onClose: () => {
        onClose()
      },
    })
    handler.openIframe()
  }

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <button onClick={handlePayment} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      width: '100%', padding: '14px', borderRadius: '14px',
      background: 'linear-gradient(135deg, #1a56db, #4f46e5)',
      color: '#ffffff', fontWeight: 700, fontSize: '15px',
      border: 'none', cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(26,86,219,0.3)',
      ...style
    }}>
      {label}
    </button>
  )
}
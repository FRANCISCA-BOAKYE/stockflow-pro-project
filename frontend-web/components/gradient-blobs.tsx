"use client"

interface Props {
  variant?: "light" | "dark"
  className?: string
}

/**
 * Floating gradient blob backdrop — the web counterpart to the mobile app's
 * GradientHero bubbles. Pure CSS (no animation library): two blurred, slowly
 * drifting radial blobs plus a faint dot-grid texture.
 */
export function GradientBlobs({ variant = "light", className = "" }: Props) {
  const blobA = variant === "dark"
    ? "radial-gradient(circle at 30% 30%, rgba(96,165,250,0.35), transparent 70%)"
    : "radial-gradient(circle at 30% 30%, rgba(26,86,219,0.16), transparent 70%)"
  const blobB = variant === "dark"
    ? "radial-gradient(circle at 70% 70%, rgba(79,70,229,0.3), transparent 70%)"
    : "radial-gradient(circle at 70% 70%, rgba(99,102,241,0.12), transparent 70%)"
  const dotColor = variant === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.05)"

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden opacity-70 sm:opacity-100 ${className}`}>
      <div
        className="animate-float-a absolute -top-1/4 -left-1/4 h-[50%] w-[50%] max-h-[380px] max-w-[380px] rounded-full blur-2xl sm:blur-3xl"
        style={{ background: blobA }}
      />
      <div
        className="animate-float-b absolute -bottom-1/4 -right-1/4 h-[50%] w-[50%] max-h-[380px] max-w-[380px] rounded-full blur-2xl sm:blur-3xl"
        style={{ background: blobB }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: "26px 26px" }}
      />
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  value: number
  prefix?: string
  suffix?: string
  durationMs?: number
  className?: string
}

/** Counts up from 0 to `value` once scrolled into view. */
export function AnimatedCounter({ value, prefix = "", suffix = "", durationMs = 1200, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = Date.now()
          const tick = () => {
            const progress = Math.min(1, (Date.now() - start) / durationMs)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(value * eased))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, durationMs])

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}

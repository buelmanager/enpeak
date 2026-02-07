'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
  isVisible: boolean
}

export default function AnimatedCounter({
  value,
  suffix = '',
  duration = 2000,
  isVisible,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(value)
      }
    }
    requestAnimationFrame(step)
  }, [isVisible, value, duration])

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

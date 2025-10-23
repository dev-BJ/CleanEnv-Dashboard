"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedValueProps {
  value: number
  unit: string
  decimals?: number
  className?: string
  animate?: boolean
}

export function AnimatedValue({ value, unit, decimals = 1, className, animate = true }: AnimatedValueProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    if (Math.abs(value - displayValue) > 0.01) {
      setIsAnimating(true)

      // Animate to new value
      const startValue = displayValue
      const difference = value - startValue
      const duration = 500 // ms
      const steps = 20
      const stepValue = difference / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const newValue = startValue + stepValue * currentStep

        if (currentStep >= steps) {
          setDisplayValue(value)
          setIsAnimating(false)
          clearInterval(interval)
        } else {
          setDisplayValue(newValue)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }
  }, [value, displayValue, animate])

  return (
    <span className={cn("transition-all duration-300", isAnimating && "text-primary scale-105", className)}>
      {displayValue.toFixed(decimals)}
      {/* {displayValue} */}
      {unit}
    </span>
  )
}

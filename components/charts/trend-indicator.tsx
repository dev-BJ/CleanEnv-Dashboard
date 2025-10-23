"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendIndicatorProps {
  current: number
  previous: number
  className?: string
}

export function TrendIndicator({ current, previous, className }: TrendIndicatorProps) {
  const difference = current - previous
  const percentageChange = previous !== 0 ? (difference / previous) * 100 : 0

  const getTrendInfo = () => {
    if (Math.abs(percentageChange) < 0.1) {
      return {
        icon: Minus,
        color: "text-muted-foreground",
        text: "No change",
        value: "0%",
      }
    } else if (percentageChange > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        text: "Increasing",
        value: `+${percentageChange.toFixed(1)}%`,
      }
    } else {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        text: "Decreasing",
        value: `${percentageChange.toFixed(1)}%`,
      }
    }
  }

  const trend = getTrendInfo()
  const Icon = trend.icon

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon className={cn("h-4 w-4", trend.color)} />
      <span className={cn("text-sm font-medium", trend.color)}>{trend.value}</span>
      <span className="text-xs text-muted-foreground sr-only">{trend.text}</span>
    </div>
  )
}

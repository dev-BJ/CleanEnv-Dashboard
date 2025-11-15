"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

interface RealTimeIndicatorProps {
  isConnected: boolean
  isReceivingData: boolean
  connectionQuality: "excellent" | "good" | "poor" | "disconnected"
  lastUpdateTime: number | null
  className?: string
}

export function RealTimeIndicator({
  isConnected,
  isReceivingData,
  connectionQuality,
  lastUpdateTime,
  className,
}: RealTimeIndicatorProps) {
  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        text: "Disconnected",
        variant: "secondary" as const,
        color: "text-muted-foreground",
      }
    }

    switch (connectionQuality) {
      case "excellent":
        return {
          icon: Wifi,
          text: "Excellent",
          variant: "default" as const,
          color: "text-green-600",
        }
      case "good":
        return {
          icon: Wifi,
          text: "Good",
          variant: "default" as const,
          color: "text-blue-600",
        }
      case "poor":
        return {
          icon: Wifi,
          text: "Poor",
          variant: "secondary" as const,
          color: "text-yellow-600",
        }
      default:
        return {
          icon: WifiOff,
          text: "Disconnected",
          variant: "secondary" as const,
          color: "text-muted-foreground",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  const getTimeSinceLastUpdate = () => {
    if (!lastUpdateTime) return null
    const seconds = Math.floor((Date.now() - lastUpdateTime) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Icon className={cn("h-4 w-4", statusInfo.color)} />
        {isReceivingData && <Radio className="h-3 w-3 text-green-500 animate-pulse" />}
      </div>
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.text}
      </Badge>
      {lastUpdateTime && <span className="text-xs text-muted-foreground">{getTimeSinceLastUpdate()}</span>}
    </div>
  )
}

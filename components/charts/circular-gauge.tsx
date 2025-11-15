"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CircularGaugeProps {
  value: number
  min: number
  max: number
  title: string
  unit: string
  icon: React.ReactNode
  thresholds: {
    normal: [number, number]
    warning: [number, number]
    critical: [number, number]
  }
}

export function CircularGauge({ value, min, max, title, unit, icon, thresholds }: CircularGaugeProps) {
  // Calculate percentage for the gauge
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)

  // Determine status based on thresholds
  const getStatus = () => {
    if (value >= thresholds.critical[0] && value <= thresholds.critical[1]) {
      return { status: "Normal", color: "hsl(var(--chart-1))", variant: "default" as const }
    } else if (value >= thresholds.warning[0] && value <= thresholds.warning[1]) {
      return { status: "Warning", color: "hsl(var(--chart-3))", variant: "secondary" as const }
    } else {
      return { status: "Critical", color: "hsl(var(--chart-4))", variant: "destructive" as const }
    }
  }

  const statusInfo = getStatus()

  // SVG gauge parameters
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>Current reading</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Circular Gauge */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={statusInfo.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>

          {/* Center value display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{value.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>

        {/* Status and range info */}
        <div className="text-center space-y-2">
          <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>
          <div className="text-xs text-muted-foreground">
            <p>
              Range: {min}
              {unit} - {max}
              {unit}
            </p>
            <p>
              Normal: {thresholds.normal[0]}
              {unit} - {thresholds.normal[1]}
              {unit}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

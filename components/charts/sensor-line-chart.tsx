"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorData } from "@/hooks/use-mqtt"

interface SensorLineChartProps {
  data: SensorData[]
  dataKey: "battery_voltage" | "battery_current" | "teg_current" | "teg_voltage" | "charging_current" | "charging_voltage" | "temperature"
  title: string
  color: string
  unit: string
}

export function SensorLineChart({ data, dataKey, title, color, unit }: SensorLineChartProps) {
  // Format data for chart - keep last 20 points for better visualization
  const chartData = data.slice(-20).map((item, index) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    value: Number(item[dataKey].toFixed(2)),
    timestamp: item.timestamp,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          <p className="text-sm" style={{ color }}>
            {`${title}: ${payload[0].value}${unit}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title} Trend</CardTitle>
        <CardDescription>Real-time {title.toLowerCase()} readings over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                domain={dataKey.includes("voltage") ? [0, 20] : dataKey.includes("current") ? [0, 5] : dataKey.includes("temperature") ? [-10, 55] : [-10, 60]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

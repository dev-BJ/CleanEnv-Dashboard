"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SensorLineChart } from "@/components/charts/sensor-line-chart"
import { CircularGauge } from "@/components/charts/circular-gauge"
import { Badge } from "@/components/ui/badge"
import { Zap, Thermometer, BarChart3, Activity } from "lucide-react"
import type { SensorData } from "@/hooks/use-mqtt"

interface AnalyticsViewProps {
  sensorData: SensorData[]
  latestData: SensorData | null
}

export function AnalyticsView({ sensorData, latestData }: AnalyticsViewProps) {
  const uptimes = sensorData.map((d) => d.uptime)
  const getStatistics = () => {
    if (sensorData.length === 0) {
      return {
        load_voltage: { min: 0, max: 0, avg: 0 },
        charging_voltage: { min: 0, max: 0, avg: 0 },
        load_current: { min: 0, max: 0, avg: 0 },
        charging_current: { min: 0, max: 0, avg: 0 },
        teg_voltage: { min: 0, max: 0, avg: 0 },
        teg_current: { min: 0, max: 0, avg: 0 },
        temperature: { min: 0, max: 0, avg: 0 },
      }
    }

    const load_voltages = sensorData.map((d) => d.battery_voltage)
    const charging_voltages = sensorData.map((d) => d.charging_voltage)
    const load_currents = sensorData.map((d) => d.battery_current)
    const charging_currents = sensorData.map((d) => d.charging_current)
    const teg_voltages = sensorData.map((d) => d.teg_voltage)
    const teg_currents = sensorData.map((d) => d.teg_current)
    const temperatures = sensorData.map((d) => d.temperature)

    return {
      load_voltage: {
        min: Math.min(...load_voltages),
        max: Math.max(...load_voltages),
        avg: load_voltages.reduce((a, b) => a + b, 0) / load_voltages.length,
      },
      load_current: {
        min: Math.min(...load_currents),
        max: Math.max(...load_currents),
        avg: load_currents.reduce((a, b) => a + b, 0) / load_currents.length,
      },
      charging_voltage: {
        min: Math.min(...charging_voltages),
        max: Math.max(...charging_voltages),
        avg: charging_voltages.reduce((a, b) => a + b, 0) / charging_voltages.length,
      },
      charging_current: {
        min: Math.min(...charging_currents),
        max: Math.max(...charging_currents),
        avg: charging_currents.reduce((a, b) => a + b, 0) / charging_currents.length,
      },
      teg_voltage: {
        min: Math.min(...teg_voltages),
        max: Math.max(...teg_voltages),
        avg: teg_voltages.reduce((a, b) => a + b, 0) / teg_voltages.length,
      },
      teg_current: {
        min: Math.min(...teg_currents),
        max: Math.max(...teg_currents),
        avg: teg_currents.reduce((a, b) => a + b, 0) / teg_currents.length,
      },
      temperature: {
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
        avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      },
    }
  }

  const stats = getStatistics()

  return (
    <div className="space-y-6">
      {/* Real-time Gauges */}
      {latestData && (
        <div className="grid gap-6 md:grid-cols-2">
          <CircularGauge
            value={latestData.battery_voltage}
            min={0}
            max={16.8}
            title="Battery Voltage"
            unit="V"
            icon={<Zap className="h-5 w-5" />}
            thresholds={{
              normal: [4.0, 16.8],
              warning: [3.0, 17.0],
              critical: [0, 3.0],
            }}
          />

          <CircularGauge
            value={latestData.battery_current}
            min={0}
            max={5}
            title="Load Current"
            unit="A"
            icon={<Zap className="h-5 w-5" />}
            thresholds={{
              normal: [0.1, 5.0],
              warning: [5.0, 10.0],
              critical: [0, 0.1],
            }}
          />

          <CircularGauge
            value={latestData.charging_voltage}
            min={0}
            max={20}
            title="Charging Voltage"
            unit="V"
            icon={<Zap className="h-5 w-5" />}
            thresholds={{
              normal: [5.0, 20.0],
              warning: [4.0, 22.0],
              critical: [0, 4.0],
            }}
          />

          <CircularGauge
            value={latestData.charging_current}
            min={0}
            max={5}
            title="Charging Current"
            unit="A"
            icon={<Zap className="h-5 w-5" />}
            thresholds={{
              normal: [0.1, 5.0],
              warning: [5.0, 10.0],
              critical: [0, 0.1],
            }}
          />

          <CircularGauge
            value={latestData.teg_voltage}
            min={0}
            max={10}
            title="TEG Voltage"
            unit="V"
            icon={<Zap className="h-5 w-5" />}
            thresholds={{
              normal: [2.0, 5.0],
              warning: [5.0, 10.0],
              critical: [0, 2.0],
            }}
          />

          <CircularGauge
            value={latestData.teg_current}
            min={0}
            max={5}
            title="TEG Current"
            unit="A"
            icon={<Zap className="h-5 w-5" />}
            thresholds={{
              normal: [0.1, 5.0],
              warning: [5.0, 10.0],
              critical: [0, 0.1],
            }}
          />
          
          <CircularGauge
            value={latestData.temperature}
            min={-10}
            max={60}
            title="Temperature"
            unit="°C"
            icon={<Thermometer className="h-5 w-5" />}
            thresholds={{
              normal: [10, 40],
              warning: [0, 100],
              critical: [-10, 0],
            }}
          />
        </div>
      )}

      {/* Historical Charts */}
      {sensorData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SensorLineChart data={sensorData} dataKey="battery_voltage" title="Battery Voltage" color="hsl(var(--chart-1))" unit="V" />
          <SensorLineChart data={sensorData} dataKey="battery_current" title="Battery Current" color="hsl(var(--chart-3))" unit="A" />
          <SensorLineChart
            data={sensorData}
            dataKey="charging_voltage"
            title="Charging Voltage"
            color="hsl(var(--chart-4))"
            unit="V"
          />
          <SensorLineChart
            data={sensorData}
            dataKey="charging_current"
            title="Charging Current"
            color="hsl(var(--chart-5))"
            unit="A"
          />
          <SensorLineChart data={sensorData} dataKey="teg_voltage" title="TEG Voltage" color="hsl(var(--chart-6))" unit="V" />
          <SensorLineChart data={sensorData} dataKey="teg_current" title="TEG Current" color="hsl(var(--chart-7))" unit="A" />
          <SensorLineChart
            data={sensorData}
            dataKey="temperature"
            title="Temperature"
            color="hsl(var(--chart-2))"
            unit="°C"
          />
        </div>
      )}

      {/* Statistics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Voltage Stats</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.load_voltage.avg.toFixed(2)}V</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.load_voltage.min.toFixed(1)}V</span>
              <span>Max: {stats.load_voltage.max.toFixed(1)}V</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Current Stats</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.load_current.avg.toFixed(2)}A</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.load_current.min.toFixed(1)}A</span>
              <span>Max: {stats.load_current.max.toFixed(1)}A</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charging Voltage Stats</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.charging_voltage.avg.toFixed(2)}V</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.charging_voltage.min.toFixed(1)}V</span>
              <span>Max: {stats.charging_voltage.max.toFixed(1)}V</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charging Current Stats</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.charging_current.avg.toFixed(2)}A</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.charging_current.min.toFixed(1)}A</span>
              <span>Max: {stats.charging_current.max.toFixed(1)}A</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TEG Voltage Stats</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.teg_voltage.avg.toFixed(2)}V</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.teg_voltage.min.toFixed(1)}V</span>
              <span>Max: {stats.teg_voltage.max.toFixed(1)}V</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TEG Current Stats</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.teg_current.avg.toFixed(2)}A</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.teg_current.min.toFixed(1)}A</span>
              <span>Max: {stats.teg_current.max.toFixed(1)}A</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature Stats</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{stats.temperature.avg.toFixed(1)}°C</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {stats.temperature.min.toFixed(1)}°C</span>
              <span>Max: {stats.temperature.max.toFixed(1)}°C</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Uptime</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{uptimes.reduce((a, b) => a + b, 0)}s</div>
            <p className="text-xs text-muted-foreground">Total uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{sensorData.length}</div>
            <p className="text-xs text-muted-foreground">Total readings collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {sensorData.length > 0
                ? Math.round(sensorData.filter((d) => Date.now() - d.timestamp < 60000).length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Messages per minute</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
          <CardDescription>Analysis of sensor data quality and reliability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Load Voltage Range</p>
              <div className="flex items-center gap-2">
                <Badge variant={stats.load_voltage.min >= 3.0 && stats.load_voltage.max <= 16.8 ? "default" : "destructive"}>
                  {stats.load_voltage.min >= 3.0 && stats.load_voltage.max <= 16.8 ? "Normal" : "Out of Range"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Expected: 3.0V - 16.8V</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Temperature Range</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={stats.temperature.min >= -10 && stats.temperature.max <= 60 ? "default" : "destructive"}
                >
                  {stats.temperature.min >= -10 && stats.temperature.max <= 60 ? "Normal" : "Out of Range"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Expected: -10°C - 150°C</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Data Consistency</p>
              <div className="flex items-center gap-2">
                <Badge variant={sensorData.length > 10 ? "default" : "secondary"}>
                  {sensorData.length > 10 ? "Good" : "Limited"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{sensorData.length} data points available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

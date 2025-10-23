"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendIndicator } from "@/components/charts/trend-indicator"
import { RealTimeIndicator } from "@/components/real-time-indicator"
import { AnimatedValue } from "@/components/animated-value"
import { BluetoothConnected, Bluetooth } from "lucide-react"
import { Zap, Thermometer, Activity, Database, TrendingUp, AlertTriangle, Fan } from "lucide-react"
import type { SensorData } from "@/hooks/use-mqtt"

interface OverviewViewProps {
  isConnected: boolean
  latestData: SensorData | null
  sensorData: SensorData[]
  lastUpdateTime: number | null
  isReceivingData: boolean
  connectionQuality: "excellent" | "good" | "poor" | "disconnected"
}

interface arrayType {
  type: "battery_voltage" | "battery_current" | "teg_current" | "teg_voltage" | "charging_current" | "charging_voltage" | "temperature"
}

export function OverviewView({
  isConnected,
  latestData,
  sensorData,
  lastUpdateTime,
  isReceivingData,
  connectionQuality,
}: OverviewViewProps) {
  const formatValue = (value: number, unit: string, decimals = 1) => {
    return `${value.toFixed(decimals)}${unit}`
  }

  const getStatusColor = (value: number, type: arrayType["type"]) => {
    if (type.includes("voltage")) {
      if (value < 3.0 || value > 20.0) return "destructive"
      if (value < 4.0 || value > 12.0) return "secondary"
      return "default"
    } else if (type === "temperature") {
      if (value < 0 || value > 50) return "destructive"
      if (value < 10 || value > 40) return "secondary"
      return "default"
    } else {
      return "default"
    }
  }

  const getAverageValue = (type: arrayType["type"]) => {
    if (sensorData.length === 0) return 0
    const sum = sensorData.reduce((acc, data) => acc + data[type], 0)
    return sum / sensorData.length
  }

  const getPreviousValue = (type: arrayType["type"]) => {
    if (sensorData.length < 2) return latestData?.[type] || 0
    return sensorData[sensorData.length - 2][type]
  }

  const getSignalLevel = (value: number, min: number, max: number) => {
    if (value <= min) return 0;
    if (value >= max) return 100;
    return Math.round((value - min) * 100 / (max - min));
}

  const getAlerts = () => {
    if (!latestData) return []
    const alerts = []

    if (latestData.battery_voltage < 3.0 || latestData.battery_voltage > 18.0 || latestData.charging_voltage < 3.0 || latestData.charging_voltage > 18.0) {
      alerts.push({ type: "Critical", message: "Voltage out of safe range", severity: "high" })
    }
    if (latestData.temperature < 0 || latestData.temperature > 200) {
      alerts.push({ type: "Critical", message: "Temperature out of safe range", severity: "high" })
    }
    if (latestData.battery_voltage < 4.0 || latestData.battery_voltage > 16.0 || latestData.charging_voltage < 4.0 || latestData.charging_voltage > 16.0) {
      alerts.push({ type: "Warning", message: "Voltage approaching limits", severity: "medium" })
    }

    return alerts
  }

  const alerts = getAlerts()

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <Card className={`transition-all duration-300 ${isReceivingData ? "ring-2 ring-primary/20 shadow-lg" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Real-time Status</CardTitle>
            <RealTimeIndicator
              isConnected={isConnected}
              isReceivingData={isReceivingData}
              connectionQuality={connectionQuality}
              lastUpdateTime={lastUpdateTime}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview with Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Online" : "Offline"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{isConnected ? "Receiving data" : "No connection"}</p>
            <div className="text-md font-bold flex flex-col gap-2 mt-1">
              <p>Device IP address: {latestData?.ip ? latestData.ip : "unknown"}</p>
              <p>Device Firmware version: {latestData?.firmware_version ? latestData.firmware_version : "0.0.0"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Stat</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData ? latestData.uptime : "--"}
            </div>
            <div className="text-2xl font-bold flex items-center gap-2 mt-1">
                <Fan
                  className={`h-6 w-6 text-muted-foreground ${latestData?.fan_state ? "fan-spin" : ""}`}
                />
                <Badge variant={latestData?.fan_state ? "default" : "secondary"}>
                  {latestData?.fan_state ? "On" : "Off"}
                </Badge>
            </div>
            <div className="text-md font-bold flex items-center gap-2 mt-1">
              <Badge variant={latestData?.active_connection ? "default" : "secondary"}>
                {
                latestData?.active_connection ? latestData.active_connection : "None"
                }
                {
                  latestData?.signal_strength? 
                  latestData.active_connection === "WiFi" ?
                  ` (${getSignalLevel(latestData.signal_strength, -100, -30)}%)` :
                  latestData.active_connection === "Cellular" ?
                  ` (${getSignalLevel(latestData.signal_strength, 0, 31)}%)` :
                  null
                   : null
                }
              </Badge>
            </div>
            <div className="text-md font-bold flex items-center gap-2 mt-1">
              {latestData?.ble_status ? <BluetoothConnected className="h-6 w-6 text-primary text-muted-foreground" /> : <Bluetooth className="h-6 w-6 text-muted-foreground" />}
              <Badge variant={latestData?.ble_status ? "default" : "secondary"}>
                {latestData?.ble_status ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            {/* <p className="text-xs text-muted-foreground mt-1">{isConnected ? "Receiving data" : "No connection"}</p> */}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${isReceivingData ? "bg-primary/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Voltage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {latestData ? <AnimatedValue value={latestData.battery_voltage} unit="V" decimals={1} /> : "--"}
              </div>
              {latestData && sensorData.length > 1 && (
                <TrendIndicator current={latestData.battery_voltage} previous={getPreviousValue("battery_voltage")} />
              )}
            </div>
            {latestData && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusColor(latestData.battery_voltage, "battery_voltage")}>
                  {latestData.battery_voltage < 4.0 ? "Low" : latestData.battery_voltage > 16.8 ? "High" : "Normal"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Avg: {formatValue(getAverageValue("battery_voltage"), "V")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${isReceivingData ? "bg-primary/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Current</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {latestData ? <AnimatedValue value={latestData.battery_current} unit="A" decimals={1} /> : "--"}
              </div>
              {latestData && sensorData.length > 1 && (
                <TrendIndicator current={latestData.battery_current} previous={getPreviousValue("battery_current")} />
              )}
            </div>
            {latestData && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusColor(latestData.battery_current, "battery_current")}>
                  {latestData.battery_current < 0.0 ? "Low" : latestData.battery_current > 5.0 ? "High" : "Normal"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Avg: {formatValue(getAverageValue("battery_current"), "A")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${isReceivingData ? "bg-primary/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {latestData ? <AnimatedValue value={latestData.temperature} unit="°C" decimals={1} /> : "--"}
              </div>
              {latestData && sensorData.length > 1 && (
                <TrendIndicator current={latestData.temperature} previous={getPreviousValue("temperature")} />
              )}
            </div>
            {latestData && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusColor(latestData.temperature, "temperature")}>
                  {latestData.temperature < 10 ? "Cold" : latestData.temperature > 50 ? "Hot" : "Normal"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Avg: {formatValue(getAverageValue("temperature"), "°C")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensorData.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Total readings received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>System alerts and warnings require attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-md">
                  <div>
                    <p className="font-medium text-sm">{alert.type}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant="destructive">{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Reading Details with Enhanced Visualization */}
      {latestData && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Reading</CardTitle>
            <CardDescription>Most recent data from device: {latestData.deviceId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Voltage</p>
                <p className="text-3xl font-bold text-primary">
                  <AnimatedValue value={latestData.battery_voltage} unit="V" decimals={2} />
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      latestData.battery_voltage < 4.0 || latestData.battery_voltage >= 16.0
                        ? "bg-secondary"
                        : latestData.battery_voltage < 3.0 || latestData.battery_voltage >= 17.0
                          ? "bg-destructive"
                          : "bg-primary"
                    }`}
                    style={{ width: `${Math.min((latestData.battery_voltage / 16.8) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-3xl font-bold text-primary">
                  <AnimatedValue value={latestData.temperature} unit="°C" decimals={1} />
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      latestData.temperature < 10 || latestData.temperature > 40
                        ? "bg-secondary"
                        : latestData.temperature < 0 || latestData.temperature > 100
                          ? "bg-destructive"
                          : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(((latestData.temperature + 10) / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-lg font-mono">{new Date(latestData.timestamp).toLocaleTimeString()}</p>
                <p className="text-sm text-muted-foreground">{new Date(latestData.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

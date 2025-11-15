"use client"

import { MqttConnectionPanel } from "@/components/mqtt-connection-panel"
import { type MqttConfig } from "@/hooks/use-mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Server, Clock, MessageSquare } from "lucide-react"

interface ConnectionViewProps {
  isConnected: boolean
  error: string | null
  feedback: string | null
  onConnect: (options: MqttConfig) => void
  onDisconnect: () => void
  sensorData: any[]
}

export function ConnectionView({ isConnected, error, feedback, onConnect, onDisconnect, sensorData }: ConnectionViewProps) {
  const getConnectionStats = () => {
    const now = Date.now()
    const recentData = sensorData.filter((data) => now - data.timestamp < 60000) // Last minute
    const messagesPerMinute = recentData.length

    return {
      messagesPerMinute,
      totalMessages: sensorData.length,
      lastMessageTime: sensorData.length > 0 ? sensorData[sensorData.length - 1].timestamp : null,
    }
  }

  const stats = getConnectionStats()

  return (
    <div className="space-y-6">
      {/* Connection Panel */}
      <MqttConnectionPanel isConnected={isConnected} error={error} feedback={feedback} onConnect={onConnect} onDisconnect={onDisconnect} />

      {/* Connection Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">MQTT Broker Status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages/Min</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesPerMinute}</div>
            <p className="text-xs text-muted-foreground mt-1">Current message rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Since connection started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Message</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastMessageTime ? (
                <span className="text-sm">{Math.floor((Date.now() - stats.lastMessageTime) / 1000)}s ago</span>
              ) : (
                "--"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time since last data</p>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>MQTT Setup Guide</CardTitle>
          <CardDescription>Configure your MQTT broker connection for real-time sensor monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Broker Configuration</h4>
              <p className="text-muted-foreground">
                Enter your MQTT broker WebSocket URL. Most brokers support WebSocket connections on port 8083 or 8084.
              </p>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs">wss://your-broker.com:8084</div>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Topic Subscription</h4>
              <p className="text-muted-foreground">
                Specify the MQTT topics to subscribe to. Use comma-separated values for multiple topics.
              </p>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs">
                sensors/voltage,sensors/temperature,devices/+/data
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Message Format</h4>
              <p className="text-muted-foreground">
                Ensure your sensor data follows this JSON format for proper parsing:
              </p>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs">
                {`{
  "voltage": 5.2,
  "temperature": 23.5,
  "timestamp": 1640995200000,
  "deviceId": "sensor-01"
}`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. Security Considerations</h4>
              <p className="text-muted-foreground">
                Use secure WebSocket connections (wss://) and ensure your broker supports authentication if needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

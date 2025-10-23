"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
// import {Loading}
import { AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type MqttConfig } from "@/hooks/use-mqtt"

interface MqttConnectionPanelProps {
  isConnected: boolean
  error: string | null
  feedback: string | null
  onConnect: (options: MqttConfig) => void
  onDisconnect: () => void
}

export function MqttConnectionPanel({ isConnected, error, feedback, onConnect, onDisconnect }: MqttConnectionPanelProps) {
  const [brokerUrl, setBrokerUrl] = useState(process.env.NEXT_PUBLIC_MQTT_BROKER_URL!)
  const [topics, setTopics] = useState(process.env.NEXT_PUBLIC_MQTT_TOPIC!)
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_MQTT_USERNAME)
  const [username, setUsername] = useState(process.env.NEXT_PUBLIC_MQTT_PASSWORD)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (error || !isConnected) {
      setIsConnecting(false)
    }
  }, [error, isConnected])

  // useEffect(() => {
  //   if (isConnected) {
  //     setIsConnecting(false)
  //   }
  // }, [isConnected])

  const handleConnect = () => {
    const topicList = topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const config: MqttConfig = {
      brokerUrl,
      topics: topicList,
      options: {
        username,
        password,
        clientId: `CleanEnv-${Math.random().toString(16).slice(3)}`,
      },
    }
    onConnect(config)
    setIsConnecting(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-primary" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          MQTT Connection
        </CardTitle>
        <CardDescription>Connect to your MQTT broker to receive real-time sensor data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {feedback && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{feedback}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="broker-url">Broker URL</Label>
            <Input
              id="broker-url"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              placeholder="wss://your-broker.com:8084"
              disabled={isConnected || isConnecting}
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              disabled={isConnected || isConnecting}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              disabled={isConnected || isConnecting}
            />
          </div>

          <div>
            <Label htmlFor="topics">Topics (comma-separated)</Label>
            <Input
              id="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="sensors/voltage,sensors/temperature"
              disabled={isConnected || isConnecting}
            />
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button onClick={handleConnect} className="flex-1" disabled={isConnected || isConnecting}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            ) : (
              <Button onClick={onDisconnect} variant="outline" className="flex-1 bg-transparent">
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

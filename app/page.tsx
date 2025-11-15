"use client"

import { useState, useEffect } from "react"
import { useMqtt, type MqttConfig } from "@/hooks/use-mqtt"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { OverviewView } from "@/components/dashboard-views/overview-view"
import { AnalyticsView } from "@/components/dashboard-views/analytics-view"
import { ConnectionView } from "@/components/dashboard-views/connection-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BLESettingPanel } from "@/components/ble-setting-panel"
import { VersionCheck } from "@/components/version-check"
import { useBLE } from "@/hooks/use-ble"

export default function IoTDashboard() {
  const [activeView, setActiveView] = useState("overview")
  const [mqttConfig, setMqttConfig] = useState<MqttConfig | null>(null)
  const {
      device,
      server,
      error: bleError,
      // isAvailable,
      isConnected: isBLEConnected,
      requestDevice,
      connect: connectBLE,
      readCharacteristic,
      writeCharacteristic,
      disconnect: disconnectBLE,
      setError: setBLEError,
    } = useBLE()

  const {
    isConnected,
    sensorData,
    latestData,
    error,
    lastUpdateTime,
    isReceivingData,
    connectionQuality,
    feedbackMessage,
    connect,
    disconnect,
    // linkConfig
  } = useMqtt()

  const handleConnect = (options: MqttConfig) => {
    const config: MqttConfig = {
      options: {
        // protocol: "mqtt",
        // port: 1883,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      },
      ...options,
    }
    connect(config)
  }

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return (
          <OverviewView
            isConnected={isConnected}
            latestData={latestData}
            sensorData={sensorData}
            lastUpdateTime={lastUpdateTime}
            isReceivingData={isReceivingData}
            connectionQuality={connectionQuality}
          />
        )
      case "analytics":
        return <AnalyticsView sensorData={sensorData} latestData={latestData} />
      case "connection":
        return (
          <ConnectionView
            isConnected={isConnected}
            error={error}
            feedback={feedbackMessage}
            onConnect={handleConnect}
            onDisconnect={disconnect}
            sensorData={sensorData}
          />
        )
      case "settings":
        return (
          <>
            {/* <p className="text-muted-foreground">Settings panel for customizing the dashboard experience.</p> */}
            <BLESettingPanel
              server={server}
              device={device}
              error={bleError}
              // isAvailable={isAvailable}
              isConnected={isBLEConnected}
              requestDevice={requestDevice}
              connect={connectBLE}
              readCharacteristic={readCharacteristic}
              writeCharacteristic={writeCharacteristic}
              disconnect={disconnectBLE}
              setError={setBLEError}
             />
             <VersionCheck currentVersion={latestData?.firmware_version} device_ip={latestData?.ip} />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                {activeView === "overview" && "Dashboard Overview"}
                {activeView === "analytics" && "Analytics & Visualization"}
                {activeView === "connection" && "MQTT Connection"}
                {activeView === "settings" && "Settings"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeView === "overview" && "Real-time sensor monitoring and status"}
                {activeView === "analytics" && "Historical data trends and circular gauges"}
                {activeView === "connection" && "Manage MQTT broker connection"}
                {activeView === "settings" && "Configure dashboard preferences"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">{renderView()}</main>
      </div>
    </div>
  )
}

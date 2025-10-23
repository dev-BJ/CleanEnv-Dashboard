"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import mqtt from "mqtt"

export interface SensorData {
  battery_voltage: number
  battery_current: number
  teg_current: number
  teg_voltage: number
  charging_current: number
  charging_voltage: number
  temperature: number
  timestamp: number
  deviceId: string
  uptime: number
  fan_state?: boolean
  active_connection?: string
  signal_strength?: number
  ble_status?: boolean
  ip?: string
  firmware_version?: string
}

export interface MqttConfig {
  brokerUrl: string
  topics: string[]
  options?: mqtt.IClientOptions
}

export function useMqtt() {
  const [isConnected, setIsConnected] = useState(false)
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [latestData, setLatestData] = useState<SensorData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null)
  const [isReceivingData, setIsReceivingData] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor" | "disconnected">(
    "disconnected",
  )
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const clientRef = useRef<mqtt.MqttClient | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const dataTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateConnectionQuality = useCallback(() => {
    if (!isConnected) {
      setConnectionQuality("disconnected")
      return
    }

    const now = Date.now()
    if (!lastUpdateTime) {
      setConnectionQuality("good")
      return
    }

    const timeSinceLastUpdate = now - lastUpdateTime
    if (timeSinceLastUpdate < 5000) {
      setConnectionQuality("excellent")
    } else if (timeSinceLastUpdate < 15000) {
      setConnectionQuality("good")
    } else {
      setConnectionQuality("poor")
    }
  }, [isConnected, lastUpdateTime])

  useEffect(() => {
    if (isConnected) {
      heartbeatRef.current = setInterval(updateConnectionQuality, 2000)
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
    }
    // console.log("Config: ", config)

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [isConnected, updateConnectionQuality])

  // config: MqttConfig
  const connect = useCallback((config: MqttConfig) => {
    try {
      setError(null)
      if (!config.brokerUrl || config.topics.length === 0) {
        setError("Broker URL and at least one topic must be provided.")
        return
      }
      if (!config.brokerUrl.startsWith("ws://") && !config.brokerUrl.startsWith("wss://")) {
        setError("Invalid protocol. Broker URL in a web client must start with ws:// or wss://.")
        return
      }
      // Default MQTT options for web clients
      const defaultOptions: mqtt.IClientOptions = {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        ...config.options,
      }
      console.log("Connecting to MQTT broker:", config.brokerUrl, "with options:", defaultOptions)
      clientRef.current = mqtt.connect(config.brokerUrl, defaultOptions)

      clientRef.current.on("connect", () => {
        console.log("[v0] MQTT connected successfully")
        setFeedbackMessage("Connected to MQTT broker")
        setIsConnected(true)
        setConnectionQuality("good")
        setError(null)

        // Subscribe to all configured topics
        config.topics.forEach((topic) => {
          clientRef.current?.subscribe(topic, (err) => {
            if (err) {
              console.error(`[v0] Failed to subscribe to ${topic}:`, err)
              setError(`Failed to subscribe to ${topic}`)
            } else {
              console.log(`[v0] Subscribed to topic: ${topic}`)
            }
          })
        })
      })

      clientRef.current.on("message", (topic, message) => {
        try {
          const data = JSON.parse(message.toString())
          console.log(`[v0] Received data from ${topic}:`, data)

          // Create standardized sensor data
          // Math.random() * 12 + 3
          const sensorReading: SensorData = {
            battery_voltage: data.b_v || 0, // Fallback for demo
            battery_current: data.b_c || 0, // Fallback for demo
            teg_current: data.t_c || 0, // Fallback for demo
            teg_voltage: data.t_v || 0, // Fallback for demo
            charging_current: data.c_c || 0, // Fallback for demo
            charging_voltage: data.c_v || 0, // Fallback for demo
            uptime: data.uptime || 0, // Fallback for demo
            temperature: data.temp || 0, // Fallback for demo
            timestamp: data.timestamp || Date.now(),
            deviceId: data.deviceId || topic,
            fan_state: data.fan_state || false,
            signal_strength: data.sig_rssi ?? 0,
            active_connection: data.active_conn == 0 ? "WiFi" : (data.active_conn == 1 ? "Cellular" : "None"),
            ble_status: data.ble_status || false,
            ip: data.ip || "",
            firmware_version: data.ver || "0.0.0",
          }

          const now = Date.now()
          setLatestData(sensorReading)
          setLastUpdateTime(now)
          setIsReceivingData(true)
          setSensorData((prev) => [...prev.slice(-99), sensorReading]) // Keep last 100 readings

          if (dataTimeoutRef.current) {
            clearTimeout(dataTimeoutRef.current)
          }
          dataTimeoutRef.current = setTimeout(() => {
            setIsReceivingData(false)
          }, 1000)
        } catch (err) {
          console.error("[v0] Failed to parse MQTT message:", err)
          setError("Failed to parse sensor data")
        }
      })

      clientRef.current.on("error", (err) => {
        console.error("[v0] MQTT connection error:", err)
        setError(`Connection error: ${err.message}`)
        setIsConnected(false)
        setConnectionQuality("disconnected")
        // setFeedbackMessage()
      })

      clientRef.current.on("close", () => {
        console.log("[v0] MQTT connection closed")
        setIsConnected(false)
        setConnectionQuality("disconnected")
        setFeedbackMessage("Disconnected from MQTT broker")
        // clientRef.current = null
      })

      clientRef.current.on("reconnect", () => {
        console.log("[v0] MQTT reconnecting")
        setIsConnected(false)
        setConnectionQuality("disconnected")
        setFeedbackMessage("Reconnecting to MQTT broker")
      })

      clientRef.current.on("offline", () => {
        console.log("[v0] MQTT offline")
        setIsConnected(false)
        setConnectionQuality("disconnected")
        setFeedbackMessage("MQTT client is offline")
      })

      clientRef.current.on("disconnect", () => {
        console.log("[v0] MQTT disconnected")
        setIsConnected(false)
        setConnectionQuality("disconnected")
        setFeedbackMessage("Disconnected from MQTT broker")
        // clientRef.current = null 
      })

      clientRef.current.on("end", () => {
        console.log("[v0] MQTT connection ended")
        setIsConnected(false)
        setConnectionQuality("disconnected")
        setFeedbackMessage("MQTT connection ended")
        // clientRef.current = null
      })
    } catch (err) {
      console.error("[v0] Failed to create MQTT client:", err)
      setError(`Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`)
      setConnectionQuality("disconnected")
      setFeedbackMessage("Failed to connect to MQTT broker")
      // clientRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end()
      clientRef.current = null
      setIsConnected(false)
      setConnectionQuality("disconnected")
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current)
      dataTimeoutRef.current = null
    }
  }, [])

  const publishMessage = useCallback(
    (topic: string, message: string) => {
      if (clientRef.current && isConnected) {
        clientRef.current.publish(topic, message)
      }
    },
    [isConnected],
  )

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
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
    publishMessage,
    // linkConfig,
  }
}

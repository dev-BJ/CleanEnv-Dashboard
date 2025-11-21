"use client"

import { useState, useEffect, useCallback } from "react"
import type { useBLE } from "@/hooks/use-ble"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
// import {Loading}
import { AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWebBLE } from "@/hooks/use-WebBLE";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
const CHARACTERISTIC_UUID_SSID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
const CHARACTERISTIC_UUID_PASS = "beb5483e-36e1-4688-b7f5-ea07361b26a9"
const CHARACTERISTIC_UUID_GPRS_APN = "beb5483e-36e1-4688-b7f5-ea07361b26b7"
const CHARACTERISTIC_UUID_GPRS_USER = "beb5483e-36e1-4688-b7f5-ea07361b26b8"
const CHARACTERISTIC_UUID_GPRS_PASS = "beb5483e-36e1-4688-b7f5-ea07361b26b9"

type BLESettingPanelProps = ReturnType<typeof useBLE>

export function BLESettingPanel({server, device, error, isConnected, requestDevice, connect, readCharacteristic, writeCharacteristic, disconnect, setError}: BLESettingPanelProps) {
  const [ssid, setSsid] = useState("")
  const [apn, setApn] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { supported: bleAvailable, reason: btPermissionState} = useWebBLE();


  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      disconnect() // Ensure any existing connection is disconnected
      await requestDevice([{name: "CleanEnv ESP32 Provisioner", services: [SERVICE_UUID] }])
      await connect()
    } catch (err) {
      console.error("Connection error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      if (server) {
        try {
          const ssidValue = await readCharacteristic(SERVICE_UUID, CHARACTERISTIC_UUID_SSID)
          const passValue = await readCharacteristic(SERVICE_UUID, CHARACTERISTIC_UUID_PASS)
          const apnValue = await readCharacteristic(SERVICE_UUID, CHARACTERISTIC_UUID_GPRS_APN)
          const userValue = await readCharacteristic(SERVICE_UUID, CHARACTERISTIC_UUID_GPRS_USER)
          const gprsPassValue = await readCharacteristic(SERVICE_UUID, CHARACTERISTIC_UUID_GPRS_PASS)
          
          if (apnValue) {
            const apnStr = new TextDecoder().decode(apnValue.buffer)
            setApn(apnStr)
          }
          if (userValue) {
            const userStr = new TextDecoder().decode(userValue.buffer)
            setUser(userStr)
          }
          if (gprsPassValue) {
            const gprsPassStr = new TextDecoder().decode(gprsPassValue.buffer)
            setPass(gprsPassStr)
          }
          // Add more characteristics as needed

          if (ssidValue) {
            const ssid = new TextDecoder().decode(ssidValue.buffer)
            setSsid(ssid)
          }
          if (passValue) {
            const pass = new TextDecoder().decode(passValue.buffer)
            setPassword(pass)
          }
        } catch (err) {
          console.error("Read error:", err)
        }
      }
    }
    fetchInitialData()
  }, [server])
  
  const handleWriteCharacteristic = async (characteristicUUID: string, value: string) => {
    if (!server) return
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(value)
      const char = await writeCharacteristic(SERVICE_UUID, characteristicUUID, data.buffer)
      
      if (char) {
        // await char.startNotifications();
        // char.addEventListener('characteristicvaluechanged', (event: any) => {
        //   const receivedValue = event.target.value;
        //   const decoded = new TextDecoder().decode(receivedValue.buffer);
        //   console.log("Notification received:", decoded);
        //   if(decoded === value) {
        //     // console.log("Write confirmed for characteristic:", characteristicUUID);
        //     setSuccessMessage("Settings saved successfully!");
        //     setTimeout(() => setSuccessMessage(null), 3000);
        //     setError(null);
        //     return true;
        //   } else {
        //     // console.log("Write failed for characteristic:", characteristicUUID);
        //     setError("Write verification failed");
        //     return false;
        //   }
        // });
        return true;
      }
    } catch (err) {
      console.error("Write error:", err)
    }
  }

 const handleWifiSave = async () => {
    await handleWriteCharacteristic(CHARACTERISTIC_UUID_SSID, ssid)
    await handleWriteCharacteristic(CHARACTERISTIC_UUID_PASS, password)
    setSuccessMessage("Wifi Settings saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
    setError(null);
  }

  const handleGPRSSave = async () => {
    await handleWriteCharacteristic(CHARACTERISTIC_UUID_GPRS_APN, apn)
    await handleWriteCharacteristic(CHARACTERISTIC_UUID_GPRS_USER, user)
    await handleWriteCharacteristic(CHARACTERISTIC_UUID_GPRS_PASS, pass)
    setSuccessMessage("GPRS Settings saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
    setError(null);
  }

  if (!bleAvailable) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Web Bluetooth API is not available in this browser. Please use a compatible browser like Chrome or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  if (btPermissionState === 'permission_denied') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bluetooth permission is denied. Please enable it in your browser settings for this site to use BLE features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {server ? (
            <Wifi className="h-5 w-5 text-primary" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          BLE Settings
        </CardTitle>
        <CardDescription>Configure BLE settings for the device</CardDescription>
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

        {successMessage && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
            {!isConnected ? (
              <Button onClick={handleConnect} className="flex-1" disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            ) : (
              <Button onClick={disconnect} variant="outline" className="flex-1 bg-transparent">
                Disconnect
              </Button>
            )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Wifi Settings</CardTitle>
              <CardDescription>Configure WiFi settings for the device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
            <Label htmlFor="ssid">WiFi SSID</Label>
            <Input
              id="ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="WiFi SSID"
              disabled={!isConnected}
            />
          </div>

          <div>
            <Label htmlFor="password">WiFi Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={!isConnected}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleWifiSave} className="flex-1" disabled={!isConnected}>
              Save WiFi Settings
            </Button>
          </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">GPRS Settings</CardTitle>
              <CardDescription>Configure GPRS settings for the device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
             <div>
              <Label htmlFor="apn">APN</Label>
              <Input
                id="apn"
                value={apn}
                onChange={(e) => setApn(e.target.value)}
                placeholder="internet.mtnnigeria.net"
                disabled={!isConnected}
              />
            </div>

            <div>
              <Label htmlFor="user">Username</Label>
              <Input
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="user"
                disabled={!isConnected}
              />
            </div>

            <div>
              <Label htmlFor="pass">Password</Label>
              <Input
                id="pass"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="user"
                disabled={!isConnected}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGPRSSave} className="flex-1" disabled={!isConnected}>
                Save GPRS Settings
              </Button>
            </div>
            </CardContent>
          </Card>

        </div>
      </CardContent>
    </Card>
  )
}

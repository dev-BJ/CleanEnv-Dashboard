import { useState, useCallback } from "react";

export function useBLE() {
  const [device, setDevice] = useState<any | null>(null);
  const [server, setServer] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Check if Web Bluetooth API is available
  // const isAvailable = useCallback(() => {
  //   if (typeof navigator === "undefined") return false;
  //   return Boolean((navigator as any)?.bluetooth);
  // }, []);

  // Request BLE device
  const requestDevice = useCallback(async (filters?: any[]) => {
  try {
    const options: any = {
      acceptAllDevices: true,
    };
    if (filters && filters.length > 0) {
      // options.filters = filters;
      // Collect all service UUIDs from filters
      options.optionalServices = filters
        .map((f) => f.services)
        .flat();
    }
    // setError(options)
    const dev = await (navigator as any).bluetooth.requestDevice(options);
    setDevice(dev);
    setError(null);
    return dev;
  } catch (err: any) {
    setError(err.message);
    return null;
  }
}, []);

  // Connect to GATT server
  const connect = useCallback(async () => {
    if (!device) return null;
    try {
      const srv = await device.gatt?.connect();
      setServer(srv || null);
      setIsConnected(true);
      setError(null);
      return srv;
    } catch (err: any) {
      setError(err.message);
      setIsConnected(false);
      return null;
    }
  }, [device]);

  // Read characteristic value
  const readCharacteristic = useCallback(
    async (serviceUUID: string, characteristicUUID: string) => {
      if (!server) return null;
      try {
        const service = await server.getPrimaryService(serviceUUID);
        const characteristic = await service.getCharacteristic(characteristicUUID);
        const value = await characteristic.readValue();
        setError(null);
        return value;
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    [server]
  );
  

  // Write characteristic value
  const writeCharacteristic = useCallback(
    async (serviceUUID: string, characteristicUUID: string, value: ArrayBuffer) => {
      if (!server) return false;
      try {
        const service = await server.getPrimaryService(serviceUUID);
        const characteristic = await service.getCharacteristic(characteristicUUID);
        await characteristic.writeValue(value);
        // await characteristic.startNotifications();
        setError(null);
        return characteristic;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [server]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    setServer(null);
    setIsConnected(false);
    setDevice(null); // <-- Add this line
  }, [device]);

  return {
    device,
    server,
    error,
    // isAvailable,
    isConnected,
    requestDevice,
    connect,
    readCharacteristic,
    writeCharacteristic,
    disconnect,
    setError
  };
}
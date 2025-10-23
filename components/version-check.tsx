import { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function VersionCheck({currentVersion, device_ip}: {currentVersion?: string, device_ip?: string}) {
    const { toast } = useToast()
    const [version, setVersion] = useState('')
    const [isUpToDate, setIsUpToDate] = useState(true)

    async function checkVersion() {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'version.txt')
            const data = await response.text()
            console.log(data)
            if(data.includes('404')) return
            setVersion(data)
            let version_check = parseVersion(data) >= parseVersion(currentVersion || '0.0.0');
            if (!version_check) {
                toast({
                    title: 'New version available',
                    description: 'A new version is available. Please update.',
                })
            }
            setIsUpToDate(version_check);
        } catch (error) {
            console.error('Error checking version:', error)
        }
    }

    const parseVersion = useCallback((ver: string): number => {
        if (!ver) return 0;
        let major = 0, minor = 0, patch = 0;
        const ver_split = ver.split('.');
        major = parseInt(ver_split[0], 10) || 0;
        minor = parseInt(ver_split[1], 10) || 0;
        patch = parseInt(ver_split[2], 10) || 0;
        return major * 10000 + minor * 100 + patch;
    }, [])

    async function downloadFirmware() {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'firmware.bin')
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `firmware-${version}.bin`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading firmware:', error)
        }
    }

    return (
        <Card className='mt-2'>
            <CardHeader>
                <CardTitle>Version Check</CardTitle>
                <CardDescription>Check for updates</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Current Version: {currentVersion || "0.0.0"}
                </p>
                <p className="text-sm text-muted-foreground">
                    Latest Version: {version || "0.0.0"}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                    Device IP: {device_ip || "0.0.0.0"}
                </p>
                <p className='flex flex-col justify-center gap-2 md:w-80'>
                    <Button onClick={checkVersion}>Check Version</Button>
                    
                    {!isUpToDate && (
                        <>
                            <Button onClick={downloadFirmware} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                                <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                                <span>Download</span>
                            </Button>
                            <a className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center" href={`http://${device_ip || '0.0.0.0'}:443`} target="_blank"><span>OTA Update UI</span></a>
                        </>
                    )}
                </p>
            </CardContent>
        </Card>
    )
}
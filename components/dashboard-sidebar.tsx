"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, LineChart, Settings, Wifi, ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navigation = [
  {
    name: "Overview",
    id: "overview",
    icon: LayoutDashboard,
    description: "Real-time sensor monitoring",
  },
  {
    name: "Analytics",
    id: "analytics",
    icon: LineChart,
    description: "Historical data and trends",
  },
  {
    name: "Connection",
    id: "connection",
    icon: Wifi,
    description: "MQTT broker settings",
  },
  {
    name: "Settings",
    id: "settings",
    icon: Settings,
    description: "Dashboard configuration",
  },
]

export function DashboardSidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  return (
    <div
      className={cn(
        "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">CleanEnv</h2>
            <p className="text-xs text-sidebar-foreground/60">System Monitoring</p>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto p-3",
                  isCollapsed && "justify-center p-2",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isCollapsed && "h-5 w-5")} />
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs opacity-60">{item.description}</span>
                  </div>
                )}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">
            <p>v1.0.0</p>
            <p>Real-time monitoring</p>
          </div>
        </div>
      )}
    </div>
  )
}

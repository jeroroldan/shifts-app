"use client"
import { List, BarChart3, Calendar, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isClientView = pathname.startsWith("/cliente")

  const clientTabs = [{ id: "book", label: "Reservar Turno", icon: Calendar }]

  const ownerTabs = [
    { id: "list", label: "Lista de Turnos", icon: List },
    { id: "admin", label: "Panel Admin", icon: BarChart3 },
    { id: "dashboard", label: "Dashboard General", icon: PieChart },
  ]

  const tabs = isClientView ? clientTabs : ownerTabs

  const handleTabChange = (tabId: string) => {
    if (tabId === "dashboard") {
      router.push("/dashboard")
    } else if (tabId === "list" || tabId === "admin") {
      router.push("/admin")
    }
    onTabChange(tabId)
  }

  return (
    <nav className="bg-card border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                  "hover:bg-accent hover:text-accent-foreground",
                  activeTab === tab.id
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

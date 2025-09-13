"use client"
import { Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

export function ViewSelector() {
  const router = useRouter()
  const pathname = usePathname()

  const isClientView = pathname.startsWith("/cliente")
  const isOwnerView = pathname.startsWith("/admin") || pathname.startsWith("/dashboard")

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <Button
        variant={isClientView ? "default" : "ghost"}
        size="sm"
        onClick={() => router.push("/cliente")}
        className="flex items-center gap-2 text-xs"
      >
        <Users className="w-3 h-3" />
        Cliente
      </Button>
      <Button
        variant={isOwnerView ? "default" : "ghost"}
        size="sm"
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-xs"
      >
        <Settings className="w-3 h-3" />
        Dueño
      </Button>
    </div>
  )
}

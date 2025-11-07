"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useSystemName } from "@/hooks/use-system-name"

interface TopBarProps {
  onLogout: () => void
  userEmail?: string
}

export function TopBar({ onLogout, userEmail }: TopBarProps) {
  const { theme, toggleTheme, mounted } = useTheme()
  const { systemName } = useSystemName()

  if (!mounted) return null

  return (
    <div className="bg-slate-900 dark:bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">{systemName} Management</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          title={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <div className="flex items-center gap-2 text-slate-400">
          <User className="w-4 h-4" />
          <span className="text-sm">{userEmail}</span>
        </div>

        <Button onClick={onLogout} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, ShoppingCart, Users, BarChart3, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: BookOpen, label: "Livros", href: "/livros" },
  { icon: ShoppingCart, label: "Pedidos", href: "/pedidos" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {isOpen && <span className="text-xl font-bold text-white">FACA</span>}
          <Button variant="ghost" size="icon" onClick={onToggle} className="text-slate-400 hover:text-white">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}

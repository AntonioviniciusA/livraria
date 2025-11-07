"use client"

import { Package, TrendingDown, Truck, AlertCircle } from "lucide-react"

export function PurchaseStats() {
  const stats = [
    { label: "Total de Compras", value: "156", icon: Package, color: "blue" },
    { label: "Entregues", value: "120", icon: TrendingDown, color: "green" },
    { label: "Processando", value: "28", icon: Truck, color: "yellow" },
    { label: "Pendentes", value: "8", icon: AlertCircle, color: "red" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        const colorClass = {
          blue: "bg-blue-900/50 text-blue-300",
          green: "bg-green-900/50 text-green-300",
          yellow: "bg-yellow-900/50 text-yellow-300",
          red: "bg-red-900/50 text-red-300",
        }[stat.color]

        return (
          <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

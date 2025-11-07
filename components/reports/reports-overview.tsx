"use client"

import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"

export function ReportsOverview() {
  const metrics = [
    {
      label: "Receita Total",
      value: "R$ 125,450.90",
      change: "+18.5%",
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Clientes Ativos",
      value: "456",
      change: "+12.3%",
      icon: Users,
      color: "blue",
    },
    {
      label: "Pedidos Processados",
      value: "1,234",
      change: "+25.1%",
      icon: ShoppingCart,
      color: "violet",
    },
    {
      label: "Taxa de Crescimento",
      value: "8.2%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "orange",
    },
  ]

  const colorClasses = {
    emerald: "bg-emerald-900/50 text-emerald-300",
    blue: "bg-blue-900/50 text-blue-300",
    violet: "bg-violet-900/50 text-violet-300",
    orange: "bg-orange-900/50 text-orange-300",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        const colorClass = colorClasses[metric.color as keyof typeof colorClasses]

        return (
          <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{metric.label}</p>
                <h3 className="text-2xl font-bold text-white mt-2">{metric.value}</h3>
                <p className="text-green-400 text-sm font-semibold mt-2">{metric.change} este mês</p>
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

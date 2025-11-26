"use client"

import { ShoppingCart, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { getPedidos } from "@/api/pedidos"

export function OrderStats() {
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [pedidosEntregues, setPedidosEntregues] = useState(0)
  const [pedidosProcessando, setPedidosProcessando] = useState(0)
  const [pedidosPendentes, setPedidosPendentes] = useState(0)
  const stats = [
    { label: "Total de Pedidos", value: totalPedidos, icon: ShoppingCart, color: "blue" },
    { label: "Entregues", value: pedidosEntregues, icon: TrendingUp, color: "green" },
    { label: "Processando", value: pedidosProcessando, icon: Clock, color: "yellow" },
    { label: "Pendentes", value: pedidosPendentes, icon: AlertCircle, color: "red" },
  ]

  async function fetchStats() {
    const response = await getPedidos()
    setTotalPedidos(response.length)

    const entregues = response.filter((pedido: any) => pedido.status === "ENTREGUE").length
    const processando = response.filter((pedido: any) => pedido.status === "PROCESSANDO").length
    const pendentes = response.filter((pedido: any) => pedido.status === "PENDENTE").length

    setPedidosEntregues(entregues)
    setPedidosProcessando(processando)
    setPedidosPendentes(pendentes)
  }

  useEffect(() => {
    fetchStats()
  }, [])

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
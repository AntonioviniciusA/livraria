"use client"

import { Button } from "@/components/ui/button"
import { Trash, CheckCircle, Clock, XCircle } from "lucide-react"

export function OrderList(
  {orders, onDelete}: {orders: any[], onDelete: (id: number) => void}
) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Entregue":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "Processando":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "Pendente":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "Cancelado":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">ID Pedido</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Cliente</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Data</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Itens</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Total</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Status</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{order.id}</td>
                <td className="py-4 px-6 text-slate-300">{order.cliente.nome}</td>
                <td className="py-4 px-6 text-slate-300">{order.data}</td>
                <td className="py-4 px-6 text-slate-300">{order.estatisticas.total_itens}</td>
                <td className="py-4 px-6 text-white font-semibold">{order.total}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`text-sm font-semibold ${
                        order.status === "Entregue"
                          ? "text-green-400"
                          : order.status === "Processando"
                            ? "text-blue-400"
                            : order.status === "Pendente"
                              ? "text-yellow-400"
                              : "text-red-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Button onClick={() => onDelete(order.id)} size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
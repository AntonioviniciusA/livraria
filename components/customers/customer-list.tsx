"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"

const customers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 98765-4321",
    total: "R$ 2,450.00",
    orders: 8,
    status: "Ativo",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "(21) 99876-5432",
    total: "R$ 1,890.50",
    orders: 5,
    status: "Ativo",
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@example.com",
    phone: "(31) 98765-4321",
    total: "R$ 3,560.00",
    orders: 12,
    status: "Inativo",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@example.com",
    phone: "(41) 99876-5432",
    total: "R$ 4,123.00",
    orders: 15,
    status: "Ativo",
  },
]

export function CustomerList() {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Nome</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Email</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Telefone</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Total Gasto</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Pedidos</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Status</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{customer.name}</td>
                <td className="py-4 px-6 text-slate-300">{customer.email}</td>
                <td className="py-4 px-6 text-slate-300">{customer.phone}</td>
                <td className="py-4 px-6 text-white font-semibold">{customer.total}</td>
                <td className="py-4 px-6 text-slate-300">{customer.orders}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === "Ativo" ? "bg-green-900/50 text-green-300" : "bg-gray-900/50 text-gray-300"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

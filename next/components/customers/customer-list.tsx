// components/customers/customer-list.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export function CustomerList({
  clientes,
  onUpdate,
  onDelete,
}: {
  clientes: any[];
  onUpdate: (customer: any) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">
                Nome
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">
                Email
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">
                Telefone
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">
                Total Gasto
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">
                Pedidos
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="hover:bg-slate-700/50 transition-colors"
              >
                <td className="py-4 px-6 text-white font-medium">
                  {cliente.nome}
                </td>
                <td className="py-4 px-6 text-slate-300">{cliente.email}</td>
                <td className="py-4 px-6 text-slate-300">{cliente.telefone}</td>
                <td className="py-4 px-6 text-white font-semibold">
                  {cliente.valor_total_pedidos || "R$ 0,00"}
                </td>
                <td className="py-4 px-6 text-slate-300">
                  {cliente.total_pedidos || 0}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onUpdate(cliente)}
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300"
                      title="Editar cliente"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(cliente.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      title="Excluir cliente"
                    >
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
  );
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Purchase {
  id: number
  bookTitle: string
  supplier: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  status: "Entregue" | "Processando" | "Pendente"
}

interface PurchaseListProps {
  purchases: Purchase[]
}

export function PurchaseList({ purchases }: PurchaseListProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Compras Registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Livro</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Fornecedor</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Qtd</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Preço Unit.</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Data</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-white font-medium">{purchase.bookTitle}</td>
                  <td className="py-3 px-4 text-slate-300">{purchase.supplier}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{purchase.quantity}</td>
                  <td className="py-3 px-4 text-right text-slate-300">R$ {purchase.unitPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-white font-medium">R$ {purchase.totalPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-300">{purchase.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        purchase.status === "Entregue"
                          ? "bg-green-900/30 text-green-400"
                          : purchase.status === "Processando"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

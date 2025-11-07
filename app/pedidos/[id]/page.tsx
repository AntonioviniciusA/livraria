"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/pedidos")} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Pedido #{params.id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Itens do Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Clean Code</p>
                    <p className="text-slate-400 text-sm">Quantidade: 2</p>
                  </div>
                  <p className="text-white font-semibold">R$ 179.80</p>
                </div>
                <div className="flex justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Design Patterns</p>
                    <p className="text-slate-400 text-sm">Quantidade: 1</p>
                  </div>
                  <p className="text-white font-semibold">R$ 124.90</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Endereço de Entrega</h2>
              <p className="text-slate-300">João Silva</p>
              <p className="text-slate-400 text-sm mt-2">Rua Exemplo, 123 - São Paulo, SP</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Resumo</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-slate-400">Subtotal</p>
                  <p className="text-white">R$ 304.70</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-400">Frete</p>
                  <p className="text-white">R$ 10.00</p>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <p className="text-white font-semibold">Total</p>
                  <p className="text-white font-bold text-lg">R$ 314.70</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Pedido Confirmado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Pagamento Recebido</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Preparando Envio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                  <span className="text-slate-500">Enviado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

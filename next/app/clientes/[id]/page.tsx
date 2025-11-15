"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"


export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

 useEffect(() => {
    

  
  }, []);


  if (!user) return null

  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/clientes")} className="text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-white">João Silva</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white">joao@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-slate-400 text-sm">Telefone</p>
                  <p className="text-white">(11) 98765-4321</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-slate-400 text-sm">Endereço</p>
                  <p className="text-white">São Paulo, SP</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Estatísticas</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Total Gasto</p>
                  <p className="text-2xl font-bold text-white mt-2">R$ 2.450</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Pedidos</p>
                  <p className="text-2xl font-bold text-white mt-2">8</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Ticket Médio</p>
                  <p className="text-2xl font-bold text-white mt-2">R$ 306</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Últimos Pedidos</h2>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-white">#001</span>
                  <span className="text-green-400">Entregue</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-white">#003</span>
                  <span className="text-blue-400">Processando</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

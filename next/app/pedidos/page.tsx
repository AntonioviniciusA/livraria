"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OrderList } from "@/components/orders/order-list"
import { OrderStats } from "@/components/orders/order-stats"
import { PurchaseStats } from "@/components/orders/purchase-stats"
import { PurchaseList } from "@/components/orders/purchase-list"
import { OrderFormModal } from "@/components/orders/order-form-modal"
import { PurchaseFormModal } from "@/components/orders/purchase-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PedidosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"pedidos" | "compras">("pedidos")
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false)
  const [purchases, setPurchases] = useState([
    {
      id: 1,
      bookTitle: "Clean Code",
      supplier: "Fornecedor A",
      quantity: 10,
      unitPrice: 85.0,
      totalPrice: 850.0,
      date: "2025-01-15",
      status: "Entregue" as const,
    },
    {
      id: 2,
      bookTitle: "Design Patterns",
      supplier: "Fornecedor B",
      quantity: 5,
      unitPrice: 120.0,
      totalPrice: 600.0,
      date: "2025-01-20",
      status: "Processando" as const,
    },
  ])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleAddPurchase = (purchaseData: any) => {
    const newPurchase = {
      id: purchases.length + 1,
      ...purchaseData,
      totalPrice: purchaseData.quantity * purchaseData.unitPrice,
      status: "Processando" as const,
    }
    setPurchases([...purchases, newPurchase])
  }

  if (!user) return null

  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Pedidos</h1>
            <p className="text-slate-400 mt-2">Visualize e gerencie pedidos e compras</p>
          </div>
          {activeTab === "pedidos" && (
            <Button
              onClick={() => setIsOrderFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Pedido
            </Button>
          )}
          {activeTab === "compras" && (
            <Button
              onClick={() => setIsPurchaseFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Compra
            </Button>
          )}
        </div>

        <div className="flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`pb-2 px-4 transition-colors font-medium ${
              activeTab === "pedidos" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Pedidos de Clientes
          </button>
          <button
            onClick={() => setActiveTab("compras")}
            className={`pb-2 px-4 transition-colors font-medium ${
              activeTab === "compras" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Compras de Livros
          </button>
        </div>

        {activeTab === "pedidos" && (
          <>
            <OrderStats />
            <OrderList />
          </>
        )}
        {activeTab === "compras" && (
          <>
            <PurchaseStats />
            <PurchaseList purchases={purchases} />
          </>
        )}

        <OrderFormModal isOpen={isOrderFormOpen} onClose={() => setIsOrderFormOpen(false)} />
        <PurchaseFormModal
          isOpen={isPurchaseFormOpen}
          onClose={() => setIsPurchaseFormOpen(false)}
          onAddPurchase={handleAddPurchase}
        />
      </div>
    </DashboardLayout>
  )
}

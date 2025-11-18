"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OrderList } from "@/components/orders/order-list"
import { OrderStats } from "@/components/orders/order-stats"
import { OrderFormModal } from "@/components/orders/order-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getUserProfile, getToken } from "@/api/auth"
import { createPedido, getPedidos, deletePedido } from "@/api/pedidos"

export default function PedidosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false)
  const [purchases, setPurchases] = useState([])

  async function getProfile() {
    const profile = await getUserProfile();
   
    setUser(profile);
    
  }
  async function fetchPedidos() {
    const pedidos = await getPedidos();
    console.log("Pedidos fetched:", pedidos);
     setPurchases(pedidos)
  }

  async function handleDeleteOrder(orderId: number) {
 try {
     // Call your API to delete the order
    const response = await deletePedido(orderId);
    if (response) {
      // Refresh the order list after deletion
      fetchPedidos();
    }
 } catch (error) {
    console.error("Error deleting order:", error);
 }
  }

  const fetchOrders = async () => {

  const response = await getPedidos();
  console.log("Fetched orders in OrderList:", response);
  return response;
}

const [orders, setOrders] = useState<any[]>([]);

useEffect(() => {
  fetchOrders().then((data) => {
    setOrders(data);
    console.log("Orders fetched:", data);
  });
}, []);


useEffect(() => {
  const token = getToken();
  if (!token) {
    router.push("/");
  }
  fetchPedidos();
  getProfile();
}, []);

  const handleAddPurchase = async (purchaseData: any) => {
   const response = await createPedido(purchaseData);
    if (response) {
      fetchPedidos();
    }
    
  }

 if (user === null) return <div className="text-white">Carregando...</div>


  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Pedidos</h1>
            <p className="text-slate-400 mt-2">Visualize e gerencie pedidos e compras</p>
          </div>
        
            <Button
              onClick={() => setIsOrderFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Pedido
            </Button>
        </div>
          <>
            <OrderStats 

            />
            <OrderList
                orders={orders}
                onDelete={ (id) => {handleDeleteOrder(id)
                setOrders(orders.filter(order => order.id !== id));
              } 
               } 

             />
          </>
        <OrderFormModal onAdd={setIsOrderFormOpen} isOpen={isOrderFormOpen} onClose={() =>{setIsOrderFormOpen(false)
        fetchPedidos()  

        } } />
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CustomerList } from "@/components/customers/customer-list"
import { CustomerForm } from "@/components/customers/customer-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getUserProfile, getToken } from "@/api/auth" 

export default function ClientesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  async function getProfile() {
    const profile = await getUserProfile();
    setUser(profile);
  }


useEffect(() => {
  const token = getToken();
  if (!token) {
    router.push("/");
  }
getProfile();
}, []);
 if (user === null) return <div className="text-white">Carregando...</div>


  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Clientes</h1>
            <p className="text-slate-400 mt-2">Visualize e gerencie todos os clientes</p>
          </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>

        {showForm && (
                  <CustomerForm
                    onClose={() => setShowForm(false)}
                    onAdd={() => setShowForm(false)}
                  />
        )}

        <CustomerList />
      </div>
    </DashboardLayout>
  )
}

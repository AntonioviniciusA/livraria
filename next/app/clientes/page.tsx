// app/clientes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CustomerList } from "@/components/customers/customer-list"
import { CustomerForm } from "@/components/customers/customer-form"
import { CustomerEditForm } from "@/components/customers/customer-edit-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getUserProfile, getToken } from "@/api/auth" 
import { getClientes, deleteCliente } from "@/api/clientes"

export default function ClientesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])

  async function getProfile() {
    const profile = await getUserProfile()
    setUser(profile)
  }

  async function fetchClientes() {
    const response = await getClientes()
    console.log("clientes", response)
    setClientes(response)
  }

  async function handleDeleteCliente(id: number) {
    try {
      await deleteCliente(id)
      fetchClientes()
    } catch (error) {
      console.error("Erro ao deletar cliente:", error)
    }
  }

  function handleEditCustomer(customer: any) {
    setSelectedCustomer(customer)
    setShowEditForm(true)
  }

  function handleUpdateCustomer(updatedCustomer: any) {
    setClientes(prev => 
      prev.map(cliente => 
        cliente.id === updatedCustomer.id ? updatedCustomer : cliente
      )
    )
    setShowEditForm(false)
    setSelectedCustomer(null)
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/")
    }
    getProfile()
  }, [])

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
            onAdd={() => {
              setShowForm(false)
              fetchClientes()
            }}
          />
        )}

        {showEditForm && selectedCustomer && (
          <CustomerEditForm
            customer={selectedCustomer}
            onClose={() => {
              setShowEditForm(false)
              setSelectedCustomer(null)
            }}
            onUpdate={handleUpdateCustomer}
          />
        )}

        <CustomerList
          clientes={clientes}
          onUpdate={handleEditCustomer}
          onDelete={(id) => {
            handleDeleteCliente(id)
            setClientes(prev => prev.filter(b => b.id !== id))
          }}
        />
      </div>
    </DashboardLayout>
  )
}
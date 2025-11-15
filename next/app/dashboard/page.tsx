"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { ChartCard } from "@/components/dashboard/chart-card"
import { TrendingUp, ShoppingCart, BookOpen, Users } from "lucide-react"
import { getUserProfile, getToken } from "@/api/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  async function getProfile() {
    const profile = await getUserProfile();
    console.log("User profile:", profile);
    setUser(profile);
    console.log("User state set to:", user.email);
  }


useEffect(() => {
  const token = getToken();
  if (!token) {
    router.push("/");
  }
getProfile();
}, []);
  if (!user) return null


  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-2">Bem-vindo de volta, {user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Vendas Totais" value="R$ 45,890" change="+12.5%" icon={TrendingUp} trend="up" />
          <StatsCard title="Pedidos" value="342" change="+5.2%" icon={ShoppingCart} trend="up" />
          <StatsCard title="Livros em Estoque" value="1,234" change="-2.1%" icon={BookOpen} trend="down" />
          <StatsCard title="Clientes" value="456" change="+8.3%" icon={Users} trend="up" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Vendas por Mês" />
          <ChartCard title="Categorias Populares" />
        </div>

        {/* Recent Orders */}
        <RecentOrders />
      </div>
    </DashboardLayout>
  )
}

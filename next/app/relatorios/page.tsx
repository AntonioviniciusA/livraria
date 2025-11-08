"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { SalesReport } from "@/components/reports/sales-report"
import { InventoryReport } from "@/components/reports/inventory-report"

export default function RelatoriosPage() {
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
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 mt-2">Analise dados e tendências do negócio</p>
        </div>

        <ReportsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesReport />
          <InventoryReport />
        </div>
      </div>
    </DashboardLayout>
  )
}

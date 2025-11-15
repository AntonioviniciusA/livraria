"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default function ConfiguracoesPage() {
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

 if (user === null) return <div className="text-white">Carregando...</div>


  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400 mt-2">Gerencie as configurações do sistema</p>
        </div>

        <SettingsTabs />
      </div>
    </DashboardLayout>
  )
}

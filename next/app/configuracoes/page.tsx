"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { getToken, getUserProfile } from "@/api/auth"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

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
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400 mt-2">Gerencie as configurações do sistema</p>
        </div>

        <SettingsTabs />
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import {  Download, Calendar, User, Globe } from "lucide-react"
import { getUserProfile, getToken } from "@/api/auth"
import { getLogs } from "@/api/log" // Supondo que esta API já existe

export default function RelatoriosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  async function getProfile() {
    const profile = await getUserProfile()
    setUser(profile)
  }

  async function fetchLogs() {
    try {
      const logsData = await getLogs()
      console.log("Logs fetched:", logsData)
      setLogs(logsData)
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/")
    }
    fetchLogs()
    getProfile()
  }, [])

  const handleDownloadReport = (logId: string) => {
    // Lógica para download do relatório
    console.log("Download do relatório:", logId)
  }

  const handleViewDetails = (log: any) => {
    // Lógica para visualizar detalhes do log
    console.log("Detalhes do log:", log)
  }

  if (user === null || loading) return <div className="text-white">Carregando...</div>

  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios do Sistema</h1>
            <p className="text-slate-400 mt-2">Visualize e gerencie os logs do sistema</p>
          </div>
          <Button
            onClick={() => fetchLogs()}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Atualizar Relatórios
          </Button>
        </div>

        <LogsList logs={logs} onDownload={handleDownloadReport} onViewDetails={handleViewDetails} />
      </div>
    </DashboardLayout>
  )
}

// Componente para listar os logs
function LogsList({ logs, onDownload, onViewDetails }: { 
  logs: any[]; 
  onDownload: (id: string) => void;
  onViewDetails: (log: any) => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <User className="w-4 h-4 text-blue-400" />
      case "error":
        return <div className="w-3 h-3 rounded-full bg-red-400" />
      case "warning":
        return <div className="w-3 h-3 rounded-full bg-yellow-400" />
      case "info":
        return <div className="w-3 h-3 rounded-full bg-blue-400" />
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "login":
        return "text-blue-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "info":
        return "text-green-400"
      default:
        return "text-slate-400"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  const truncateId = (id: string) => {
    return id.substring(0, 8) + '...'
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">ID</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Tipo</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Mensagem</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Usuario</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">IP</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Data/Hora</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {logs.map((log: any) => (
              <tr key={log._id} className="hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-6 text-white font-mono text-sm">
                  {truncateId(log._id)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(log.type)}
                    <span className={`font-semibold capitalize ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-300 max-w-md">
                  {log.message}
                </td>
                <td className="py-4 px-6 text-slate-300">
                  {log.user || 'N/A'}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="w-4 h-4" />
                    {log.data?.ip || 'N/A'}
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-300 text-sm">
                  {formatDate(log.createdAt)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:text-green-300"
                      onClick={() => onDownload(log._id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Nenhum log encontrado
          </div>
        )}
      </div>
    </div>
  )
}
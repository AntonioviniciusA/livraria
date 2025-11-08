"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSystemName } from "@/hooks/use-system-name"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<"empresa" | "sistema" | "usuarios">("empresa")
  const { systemName, updateSystemName } = useSystemName()
  const [localSystemName, setLocalSystemName] = useState(systemName)

  useEffect(() => {
    setLocalSystemName(systemName)
  }, [systemName])

  const tabs = [
    { id: "empresa", label: "Dados da Empresa", icon: "🏢" },
    { id: "sistema", label: "Sistema", icon: "⚙️" },
    { id: "usuarios", label: "Usuários", icon: "👥" },
  ]

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 px-4 transition-colors font-medium ${
              activeTab === tab.id ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "empresa" && (
        <CompanySettings
          systemName={localSystemName}
          onSystemNameChange={setLocalSystemName}
          onSave={() => updateSystemName(localSystemName)}
        />
      )}
      {activeTab === "sistema" && <SystemSettings />}
      {activeTab === "usuarios" && <UsersSettings />}
    </div>
  )
}

function CompanySettings({ systemName, onSystemNameChange, onSave }: any) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Informações da Empresa</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white">Nome do Sistema</label>
          <Input
            value={systemName}
            onChange={(e) => onSystemNameChange(e.target.value)}
            className="mt-2 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white">Nome da Empresa</label>
          <Input defaultValue="FACA Bookstore" className="mt-2 bg-slate-700 border-slate-600 text-white" />
        </div>

        <div>
          <label className="text-sm font-medium text-white">CNPJ</label>
          <Input defaultValue="12.345.678/0001-90" className="mt-2 bg-slate-700 border-slate-600 text-white" />
        </div>

        <div>
          <label className="text-sm font-medium text-white">Email</label>
          <Input
            type="email"
            defaultValue="contato@faca-bookstore.com.br"
            className="mt-2 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white">Telefone</label>
          <Input defaultValue="(11) 3000-0000" className="mt-2 bg-slate-700 border-slate-600 text-white" />
        </div>

        <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}

function SystemSettings() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    setDarkMode(saved === "dark")
  }, [])

  const handleDarkModeChange = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    const theme = newMode ? "dark" : "light"
    localStorage.setItem("theme", theme)
    document.documentElement.classList.toggle("dark", newMode)
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Configurações do Sistema</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
          <div>
            <p className="text-white font-medium">Modo Escuro</p>
            <p className="text-slate-400 text-sm">Ativar tema escuro por padrão</p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 cursor-pointer"
            checked={darkMode}
            onChange={handleDarkModeChange}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
          <div>
            <p className="text-white font-medium">Notificações por Email</p>
            <p className="text-slate-400 text-sm">Receber alertas de pedidos</p>
          </div>
          <input type="checkbox" className="w-5 h-5" defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
          <div>
            <p className="text-white font-medium">Backup Automático</p>
            <p className="text-slate-400 text-sm">Fazer backup diariamente</p>
          </div>
          <input type="checkbox" className="w-5 h-5" defaultChecked />
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700">Salvar Configurações</Button>
      </div>
    </div>
  )
}

function UsersSettings() {
  const users = [
    { id: 1, name: "Admin Master", email: "admin@faca.com", role: "Administrador" },
    { id: 2, name: "Gerente Estoque", email: "estoque@faca.com", role: "Gerente" },
    { id: 3, name: "Vendedor", email: "vendedor@faca.com", role: "Vendedor" },
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Usuários do Sistema</h3>
        <Button className="bg-blue-600 hover:bg-blue-700">Adicionar Usuário</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Nome</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Função</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="py-3 px-4 text-white">{user.name}</td>
                <td className="py-3 px-4 text-slate-300">{user.email}</td>
                <td className="py-3 px-4 text-slate-300">{user.role}</td>
                <td className="py-3 px-4">
                  <Button size="sm" variant="ghost" className="text-blue-400">
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

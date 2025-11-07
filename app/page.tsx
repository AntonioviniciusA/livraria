"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo />
          <h1 className="text-3xl font-bold text-white mt-4">FACA Bookstore</h1>
          <p className="text-slate-400 mt-2">Sistema de Gerenciamento de Livraria</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 shadow-xl">
          <LoginForm onLoadingChange={setIsLoading} isLoading={isLoading} />
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">© 2025 FACA Bookstore Management System</p>
      </div>
    </div>
  )
}

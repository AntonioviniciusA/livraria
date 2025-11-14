"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { login } from "@/api/auth";
interface LoginFormProps {
  onLoadingChange: (loading: boolean) => void;
  isLoading: boolean;
}

export function LoginForm({ onLoadingChange, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    onLoadingChange(true);

    try {
      const response = await login(username, password);
      console.info(response);
      console.log("username", username);
      console.log("password", password);
      onLoadingChange(false);
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      onLoadingChange(false);
      setError("Falha ao entrar. Verifique suas credenciais.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
          <Input
            type="email"
            placeholder="seu@email.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-slate-400 text-sm">
        Apenas administradores podem acessar
      </p>
    </form>
  );
}

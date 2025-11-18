"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { maskPhone, maskCPF, maskCEP } from "@/lib/input-masks"; // Você precisará criar essas máscaras
import { createCliente } from "@/api/clientes"; // Assumindo que esta API existe
interface CustomerFormProps {
  onClose: () => void;
  onAdd: (customer: any) => void;
}

export function CustomerForm({ onClose, onAdd }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let { name, value } = e.target;

    // Aplicar máscaras
    if (name === "telefone") {
      value = maskPhone(value);
    } else if (name === "cpf") {
      value = maskCPF(value);
    } else if (name === "cep") {
      value = maskCEP(value); // Você precisará criar esta máscara também
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Preparar dados para envio (remover formatação se necessário)
      const customerData = {
        ...formData,
        telefone: formData.telefone.replace(/\D/g, ""), // Remove caracteres não numéricos
        cpf: formData.cpf.replace(/\D/g, ""),
        cep: formData.cep.replace(/\D/g, ""),
      };

      const novoCliente = await createCliente(customerData);
      onAdd(novoCliente);
      onClose();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Adicionar Novo Cliente</h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <Input
            placeholder="Nome completo *"
            value={formData.nome}
            onChange={handleChange}
            name="nome"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
            disabled={loading}
          />
        </div>

        <Input
          type="email"
          placeholder="E-mail *"
          value={formData.email}
          onChange={handleChange}
          name="email"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          required
          disabled={loading}
        />

        <Input
          placeholder="Telefone *"
          value={formData.telefone}
          onChange={handleChange}
          name="telefone"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          required
          disabled={loading}
        />

        <Input
          placeholder="CPF *"
          value={formData.cpf}
          onChange={handleChange}
          name="cpf"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          required
          disabled={loading}
        />

        <div className="md:col-span-2">
          <Textarea
            placeholder="Endereço completo *"
            value={formData.endereco}
            onChange={handleChange}
            name="endereco"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
            required
            disabled={loading}
          />
        </div>

        <Input
          placeholder="Cidade *"
          value={formData.cidade}
          onChange={handleChange}
          name="cidade"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          required
          disabled={loading}
        />

        <Input
          placeholder="Estado *"
          value={formData.estado}
          onChange={handleChange}
          name="estado"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          required
          disabled={loading}
        />

        <Input
          placeholder="CEP *"
          value={formData.cep}
          onChange={handleChange}
          name="cep"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          required
          disabled={loading}
        />

        <div className="md:col-span-2 flex gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { maskPhone, maskCurrency } from "@/lib/input-masks"
import { createPedido } from "@/api/pedidos"
import { getClientes } from "@/api/clientes"
import { getLivros } from "@/api/livros"

interface OrderFormModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (pedido: any) => void
}

interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
}

interface Livro {
  id: number
  titulo: string
  preco: number
  estoque: number
}

export function OrderFormModal({ isOpen, onClose, onAdd }: OrderFormModalProps) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    livro_id: "",
    quantidade: "1",
    preco: "",
    endereco_entrega: "",
    observacoes: "",
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [livros, setLivros] = useState<Livro[]>([])
  const [loading, setLoading] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null)

  // Carregar clientes e livros quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const clientesData = await getClientes()
          setClientes(clientesData)

          // Buscar livros - você precisará criar esta API
          const livrosResponse = await getLivros()
          if (livrosResponse) {
            const livrosData = await livrosResponse.json()
            setLivros(livrosData)
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "cliente_id") {
      const cliente = clientes.find(c => c.id.toString() === value)
      setClienteSelecionado(cliente || null)
      if (cliente && cliente.endereco) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          endereco_entrega: cliente.endereco 
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else if (name === "livro_id") {
      const livro = livros.find(l => l.id.toString() === value)
      setLivroSelecionado(livro || null)
      if (livro) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          preco: maskCurrency(livro.preco.toString())
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else if (name === "preco") {
      const valorFormatado = maskCurrency(value)
      setFormData(prev => ({ ...prev, [name]: valorFormatado }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const pedidoData = {
        ...formData,
        preco: Number.parseFloat(formData.preco.replace(/\./g, "").replace(/,/g, ".")),
        quantidade: Number.parseInt(formData.quantidade),
        cliente_id: Number.parseInt(formData.cliente_id),
        livro_id: Number.parseInt(formData.livro_id)
      }

      const novoPedido = await createPedido(pedidoData)
      onAdd(novoPedido)
      
      // Reset form
      setFormData({
        cliente_id: "",
        livro_id: "",
        quantidade: "1",
        preco: "",
        endereco_entrega: "",
        observacoes: "",
      })
      setClienteSelecionado(null)
      setLivroSelecionado(null)
      
      onClose()
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      alert("Erro ao criar pedido")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-2xl font-bold text-white">Criar Novo Pedido</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informações do Cliente</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cliente *
                </label>
                <select
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>

              {clienteSelecionado && (
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Informações do Cliente Selecionado:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Telefone:</span>
                      <p className="text-white">{clienteSelecionado.telefone}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Cidade/Estado:</span>
                      <p className="text-white">{clienteSelecionado.cidade} - {clienteSelecionado.estado}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informações do Livro</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Livro *</label>
                <select
                  name="livro_id"
                  value={formData.livro_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                >
                  <option value="">Selecione um livro</option>
                  {livros.map((livro) => (
                    <option key={livro.id} value={livro.id}>
                      {livro.titulo} - R$ {livro.preco.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade *</label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  min="1"
                  required
                  disabled={loading}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preço Unitário *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                  placeholder="0,00"
                />
              </div>
            </div>

            {livroSelecionado && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Informações do Livro Selecionado:</h4>
                <div className="text-sm">
                  <span className="text-slate-400">Estoque disponível: </span>
                  <span className={`font-semibold ${livroSelecionado.estoque < 10 ? "text-red-400" : "text-green-400"}`}>
                    {livroSelecionado.estoque} unidades
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Endereço de Entrega *</label>
            <textarea
              name="endereco_entrega"
              value={formData.endereco_entrega}
              onChange={handleChange}
              rows={3}
              required
              disabled={loading}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
              placeholder="Digite o endereço completo para entrega..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={2}
              disabled={loading}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
              placeholder="Adicione observações sobre o pedido..."
            />
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-slate-700">
            <Button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
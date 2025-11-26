"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Trash2 } from "lucide-react"
import { maskCurrency } from "@/lib/input-masks"
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

interface ItemPedido {
  livro_id: string
  quantidade: string
  preco_unitario: string
}

export function OrderFormModal({ isOpen, onClose, onAdd }: OrderFormModalProps) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    itens: [{ livro_id: "", quantidade: "1", preco_unitario: "" }] as ItemPedido[],
    endereco_entrega: "",
    observacoes: "",
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [livros, setLivros] = useState<Livro[]>([])
  const [loading, setLoading] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const clientesData = await getClientes()
          setClientes(clientesData)

          const livrosResponse = await getLivros()
          setLivros(livrosResponse)
        } catch (error) {
          console.error("Erro ao carregar dados:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [isOpen])

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    const cliente = clientes.find(c => c.id.toString() === value)
    setClienteSelecionado(cliente || null)
    
    setFormData(prev => ({ 
      ...prev, 
      cliente_id: value,
      endereco_entrega: cliente?.endereco || "" 
    }))
  }

  const handleItemChange = (index: number, field: keyof ItemPedido, value: string) => {
    setFormData(prev => {
      const newItens = [...prev.itens]
      
      if (field === "livro_id") {
        const livro = livros.find(l => l.id.toString() === value)
        if (livro) {
          newItens[index] = {
            ...newItens[index],
            [field]: value,
            preco_unitario: maskCurrency(livro.preco.toFixed(2).replace(".", ","))
          }
        } else {
          newItens[index] = {
            ...newItens[index],
            [field]: value,
            preco_unitario: ""
          }
        }
      } else if (field === "preco_unitario") {
        const valorFormatado = maskCurrency(value)
        newItens[index] = {
          ...newItens[index],
          [field]: valorFormatado
        }
      } else {
        newItens[index] = {
          ...newItens[index],
          [field]: value
        }
      }

      return { ...prev, itens: newItens }
    })
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { livro_id: "", quantidade: "1", preco_unitario: "" }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.itens.length > 1) {
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.filter((_, i) => i !== index)
      }))
    }
  }

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, endereco_entrega: e.target.value }))
  }

  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, observacoes: e.target.value }))
  }

  const calcularTotal = () => {
    return formData.itens.reduce((total, item) => {
      if (item.preco_unitario && item.quantidade) {
        const preco = Number.parseFloat(item.preco_unitario.replace(/\./g, ",").replace(/,/g, "."))
        const quantidade = Number.parseInt(item.quantidade)
        return total + (preco * quantidade)
      }
      return total
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const pedidoData = {
        cliente_id: Number.parseInt(formData.cliente_id),
        itens: formData.itens.map(item => ({
          livro_id: Number.parseInt(item.livro_id),
          quantidade: Number.parseInt(item.quantidade),
          preco_unitario: Number.parseFloat(item.preco_unitario.replace(/\./g, "").replace(/,/g, "."))
        }))
      }

      console.log("Enviando pedido:", pedidoData)
      const novoPedido = await createPedido(pedidoData)
      onAdd(novoPedido)
      
      setFormData({
        cliente_id: "",
        itens: [{ livro_id: "", quantidade: "1", preco_unitario: "" }],
        endereco_entrega: "",
        observacoes: "",
      })
      setClienteSelecionado(null)
      
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
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  value={formData.cliente_id}
                  onChange={handleClienteChange}
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Itens do Pedido</h3>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            {formData.itens.map((item, index) => {
              const livroSelecionado = livros.find(l => l.id.toString() === item.livro_id)
              
              return (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-white">Item {index + 1}</h4>
                    {formData.itens.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Livro *</label>
                      <select
                        value={item.livro_id}
                        onChange={(e) => handleItemChange(index, "livro_id", e.target.value)}
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
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
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
                        value={item.preco_unitario}
                        onChange={(e) => handleItemChange(index, "preco_unitario", e.target.value)}
                        required
                        disabled={loading}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {livroSelecionado && (
                    <div className="mt-3 bg-slate-600/50 rounded p-3">
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Informações do Livro Selecionado:</h4>
                      <div className="text-sm">
                        <span className="text-slate-400">Estoque disponível: </span>
                        <span className={`font-semibold ${livroSelecionado.estoque < 10 ? "text-red-400" : "text-green-400"}`}>
                          {livroSelecionado.estoque} unidades
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total do Pedido:</span>
                <span className="text-2xl font-bold text-green-400">
                  R$ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>
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
              disabled={loading || !formData.cliente_id || formData.itens.some(item => !item.livro_id)}
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
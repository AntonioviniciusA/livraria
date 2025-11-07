"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { maskCurrency } from "@/lib/input-masks"

interface PurchaseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPurchase: (purchase: any) => void
}

export function PurchaseFormModal({ isOpen, onClose, onAddPurchase }: PurchaseFormModalProps) {
  const [formData, setFormData] = useState({
    bookTitle: "",
    supplier: "",
    quantity: "",
    unitPrice: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target

    if (name === "unitPrice") {
      value = maskCurrency(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    if (!formData.bookTitle || !formData.supplier || !formData.quantity || !formData.unitPrice) {
      alert("Por favor, preencha todos os campos")
      return
    }

    onAddPurchase({
      bookTitle: formData.bookTitle,
      supplier: formData.supplier,
      quantity: Number.parseInt(formData.quantity),
      unitPrice: Number.parseFloat(formData.unitPrice.replace(/\./g, "").replace(/,/g, ".")),
      date: formData.date,
    })

    setFormData({
      bookTitle: "",
      supplier: "",
      quantity: "",
      unitPrice: "",
      date: new Date().toISOString().split("T")[0],
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Nova Compra de Livro</CardTitle>
            <CardDescription className="text-slate-400">Registre uma nova compra de livros no estoque</CardDescription>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-white">Título do Livro</label>
              <Input
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleInputChange}
                placeholder="Ex: Clean Code"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white">Fornecedor</label>
              <Input
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Ex: Fornecedor A"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white">Quantidade</label>
                <Input
                  name="quantity"
                  type="text"
                  inputMode="numeric"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">Preço Unitário (R$)</label>
                <Input
                  name="unitPrice"
                  type="text"
                  inputMode="decimal"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white">Data da Compra</label>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-2 bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Registrar Compra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

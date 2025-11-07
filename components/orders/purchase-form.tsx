"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PurchaseForm() {
  const [purchases, setPurchases] = useState([
    {
      id: 1,
      bookTitle: "Clean Code",
      supplier: "Fornecedor A",
      quantity: 10,
      unitPrice: 85.0,
      totalPrice: 850.0,
      date: "2025-01-15",
      status: "Entregue",
    },
    {
      id: 2,
      bookTitle: "Design Patterns",
      supplier: "Fornecedor B",
      quantity: 5,
      unitPrice: 120.0,
      totalPrice: 600.0,
      date: "2025-01-20",
      status: "Processando",
    },
  ])

  const [formData, setFormData] = useState({
    bookTitle: "",
    supplier: "",
    quantity: "",
    unitPrice: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddPurchase = () => {
    if (!formData.bookTitle || !formData.supplier || !formData.quantity || !formData.unitPrice) {
      alert("Por favor, preencha todos os campos")
      return
    }

    const newPurchase = {
      id: purchases.length + 1,
      bookTitle: formData.bookTitle,
      supplier: formData.supplier,
      quantity: Number.parseInt(formData.quantity),
      unitPrice: Number.parseFloat(formData.unitPrice),
      totalPrice: Number.parseInt(formData.quantity) * Number.parseFloat(formData.unitPrice),
      date: formData.date,
      status: "Processando",
    }

    setPurchases([...purchases, newPurchase])
    setFormData({
      bookTitle: "",
      supplier: "",
      quantity: "",
      unitPrice: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalPrice, 0)

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">{purchases.length} compras registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Livros Comprados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{purchases.reduce((sum, p) => sum + p.quantity, 0)}</p>
            <p className="text-xs text-slate-500 mt-1">unidades no total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{new Set(purchases.map((p) => p.supplier)).size}</p>
            <p className="text-xs text-slate-500 mt-1">fornecedores diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Purchase Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Registrar Nova Compra</CardTitle>
          <CardDescription className="text-slate-400">Adicione um novo registro de compra de livros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="text-sm font-medium text-white">Quantidade</label>
              <Input
                name="quantity"
                type="number"
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
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
              />
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
          </div>

          <Button onClick={handleAddPurchase} className="mt-6 bg-blue-600 hover:bg-blue-700">
            Adicionar Compra
          </Button>
        </CardContent>
      </Card>

      {/* Purchases List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Compras Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Livro</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Fornecedor</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Qtd</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Preço Unit.</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white font-medium">{purchase.bookTitle}</td>
                    <td className="py-3 px-4 text-slate-300">{purchase.supplier}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{purchase.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-300">R$ {purchase.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-white font-medium">R$ {purchase.totalPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300">{purchase.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          purchase.status === "Entregue"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

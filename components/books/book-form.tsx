"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { maskISBN, maskCurrency } from "@/lib/input-masks"

interface BookFormProps {
  onClose: () => void
  onAdd: (book: any) => void
}

export function BookForm({ onClose, onAdd }: BookFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    price: "",
    quantity: "",
    category: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target

    if (name === "isbn") {
      value = maskISBN(value)
    } else if (name === "price") {
      value = maskCurrency(value)
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      id: Date.now(),
      ...formData,
      price: Number.parseFloat(formData.price.replace(/\./g, "").replace(/,/g, ".")),
      quantity: Number.parseInt(formData.quantity),
    })
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Adicionar Novo Livro</h2>
        <Button size="icon" variant="ghost" onClick={onClose} className="text-slate-400">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Título"
          value={formData.title}
          onChange={handleChange}
          name="title"
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
        <Input
          placeholder="Autor"
          value={formData.author}
          onChange={handleChange}
          name="author"
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
        <Input
          placeholder="ISBN (13 dígitos)"
          value={formData.isbn}
          onChange={handleChange}
          name="isbn"
          inputMode="numeric"
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
        <Input
          placeholder="Categoria"
          value={formData.category}
          onChange={handleChange}
          name="category"
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
        <Input
          placeholder="Preço (R$)"
          value={formData.price}
          onChange={handleChange}
          name="price"
          inputMode="decimal"
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Quantidade"
          value={formData.quantity}
          onChange={handleChange}
          name="quantity"
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
            Adicionar Livro
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 bg-transparent"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

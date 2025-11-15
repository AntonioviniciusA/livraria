"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"
import { maskISBN, maskCurrency } from "@/lib/input-masks"
import { createLivro } from "@/api/livros"
import { getEditoras } from "@/api/editoras"
import { createEditora } from "@/api/editoras"
interface BookFormProps {
  onClose: () => void
  onAdd: (book: any) => void
}

interface Editora {
  id: number
  nome: string
}

interface Categoria {
  id: number
  nome: string
}

export function BookForm({ onClose, onAdd }: BookFormProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    isbn: "",
    preco: "",
    publicado_em: "",
    editora_id: "",
    categoria_id: ""
  })

  const [editoras, setEditoras] = useState<Editora[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [showEditoraModal, setShowEditoraModal] = useState(false)
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [novaEditora, setNovaEditora] = useState("")
  const [novaCategoria, setNovaCategoria] = useState("")

  // Carregar editoras e categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [editorasRes, categoriasRes] = await Promise.all([
          await getEditoras(),
          await fetch("/api/categorias")
        ])
        
        if (editorasRes.ok) {
          setEditoras(await editorasRes.json())
        }
        
        if (categoriasRes.ok) {
          setCategorias(await categoriasRes.json())
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target

    if (name === "isbn") {
      value = maskISBN(value)
    } else if (name === "preco") {
      value = maskCurrency(value)
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const livroData = {
        ...formData,
        preco: Number.parseFloat(formData.preco.replace(/\./g, "").replace(/,/g, ".")),
        editora_id: Number.parseInt(formData.editora_id),
        categoria_id: Number.parseInt(formData.categoria_id)
      }

      const novoLivro = await createLivro(livroData)
      onAdd(novoLivro)
      onClose()
    } catch (error) {
      console.error("Erro ao criar livro:", error)
      alert("Erro ao criar livro")
    }
  }

  const criarNovaEditora = async () => {
    if (!novaEditora.trim()) return
const editoraData = { nome: novaEditora }
    try {
      const response = await createEditora(editoraData);
    
      if (response.ok) {
        const editoraCriada = await response.json()
        setEditoras([...editoras, editoraCriada])
        setFormData({ ...formData, editora_id: editoraCriada.id.toString() })
        setNovaEditora("")
        setShowEditoraModal(false)
      }
    } catch (error) {
      console.error("Erro ao criar editora:", error)
    }
  }

  const criarNovaCategoria = async () => {
    if (!novaCategoria.trim()) return

    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: novaCategoria }),
      })

      if (response.ok) {
        const categoriaCriada = await response.json()
        setCategorias([...categorias, categoriaCriada])
        setFormData({ ...formData, categoria_id: categoriaCriada.id.toString() })
        setNovaCategoria("")
        setShowCategoriaModal(false)
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
    }
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Adicionar Novo Livro</h2>
          <Button size="icon" variant="ghost" onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <Input
            placeholder="Título"
            value={formData.titulo}
            onChange={handleChange}
            name="titulo"
            className="bg-slate-700 border-slate-600 text-white"
            required
          />

          <Input
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            name="descricao"
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
            placeholder="Preço (R$)"
            value={formData.preco}
            onChange={handleChange}
            name="preco"
            inputMode="decimal"
            className="bg-slate-700 border-slate-600 text-white"
            required
          />

          <Input
            type="date"
            placeholder="Publicado em"
            value={formData.publicado_em}
            onChange={handleChange}
            name="publicado_em"
            className="bg-slate-700 border-slate-600 text-white"
            required
          />

          <div className="flex gap-2">
            <select
              value={formData.editora_id}
              onChange={handleChange}
              name="editora_id"
              className="flex-1 bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
              required
            >
              <option value="">Selecione uma editora</option>
              {editoras.map((editora) => (
                <option key={editora.id} value={editora.id}>
                  {editora.nome}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={() => setShowEditoraModal(true)}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <select
              value={formData.categoria_id}
              onChange={handleChange}
              name="categoria_id"
              className="flex-1 bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={() => setShowCategoriaModal(true)}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
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

      {/* Modal para Nova Editora */}
      {showEditoraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Nova Editora</h3>
            <Input
              placeholder="Nome da editora"
              value={novaEditora}
              onChange={(e) => setNovaEditora(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={criarNovaEditora} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Criar
              </Button>
              <Button
                onClick={() => setShowEditoraModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Nova Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Nova Categoria</h3>
            <Input
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={criarNovaCategoria} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Criar
              </Button>
              <Button
                onClick={() => setShowCategoriaModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
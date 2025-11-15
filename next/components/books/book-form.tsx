"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus } from "lucide-react"
import { maskISBN, maskCurrency } from "@/lib/input-masks"
import { createLivro } from "@/api/livros"
import {createEditora, getEditoras} from "@/api/editoras"
import {createCategoria, getCategorias} from "@/api/categorias"

interface BookFormProps {
  onClose: () => void
  onAdd: (book: any) => void
}

interface Editora {
  id: number
  nome: string
  pais: string
  contato: string
}

interface Categoria {
  id: number
  nome: string
  descricao: string
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
  const [novaEditora, setNovaEditora] = useState({
    nome: "",
    pais: "",
    contato: ""
  })
  const [novaCategoria, setNovaCategoria] = useState({
    nome: "",
    descricao: ""
  })
  const [loading, setLoading] = useState(false)

  // Carregar editoras e categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [editorasRes, categoriasRes] = await Promise.all([
          getEditoras(),
          getCategorias()
        ])
  
        if (editorasRes) {
          const editorasData = await getEditoras();
          console.log("Editoras data:", editorasData);
          setEditoras(editorasData)
        }
        
        if (categoriasRes) {
          const categoriasData = await categoriasRes.json()
          setCategorias(categoriasData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target

    if (name === "isbn") {
      value = maskISBN(value)
    } else if (name === "preco") {
      value = maskCurrency(value)
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleEditoraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNovaEditora({ ...novaEditora, [name]: value })
  }

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNovaCategoria({ ...novaCategoria, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const criarNovaEditora = async () => {
    if (!novaEditora.nome.trim()) {
      alert("Nome da editora é obrigatório")
      return
    }

    try {
      setLoading(true)
      const response = await createEditora(novaEditora);
     
      if (response) {
        const editoraCriada = await response.json()
        setEditoras([...editoras, editoraCriada])
        setFormData({ ...formData, editora_id: editoraCriada.id.toString() })
        setNovaEditora({ nome: "", pais: "", contato: "" })
        setShowEditoraModal(false)
      } else {
        throw new Error("Erro ao criar editora")
      }
    } catch (error) {
      console.error("Erro ao criar editora:", error)
      alert("Erro ao criar editora")
    } finally {
      setLoading(false)
    }
  }

  const criarNovaCategoria = async () => {
    if (!novaCategoria.nome.trim()) {
      alert("Nome da categoria é obrigatório")
      return
    }

    try {
      setLoading(true)
      const response = await createCategoria(novaCategoria);

      if (response) {
        const categoriaCriada = await response.json()
        setCategorias([...categorias, categoriaCriada])
        setFormData({ ...formData, categoria_id: categoriaCriada.id.toString() })
        setNovaCategoria({ nome: "", descricao: "" })
        setShowCategoriaModal(false)
      } else {
        throw new Error("Erro ao criar categoria")
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      alert("Erro ao criar categoria")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Adicionar Novo Livro</h2>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <Input
            placeholder="Título"
            value={formData.titulo}
            onChange={handleChange}
            name="titulo"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
            disabled={loading}
          />

          <Textarea
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            name="descricao"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
            required
            disabled={loading}
          />

          <Input
            placeholder="ISBN (13 dígitos)"
            value={formData.isbn}
            onChange={handleChange}
            name="isbn"
            inputMode="numeric"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
            disabled={loading}
          />

          <Input
            placeholder="Preço (R$)"
            value={formData.preco}
            onChange={handleChange}
            name="preco"
            inputMode="decimal"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
            disabled={loading}
          />

          <Input
            type="date"
            placeholder="Publicado em"
            value={formData.publicado_em}
            onChange={handleChange}
            name="publicado_em"
            className="bg-slate-700 border-slate-600 text-white"
            required
            disabled={loading}
          />

          <div className="flex gap-2">
            <select
              value={formData.editora_id}
              onChange={handleChange}
              name="editora_id"
              className="flex-1 bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Adicionando..." : "Adicionar Livro"}
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

      {/* Modal para Nova Editora */}
      {showEditoraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Nova Editora</h3>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowEditoraModal(false)}
                className="text-slate-400 hover:text-white"
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Nome da editora *"
                value={novaEditora.nome}
                onChange={handleEditoraChange}
                name="nome"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                disabled={loading}
              />
              <Input
                placeholder="País"
                value={novaEditora.pais}
                onChange={handleEditoraChange}
                name="pais"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                disabled={loading}
              />
              <Input
                placeholder="Contato"
                value={novaEditora.contato}
                onChange={handleEditoraChange}
                name="contato"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={criarNovaEditora} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Criando..." : "Criar Editora"}
              </Button>
              <Button
                onClick={() => setShowEditoraModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Nova Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Nova Categoria</h3>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowCategoriaModal(false)}
                className="text-slate-400 hover:text-white"
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Nome da categoria *"
                value={novaCategoria.nome}
                onChange={handleCategoriaChange}
                name="nome"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                disabled={loading}
              />
              <Textarea
                placeholder="Descrição"
                value={novaCategoria.descricao}
                onChange={handleCategoriaChange}
                name="descricao"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={criarNovaCategoria} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Criando..." : "Criar Categoria"}
              </Button>
              <Button
                onClick={() => setShowCategoriaModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
                disabled={loading}
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
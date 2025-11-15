"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BookList } from "@/components/books/book-list"
import { BookForm } from "@/components/books/book-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getLivros } from "@/api/livros"

export default function LivrosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [books, setBooks] = useState<any[]>([])


   async function fetchBooks() {
      const responseLivros = await getLivros();
      console.log("Livros fetched:", responseLivros);
      setBooks(responseLivros)
    }
 
  useEffect(() => {
    const userData = localStorage.getItem("user")
      setUser(userData);
 
    fetchBooks();
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout currentUser={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Livros</h1>
            <p className="text-slate-400 mt-2">Total de {books.length} livros em estoque</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Novo Livro
          </Button>
        </div>

        {showForm && (
          <BookForm
            onClose={() => setShowForm(false)}
            onAdd={(book) => {
              setBooks([...books, book])
              setShowForm(false)
            }}
          />
        )}

        <BookList
          books={books}
          onUpdate={() => {}}
          onDelete={(id) => {
            setBooks(books.filter((b) => b.id !== id))
          }}
        />
      </div>
    </DashboardLayout>
  )
}

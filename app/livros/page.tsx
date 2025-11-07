"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BookList } from "@/components/books/book-list"
import { BookForm } from "@/components/books/book-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function LivrosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [books, setBooks] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
    } else {
      setUser(JSON.parse(userData))
      // Load mock books data
      setBooks([
        {
          id: 1,
          title: "Clean Code",
          author: "Robert C. Martin",
          isbn: "978-0132350884",
          price: 89.9,
          quantity: 15,
          category: "Programação",
        },
        {
          id: 2,
          title: "Design Patterns",
          author: "Gang of Four",
          isbn: "978-0201633610",
          price: 124.9,
          quantity: 8,
          category: "Programação",
        },
        {
          id: 3,
          title: "The Pragmatic Programmer",
          author: "Hunt & Thomas",
          isbn: "978-1680502090",
          price: 95.5,
          quantity: 12,
          category: "Desenvolvimento",
        },
      ])
    }
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

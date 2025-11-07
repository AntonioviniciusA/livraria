"use client"

import { Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  price: number
  quantity: number
  category: string
}

interface BookListProps {
  books: Book[]
  onUpdate: (book: Book) => void
  onDelete: (id: number) => void
}

export function BookList({ books, onUpdate, onDelete }: BookListProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Título</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Autor</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">ISBN</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Categoria</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Preço</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Quantidade</th>
              <th className="text-left py-4 px-6 text-slate-400 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{book.title}</td>
                <td className="py-4 px-6 text-slate-300">{book.author}</td>
                <td className="py-4 px-6 text-slate-300">{book.isbn}</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300">{book.category}</span>
                </td>
                <td className="py-4 px-6 text-white font-semibold">R$ {book.price.toFixed(2)}</td>
                <td className="py-4 px-6">
                  <span className={`font-semibold ${book.quantity < 5 ? "text-red-400" : "text-green-400"}`}>
                    {book.quantity}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      onClick={() => onUpdate(book)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={() => onDelete(book.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

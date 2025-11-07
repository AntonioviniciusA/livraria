"use client"

export function InventoryReport() {
  const categories = [
    { name: "Programação", books: 245, value: "R$ 18,500" },
    { name: "Ficção", books: 189, value: "R$ 12,300" },
    { name: "Não-ficção", books: 156, value: "R$ 8,900" },
    { name: "Educação", books: 234, value: "R$ 15,600" },
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Estoque por Categoria</h3>
      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex-1">
              <p className="text-white font-medium">{cat.name}</p>
              <p className="text-slate-400 text-sm">{cat.books} livros</p>
            </div>
            <p className="text-green-400 font-semibold">{cat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

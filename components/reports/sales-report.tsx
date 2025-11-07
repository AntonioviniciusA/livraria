"use client"

export function SalesReport() {
  const salesData = [
    { month: "Jan", value: "R$ 8,500" },
    { month: "Fev", value: "R$ 12,300" },
    { month: "Mar", value: "R$ 15,600" },
    { month: "Abr", value: "R$ 18,900" },
    { month: "Mai", value: "R$ 22,100" },
    { month: "Jun", value: "R$ 25,450" },
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Relatório de Vendas</h3>
      <div className="space-y-4">
        {salesData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-slate-300">{item.month}</span>
            <div className="flex-1 mx-4 bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                style={{ width: `${(idx + 1) * 16}%` }}
              />
            </div>
            <span className="text-white font-semibold text-right w-24">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

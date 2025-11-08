"use client"

interface ChartCardProps {
  title: string
}

export function ChartCard({ title }: ChartCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="bg-slate-900 rounded h-64 flex items-center justify-center border border-slate-700">
        <p className="text-slate-500 text-sm">Gráfico será preenchido com dados reais</p>
      </div>
    </div>
  )
}

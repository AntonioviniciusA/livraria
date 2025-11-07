"use client"

export function RecentOrders() {
  const orders = [
    { id: "#001", customer: "João Silva", amount: "R$ 245.90", status: "Entregue" },
    { id: "#002", customer: "Maria Santos", amount: "R$ 189.50", status: "Processando" },
    { id: "#003", customer: "Pedro Costa", amount: "R$ 356.00", status: "Pendente" },
    { id: "#004", customer: "Ana Oliveira", amount: "R$ 412.30", status: "Entregue" },
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Pedidos Recentes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Cliente</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Valor</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="py-3 px-4 text-white font-medium">{order.id}</td>
                <td className="py-3 px-4 text-slate-300">{order.customer}</td>
                <td className="py-3 px-4 text-white">{order.amount}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Entregue"
                        ? "bg-green-900/50 text-green-300"
                        : order.status === "Processando"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-yellow-900/50 text-yellow-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"

import type { LucideIcon } from "lucide-react"
import { ArrowUp, ArrowDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down"
}

export function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={`text-sm font-semibold ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="bg-blue-600 rounded-lg p-3">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

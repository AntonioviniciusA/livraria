"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
}

export function SearchBar({ placeholder = "Buscar...", onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
      <Input
        type="search"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
      />
    </div>
  )
}

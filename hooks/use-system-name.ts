"use client"

import { useEffect, useState } from "react"

export function useSystemName() {
  const [systemName, setSystemName] = useState("FACA Bookstore")

  useEffect(() => {
    const savedName = localStorage.getItem("systemName")
    if (savedName) {
      setSystemName(savedName)
    }
  }, [])

  const updateSystemName = (newName: string) => {
    setSystemName(newName)
    localStorage.setItem("systemName", newName)
  }

  return { systemName, updateSystemName }
}

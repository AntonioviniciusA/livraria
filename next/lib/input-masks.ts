export const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{4})/, "$1-$2")
    .substring(0, 15)
}

export const maskCurrency = (value: string): string => {
  // Remove caracteres não numéricos, exceto vírgula
  let cleanValue = value.replace(/[^\d,]/g, "")
  
  // Garante que há apenas uma vírgula para decimais
  const parts = cleanValue.split(",")
  if (parts.length > 2) {
    cleanValue = parts[0] + "," + parts.slice(1).join("")
  }
  
  // Limita a 2 casas decimais após a vírgula
  if (parts.length === 2) {
    cleanValue = parts[0] + "," + parts[1].slice(0, 2)
  }
  
  return cleanValue
}

export const maskQuantity = (value: string): string => {
  return value.replace(/\D/g, "").substring(0, 6)
}

export const maskISBN = (value: string): string => {
  return value.replace(/\D/g, "").substring(0, 13)
}

export const unmaskCurrency = (value: string): number => {
  return Number.parseFloat(value.replace(/\./g, "").replace(/,/g, "."))
}
export const maskCPF = (value: string): string => {
  value = value.replace(/\D/g, '')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  return value.substring(0, 14)
}
export const maskCEP = (value: string): string => {
  value = value.replace(/\D/g, '')
  value = value.replace(/(\d{5})(\d)/, '$1-$2')
  return value.substring(0, 9)
}
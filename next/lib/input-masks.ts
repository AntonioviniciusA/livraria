export const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{4})/, "$1-$2")
    .substring(0, 15)
}

export const maskCurrency = (value: string): string => {
  const numericValue = value.replace(/\D/g, "")
  const formatted = (Number.parseInt(numericValue, 10) / 100).toFixed(2)
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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
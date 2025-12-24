import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  // Format date manually in Latin script (Bosnian/Serbian)
  const months = [
    'januar', 'februar', 'mart', 'april', 'maj', 'jun',
    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
  ]
  
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${day}. ${month} ${year}.`
}

export function formatPaymentMethod(method: string | null): string {
  if (!method) return '—'
  
  const methodMap: Record<string, string> = {
    transfer: 'Transfer',
    cash: 'Gotovina',
    check: 'Ček',
    other: 'Drugo',
  }
  
  return methodMap[method] || method
}

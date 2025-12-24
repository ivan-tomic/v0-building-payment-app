'use client'

import { useEffect, useState } from 'react'

interface Expense {
  id: number
  title: string
  amount: string
  category: string
  description: string | null
  expenseDate: string
  month: number
  year: number
}

export default function TenantExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`/api/expenses?year=${selectedYear}`)
        const data = await res.json()
        setExpenses(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [selectedYear])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Troškovi zgrade</h1>
        <p className="text-muted-foreground">Pregled troškova održavanja zgrade</p>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i
            return (
              <option key={year} value={year}>
                {year}
              </option>
            )
          })}
        </select>
        
        <div className="ml-auto text-sm text-muted-foreground">
          Ukupno: <span className="font-bold text-foreground">{totalExpenses.toFixed(2)} BAM</span>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Učitavanje...</p>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">Nema evidentiranih troškova za {selectedYear}.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Datum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Naziv</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kategorija</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Iznos</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Opis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">
                    {expense.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {expense.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {parseFloat(expense.amount).toFixed(2)} BAM
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {expense.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

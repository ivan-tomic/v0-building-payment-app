'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatDate } from '@/lib/utils'

interface Expense {
  id: number
  title: string
  amount: number
  category: string
  expense_date: string
  month: number
  year: number
  description: string | null
}

export default function TenantExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false })

        if (error) throw error
        setExpenses(data || [])
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [supabase])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      repair: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      maintenance: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      utilities: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      cleaning: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      other: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
    }
    return colors[category] || colors.other
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Трошкови зграде</h1>
        <p className="text-muted-foreground mt-1">
          Разбијеност трошкова одржавања
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Учитавање...</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Назив
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Категорија
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Износ
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Датум
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Нема трошкова
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {expense.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            expense.category
                          )}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {expense.amount.toFixed(2)} BAM
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {formatDate(expense.expense_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

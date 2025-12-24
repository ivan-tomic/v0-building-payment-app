'use client'

import { useEffect, useState } from 'react'

interface MonthlyStatsProps {
  month: number
  year: number
}

interface Stats {
  totalExpected: number
  totalCollected: number
  totalExpenses: number
  balance: number
  paymentRate: number
}

export default function MonthlyStats({ month, year }: MonthlyStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalExpected: 0,
    totalCollected: 0,
    totalExpenses: 0,
    balance: 0,
    paymentRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [apartmentsRes, paymentsRes, expensesRes] = await Promise.all([
          fetch('/api/apartments'),
          fetch(`/api/payments?month=${month}&year=${year}`),
          fetch(`/api/expenses?month=${month}&year=${year}`),
        ])

        const apartments = await apartmentsRes.json()
        const payments = await paymentsRes.json()
        const expenses = await expensesRes.json()

        const totalExpected = Array.isArray(apartments)
          ? apartments.reduce((sum: number, a: any) => sum + parseFloat(a.monthlyFee || 0), 0)
          : 0

        const totalCollected = Array.isArray(payments)
          ? payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0)
          : 0

        const totalExpenses = Array.isArray(expenses)
          ? expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0)
          : 0

        const paymentRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0

        setStats({
          totalExpected,
          totalCollected,
          totalExpenses,
          balance: totalCollected - totalExpenses,
          paymentRate,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [month, year])

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1).toLocaleString('bs', { month: 'long' })
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Statistika za {getMonthName(month)} {year}
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Očekivano:</span>
          <span className="font-medium">{stats.totalExpected.toFixed(2)} BAM</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Naplaćeno:</span>
          <span className="font-medium text-green-600">{stats.totalCollected.toFixed(2)} BAM</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Troškovi:</span>
          <span className="font-medium text-red-600">{stats.totalExpenses.toFixed(2)} BAM</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Bilans:</span>
          <span className={`font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.balance.toFixed(2)} BAM
          </span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Stopa naplate:</span>
            <span className="text-sm font-medium">{stats.paymentRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(stats.paymentRate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

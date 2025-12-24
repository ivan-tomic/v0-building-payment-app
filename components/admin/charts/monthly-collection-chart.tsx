'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MonthlyData {
  month: string
  amount: number
}

export default function MonthlyCollectionChart() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const res = await fetch(`/api/payments?year=${currentYear}`)
        const payments = await res.json()

        // Group payments by month
        const monthlyTotals: Record<number, number> = {}
        
        if (Array.isArray(payments)) {
          payments.forEach((payment: any) => {
            const month = payment.month
            if (!monthlyTotals[month]) {
              monthlyTotals[month] = 0
            }
            monthlyTotals[month] += parseFloat(payment.amount) || 0
          })
        }

        // Create data for all 12 months
        const chartData = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2000, i).toLocaleString('bs', { month: 'short' }),
          amount: monthlyTotals[i + 1] || 0,
        }))

        setData(chartData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground">Učitavanje grafikona...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Mjesečna naplata ({new Date().getFullYear()})
      </h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)} BAM`, 'Naplaćeno']}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

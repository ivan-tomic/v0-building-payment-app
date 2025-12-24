'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface FloorData {
  floor: string
  paid: number
  unpaid: number
}

interface FloorCollectionChartProps {
  month: number
  year: number
}

export default function FloorCollectionChart({ month, year }: FloorCollectionChartProps) {
  const [data, setData] = useState<FloorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [apartmentsRes, paymentsRes] = await Promise.all([
          fetch('/api/apartments'),
          fetch(`/api/payments?month=${month}&year=${year}`),
        ])

        const apartments = await apartmentsRes.json()
        const payments = await paymentsRes.json()

        const paidApartmentIds = new Set(
          Array.isArray(payments) ? payments.map((p: any) => p.apartmentId) : []
        )

        // Group by floor
        const floorStats: Record<number, { paid: number; unpaid: number }> = {}

        if (Array.isArray(apartments)) {
          apartments.forEach((apt: any) => {
            if (!floorStats[apt.floor]) {
              floorStats[apt.floor] = { paid: 0, unpaid: 0 }
            }
            if (paidApartmentIds.has(apt.id)) {
              floorStats[apt.floor].paid++
            } else {
              floorStats[apt.floor].unpaid++
            }
          })
        }

        // Convert to chart data
        const chartData = Object.entries(floorStats)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([floor, stats]) => ({
            floor: `Sprat ${floor}`,
            paid: stats.paid,
            unpaid: stats.unpaid,
          }))

        setData(chartData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month, year])

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
        Naplata po spratovima
      </h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="floor" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="paid" name="Plaćeno" fill="#22c55e" stackId="a" />
            <Bar dataKey="unpaid" name="Neplaćeno" fill="#ef4444" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

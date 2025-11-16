'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface CollectionData {
  name: string
  value: number
}

interface MonthlyCollectionChartProps {
  month: number
  year: number
}

export default function MonthlyCollectionChart({
  month,
  year,
}: MonthlyCollectionChartProps) {
  const [data, setData] = useState<CollectionData[]>([
    { name: 'Наплаћено', value: 0 },
    { name: 'Дугови', value: 0 },
  ])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: apartments } = await supabase
          .from('apartments')
          .select('id, monthly_fee')

        const { data: payments } = await supabase
          .from('payments')
          .select('apartment_id')
          .eq('month', month)
          .eq('year', year)

        const paidIds = new Set(payments?.map((p) => p.apartment_id) || [])
        const totalExpected = apartments?.reduce(
          (sum, apt) => sum + (apt.monthly_fee || 0),
          0
        ) || 0

        const paidAmount = apartments
          ?.filter((apt) => paidIds.has(apt.id))
          .reduce((sum, apt) => sum + (apt.monthly_fee || 0), 0) || 0

        const duedAmount = totalExpected - paidAmount

        setData([
          { name: 'Наплаћено', value: paidAmount },
          { name: 'Дугови', value: duedAmount },
        ])
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    fetchData()
  }, [month, year, supabase])

  const total = data[0].value + data[1].value
  const paidPercent = total > 0 ? (data[0].value / total) * 100 : 0
  const duedPercent = total > 0 ? (data[1].value / total) * 100 : 0

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-6">
        Месечна наплата
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Наплаћено</span>
            <span className="text-sm font-semibold text-foreground">
              {paidPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data[0].value.toFixed(2)} BAM
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Дугови</span>
            <span className="text-sm font-semibold text-foreground">
              {duedPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${duedPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data[1].value.toFixed(2)} BAM
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Укупно</span>
          <span className="text-lg font-bold text-foreground">
            {total.toFixed(2)} BAM
          </span>
        </div>
      </div>
    </div>
  )
}

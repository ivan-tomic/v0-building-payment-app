'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface FloorData {
  floor: number
  paid: number
  unpaid: number
  percentage: number
}

interface FloorCollectionChartProps {
  month: number
  year: number
}

export default function FloorCollectionChart({
  month,
  year,
}: FloorCollectionChartProps) {
  const [floors, setFloors] = useState<FloorData[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: apartments } = await supabase
          .from('apartments')
          .select('*')
          .order('floor')

        const { data: payments } = await supabase
          .from('payments')
          .select('apartment_id')
          .eq('month', month)
          .eq('year', year)

        const paidIds = new Set(payments?.map((p) => p.apartment_id) || [])

        const floorMap: Record<number, FloorData> = {}

        apartments?.forEach((apt) => {
          if (!floorMap[apt.floor]) {
            floorMap[apt.floor] = { floor: apt.floor, paid: 0, unpaid: 0, percentage: 0 }
          }

          if (paidIds.has(apt.id)) {
            floorMap[apt.floor].paid += 1
          } else {
            floorMap[apt.floor].unpaid += 1
          }
        })

        const floorData = Object.values(floorMap)
          .sort((a, b) => a.floor - b.floor)
          .map((f) => ({
            ...f,
            percentage: f.paid + f.unpaid > 0
              ? Math.round((f.paid / (f.paid + f.unpaid)) * 100)
              : 0,
          }))

        setFloors(floorData)
      } catch (error) {
        console.error('Error fetching floor data:', error)
      }
    }

    fetchData()
  }, [month, year, supabase])

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-6">
        Naplata po spratovima
      </h2>

      <div className="space-y-6">
        {floors.map((floor) => (
          <div key={floor.floor}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Sprat {floor.floor}
              </span>
              <span className="text-sm text-muted-foreground">
                {floor.paid}/{floor.paid + floor.unpaid}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${floor.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {floor.percentage}% plaćeno
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

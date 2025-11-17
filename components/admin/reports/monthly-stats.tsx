'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import StatsCard from '@/components/admin/stats-card'
import { DollarSign, CheckCircle, AlertCircle, Percent } from 'lucide-react'

interface MonthlyStatsProps {
  month: number
  year: number
}

export default function MonthlyStats({ month, year }: MonthlyStatsProps) {
  const [stats, setStats] = useState({
    expected: 0,
    collected: 0,
    collectionRate: 0,
    delinquent: 0,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: apartments } = await supabase
          .from('apartments')
          .select('monthly_fee')

        const totalExpected = apartments?.reduce(
          (sum, apt) => sum + (apt.monthly_fee || 0),
          0
        ) || 0

        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('month', month)
          .eq('year', year)

        const totalCollected = payments?.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        ) || 0

        const collectionRate = totalExpected > 0
          ? Math.round((totalCollected / totalExpected) * 100)
          : 0

        setStats({
          expected: totalExpected,
          collected: totalCollected,
          collectionRate,
          delinquent: apartments?.length || 0 - (payments?.length || 0),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [month, year, supabase])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Očekivani prihod"
        value={`${stats.expected.toFixed(2)} BAM`}
        icon={DollarSign}
        color="bg-blue-500"
      />
      <StatsCard
        title="Naplaćeno"
        value={`${stats.collected.toFixed(2)} BAM`}
        icon={CheckCircle}
        color="bg-green-500"
      />
      <StatsCard
        title="Procenat naplate"
        value={`${stats.collectionRate}%`}
        icon={Percent}
        color="bg-purple-500"
      />
      <StatsCard
        title="Dugovi"
        value={stats.delinquent}
        icon={AlertCircle}
        color="bg-red-500"
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/lib/auth-context'
import StatsCard from '@/components/admin/stats-card'
import { DollarSign, Users, AlertCircle, Home } from 'lucide-react'

interface DashboardStats {
  totalApartments: number
  totalTenants: number
  delinquentCount: number
  totalCollected: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalApartments: 0,
    totalTenants: 0,
    delinquentCount: 0,
    totalCollected: 0,
  })
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total apartments
        const { count: apartmentCount } = await supabase
          .from('apartments')
          .select('*', { count: 'exact', head: true })

        // Get total tenants
        const { count: tenantCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'tenant')

        // Get total collected payments for current month
        const currentDate = new Date()
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('month', currentDate.getMonth() + 1)
          .eq('year', currentDate.getFullYear())

        const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        // Get delinquent count (apartments without payment this month)
        const { count: delinquentCount } = await supabase
          .from('apartments')
          .select('id', { count: 'exact', head: true })
          .not(
            'id',
            'in',
            `(${payments?.map(p => p.apartment_id).join(',') || 'null'})`
          )

        setStats({
          totalApartments: apartmentCount || 0,
          totalTenants: tenantCount || 0,
          delinquentCount: delinquentCount || 0,
          totalCollected: totalCollected,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Dobrodošli nazad, {profile?.full_name}!
        </h1>
        <p className="text-muted-foreground">
          Pregled stanova i finansijskog stanja
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ukupno stanova"
            value={stats.totalApartments}
            icon={Home}
            color="bg-blue-500"
          />
          <StatsCard
            title="Aktivni stanari"
            value={stats.totalTenants}
            icon={Users}
            color="bg-green-500"
          />
          <StatsCard
            title="Dugovi"
            value={stats.delinquentCount}
            icon={AlertCircle}
            color="bg-red-500"
          />
          <StatsCard
            title="Naplaćeno ovaj mjesec"
            value={`${stats.totalCollected.toFixed(2)} BAM`}
            icon={DollarSign}
            color="bg-purple-500"
          />
        </div>
      )}
    </div>
  )
}

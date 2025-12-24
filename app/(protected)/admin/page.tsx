'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch apartments
        const apartmentsRes = await fetch('/api/apartments')
        const apartments = await apartmentsRes.json()

        // Fetch tenants
        const usersRes = await fetch('/api/users?role=tenant')
        const tenants = await usersRes.json()

        // Fetch payments for current month
        const currentDate = new Date()
        const paymentsRes = await fetch(
          `/api/payments?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
        )
        const payments = await paymentsRes.json()

        const totalCollected = Array.isArray(payments)
          ? payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0)
          : 0

        // Calculate delinquent (apartments without payment this month)
        const paidApartmentIds = Array.isArray(payments)
          ? payments.map((p: any) => p.apartmentId)
          : []
        const delinquentCount = Array.isArray(apartments)
          ? apartments.filter((a: any) => !paidApartmentIds.includes(a.id)).length
          : 0

        setStats({
          totalApartments: Array.isArray(apartments) ? apartments.length : 0,
          totalTenants: Array.isArray(tenants) ? tenants.length : 0,
          delinquentCount,
          totalCollected,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Dobrodošli nazad, {profile?.name}!
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
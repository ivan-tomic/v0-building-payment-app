'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/lib/auth-context'
import TenantInfoCard from '@/components/tenant/tenant-info-card'
import CurrentBalance from '@/components/tenant/current-balance'

interface ApartmentInfo {
  apartment_number: number
  floor: number
  size_sqm: number
  monthly_fee: number
}

export default function TenantDashboard() {
  const { profile } = useAuth()
  const [apartment, setApartment] = useState<ApartmentInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchApartmentInfo = async () => {
      if (!profile?.apartment_id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('apartments')
          .select('*')
          .eq('id', profile.apartment_id)
          .single()

        if (error) throw error
        setApartment(data)
      } catch (error) {
        console.error('Error fetching apartment:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApartmentInfo()
  }, [profile?.apartment_id, supabase])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Учитавање...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Добредошли, {profile?.full_name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Преглед вашег стана и финансијског стања
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apartment && (
          <>
            <TenantInfoCard apartment={apartment} />
            <CurrentBalance
              apartmentId={profile?.apartment_id || 0}
              monthlyFee={apartment.monthly_fee}
            />
          </>
        )}
      </div>
    </div>
  )
}

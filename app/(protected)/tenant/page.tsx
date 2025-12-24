'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import TenantInfoCard from '@/components/tenant/tenant-info-card'
import CurrentBalance from '@/components/tenant/current-balance'

interface Apartment {
  id: number
  buildingNumber: number
  apartmentNumber: number
  floor: number
  monthlyFee: string
}

export default function TenantDashboard() {
  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const res = await fetch('/api/apartments')
        const data = await res.json()
        
        if (Array.isArray(data) && data.length > 0) {
          setApartment(data[0])
        }
      } catch (error) {
        console.error('Error fetching apartment:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApartment()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dobrodošli, {profile?.name}!
        </h1>
        <p className="text-muted-foreground">
          Pregled vašeg stana i finansijskog stanja
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TenantInfoCard apartment={apartment} profile={profile} />
        <CurrentBalance apartmentId={apartment?.id} />
      </div>
    </div>
  )
}

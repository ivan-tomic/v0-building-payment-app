'use client'

import { useEffect, useState } from 'react'
import TenantsList from '@/components/admin/tenants-list'
import InvitationGenerator from '@/components/admin/invitation-generator'


interface Apartment {
  id: number
  buildingNumber: number
  apartmentNumber: number
  floor: number
  sizeSqm?: number
}

interface TenantData {
  apartment: {
    id: number
    apartment_number: number
    floor: number
    size_sqm: number
  }
  user: {
    id: string
    full_name: string
    email: string
  } | null
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantData[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [apartmentsWithTenantsRes, apartmentsRes] = await Promise.all([
        fetch('/api/apartments?withTenants=true'),
        fetch('/api/apartments')
      ])
      
      const apartmentsWithTenants: any[] = await apartmentsWithTenantsRes.json()
      const apartmentsData: Apartment[] = await apartmentsRes.json()
      
      setApartments(Array.isArray(apartmentsData) ? apartmentsData : [])

      // Transform data to match TenantsList component structure
      // Group by apartment (one apartment can have multiple rows if multiple tenants, but we only want one)
      const apartmentMap = new Map<number, TenantData>()
      
      if (Array.isArray(apartmentsWithTenants)) {
        apartmentsWithTenants.forEach((item: any) => {
          if (!apartmentMap.has(item.id)) {
            apartmentMap.set(item.id, {
              apartment: {
                id: item.id,
                apartment_number: item.apartmentNumber,
                floor: item.floor,
                size_sqm: item.sizeSqm ? Number(item.sizeSqm) : 0
              },
              user: item.tenantId ? {
                id: String(item.tenantId),
                full_name: item.tenantName || '',
                email: item.tenantEmail || ''
              } : null
            })
          }
        })
      }

      // Also include apartments without tenants
      if (Array.isArray(apartmentsData)) {
        apartmentsData.forEach((apt) => {
          if (!apartmentMap.has(apt.id)) {
            apartmentMap.set(apt.id, {
              apartment: {
                id: apt.id,
                apartment_number: apt.apartmentNumber,
                floor: apt.floor,
                size_sqm: apt.sizeSqm ? Number(apt.sizeSqm) : 0
              },
              user: null
            })
          }
        })
      }

      const transformedTenants = Array.from(apartmentMap.values())
      // Sort by apartment number
      transformedTenants.sort((a, b) => a.apartment.apartment_number - b.apartment.apartment_number)
      
      setTenants(transformedTenants)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Stanari</h1>
        <p className="text-muted-foreground">Upravljanje stanarima i pozivnicama</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-muted-foreground">Učitavanje...</p>
          ) : (
            <TenantsList tenants={tenants} />
          )}
        </div>

        <div>
          <InvitationGenerator apartments={apartments} />
        </div>
      </div>
    </div>
  )
}

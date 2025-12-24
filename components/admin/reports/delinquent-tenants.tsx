'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface DelinquentTenantsProps {
  month: number
  year: number
}

interface DelinquentApartment {
  id: number
  apartmentNumber: number
  floor: number
  tenantName: string | null
}

export default function DelinquentTenants({ month, year }: DelinquentTenantsProps) {
  const [delinquents, setDelinquents] = useState<DelinquentApartment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDelinquents = async () => {
      setLoading(true)
      try {
        const [apartmentsRes, paymentsRes] = await Promise.all([
          fetch('/api/apartments?withTenants=true'),
          fetch(`/api/payments?month=${month}&year=${year}`),
        ])

        const apartments = await apartmentsRes.json()
        const payments = await paymentsRes.json()

        const paidApartmentIds = Array.isArray(payments)
          ? payments.map((p: any) => p.apartmentId)
          : []

        const delinquentList = Array.isArray(apartments)
          ? apartments
              .filter((apt: any) => !paidApartmentIds.includes(apt.id))
              .map((apt: any) => ({
                id: apt.id,
                apartmentNumber: apt.apartmentNumber,
                floor: apt.floor,
                tenantName: apt.tenantName || null,
              }))
          : []

        setDelinquents(delinquentList)
      } catch (error) {
        console.error('Error fetching delinquents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDelinquents()
  }, [month, year])

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1).toLocaleString('bs', { month: 'long' })
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">
          Neplaćeno za {getMonthName(month)} {year}
        </h2>
      </div>

      {delinquents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-green-600 font-medium">Svi stanovi su platili!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            {delinquents.length} {delinquents.length === 1 ? 'stan' : 'stanova'} nije platio
          </p>
          
          <div className="divide-y divide-border">
            {delinquents.map((apt) => (
              <div key={apt.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">
                    Stan {apt.apartmentNumber}
                  </p>
                </div>
                <div className="text-right">
                  {apt.tenantName ? (
                    <p className="text-sm text-muted-foreground">{apt.tenantName}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nije registrovan</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

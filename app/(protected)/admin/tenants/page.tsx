'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TenantsList from '@/components/admin/tenants-list'
import InvitationGenerator from '@/components/admin/invitation-generator'

interface Apartment {
  id: number
  apartment_number: number
  floor: number
  size_sqm: number
}

interface User {
  id: string
  full_name: string
  email: string
}

interface TenantData {
  apartment: Apartment
  user: User | null
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantData[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvitation, setShowInvitation] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchTenants = async () => {
    try {
      setLoading(true)
      const { data: apartments, error } = await supabase
        .from('apartments')
        .select('*')
        .order('floor')
        .order('apartment_number')

      if (error) throw error

      // Get users for each apartment
      const tenantsData = await Promise.all(
        apartments.map(async (apt) => {
          const { data: user } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('apartment_id', apt.id)
            .single()

          return { apartment: apt, user }
        })
      )

      setTenants(tenantsData)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [supabase])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stanari</h1>
          <p className="text-muted-foreground mt-1">Upravljanje stanarima i generisanje kodova poziva</p>
        </div>
        <button
          onClick={() => setShowInvitation(!showInvitation)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showInvitation ? 'Zatvori' : 'Generiši kod'}
        </button>
      </div>

      {showInvitation && (
        <InvitationGenerator
          onClose={() => setShowInvitation(false)}
          onGenerated={fetchTenants}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nema stanova u bazi podataka.</p>
          <a
            href="/seed-apartments"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Dodaj stanove
          </a>
        </div>
      ) : (
        <TenantsList tenants={tenants} />
      )}
    </div>
  )
}

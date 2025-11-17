'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AlertTriangle } from 'lucide-react'

interface DelinquentData {
  apartment_number: number
  floor: number
  tenant_name: string | null
  tenant_email: string | null
}

interface DelinquentTenantsProps {
  month: number
  year: number
}

export default function DelinquentTenants({
  month,
  year,
}: DelinquentTenantsProps) {
  const [delinquents, setDelinquents] = useState<DelinquentData[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: apartments } = await supabase
          .from('apartments')
          .select('id, apartment_number, floor')

        const { data: payments } = await supabase
          .from('payments')
          .select('apartment_id')
          .eq('month', month)
          .eq('year', year)

        const paidIds = new Set(payments?.map((p) => p.apartment_id) || [])
        const unpaidApts = apartments?.filter((apt) => !paidIds.has(apt.id)) || []

        const delinquentData = await Promise.all(
          unpaidApts.map(async (apt) => {
            const { data: user } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('apartment_id', apt.id)
              .single()

            return {
              apartment_number: apt.apartment_number,
              floor: apt.floor,
              tenant_name: user?.full_name || 'Није активирано',
              tenant_email: user?.email || '—',
            }
          })
        )

        setDelinquents(delinquentData)
      } catch (error) {
        console.error('Error fetching delinquent data:', error)
      }
    }

    fetchData()
  }, [month, year, supabase])

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-foreground">Dugovi</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {delinquents.length} stanara
        </span>
      </div>

      {delinquents.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          Svi stanari su platili!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Stan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Sprat
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Stanar
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {delinquents.map((d, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {d.apartment_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {d.floor}.
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {d.tenant_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {d.tenant_email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

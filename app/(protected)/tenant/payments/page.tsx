'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/lib/auth-context'
import { formatDate } from '@/lib/utils'

interface Payment {
  id: number
  amount: number
  payment_date: string
  month: number
  year: number
  payment_method: string | null
  notes: string | null
}

export default function TenantPaymentsPage() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchPayments = async () => {
      if (!profile?.apartment_id) return

      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('apartment_id', profile.apartment_id)
          .order('year', { ascending: false })
          .order('month', { ascending: false })

        if (error) throw error
        setPayments(data || [])
      } catch (error) {
        console.error('Error fetching payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [profile?.apartment_id, supabase])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Плаћања</h1>
        <p className="text-muted-foreground mt-1">
          Историја вашег плаћања
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Учитавање...</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Месец/Година
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Износ
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Датум плаћања
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Метод
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Нема плаћања
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {payment.month}/{payment.year}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {payment.amount.toFixed(2)} BAM
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {payment.payment_method || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Payment {
  id: number
  apartmentId: number
  amount: string
  paymentDate: string
  month: number
  year: number
  paymentMethod: string | null
  notes: string | null
}

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/payments')
        const data = await res.json()
        setPayments(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('bs', { month: 'long' })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Moje uplate</h1>
        <p className="text-muted-foreground">Pregled svih vaših uplata</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Učitavanje...</p>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">Nema evidentiranih uplata</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Datum uplate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Iznos</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Način</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Napomena</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {getMonthName(payment.month)} {payment.year}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">
                    {parseFloat(payment.amount).toFixed(2)} BAM
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {payment.paymentMethod || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {payment.notes || '-'}
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

'use client'

import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

interface CurrentBalanceProps {
  apartmentId: number | undefined
}

export default function CurrentBalance({ apartmentId }: CurrentBalanceProps) {
  const [currentMonthPaid, setCurrentMonthPaid] = useState(false)
  const [lastPayment, setLastPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!apartmentId) {
        setLoading(false)
        return
      }

      try {
        const currentDate = new Date()
        const res = await fetch(
          `/api/payments?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
        )
        const payments = await res.json()

        if (Array.isArray(payments) && payments.length > 0) {
          setCurrentMonthPaid(true)
          setLastPayment(payments[0])
        } else {
          setCurrentMonthPaid(false)
        }
      } catch (error) {
        console.error('Error fetching payment status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStatus()
  }, [apartmentId])

  const currentMonth = new Date().toLocaleString('bs', { month: 'long' })
  const currentYear = new Date().getFullYear()

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
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Status uplate
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b">
          <span className="text-muted-foreground">Period:</span>
          <span className="font-medium capitalize">{currentMonth} {currentYear}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-muted-foreground">Status:</span>
          {currentMonthPaid ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Plaćeno</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Nije plaćeno</span>
            </div>
          )}
        </div>

        {lastPayment && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Posljednja uplata:</p>
            <div className="flex justify-between items-center">
              <span className="text-sm">
                {new Date(lastPayment.paymentDate).toLocaleDateString('bs')}
              </span>
              <span className="font-medium">
                {parseFloat(lastPayment.amount).toFixed(2)} BAM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

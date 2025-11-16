'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface CurrentBalanceProps {
  apartmentId: number
  monthlyFee: number
}

export default function CurrentBalance({
  apartmentId,
  monthlyFee,
}: CurrentBalanceProps) {
  const [balance, setBalance] = useState(0)
  const [paidThisMonth, setPaidThisMonth] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const currentDate = new Date()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()

        // Check if paid this month
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('apartment_id', apartmentId)
          .eq('month', month)
          .eq('year', year)
          .single()

        if (paymentData) {
          setPaidThisMonth(true)
          setBalance(0)
        } else {
          // Calculate how many months are unpaid
          const { data: allPayments } = await supabase
            .from('payments')
            .select('month, year')
            .eq('apartment_id', apartmentId)
            .order('year')
            .order('month')

          // Simple calculation: assume current month is unpaid
          setBalance(monthlyFee)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [apartmentId, monthlyFee, supabase])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground">Учитавање...</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Текуће стање
      </h2>

      <div className="space-y-6">
        {paidThisMonth ? (
          <div className="flex items-center gap-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                Плаћено овај месец
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                Ваша обавеза је извршена
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Стање: {balance.toFixed(2)} BAM
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Молимо благајте плаћање
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">
            За детаље о плаћањима, погледајте картицу "Плаћања"
          </p>
        </div>
      </div>
    </div>
  )
}

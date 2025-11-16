'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import PaymentsTable from '@/components/admin/payments-table'
import AddPaymentForm from '@/components/admin/add-payment-form'
import { Plus } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: apartmentsData, error: apartmentsError } = await supabase
          .from('apartments')
          .select('id, apartment_number, floor')
          .order('floor')
          .order('apartment_number')

        if (apartmentsError) throw apartmentsError
        setApartments(apartmentsData || [])

        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            *,
            apartments (apartment_number, floor)
          `)
          .order('created_at', { ascending: false })

        if (paymentsError) throw paymentsError
        setPayments(paymentsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleAddPayment = async (data: any) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to add payment')

      setShowForm(false)
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          *,
          apartments (apartment_number, floor)
        `)
        .order('created_at', { ascending: false })

      setPayments(paymentsData || [])
    } catch (error) {
      console.error('Error adding payment:', error)
      throw error
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Плаћања</h1>
          <p className="text-muted-foreground mt-1">
            Историја плаћања станара
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Додај плаћање
        </button>
      </div>

      {showForm && (
        <AddPaymentForm
          apartments={apartments}
          onClose={() => setShowForm(false)}
          onSubmit={handleAddPayment}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Учитавање...</p>
        </div>
      ) : (
        <PaymentsTable payments={payments} />
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import PaymentsTable from '@/components/admin/payments-table'
import AddPaymentForm from '@/components/admin/add-payment-form'
import { Plus } from 'lucide-react'

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

interface Apartment {
  id: number
  buildingNumber: number
  apartmentNumber: number
  floor: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { profile } = useAuth()

  const fetchData = async () => {
    try {
      const [paymentsRes, apartmentsRes] = await Promise.all([
        fetch(`/api/payments?month=${selectedMonth}&year=${selectedYear}`),
        fetch('/api/apartments')
      ])

      const paymentsData = await paymentsRes.json()
      const apartmentsData = await apartmentsRes.json()

      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setApartments(Array.isArray(apartmentsData) ? apartmentsData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Uplate</h1>
          <p className="text-muted-foreground">Pregled i upravljanje uplatama stanara</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Dodaj plaćanje
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString('bs', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i
            return (
              <option key={year} value={year}>
                {year}
              </option>
            )
          })}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Učitavanje...</p>
      ) : (
        <PaymentsTable payments={payments} />
      )}

      {showAddForm && (
        <AddPaymentForm
          apartments={apartments}
          onClose={() => setShowAddForm(false)}
          onPaymentAdded={fetchData}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
        />
      )}
    </div>
  )
}

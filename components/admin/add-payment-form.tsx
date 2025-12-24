'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Apartment {
  id: number
  apartmentNumber?: number
  apartment_number?: number
  buildingNumber?: number
  building_number?: number
  floor: number
}

interface AddPaymentFormProps {
  apartments: Apartment[]
  onClose: () => void
  onPaymentAdded: () => void
  defaultMonth?: number
  defaultYear?: number
}

export default function AddPaymentForm({
  apartments,
  onClose,
  onPaymentAdded,
  defaultMonth,
  defaultYear,
}: AddPaymentFormProps) {
  const [formData, setFormData] = useState({
    apartment_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    month: defaultMonth || new Date().getMonth() + 1,
    year: defaultYear || new Date().getFullYear(),
    payment_method: 'transfer',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Helper to get apartment number (handles both camelCase and snake_case)
  const getAptNumber = (apt: Apartment) => apt.apartmentNumber ?? apt.apartment_number ?? apt.id

  // Sort apartments by number
  const sortedApartments = [...apartments].sort((a, b) => getAptNumber(a) - getAptNumber(b))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.apartment_id) {
      setError('Molimo odaberite stan')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartment_id: parseInt(formData.apartment_id),
          amount: parseFloat(formData.amount),
          payment_date: formData.payment_date,
          month: formData.month,
          year: formData.year,
          payment_method: formData.payment_method,
          notes: formData.notes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Greška pri čuvanju plaćanja')
      }

      onPaymentAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Greška pri čuvanju plaćanja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Dodaj plaćanje</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Stan
            </label>
            <select
              value={formData.apartment_id}
              onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
            >
              <option value="">Odaberite stan</option>
              {sortedApartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  Stan br. {getAptNumber(apt)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Iznos (BAM)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Datum plaćanja
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Mjesec
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('bs', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Godina
              </label>
              <input
                type="number"
                min="2020"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Metod plaćanja
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
            >
              <option value="transfer">Transfer</option>
              <option value="cash">Gotovina</option>
              <option value="check">Ček</option>
              <option value="other">Drugo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Napomena
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary resize-none"
              placeholder="Opcionalna napomena..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Čuvam...' : 'Sačuvaj plaćanje'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

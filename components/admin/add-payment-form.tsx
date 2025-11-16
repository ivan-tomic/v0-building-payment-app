'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddPaymentFormProps {
  apartments: Array<{ id: number; apartment_number: number; floor: number }>
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
}

export default function AddPaymentForm({
  apartments,
  onClose,
  onSubmit,
}: AddPaymentFormProps) {
  const [formData, setFormData] = useState({
    apartment_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payment_method: 'transfer',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        apartment_id: parseInt(formData.apartment_id),
        amount: parseFloat(formData.amount),
      })
      setFormData({
        apartment_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        payment_method: 'transfer',
        notes: '',
      })
    } catch (err: any) {
      setError(err.message || 'Грешка при сачувавању плаћања')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Додај плаћање</h2>
          <button
            onClick={onClose}
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
              Стан
            </label>
            <select
              value={formData.apartment_id}
              onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
            >
              <option value="">Одаберите стан</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  Стан {apt.apartment_number} (Спрат {apt.floor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Износ (BAM)
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
              Датум плаћања
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
                Месец
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Година
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
              Метод плаћања
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
            >
              <option value="transfer">Трансфер</option>
              <option value="cash">Готовина</option>
              <option value="check">Чек</option>
              <option value="other">Друго</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Напомена
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary resize-none"
              placeholder="Опционална напомена..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Чувам...' : 'Сачувај плаћање'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Отказ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function CleanupButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleCleanup = async () => {
    const confirmed = window.confirm(
      'Ovo će obrisati sve korisnike i podatke iz baze. Jeste li sigurni?'
    )
    if (!confirmed) return

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Greška pri čišćenju baze')
      } else {
        setMessage(data.message)
        setTimeout(() => {
          window.location.href = '/setup'
        }, 2000)
      }
    } catch (err) {
      setError('Greška pri komunikaciji sa serverom')
      console.error('[v0] Cleanup request error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
          <p>{message}</p>
        </div>
      )}
      <Button
        onClick={handleCleanup}
        disabled={isLoading}
        variant="destructive"
        className="w-full"
      >
        {isLoading ? 'Čišćenje u tijeku...' : 'Obriši sve podatke i korisnike'}
      </Button>
    </div>
  )
}

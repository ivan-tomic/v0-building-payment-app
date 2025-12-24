'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Apartment {
  id: number
  buildingNumber: number
  apartmentNumber: number
  floor: number
}

interface InvitationGeneratorProps {
  apartments: Apartment[]
}

export default function InvitationGenerator({ apartments }: InvitationGeneratorProps) {
  const [selectedApartment, setSelectedApartment] = useState<number | ''>('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedApartment) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apartmentId: selectedApartment }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Greška pri generisanju koda')
      }

      setGeneratedCode(data.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri generisanju koda')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedCode) return

    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Generiši kod poziva
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Odaberi stan
          </label>
          <select
            value={selectedApartment}
            onChange={(e) => setSelectedApartment(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">-- Odaberi stan --</option>
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                Stan {apt.apartmentNumber}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedApartment || loading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Generisanje...' : 'Generiši kod'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {generatedCode && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Kod poziva:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background rounded border text-lg font-mono">
                {generatedCode}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-accent rounded-md"
                title="Kopiraj"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Kod važi 90 dana i može se iskoristiti samo jednom.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

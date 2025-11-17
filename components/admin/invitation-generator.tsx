'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface InvitationGeneratorProps {
  onClose: () => void
  onGenerated: () => void
}

export default function InvitationGenerator({
  onClose,
  onGenerated,
}: InvitationGeneratorProps) {
  const [apartmentId, setApartmentId] = useState('')
  const [apartments, setApartments] = useState<
    Array<{ id: number; apartment_number: number; floor: number }>
  >([])
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingApartments, setFetchingApartments] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const { data, error } = await supabase
          .from('apartments')
          .select('id, apartment_number, floor')
          .order('floor')
          .order('apartment_number')

        if (error) throw error
        setApartments(data || [])
      } catch (error) {
        console.error('Error fetching apartments:', error)
      } finally {
        setFetchingApartments(false)
      }
    }

    fetchApartments()
  }, [supabase])

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apartmentId) return

    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const code = generateCode()

      const { error } = await supabase.from('invitation_codes').insert([
        {
          code,
          apartment_id: parseInt(apartmentId),
          created_by: user.user.id,
        },
      ])

      if (error) throw error

      setGeneratedCode(code)
      setApartmentId('')
      onGenerated()

      setTimeout(() => {
        setGeneratedCode('')
      }, 5000)
    } catch (error) {
      console.error('Error generating code:', error)
      alert('Greška pri generisanju koda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Generiši kod poziva
      </h2>

      {generatedCode && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Generisan kod:</p>
          <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-300">
            {generatedCode}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Podijelite ovaj kod sa stanarima kako bi se registrovali
          </p>
        </div>
      )}

      <form onSubmit={handleGenerate} className="flex gap-4">
        <select
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
          disabled={loading || fetchingApartments}
          className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="">
            {fetchingApartments ? 'Učitavanje stanova...' : 'Odaberite stan'}
          </option>
          {apartments.map((apt) => (
            <option key={apt.id} value={apt.id}>
              Stan {apt.apartment_number} (Sprat {apt.floor})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!apartmentId || loading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generiše...' : 'Generiši'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          Zatvori
        </button>
      </form>
    </div>
  )
}

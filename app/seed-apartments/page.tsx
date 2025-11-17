'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, CheckCircle, AlertCircle } from 'lucide-react'

export default function SeedApartmentsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apartmentCount, setApartmentCount] = useState<number | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const checkApartments = async () => {
    const { data, count } = await supabase
      .from('apartments')
      .select('*', { count: 'exact', head: true })
    
    setApartmentCount(count || 0)
  }

  const seedApartments = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Delete existing apartments if any
      const { error: deleteError } = await supabase
        .from('apartments')
        .delete()
        .neq('id', 0)

      if (deleteError) throw deleteError

      // Seed all 29 apartments
      const apartments = [
        // Floor 1 (6 apartments)
        { building_number: 1, apartment_number: 1, floor: 1, size_sqm: 81.15, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 2, floor: 1, size_sqm: 53.82, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 3, floor: 1, size_sqm: 31.57, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 4, floor: 1, size_sqm: 155.75, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 5, floor: 1, size_sqm: 40.39, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 6, floor: 1, size_sqm: 39.37, monthly_fee: 0.2 },
        // Floor 2 (6 apartments)
        { building_number: 1, apartment_number: 7, floor: 2, size_sqm: 61.15, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 8, floor: 2, size_sqm: 53.82, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 9, floor: 2, size_sqm: 67.53, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 10, floor: 2, size_sqm: 53.82, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 11, floor: 2, size_sqm: 58.71, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 12, floor: 2, size_sqm: 39.37, monthly_fee: 0.2 },
        // Floor 3 (6 apartments)
        { building_number: 1, apartment_number: 13, floor: 3, size_sqm: 81.71, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 14, floor: 3, size_sqm: 53.82, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 15, floor: 3, size_sqm: 31.57, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 16, floor: 3, size_sqm: 85.88, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 17, floor: 3, size_sqm: 81.95, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 18, floor: 3, size_sqm: 51.56, monthly_fee: 0.2 },
        // Floor 4 (6 apartments)
        { building_number: 1, apartment_number: 19, floor: 4, size_sqm: 81.55, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 20, floor: 4, size_sqm: 53.82, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 21, floor: 4, size_sqm: 47.37, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 22, floor: 4, size_sqm: 38.91, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 23, floor: 4, size_sqm: 81.55, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 24, floor: 4, size_sqm: 53.82, monthly_fee: 0.2 },
        // Floor 5 (5 apartments)
        { building_number: 1, apartment_number: 25, floor: 5, size_sqm: 31.57, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 26, floor: 5, size_sqm: 31.57, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 27, floor: 5, size_sqm: 31.57, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 28, floor: 5, size_sqm: 53.82, monthly_fee: 0.2 },
        { building_number: 1, apartment_number: 29, floor: 5, size_sqm: 81.55, monthly_fee: 0.2 },
      ]

      const { error: insertError } = await supabase
        .from('apartments')
        .insert(apartments)

      if (insertError) throw insertError

      setSuccess(true)
      await checkApartments()
    } catch (err: any) {
      if (err.message?.includes('row-level security policy')) {
        setError('RLS politika blokira umetanje podataka. Molimo pokrenite SQL skript sa stranice /fix-rls prvo.')
      } else {
        setError(err.message || 'Greška pri popunjavanju baze podataka')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Popuni stanove</h1>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Važno:</h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Ova stranica će dodati 29 stanova u bazu podataka. Ako stanovi već postoje, biće obrisani i ponovo dodati.
          </p>
        </div>

        {apartmentCount !== null && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Trenutni broj stanova u bazi: <span className="font-bold text-foreground">{apartmentCount}</span>
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-200">Uspješno!</h4>
              <p className="text-sm text-green-800 dark:text-green-300">
                Svih 29 stanova je uspješno dodano u bazu podataka.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-200">Greška</h4>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              {error.includes('RLS politika') && (
                <a href="/fix-rls" className="text-sm text-blue-600 dark:text-blue-400 underline mt-2 block">
                  Idite na stranicu za popravku RLS politika
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={checkApartments}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Provjeri stanove
          </button>
          <button
            onClick={seedApartments}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Učitavanje...' : 'Popuni stanove'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <a
            href="/admin"
            className="text-sm text-primary hover:underline"
          >
            ← Nazad na admin panel
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'profile_not_found') {
      setError('Vaš korisnički profil nije pronađen u bazi podataka. Molimo koristite stranicu za čišćenje i kreirajte novi nalog.')
    } else if (errorParam === 'profile_fetch_error') {
      setError('Greška pri učitavanju profila. Ovo je vjerovatno problem sa RLS politikama.')
    }
  }, [searchParams])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[v0] Attempting signin for:', email)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('[v0] Auth error:', authError)
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profileData) {
          console.error('[v0] Profile error:', profileError)
          setError('Greška pri učitavanju profila')
          setLoading(false)
          return
        }

        console.log('[v0] Signin successful, redirecting to', profileData.role, 'dashboard')
        
        // Redirect based on role
        if (profileData.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/tenant')
        }
      }
    } catch (err) {
      console.error('[v0] Signin exception:', err)
      setError('Neočekivana greška')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Prijava
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upravljanje zgradom Skendera Kulenovića 5
          </p>
        </div>

        <form onSubmit={handleSignin} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              {error.includes('RLS') && (
                <Link 
                  href="/fix-rls" 
                  className="text-sm text-red-600 dark:text-red-400 underline mt-2 block"
                >
                  Popravi RLS politike →
                </Link>
              )}
              {(error.includes('profil') || error.includes('bazi')) && (
                <Link 
                  href="/cleanup" 
                  className="text-sm text-red-600 dark:text-red-400 underline mt-2 block"
                >
                  Idi na stranicu za čišćenje podataka
                </Link>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email adresa
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="ivan@primer.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Lozinka
              </div>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Unesite vašu lozinku"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Prijava...' : 'Prijavite se'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Nemate nalog?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/90">
              Registruj se sa kodom poziva
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

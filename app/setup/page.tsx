'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Lock, Mail, User } from 'lucide-react'

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminExists, setAdminExists] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const router = useRouter()
  const checkRef = useRef(false)

  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return supabaseRef.current
  }

  useEffect(() => {
    if (checkRef.current) return
    checkRef.current = true

    const checkAdmin = async () => {
      try {
        const supabase = getSupabase()
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin')

        if (!error && (count || 0) > 0) {
          setAdminExists(true)
          router.push('/auth/signin')
          return
        }
      } catch (error) {
        console.error('[v0] Error checking admin:', error)
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdmin()
  }, [router])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju')
      return
    }

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Greška pri kreiranju administratora')
        setLoading(false)
        return
      }

      setStep(2)
    } catch (err) {
      setError('Neočekivana greška')
      console.error('[v0] Error creating admin:', err)
      setLoading(false)
    }
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Učitavanje...</p>
      </div>
    )
  }

  if (adminExists) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Upravljanje zgradom
          </h1>
          <p className="text-muted-foreground">
            Skendera Kulenovića 5
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Početna podešavanja
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Kreirajte administratorski nalog da biste počeli sa upravljanjem zgradom.
              </p>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Puno ime
                    </div>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                    placeholder="Ivan Tomić"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
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
                    className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                    placeholder="ivan@primer.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
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
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                    placeholder="Unesite jaku lozinku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Potvrdite lozinku
                    </div>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                    placeholder="Potvrdite lozinku"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 mt-6"
                >
                  {loading ? 'Kreiram nalog...' : 'Kreiraj administratorski nalog'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Uspješno kreirano!
            </h2>
            <p className="text-muted-foreground mb-6">
              Vaš administratorski nalog je kreiran. Sada se možete prijaviti.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Idi na prijavu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

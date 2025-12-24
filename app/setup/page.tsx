'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Shield } from 'lucide-react'

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [setupKey, setSetupKey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if admin already exists
    fetch('/api/setup/check')
      .then((res) => res.json())
      .then((data) => setHasAdmin(data.hasAdmin))
      .catch(() => setHasAdmin(false))
  }, [])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          setupKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Greška pri kreiranju admin naloga')
        setLoading(false)
        return
      }

      setSuccess('Admin nalog kreiran! Preusmjeravanje na prijavu...')
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (err) {
      console.error('Setup error:', err)
      setError('Neočekivana greška')
    } finally {
      setLoading(false)
    }
  }

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Provjera...</p>
      </div>
    )
  }

  if (hasAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 text-center">
          <Shield className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold text-foreground">
            Admin nalog već postoji
          </h2>
          <p className="text-muted-foreground">
            Sistem je već konfigurisan. Molimo prijavite se.
          </p>
          <a
            href="/auth/signin"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Idi na prijavu
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Početno podešavanje
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kreirajte prvi administratorski nalog
          </p>
        </div>

        <form onSubmit={handleSetup} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Ključ za podešavanje
              </div>
            </label>
            <input
              type="password"
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="SETUP_KEY iz environment varijabli"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Ovo je SETUP_KEY definisan u vašim environment varijablama
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
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
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Vaše puno ime"
            />
          </div>

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
              placeholder="admin@primer.com"
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
              minLength={8}
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Minimalno 8 karaktera"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Kreiranje...' : 'Kreiraj admin nalog'}
          </button>
        </form>
      </div>
    </div>
  )
}

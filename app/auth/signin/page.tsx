'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
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

  // Check for callback URL or error from NextAuth
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const authError = searchParams.get('error')

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Fetch user profile to determine redirect
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const profile = await response.json()
        if (profile.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/tenant')
        }
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error('Signin error:', err)
      setError('Neočekivana greška')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">Prijava</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upravljanje zgradom Skendera Kulenovića 5
          </p>
        </div>

        <form onSubmit={handleSignin} className="mt-8 space-y-6">
          {(error || authError) && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error || authError}
              </p>
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
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/90"
            >
              Registruj se sa kodom poziva
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

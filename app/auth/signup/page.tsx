'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const [invitationCode, setInvitationCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate password match
    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationCode,
          email,
          password,
          fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Greška pri registraciji')
        setLoading(false)
        return
      }

      // Redirect to signin page on success
      router.push('/auth/signin?registered=true')
    } catch (err) {
      console.error('Signup error:', err)
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
            Registracija stanara
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upravljanje zgradom Skendera Kulenovića 5
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Kod poziva
              </div>
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Unesite vaš kod poziva"
            />
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
              placeholder="ime@primer.com"
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
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Unesite jaku lozinku"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Potvrda lozinke
              </div>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-500 dark:border-red-700'
                  : 'border-input'
              }`}
              placeholder="Potvrdite lozinku"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Lozinke se ne podudaraju
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Registracija...' : 'Registruj se'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Već imate nalog?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:text-primary/90"
            >
              Prijavite se
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const [invitationCode, setInvitationCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if invitation code is valid
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', invitationCode)
        .single()

      if (invitationError || !invitationData || !invitationData.is_active || new Date(invitationData.expires_at) < new Date()) {
        setError('Nevažeći ili istekao kod poziva')
        setLoading(false)
        return
      }

      if (invitationData.used_at) {
        setError('Kod poziva je već korišten')
        setLoading(false)
        return
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Greška pri kreiranju korisnika')
        setLoading(false)
        return
      }

      // Create user record in database
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            role: 'tenant',
            apartment_id: invitationData.apartment_id,
            invitation_code: invitationCode,
            invitation_used: true,
          },
        ])

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      // Mark invitation as used
      await supabase
        .from('invitation_codes')
        .update({
          used_by: authData.user.id,
          used_at: new Date().toISOString(),
        })
        .eq('code', invitationCode)

      router.push('/auth/signin')
    } catch (err) {
      setError('Neočekivana greška')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">Registracija stanara</h2>
          <p className="mt-2 text-sm text-muted-foreground">Upravljanje zgradom Skendera Kulenovića 5</p>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Registracija...' : 'Registruj se'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Već imate nalog?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/90">
              Prijavite se
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useAuth } from '@/lib/auth-context'

export default function SettingsPage() {
  const { profile } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground">Podešavanja</h1>
      <p className="text-muted-foreground mt-1">
        Administratorski nalog
      </p>

      <div className="mt-8 bg-card border border-border rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Puno ime
            </label>
            <p className="text-foreground">{profile?.full_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <p className="text-foreground">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Uloga
            </label>
            <p className="text-foreground capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

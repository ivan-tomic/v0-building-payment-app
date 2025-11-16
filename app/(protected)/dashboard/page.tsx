'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'admin') {
        router.push('/admin')
      } else if (profile.role === 'tenant') {
        router.push('/tenant')
      }
    }
  }, [profile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Translated to Bosnian */}
      <p className="text-foreground">Učitavanje...</p>
    </div>
  )
}

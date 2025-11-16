'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'tenant'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (requiredRole && profile?.role !== requiredRole) {
      router.push('/unauthorized')
      return
    }
  }, [user, profile, loading, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Учитавање...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

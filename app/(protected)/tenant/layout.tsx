'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/lib/protected-route'
import TenantNavigation from '@/components/tenant/tenant-navigation'

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="tenant">
        <div className="min-h-screen bg-background">
          <TenantNavigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/lib/protected-route'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>{children}</ProtectedRoute>
    </AuthProvider>
  )
}

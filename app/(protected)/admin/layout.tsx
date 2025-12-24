'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/lib/protected-route'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="admin">
        <div className="flex h-screen bg-background">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

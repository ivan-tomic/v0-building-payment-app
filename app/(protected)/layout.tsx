'use client'

// This layout just provides a wrapper for protected routes
// Actual protection is handled in admin/tenant layouts
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

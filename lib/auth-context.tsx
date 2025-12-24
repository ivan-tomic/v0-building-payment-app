'use client'

import { createContext, useContext } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'tenant'
  apartmentId: number | null
}

interface AuthContextType {
  user: UserProfile | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role: session.user.role,
        apartmentId: session.user.apartmentId,
      }
    : null

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user, // Keep 'profile' for backward compatibility
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

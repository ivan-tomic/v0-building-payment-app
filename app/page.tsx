'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Redirect based on role
      if (session.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/tenant')
      }
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <Building2 className="h-20 w-20 text-primary" />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Upravljanje zgradom
          </h1>
          <p className="text-xl text-muted-foreground">
            Skendera Kulenovića 5
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
          >
            Prijava
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 border border-input rounded-md hover:bg-accent font-medium"
          >
            Registracija
          </Link>
        </div>
      </div>
    </div>
  )
}

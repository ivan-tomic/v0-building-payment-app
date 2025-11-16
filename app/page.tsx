'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        
        if (data.session) {
          router.push('/dashboard')
        } else {
          const { count: adminCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin')

          if ((adminCount || 0) === 0) {
            router.push('/setup')
          } else {
            router.push('/auth/signin')
          }
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/auth/signin')
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-foreground">Učitavanje...</p>
    </div>
  )
}

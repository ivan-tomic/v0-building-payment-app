'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'tenant'
  apartment_id: number | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const initializeRef = useRef(false)
  const fetchingProfileRef = useRef(false)

  useEffect(() => {
    if (initializeRef.current) return
    initializeRef.current = true

    const supabase = getSupabaseClient()

    const initializeAuth = async () => {
      try {
        console.log('[v0] Initializing auth...')
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('[v0] User authenticated:', session.user.email)
          console.log('[v0] User ID:', session.user.id)
          
          const { data: profileData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (error) {
            console.error('[v0] Error fetching profile:', error)
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setLoading(false)
            window.location.href = '/auth/signin?error=profile_fetch_error'
            return
          }

          if (!profileData) {
            console.error('[v0] No profile found for user:', session.user.id)
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setLoading(false)
            window.location.href = '/auth/signin?error=profile_not_found'
            return
          }

          console.log('[v0] Profile loaded:', profileData.role)
          setProfile(profileData as UserProfile)
        }
      } catch (error) {
        console.error('[v0] Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[v0] Auth state changed:', event)
      
      // If user signed out, clear state
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        return
      }
      
      // If user signed in and we don't have a profile yet, fetch it
      if (session?.user && !profile && !fetchingProfileRef.current) {
        fetchingProfileRef.current = true
        console.log('[v0] Loading profile for user:', session.user.id)
        
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        fetchingProfileRef.current = false

        if (error) {
          console.error('[v0] Error fetching profile on auth change:', error)
          return
        }

        if (profileData) {
          console.log('[v0] Profile set:', profileData.role)
          setProfile(profileData as UserProfile)
        }
      }
      
      setUser(session?.user ?? null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [profile])

  const signOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
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

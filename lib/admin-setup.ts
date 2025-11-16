import { createBrowserClient } from '@supabase/ssr'

export const checkAdminExists = async (): Promise<boolean> => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    return (count || 0) > 0
  } catch (error) {
    console.error('Error checking admin:', error)
    return false
  }
}

export const generateAdminInvitation = async (adminName: string): Promise<string | null> => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { error } = await supabase
      .from('invitation_codes')
      .insert([
        {
          code,
          apartment_id: null,
          is_admin_code: true,
          created_by: 'system',
        },
      ])

    if (error) throw error
    return code
  } catch (error) {
    console.error('Error generating admin code:', error)
    return null
  }
}

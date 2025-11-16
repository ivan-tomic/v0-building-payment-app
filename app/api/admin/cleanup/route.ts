import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie errors
            }
          },
        },
      }
    )

    const { data: users } = await supabase.auth.admin.listUsers()

    if (users && users.users) {
      for (const user of users.users) {
        await supabase.auth.admin.deleteUser(user.id)
      }
    }

    await supabase.from('invitation_codes').delete().neq('id', -1)
    await supabase.from('late_fees').delete().neq('id', -1)
    await supabase.from('payments').delete().neq('id', -1)
    await supabase.from('expenses').delete().neq('id', -1)
    await supabase.from('users').delete().neq('id', '')
    await supabase.from('apartments').delete().neq('id', -1)

    return NextResponse.json({
      success: true,
      message: 'Baza podataka je očišćena. Kreirajte novi administratorski nalog.',
    })
  } catch (error) {
    console.error('[v0] Cleanup error:', error)
    return NextResponse.json(
      { error: 'Greška pri čišćenju baze podataka' },
      { status: 500 }
    )
  }
}

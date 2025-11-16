import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Obavezna polja: email, lozinka i ime' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
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
              // Ignore cookie errors in server action
            }
          },
        },
      }
    )

    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'Administrator već postoji' },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Greška pri kreiranju korisnika' },
        { status: 400 }
      )
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'admin',
        is_active: true,
        invitation_used: true,
      })

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message || 'Greška pri kreiranju profila' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator je uspješno kreiran',
      userId: authData.user.id,
    })
  } catch (error) {
    console.error('[v0] Error creating admin:', error)
    return NextResponse.json(
      { error: 'Greška na serveru' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, setupKey } = body

    // Verify setup key
    const validSetupKey = process.env.SETUP_KEY
    if (!validSetupKey || setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Nevažeći ključ za podešavanje' },
        { status: 403 }
      )
    }

    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1)

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin nalog već postoji' },
        { status: 400 }
      )
    }

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Sva polja su obavezna' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 8 karaktera' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create admin user
    const [newAdmin] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        fullName,
        role: 'admin',
        isActive: true,
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: 'Admin nalog kreiran',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Greška pri kreiranju admin naloga' },
      { status: 500 }
    )
  }
}

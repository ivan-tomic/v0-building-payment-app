import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users, invitationCodes } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitationCode, email, password, fullName } = body

    // Validate input
    if (!invitationCode || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Sva polja su obavezna' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 karaktera' },
        { status: 400 }
      )
    }

    // Check if invitation code is valid
    const [invitation] = await db
      .select()
      .from(invitationCodes)
      .where(eq(invitationCodes.code, invitationCode))
      .limit(1)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Nevažeći kod poziva' },
        { status: 400 }
      )
    }

    if (!invitation.isActive) {
      return NextResponse.json(
        { error: 'Kod poziva nije aktivan' },
        { status: 400 }
      )
    }

    if (invitation.usedAt) {
      return NextResponse.json(
        { error: 'Kod poziva je već korišten' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Kod poziva je istekao' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email adresa je već registrovana' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        fullName,
        role: 'tenant',
        apartmentId: invitation.apartmentId,
        isActive: true,
      })
      .returning()

    // Mark invitation as used
    await db
      .update(invitationCodes)
      .set({
        usedBy: newUser.id,
        usedAt: new Date(),
        isActive: false,
      })
      .where(eq(invitationCodes.id, invitation.id))

    return NextResponse.json({
      success: true,
      message: 'Registracija uspješna',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Greška pri registraciji' },
      { status: 500 }
    )
  }
}

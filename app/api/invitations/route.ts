import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitationCodes, apartments } from '@/lib/schema'
import { eq, and, sql } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// Generate a random invitation code
function generateCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const codes = await db
      .select({
        id: invitationCodes.id,
        code: invitationCodes.code,
        apartmentId: invitationCodes.apartmentId,
        apartmentNumber: apartments.apartmentNumber,
        buildingNumber: apartments.buildingNumber,
        floor: apartments.floor,
        isActive: invitationCodes.isActive,
        usedAt: invitationCodes.usedAt,
        expiresAt: invitationCodes.expiresAt,
        createdAt: invitationCodes.createdAt,
      })
      .from(invitationCodes)
      .leftJoin(apartments, eq(invitationCodes.apartmentId, apartments.id))
      .orderBy(invitationCodes.createdAt)

    return NextResponse.json(codes)
  } catch (error) {
    console.error('Error fetching invitation codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { apartmentId, expiresInDays = 90 } = body

    if (!apartmentId) {
      return NextResponse.json(
        { error: 'Apartment ID is required' },
        { status: 400 }
      )
    }

    // Check if apartment exists
    const [apartment] = await db
      .select()
      .from(apartments)
      .where(eq(apartments.id, apartmentId))
      .limit(1)

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Deactivate any existing active codes for this apartment
    await db
      .update(invitationCodes)
      .set({ isActive: false })
      .where(
        and(
          eq(invitationCodes.apartmentId, apartmentId),
          eq(invitationCodes.isActive, true)
        )
      )

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const [newCode] = await db
      .insert(invitationCodes)
      .values({
        code,
        apartmentId,
        createdBy: parseInt(session.user.id),
        expiresAt,
        isActive: true,
      })
      .returning()

    return NextResponse.json({
      ...newCode,
      apartmentNumber: apartment.apartmentNumber,
      buildingNumber: apartment.buildingNumber,
    })
  } catch (error) {
    console.error('Error creating invitation code:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation code' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Invitation code ID required' },
        { status: 400 }
      )
    }

    // Deactivate instead of delete (for audit trail)
    await db
      .update(invitationCodes)
      .set({ isActive: false })
      .where(eq(invitationCodes.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invitation code:', error)
    return NextResponse.json(
      { error: 'Failed to delete invitation code' },
      { status: 500 }
    )
  }
}

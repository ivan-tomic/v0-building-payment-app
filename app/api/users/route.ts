import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, apartments } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let query = db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        apartmentId: users.apartmentId,
        apartmentNumber: apartments.apartmentNumber,
        buildingNumber: apartments.buildingNumber,
        floor: apartments.floor,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(apartments, eq(users.apartmentId, apartments.id))

    const result = await query

    // Filter by role if specified
    let filtered = result
    if (role) {
      filtered = result.filter((u) => u.role === role)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, isActive, apartmentId, fullName } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (apartmentId !== undefined) updateData.apartmentId = apartmentId
    if (fullName !== undefined) updateData.fullName = fullName

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Deactivate a user (don't delete to preserve history)
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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Don't allow deleting yourself
    if (parseInt(id) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Ne možete deaktivirati vlastiti nalog' },
        { status: 400 }
      )
    }

    // Deactivate instead of delete
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    )
  }
}

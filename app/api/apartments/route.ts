import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { apartments, users, payments } from '@/lib/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const withTenants = searchParams.get('withTenants') === 'true'

    // If tenant, only return their apartment
    if (session.user.role === 'tenant' && session.user.apartmentId) {
      const [apartment] = await db
        .select()
        .from(apartments)
        .where(eq(apartments.id, session.user.apartmentId))
        .limit(1)

      return NextResponse.json(apartment ? [apartment] : [])
    }

    // Admin: get all apartments
    if (withTenants) {
      // Get apartments with tenant info
      const result = await db
        .select({
          id: apartments.id,
          buildingNumber: apartments.buildingNumber,
          apartmentNumber: apartments.apartmentNumber,
          floor: apartments.floor,
          sizeSqm: apartments.sizeSqm,
          monthlyFee: apartments.monthlyFee,
          tenantId: users.id,
          tenantName: users.fullName,
          tenantEmail: users.email,
        })
        .from(apartments)
        .leftJoin(
          users,
          and(
            eq(users.apartmentId, apartments.id),
            eq(users.role, 'tenant'),
            eq(users.isActive, true)
          )
        )
        .orderBy(apartments.buildingNumber, apartments.apartmentNumber)

      return NextResponse.json(result)
    }

    const result = await db
      .select()
      .from(apartments)
      .orderBy(apartments.buildingNumber, apartments.apartmentNumber)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
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
    const { id, monthlyFee, sizeSqm } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Apartment ID required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {}
    if (monthlyFee !== undefined) updateData.monthlyFee = monthlyFee.toString()
    if (sizeSqm !== undefined) updateData.sizeSqm = sizeSqm.toString()

    const [updated] = await db
      .update(apartments)
      .set(updateData)
      .where(eq(apartments.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating apartment:', error)
    return NextResponse.json(
      { error: 'Failed to update apartment' },
      { status: 500 }
    )
  }
}

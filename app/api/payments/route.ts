import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, users, apartments } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const apartmentId = searchParams.get('apartmentId')

    let result = await db
      .select({
        id: payments.id,
        apartmentId: payments.apartmentId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        month: payments.month,
        year: payments.year,
        paymentMethod: payments.paymentMethod,
        notes: payments.notes,
        apartmentNumber: apartments.apartmentNumber,
      })
      .from(payments)
      .leftJoin(apartments, eq(payments.apartmentId, apartments.id))

    // Filter in JS (could also be done in SQL with proper conditions)
    let filtered = result
    
    // If tenant, only show their apartment's payments
    if (session.user.role === 'tenant' && session.user.apartmentId) {
      filtered = filtered.filter((p) => p.apartmentId === session.user.apartmentId)
    }
    
    // Filter by apartment if specified (admin only)
    if (apartmentId && session.user.role === 'admin') {
      filtered = filtered.filter((p) => p.apartmentId === parseInt(apartmentId))
    }
    
    if (month) {
      filtered = filtered.filter((p) => p.month === parseInt(month))
    }
    if (year) {
      filtered = filtered.filter((p) => p.year === parseInt(year))
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
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

    // Only admins can create payments
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { apartment_id, amount, payment_date, month, year, payment_method, notes } = body

    // Validate required fields
    if (!apartment_id || !amount || !payment_date || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const [newPayment] = await db
      .insert(payments)
      .values({
        apartmentId: apartment_id,
        amount: amount.toString(),
        paymentDate: payment_date,
        month,
        year,
        paymentMethod: payment_method,
        notes,
        createdBy: parseInt(session.user.id),
      })
      .returning()

    return NextResponse.json(newPayment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
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

    // Only admins can delete payments
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 })
    }

    await db.delete(payments).where(eq(payments.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}

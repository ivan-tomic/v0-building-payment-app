import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const [existingAdmin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1)

    return NextResponse.json({
      hasAdmin: !!existingAdmin,
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json({
      hasAdmin: false,
    })
  }
}

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const sqlFilePath = path.join(process.cwd(), 'scripts', '07-complete-rls-reset.sql')
    const sqlContent = await fs.readFile(sqlFilePath, 'utf-8')
    
    return NextResponse.json({ sql: sqlContent })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read SQL file' },
      { status: 500 }
    )
  }
}

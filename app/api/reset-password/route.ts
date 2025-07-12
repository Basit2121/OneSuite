import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { sql } from '@vercel/postgres'
import { initDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required.' },
        { status: 400 }
      )
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    const result = await sql`
      SELECT id FROM users WHERE reset_token = ${token}
    `
    const user = result.rows[0]
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      )
    }
    
    const passwordHash = await hash(password, 12)
    
    await sql`
      UPDATE users SET password_hash = ${passwordHash}, reset_token = NULL WHERE id = ${user.id}
    `
    
    return NextResponse.json({
      message: 'Password updated successfully.'
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  return new Database(dbPath)
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
    
    const db = getDb()
    
    const user = db.prepare(
      'SELECT id FROM users WHERE reset_token = ?'
    ).get(token)
    
    if (!user) {
      db.close()
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      )
    }
    
    const passwordHash = await hash(password, 12)
    
    db.prepare(
      'UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?'
    ).run(passwordHash, user.id)
    
    db.close()
    
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
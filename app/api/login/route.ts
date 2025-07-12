import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  return new Database(dbPath)
}

export async function POST(request: NextRequest) {
  try {
    console.log('Login request received')
    
    const body = await request.json()
    console.log('Request body:', { email: body.email, passwordProvided: !!body.password })
    
    const { email, password } = body
    
    if (!email?.trim() || !password) {
      console.log('Validation failed: missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    
    // Initialize database schema if needed
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        reset_token TEXT,
        created_at TEXT NOT NULL
      )
    `)
    
    console.log('Looking for user with email:', email.toLowerCase())
    
    const user = db.prepare(
      'SELECT * FROM users WHERE email = ? LIMIT 1'
    ).get(email.toLowerCase())
    
    console.log('User found:', !!user)
    
    if (!user) {
      db.close()
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }
    
    console.log('Comparing password with hash')
    const passwordMatch = await compare(password, user.password_hash)
    console.log('Password match:', passwordMatch)
    
    db.close()
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }
    
    const { password_hash, reset_token, ...userResponse } = user
    
    console.log('Login successful for user:', userResponse.email)
    
    return NextResponse.json({
      message: 'Login successful.',
      user: userResponse
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
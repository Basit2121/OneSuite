import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
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
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    console.log('Looking for user with email:', email.toLowerCase())
    
    const result = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `
    const user = result.rows[0]
    
    console.log('User found:', !!user)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }
    
    console.log('Comparing password with hash')
    const passwordMatch = await compare(password, user.password_hash)
    console.log('Password match:', passwordMatch)
    
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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { initDatabase, createUser, getUserByUsername, getUserByEmail } from '@/lib/db'

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
    const { username, email, password, agreeToTerms } = await request.json()
    
    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    // Check password strength (minimum 10 characters for medium strength)
    if (password.length < 10) {
      return NextResponse.json(
        { error: 'Password must be at least medium strength (10+ characters).' },
        { status: 400 }
      )
    }

    // Check if terms are agreed to
    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the Terms & Conditions and Privacy Policy.' },
        { status: 400 }
      )
    }
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    // Check if username exists
    const existingUsername = await getUserByUsername(username)
    
    if (existingUsername) {
      // Generate 3 available username suggestions
      const suggestions: string[] = []
      const baseUsername = username.toLowerCase()
      
      // Try different variations until we find 3 available ones
      for (let i = 1; suggestions.length < 3 && i <= 100; i++) {
        const variations = [
          `${baseUsername}${i}`,
          `${baseUsername}_${i}`,
          `${baseUsername}${Math.floor(Math.random() * 1000)}`,
          `${baseUsername}_${new Date().getFullYear()}`,
          `${baseUsername}_user`
        ]
        
        for (const variation of variations) {
          if (suggestions.length >= 3) break
          
          const exists = await getUserByUsername(variation)
          
          if (!exists && !suggestions.includes(variation)) {
            suggestions.push(variation)
          }
        }
      }
      
      return NextResponse.json(
        { 
          error: 'This username is already taken. Please choose a different username.',
          suggestions: suggestions.slice(0, 3)
        },
        { status: 409 }
      )
    }

    // Check if email exists
    const existingEmail = await getUserByEmail(email.toLowerCase())
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email address is already registered. Please use a different email or try signing in.' },
        { status: 409 }
      )
    }
    
    // Hash password
    const passwordHash = await hash(password, 12)
    
    // Generate avatar URL
    const avatarSeed = Math.random().toString(36).substring(7)
    const avatarUrl = `https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=${avatarSeed}`
    
    // Create user
    const user = await createUser(username, email.toLowerCase(), passwordHash, avatarUrl)
    
    return NextResponse.json({
      message: 'User registered successfully.',
      user
    }, { status: 201 })
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
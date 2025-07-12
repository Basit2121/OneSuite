import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  const db = new Database(dbPath)
  
  // Initialize users table if it doesn't exist
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
  
  return db
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
    
    const db = getDb()
    
    // Check if username exists
    const existingUsername = db.prepare(
      'SELECT id FROM users WHERE username = ? LIMIT 1'
    ).get(username)
    
    if (existingUsername) {
      // Generate 3 available username suggestions
      const suggestions = []
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
          
          const exists = db.prepare(
            'SELECT id FROM users WHERE username = ? LIMIT 1'
          ).get(variation)
          
          if (!exists && !suggestions.includes(variation)) {
            suggestions.push(variation)
          }
        }
      }
      
      db.close()
      return NextResponse.json(
        { 
          error: 'This username is already taken. Please choose a different username.',
          suggestions: suggestions.slice(0, 3)
        },
        { status: 409 }
      )
    }

    // Check if email exists
    const existingEmail = db.prepare(
      'SELECT id FROM users WHERE email = ? LIMIT 1'
    ).get(email.toLowerCase())
    
    if (existingEmail) {
      db.close()
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
    
    // Insert user
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      username,
      email.toLowerCase(),
      passwordHash,
      avatarUrl,
      new Date().toISOString()
    )
    
    // Get created user
    const user = db.prepare(`
      SELECT id, username, email, avatar_url, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid)
    
    db.close()
    
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
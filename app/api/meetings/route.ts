import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import { join } from 'path'
import crypto from 'crypto'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  const db = new Database(dbPath)
  
  // Initialize meetings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      created_at TEXT NOT NULL,
      ended_at TEXT,
      duration_seconds INTEGER,
      current_participants INTEGER NOT NULL DEFAULT 0,
      peak_participants INTEGER NOT NULL DEFAULT 0,
      total_joined INTEGER NOT NULL DEFAULT 0,
      moderator_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(moderator_id) REFERENCES users(id)
    )
  `)
  
  return db
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const meetingId = body.id || crypto.randomBytes(12).toString('base64url')
    const userId = body.user_id || null
    const createdAt = new Date().toISOString()
    
    const db = getDb()
    
    // Check if meeting exists
    const existingMeeting = db.prepare(
      'SELECT id FROM meetings WHERE id = ?'
    ).get(meetingId)
    
    if (existingMeeting) {
      db.close()
      return NextResponse.json(
        { error: 'Meeting with this ID already exists.' },
        { status: 409 }
      )
    }
    
    // Insert meeting
    db.prepare(`
      INSERT INTO meetings (id, user_id, created_at)
      VALUES (?, ?, ?)
    `).run(meetingId, userId, createdAt)
    
    // Get created meeting
    const meeting = db.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).get(meetingId)
    
    db.close()
    
    return NextResponse.json({ meeting }, { status: 201 })
    
  } catch (error) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    const db = getDb()
    
    let meetings
    if (userId) {
      meetings = db.prepare(
        'SELECT * FROM meetings WHERE user_id = ? ORDER BY created_at DESC'
      ).all(userId)
    } else {
      meetings = db.prepare(
        'SELECT * FROM meetings ORDER BY created_at DESC'
      ).all()
    }
    
    db.close()
    
    return NextResponse.json({ meetings })
    
  } catch (error) {
    console.error('List meetings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import crypto from 'crypto'
import { initDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase()
    // Initialize meetings table
    await sql`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP WITH TIME ZONE,
        duration_seconds INTEGER,
        current_participants INTEGER NOT NULL DEFAULT 0,
        peak_participants INTEGER NOT NULL DEFAULT 0,
        total_joined INTEGER NOT NULL DEFAULT 0,
        moderator_id INTEGER
      )
    `
    dbInitialized = true
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const meetingId = body.id || crypto.randomBytes(12).toString('base64url')
    const userId = body.user_id || null
    const createdAt = new Date().toISOString()
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    // Check if meeting exists
    const existingResult = await sql`
      SELECT id FROM meetings WHERE id = ${meetingId}
    `
    const existingMeeting = existingResult.rows[0]
    
    if (existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting with this ID already exists.' },
        { status: 409 }
      )
    }
    
    // Insert meeting
    await sql`
      INSERT INTO meetings (id, user_id, created_at)
      VALUES (${meetingId}, ${userId}, ${createdAt})
    `
    
    // Get created meeting
    const meetingResult = await sql`
      SELECT * FROM meetings WHERE id = ${meetingId}
    `
    const meeting = meetingResult.rows[0]
    
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
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    let meetings
    if (userId) {
      const result = await sql`
        SELECT * FROM meetings WHERE user_id = ${userId} ORDER BY created_at DESC
      `
      meetings = result.rows
    } else {
      const result = await sql`
        SELECT * FROM meetings ORDER BY created_at DESC
      `
      meetings = result.rows
    }
    
    return NextResponse.json({ meetings })
    
  } catch (error) {
    console.error('List meetings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
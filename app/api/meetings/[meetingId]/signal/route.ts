import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase()
    // Initialize signaling table
    await sql`
      CREATE TABLE IF NOT EXISTS meeting_signals (
        id SERIAL PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        from_user TEXT NOT NULL,
        to_user TEXT,
        signal_type TEXT NOT NULL,
        signal_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    dbInitialized = true
  }
}

// POST - Send a signal
export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    const body = await request.json()
    const { from_user, to_user, signal_type, signal_data } = body
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    // Insert signal
    await sql`
      INSERT INTO meeting_signals (meeting_id, from_user, to_user, signal_type, signal_data)
      VALUES (${meetingId}, ${from_user}, ${to_user}, ${signal_type}, ${JSON.stringify(signal_data)})
    `
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Signal send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Receive signals
export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const lastId = searchParams.get('last_id') || '0'
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    // Get signals for this user
    const result = await sql`
      SELECT id, from_user, signal_type, signal_data, created_at
      FROM meeting_signals 
      WHERE meeting_id = ${meetingId} 
      AND (to_user = ${userId} OR to_user IS NULL)
      AND from_user != ${userId}
      AND id > ${lastId}
      ORDER BY id ASC
    `
    
    return NextResponse.json({ signals: result.rows })
    
  } catch (error) {
    console.error('Signal receive error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Clean up old signals
export async function DELETE(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    // Delete signals older than 1 hour
    await sql`
      DELETE FROM meeting_signals 
      WHERE meeting_id = ${meetingId} 
      AND created_at < NOW() - INTERVAL '1 hour'
    `
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Signal cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
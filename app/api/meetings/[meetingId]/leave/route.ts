import { NextRequest, NextResponse } from 'next/server'
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



export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    const body = await request.json().catch(() => ({}))
    const userId = body.user_id || null
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    const result = await sql`
      SELECT * FROM meetings WHERE id = ${meetingId}
    `
    const meeting = result.rows[0]
    
    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found.' },
        { status: 404 }
      )
    }
    
    const current = Math.max(0, meeting.current_participants - 1)
    
    await sql`
      UPDATE meetings SET current_participants = ${current} WHERE id = ${meetingId}
    `
    
    return NextResponse.json({
      current_participants: current,
      moderator_id: meeting.moderator_id,
      is_moderator: userId === meeting.moderator_id
    })
    
  } catch (error) {
    console.error('Leave meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
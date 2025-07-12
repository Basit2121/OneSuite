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
    const guestName = body.guest_name || null
    
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
    
    const current = meeting.current_participants + 1
    const total = meeting.total_joined + 1
    const peak = Math.max(meeting.peak_participants, current)
    
    // Check if this is the first participant and set as moderator
    let moderatorId = meeting.moderator_id
    let isNewModerator = false
    
    if (total === 1 && (userId || guestName) && !moderatorId) {
      moderatorId = userId || `guest_${guestName}_${Date.now()}`
      isNewModerator = true
      await sql`
        UPDATE meetings SET 
        current_participants = ${current}, 
        total_joined = ${total}, 
        peak_participants = ${peak}, 
        moderator_id = ${moderatorId} 
        WHERE id = ${meetingId}
      `
    } else {
      await sql`
        UPDATE meetings SET 
        current_participants = ${current}, 
        total_joined = ${total}, 
        peak_participants = ${peak} 
        WHERE id = ${meetingId}
      `
    }
    
    return NextResponse.json({
      current_participants: current,
      total_joined: total,
      peak_participants: peak,
      moderator_id: moderatorId,
      is_moderator: (userId && userId === moderatorId) || (!userId && moderatorId && moderatorId.includes(`guest_${guestName}`)),
      is_new_moderator: isNewModerator
    })
    
  } catch (error) {
    console.error('Join meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
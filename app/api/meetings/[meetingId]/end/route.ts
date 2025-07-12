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
    const endedAt = new Date().toISOString()
    
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
    
    let durationSeconds = null
    if (meeting.created_at) {
      try {
        const started = new Date(meeting.created_at)
        const ended = new Date(endedAt)
        durationSeconds = Math.floor((ended.getTime() - started.getTime()) / 1000)
      } catch (error) {
        console.error('Error calculating duration:', error)
      }
    }
    
    await sql`
      UPDATE meetings SET 
      ended_at = ${endedAt}, 
      duration_seconds = ${durationSeconds}, 
      current_participants = 0 
      WHERE id = ${meetingId}
    `
    
    const updatedResult = await sql`
      SELECT * FROM meetings WHERE id = ${meetingId}
    `
    const updatedMeeting = updatedResult.rows[0]
    
    return NextResponse.json({ meeting: updatedMeeting })
    
  } catch (error) {
    console.error('End meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
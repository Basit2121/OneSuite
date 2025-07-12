import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  return new Database(dbPath)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    const endedAt = new Date().toISOString()
    
    const db = getDb()
    
    const meeting = db.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).get(meetingId)
    
    if (!meeting) {
      db.close()
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
    
    db.prepare(`
      UPDATE meetings SET 
      ended_at = ?, 
      duration_seconds = ?, 
      current_participants = 0 
      WHERE id = ?
    `).run(endedAt, durationSeconds, meetingId)
    
    const updatedMeeting = db.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).get(meetingId)
    
    db.close()
    
    return NextResponse.json({ meeting: updatedMeeting })
    
  } catch (error) {
    console.error('End meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
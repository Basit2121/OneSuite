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
    const body = await request.json().catch(() => ({}))
    const userId = body.user_id || null
    
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
    
    const current = Math.max(0, meeting.current_participants - 1)
    
    db.prepare(
      'UPDATE meetings SET current_participants = ? WHERE id = ?'
    ).run(current, meetingId)
    
    db.close()
    
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
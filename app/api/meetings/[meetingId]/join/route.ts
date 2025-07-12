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
    
    const current = meeting.current_participants + 1
    const total = meeting.total_joined + 1
    const peak = Math.max(meeting.peak_participants, current)
    
    // Check if this is the first participant and set as moderator
    let moderatorId = meeting.moderator_id
    let isNewModerator = false
    
    if (total === 1 && userId && !moderatorId) {
      moderatorId = userId
      isNewModerator = true
      db.prepare(`
        UPDATE meetings SET 
        current_participants = ?, 
        total_joined = ?, 
        peak_participants = ?, 
        moderator_id = ? 
        WHERE id = ?
      `).run(current, total, peak, moderatorId, meetingId)
    } else {
      db.prepare(`
        UPDATE meetings SET 
        current_participants = ?, 
        total_joined = ?, 
        peak_participants = ? 
        WHERE id = ?
      `).run(current, total, peak, meetingId)
    }
    
    db.close()
    
    return NextResponse.json({
      current_participants: current,
      total_joined: total,
      peak_participants: peak,
      moderator_id: moderatorId,
      is_moderator: userId === moderatorId,
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
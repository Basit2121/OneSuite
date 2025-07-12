import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  return new Database(dbPath)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    
    const db = getDb()
    
    const meeting = db.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).get(meetingId)
    
    db.close()
    
    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ meeting })
    
  } catch (error) {
    console.error('Get meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
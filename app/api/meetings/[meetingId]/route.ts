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



export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params
    
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
    
    return NextResponse.json({ meeting })
    
  } catch (error) {
    console.error('Get meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
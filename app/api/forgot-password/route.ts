import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { initDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

async function sendResetEmail(email: string, token: string) {
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const resetLink = `${frontendBaseUrl}/reset-password?token=${token}`
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL || 'basitm5555@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'ukut iozw ndbx wopn'
    }
  })
  
  const mailOptions = {
    from: process.env.SMTP_EMAIL || 'basitm5555@gmail.com',
    to: email,
    subject: 'Reset your password',
    text: `Hello,

We received a request to reset your password.

To choose a new password, click the link below (or copy/paste it into your browser):
${resetLink}

If you didn't request this, you can safely ignore this email.

Thanks.`
  }
  
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send reset email:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      )
    }
    
    // Ensure database is initialized
    await ensureDbInitialized()
    
    const result = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `
    const user = result.rows[0]
    
    if (!user) {
      // Always return generic message to avoid account enumeration
      return NextResponse.json({
        message: 'If that account exists, a reset link has been sent.'
      })
    }
    
    const token = crypto.randomBytes(32).toString('base64url')
    
    await sql`
      UPDATE users SET reset_token = ${token} WHERE id = ${user.id}
    `
    
    // Send email
    await sendResetEmail(email.toLowerCase(), token)
    
    return NextResponse.json({
      message: 'If that account exists, a reset link has been sent.'
    })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
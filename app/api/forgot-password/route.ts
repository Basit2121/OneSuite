import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import { join } from 'path'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const dbPath = join(process.cwd(), 'users.db')

function getDb() {
  return new Database(dbPath)
}

async function sendResetEmail(email: string, token: string) {
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const resetLink = `${frontendBaseUrl}/reset-password?token=${token}`
  
  const transporter = nodemailer.createTransporter({
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
    
    const db = getDb()
    
    const user = db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(email.toLowerCase())
    
    if (!user) {
      // Always return generic message to avoid account enumeration
      return NextResponse.json({
        message: 'If that account exists, a reset link has been sent.'
      })
    }
    
    const token = crypto.randomBytes(32).toString('base64url')
    
    db.prepare(
      'UPDATE users SET reset_token = ? WHERE id = ?'
    ).run(token, user.id)
    
    db.close()
    
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
import { sql } from '@vercel/postgres';

// Use the Neon database connection
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export async function initDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        reset_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function createUser(username: string, email: string, passwordHash: string, avatarUrl: string) {
  const result = await sql`
    INSERT INTO users (username, email, password_hash, avatar_url)
    VALUES (${username}, ${email}, ${passwordHash}, ${avatarUrl})
    RETURNING id, username, email, avatar_url, created_at
  `;
  return result.rows[0];
}

export async function getUserByUsername(username: string) {
  const result = await sql`
    SELECT id FROM users WHERE username = ${username} LIMIT 1
  `;
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;
  return result.rows[0];
}

export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, username, email, avatar_url, created_at
    FROM users WHERE id = ${id}
  `;
  return result.rows[0];
} 
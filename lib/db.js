// lib/db.js
import { sql } from '@vercel/postgres';

export async function initDB() {
  // Create tables if they don't exist
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      language VARCHAR(10) DEFAULT 'en',
      category VARCHAR(50) DEFAULT 'general',
      is_safe BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      is_correct BOOLEAN DEFAULT false
    );
  `;
}

export { sql };

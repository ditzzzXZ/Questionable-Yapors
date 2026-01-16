// app/api/question/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET: Get random question
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'en';
  
  try {
    const question = await sql`
      SELECT q.*, 
             json_agg(
               json_build_object(
                 'id', o.id,
                 'text', o.text,
                 'votes', o.votes,
                 'isCorrect', o.is_correct
               )
             ) as options
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      WHERE q.language = ${language} AND q.is_safe = true
      GROUP BY q.id
      ORDER BY RANDOM()
      LIMIT 1
    `;
    
    return NextResponse.json(question.rows[0] || {});
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Submit new question
export async function POST(request) {
  try {
    const { text, language, options, category } = await request.json();
    
    // Content filter
    const bannedWords = ['fuck', 'shit', 'porn', 'adult', '18+'];
    const hasBanned = bannedWords.some(word => 
      text.toLowerCase().includes(word) ||
      options.some(opt => opt.text.toLowerCase().includes(word))
    );
    
    if (hasBanned) {
      return NextResponse.json({ error: 'Inappropriate content' }, { status: 400 });
    }
    
    // Insert question
    const questionResult = await sql`
      INSERT INTO questions (text, language, category)
      VALUES (${text}, ${language}, ${category || 'general'})
      RETURNING id
    `;
    
    const questionId = questionResult.rows[0].id;
    
    // Insert options
    for (const option of options) {
      await sql`
        INSERT INTO options (question_id, text, is_correct)
        VALUES (${questionId}, ${option.text}, ${option.isCorrect || false})
      `;
    }
    
    return NextResponse.json({ success: true, id: questionId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

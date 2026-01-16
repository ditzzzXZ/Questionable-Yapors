// app/api/vote/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { optionId } = await request.json();
    
    await sql`
      UPDATE options 
      SET votes = votes + 1 
      WHERE id = ${optionId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

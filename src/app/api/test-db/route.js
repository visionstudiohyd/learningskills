import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query('SELECT 1 + 1 AS result');
    return NextResponse.json({ success: true, rows });
  } catch (error) {
    return NextResponse.json({
      success: false,
      code: error.code,
      message: error.message,
    }, { status: 500 });
  }
}
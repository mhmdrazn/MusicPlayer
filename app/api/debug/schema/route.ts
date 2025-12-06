import { db } from '@/lib/db/drizzle';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test query user table
    const users = await db.query.users.findMany();

    // Get table info
    const tableInfo = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position;
    `);

    return NextResponse.json(
      {
        message: 'Database info',
        userCount: users.length,
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          hasPassword: !!u.password,
        })),
        tableSchema: tableInfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get debug info',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

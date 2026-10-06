import { NextResponse } from 'next/server';
import { readKnowledgeLessons } from '@/lib/server/knowledge-base';
import catalog from '@/knowledge-base/catalog.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ catalog, lessons: await readKnowledgeLessons() });
  } catch (error) {
    console.error('Knowledge base could not be loaded', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Kho bài học chưa đọc được. Người quản trị cần kiểm tra dữ liệu đã nhập.' }, { status: 500 });
  }
}

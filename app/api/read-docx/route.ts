import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.docx') || file.size > 2_000_000) return NextResponse.json({ error: 'Chỉ nhận .docx tối đa 2 MB.' }, { status: 400 });
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = (await mammoth.extractRawText({ buffer })).value.trim();
    if (!text || text.length > 16000) return NextResponse.json({ error: 'Nội dung rỗng hoặc vượt 16.000 ký tự.' }, { status: 400 });
    return NextResponse.json({ text });
  } catch { return NextResponse.json({ error: 'Không đọc được tệp Word.' }, { status: 400 }); }
}

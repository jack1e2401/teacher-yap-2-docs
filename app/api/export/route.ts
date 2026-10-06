import { NextRequest, NextResponse } from 'next/server';
import { AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, Packer, PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import pptxgen from 'pptxgenjs';
import { requestSchema, validateResult, slideSchema, lessonSchema, examSchema, skknSchema } from '@/lib/schema';
import { slideBadge, slidePages, slideStyle } from '@/lib/slide-layout';

export const runtime = 'nodejs';
const ink = '183245', accent = '0B7182';
type Block = Paragraph | Table;
type Request = ReturnType<typeof requestSchema.parse>;
function para(text: string, bold = false, indent = false) {
  return new Paragraph({ children: [new TextRun({ text, bold, color: ink, size: 22 })], spacing: { after: 130, line: 340 }, indent: indent ? { left: 340 } : undefined });
}
function examPara(text: string, bold = false, indent = false, keepNext = false) {
  return new Paragraph({ children: [new TextRun({ text, bold, color: ink, size: 21 })], spacing: { after: bold ? 45 : 20, line: 285 }, indent: indent ? { left: 360 } : undefined, keepNext });
}
function title(text: string) { return new Paragraph({ text, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 240, after: 260 }, keepNext: true }); }
function h(text: string, sub = false, pageBreakBefore = false) { return new Paragraph({ text, heading: sub ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1, spacing: { before: sub ? 160 : 280, after: 110 }, keepNext: true, pageBreakBefore }); }
function paragraphs(text: string) { return (text || '[CẦN GIÁO VIÊN BỔ SUNG]').split(/\n+/).filter(Boolean).map(line => para(line)); }
function table(rows: string[][], widths?: number[]) {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows.map((cells, index) => new TableRow({ cantSplit: index === 0,
    children: cells.map((text, cellIndex) => new TableCell({ width: { size: widths?.[cellIndex] ?? 100 / cells.length, type: WidthType.PERCENTAGE },
      shading: index === 0 ? { type: ShadingType.CLEAR, fill: accent } : index % 2 === 0 ? { type: ShadingType.CLEAR, fill: 'F4F8F8' } : undefined,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: index === 0, color: index === 0 ? 'FFFFFF' : ink, size: 19 })], spacing: { after: 0, line: 260 } })] })) })),
    borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'C9D9DE' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D9DE' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'C9D9DE' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'C9D9DE' }, insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: 'DDE8EA' }, insideVertical: { style: BorderStyle.SINGLE, size: 3, color: 'DDE8EA' } } });
}
function examMetadata(text: string, kind: 'matrix' | 'specification'): Block[] {
  try {
    const value: unknown = JSON.parse(text);
    if (!Array.isArray(value) || !value.length || !value.every(row => row && typeof row === 'object' && !Array.isArray(row))) return paragraphs(text);
    const rows = value as Record<string, unknown>[];
    const get = (row: Record<string, unknown>, key: string) => String(row[key] ?? '—');
    if (kind === 'matrix') return [table([
      ['Chủ đề', 'Mức độ', 'TN', 'Đ/S', 'Ngắn', 'TL', 'Điểm'],
      ...rows.map(row => [get(row, 'topic'), get(row, 'level'), get(row, 'trắc nghiệm'), get(row, 'đúng sai'), get(row, 'trả lời ngắn'), get(row, 'tự luận'), get(row, 'totalPoints')]),
    ], [30, 16, 9, 9, 10, 9, 17])];
    return [table([['Chủ đề', 'Mức độ', 'Yêu cầu cần đạt'], ...rows.map(row => [get(row, 'topic'), get(row, 'level'), get(row, 'description')])], [27, 16, 57])];
  } catch { return paragraphs(text); }
}
function documentBytes(blocks: Block[], label: string) {
  return Packer.toBuffer(new Document({
    creator: 'Trợ lý giáo viên AI',
    styles: { default: { document: { run: { font: 'Arial', size: 22, color: ink }, paragraph: { spacing: { line: 340, after: 120 } } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: 'Arial', size: 34, bold: true, color: accent } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', run: { font: 'Arial', size: 27, bold: true, color: accent } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Arial', size: 23, bold: true, color: ink } },
      ] },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1250, bottom: 1250, left: 1250, right: 1250, header: 600, footer: 600 } } },
      headers: { default: new Header({ children: [new Paragraph({ text: 'TRỢ LÝ GIÁO VIÊN AI  /  ' + label.toUpperCase(), alignment: AlignmentType.RIGHT, border: { bottom: { color: 'B7D7DC', size: 5, style: BorderStyle.SINGLE } } })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bản nháp cần giáo viên rà soát  •  Trang ', color: '657C86', size: 18 }), new TextRun({ children: [PageNumber.CURRENT], color: '657C86', size: 18 })] })] }) },
      children: blocks,
    }],
  }));
}
function lessonBlocks(d: ReturnType<typeof lessonSchema.parse>, input: Request): Block[] {
  return [title('KẾ HOẠCH BÀI DẠY'), para(d.title, true), table([['Môn học', 'Lớp', 'Bộ sách', 'Thời lượng'], [input.subject || '—', String(input.grade), input.book || '—', input.duration + ' phút']]),
    h('I. Mục tiêu'), ...paragraphs(d.goals), h('II. Thiết bị dạy học và học liệu'), ...paragraphs(d.materials), h('III. Tiến trình dạy học'),
    ...d.activities.flatMap((a, i): Block[] => [h(`Hoạt động ${i + 1}. ${a.name} (${a.minutes} phút)`, true, true),
      table([['Mục', 'Nội dung'], ['Mục tiêu', a.goal], ['Nội dung', a.content], ['Sản phẩm', a.product], ['Tổ chức thực hiện', a.method]]), para('')]),
    para('Giáo viên đối chiếu kế hoạch của tổ chuyên môn và Phụ lục IV Công văn 5512.')];
}
function examBlocks(d: ReturnType<typeof examSchema.parse>, input: Request, variant: string): Block[] {
  const blocks: Block[] = [title(variant === 'student' ? 'ĐỀ KIỂM TRA' : 'HỒ SƠ ĐỀ KIỂM TRA'), para(d.title, true),
    table([['Môn', 'Lớp', 'Thời gian', 'Tổng điểm'], [input.subject || '—', String(input.grade), d.duration + ' phút', String(input.points)]])];
  if (variant === 'teacher') blocks.push(h('I. Ma trận đề kiểm tra (tham khảo CV 7991)'), ...examMetadata(d.matrix, 'matrix'),
    h('II. Bản đặc tả'), ...examMetadata(d.specification, 'specification'));
  blocks.push(h(variant === 'student' ? 'Câu hỏi' : 'III. Đề kiểm tra'));
  for (const q of d.questions) {
    const needsAnswer = variant === 'student' && (q.type === 'tự luận' || q.type === 'trả lời ngắn');
    blocks.push(examPara(`Câu ${q.number}. ${q.prompt} (${q.points} điểm)`, true, false, Boolean(q.options?.length || needsAnswer)));
    for (const [index, option] of (q.options || []).entries()) blocks.push(examPara(/^[A-D][.)]\s/i.test(option) ? option : `${String.fromCharCode(65 + index)}. ${option}`, false, true, index < (q.options?.length || 0) - 1));
    if (needsAnswer) {
      const lines = q.type === 'tự luận' ? Math.min(4, Math.max(2, Math.ceil(q.points * 2))) : 1;
      for (let i = 0; i < lines; i++) blocks.push(new Paragraph({ text: '........................................................................................', spacing: { before: 20, after: i === lines - 1 ? 130 : 30, line: 280 } }));
    }
  }
  if (variant === 'teacher') blocks.push(h('IV. Đáp án và hướng dẫn chấm'),
    table([['Câu', 'Đáp án / gợi ý', 'Điểm'], ...d.questions.map(q => [String(q.number), q.answer, String(q.points)])], [10, 75, 15]),
    para('Giáo viên cần đối chiếu đề và đáp án trước khi sử dụng.'));
  return blocks;
}
function skknBlocks(d: ReturnType<typeof skknSchema.parse>, input: Request): Block[] {
  const sections: [string, string][] = [['I. Đặt vấn đề', d.introduction], ['II. Cơ sở', d.basis], ['III. Thực trạng', d.situation],
    ['IV. Biện pháp', d.measures], ['V. Đánh giá', d.evaluation], ['VI. Khả năng áp dụng', d.applicability],
    ['VII. Kết luận', d.conclusion], ['VIII. Kiến nghị', d.recommendations]];
  return [title('BẢN DỰ THẢO SÁNG KIẾN KINH NGHIỆM'), para(d.title, true),
    table([['Môn', 'Lớp', 'Tình trạng'], [input.subject || '—', String(input.grade), 'Dự thảo — cần bổ sung minh chứng']]),
    ...sections.flatMap(([heading, text], index): Block[] => [h(heading, false, [2, 4, 6, 7].includes(index)), ...paragraphs(text)]),
    para('Không sử dụng số liệu hoặc kết quả chưa được giáo viên kiểm chứng.')];
}
async function slideBytes(d: ReturnType<typeof slideSchema.parse>) {
  const pptx = new pptxgen(); pptx.layout = 'LAYOUT_WIDE'; pptx.author = 'Trợ lý giáo viên AI'; pptx.title = d.title;
  const pages = slidePages(d.slides);
  pages.forEach((item, index) => {
    const slide = pptx.addSlide(), image = item.imageData;
    const style = slideStyle(d.title, index, Boolean(image));
    const navy = '17334A', teal = '087E8B', pale = 'EAF4F2', cream = 'FFF8EB';
    slide.background = { color: style === 1 ? navy : style === 2 ? cream : 'F7FAF9' };
    const dark = style === 1;
    const fg = dark ? 'FFFFFF' : navy;
    const sub = dark ? 'AEE5E4' : teal;
    const badge = slideBadge(item.title);
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.11, line: { color: teal }, fill: { color: teal } });
    slide.addText(d.title.toUpperCase(), { x: 0.78, y: 0.39, w: 10.9, h: 0.25, fontFace: 'Arial', fontSize: 10, bold: true, charSpacing: 1.3, color: sub, margin: 0 });
    slide.addShape(pptx.ShapeType.roundRect, { x: 10.7, y: 0.31, w: 1.85, h: 0.38, rectRadius: 0.12, line: { color: dark ? '65D1C8' : 'B8DCD8', width: 1 }, fill: { color: dark ? '22465D' : 'E5F4EF' } });
    slide.addText(`✦  ${badge}`, { x: 10.82, y: 0.4, w: 1.62, h: 0.17, fontFace: 'Arial', fontSize: 10, bold: true, align: 'center', color: dark ? 'AEE5E4' : teal, margin: 0 });
    slide.addText(item.title, { x: 0.78, y: 0.91, w: 11.7, h: 0.88, fontFace: 'Arial', fontSize: item.title.length > 50 ? 27 : 32, bold: true, color: fg, margin: 0, breakLine: false });
    if (style === 0) {
      const textW = image ? 6.2 : 11.6;
      item.bullets.forEach((bullet, i) => {
        const y = 2.14 + i * (4.48 / item.bullets.length);
        slide.addText(String(i + 1).padStart(2, '0'), { x: 0.82, y, w: 0.6, h: 0.42, fontFace: 'Arial', fontSize: 15, bold: true, color: teal, margin: 0 });
        slide.addText(bullet, { x: 1.55, y: y - 0.08, w: textW - 1.1, h: Math.min(0.92, 4.2 / item.bullets.length), fontFace: 'Arial', fontSize: bullet.length > 95 ? 18 : 21, color: navy, margin: 0, valign: 'middle', breakLine: false });
        if (i < item.bullets.length - 1) slide.addShape(pptx.ShapeType.line, { x: 0.82, y: y + 0.83, w: textW - 0.25, h: 0, line: { color: 'D2E1E0', width: 1 } });
      });
      if (image) {
        slide.addShape(pptx.ShapeType.rect, { x: 7.48, y: 2.02, w: 5.1, h: 4.56, line: { color: 'FFFFFF' }, fill: { color: pale } });
        slide.addImage({ data: image, x: 7.48, y: 2.02, w: 5.1, h: 4.56 });
        slide.addText('WIKIMEDIA COMMONS', { x: 7.52, y: 6.62, w: 4.8, h: 0.2, fontFace: 'Arial', fontSize: 8, color: '657C86', margin: 0 });
      }
    } else if (style === 1) {
      const gap = 0.16, cardW = (11.8 - gap * (item.bullets.length - 1)) / item.bullets.length;
      item.bullets.forEach((bullet, i) => {
        const x = 0.78 + i * (cardW + gap);
        slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.44, w: cardW, h: 3.44, rectRadius: 0.08, line: { color: '3D7081', width: 1 }, fill: { color: i % 2 ? '22465D' : '1C4056' } });
        slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.22, y: 2.7, w: 0.56, h: 0.56, line: { color: '65D1C8' }, fill: { color: '65D1C8' } });
        slide.addText(String(i + 1), { x: x + 0.22, y: 2.72, w: 0.56, h: 0.45, align: 'center', fontFace: 'Arial', fontSize: 17, bold: true, color: navy, margin: 0 });
        slide.addText(bullet, { x: x + 0.22, y: 3.58, w: cardW - 0.44, h: 1.95, fontFace: 'Arial', fontSize: item.bullets.length >= 4 || bullet.length > 90 ? 17 : 20, color: 'FFFFFF', margin: 0.02, valign: 'middle' });
        if (i < item.bullets.length - 1) slide.addShape(pptx.ShapeType.chevron, { x: x + cardW - 0.04, y: 3.76, w: 0.28, h: 0.5, line: { color: '65D1C8' }, fill: { color: '65D1C8' } });
      });
      slide.addText('QUAN SÁT  →  THỰC HÀNH  →  VẬN DỤNG', { x: 0.8, y: 6.32, w: 11, h: 0.26, fontFace: 'Arial', fontSize: 10, bold: true, charSpacing: 1.1, color: sub, margin: 0 });
    } else {
      const left = item.bullets.slice(0, Math.ceil(item.bullets.length / 2)), right = item.bullets.slice(left.length);
      slide.addShape(pptx.ShapeType.rect, { x: 0.78, y: 2.22, w: 5.8, h: 4.35, line: { color: 'E5D9C2' }, fill: { color: 'FFFFFF' } });
      slide.addShape(pptx.ShapeType.rect, { x: 6.76, y: 2.22, w: 5.8, h: 4.35, line: { color: 'CBE2DE' }, fill: { color: pale } });
      slide.addText('KHÁM PHÁ', { x: 1.05, y: 2.55, w: 5, h: 0.3, fontFace: 'Arial', fontSize: 12, bold: true, color: teal, margin: 0 });
      slide.addText('ÁP DỤNG', { x: 7.03, y: 2.55, w: 5, h: 0.3, fontFace: 'Arial', fontSize: 12, bold: true, color: teal, margin: 0 });
      [left, right].forEach((group, col) => group.forEach((bullet, i) => {
        const x = col ? 7.03 : 1.05, y = 3.12 + i * (3.08 / Math.max(1, group.length));
        slide.addShape(pptx.ShapeType.ellipse, { x, y: y + 0.13, w: 0.13, h: 0.13, line: { color: teal }, fill: { color: teal } });
        slide.addText(bullet, { x: x + 0.34, y, w: 4.8, h: Math.min(1.25, 2.84 / Math.max(1, group.length)), fontFace: 'Arial', fontSize: bullet.length > 95 ? 18 : 21, color: navy, margin: 0, valign: 'middle' });
      }));
    }
    slide.addText(`${index + 1} / ${pages.length}`, { x: 11.58, y: 7.08, w: 0.98, h: 0.2, align: 'right', fontFace: 'Arial', fontSize: 10, color: sub, margin: 0 });
    slide.addNotes(item.speakerNotes + (image && item.imageCredit ? '\n' + item.imageCredit : ''));
  });
  return pptx.write({ outputType: 'nodebuffer' }) as Promise<Buffer>;
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json(), input = requestSchema.parse(body.input), result = validateResult(input.kind, body.result, input);
    const variant = body.variant === 'student' ? 'student' : 'teacher';
    if (input.kind === 'slide') {
      const bytes = await slideBytes(slideSchema.parse(result));
      return new NextResponse(new Uint8Array(bytes).buffer as ArrayBuffer, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'Content-Disposition': 'attachment; filename="slides.pptx"' } });
    }
    const blocks = input.kind === 'lesson' ? lessonBlocks(lessonSchema.parse(result), input)
      : input.kind === 'exam' ? examBlocks(examSchema.parse(result), input, variant) : skknBlocks(skknSchema.parse(result), input);
    const bytes = await documentBytes(blocks, input.kind);
    return new NextResponse(new Uint8Array(bytes).buffer as ArrayBuffer, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="${input.kind}-${variant}.docx"` } });
  } catch { return NextResponse.json({ error: 'Không thể xuất file; vui lòng kiểm tra lại nội dung.' }, { status: 400 }); }
}



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
    h('I. Mục tiêu và trọng tâm bài học'), ...paragraphs(d.goals), h('II. Thiết bị dạy học và học liệu'), ...paragraphs(d.materials),
    h('III. Minh chứng đánh giá'), table([['Hoạt động', 'Sản phẩm học sinh'], ...d.activities.map(a => [a.name, a.product])], [28, 72]),
    h('IV. Tiến trình dạy học'),
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
  const teal = '48C0B6', dark = '17334A', pale = 'CBEAF0', cream = 'FFF8EB';
  pages.forEach((item, index) => {
    const slide = pptx.addSlide(), image = item.imageData;
    const style = slideStyle(d.title, item.title, index, Boolean(image));
    slide.background = { color: style === 3 ? cream : 'FFFFFF' };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 1.12, line: { color: teal }, fill: { color: teal } });
    slide.addText(item.title, { x: 0.5, y: 0.24, w: 9.5, h: 0.58, fontFace: 'Arial', fontSize: item.title.length > 48 ? 25 : 31, bold: true, color: 'FFFFFF', margin: 0, breakLine: false });
    slide.addText(d.title.toUpperCase(), { x: 10.1, y: 0.46, w: 2.7, h: 0.25, align: 'right', fontFace: 'Arial', fontSize: 9, bold: true, color: 'FFFFFF', margin: 0 });
    if (style === 0) {
      const rowWidth = image ? 6.3 : 11.8;
      item.bullets.forEach((bullet, i) => {
        const y = 1.48 + i * (4.95 / item.bullets.length);
        slide.addShape(pptx.ShapeType.roundRect, { x: 0.56, y: y + 0.06, w: 0.48, h: 0.48, rectRadius: 0.08, line: { color: teal }, fill: { color: teal } });
        slide.addText(String(i + 1), { x: 0.56, y: y + 0.12, w: 0.48, h: 0.27, align: 'center', fontFace: 'Arial', fontSize: 15, bold: true, color: 'FFFFFF', margin: 0 });
        slide.addText(bullet, { x: 1.24, y, w: rowWidth - 0.7, h: Math.min(0.95, 4.7 / item.bullets.length), fontFace: 'Arial', fontSize: bullet.length > 85 ? 18 : 21, color: dark, margin: 0, valign: 'middle', breakLine: false });
      });
      if (image) {
        slide.addShape(pptx.ShapeType.rect, { x: 7.48, y: 1.45, w: 5.3, h: 5.15, line: { color: 'D6EAEA', width: 1 }, fill: { color: pale } });
        slide.addImage({ data: image, x: 7.48, y: 1.45, w: 5.3, h: 5.15 });
      }
    } else if (style === 1) {
      const rowWidth = image ? 6.45 : 11.9;
      item.bullets.forEach((bullet, i) => {
        const y = 1.39 + i * (5.18 / item.bullets.length);
        slide.addShape(pptx.ShapeType.roundRect, { x: 0.48, y, w: rowWidth, h: Math.min(1.05, 4.88 / item.bullets.length), rectRadius: 0.05, line: { color: i % 2 ? 'B6E2E0' : pale }, fill: { color: i % 2 ? 'F2FAF9' : 'E6F7F5' } });
        slide.addText(bullet, { x: 0.7, y: y + 0.12, w: rowWidth - 0.44, h: Math.min(0.75, 4.4 / item.bullets.length), fontFace: 'Arial', fontSize: bullet.length > 90 ? 17 : 20, color: dark, margin: 0, valign: 'middle' });
      });
      if (image) {
        slide.addShape(pptx.ShapeType.rect, { x: 7.25, y: 1.39, w: 5.55, h: 5.15, line: { color: 'D6EAEA' }, fill: { color: pale } });
        slide.addImage({ data: image, x: 7.25, y: 1.39, w: 5.55, h: 5.15 });
      }
    } else if (style === 2) {
      const cols = 2, rows = Math.ceil(item.bullets.length / cols);
      item.bullets.forEach((bullet, i) => {
        const col = i % cols, row = Math.floor(i / cols), x = 0.55 + col * 6.38, y = 1.55 + row * (4.95 / rows);
        slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.92, h: Math.min(2.08, 4.55 / rows), rectRadius: 0.08, line: { color: 'A7DAD7', width: 1 }, fill: { color: i % 2 ? 'F1FAF9' : 'FFF8EB' } });
        slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.22, y: y + 0.22, w: 0.45, h: 0.45, line: { color: teal }, fill: { color: teal } });
        slide.addText(String(i + 1), { x: x + 0.22, y: y + 0.3, w: 0.45, h: 0.2, align: 'center', fontFace: 'Arial', fontSize: 13, bold: true, color: 'FFFFFF', margin: 0 });
        slide.addText(bullet, { x: x + 0.8, y: y + 0.2, w: 4.85, h: Math.min(1.6, 4.1 / rows), fontFace: 'Arial', fontSize: bullet.length > 85 ? 17 : 20, color: dark, margin: 0, valign: 'middle' });
      });
    } else if (style === 3) {
      [[4.27, 2.55, 0.75, 0.9], [8.32, 3.5, 0.75, -0.95], [4.27, 5.63, 0.75, -1.55], [8.32, 4.05, 0.75, 1.58]].forEach(([x, y, w, h]) =>
        slide.addShape(pptx.ShapeType.line, { x, y, w, h, line: { color: '79BBB6', width: 2 } }));
      slide.addShape(pptx.ShapeType.ellipse, { x: 5.02, y: 3.05, w: 3.3, h: 1.35, line: { color: 'F7941E' }, fill: { color: 'F7941E' } });
      slide.addText(slideBadge(item.title), { x: 5.33, y: 3.45, w: 2.68, h: 0.38, align: 'center', fontFace: 'Arial', fontSize: 20, bold: true, color: 'FFFFFF', margin: 0 });
      const spots = [[0.72, 1.8], [9.07, 1.8], [0.72, 4.88], [9.07, 4.88]];
      const fills = ['FFE599', pale, 'D9EAD3', 'FCE5CD'];
      item.bullets.forEach((bullet, i) => {
        const [x, y] = spots[i];
        slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.55, h: 1.5, rectRadius: 0.12, line: { color: 'D3DDDC' }, fill: { color: fills[i] } });
        slide.addText(bullet, { x: x + 0.18, y: y + 0.16, w: 3.19, h: 1.16, align: 'center', valign: 'middle', fontFace: 'Arial', fontSize: bullet.length > 65 ? 16 : 18, color: dark, margin: 0 });
      });
    } else {
      slide.addText('TỔNG KẾT BÀI HỌC', { x: 0.75, y: 1.42, w: 11.2, h: 0.42, fontFace: 'Arial', fontSize: 15, bold: true, color: '0A8C91', charSpacing: 1.2, margin: 0 });
      item.bullets.forEach((bullet, i) => {
        const y = 2.0 + i * (4.55 / item.bullets.length);
        slide.addShape(pptx.ShapeType.ellipse, { x: 0.8, y, w: 0.52, h: 0.52, line: { color: teal }, fill: { color: teal } });
        slide.addText(String(i + 1), { x: 0.8, y: y + 0.08, w: 0.52, h: 0.29, align: 'center', fontFace: 'Arial', fontSize: 16, bold: true, color: 'FFFFFF', margin: 0 });
        slide.addText(bullet, { x: 1.57, y: y - 0.04, w: 10.7, h: Math.min(0.85, 4.35 / item.bullets.length), fontFace: 'Arial', fontSize: bullet.length > 90 ? 18 : 22, color: dark, valign: 'middle', margin: 0 });
      });
    }
    slide.addText(`${index + 1} / ${pages.length}`, { x: 11.78, y: 7.12, w: 1, h: 0.2, align: 'right', fontFace: 'Arial', fontSize: 10, color: '397077', margin: 0 });
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



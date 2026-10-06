import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'node:url';
import { knowledgeLessonSchema, readKnowledgeLessons, contentHash } from '../lib/server/knowledge-base.ts';

// Run locally using Node 22.18+; one file should contain one lesson, not an entire textbook.
const root = fileURLToPath(new URL('../knowledge-base/', import.meta.url));
const [sourceFile, metadataFile] = process.argv.slice(2);
try {
  if (!sourceFile || !metadataFile) throw new Error('Cách dùng: node scripts/import-knowledge.mjs <bai.txt|bai.docx> <metadata.json>');
  const extension = path.extname(sourceFile).toLowerCase();
  if (!['.txt', '.docx'].includes(extension)) throw new Error('Chỉ nhập TXT/DOCX. PDF cần trích xuất hoặc OCR và rà soát trước.');
  const buffer = await readFile(sourceFile);
  if (buffer.length > 2_000_000) throw new Error('Tài liệu tối đa 2 MB; hãy chia theo từng bài.');
  const text = (extension === '.txt' ? buffer.toString('utf8') : (await mammoth.extractRawText({ buffer })).value).trim();
  const metadata = JSON.parse(await readFile(metadataFile, 'utf8'));
  const lesson = knowledgeLessonSchema.parse({ ...metadata, text, status: 'draft', source: { ...metadata.source, contentHash: contentHash(text) } });
  const existing = await readKnowledgeLessons(root, true);
  const duplicate = existing.find(item => item.id === lesson.id || (item.source.contentHash === lesson.source.contentHash && item.book === lesson.book && item.grade === lesson.grade && item.subject === lesson.subject));
  if (duplicate) throw new Error(`Bài đã có trong kho: ${duplicate.id}. Không tạo thêm hoặc ghi đè.`);
  const destination = path.join(root, 'lessons', `${lesson.id}.json`);
  await writeFile(destination, JSON.stringify(lesson, null, 2) + '\n', { flag: 'wx' });
  console.log(`Đã nhập bản nháp: ${destination}\nĐối chiếu nguồn, sửa tóm tắt rồi chuyển status thành reviewed để app sử dụng.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Không nhập được tài liệu.');
  process.exitCode = 1;
}

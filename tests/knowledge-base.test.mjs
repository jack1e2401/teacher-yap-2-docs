import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readKnowledgeLessons, knowledgeLessonSchema, contentHash } from '../lib/server/knowledge-base.ts';

const lesson = { id: 'test-lesson', book: 'Test', grade: 6, subject: 'Tiếng Anh', title: 'Bài kiểm tra kho',
  text: 'Nội dung thử nghiệm đủ dài để kiểm tra việc lưu và đọc lại bài học.', summary: 'Tóm tắt thử nghiệm của bài học.', status: 'reviewed',
  source: { title: 'Tài liệu thử', url: 'https://example.com/book', edition: '2026', pages: '1–2', contentHash: contentHash('nguồn') } };

test('kho chỉ phục vụ bài đã duyệt, bỏ qua bản nháp', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'teacher-kb-'));
  try {
    await mkdir(path.join(root, 'lessons'));
    await writeFile(path.join(root, 'lessons', 'reviewed.json'), JSON.stringify(lesson));
    await writeFile(path.join(root, 'lessons', 'draft.json'), JSON.stringify({ ...lesson, id: 'draft', status: 'draft' }));
    assert.deepEqual((await readKnowledgeLessons(root)).map(item => item.id), ['test-lesson']);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('tài liệu phải có xuất xứ và văn bản; nội dung đổi khoảng trắng vẫn trùng hash', () => {
  assert.equal(knowledgeLessonSchema.safeParse({ ...lesson, source: undefined }).success, false);
  assert.equal(knowledgeLessonSchema.safeParse({ ...lesson, text: '' }).success, false);
  assert.equal(contentHash('A  B\nC'), contentHash('A B C'));
});
